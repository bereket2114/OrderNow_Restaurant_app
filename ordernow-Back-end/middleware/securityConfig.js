function normalizeOrigin(value) {
    try {
        return new URL(value).origin
    } catch (_) {
        return null
    }
}

function getAllowedOrigins() {
    const configured = (process.env.CORS_ORIGINS || '')
        .split(',')
        .map((value) => normalizeOrigin(value.trim()))
        .filter(Boolean)

    const frontendOrigin = normalizeOrigin(process.env.FRONTEND_URL || '')
    if (frontendOrigin) configured.push(frontendOrigin)

    if (process.env.NODE_ENV !== 'production') {
        configured.push('http://localhost:5173', 'http://127.0.0.1:5173')
    }

    return new Set(configured)
}

function requireTrustedBrowserRequest(req, res, next) {
    const origin = req.get('origin')
    const allowedOrigins = getAllowedOrigins()

    if (!origin || !allowedOrigins.has(origin) || req.get('x-ordernow-request') !== '1') {
        return res.status(403).json({
            success: false,
            message: 'This request origin is not allowed.'
        })
    }

    return next()
}

module.exports = { getAllowedOrigins, requireTrustedBrowserRequest }
