const express = require('express')
require('dotenv').config()
const httpStatus = require('./utils/httpStatus')
const app = express()
const coursesRouter = require('./routes/courses.route')
const mongoose = require('mongoose')
const cors = require('cors')
const usersRouter = require('./routes/users.route')
const User = require('./models/users.model')



app.use(express.json())
const url = process.env.MONGO_URL;
mongoose.connect(url).then(async () => {
    console.log('connect with data base successfully')
    await User.init()
})

app.use(cors())
app.use('/api/courses', coursesRouter)
app.use('/api/users', usersRouter)

app.all('{*splat}', (req, res, next) => {
    next(new Error(`Can't find ${req.originalUrl} on this server`));
});

app.use((err, req, res, next) => {
    if (!err.statusCode) {
        return res.status(500).json({
            status: httpStatus.ERROR,
            message: err.message
        })
    }
    return res.status(err.statusCode).json({
        status: err.statusText || httpStatus.ERROR,
        data: {
            message: err.message
        }
    })
})


app.listen(process.env.PORT, () => {
    console.log("listen to port ", process.env.PORT)
})