require("dotenv").config();

// ==========================================
// EMAIL
// Three ways to send, chosen by what is set in the environment:
//
//  1. Brevo  (HTTPS API)  BREVO_API_KEY + MAIL_FROM_EMAIL
//  2. Resend (HTTPS API)  RESEND_API_KEY + MAIL_FROM
//  3. SMTP   (Gmail etc.) SMTP_HOST + SMTP_USER + SMTP_PASS
//
// Railway blocks SMTP on its Free, Trial and Hobby plans, so use Brevo or
// Resend there. SMTP works on your own computer.
// ==========================================

const provider = () => {
  if (process.env.BREVO_API_KEY && process.env.MAIL_FROM_EMAIL) return "brevo";
  if (process.env.RESEND_API_KEY && process.env.MAIL_FROM) return "resend";
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return "smtp";
  }
  return null;
};

const isMailConfigured = () => provider() !== null;

// ---------- Brevo ----------
async function sendWithBrevo({ to, subject, text, html }) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: process.env.MAIL_FROM_NAME || "REFERGO - PESO Mendez",
        email: process.env.MAIL_FROM_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Brevo ${response.status}: ${detail.slice(0, 200)}`);
  }
}

// ---------- Resend ----------
async function sendWithResend({ to, subject, text, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to: [to],
      subject,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend ${response.status}: ${detail.slice(0, 200)}`);
  }
}

// ---------- SMTP ----------
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  let nodemailer;

  try {
    nodemailer = require("nodemailer");
  } catch {
    throw new Error(
      "nodemailer is not installed. Run `npm install` in the backend folder."
    );
  }

  const port = Number(process.env.SMTP_PORT) || 587;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 15000,
  });

  return transporter;
};

async function sendWithSmtp({ to, subject, text, html }) {
  const from =
    process.env.SMTP_FROM ||
    `"REFERGO - PESO Mendez" <${process.env.SMTP_USER}>`;

  await getTransporter().sendMail({ from, to, subject, text, html });
}

const sendMail = async (message) => {
  const chosen = provider();

  if (chosen === "brevo") return sendWithBrevo(message);
  if (chosen === "resend") return sendWithResend(message);
  if (chosen === "smtp") return sendWithSmtp(message);

  throw new Error("No email service is set up.");
};

module.exports = { isMailConfigured, sendMail };
