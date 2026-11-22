const crypto = require('crypto')
const mongoose = require('mongoose')
const Order = require('../model/orderSchema')
const Menu = require('../model/menuSchema')
const trustedMenuCatalog = require('../config/trustedMenuCatalog')
const { CURRENCY, roundMoney, normalizeChapaBaseUrl, isChapaPaymentVerified, isChapaPaymentFailed } = require('../utils/chapaPayment')

const CHAPA_BASE_URL = normalizeChapaBaseUrl(process.env.CHAPA_URL)
const FRONTEND_URL = (process.env.FRONTEND_URL || '').replace(/\/+$/, '')

function getPublicPaymentResult(order) {
    // Do not expose customer name, address, phone, email, or item details from this public endpoint.
    return {
        tx_ref: order.tx_ref,
        PaymentStatus: order.PaymentStatus,
        OrderStatus: order.OrderStatus,
        TotalAmount: order.TotalAmount,
        currency: CURRENCY
    }
}

function safeBackendCallbackUrl() {
    const configured = (process.env.BACKEND_URL || '').replace(/\/+$/, '')
    if (!configured) return null
    try {
        const url = new URL(configured)
        // Chapa must be able to reach this public callback; local-only URLs are not useful to Chapa.
        if (url.protocol !== 'https:') return null
        return `${url.origin}/api/orders/chapa/callback`
    } catch (_) {
        return null
    }
}

function safeFrontendUrl() {
    try {
        const url = new URL(FRONTEND_URL)
        if (url.protocol !== 'https:' && url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
            return null
        }
        return url.origin
    } catch (_) {
        return null
    }
}

module.exports = {
    // Staff dashboard: this controller is mounted behind requireAdmin.
    getOrder: async (req, res) => {
        try {
            // Only verified, paid orders are visible to the kitchen dashboard.
            const filter = { PaymentStatus: 'Paid' }
            const orderStatuses = ['Awaiting Payment', 'Pending Kitchen', 'Preparing', 'Ready', 'Completed', 'Cancelled']

            if (req.query.paymentStatus && req.query.paymentStatus !== 'Paid') {
                return res.status(400).json({ success: false, message: 'The kitchen queue only supports verified paid orders.' })
            }
            if (req.query.orderStatus) {
                if (!orderStatuses.includes(req.query.orderStatus)) {
                    return res.status(400).json({ success: false, message: 'Invalid order status filter.' })
                }
                filter.OrderStatus = req.query.orderStatus
            }

            const orders = await Order.find(filter)
                .populate('items.menuId', 'DishName Price ImageUrl prep_time_minutes')
                .sort({ orderedAt: -1 })
                .limit(500)
                .lean()

            return res.status(200).json({
                success: true,
                message: 'Orders received successfully.',
                data: orders
            })
        } catch (error) {
            console.error('Could not retrieve orders:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to retrieve orders.' })
        }
    },

    // Public checkout: all prices and order totals are recalculated from trusted server catalog data.
    createOrder: async (req, res) => {
        try {
            if (!process.env.CHAPA_SECRET_KEY) {
                return res.status(503).json({
                    success: false,
                    message: 'Online payment is temporarily unavailable. Please contact the restaurant.'
                })
            }

            const frontendOrigin = safeFrontendUrl()
            if (!frontendOrigin) {
                return res.status(503).json({
                    success: false,
                    message: 'Checkout is not configured. Please contact the restaurant.'
                })
            }

            const body = req.body || {}
            const CustomerName = typeof body.CustomerName === 'string' ? body.CustomerName.trim() : ''
            const CustomerPhone = typeof body.CustomerPhone === 'string' ? body.CustomerPhone.trim() : ''
            const CustomerEmail = typeof body.CustomerEmail === 'string' ? body.CustomerEmail.trim().toLowerCase() : ''
            const Message = typeof body.Message === 'string' ? body.Message.trim() : ''
            const ServiceType = body.ServiceType
            const TableNumber = typeof body.TableNumber === 'string' ? body.TableNumber.trim() : ''
            const DeliveryAddress = typeof body.DeliveryAddress === 'string' ? body.DeliveryAddress.trim() : ''
            const requestedItems = body.items

            if (CustomerName.length < 2 || CustomerName.length > 100) {
                return res.status(400).json({ success: false, message: 'Enter a valid customer name (2–100 characters).' })
            }
            if (!['Dine-In', 'Takeaway', 'Delivery'].includes(ServiceType)) {
                return res.status(400).json({ success: false, message: 'Select a valid service type.' })
            }
            if ((ServiceType === 'Takeaway' || ServiceType === 'Delivery') && !CustomerPhone) {
                return res.status(400).json({ success: false, message: 'A contact phone number is required for takeaway and delivery orders.' })
            }
            if (CustomerPhone && (!/^\+?[0-9()\s-]{7,30}$/.test(CustomerPhone))) {
                return res.status(400).json({ success: false, message: 'Enter a valid phone number.' })
            }
            if (CustomerEmail && (CustomerEmail.length > 50 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CustomerEmail))) {
                return res.status(400).json({ success: false, message: 'Enter a valid email address (50 characters or fewer).' })
            }
            if (Message.length > 500) {
                return res.status(400).json({ success: false, message: 'Order notes must be 500 characters or fewer.' })
            }
            if (ServiceType === 'Dine-In' && (!/^\d{1,3}$/.test(TableNumber) || Number(TableNumber) < 1 || Number(TableNumber) > 200)) {
                return res.status(400).json({ success: false, message: 'Select a valid dine-in table number.' })
            }
            if (ServiceType === 'Delivery' && (DeliveryAddress.length < 5 || DeliveryAddress.length > 300)) {
                return res.status(400).json({ success: false, message: 'Enter a valid delivery address.' })
            }
            if (!Array.isArray(requestedItems) || requestedItems.length < 1 || requestedItems.length > 30) {
                return res.status(400).json({ success: false, message: 'An order must contain between 1 and 30 items.' })
            }

            const validatedItems = []
            let calculatedTotal = 0

            for (const item of requestedItems) {
                const menuId = typeof item.menuId === 'string' ? item.menuId : ''
                const quantity = Number(item.Quantity)
                if (!menuId || !Number.isInteger(quantity) || quantity < 1 || quantity > 50) {
                    return res.status(400).json({ success: false, message: 'Each item must have a valid menu item and quantity (1–50).' })
                }

                const catalogItem = trustedMenuCatalog.get(menuId)
                let orderItem

                if (catalogItem) {
                    const subtotal = roundMoney(catalogItem.Price * quantity)
                    orderItem = {
                        menuId: null,
                        catalogId: catalogItem.id,
                        DishName: catalogItem.DishName,
                        UnitPrice: catalogItem.Price,
                        Quantity: quantity,
                        Subtotal: subtotal,
                        ImageUrl: catalogItem.ImageUrl
                    }
                } else {
                    if (!mongoose.isValidObjectId(menuId)) {
                        return res.status(400).json({ success: false, message: 'One of the selected menu items is invalid.' })
                    }
                    const dish = await Menu.findById(menuId).lean()
                    if (!dish || dish.IsAvailable === false) {
                        return res.status(404).json({ success: false, message: 'One of the selected menu items is unavailable.' })
                    }
                    const subtotal = roundMoney(dish.Price * quantity)
                    orderItem = {
                        menuId: dish._id,
                        catalogId: null,
                        DishName: dish.DishName,
                        UnitPrice: dish.Price,
                        Quantity: quantity,
                        Subtotal: subtotal,
                        ImageUrl: dish.ImageUrl
                    }
                }

                calculatedTotal = roundMoney(calculatedTotal + orderItem.Subtotal)
                validatedItems.push(orderItem)
            }

            if (!Number.isFinite(calculatedTotal) || calculatedTotal <= 0 || calculatedTotal > 9_999_999.99) {
                return res.status(400).json({ success: false, message: 'The calculated order total is outside the supported range.' })
            }

            // A long random reference prevents practical guessing and is generated only by the server.
            const tx_ref = `ORDN-${crypto.randomBytes(16).toString('hex').toUpperCase()}`
            const [firstName, ...restName] = CustomerName.split(/\s+/)
            const lastName = restName.join(' ') || 'Customer'
            if (firstName.length > 35 || lastName.length > 35) {
                return res.status(400).json({ success: false, message: 'Please use a name that fits Chapa’s 35-character first/last name limits.' })
            }
            const returnUrl = `${frontendOrigin}/?tx_ref=${encodeURIComponent(tx_ref)}`
            const callbackUrl = safeBackendCallbackUrl()
            const phoneDigits = CustomerPhone.replace(/\D/g, '')
            const chapaPhone = /^0[79]\d{8}$/.test(phoneDigits)
                ? phoneDigits
                : /^(251)?[79]\d{8}$/.test(phoneDigits)
                    ? `0${phoneDigits.slice(-9)}`
                    : null

            const chapaResponse = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: calculatedTotal.toFixed(2),
                    currency: CURRENCY,
                    ...(CustomerEmail ? { email: CustomerEmail } : {}),
                    first_name: firstName,
                    last_name: lastName,
                    ...(chapaPhone ? { phone_number: chapaPhone } : {}),
                    tx_ref,
                    return_url: returnUrl,
                    ...(callbackUrl ? { callback_url: callbackUrl } : {}),
                    customization: {
                        title: 'OrderNow Food Checkout',
                        description: `Order of ${validatedItems.length} item(s)`
                    }
                }),
                signal: AbortSignal.timeout(15_000)
            })

            let chapaData
            try {
                chapaData = await chapaResponse.json()
            } catch (_) {
                chapaData = null
            }

            const checkoutUrl = chapaData?.data?.checkout_url
            let safeCheckoutUrl = null
            try {
                const parsedCheckoutUrl = new URL(checkoutUrl)
                if (parsedCheckoutUrl.protocol === 'https:' && parsedCheckoutUrl.hostname === 'checkout.chapa.co') {
                    safeCheckoutUrl = parsedCheckoutUrl.toString()
                }
            } catch (_) {}

            if (!chapaResponse.ok || chapaData?.status !== 'success' || !safeCheckoutUrl) {
                console.error('Chapa initialization was rejected:', chapaData?.message || `HTTP ${chapaResponse.status}`)
                return res.status(502).json({
                    success: false,
                    message: 'The payment provider could not initialize checkout. No order was confirmed; please try again.'
                })
            }

            const order = new Order({
                CustomerName,
                CustomerPhone,
                CustomerEmail,
                ServiceType,
                TableNumber: ServiceType === 'Dine-In' ? TableNumber : '',
                DeliveryAddress: ServiceType === 'Delivery'
                    ? DeliveryAddress
                    : ServiceType === 'Dine-In'
                        ? `Dine-In • Table ${TableNumber}`
                        : 'Takeaway / Counter Pickup',
                items: validatedItems,
                TotalAmount: calculatedTotal,
                Message,
                PaymentMethod: 'Chapa',
                PaymentStatus: 'Pending',
                tx_ref,
                chapaCheckoutUrl: safeCheckoutUrl,
                OrderStatus: 'Awaiting Payment'
            })

            await order.save()

            return res.status(201).json({
                success: true,
                message: 'Order created. Continue to the secure Chapa checkout page.',
                checkout_url: safeCheckoutUrl,
                tx_ref,
                data: order
            })
        } catch (error) {
            if (error.name === 'TimeoutError' || error.name === 'AbortError') {
                return res.status(504).json({ success: false, message: 'The payment provider did not respond in time. Please try again.' })
            }
            console.error('Order creation failed:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to create the order. Please try again.' })
        }
    },

    // Public return handler: verify with Chapa server-to-server and return payment state only.
    verifyOrderPayment: async (req, res) => {
        try {
            const { tx_ref } = req.params
            if (typeof tx_ref !== 'string' || !/^ORDN-[A-F0-9]{32}$/.test(tx_ref)) {
                return res.status(400).json({ success: false, verified: false, message: 'Invalid transaction reference.' })
            }

            const order = await Order.findOne({ tx_ref })
            if (!order) {
                return res.status(404).json({ success: false, verified: false, message: 'Order transaction not found.' })
            }

            if (order.PaymentStatus === 'Paid') {
                return res.status(200).json({
                    success: true,
                    verified: true,
                    data: getPublicPaymentResult(order)
                })
            }

            if (!process.env.CHAPA_SECRET_KEY) {
                return res.status(503).json({
                    success: false,
                    verified: false,
                    message: 'Payment verification is not configured.'
                })
            }

            const verifyResponse = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${encodeURIComponent(tx_ref)}`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
                signal: AbortSignal.timeout(15_000)
            })

            let verifyData
            try {
                verifyData = await verifyResponse.json()
            } catch (_) {
                verifyData = null
            }

            const payment = verifyData?.data
            const isSuccessful = isChapaPaymentVerified(verifyResponse.ok, verifyData, order)

            if (!isSuccessful) {
                // A network/API response or an unfinished payment is not proof of failure or success.
                // Keep it pending so a customer can retry verification without false fulfilment.
                const verifiedFailed = isChapaPaymentFailed(verifyResponse.ok, verifyData, tx_ref)

                if (verifiedFailed) {
                    await Order.updateOne(
                        { _id: order._id, PaymentStatus: { $in: ['Pending', 'Failed'] } },
                        { $set: { PaymentStatus: 'Failed' } }
                    )
                }

                const currentOrder = await Order.findById(order._id).lean()
                return res.status(202).json({
                    success: false,
                    verified: false,
                    message: verifiedFailed ? 'Chapa reports that this payment failed.' : 'Payment is not yet verified. It remains pending.',
                    data: getPublicPaymentResult(currentOrder || order)
                })
            }

            // Atomic transition prevents concurrent verification requests from moving the order twice.
            const updatedOrder = await Order.findOneAndUpdate(
                { _id: order._id, PaymentStatus: { $in: ['Pending', 'Failed'] } },
                {
                    $set: {
                        PaymentStatus: 'Paid',
                        OrderStatus: order.OrderStatus === 'Awaiting Payment' ? 'Pending Kitchen' : order.OrderStatus,
                        chapaReference: String(payment.reference || '')
                    }
                },
                { new: true }
            )

            const finalOrder = updatedOrder || await Order.findById(order._id)
            const verified = finalOrder?.PaymentStatus === 'Paid'

            return res.status(verified ? 200 : 409).json({
                success: verified,
                verified,
                message: verified ? 'Payment successfully verified.' : 'Payment could not be confirmed. Please retry verification.',
                data: finalOrder ? getPublicPaymentResult(finalOrder) : null
            })
        } catch (error) {
            if (error.name === 'TimeoutError' || error.name === 'AbortError') {
                return res.status(202).json({ success: false, verified: false, message: 'Payment verification timed out. The order remains pending.' })
            }
            console.error('Payment verification failed:', error.message)
            return res.status(500).json({ success: false, verified: false, message: 'Unable to verify payment right now.' })
        }
    },

    // Staff-only kitchen status management. Payment status can never be changed through this route.
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params
            const { OrderStatus } = req.body || {}
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ success: false, message: 'Invalid order ID.' })
            }

            const order = await Order.findById(id)
            if (!order) return res.status(404).json({ success: false, message: 'Order not found.' })
            if (order.PaymentStatus !== 'Paid') {
                return res.status(409).json({ success: false, message: 'Only verified paid orders can enter the kitchen workflow.' })
            }

            const allowedTransitions = {
                'Pending Kitchen': ['Preparing', 'Cancelled'],
                'Preparing': ['Ready', 'Cancelled'],
                'Ready': ['Completed', 'Cancelled'],
                'Completed': [],
                'Cancelled': [],
                'Awaiting Payment': []
            }

            if (!allowedTransitions[order.OrderStatus]?.includes(OrderStatus)) {
                return res.status(400).json({ success: false, message: 'That order-status transition is not allowed.' })
            }

            order.OrderStatus = OrderStatus
            await order.save()

            return res.status(200).json({
                success: true,
                message: `Order status updated to ${OrderStatus}.`,
                data: order
            })
        } catch (error) {
            console.error('Order status update failed:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to update order status.' })
        }
    }
}
