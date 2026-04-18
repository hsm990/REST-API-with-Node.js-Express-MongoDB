const AppError = require('../utils/appError')
const httpStatus = require('../utils/httpStatus')
module.exports = (...roles) => {
    return (req, res, next) => {
        try {
            const role = req.user.role
            if (!roles.includes(role)) {
                return next(new AppError('forbiedden', 403, httpStatus.FAIL))
            }
            next()
        }
        catch {
            return next(new AppError('invalid token', 401, httpStatus.FAIL))
        }
    }
}