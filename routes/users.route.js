const express = require('express')
const router = express.Router()
const userMethod = require('../controller/users.controller')
const verfiyToken = require('../middleware/verifyJwt')
const allowedTo = require('../middleware/allowedTo')
const userRoles = require('../utils/users.role')

const upload = require('../middleware/uploadImage')



router.route('/')
    .get(verfiyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), userMethod.getAllUsers)
router.route('/register')
    .post(upload.single('avatar'), userMethod.addUser)

router.route('/login')
    .post(userMethod.logInUser)

router.route('/changerole')
    .post(verfiyToken, allowedTo(userRoles.ADMIN), userMethod.changeRole)
router.route('/refresh')
    .get(userMethod.refresh)
module.exports = router