const mongoose = require('mongoose')
const { type } = require('node:os')
const validator = require('validator')
const usersRole = require('../utils/users.role')
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3
    },
    lastName: {
        type: String,
        required: true,
        minLength: 3,
        default: "della"
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [validator.isEmail, 'field maust be a valid email']
    },
    password: {
        type: String,
        required: true
    }
    ,
    role: {
        type: String,
        enum: [usersRole.ADMIN, usersRole.MANAGER, usersRole.USER],
        default: usersRole.USER
    },
    avatar: {
        type: String
    }
})

module.exports = mongoose.model('User', userSchema)
