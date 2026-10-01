"""
clean.py

Step 2 of the StackGap pipeline.

Reads the raw Kaggle LinkedIn postings CSV, keeps only the columns we need,
strips any leftover HTML from descriptions, drops rows missing critical
fields, removes duplicate postings, and writes a cleaned CSV that the rest
of the pipeline (classify_role.py, extract_skills.py) will read from.

Run from inside stackgap/pipeline/ with the venv activated:
    python clean.py
"""

import hashlib
import re
import warnings

import pandas as pd
from bs4 import BeautifulSoup, MarkupResemblesLocatorWarning

warnings.filterwarnings("ignore", category=MarkupResemblesLocatorWarning)

RAW_PATH = "data_raw/postings.csv"
CLEAN_PATH = "data_clean/jobs_clean.csv"

# Columns we actually need from the raw dataset.
# (job_id becomes our source_id; everything else maps directly into our schema)
COLUMNS_TO_KEEP = [
    "job_id",
    "title",
    "company_name",
    "location",
    "description",
    "listed_time",
]


def strip_html(text):
    """Remove any HTML tags and collapse extra whitespace."""
    if not isinstance(text, str):
        return ""
    text = BeautifulSoup(text, "html.parser").get_text(separator=" ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def hash_description(text):
    """Create a stable hash of the cleaned description, used to catch
    duplicate postings (same job reposted, or posted on multiple boards)."""
    return hashlib.sha256(text.encode("utf-8")).hexdigest()


def load_raw(path):
    print(f"Loading raw dataset from {path} ...")
    df = pd.read_csv(path, usecols=COLUMNS_TO_KEEP, low_memory=False)
    print(f"Loaded {len(df)} rows.")
    return df


def clean(df):
    # Drop rows missing the fields we can't work without.
    before = len(df)
    df = df.dropna(subset=["title", "description"])
    print(f"Dropped {before - len(df)} rows missing title or description.")

    # Fill missing company/location with a placeholder rather than dropping,
    # since a missing company name doesn't make the job description useless.
    df["company_name"] = df["company_name"].fillna("Unknown")
    df["location"] = df["location"].fillna("Unknown")

    # Clean text fields.
    print("Stripping HTML and normalizing whitespace from descriptions...")
    df["description"] = df["description"].apply(strip_html)
    df["title"] = df["title"].apply(strip_html)

    # Drop rows where description became empty or is too short to be useful.
    before = len(df)
    df = df[df["description"].str.len() > 50]
    print(f"Dropped {before - len(df)} rows with empty or too-short descriptions.")

    # Hash descriptions to catch duplicate postings.
    df["description_hash"] = df["description"].apply(hash_description)
    before = len(df)
    df = df.drop_duplicates(subset=["description_hash"])
    print(f"Dropped {before - len(df)} duplicate postings (same description text).")

    # Rename columns to match our shared jobs schema.
    df = df.rename(
        columns={
            "job_id": "source_id",
            "company_name": "company",
            "listed_time": "posted_at",
        }
    )
    df["source"] = "kaggle_linkedin"

    return df


def main():
    import os

    os.makedirs("data_clean", exist_ok=True)

    df = load_raw(RAW_PATH)
    df = clean(df)

    df.to_csv(CLEAN_PATH, index=False)
    print(f"\nSaved {len(df)} cleaned rows to {CLEAN_PATH}")
    print("\nSample row:")
    print(df.iloc[0][["source_id", "title", "company", "location"]])
    print("\nDescription preview:")
    print(df.iloc[0]["description"][:300])


if __name__ == "__main__":
    main()