const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'why title empty '],
        default: 'Untitled'
    }
    ,
    description: {
        type: String,
        required: true
    },
    instructor: {
        type: String,
        required: true
    },
    videos: [{
        title: {
            type: String,
            required: true
        },

        videoUrl: {
            type: String,
            required: true
        },

        duration: {
            type: Number
        }
    }],
    category: {
        type: String
    },
    price: {
        type: Number,
        required: true
    }
})
module.exports = mongoose.model('Course', courseSchema)