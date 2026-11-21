const express = require('express')
const adminController = require('../controller/adminController')
const { requireAdmin } = require('../middleware/adminAuth')
const { requireTrustedBrowserRequest } = require('../middleware/securityConfig')
const createRateLimiter = require('../middleware/rateLimiter')

const router = express.Router()
const loginLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 8,
    message: 'Too many staff login attempts. Please try again later.'
})

router.post('/login', requireTrustedBrowserRequest, loginLimiter, adminController.login)
router.get('/session', requireAdmin, adminController.session)
router.post('/logout', requireAdmin, adminController.logout)

module.exports = router
