const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    }
}, { timestamps: true })

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true })

module.exports = mongoose.model('Enrollment', enrollmentSchema)
