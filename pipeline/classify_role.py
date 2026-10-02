"""
classify_role.py

Step 4 of the StackGap pipeline.

Reads data/roles.json and pipeline/data_clean/jobs_with_skills.csv, and
assigns each job a `role` (or none) based on its title, using the
title_keywords / exclude_keywords defined per role.

A job is assigned to a role if:
  - its title contains at least one of that role's title_keywords, AND
  - its title does not contain any of that role's exclude_keywords

Roles are checked in the order they appear in roles.json. If a title
matches more than one role, the first match wins (roles.json currently
orders them so "fullstack" is checked before the narrower "frontend" and
"backend", since a full stack title could otherwise also contain words
like "developer" that overlap loosely).

Jobs that don't match any role get role = None and are excluded from the
aggregation step, since we have no reliable way to know what role they are.

Run from inside stackgap/pipeline/ with the venv activated:
    python classify_role.py
"""

import json

import pandas as pd

ROLES_PATH = "../data/roles.json"
INPUT_PATH = "data_clean/jobs_with_skills.csv"
OUTPUT_PATH = "data_clean/jobs_final.csv"


def load_roles(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def classify_title(title, roles):
    """Return the first matching role id for this title, or None."""
    if not isinstance(title, str):
        return None
    title_lower = title.lower()

    for role in roles:
        has_keyword = any(kw in title_lower for kw in role["title_keywords"])
        has_excluded = any(kw in title_lower for kw in role["exclude_keywords"])
        if has_keyword and not has_excluded:
            return role["id"]

    return None


def main():
    print("Loading roles config...")
    roles = load_roles(ROLES_PATH)
    print(f"Loaded {len(roles)} roles: {[r['id'] for r in roles]}")

    print(f"Loading {INPUT_PATH} ...")
    df = pd.read_csv(INPUT_PATH)
    print(f"Loaded {len(df)} rows.")

    print("Classifying titles into roles...")
    df["role"] = df["title"].apply(lambda t: classify_title(t, roles))

    print("\nJob counts per role:")
    print(df["role"].value_counts(dropna=False))

    classified = df[df["role"].notna()]
    print(f"\n{len(classified)}/{len(df)} jobs matched a role "
          f"({len(df) - len(classified)} unmatched, will be excluded from aggregation).")

    df.to_csv(OUTPUT_PATH, index=False)
    print(f"\nSaved to {OUTPUT_PATH}")

    # Show a handful of example titles per role, as a sanity check.
    print("\nSample titles per role (first 5 each):")
    for role in roles:
        role_id = role["id"]
        samples = df[df["role"] == role_id]["title"].head(5).tolist()
        print(f"\n  {role_id}:")
        for s in samples:
            print(f"    - {s}")


if __name__ == "__main__":
    main()