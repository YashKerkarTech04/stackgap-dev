"""
aggregate.py

Step 5 (final step) of the StackGap pipeline.

Reads pipeline/data_clean/jobs_final.csv (which has role + skills per job)
and data/skills.json, and computes, for each role:
  - how many jobs mention each skill (count)
  - what percentage of that role's jobs mention it (pct)
  - the total number of classified jobs for that role (sample_size)
  - the top companies hiring for each skill, within that role

Writes the result to data/skill_stats.json, which is the file the backend
API (and the static-JSON frontend fallback) will read directly. This is
the one pipeline output we DO commit to git, since it's small and it's
the actual product of all the earlier steps.

Run from inside stackgap/pipeline/ with the venv activated:
    python aggregate.py
"""

import json
from collections import Counter, defaultdict
from datetime import date

import pandas as pd

SKILLS_PATH = "../data/skills.json"
INPUT_PATH = "data_clean/jobs_final.csv"
OUTPUT_PATH = "../data/skill_stats.json"

# No weekly history yet (that comes once the pipeline has run a few times
# on a schedule), so every row in this first run is tagged with today's
# date as a single period label.
PERIOD = date.today().isoformat()

# Below this many classified jobs, we don't trust the percentage enough to
# call it meaningful. Still computed and stored, but the API/UI should
# treat low sample_size roles with a visible caveat.
MIN_SAMPLE_SIZE_WARNING = 100

TOP_N_COMPANIES = 5


def load_skills(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def parse_skills_cell(cell):
    try:
        return json.loads(cell)
    except (TypeError, json.JSONDecodeError):
        return []


def main():
    print("Loading skills dictionary...")
    skills = load_skills(SKILLS_PATH)
    skill_ids = [s["id"] for s in skills]

    print(f"Loading {INPUT_PATH} ...")
    df = pd.read_csv(INPUT_PATH)
    df = df[df["role"].notna()].copy()
    df["skills_list"] = df["skills"].apply(parse_skills_cell)
    print(f"{len(df)} classified jobs loaded across {df['role'].nunique()} roles.")

    results = []

    for role_id, role_df in df.groupby("role"):
        sample_size = len(role_df)
        print(f"\nRole: {role_id} (sample_size={sample_size})")

        if sample_size < MIN_SAMPLE_SIZE_WARNING:
            print(f"  WARNING: sample size below {MIN_SAMPLE_SIZE_WARNING}, "
                  f"percentages for this role are less reliable.")

        # Count how many jobs in this role mention each skill.
        skill_counter = Counter()
        # For each skill, track which companies posted jobs mentioning it.
        skill_companies = defaultdict(Counter)

        for _, row in role_df.iterrows():
            company = row.get("company", "Unknown")
            for skill_id in row["skills_list"]:
                skill_counter[skill_id] += 1
                skill_companies[skill_id][company] += 1

        for skill_id in skill_ids:
            count = skill_counter.get(skill_id, 0)
            if count == 0:
                continue  # skip skills that never appeared for this role

            pct = round((count / sample_size) * 100, 1)
            top_companies = [
                {"name": name, "jobs": jobs}
                for name, jobs in skill_companies[skill_id].most_common(TOP_N_COMPANIES)
                if name != "Unknown"
            ]

            results.append({
                "role": role_id,
                "period": PERIOD,
                "skill_id": skill_id,
                "count": count,
                "sample_size": sample_size,
                "pct": pct,
                "top_companies": top_companies,
            })

        # Print top 5 skills for this role as a quick sanity check.
        print("  Top 5 skills:")
        for skill_id, count in skill_counter.most_common(5):
            pct = round((count / sample_size) * 100, 1)
            print(f"    {skill_id}: {count} ({pct}%)")

    results.sort(key=lambda r: (r["role"], -r["pct"]))

    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"\nSaved {len(results)} role-skill stat entries to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()