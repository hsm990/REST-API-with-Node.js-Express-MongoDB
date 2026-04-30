const User = require('../models/users.model')
const asyncWrapper = require('../middleware/asyncWrapper')
const httpStatus = require('../utils/httpStatus')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const generateJwt = require('../utils/generateJwt')
const AppError = require('../utils/appError')
const cloudinary = require('../config/cloudinary')

const getAllUsers = asyncWrapper(async (req, res, next) => {
    const users = await User.find({}, { '__v': false, 'password': false, '_id': false })
    if (users.length === 0) {
        return next(new AppError('there is no users', 404, httpStatus.FAIL))
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
        return next(new AppError('user with this email already exist', 400, httpStatus.FAIL))

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

    await newUser.save()

    const accessToken = generateJwt({ id: newUser._id, role: newUser.role }, '1m')
    const refreshToken = generateJwt({ id: newUser._id, role: newUser.role }, '10m')
    res.cookie('token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // true in production only
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 10 * 60 * 1000, // 10 minute,
        path: '/'
    })
    res.status(201).json({
        status: httpStatus.SUCCESS,
        data: {
            user: {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                token: accessToken
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
        return next(new AppError('there no user  with credentials', 404, httpStatus.FAIL))
    }

    const matchPassword = await bcrypt.compare(password, user.password)
    if (!matchPassword) {
        return next(new AppError('password is wrong', 400, httpStatus.FAIL))
    }
    const accessToken = generateJwt({ id: user._id, role: user.role }, '1m')
    const refreshToken = generateJwt({ id: user._id, role: user.role }, '10m')
    res.cookie('token', refreshToken, {
        httpOnly: true,
        secure: false, // true in production only
        sameSite: 'none',
        maxAge: 10 * 60 * 1000,
        path: '/'
    })
    return res.json({
        status: "success",
        data: {
            role: user.role,
            token: accessToken
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

const refresh = asyncWrapper(async (req, res, next) => {
    const cookies = req.cookies
    if (!cookies?.token) {
        return next(new AppError('unauthorized', 401, httpStatus.FAIL))
    }
    let decodToken
    try {
        decodToken = jwt.verify(cookies.token, process.env.JWT_SECRET_KEY)
    } catch (err) {
        return next(new AppError('invalid or expired token', 403, httpStatus.FAIL))
    }
    const user = await User.findById(decodToken.id)
    if (!user) {
        return next(new AppError('user not found', 404, httpStatus.FAIL))
    }
    const accessToken = generateJwt({ id: user._id, role: user.role }, '1m')
    res.status(200).json({
        status: httpStatus.SUCCESS,
        data: {
            token: accessToken
        }
    })
})

const logout = asyncWrapper(async (req, res, next) => {
    const cookies = req.cookies
    if (!cookies?.token) {
        return next(new AppError('no content', 404, httpStatus.FAIL))
    }
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    })
    return res.status(200).json({
        status: httpStatus.SUCCESS,
        message: 'Logged out successfully'
    })
})

module.exports = {
    getAllUsers,
    addUser,
    logInUser,
    changeRole,
    refresh,
    logout

}