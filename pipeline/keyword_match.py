import pandas as pd
df = pd.read_csv('data_clean/jobs_clean.csv')
print(df[df['title'].str.contains('full stack|full-stack|fullstack', case=False, na=False)]['title'].value_counts().head(20))