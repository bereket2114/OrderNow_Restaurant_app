require('dotenv').config()

const express = require('express')
const app = express()
const connectDB = require('./config/database')
const cors =  require('cors')
const mongoose = require('mongoose')
const baseRoute = require('./routes/baseRoute')

connectDB()

app.use(cors())
app.use('views', express.static('views'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/', baseRoute)


const PORT =  process.env.PORT || 5000
app.listen(PORT, ()=> {
    console.log(`Server is running on port ${PORT}`)
})