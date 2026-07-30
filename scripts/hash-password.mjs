// Generate a scrypt "salt:hash" for AUTH_PASSWORD_HASH.
// Usage:  node scripts/hash-password.mjs 'your-password-here'
// Paste the printed value into .env.local / Vercel as AUTH_PASSWORD_HASH.
import { scryptSync, randomBytes } from 'node:crypto'

const password = process.argv[2]
if (!password) {
  console.error("Usage: node scripts/hash-password.mjs '<password>'")
  process.exit(1)
}

const salt = randomBytes(16)
const hash = scryptSync(password, salt, 64)
console.log(`${salt.toString('hex')}:${hash.toString('hex')}`)
