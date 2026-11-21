const express = require('express')
const menuRoutes = require('./menuRoutes')
const orderRoutes = require('./orderRoutes')
const adminRoutes = require('./adminRoutes')

const router = express.Router()
router.use('/api/menu', menuRoutes)
router.use('/api/orders', orderRoutes)
router.use('/api/admin', adminRoutes)

module.exports = router
