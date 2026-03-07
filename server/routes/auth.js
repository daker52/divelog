const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const db = require("../db");
const { JWT_SECRET, auth } = require("../middleware/auth");
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require("../utils/email");

function genToken() {
  return crypto.randomBytes(32).toString("hex");
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password)
    return res.status(400).json({ error: "Vyplnte vsechna pole." });
  if (password.length < 6)
    return res.status(400).json({ error: "Heslo musi mit alespon 6 znaku." });

  const hash = bcrypt.hashSync(password, 10);
  const verToken = genToken();

  try {
    const stmt = db.prepare(
      "INSERT INTO users (username, email, password_hash, email_verified, verification_token) VALUES (?,?,?,0,?)"
    );
    stmt.run(username.trim(), email.trim().toLowerCase(), hash, verToken);

    try {
      await sendVerificationEmail(email.trim().toLowerCase(), username.trim(), verToken);
    } catch (emailErr) {
      console.error("[email] sendVerificationEmail failed:", emailErr.message);
    }

    res.json({
      verifyEmailSent: true,
      message: "Registrace probehla uspesne. Zkontroluj svuj e-mail a potvrd ucet.",
    });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Uzivatel s timto e-mailem nebo jmenem jiz existuje." });
    }
    res.status(500).json({ error: "Chyba serveru." });
  }
});

// GET /api/auth/verify/:token
router.get("/verify/:token", async (req, res) => {
  const { token } = req.params;
  const user = db.prepare("SELECT * FROM users WHERE verification_token = ?").get(token);
  if (!user) return res.status(400).json({ error: "Neplatny nebo expirovany overovaci odkaz." });

  db.prepare("UPDATE users SET email_verified=1, verification_token=NULL WHERE id=?").run(user.id);

  try {
    await sendWelcomeEmail(user.email, user.username);
  } catch (e) {
    console.error("[email] sendWelcomeEmail failed:", e.message);
  }

  res.json({ ok: true, message: "E-mail byl uspesne overen. Nyni se muzes prihlasit." });
});

// POST /api/auth/login
router.post("/login", (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Vyplnte e-mail a heslo." });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: "Nespravny e-mail nebo heslo." });

  if (!user.email_verified) {
    return res.status(403).json({
      error: "Ucet jeste neni overen. Zkontroluj e-mail a klikni na overovaci odkaz.",
      notVerified: true,
    });
  }

  const token = jwt.sign({ id: user.id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: "30d" });
  const { password_hash, verification_token, reset_token, reset_token_expires, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Zadejte e-mail." });

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email.trim().toLowerCase());
  if (!user) return res.json({ ok: true });

  const resetToken = genToken();
  const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  db.prepare("UPDATE users SET reset_token=?, reset_token_expires=? WHERE id=?").run(resetToken, expires, user.id);

  try {
    await sendPasswordResetEmail(user.email, user.username, resetToken);
  } catch (e) {
    console.error("[email] sendPasswordResetEmail failed:", e.message);
  }

  res.json({ ok: true });
});

// POST /api/auth/reset-password
router.post("/reset-password", (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) return res.status(400).json({ error: "Chybi token nebo heslo." });
  if (password.length < 6) return res.status(400).json({ error: "Heslo musi mit alespon 6 znaku." });

  const user = db.prepare("SELECT * FROM users WHERE reset_token = ?").get(token);
  if (!user) return res.status(400).json({ error: "Neplatny nebo expirovany token." });

  if (new Date(user.reset_token_expires) < new Date()) {
    return res.status(400).json({ error: "Token pro obnovu hesla vyprsel." });
  }

  const hash = bcrypt.hashSync(password, 10);
  db.prepare("UPDATE users SET password_hash=?, reset_token=NULL, reset_token_expires=NULL WHERE id=?").run(hash, user.id);

  res.json({ ok: true, message: "Heslo bylo uspesne zmeneno. Nyni se muzes prihlasit." });
});

// GET /api/auth/profile
router.get("/profile", auth, (req, res) => {
  const user = db.prepare("SELECT id,username,email,email_verified,certification,home_location,bio,avatar_url,created_at FROM users WHERE id=?").get(req.user.id);
  if (!user) return res.status(404).json({ error: "Uzivatel nenalezen." });
  res.json(user);
});

// PUT /api/auth/profile
router.put("/profile", auth, (req, res) => {
  const { username, certification, home_location, bio, avatar_url } = req.body || {};
  db.prepare(
    "UPDATE users SET username=COALESCE(?,username), certification=COALESCE(?,certification), home_location=COALESCE(?,home_location), bio=COALESCE(?,bio), avatar_url=COALESCE(?,avatar_url) WHERE id=?"
  ).run(username, certification, home_location, bio, avatar_url, req.user.id);
  const user = db.prepare("SELECT id,username,email,email_verified,certification,home_location,bio,avatar_url FROM users WHERE id=?").get(req.user.id);
  res.json(user);
});

module.exports = router;
