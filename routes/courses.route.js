const coursesMethod = require('../controller/courses.controller')
const express = require('express')
const router = express.Router()
const validation = require('../middleware/validation')
const verfiyToken = require('../middleware/verifyJwt')
const userRoles = require('../utils/users.role')
const allowedTo = require('../middleware/allowedTo')



router.route('/')
    .get(coursesMethod.getCoursses)
    .post(verfiyToken, validation(), allowedTo(userRoles.ADMIN, userRoles.MANAGER), coursesMethod.createCourse)


router.route('/:id')
    .get(verfiyToken, coursesMethod.getSpecificCourse)
    .patch(verfiyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), coursesMethod.updateCourse)
    .delete(verfiyToken, allowedTo(userRoles.ADMIN, userRoles.MANAGER), coursesMethod.deleteCourse)

module.exports = router