const router = require("express").Router();
const db = require("../db");
const { auth } = require("../middleware/auth");

// GET /api/forum  (public)
router.get("/", (req, res) => {
  const rows = db.prepare(`
    SELECT fp.id, fp.data, fp.created_at, u.username
    FROM forum_posts fp
    JOIN users u ON fp.user_id = u.id
    ORDER BY fp.id DESC
    LIMIT 200
  `).all();
  const posts = rows.map(r => ({
    ...JSON.parse(r.data),
    _dbId: r.id,
    author: r.username,
    createdAt: r.created_at,
  }));
  res.json(posts);
});

// POST /api/forum  (auth required)
router.post("/", auth, (req, res) => {
  const data = req.body;
  if (!data || !data.title || !data.message)
    return res.status(400).json({ error: "Vyplňte titulek a zprávu." });

  const payload = { ...data, author: req.user.username };
  const info = db.prepare("INSERT INTO forum_posts (user_id, data) VALUES (?,?)").run(req.user.id, JSON.stringify(payload));
  const row = db.prepare("SELECT created_at FROM forum_posts WHERE id=?").get(info.lastInsertRowid);
  res.status(201).json({ ...payload, _dbId: info.lastInsertRowid, createdAt: row.created_at });
});

// DELETE /api/forum/:id  (own posts only)
router.delete("/:id", auth, (req, res) => {
  const info = db.prepare("DELETE FROM forum_posts WHERE id=? AND user_id=?").run(req.params.id, req.user.id);
  if (!info.changes) return res.status(404).json({ error: "Příspěvek nenalezen nebo nemáte oprávnění." });
  res.json({ ok: true });
});

module.exports = router;
