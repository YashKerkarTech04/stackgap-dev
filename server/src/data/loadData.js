/**
 * loadData.js
 *
 * Reads the shared data files (skills.json, roles.json, skill_stats.json,
 * courses.json) from the project's top-level `data/` folder into memory.
 *
 * This is intentionally simple for the MVP: no database, just JSON files
 * read once at server startup. The pipeline writes to these same files,
 * so refreshing data just means re-running the pipeline and restarting
 * the server (or calling reloadData(), exposed below, if you wire up a
 * manual refresh endpoint later).
 */

const fs = require("fs");
const path = require("path");

// stackgap/data/ sits three levels up from this file:
// server/src/data/loadData.js -> server/src -> server -> stackgap -> data
const DATA_DIR = path.join(__dirname, "..", "..", "..", "data");

let cache = null;

function readJSON(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function loadData() {
  const skills = readJSON("skills.json");
  const roles = readJSON("roles.json");
  const skillStats = readJSON("skill_stats.json");
  const courses = readJSON("courses.json");

  // Index skills by id for fast lookup (e.g. getting a skill's display name).
  const skillsById = {};
  for (const skill of skills) {
    skillsById[skill.id] = skill;
  }

  // Index courses by skill_id, since /courses/:skillId needs this often.
  const coursesBySkill = {};
  for (const course of courses) {
    if (!coursesBySkill[course.skill_id]) {
      coursesBySkill[course.skill_id] = [];
    }
    coursesBySkill[course.skill_id].push(course);
  }

  cache = {
    skills,
    roles,
    skillStats,
    courses,
    skillsById,
    coursesBySkill,
  };

  console.log(
    `Data loaded: ${skills.length} skills, ${roles.length} roles, ` +
      `${skillStats.length} skill_stats entries, ${courses.length} courses.`
  );

  return cache;
}

function getData() {
  if (!cache) {
    loadData();
  }
  return cache;
}

module.exports = { loadData, getData };