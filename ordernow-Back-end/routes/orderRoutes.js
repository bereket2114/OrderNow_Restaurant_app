const orderController = require('../controller/orderController')
const express = require('express')
const router = express.Router()

router.get('/', orderController.getOrder)
router.post('/', orderController.createOrder)
router.get('/verify/:tx_ref', orderController.verifyOrderPayment)
router.put('/:id/status', orderController.updateOrderStatus)

module.exports = router