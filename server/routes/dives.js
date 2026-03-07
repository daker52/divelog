const router = require("express").Router();
const db = require("../db");
const { auth } = require("../middleware/auth");

// GET /api/dives
router.get("/", auth, (req, res) => {
  const rows = db.prepare("SELECT id, data FROM dives WHERE user_id=? ORDER BY id DESC").all(req.user.id);
  const dives = rows.map(r => ({ ...JSON.parse(r.data), _dbId: r.id }));
  res.json(dives);
});

// POST /api/dives
router.post("/", auth, (req, res) => {
  const data = req.body;
  if (!data) return res.status(400).json({ error: "Chybí data ponoru." });
  const info = db.prepare("INSERT INTO dives (user_id, data) VALUES (?,?)").run(req.user.id, JSON.stringify(data));
  res.status(201).json({ ...data, _dbId: info.lastInsertRowid });
});

// PUT /api/dives/:id
router.put("/:id", auth, (req, res) => {
  const row = db.prepare("SELECT * FROM dives WHERE id=? AND user_id=?").get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: "Ponor nenalezen." });
  db.prepare("UPDATE dives SET data=?, updated_at=datetime('now') WHERE id=?").run(JSON.stringify(req.body), req.params.id);
  res.json({ ...req.body, _dbId: Number(req.params.id) });
});

// DELETE /api/dives/:id
router.delete("/:id", auth, (req, res) => {
  const info = db.prepare("DELETE FROM dives WHERE id=? AND user_id=?").run(req.params.id, req.user.id);
  if (!info.changes) return res.status(404).json({ error: "Ponor nenalezen." });
  res.json({ ok: true });
});

module.exports = router;
