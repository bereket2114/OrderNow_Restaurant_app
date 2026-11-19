const menuController = require('../controller/menuController')
const upload = require('../middleware/uploadMiddleware')
const express = require('express')
const router = express.Router()

router.post('/', upload.single('image'), menuController.createMenu)
router.get('/', menuController.getMenu)
router.get('/:id', menuController.getMore)
router.put('/:id', upload.single('image'), menuController.updateMenu)
router.delete('/:id', menuController.deleteMenu)

module.exports = router