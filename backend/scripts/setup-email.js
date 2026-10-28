// One-step email setup for "Forgot password".
//   npm run setup-email
// Asks for the Gmail address and its App Password, saves them to .env,
// then sends a test email so you know it works.

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const ENV_PATH = path.join(__dirname, "..", ".env");

// Sets KEY=value lines in the .env text, keeping everything else as it is.
function updateEnvText(text, values) {
  let out = text;

  Object.entries(values).forEach(([key, value]) => {
    const line = `${key}=${value}`;
    const pattern = new RegExp(`^${key}=.*$`, "m");

    if (pattern.test(out)) {
      out = out.replace(pattern, line);
    } else {
      out = `${out}${out && !out.endsWith("\n") ? "\n" : ""}${line}\n`;
    }
  });

  return out;
}

function ask(rl, question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    if (hidden) {
      const original = rl._writeToOutput;
      rl._writeToOutput = (text) => {
        if (text.includes(question)) original.call(rl, text);
      };
      rl.question(question, (answer) => {
        rl._writeToOutput = original;
        process.stdout.write("\n");
        resolve(answer);
      });
    } else {
      rl.question(question, resolve);
    }
  });
}

async function main() {
  console.log("\nREFERGO email setup\n");
  console.log("You need a Gmail address and an App Password (16 characters).");
  console.log("Create one at https://myaccount.google.com/apppasswords");
  console.log("(2-Step Verification must be on).\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const email = (await ask(rl, "Gmail address: ")).trim();
  const password = (await ask(rl, "App Password (hidden): ", { hidden: true })).replace(/\s+/g, "");
  rl.close();

  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
    console.error("\nThat does not look right. Please run the command again.");
    process.exit(1);
  }

  let nodemailer;
  try {
    nodemailer = require("nodemailer");
  } catch {
    console.error("\nnodemailer is not installed. Run `npm install` in this folder first.");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: email, pass: password },
  });

  console.log("\nChecking the login with Gmail...");

  try {
    await transporter.verify();
    await transporter.sendMail({
      from: `"REFERGO - PESO Mendez" <${email}>`,
      to: email,
      subject: "REFERGO email test",
      text: "Email is working. Forgot password codes will be sent from this address.",
    });
  } catch (error) {
    console.error(`\nFailed: ${error.message}\n`);
    if (error.code === "EAUTH" || /535|Invalid login|Username and Password/i.test(error.message)) {
      console.error("Gmail rejected the login. Use an App Password (not your normal password),");
      console.error("and make sure 2-Step Verification is on. Create a new App Password and try again.");
    } else {
      console.error("Could not reach Gmail. Check your internet connection or firewall.");
    }
    process.exit(1);
  }

  const current = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
  const next = updateEnvText(current, {
    SMTP_HOST: "smtp.gmail.com",
    SMTP_PORT: "587",
    SMTP_USER: email,
    SMTP_PASS: password,
    SMTP_FROM: `"REFERGO - PESO Mendez" <${email}>`,
  });
  fs.writeFileSync(ENV_PATH, next);

  console.log(`\nDone. A test email was sent to ${email} and the settings were saved to .env.`);
  console.log("Now restart the backend, and Forgot password will email the code.\n");
}

if (require.main === module) {
  main();
}

module.exports = { updateEnvText };
