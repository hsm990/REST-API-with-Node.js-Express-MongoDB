const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'why title empty '],
        default: 'Untitled'
    }
    ,
    price: {
        type: Number,
        required: true
    }
})
module.exports = mongoose.model('Course', courseSchema)