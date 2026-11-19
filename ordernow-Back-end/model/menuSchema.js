const mongoose = require('mongoose')

const menuSchema = new mongoose.Schema({
    DishName: {
        type: String,
        required: true,
        trim: true
    },
    Price: {
        type: Number,
        required: true,
        min: 0
    },
    ImageUrl: {
        type: String,
        required: [true, 'Food image is required'],
        trim: true
    },
    ImagePublicId: {
        type: String,
        trim: true
    },
    prep_time_minutes: {
        type: Number,
        required: true,
        default: 15,
        min: [ 1, 'Preparation time must be at least 1 minute'],
        max: [ 240, 'Preparation time cannot exceed 4 hours'],
        validate: {
            validator: Number.isInteger,
            message: `{VALUE} is not a whole number`
        }
    },
    Ingredients: {
        type: [String],
        required: true,
        trim: true,
    },
    postedAt: {
        type: Date,
        default: Date.now
    }
})

const Menu = mongoose.model('restaurantMenus', menuSchema)
module.exports = Menu