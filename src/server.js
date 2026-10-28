
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("node:path");
const fs = require("node:fs");
const { rateLimit } = require("express-rate-limit");
const { db, initializeDatabase } = require("./storage");

initializeDatabase();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false
});

const applicationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { message: "Too many applications. Try again later." }
  }
});

app.use("/api", apiLimiter);

const fields = [
  "title", "company", "domain", "location",
  "workMode", "description", "applyUrl"
];

const modes = new Set(["Remote", "Hybrid", "On-site"]);

function error(res, status, message, details) {
  return res.status(status).json({
    success: false,
    error: { message, ...(details ? { details } : {}) }
  });
}

function idOf(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Body must be a JSON object."];
  }

  const errors = [];

  for (const key of fields) {
    if (typeof body[key] !== "string" || !body[key].trim()) {
      errors.push(`${key} must be a non-empty string.`);
    }
  }

  if (typeof body.title === "string" && body.title.trim().length > 120)
    errors.push("title must be at most 120 characters.");

  if (typeof body.company === "string" && body.company.trim().length > 100)
    errors.push("company must be at most 100 characters.");

  if (typeof body.description === "string" &&
      body.description.trim().length > 2000)
    errors.push("description must be at most 2000 characters.");

  if (typeof body.workMode === "string" &&
      !modes.has(body.workMode.trim()))
    errors.push("workMode must be Remote, Hybrid, or On-site.");

  if (typeof body.applyUrl === "string") {
    try {
      const url = new URL(body.applyUrl.trim());
      if (!["http:", "https:"].includes(url.protocol))
        errors.push("applyUrl must use HTTP or HTTPS.");
    } catch {
      errors.push("applyUrl must be a valid URL.");
    }
  }

  return errors;
}

function clean(body) {
  return {
    title: body.title.trim(),
    company: body.company.trim(),
    domain: body.domain.trim(),
    location: body.location.trim(),
    workMode: body.workMode.trim(),
    description: body.description.trim(),
    applyUrl: body.applyUrl.trim()
  };
}

function view(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    domain: row.domain,
    location: row.location,
    workMode: row.work_mode,
    description: row.description,
    applyUrl: row.apply_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Serve the frontend.
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString()
    }
  });
});

// Deterministic records supplied for Edvyro integration testing.
app.get("/api/integration-test-records", (_req, res) => {
  const file = path.join(
    __dirname, "..", "data", "integration-test-records.json"
  );

  try {
    const records = JSON.parse(fs.readFileSync(file, "utf8"));

    if (!records || !Array.isArray(records.internships)) {
      return error(res, 500, "Integration test records have an invalid format.");
    }

    return res.json({ internships: records.internships });
  } catch {
    return error(res, 500, "Integration test records could not be loaded.");
  }
});

// Existing internship API.
app.get("/api/internships", (req, res) => {
  const page = Number.parseInt(req.query.page ?? "1", 10);
  const limit = Number.parseInt(req.query.limit ?? "10", 10);

  if (!Number.isInteger(page) || page < 1 ||
      !Number.isInteger(limit) || limit < 1 || limit > 100) {
    return error(res, 400, "page must be >= 1 and limit must be between 1 and 100.");
  }

  const total = db.prepare(
    "SELECT COUNT(*) AS n FROM internships"
  ).get().n;

  const rows = db.prepare(
    "SELECT * FROM internships ORDER BY id LIMIT ? OFFSET ?"
  ).all(limit, (page - 1) * limit);

  return res.json({
    success: true,
    data: rows.map(view),
    pagination: {
      page, limit, total,
      totalPages: Math.ceil(total / limit)
    }
  });
});

app.get("/api/internships/:id", (req, res) => {
  const id = idOf(req.params.id);
  if (!id) return error(res, 400, "id must be a positive integer.");

  const row = db.prepare(
    "SELECT * FROM internships WHERE id = ?"
  ).get(id);

  if (!row) return error(res, 404, `Internship ${id} was not found.`);

  return res.json({ success: true, data: view(row) });
});

app.post("/api/internships", (req, res) => {
  const errors = validate(req.body);
  if (errors.length) return error(res, 400, "Validation failed.", errors);

  const body = clean(req.body);

  const result = db.prepare(`
    INSERT INTO internships
    (title, company, domain, location, work_mode, description, apply_url)
    VALUES (@title, @company, @domain, @location, @workMode, @description, @applyUrl)
  `).run(body);

  return res.status(201).json({
    success: true,
    data: view(db.prepare(
      "SELECT * FROM internships WHERE id = ?"
    ).get(result.lastInsertRowid))
  });
});

app.put("/api/internships/:id", (req, res) => {
  const id = idOf(req.params.id);
  if (!id) return error(res, 400, "id must be a positive integer.");

  if (!db.prepare("SELECT id FROM internships WHERE id = ?").get(id)) {
    return error(res, 404, `Internship ${id} was not found.`);
  }

  const errors = validate(req.body);
  if (errors.length) return error(res, 400, "Validation failed.", errors);

  const body = clean(req.body);

  db.prepare(`
    UPDATE internships
    SET title = @title, company = @company, domain = @domain,
        location = @location, work_mode = @workMode,
        description = @description, apply_url = @applyUrl,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `).run({ ...body, id });

  return res.json({
    success: true,
    data: view(db.prepare(
      "SELECT * FROM internships WHERE id = ?"
    ).get(id))
  });
});

app.delete("/api/internships/:id", (req, res) => {
  const id = idOf(req.params.id);
  if (!id) return error(res, 400, "id must be a positive integer.");

  const result = db.prepare(
    "DELETE FROM internships WHERE id = ?"
  ).run(id);

  if (!result.changes) {
    return error(res, 404, `Internship ${id} was not found.`);
  }

  return res.json({ success: true, data: { id, deleted: true } });
});

// Server-side validation and persistent application storage.
app.post("/api/applications", applicationLimiter, (req, res) => {
  const body = req.body;

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return error(res, 400, "Body must be a JSON object.");
  }

  const errors = [];

  const internshipId =
    typeof body.internshipId === "string" ? body.internshipId.trim() : "";

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const skills = typeof body.skills === "string" ? body.skills.trim() : "";
  const coverLetter =
    typeof body.coverLetter === "string" ? body.coverLetter.trim() : "";

  if (!internshipId || internshipId.length > 30)
    errors.push("A valid internship must be selected.");

  if (name.length < 2 || name.length > 80)
    errors.push("Name must contain 2 to 80 characters.");

  if (email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("Enter a valid email address.");

  if (!skills || skills.length > 300)
    errors.push("Skills must contain 1 to 300 characters.");

  if (coverLetter.length < 20 || coverLetter.length > 1500)
    errors.push("Cover letter must contain 20 to 1500 characters.");

  if (errors.length)
    return error(res, 400, "Application validation failed.", errors);

  const fixturePath = path.join(
    __dirname, "..", "data", "integration-test-records.json"
  );

  let validInternship = false;

  try {
    const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
    validInternship = fixture.internships.some(
      item => String(item.id) === internshipId
    );
  } catch {
    return error(res, 500, "Internship records are unavailable.");
  }

  if (!validInternship)
    return error(res, 400, "Selected internship does not exist.");

  const result = db.prepare(`
    INSERT INTO applications
    (internship_id, applicant_name, email, skills, cover_letter)
    VALUES (?, ?, ?, ?, ?)
  `).run(internshipId, name, email, skills, coverLetter);

  return res.status(201).json({
    success: true,
    message: "Application submitted successfully.",
    data: { applicationId: result.lastInsertRowid }
  });
});

app.use((req, res) =>
  error(res, 404, `Route ${req.method} ${req.path} was not found.`)
);

app.use((err, _req, res, _next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return error(res, 400, "Request body contains invalid JSON.");
  }

  console.error(err);
  return error(res, 500, "Internal server error.");
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`API listening on port ${PORT}`)
  );
}

module.exports = { app, validate, idOf };
