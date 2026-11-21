const express = require('express')
const orderController = require('../controller/orderController')
const { requireAdmin } = require('../middleware/adminAuth')
const createRateLimiter = require('../middleware/rateLimiter')
const { requireTrustedBrowserRequest } = require('../middleware/securityConfig')

const router = express.Router()
const createOrderLimiter = createRateLimiter({
    windowMs: 10 * 60 * 1000,
    max: 10,
    message: 'Too many checkout attempts. Please wait before trying again.'
})
const verifyPaymentLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 30,
    message: 'Too many payment verification attempts. Please try again later.'
})
const chapaCallbackLimiter = createRateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 120,
    message: 'Too many payment callbacks. Please try again later.'
})

router.post('/', requireTrustedBrowserRequest, createOrderLimiter, orderController.createOrder)
router.get('/chapa/callback', chapaCallbackLimiter, (req, res) => {
    // Chapa's callback parameters are only a signal to re-check with Chapa; never trust them as payment proof.
    const queryRef = typeof req.query.trx_ref === 'string' ? req.query.trx_ref : req.query.tx_ref
    const bodyRef = typeof req.body?.trx_ref === 'string' ? req.body.trx_ref : req.body?.tx_ref
    const txRef = queryRef || bodyRef
    req.params.tx_ref = txRef
    return orderController.verifyOrderPayment(req, res)
})
router.get('/verify/:tx_ref', verifyPaymentLimiter, orderController.verifyOrderPayment)
router.get('/', requireAdmin, orderController.getOrder)
router.put('/:id/status', requireAdmin, orderController.updateOrderStatus)

module.exports = router
