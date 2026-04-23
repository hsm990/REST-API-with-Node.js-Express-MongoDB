const jwt = require('jsonwebtoken')
module.exports = (payload, time) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: time })
    return token
}
