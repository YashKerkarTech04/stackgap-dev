/**
 * GET /api/skills
 *
 * Returns all known skills (id, name, category), used by the frontend's
 * skill-chip input for autocomplete when the user types what they know.
 */

const express = require("express");
const {getData} = require("../data/loadData");

const router = express.Router();

router.get("/", (req, res) => {
  const {skills} = getData();

  const simplified = skills.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
  }));

  res.json({ skills: simplified });
});

module.exports = router;