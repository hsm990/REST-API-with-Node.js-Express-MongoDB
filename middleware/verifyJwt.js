const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const httpStatus = require('../utils/httpStatus')
module.exports = (req, res, next) => {
    const header = req.headers['Authorization'] || req.headers['authorization']
    if (!header) {
        return next(new AppError('token is required', 401, httpStatus.FAIL))
    }
    const token = header.split(' ')[1]
    try {
        const decod = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = decod
        return next()
    }
    catch {
        return next(new AppError('invalid token', 401, httpStatus.FAIL))
    }
}