const crypto = require('crypto')
const orderSchema = require('../model/orderSchema')
const menuSchema = require('../model/menuSchema')

module.exports = {
    // Staff Dashboard: Get orders (supports ?paymentStatus=Paid or ?orderStatus=Pending Kitchen)
    getOrder: async (req, res) => {
        try {
            const filter = {}
            if (req.query.paymentStatus) {
                filter.PaymentStatus = req.query.paymentStatus
            }
            if (req.query.orderStatus) {
                filter.OrderStatus = req.query.orderStatus
            }

            const orders = await orderSchema
                .find(filter)
                .populate('items.menuId', 'DishName Price ImageUrl prep_time_minutes')
                .sort({ orderedAt: 'desc' })
                .lean()

            return res.status(200).json({
                success: true,
                message: 'Orders received successfully',
                data: orders
            })
        } catch (error) {
            console.error(error)
            return res.status(404).json({ success: false, message: 'Orders not found' })
        }
    },

    // Customer Checkout: Create multi-item order & initialize Chapa payment
    createOrder: async (req, res) => {
        try {
            const {
                CustomerName,
                CustomerPhone,
                CustomerEmail,
                DeliveryAddress,
                Message,
                items
            } = req.body

            if (!CustomerName || !CustomerPhone) {
                return res.status(400).json({
                    success: false,
                    message: 'Customer name and phone number are required.'
                })
            }

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select at least one food item to order.'
                })
            }

            // Validate each selected food item & calculate authentic server-side total
            const validatedItems = []
            let calculatedTotal = 0

            for (const item of items) {
                const quantity = Number(item.Quantity)
                if (!item.menuId || !Number.isInteger(quantity) || quantity < 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Each selected dish must have a valid menuId and a Quantity of at least 1.'
                    })
                }

                const dish = await menuSchema.findById(item.menuId).lean()
                if (!dish) {
                    return res.status(404).json({
                        success: false,
                        message: `Menu item not found for ID: ${item.menuId}`
                    })
                }

                const subtotal = Number((dish.Price * quantity).toFixed(2))
                calculatedTotal = Number((calculatedTotal + subtotal).toFixed(2))

                validatedItems.push({
                    menuId: dish._id,
                    DishName: dish.DishName,
                    UnitPrice: dish.Price,
                    Quantity: quantity,
                    Subtotal: subtotal,
                    ImageUrl: dish.ImageUrl
                })
            }

            const tx_ref = `ORDERNOW-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'

            let chapaCheckoutUrl = `${frontendUrl}/payment-success?tx_ref=${tx_ref}`

            // If CHAPA_SECRET_KEY is configured, initialize real Chapa checkout session
            if (process.env.CHAPA_SECRET_KEY) {
                const [firstName, ...restName] = CustomerName.trim().split(' ')
                const lastName = restName.join(' ') || 'Customer'

                const chapaResponse = await fetch('https://api.chapa.co/v1/transaction/initialize', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: String(calculatedTotal),
                        currency: 'ETB',
                        email: CustomerEmail || 'customer@ordernow.com',
                        first_name: firstName,
                        last_name: lastName,
                        phone_number: CustomerPhone,
                        tx_ref,
                        callback_url: `${req.protocol}://${req.get('host')}/api/orders/verify/${tx_ref}`,
                        return_url: `${frontendUrl}/order-confirmation?tx_ref=${tx_ref}`,
                        customization: {
                            title: 'OrderNow Food Checkout',
                            description: `Order of ${validatedItems.length} dish(es)`
                        }
                    })
                })

                const chapaData = await chapaResponse.json()
                if (chapaData.status === 'success' && chapaData.data?.checkout_url) {
                    chapaCheckoutUrl = chapaData.data.checkout_url
                } else {
                    return res.status(400).json({
                        success: false,
                        message: chapaData.message || 'Failed to initialize Chapa payment.'
                    })
                }
            }

            const order = new orderSchema({
                CustomerName,
                CustomerPhone,
                CustomerEmail: CustomerEmail || 'customer@ordernow.com',
                DeliveryAddress: DeliveryAddress || 'Takeaway / Pickup',
                items: validatedItems,
                TotalAmount: calculatedTotal,
                Message,
                PaymentMethod: 'Chapa',
                PaymentStatus: 'Pending',
                tx_ref,
                chapaCheckoutUrl,
                OrderStatus: 'Awaiting Payment'
            })

            await order.save()

            return res.status(201).json({
                success: true,
                message: 'Order initialized. Proceed to Chapa payment.',
                checkout_url: chapaCheckoutUrl,
                tx_ref,
                data: order
            })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    },

    // Verify Chapa Payment & route paid order to the Staff Dashboard
    verifyOrderPayment: async (req, res) => {
        try {
            const { tx_ref } = req.params
            const order = await orderSchema.findOne({ tx_ref })

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order transaction not found.' })
            }

            if (order.PaymentStatus === 'Paid') {
                return res.status(200).json({
                    success: true,
                    message: 'Payment already verified.',
                    data: order
                })
            }

            let isPaymentSuccessful = false

            if (process.env.CHAPA_SECRET_KEY) {
                const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${tx_ref}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`
                    }
                })
                const verifyData = await verifyRes.json()
                isPaymentSuccessful = verifyData.status === 'success' && verifyData.data?.status === 'success'
            } else {
                // Local development fallback when CHAPA_SECRET_KEY is not yet set
                isPaymentSuccessful = true
            }

            if (isPaymentSuccessful) {
                order.PaymentStatus = 'Paid'
                order.OrderStatus = 'Pending Kitchen'
                await order.save()

                return res.status(200).json({
                    success: true,
                    message: 'Payment verified! Order sent to the Staff Kitchen Dashboard.',
                    data: order
                })
            } else {
                order.PaymentStatus = 'Failed'
                await order.save()

                return res.status(400).json({
                    success: false,
                    message: 'Payment verification failed or still pending.',
                    data: order
                })
            }
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    },

    // Staff Dashboard: Update order preparation status (Pending Kitchen -> Preparing -> Ready -> Completed)
    updateOrderStatus: async (req, res) => {
        try {
            const { id } = req.params
            const { OrderStatus } = req.body

            const validStatuses = ['Awaiting Payment', 'Pending Kitchen', 'Preparing', 'Ready', 'Completed', 'Cancelled']
            if (!validStatuses.includes(OrderStatus)) {
                return res.status(400).json({ success: false, message: 'Invalid order status.' })
            }

            const updatedOrder = await orderSchema.findByIdAndUpdate(
                id,
                { $set: { OrderStatus } },
                { new: true }
            )

            if (!updatedOrder) {
                return res.status(404).json({ success: false, message: 'Order not found.' })
            }

            return res.status(200).json({
                success: true,
                message: `Order status updated to ${OrderStatus}`,
                data: updatedOrder
            })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    }
}