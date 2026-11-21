const multer = require('multer')

const storage = multer.memoryStorage()
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        return cb(null, true)
    }
    return cb(new Error('Unsupported image format or file content does not match its MIME type.'), false)
}

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
        fields: 20,
        parts: 22
    },
    fileFilter
})

function validateImageSignature(req, res, next) {
    if (!req.file) return next()

    const buffer = req.file.buffer
    const isJpeg = buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    const isPng = buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    const isWebp = buffer.length >= 12 && buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP'

    const signatureMatchesMime =
        ((req.file.mimetype === 'image/jpeg' || req.file.mimetype === 'image/jpg') && isJpeg) ||
        (req.file.mimetype === 'image/png' && isPng) ||
        (req.file.mimetype === 'image/webp' && isWebp)

    if (!signatureMatchesMime) {
        return res.status(400).json({
            success: false,
            message: 'Unsupported image format or file content does not match its MIME type.'
        })
    }

    return next()
}

module.exports = upload
module.exports.validateImageSignature = validateImageSignature
