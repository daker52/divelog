const router = require("express").Router();
const db = require("../db");
const { auth } = require("../middleware/auth");

// GET /api/gear
router.get("/", auth, (req, res) => {
  const rows = db.prepare("SELECT id, data FROM gear WHERE user_id=? ORDER BY id ASC").all(req.user.id);
  res.json(rows.map(r => ({ ...JSON.parse(r.data), _dbId: r.id })));
});

// POST /api/gear
router.post("/", auth, (req, res) => {
  const data = req.body;
  if (!data) return res.status(400).json({ error: "Chybí data vybavení." });
  const info = db.prepare("INSERT INTO gear (user_id, data) VALUES (?,?)").run(req.user.id, JSON.stringify(data));
  res.status(201).json({ ...data, _dbId: info.lastInsertRowid });
});

// PUT /api/gear/:id
router.put("/:id", auth, (req, res) => {
  const row = db.prepare("SELECT * FROM gear WHERE id=? AND user_id=?").get(req.params.id, req.user.id);
  if (!row) return res.status(404).json({ error: "Vybavení nenalezeno." });
  db.prepare("UPDATE gear SET data=?, updated_at=datetime('now') WHERE id=?").run(JSON.stringify(req.body), req.params.id);
  res.json({ ...req.body, _dbId: Number(req.params.id) });
});

// DELETE /api/gear/:id
router.delete("/:id", auth, (req, res) => {
  const info = db.prepare("DELETE FROM gear WHERE id=? AND user_id=?").run(req.params.id, req.user.id);
  if (!info.changes) return res.status(404).json({ error: "Vybavení nenalezeno." });
  res.json({ ok: true });
});

module.exports = router;
