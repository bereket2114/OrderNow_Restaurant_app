const crypto = require('crypto')
const AdminSession = require('../model/adminSessionSchema')
const { verifyPassword } = require('../utils/passwordHash')
const {
    SESSION_DURATION_MS,
    hashToken,
    setSessionCookie,
    clearSessionCookie
} = require('../middleware/adminAuth')

module.exports = {
    login: async (req, res) => {
        try {
            const { passcode } = req.body || {}
            const passwordHash = process.env.ADMIN_PASSWORD_HASH

            if (!passwordHash) {
                return res.status(503).json({
                    success: false,
                    message: 'Staff login is not configured. Set ADMIN_PASSWORD_HASH on the backend.'
                })
            }

            if (typeof passcode !== 'string' || passcode.length < 12 || passcode.length > 256 || !verifyPassword(passcode, passwordHash)) {
                return res.status(401).json({ success: false, message: 'Invalid staff credentials.' })
            }

            const token = crypto.randomBytes(32).toString('hex')
            const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)
            await AdminSession.create({
                tokenHash: hashToken(token),
                credentialFingerprint: hashToken(passwordHash),
                expiresAt
            })
            setSessionCookie(res, token)

            return res.status(200).json({
                success: true,
                authenticated: true,
                expiresAt
            })
        } catch (error) {
            console.error('Staff login failed:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to complete staff login.' })
        }
    },

    session: async (req, res) => {
        return res.status(200).json({ success: true, authenticated: true })
    },

    logout: async (req, res) => {
        try {
            await AdminSession.findByIdAndDelete(req.adminSessionId)
            clearSessionCookie(res)
            return res.status(200).json({ success: true, message: 'Staff session ended.' })
        } catch (error) {
            console.error('Staff logout failed:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to complete staff logout.' })
        }
    }
}
