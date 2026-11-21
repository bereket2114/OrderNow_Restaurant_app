const crypto = require('crypto')
const AdminSession = require('../model/adminSessionSchema')

const COOKIE_NAME = 'ordernow_admin_session'
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

function parseCookies(header = '') {
    return header.split(';').reduce((cookies, part) => {
        const separator = part.indexOf('=')
        if (separator < 0) return cookies
        const name = part.slice(0, separator).trim()
        const value = part.slice(separator + 1).trim()
        if (name) {
            try { cookies[name] = decodeURIComponent(value) } catch (_) { cookies[name] = '' }
        }
        return cookies
    }, {})
}

function cookieOptions() {
    const secure = process.env.NODE_ENV === 'production'
    let sameSite = (process.env.COOKIE_SAME_SITE || (secure ? 'none' : 'lax')).toLowerCase()
    if (!['strict', 'lax', 'none'].includes(sameSite)) sameSite = 'lax'
    if (sameSite === 'none' && !secure) sameSite = 'lax'
    return {
        httpOnly: true,
        secure,
        sameSite,
        path: '/',
        maxAge: SESSION_DURATION_MS
    }
}

function serializeCookie(name, value, options = {}) {
    const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${options.path || '/'}`]
    if (options.maxAge !== undefined) parts.push(`Max-Age=${Math.floor(options.maxAge / 1000)}`)
    if (options.httpOnly) parts.push('HttpOnly')
    if (options.secure) parts.push('Secure')
    if (options.sameSite) parts.push(`SameSite=${options.sameSite[0].toUpperCase()}${options.sameSite.slice(1)}`)
    return parts.join('; ')
}

function setSessionCookie(res, token) {
    res.append('Set-Cookie', serializeCookie(COOKIE_NAME, token, cookieOptions()))
}

function clearSessionCookie(res) {
    res.append('Set-Cookie', serializeCookie(COOKIE_NAME, '', { ...cookieOptions(), maxAge: 0 }))
}

async function requireAdmin(req, res, next) {
    try {
        const origin = req.get('origin')
        const { getAllowedOrigins } = require('./securityConfig')
        if (!origin || !getAllowedOrigins().has(origin) || req.get('x-ordernow-request') !== '1') {
            return res.status(403).json({ success: false, message: 'This request origin is not allowed.' })
        }

        const token = parseCookies(req.headers.cookie)[COOKIE_NAME]
        if (!token || token.length < 40 || token.length > 200) {
            clearSessionCookie(res)
            return res.status(401).json({ success: false, message: 'Administrator authentication required.' })
        }

        const passwordHash = process.env.ADMIN_PASSWORD_HASH
        if (!passwordHash) {
            clearSessionCookie(res)
            return res.status(401).json({ success: false, message: 'Administrator authentication is not configured.' })
        }

        const session = await AdminSession.findOne({
            tokenHash: hashToken(token),
            credentialFingerprint: hashToken(passwordHash),
            expiresAt: { $gt: new Date() }
        }).lean()

        if (!session) {
            clearSessionCookie(res)
            return res.status(401).json({ success: false, message: 'Administrator session has expired.' })
        }

        req.adminSessionId = session._id
        return next()
    } catch (error) {
        console.error('Admin session validation failed:', error.message)
        return res.status(500).json({ success: false, message: 'Unable to validate administrator session.' })
    }
}

module.exports = {
    COOKIE_NAME,
    SESSION_DURATION_MS,
    hashToken,
    parseCookies,
    setSessionCookie,
    clearSessionCookie,
    requireAdmin
}
