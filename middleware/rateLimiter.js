const rateLimiter = require('express-rate-limit')

const logInLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 15,
    message: { error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
})

module.exports = {
    logInLimiter
}