const mongoose = require('mongoose')

const connectDB = async ()=> {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB connected successfully on ${mongoose.connection.host}:${mongoose.connection.port}`)
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
        process.exit(1)
    }
}

module.exports = connectDB