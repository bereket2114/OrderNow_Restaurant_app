const menuSchema = require('../model/menuSchema')
const cloudinary = require('../config/cloudinary')

// Helper to upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: 'OrderNow_Menus', resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error)
                resolve(result)
            }
        )
        stream.end(fileBuffer)
    })
}

// Helper to normalize Ingredients from form-data or JSON
const parseIngredients = (ingredientsInput) => {
    if (!ingredientsInput) return []
    if (Array.isArray(ingredientsInput)) {
        return ingredientsInput.map(i => String(i).trim()).filter(Boolean)
    }
    if (typeof ingredientsInput === 'string') {
        try {
            const parsed = JSON.parse(ingredientsInput)
            if (Array.isArray(parsed)) return parsed.map(i => String(i).trim()).filter(Boolean)
        } catch (_) {
            // Fallback to comma-separated string
        }
        return ingredientsInput.split(',').map(i => i.trim()).filter(Boolean)
    }
    return []
}

module.exports = {
    getMenu: async (req, res) => {
        try {
            const menus = await menuSchema
                .find()
                .select('DishName Price Category ImageUrl prep_time_minutes Ingredients IsAvailable postedAt')
                .sort({ DishName: 'asc' })
                .lean()

            return res.status(200).json({
                success: true,
                data: menus,
                message: 'Menu received successfully.'
            })
        } catch (error) {
            console.error(error)
            return res.status(404).json({ success: false, message: 'Menu not found' })
        }
    },

    getMore: async (req, res) => {
        try {
            const id = req.params.id
            const more = await menuSchema.findById(id)

            if (!more) {
                return res.status(404).json({ success: false, message: 'Menu item not found' })
            }

            return res.status(200).json({ success: true, data: more })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    },

    createMenu: async (req, res) => {
        try {
            const { DishName, Price, Category, Ingredients, prep_time_minutes } = req.body
            const parsedIngredients = parseIngredients(Ingredients)
            const numericPrice = Number(Price)
            const numericPrepTime = Number(prep_time_minutes)

            const requiredFields = {
                'dish name': DishName,
                'price': Price,
                'ingredients': parsedIngredients.length > 0 ? parsedIngredients : null,
                'prep_time': prep_time_minutes
            }

            for (const [fieldName, value] of Object.entries(requiredFields)) {
                if (!value) {
                    return res.status(400).json({ success: false, message: `The ${fieldName} cannot be empty.` })
                }
            }

            if (numericPrepTime < 1 || numericPrepTime > 240) {
                return res.status(400).json({
                    success: false,
                    message: 'Preparation time must be at least 1 minute and cannot exceed 4 hours (240 minutes).'
                })
            }

            let imageUrl = req.body.ImageUrl
            let imagePublicId = ''

            if (req.file) {
                const uploadResult = await uploadToCloudinary(req.file.buffer)
                imageUrl = uploadResult.secure_url
                imagePublicId = uploadResult.public_id
            }

            if (!imageUrl) {
                return res.status(400).json({
                    success: false,
                    message: 'Please upload a food image or provide an ImageUrl.'
                })
            }

            const menu = new menuSchema({
                DishName,
                Price: numericPrice,
                Category: Category || 'Signature Dishes',
                ImageUrl: imageUrl,
                ImagePublicId: imagePublicId,
                prep_time_minutes: numericPrepTime,
                Ingredients: parsedIngredients
            })

            await menu.save()

            return res.status(201).json({
                success: true,
                message: 'Menu created successfully',
                data: menu
            })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    },

    updateMenu: async (req, res) => {
        try {
            const { id } = req.params
            const { DishName, Price, Category, Ingredients, prep_time_minutes, IsAvailable } = req.body

            const existingMenu = await menuSchema.findById(id)
            if (!existingMenu) {
                return res.status(404).json({ success: false, message: 'Menu item not found' })
            }

            const updateFields = {}
            if (DishName !== undefined) updateFields.DishName = DishName
            if (Price !== undefined) updateFields.Price = Number(Price)
            if (Category !== undefined) updateFields.Category = Category
            if (prep_time_minutes !== undefined) updateFields.prep_time_minutes = Number(prep_time_minutes)
            if (Ingredients !== undefined) updateFields.Ingredients = parseIngredients(Ingredients)
            if (IsAvailable !== undefined) updateFields.IsAvailable = IsAvailable === 'true' || IsAvailable === true

            if (req.file) {
                if (existingMenu.ImagePublicId) {
                    await cloudinary.uploader.destroy(existingMenu.ImagePublicId).catch(() => {})
                }
                const uploadResult = await uploadToCloudinary(req.file.buffer)
                updateFields.ImageUrl = uploadResult.secure_url
                updateFields.ImagePublicId = uploadResult.public_id
            } else if (req.body.ImageUrl) {
                updateFields.ImageUrl = req.body.ImageUrl
            }

            const updatedMenu = await menuSchema.findByIdAndUpdate(
                id,
                { $set: updateFields },
                { new: true, runValidators: true }
            )

            return res.status(200).json({
                success: true,
                message: 'Menu updated successfully',
                data: updatedMenu
            })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    },

    deleteMenu: async (req, res) => {
        try {
            const { id } = req.params
            const deletedMenu = await menuSchema.findByIdAndDelete(id)

            if (!deletedMenu) {
                return res.status(404).json({ success: false, message: 'Menu item not found' })
            }

            if (deletedMenu.ImagePublicId) {
                await cloudinary.uploader.destroy(deletedMenu.ImagePublicId).catch(() => {})
            }

            return res.status(200).json({ success: true, message: 'Menu deleted successfully' })
        } catch (error) {
            console.error(error)
            return res.status(500).json({ success: false, message: 'Internal server error' })
        }
    }
}