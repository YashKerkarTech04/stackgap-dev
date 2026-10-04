/**
 * POST /api/analyze
 *
 * Body: { role: string, skills: string[] }
 *   - role: a role id from GET /api/roles (e.g. "fullstack")
 *   - skills: array of skill ids the candidate already knows
 *     (e.g. ["html", "css", "javascript", "react", "nodejs", "mongodb"])
 *
 * Returns the skill gap: skills in demand for this role that the
 * candidate does NOT already have, sorted by demand percentage, plus a
 * match score and summary numbers for the UI's summary strip.
 *
 * This reads only from the precomputed data/skill_stats.json produced by
 * the pipeline's aggregate.py. It never touches raw job descriptions,
 * which is what keeps this endpoint fast.
 */

const express = require("express");
const { z } = require("zod");
const { getData } = require("../data/loadData");

const router = express.Router();

const analyzeSchema = z.object({
  role: z.string().min(1),
  skills: z.array(z.string()).default([]),
});

// How many of a role's top skills count toward the match score.
// Using a fixed top-N (rather than all skills ever matched) keeps the
// score meaningful: knowing 1 rare skill shouldn't inflate your score
// the same way knowing a top-demand skill should.
const MATCH_SCORE_TOP_N = 15;

router.post("/", (req, res) => {
  const parsed = analyzeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
  }

  const { role, skills: knownSkillIds } = parsed.data;
  const { skillStats, skillsById, roles } = getData();

  const roleExists = roles.some((r) => r.id === role);
  if (!roleExists) {
    return res.status(404).json({ error: `Unknown role: ${role}` });
  }

  const knownSet = new Set(knownSkillIds);

  // All stat entries for this role, already sorted by pct desc from the
  // pipeline, but we sort again here defensively in case that changes.
  const roleStats = skillStats
    .filter((entry) => entry.role === role)
    .sort((a, b) => b.pct - a.pct);

  if (roleStats.length === 0) {
    return res.status(404).json({ error: `No data available yet for role: ${role}` });
  }

  const sampleSize = roleStats[0].sample_size;

  // Match score: of the role's top N most in-demand skills, what
  // fraction does the candidate already know?
  const topSkillsForScore = roleStats.slice(0, MATCH_SCORE_TOP_N);
  const knownAmongTop = topSkillsForScore.filter((entry) =>
    knownSet.has(entry.skill_id)
  ).length;
  const matchScore = topSkillsForScore.length
    ? Math.round((knownAmongTop / topSkillsForScore.length) * 100)
    : 0;

  // Missing skills: everything in roleStats the candidate doesn't
  // already know, still sorted by demand percentage.
  const missingSkills = roleStats
    .filter((entry) => !knownSet.has(entry.skill_id))
    .map((entry) => ({
      skill_id: entry.skill_id,
      name: skillsById[entry.skill_id]?.name || entry.skill_id,
      pct: entry.pct,
      count: entry.count,
      // No weekly history yet (the pipeline has only run once), so trend
      // is not computable. Once skill_stats.json has multiple periods
      // per skill, this becomes "rising" / "stable" / "falling" by
      // comparing the latest period to a prior one.
      trend: null,
      top_companies: entry.top_companies,
    }));

  res.json({
    role,
    sample_size: sampleSize,
    match_score: matchScore,
    skills_missing_count: missingSkills.length,
    missing_skills: missingSkills,
  });
});

module.exports = router;