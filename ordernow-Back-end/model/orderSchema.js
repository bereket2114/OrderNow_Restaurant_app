const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
    menuId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'restaurantMenus',
        required: false,
        default: null
    },
    catalogId: {
        type: String,
        trim: true,
        default: null
    },
    DishName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120
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
        min: [1, 'Quantity must be at least 1'],
        max: 50,
        validate: Number.isInteger
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
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    CustomerPhone: {
        type: String,
        trim: true,
        default: '',
        maxlength: 30
    },
    CustomerEmail: {
        type: String,
        trim: true,
        lowercase: true,
        default: '',
        maxlength: 254
    },
    ServiceType: {
        type: String,
        enum: ['Dine-In', 'Takeaway', 'Delivery'],
        default: 'Dine-In'
    },
    TableNumber: {
        type: String,
        trim: true,
        maxlength: 10,
        default: ''
    },
    DeliveryAddress: {
        type: String,
        trim: true,
        default: 'Takeaway / Pickup',
        maxlength: 300
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: (arr) => Array.isArray(arr) && arr.length > 0 && arr.length <= 30,
            message: 'Order must contain between 1 and 30 food items.'
        }
    },
    TotalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    Message: {
        type: String,
        trim: true,
        maxlength: 500
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
        required: true,
        index: true
    },
    chapaCheckoutUrl: {
        type: String
    },
    chapaReference: {
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
