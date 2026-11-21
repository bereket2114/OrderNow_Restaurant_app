const test = require('node:test')
const assert = require('node:assert/strict')

const { hashPassword, verifyPassword } = require('../utils/passwordHash')
const { getAllowedOrigins, requireTrustedBrowserRequest } = require('../middleware/securityConfig')
const createRateLimiter = require('../middleware/rateLimiter')
const trustedMenuCatalog = require('../config/trustedMenuCatalog')
const { isChapaPaymentVerified, isChapaPaymentFailed } = require('../utils/chapaPayment')

test('password hashes are salted and can only be verified with the right password', () => {
    const password = 'correct-horse-battery-staple'
    const firstHash = hashPassword(password)
    const secondHash = hashPassword(password)

    assert.notEqual(firstHash, password)
    assert.notEqual(firstHash, secondHash)
    assert.equal(verifyPassword(password, firstHash), true)
    assert.equal(verifyPassword('incorrect-password', firstHash), false)
    assert.equal(verifyPassword(password, 'not-a-valid-hash'), false)
    assert.throws(() => hashPassword('short'), /12 and 256 characters/)
})

test('production allowed origins are exact and normalized', () => {
    const previous = {
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        CORS_ORIGINS: process.env.CORS_ORIGINS
    }
    process.env.NODE_ENV = 'production'
    process.env.FRONTEND_URL = 'https://ordernow.example/path'
    process.env.CORS_ORIGINS = 'https://admin.example/,https://www.example'

    try {
        const allowed = getAllowedOrigins()
        assert.equal(allowed.has('https://ordernow.example'), true)
        assert.equal(allowed.has('https://admin.example'), true)
        assert.equal(allowed.has('https://admin.example/'), false)
        assert.equal(allowed.has('https://attacker.example'), false)
        assert.equal(allowed.has('http://localhost:5173'), false)
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key]
            else process.env[key] = value
        }
    }
})

test('sensitive browser requests require an allowed origin and custom header', () => {
    const previous = {
        NODE_ENV: process.env.NODE_ENV,
        FRONTEND_URL: process.env.FRONTEND_URL,
        CORS_ORIGINS: process.env.CORS_ORIGINS
    }
    process.env.NODE_ENV = 'production'
    process.env.FRONTEND_URL = 'https://ordernow.example'
    process.env.CORS_ORIGINS = ''

    const runMiddleware = (origin, marker) => {
        let nextCalled = false
        let statusCode = null
        let jsonBody = null
        const req = { get: (name) => name === 'origin' ? origin : marker }
        const res = {
            status(code) { statusCode = code; return this },
            json(body) { jsonBody = body; return this }
        }
        requireTrustedBrowserRequest(req, res, () => { nextCalled = true })
        return { nextCalled, statusCode, jsonBody }
    }

    try {
        assert.equal(runMiddleware('https://attacker.example', '1').statusCode, 403)
        assert.equal(runMiddleware('https://ordernow.example', '').statusCode, 403)
        assert.equal(runMiddleware('https://ordernow.example', '1').nextCalled, true)
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key]
            else process.env[key] = value
        }
    }
})

test('rate limiter rejects requests after its configured allowance', () => {
    const limiter = createRateLimiter({ windowMs: 60_000, max: 2, message: 'Rate limited.' })

    const attempt = () => {
        let statusCode = null
        let responseBody = null
        const headers = {}
        const res = {
            setHeader(name, value) { headers[name] = value },
            status(code) { statusCode = code; return this },
            json(body) { responseBody = body; return this }
        }
        let nextCalled = false
        limiter({ ip: '127.0.0.9', socket: {} }, res, () => { nextCalled = true })
        return { statusCode, responseBody, headers, nextCalled }
    }

    assert.equal(attempt().nextCalled, true)
    assert.equal(attempt().nextCalled, true)
    const blocked = attempt()
    assert.equal(blocked.statusCode, 429)
    assert.equal(blocked.responseBody.message, 'Rate limited.')
})

test('server-owned catalog includes the built-in food and beverage items', () => {
    assert.equal(trustedMenuCatalog.get('673a1001a1b2c3d4e5f60001').Price, 480)
    assert.equal(trustedMenuCatalog.get('bev-ambo-water').Price, 65)
    assert.equal(trustedMenuCatalog.has('client-invented-menu-item'), false)
})


test('Chapa verification requires matching transaction reference, amount, currency, and success status', () => {
    const order = { tx_ref: 'ORDN-0123456789ABCDEF0123456789ABCDEF', TotalAmount: 480 }
    const validResponse = {
        status: 'success',
        data: { status: 'success', tx_ref: order.tx_ref, amount: '480.00', currency: 'ETB' }
    }

    assert.equal(isChapaPaymentVerified(true, validResponse, order), true)
    assert.equal(isChapaPaymentVerified(false, validResponse, order), false)
    assert.equal(isChapaPaymentVerified(true, { ...validResponse, data: { ...validResponse.data, amount: '479' } }, order), false)
    assert.equal(isChapaPaymentVerified(true, { ...validResponse, data: { ...validResponse.data, currency: 'USD' } }, order), false)
    assert.equal(isChapaPaymentVerified(true, { ...validResponse, data: { ...validResponse.data, tx_ref: 'different' } }, order), false)
    assert.equal(isChapaPaymentFailed(true, { status: 'success', data: { status: 'failed', tx_ref: order.tx_ref } }, order.tx_ref), true)
    assert.equal(isChapaPaymentFailed(true, { status: 'success', data: { status: 'failed', tx_ref: 'different' } }, order.tx_ref), false)
})
