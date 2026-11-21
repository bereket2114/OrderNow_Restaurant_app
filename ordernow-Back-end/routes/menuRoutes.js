const express = require('express')
const menuController = require('../controller/menuController')
const upload = require('../middleware/uploadMiddleware')
const { requireAdmin } = require('../middleware/adminAuth')
const { validateImageSignature } = require('../middleware/uploadMiddleware')

const router = express.Router()

router.get('/', menuController.getMenu)
router.get('/:id', menuController.getMore)
router.post('/', requireAdmin, upload.single('image'), validateImageSignature, menuController.createMenu)
router.put('/:id', requireAdmin, upload.single('image'), validateImageSignature, menuController.updateMenu)
router.delete('/:id', requireAdmin, menuController.deleteMenu)

module.exports = router
