const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurantMenus',
        required: true
    },
    DishName: {
        type: String,
        required: true,
        trim: true
    },
    UnitPrice: {
        type: Number,
        required: true,
        min: 0
    },
    Quantity: {
        type: Number,
        required: true,
        default: 1,
        min: [1, 'Quantity must be at least 1']
    },
    Subtotal: {
        type: Number,
        required: true,
        min: 0
    },
    ImageUrl: {
        type: String,
        trim: true
    }
}, { _id: false })

const orderSchema = new mongoose.Schema({
    CustomerName: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true
    },
    CustomerPhone: {
        type: String,
        required: [true, 'Customer phone number is required'],
        trim: true
    },
    CustomerEmail: {
        type: String,
        trim: true,
        default: 'customer@ordernow.com'
    },
    DeliveryAddress: {
        type: String,
        trim: true,
        default: 'Takeaway / Pickup'
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length > 0,
            message: 'Order must contain at least one food item.'
        }
    },
    TotalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    Message: {
        type: String,
        trim: true
    },
    PaymentMethod: {
        type: String,
        enum: ['Chapa'],
        default: 'Chapa'
    },
    PaymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed'],
        default: 'Pending'
    },
    tx_ref: {
        type: String,
        unique: true,
        required: true
    },
    chapaCheckoutUrl: {
        type: String
    },
    OrderStatus: {
        type: String,
        enum: ['Awaiting Payment', 'Pending Kitchen', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
        default: 'Awaiting Payment'
    },
    orderedAt: {
        type: Date,
        default: Date.now
    }
})

const Order = mongoose.model('OrderFoods', orderSchema)
module.exports = Order