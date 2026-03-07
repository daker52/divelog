const nodemailer = require("nodemailer");

const FROM_EMAIL = process.env.FROM_EMAIL || "no-reply@yourdivelog.cz";
const APP_URL   = process.env.APP_URL   || "http://194.182.80.24";

// Use local Postfix (sendmail transport = zero config, relies on system MTA)
const transporter = nodemailer.createTransport({
  sendmail: true,
  newline: "unix",
  path: "/usr/sbin/sendmail",
});

async function sendMail(to, subject, html) {
  try {
    await transporter.sendMail({ from: FROM_EMAIL, to, subject, html });
    console.log(`[email] Sent to ${to}: ${subject}`);
  } catch (err) {
    console.error(`[email] Failed to send to ${to}:`, err.message);
    throw err;
  }
}

async function sendVerificationEmail(email, username, token) {
  const link = `${APP_URL}/?verify=${token}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#0e64a0">Vítej v YourDiveLog! 🤿</h2>
      <p>Ahoj <strong>${username}</strong>,</p>
      <p>Pro aktivaci účtu klikni na tlačítko níže:</p>
      <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 28px;
        background:#0e64a0;color:#fff;text-decoration:none;border-radius:6px;font-size:15px">
        Ověřit e-mail
      </a>
      <p style="color:#666;font-size:13px">Odkaz je platný 24 hodin. Pokud sis účet nezaložil/a, ignoruj tento e-mail.</p>
    </div>`;
  await sendMail(email, "YourDiveLog – ověření e-mailu", html);
}

async function sendWelcomeEmail(email, username) {
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#0e64a0">Účet ověřen! 🎉</h2>
      <p>Ahoj <strong>${username}</strong>, tvůj e-mail byl úspěšně ověřen.</p>
      <p>Přihlaš se a začni logovat ponory:</p>
      <a href="${APP_URL}" style="display:inline-block;margin:16px 0;padding:12px 28px;
        background:#0e64a0;color:#fff;text-decoration:none;border-radius:6px;font-size:15px">
        Otevřít YourDiveLog
      </a>
    </div>`;
  await sendMail(email, "YourDiveLog – vítej na palubě!", html);
}

async function sendPasswordResetEmail(email, username, token) {
  const link = `${APP_URL}/?reset=${token}`;
  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto">
      <h2 style="color:#0e64a0">Obnova hesla</h2>
      <p>Ahoj <strong>${username}</strong>,</p>
      <p>Pro nastavení nového hesla klikni na tlačítko níže:</p>
      <a href="${link}" style="display:inline-block;margin:16px 0;padding:12px 28px;
        background:#0e64a0;color:#fff;text-decoration:none;border-radius:6px;font-size:15px">
        Nastavit nové heslo
      </a>
      <p style="color:#666;font-size:13px">Odkaz je platný 1 hodinu. Pokud jsi o obnovu hesla nežádal/a, ignoruj tento e-mail.</p>
    </div>`;
  await sendMail(email, "YourDiveLog – obnova hesla", html);
}

module.exports = { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail };
