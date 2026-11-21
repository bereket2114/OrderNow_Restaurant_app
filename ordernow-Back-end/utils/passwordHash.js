const crypto = require('crypto')

const KEY_LENGTH = 64

function hashPassword(password) {
    if (typeof password !== 'string' || password.length < 12 || password.length > 256) {
        throw new TypeError('Password must contain between 12 and 256 characters.')
    }

    const salt = crypto.randomBytes(16)
    const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH)
    return `scrypt$${salt.toString('hex')}$${derivedKey.toString('hex')}`
}

function verifyPassword(password, storedHash) {
    if (typeof password !== 'string' || typeof storedHash !== 'string') return false

    const parts = storedHash.split('$')
    if (parts.length !== 3 || parts[0] !== 'scrypt' || !/^[a-f0-9]{32}$/i.test(parts[1]) || !/^[a-f0-9]{128}$/i.test(parts[2])) {
        return false
    }

    const salt = Buffer.from(parts[1], 'hex')
    const expected = Buffer.from(parts[2], 'hex')
    const actual = crypto.scryptSync(password, salt, expected.length)
    return crypto.timingSafeEqual(actual, expected)
}

module.exports = { hashPassword, verifyPassword }
