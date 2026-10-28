// ==========================================================
// PASSWORD HASHING
//
// New passwords use Argon2id, the algorithm OWASP lists first for passwords.
// It is memory-hard, which makes cracking with GPUs and special hardware far
// more expensive than bcrypt.
//
// Accounts created before this change still have bcrypt hashes. They keep
// working: the first successful login re-hashes the password with Argon2id
// (see needsRehash), so no one has to reset anything.
// ==========================================================

const bcrypt = require("bcrypt");

let argon2 = null;

const getArgon2 = () => {
  if (!argon2) {
    try {
      argon2 = require("argon2");
    } catch {
      throw new Error(
        "The argon2 package is not installed. Run `npm install` in the backend folder."
      );
    }
  }

  return argon2;
};

// OWASP-recommended strength: 64 MiB of memory, 3 passes, 1 thread.
const options = () => ({
  type: getArgon2().argon2id,
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 1,
});

const isBcrypt = (hash) => /^\$2[abxy]\$/.test(String(hash || ""));
const isArgon2 = (hash) => String(hash || "").startsWith("$argon2");

// -> encoded hash string (about 97 characters)
async function hashPassword(plain) {
  return getArgon2().hash(String(plain), options());
}

// -> { valid, needsRehash }
async function verifyPassword(plain, stored) {
  const password = String(plain ?? "");

  try {
    if (isArgon2(stored)) {
      const valid = await getArgon2().verify(stored, password);

      return {
        valid,
        needsRehash: valid && getArgon2().needsRehash(stored, options()),
      };
    }

    if (isBcrypt(stored)) {
      const valid = await bcrypt.compare(password, stored);

      // Old bcrypt hash: upgrade it after a successful login.
      return { valid, needsRehash: valid };
    }
  } catch (error) {
    console.error("PASSWORD VERIFY ERROR:", error.message);
  }

  return { valid: false, needsRehash: false };
}

module.exports = { hashPassword, verifyPassword };
