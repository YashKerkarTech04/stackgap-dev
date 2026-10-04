/**
 * GET /api/roles
 *
 * Returns the available roles, for the frontend's role dropdown.
 * Also returns which countries have data, currently just a placeholder
 * since our one data source so far (Kaggle LinkedIn postings) is US-only.
 */
 
const express = require("express");
const {getData} = require("../data/loadData");

const router = express.Router();

router.get("/", (req, res) => {
  const {roles, skillStats } = getData();
   // Compute the sample_size for each role, so the dropdown can show it
  // (e.g. "Frontend Developer (197 jobs analyzed)").

  const sampleSizeByRole = {};
  for (const entry of skillStats) {
    sampleSizeByRole[entry.role] = entry.sample_size;
  }

  const rolesWithStats = roles.map((role) => ({
    id: role.id,
    name: role.name,
    sample_size: sampleSizeByRole[role.id] || 0,
  }));

  res.json({
    roles: rolesWithStats,
    countries: [{id: "US", name: "United States"}],
  });
});

module.exports = router;