const jwt = require('jsonwebtoken')
const AppError = require('../utils/appError')
const httpStatus = require('../utils/httpStatus')
module.exports = (req, res, next) => {
    const headers = req.headers.authorization
    if (!headers?.startsWith("Bearer")) {
        return next(new AppError('token is required', 401, httpStatus.FAIL))
    }
    const token = headers.split(" ")[1]
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = decoded
        return next()
    }
    catch {
        return next(new AppError('invalid token', 401, httpStatus.FAIL))
    }
}