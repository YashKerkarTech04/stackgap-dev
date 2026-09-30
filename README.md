# StackGap

**Find the skills between what you know and what employers ask for.**

StackGap is a free, single-page web app for job seekers. Pick a target role (for example, Full Stack Developer), enter the skills you already have, and StackGap analyzes real job descriptions to show which additional skills employers want, how often they appear, which companies are hiring for them, how demand is trending, and where to learn them.

No login. No sign-up. Just open the page and analyze.

> **Status:** Planning / early development. This README describes the intended design.

---

## Why StackGap

Most people decide what to learn next from YouTube trends or generic roadmaps. Those reflect opinions. StackGap reflects what job postings actually ask for, and shows the sample size behind every number so you can judge how much to trust it.

**Example:** A candidate knows HTML, CSS, JavaScript, React, Node.js, and MongoDB and wants full stack roles. StackGap might show that TypeScript appears in a large share of full stack postings, that AI/LLM API skills are rising, and which companies are asking for them, then link to courses for each.

---

## Features

- **Skill gap analysis:** skills employers ask for that you don't have yet, ranked by demand percentage
- **Match score:** how much of what the role asks for you already cover
- **Demand bars:** percentage of job postings mentioning each missing skill
- **Trend indicators:** rising or stable, backed by weekly data snapshots
- **Companies hiring:** top companies and job counts for a selected skill
- **Trend chart:** demand for a skill over time
- **Course recommendations:** hand-curated links for each skill
- **Transparent data:** every result shows its sample size, sources, and last refresh date

### Page layout (single page)

1. Header
2. Input section: role, country, skill chips, Analyze button
3. Summary strip: match score, jobs analyzed, skills missing
4. Missing skills with demand bars
5. Trend chart and companies hiring (for the selected skill)
6. Recommended courses
7. Footer: data sources, sample size, last updated date

---

## How it works

StackGap has two separate halves that meet only at the database:

```
 OFFLINE (scheduled)                              ONLINE (what users see)

 Kaggle / Remotive / The Muse / Adzuna
              |
              v
   Python pipeline: clean -> classify role
   -> extract skills -> aggregate
              |
              v
   MongoDB  +  exported static JSON  --->  Express API  --->  React app
```

- The **pipeline** collects job descriptions, cleans them, decides which role each belongs to, extracts skills using a curated dictionary, and computes percentages per role, country, and week.
- The **web app** never touches raw job descriptions. It reads precomputed results, so it stays fast and cheap.
- A **static JSON export** of the results lets a deployed frontend keep working even if the API or a data source becomes unavailable.

### Skill extraction

- A curated dictionary (`data/skills.json`) with aliases (`"reactjs"`, `"react.js"` map to `React`)
- Word-boundary matching so `Java` never matches inside `JavaScript`
- Case-sensitive handling for ambiguous names like `Go` and `R`
- Optional discovery step: a small local model through Ollama runs on a sample of postings to suggest skills missing from the dictionary. Suggestions are reviewed by hand before being added.

### Role classification

Keyword rules on the job title, defined in `data/roles.json` (include and exclude lists).

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, Recharts, lucide-react, TanStack Query |
| Backend | Node.js, Express, Mongoose, Zod, helmet, cors, express-rate-limit, dotenv |
| Database | MongoDB (MongoDB Atlas) |
| Data pipeline | Python, pandas, requests, BeautifulSoup, rapidfuzz, pymongo |
| Skill discovery (optional) | Ollama with a small open-source model (Qwen or Llama family) |
| Automation | GitHub Actions (scheduled weekly run) |
| Testing | Vitest, Supertest, pytest |
| Tooling | Git, ESLint, Prettier, Ruff, Postman |
| Hosting (free tiers) | Vercel or Netlify (frontend), Render or Railway (API), MongoDB Atlas (database) |

Free-tier limits and terms change. Check each provider's current policy before depending on it.

---

## Data sources

| Source | Access | API key | Used for |
|---|---|---|---|
| Kaggle dataset | Manual CSV download | Kaggle account | Building and testing the pipeline, seed data |
| Remotive | Public API | No | Main live source, full descriptions |
| The Muse | Public API | No | Second live source, full descriptions (mostly US) |
| Adzuna | Free API tier | Yes (app ID and key) | India job counts, companies, locations (descriptions are truncated) |

Notes:

- Read each provider's terms, rate limits, and attribution requirements before use, and check the license of any Kaggle dataset.
- StackGap does **not** scrape LinkedIn, Indeed, or Naukri.
- Adzuna descriptions are truncated, so it contributes less to skill extraction than the other sources.
- Free data is thinner for India than for global and remote roles. The UI always shows sample size so users can judge reliability.

---

## Data model

### `jobs`

One document per posting. Raw text is kept so extraction can be re-run later.

```json
{
  "source": "remotive",
  "source_id": "48213",
  "url": "https://...",
  "title": "Full Stack Developer",
  "company": "Company A",
  "location": { "city": "Mumbai", "country": "IN" },
  "posted_at": "2026-09-20",
  "fetched_at": "2026-09-27",
  "description_raw": "...",
  "description_hash": "a1b2c3...",
  "role": "fullstack",
  "skills": ["react", "node", "typescript"],
  "extraction_version": 3
}
```

Indexes: unique on `(source, source_id)`; `description_hash` for cross-source duplicates; `(role, location.country, posted_at)` for aggregation.

### `skill_stats`

Precomputed results, one document per skill, role, country, and week. This is what the API reads.

```json
{
  "role": "fullstack",
  "country": "IN",
  "period": "2026-W39",
  "skill_id": "typescript",
  "count": 770,
  "sample_size": 1240,
  "pct": 62.1,
  "top_companies": [{ "name": "Company A", "jobs": 24 }]
}
```

### `courses`

Hand-curated learning resources.

```json
{
  "skill_id": "typescript",
  "title": "TypeScript for React developers",
  "platform": "YouTube",
  "url": "https://...",
  "duration_hours": 8,
  "free": true,
  "level": "beginner"
}
```

---

## API (planned)

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/roles` | Available roles and countries for the dropdowns |
| POST | `/api/analyze` | Body: `{ role, country, skills }`. Returns missing skills with percentages, companies, and trend data |
| GET | `/api/courses/:skillId` | Courses for a skill |

`/analyze` reads only from `skill_stats`. It never queries raw job postings.

---

## Project structure

```
stackgap/
  data/
    skills.json
    roles.json
    courses.json
    skills_candidates.json
  pipeline/
    sources/
      fetch_kaggle.py
      fetch_remotive.py
      fetch_muse.py
      fetch_adzuna.py
    clean.py
    classify_role.py
    extract_skills.py
    discover_skills.py
    aggregate.py
    run_all.py
  server/
    src/
  client/
    src/
  .github/
    workflows/
  README.md
```

The `data/` folder is shared, so the pipeline and the API read the same dictionary and course files.

---

## Getting started

Setup steps will be added as the project is built. The intended flow:

```bash
# 1. Clone
git clone https://github.com/<your-username>/stackgap.git
cd stackgap

# 2. Pipeline (Python)
cd pipeline
pip install -r requirements.txt
cp .env.example .env        # add MongoDB URI and Adzuna keys
python run_all.py

# 3. API (Node)
cd ../server
npm install
npm run dev

# 4. Frontend (React + Vite)
cd ../client
npm install
npm run dev
```

Secrets (MongoDB URI, Adzuna keys) live in `.env` locally and in GitHub Actions secrets for scheduled runs. Never commit them.

---

## Roadmap

**MVP**
- [ ] Create `skills.json`, `roles.json`, and `courses.json` (about 100 skills and 30 courses to start)
- [ ] Build the pipeline end to end on a Kaggle dataset
- [ ] Add Remotive, The Muse, and Adzuna fetchers
- [ ] Build the single-page React UI with static JSON
- [ ] Build the Express API and connect MongoDB
- [ ] Deploy with a static-data fallback

---

---

## Contributing

Contributions are welcome once the MVP is in place. Good first contributions: adding skills and aliases to `skills.json`, adding or fixing course links, and improving role keywords.

## License

To be decided (MIT is a common choice for portfolio projects).
