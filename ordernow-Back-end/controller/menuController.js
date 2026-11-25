const mongoose = require('mongoose')
const menuSchema = require('../model/menuSchema')
const cloudinary = require('../config/cloudinary')

const uploadToCloudinary = (fileBuffer) => new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
        { folder: 'OrderNow_Menus', resource_type: 'image' },
        (error, result) => {
            if (error) return reject(error)
            return resolve(result)
        }
    )
    stream.end(fileBuffer)
})

const parseIngredients = (input) => {
    if (Array.isArray(input)) return input.map((item) => String(item).trim()).filter(Boolean)
    if (typeof input !== 'string' || !input.trim()) return []

    try {
        const parsed = JSON.parse(input)
        if (Array.isArray(parsed)) return parsed.map((item) => String(item).trim()).filter(Boolean)
    } catch (_) {
        // Treat non-JSON values as a comma-separated list.
    }
    return input.split(',').map((item) => item.trim()).filter(Boolean)
}

function isHttpsUrl(value) {
    try {
        return new URL(value).protocol === 'https:'
    } catch (_) {
        return false
    }
}

function validateMenuFields({ DishName, Price, Category, prep_time_minutes, Ingredients }) {
    const numericPrice = Number(Price)
    const numericPrepTime = Number(prep_time_minutes)
    const parsedIngredients = parseIngredients(Ingredients)

    if (typeof DishName !== 'string' || DishName.trim().length < 2 || DishName.trim().length > 120) {
        return { error: 'Dish name must contain between 2 and 120 characters.' }
    }
    if (!Number.isFinite(numericPrice) || numericPrice <= 0 || numericPrice > 1_000_000) {
        return { error: 'Enter a valid price greater than zero.' }
    }
    if (Category !== undefined && (typeof Category !== 'string' || Category.trim().length > 80)) {
        return { error: 'Category must contain no more than 80 characters.' }
    }
    if (!Number.isInteger(numericPrepTime) || numericPrepTime < 1 || numericPrepTime > 240) {
        return { error: 'Preparation time must be a whole number between 1 and 240 minutes.' }
    }
    if (parsedIngredients.length < 1 || parsedIngredients.length > 30 || parsedIngredients.some((item) => item.length > 80)) {
        return { error: 'Provide between 1 and 30 ingredients, each no longer than 80 characters.' }
    }

    return { numericPrice, numericPrepTime, parsedIngredients }
}

module.exports = {
    getMenu: async (req, res) => {
        try {
            const menus = await menuSchema.find({ IsAvailable: true, IsDeleted: { $ne: true } })
                .select('DishName Price Category ImageUrl prep_time_minutes Ingredients IsAvailable IsDeleted postedAt')
                .sort({ DishName: 1 })
                .lean()
            return res.status(200).json({ success: true, data: menus, message: 'Menu received successfully.' })
        } catch (error) {
            console.error('Menu retrieval failed:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to retrieve the menu.' })
        }
    },

    getMore: async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id)) {
                return res.status(400).json({ success: false, message: 'Invalid menu item ID.' })
            }
            const menu = await menuSchema.findOne({ _id: req.params.id, IsAvailable: true, IsDeleted: { $ne: true } }).lean()
            if (!menu) return res.status(404).json({ success: false, message: 'Menu item not found.' })
            return res.status(200).json({ success: true, data: menu })
        } catch (error) {
            console.error('Menu item retrieval failed:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to retrieve the menu item.' })
        }
    },

    createMenu: async (req, res) => {
        try {
            const { DishName, Price, Category, Ingredients, prep_time_minutes } = req.body || {}
            const validation = validateMenuFields({ DishName, Price, Category, Ingredients, prep_time_minutes })
            if (validation.error) return res.status(400).json({ success: false, message: validation.error })

            let ImageUrl = ''
            let ImagePublicId = ''
            if (req.file) {
                if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                    return res.status(503).json({ success: false, message: 'Image upload is not configured.' })
                }
                const uploaded = await uploadToCloudinary(req.file.buffer)
                ImageUrl = uploaded.secure_url
                ImagePublicId = uploaded.public_id
            } else if (typeof req.body.ImageUrl === 'string' && isHttpsUrl(req.body.ImageUrl.trim())) {
                ImageUrl = req.body.ImageUrl.trim()
            }

            if (!ImageUrl) {
                return res.status(400).json({ success: false, message: 'Upload a food image or provide a valid HTTPS image URL.' })
            }

            const menu = await menuSchema.create({
                DishName: DishName.trim(),
                Price: validation.numericPrice,
                Category: (Category || 'Signature Dishes').trim(),
                ImageUrl,
                ImagePublicId,
                prep_time_minutes: validation.numericPrepTime,
                Ingredients: validation.parsedIngredients,
                IsAvailable: true,
                IsDeleted: false,
                deletedAt: null
            })

            return res.status(201).json({ success: true, message: 'Menu created successfully.', data: menu })
        } catch (error) {
            console.error('Menu creation failed:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to create the menu item.' })
        }
    },

    updateMenu: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: 'Invalid menu item ID.' })

            const existingMenu = await menuSchema.findOne({ _id: id, IsDeleted: { $ne: true } })
            if (!existingMenu) return res.status(404).json({ success: false, message: 'Menu item not found.' })

            const body = req.body || {}
            const updateFields = {}

            if (body.DishName !== undefined) {
                if (typeof body.DishName !== 'string' || body.DishName.trim().length < 2 || body.DishName.trim().length > 120) {
                    return res.status(400).json({ success: false, message: 'Dish name must contain between 2 and 120 characters.' })
                }
                updateFields.DishName = body.DishName.trim()
            }
            if (body.Price !== undefined) {
                const value = Number(body.Price)
                if (!Number.isFinite(value) || value <= 0 || value > 1_000_000) return res.status(400).json({ success: false, message: 'Enter a valid price greater than zero.' })
                updateFields.Price = value
            }
            if (body.Category !== undefined) {
                if (typeof body.Category !== 'string' || body.Category.trim().length > 80) return res.status(400).json({ success: false, message: 'Invalid category.' })
                updateFields.Category = body.Category.trim()
            }
            if (body.prep_time_minutes !== undefined) {
                const value = Number(body.prep_time_minutes)
                if (!Number.isInteger(value) || value < 1 || value > 240) return res.status(400).json({ success: false, message: 'Preparation time must be between 1 and 240 minutes.' })
                updateFields.prep_time_minutes = value
            }
            if (body.Ingredients !== undefined) {
                const ingredients = parseIngredients(body.Ingredients)
                if (ingredients.length < 1 || ingredients.length > 30 || ingredients.some((item) => item.length > 80)) return res.status(400).json({ success: false, message: 'Provide between 1 and 30 valid ingredients.' })
                updateFields.Ingredients = ingredients
            }
            if (body.IsAvailable !== undefined) {
                if (![true, false, 'true', 'false'].includes(body.IsAvailable)) return res.status(400).json({ success: false, message: 'Invalid availability value.' })
                updateFields.IsAvailable = body.IsAvailable === true || body.IsAvailable === 'true'
            }

            if (req.file) {
                if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
                    return res.status(503).json({ success: false, message: 'Image upload is not configured.' })
                }
                const uploaded = await uploadToCloudinary(req.file.buffer)
                updateFields.ImageUrl = uploaded.secure_url
                updateFields.ImagePublicId = uploaded.public_id
                if (existingMenu.ImagePublicId) {
                    await cloudinary.uploader.destroy(existingMenu.ImagePublicId).catch((error) => {
                        console.warn('Could not delete old Cloudinary image:', error.message)
                    })
                }
            } else if (body.ImageUrl !== undefined) {
                if (typeof body.ImageUrl !== 'string' || !isHttpsUrl(body.ImageUrl.trim())) return res.status(400).json({ success: false, message: 'Image URL must use HTTPS.' })
                updateFields.ImageUrl = body.ImageUrl.trim()
            }

            const updatedMenu = await menuSchema.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { new: true, runValidators: true }
            )
            return res.status(200).json({ success: true, message: 'Menu updated successfully.', data: updatedMenu })
        } catch (error) {
            console.error('Menu update failed:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to update the menu item.' })
        }
    },

    deleteMenu: async (req, res) => {
        try {
            const { id } = req.params
            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({ success: false, message: 'Invalid menu item ID.' })
            }

            // Soft-delete: the item disappears from public menu APIs immediately but can be recovered.
            const deletedMenu = await menuSchema.findOneAndUpdate(
                { _id: id, IsDeleted: { $ne: true } },
                { $set: { IsAvailable: false, IsDeleted: true, deletedAt: new Date() } },
                { new: true }
            )

            if (!deletedMenu) {
                return res.status(404).json({ success: false, message: 'Active menu item not found.' })
            }

            return res.status(200).json({ success: true, message: 'Menu item removed from the public menu.' })
        } catch (error) {
            console.error('Menu deletion failed:', error.message)
            return res.status(500).json({ success: false, message: 'Unable to delete the menu item.' })
        }
    }
}
