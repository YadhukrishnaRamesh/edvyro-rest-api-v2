const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { db, initializeDatabase } = require("./storage");
initializeDatabase();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "100kb" }));
const PORT = Number(process.env.PORT) || 3000;
const fields = ["title","company","domain","location","workMode","description","applyUrl"];
const modes = new Set(["Remote","Hybrid","On-site"]);

function error(res, status, message, details) {
  return res.status(status).json({ success:false, error:{ message, ...(details ? {details} : {}) } });
}
function idOf(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function validate(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return ["Body must be a JSON object."];
  const errors = [];
  for (const key of fields) if (typeof body[key] !== "string" || !body[key].trim()) errors.push(`${key} must be a non-empty string.`);
  if (typeof body.title === "string" && body.title.trim().length > 120) errors.push("title must be at most 120 characters.");
  if (typeof body.company === "string" && body.company.trim().length > 100) errors.push("company must be at most 100 characters.");
  if (typeof body.description === "string" && body.description.trim().length > 2000) errors.push("description must be at most 2000 characters.");
  if (typeof body.workMode === "string" && !modes.has(body.workMode.trim())) errors.push("workMode must be Remote, Hybrid, or On-site.");
  if (typeof body.applyUrl === "string") {
    try { const u = new URL(body.applyUrl.trim()); if (!["http:","https:"].includes(u.protocol)) errors.push("applyUrl must use HTTP or HTTPS."); }
    catch { errors.push("applyUrl must be a valid URL."); }
  }
  return errors;
}
function clean(b) {
  return { title:b.title.trim(), company:b.company.trim(), domain:b.domain.trim(), location:b.location.trim(),
    workMode:b.workMode.trim(), description:b.description.trim(), applyUrl:b.applyUrl.trim() };
}
function view(r) {
  return { id:r.id,title:r.title,company:r.company,domain:r.domain,location:r.location,workMode:r.work_mode,
    description:r.description,applyUrl:r.apply_url,createdAt:r.created_at,updatedAt:r.updated_at };
}

app.get("/", (_q,s) => s.json({name:"Edvyro Internship Records API",status:"ok",endpoints:{
  health:"GET /api/health",list:"GET /api/internships?page=1&limit=10",detail:"GET /api/internships/:id",
  create:"POST /api/internships",update:"PUT /api/internships/:id",delete:"DELETE /api/internships/:id"
}}));
app.get("/api/health", (_q,s) => s.json({success:true,data:{status:"healthy",timestamp:new Date().toISOString()}}));

app.get("/api/internships", (q,s) => {
  const page = Number.parseInt(q.query.page ?? "1",10), limit = Number.parseInt(q.query.limit ?? "10",10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100)
    return error(s,400,"page must be >= 1 and limit must be between 1 and 100.");
  const total = db.prepare("SELECT COUNT(*) n FROM internships").get().n;
  const rows = db.prepare("SELECT * FROM internships ORDER BY id LIMIT ? OFFSET ?").all(limit,(page-1)*limit);
  return s.json({success:true,data:rows.map(view),pagination:{page,limit,total,totalPages:Math.ceil(total/limit)}});
});
app.get("/api/internships/:id", (q,s) => {
  const id=idOf(q.params.id); if (!id) return error(s,400,"id must be a positive integer.");
  const row=db.prepare("SELECT * FROM internships WHERE id=?").get(id);
  if (!row) return error(s,404,`Internship ${id} was not found.`);
  return s.json({success:true,data:view(row)});
});
app.post("/api/internships", (q,s) => {
  const errors=validate(q.body); if (errors.length) return error(s,400,"Validation failed.",errors);
  const b=clean(q.body);
  const result=db.prepare("INSERT INTO internships(title,company,domain,location,work_mode,description,apply_url) VALUES(@title,@company,@domain,@location,@workMode,@description,@applyUrl)").run(b);
  return s.status(201).json({success:true,data:view(db.prepare("SELECT * FROM internships WHERE id=?").get(result.lastInsertRowid))});
});
app.put("/api/internships/:id", (q,s) => {
  const id=idOf(q.params.id); if (!id) return error(s,400,"id must be a positive integer.");
  if (!db.prepare("SELECT id FROM internships WHERE id=?").get(id)) return error(s,404,`Internship ${id} was not found.`);
  const errors=validate(q.body); if (errors.length) return error(s,400,"Validation failed.",errors);
  const b=clean(q.body);
  db.prepare("UPDATE internships SET title=@title,company=@company,domain=@domain,location=@location,work_mode=@workMode,description=@description,apply_url=@applyUrl,updated_at=CURRENT_TIMESTAMP WHERE id=@id").run({...b,id});
  return s.json({success:true,data:view(db.prepare("SELECT * FROM internships WHERE id=?").get(id))});
});
app.delete("/api/internships/:id", (q,s) => {
  const id=idOf(q.params.id); if (!id) return error(s,400,"id must be a positive integer.");
  if (!db.prepare("DELETE FROM internships WHERE id=?").run(id).changes) return error(s,404,`Internship ${id} was not found.`);
  return s.json({success:true,data:{id,deleted:true}});
});
app.use((q,s) => error(s,404,`Route ${q.method} ${q.path} was not found.`));
app.use((err,_q,s,_next) => {
  if (err instanceof SyntaxError && "body" in err) return error(s,400,"Request body contains invalid JSON.");
  console.error(err); return error(s,500,"Internal server error.");
});
if (require.main === module) app.listen(PORT,"0.0.0.0",()=>console.log(`API listening on port ${PORT}`));
module.exports = { app, validate, idOf };
