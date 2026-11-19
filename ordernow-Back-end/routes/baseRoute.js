const menuRoutes = require('./menuRoutes')
const orderRoutes = require('./orderRoutes')
const adminRoutes = require('./adminRoutes')
const express = require('express')
const app = express()

app.use('/api/menu', menuRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes) // <-- Add this

module.exports = app