require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");

const { loadData } = require("./data/loadData");
const rolesRouter = require("./routes/roles");
const skillsRouter = require("./routes/skills");
const analyzeRouter = require("./routes/analyze");
const coursesRouter = require("./routes/courses");

const app = express();
const PORT = process.env.PORT || 4000;

// Load all shared JSON data into memory once at startup.
loadData();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Basic rate limiting, since /analyze does a bit of computation per
// request and this API has no auth to otherwise throttle abuse.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/roles", rolesRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/analyze", analyzeRouter);
app.use("/api/courses", coursesRouter);

// Fallback 404 for unknown API routes.
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`StackGap API running on http://localhost:${PORT}`);
});