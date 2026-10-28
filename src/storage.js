
const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const dataDir = process.env.DATA_DIR ||
  path.join(__dirname, "..", "data");

fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(
  process.env.DB_PATH ||
  path.join(dataDir, "internships.sqlite")
);

db.pragma("journal_mode = WAL");

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS internships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      domain TEXT NOT NULL,
      location TEXT NOT NULL,
      work_mode TEXT NOT NULL
        CHECK(work_mode IN ('Remote','Hybrid','On-site')),
      description TEXT NOT NULL,
      apply_url TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      internship_id TEXT NOT NULL,
      applicant_name TEXT NOT NULL,
      email TEXT NOT NULL,
      skills TEXT NOT NULL,
      cover_letter TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const count = db.prepare(
    "SELECT COUNT(*) AS n FROM internships"
  ).get().n;

  if (count === 0) {
    const add = db.prepare(`
      INSERT INTO internships
      (title, company, domain, location, work_mode,
       description, apply_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const rows = [
      [
        "Frontend Developer Intern", "BrightPixel Labs",
        "Web Development", "Remote", "Remote",
        "Build responsive UI components and collaborate with a product team.",
        "https://example.com/apply/frontend"
      ],
      [
        "Python Development Intern", "CodeHarbor",
        "Software Development", "Kochi, Kerala", "Hybrid",
        "Help build and test Python services, scripts, and internal tools.",
        "https://example.com/apply/python"
      ],
      [
        "Data Analytics Intern", "InsightSpring",
        "Data Analytics", "Bengaluru, Karnataka", "On-site",
        "Clean datasets, prepare reports, and support dashboard development.",
        "https://example.com/apply/analytics"
      ],
      [
        "Machine Learning Intern", "Northstar AI",
        "AI/ML", "Remote", "Remote",
        "Assist with data preparation and model evaluation.",
        "https://example.com/apply/ml"
      ],
      [
        "Backend API Intern", "CloudBridge",
        "Backend Development", "Chennai, Tamil Nadu", "Hybrid",
        "Create API endpoints, write tests, and document services.",
        "https://example.com/apply/backend"
      ]
    ];

    db.transaction(() => {
      rows.forEach(row => add.run(...row));
    })();
  }
}

module.exports = { db, initializeDatabase };
