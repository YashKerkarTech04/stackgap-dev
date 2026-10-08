# StackGap

**Find out which skills you're missing for the job you want.**

Pick a role, add the skills you already know, and StackGap shows you what else employers are asking for, how often, which companies are hiring for it, and where to learn it.

**Live demo:** https://stackgap-dev-murex.vercel.app/

No login or sign-up needed.

---

## What it does

1. You choose a role (Full Stack, Frontend, Backend, or Data Analyst).
2. You add the skills you already know.
3. StackGap shows the skills you're missing, ranked by how many job postings ask for them.
4. Click any skill to see the companies hiring for it and free courses to learn it.

You also get a match score that shows how much of what employers want you already have.

---

## Where the numbers come from

The numbers come from real job postings, not guesses.

- I started with a public dataset of about 124,000 LinkedIn job postings.
- After removing duplicates and empty listings, about 107,000 were left.
- Each posting was sorted into a role using its job title. About 1,600 matched one of the four roles.
- Each posting was then scanned for 68 skills, and I counted how often each skill appears per role.

Every result shows how many postings it is based on, so you can see how much to trust it.

---

## Built with

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Data processing:** Python, pandas
- **Hosting:** Vercel (website), Render (API)

---

## Run it on your computer

```bash
git clone https://github.com/YashKerkarTech04/stackgap-dev.git
cd stackgap-dev
```

Start the API:

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

Start the website (in a second terminal):

```bash
cd client
npm install
npm run dev
```

The processed data is already included in the `data` folder, so you don't need to run anything else.

---

## Limitations

- The data is from one US-based dataset, so results reflect the US job market.
- Some roles have a small number of postings (Backend has about 170), so those percentages are less precise.
- The data is a one-time snapshot, so there are no trends over time yet.
- Courses are hand-picked and don't cover every skill yet.

---

## Future enhancements

- Add more job sources, including India
- Refresh the data automatically every week
- Show which skills are rising in demand
- Add more roles and more courses
