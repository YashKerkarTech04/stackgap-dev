"""
extract_skills.py

Step 3 of the StackGap pipeline.

Reads data/skills.json and pipeline/data_clean/jobs_clean.csv, scans each
job description for skill mentions (name + aliases), and writes out a new
CSV with a `skills` column containing the matched skill ids.

Matching rules:
  - Word-boundary matching, so "Java" never matches inside "JavaScript".
  - Case-insensitive by default; skills flagged "case_sensitive": true in
    skills.json (e.g. "Go", "R", "Java") only match on exact case.
  - A skill matches if its name OR any of its aliases appears in the text.

Usage:
    python extract_skills.py --sample 500      # test on first 500 rows
    python extract_skills.py                   # run on the full dataset

Run from inside stackgap/pipeline/ with the venv activated.
"""

import argparse
import json
import re

import pandas as pd

SKILLS_PATH = "../data/skills.json"
INPUT_PATH = "data_clean/jobs_clean.csv"
OUTPUT_PATH = "data_clean/jobs_with_skills.csv"

EXTRACTION_VERSION = 1


def load_skills(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def build_skill_patterns(skills):
    """
    For each skill, build one compiled regex matching its name or any alias,
    with word-boundary-style lookarounds so punctuation inside an alias
    (like "node.js") doesn't break matching, and so "Java" doesn't match
    inside "JavaScript".
    """
    patterns = []
    for skill in skills:
        terms = [skill["name"]] + skill.get("aliases", [])
        # Longer terms first, so "node.js" is tried before a bare "node"
        # would ever be relevant (not strictly needed for presence checks,
        # but keeps behavior predictable).
        terms = sorted(set(terms), key=len, reverse=True)
        escaped = [re.escape(t) for t in terms]
        combined = "(?:" + "|".join(escaped) + ")"
        pattern_str = r"(?<!\w)" + combined + r"(?!\w)"

        flags = 0 if skill.get("case_sensitive") else re.IGNORECASE
        compiled = re.compile(pattern_str, flags)
        patterns.append((skill["id"], compiled))
    return patterns


# Known short/ambiguous skill ids that need a stricter boundary than plain
# word-boundary matching, because common phrases in job postings collide
# with them (e.g. "R&D" vs the "R" language). Add to this as new false
# positives are discovered.
STRICT_BOUNDARY_OVERRIDES = {
    "r_language": (r"(?<![\w&])(?:R)(?![\w&])", re.UNICODE),
    # Bare "Go" is far too common an English word (capitalized at sentence
    # starts, "Go-getter", "on the go", etc.) to match safely even with
    # case-sensitivity. We only match the unambiguous "golang" alias,
    # case-insensitively, trading recall for precision.
    "go": (r"(?<!\w)(?:golang|go lang)(?!\w)", re.IGNORECASE),
}


def apply_strict_overrides(patterns, skills):
    """Replace the default pattern for specific skills with a stricter one,
    defined in STRICT_BOUNDARY_OVERRIDES. Each override specifies its own
    regex flags directly, rather than inheriting the skill's case_sensitive
    setting, since the override's whole purpose is custom matching logic."""
    overridden = []
    
#     overridden = [
#     ("r_language", strict R regex),
#     ("go", strict Go regex)
# ]
    
    for skill in skills:
        skill_id = skill["id"]
        if skill_id in STRICT_BOUNDARY_OVERRIDES:
            # pattern-str = regex pattern and flags = regex flag
            pattern_str, flags = STRICT_BOUNDARY_OVERRIDES[skill_id]
            new_pattern = re.compile(pattern_str, flags) # here we are getting special compiled regex
            overridden.append((skill_id, new_pattern)) # Ex: r_language, R's strict compiled regex, are here in each variable
        else:
            match = next(p for p in patterns if p[0] == skill_id)
            overridden.append(match)
    return overridden

# text means JD, compiled regex of skills
def extract_skills_from_text(text, patterns):
    matched = []
    for skill_id, pattern in patterns:
        if pattern.search(text):
            matched.append(skill_id)
    return matched


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--sample",
        type=int,
        default=None,
        help="Only process the first N rows, for quick testing.",
    )
    args = parser.parse_args()

    print("Loading skills dictionary...")
    skills = load_skills(SKILLS_PATH)
    print(f"Loaded {len(skills)} skills.")

    patterns = build_skill_patterns(skills)
    patterns = apply_strict_overrides(patterns, skills)

    print(f"Loading cleaned jobs from {INPUT_PATH} ...")
    df = pd.read_csv(INPUT_PATH)

    if args.sample:
        df = df.head(args.sample)
        print(f"Running on a sample of {len(df)} rows.")
    else:
        print(f"Running on the full dataset: {len(df)} rows.")

    print("Extracting skills from each description (this may take a while)...")
    skill_lists = []
    for i, desc in enumerate(df["description"].astype(str)):
        skill_lists.append(extract_skills_from_text(desc, patterns))
        if (i + 1) % 5000 == 0:
            print(f"  processed {i + 1}/{len(df)} rows...")

    df["skills"] = [json.dumps(s) for s in skill_lists]
    df["extraction_version"] = EXTRACTION_VERSION

    # Quick stats so we can sanity-check before moving on.
    num_matched = sum(1 for s in skill_lists if len(s) > 0)
    avg_skills = sum(len(s) for s in skill_lists) / len(skill_lists) if skill_lists else 0
    print(f"\n{num_matched}/{len(df)} rows had at least one skill matched.")
    print(f"Average skills matched per job: {avg_skills:.2f}")

    # Show the top 10 most frequently matched skills, as a sanity check.
    from collections import Counter

    counter = Counter(s for skills_found in skill_lists for s in skills_found)
    print("\nTop 10 matched skills in this run:")
    for skill_id, count in counter.most_common(10):
        print(f"  {skill_id}: {count}")

    out_path = OUTPUT_PATH if not args.sample else f"data_clean/jobs_with_skills_sample.csv"
    df.to_csv(out_path, index=False)
    print(f"\nSaved to {out_path}")


if __name__ == "__main__":
    main()