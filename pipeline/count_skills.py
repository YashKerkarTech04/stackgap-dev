import json
import pandas as pd
from collections import Counter

# Load data
df = pd.read_csv('data_clean/jobs_with_skills.csv')
counter = Counter()

# Count skills
for s in df['skills']:
    counter.update(json.loads(s))

# Print top 30
for skill_id, count in counter.most_common(30):
    print(f'{skill_id} : {count}')
