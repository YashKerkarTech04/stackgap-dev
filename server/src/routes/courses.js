/**
 * GET /api/courses/:skillId
 *
 * Returns the curated courses for one skill, used when the user clicks a
 * missing skill in the UI to see how to learn it.
 */

const express = require("express");
const { getData } = require("../data/loadData");

const router = express.Router();

router.get("/:skillId", (req, res) => {
  const { skillId } = req.params;
  const { coursesBySkill, skillsById } = getData();

  if (!skillsById[skillId]) {
    return res.status(404).json({ error: `Unknown skill id: ${skillId}` });
  }

  const courses = coursesBySkill[skillId] || [];
  res.json({ skill_id: skillId, courses });
});

module.exports = router;