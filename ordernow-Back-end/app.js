require('dotenv').config()

const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const connectDB = require('./config/database')
const baseRoute = require('./routes/baseRoute')
const { getAllowedOrigins } = require('./middleware/securityConfig')

const app = express()

if (process.env.NODE_ENV === 'production') {
    // Required when deployed behind a single trusted HTTPS reverse proxy.
    app.set('trust proxy', 1)
}

app.disable('x-powered-by')
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    res.setHeader('Cross-Origin-Resource-Policy', 'same-site')
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    }
    next()
})

const allowedOrigins = getAllowedOrigins()
app.use(cors({
    origin(origin, callback) {
        // Requests without an Origin header are normally server-to-server or CLI requests.
        if (!origin || allowedOrigins.has(origin)) return callback(null, true)
        return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-OrderNow-Request'],
    optionsSuccessStatus: 204
}))

app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: false, limit: '100kb' }))

app.get('/api/health', (req, res) => {
    const databaseConnected = mongoose.connection.readyState === 1
    return res.status(databaseConnected ? 200 : 503).json({
        success: databaseConnected,
        service: 'OrderNow API',
        database: databaseConnected ? 'connected' : 'unavailable'
    })
})

app.use('/', baseRoute)

// Centralized request/parser/upload error handling. Do not leak stack traces to clients.
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error)

    if (error && error.name === 'MulterError') {
        const message = error.code === 'LIMIT_FILE_SIZE'
            ? 'Image must be 5 MB or smaller.'
            : 'The uploaded image could not be accepted.'
        return res.status(400).json({ success: false, message })
    }

    if (error && (error.type === 'entity.too.large' || error.status === 413)) {
        return res.status(413).json({ success: false, message: 'Request body is too large.' })
    }

    if (error instanceof SyntaxError && error.status === 400 && Object.prototype.hasOwnProperty.call(error, 'body')) {
        return res.status(400).json({ success: false, message: 'Request contains invalid JSON.' })
    }

    if (error && error.message === 'Unsupported image format or file content does not match its MIME type.') {
        return res.status(400).json({ success: false, message: error.message })
    }

    console.error('Unhandled request error:', error && error.message ? error.message : 'Unknown error')
    return res.status(500).json({ success: false, message: 'Internal server error.' })
})

const PORT = Number(process.env.PORT) || 5000

async function startServer() {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`OrderNow API listening on port ${PORT}`)
        })
    } catch (error) {
        console.error('Unable to start OrderNow API:', error.message)
        process.exit(1)
    }
}

if (require.main === module) {
    startServer()
}

module.exports = app
