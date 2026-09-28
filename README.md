# StackGap.dev 🚀

**StackGap.dev** is a frictionless, full-stack market analytics platform designed for software engineering graduates to bridge the gap between their current skillset and real-world Job Descriptions (JDs). 

By analyzing local and global job requirements, the platform provides freshers with an immediate, data-driven **Market Readiness Score**, isolates high-priority missing technical skills, and maps out actionable learning pathways—**all with zero authentication friction for visiting recruiters.**

---

## 🌟 Key Features

*   **Zero-Friction Access:** No registration or login required. Recruiters can test the entire operational flow instantly.
*   **Dynamic Market Readiness Engine:** Generates a real-time capability score based on target engineering roles (e.g., Full-Stack, Frontend, Data Science).
*   **Granular Skills Gap Analytics:** Displays missing technologies using precise, interactive percentage bars derived from JD dataset scanning.
*   **Interactive Path Optimizer:** Features a responsive toggle matrix allowing users to dynamically inject recommended developer courses into their custom study dashboard.
*   **Hiring Radar Intelligence:** Maps analyzed skill shortages directly back to actual companies and local tech hubs (e.g., Mumbai/Virar business ecosystems).

---

## 🛠️ Architecture & Tech Stack

StackGap.dev is engineered as a decoupled, asynchronous Single Page Application (SPA) designed to showcase clean data pipeline handling across the JavaScript and Python ecosystems.

*   **Frontend:** React.js, Tailwind CSS, Recharts (for dynamic data visualization)
*   **Backend:** Node.js, Express.js (REST API architecture & custom middleware pipelines)
*   **Data & AI Layer:** Python, NLTK/String-distance arrays (for tokenizing and cross-referencing JD data points)
*   **Database:** MongoDB (Flexible document schema for structured job market entries)
*   **Deployment:** Vercel (Frontend SPA), Render/Railway (Backend Services)

---

## 📋 Technical Project Structure

```text
stackgap-dev/
├── frontend/             # React SPA Interface
│   ├── src/
│   │   ├── components/   # UI Modules (Hero, Dashboard, ChartCard, PillInput)
│   │   └── context/      # Global state handlers for dashboard calculations
├── backend/              # Node.js + Express API
│   ├── controllers/      # Route logic & payload formatting
│   ├── middleware/       # Input sanitization & request logging pipelines
│   └── routes/           # REST endpoints (/api/analyze-skills)
└── data-engine/          # Python Processing Layer
    ├── datasets/         # Normalized JSON job descriptions (Mumbai/Global)
    └── processor.py      # Skill matching array algorithms
```

---

## 🚀 Live Demo & Documentation

*   **Live Deployed Application:** `https://vercel.app` 

---

## 💡 Interview Talking Points Covered

Building StackGap.dev directly addresses the core engineering competencies checked by hiring panels:
1.  **State Management:** Demonstrates deep React state workflows where horizontal progress arrays and dynamic course injects update reactively via native JS array manipulation (`.map()`, `.filter()`).
2.  **Custom Middleware:** Features bespoke Express middleware handling clean input sanitization before data is queried against the MongoDB layer.
3.  **Systems & Data Engineering:** Showcases cross-environment data pipeline execution, fetching UI configurations from an Express layer driven by data science logic.
