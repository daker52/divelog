const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { JWT_SECRET } = require("../middleware/auth");

// POST /api/auth/register
router.post("/register", (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password)
    return res.status(400).json({ error: "Vyplňte všechna pole." });
  if (password.length < 6)
    return res.status(400).json({ error: "Heslo musí mít alespoň 6 znaků." });

  const hash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare(
      "INSERT INTO users (username, email, password_hash) VALUES (?,?,?)"
    );
    const info = stmt.run(username.trim(), email.trim().toLowerCase(), hash);
    const user = { id: info.lastInsertRowid, username: username.trim(), email: email.trim().toLowerCase() };
    const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: "30d" });
    res.json({ token, user });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Uživatel s tímto e-mailem nebo jménem již existuje." });
    }
    res.status(500).json({ error: "Chyba serveru." });
  }
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Vyplňte e-mail a heslo." });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: "Nesprávný e-mail nebo heslo." });

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: "30d" });
  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// GET /api/auth/profile  (requires auth)
const { auth } = require("../middleware/auth");
router.get("/profile", auth, (req, res) => {
  const user = db.prepare("SELECT id,username,email,certification,home_location,bio,avatar_url,created_at FROM users WHERE id=?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "Uživatel nenalezen." });
  res.json(user);
});

// PUT /api/auth/profile
router.put("/profile", auth, (req, res) => {
  const { username, certification, home_location, bio, avatar_url } = req.body || {};
  db.prepare(
    "UPDATE users SET username=COALESCE(?,username), certification=COALESCE(?,certification), home_location=COALESCE(?,home_location), bio=COALESCE(?,bio), avatar_url=COALESCE(?,avatar_url) WHERE id=?"
  ).run(username, certification, home_location, bio, avatar_url, req.user.id);
  const user = db.prepare("SELECT id,username,email,certification,home_location,bio,avatar_url FROM users WHERE id=?").get(req.user.id);
  res.json(user);
});

module.exports = router;
