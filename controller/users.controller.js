const User = require('../models/users.model')
const asyncWrapper = require('../middleware/asyncWrapper')
const httpStatus = require('../utils/httpStatus')
const appErorr = require('../utils/appError')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const generateJwt = require('../utils/generateJwt')
const AppError = require('../utils/appError')
const cloudinary = require('../config/cloudinary')

const getAllUsers = asyncWrapper(async (req, res, next) => {
    const users = await User.find({}, { '__v': false, 'password': false, '_id': false })
    if (!users) {
        return next(new appErorr('there is no users', 404, httpStatus.FAIL))
    }
    return res.json({
        status: httpStatus.SUCCESS,
        data: {
            users: [...users]
        }
    })
})

const addUser = asyncWrapper(async (req, res, next) => {
    const { firstName, lastName, email, password } = req.body
    const oldUser = await User.findOne({ email: email })
    if (oldUser) {
        return next(new appErorr('user with this email already exist', 400, httpStatus.FAIL))

    }

    let avatarUrl = null
    if (req.file) {
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { folder: 'users' },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result)
                }
            ).end(req.file.buffer)
        })
        avatarUrl = result.secure_url

    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        avatar: avatarUrl
    })

    const token = generateJwt({ email: newUser.email, role: newUser.role })
    newUser.token = token
    await newUser.save()
    res.status(201).json({
        status: httpStatus.SUCCESS,
        data: {
            user: {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                token: token
            },
            data: {
                message: "user created"
            }
        }

    })
}
)

const logInUser = asyncWrapper(async (req, res, next) => {
    const email = req.body.email
    const password = req.body.password
    const user = await User.findOne({ email: email })
    if (!user) {
        return next(new appErorr('there no user  with credentials', 404, httpStatus.FAIL))
    }

    const matchPassword = await bcrypt.compare(password, user.password)
    if (!matchPassword) {
        return next(new appErorr('password is wrong', 400, httpStatus.FAIL))
    }
    const token = generateJwt({ email: email, role: user.role })
    return res.json({
        status: "success",
        data: {
            token: token
        }
    })
})
const changeRole = asyncWrapper(async (req, res, next) => {
    const email = req.body.email
    const newRole = req.body.role
    const user = await User.findOne({ email })
    if (!user) {
        return next(new AppError('no user with this  email', 404, httpStatus.FAIL))
    }
    const oldrole = user.role
    user.role = newRole
    await user.save()
    res.json({
        status: httpStatus.SUCCESS,
        data: {
            oldrole: oldrole,
            newrole: newRole
        }
    })
})
module.exports = {
    getAllUsers,
    addUser,
    logInUser,
    changeRole

}