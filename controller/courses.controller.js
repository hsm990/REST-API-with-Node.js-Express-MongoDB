const { validationResult } = require('express-validator')
const Course = require('../models/courses.model')
const httpStatus = require('../utils/httpStatus')
const asyncWrapper = require('../middleware/asyncWrapper')
const AppError = require('../utils/appError')



const getCoursses = asyncWrapper(async (req, res, next) => {
    const query = req.query
    const page = query.page || 1
    const limit = query.limit || 1
    const skip = (page - 1) * limit
    const courses = await Course.find({}, { '__v': false }, { limit: limit, skip: skip })
    if (!courses) {
        return next(new AppError("there is no courses yet", 400, httpStatus.FAIL))
    }
    return res.json({
        status: httpStatus.SUCCESS,
        data: {
            courses: [...courses]
        }
    })
})
const getSpecificCourse = asyncWrapper(async (req, res, next) => {

    const data = await Course.findById(req.params.id)
    if (!data) {
        return next(new AppError('course not found', 404, httpStatus.FAIL))
    }
    return res.status(200).json({
        status: httpStatus.SUCCESS,
        data: {
            course: data
        }
    })
})
const createCourse = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400, httpStatus.FAIL))
    }
    const addedCourse = new Course(req.body)
    await addedCourse.save()
    res.status(201).json({
        status: httpStatus.SUCCESS,
        data: {
            course: addedCourse
        }
    })

})
const updateCourse = asyncWrapper(async (req, res, next) => {

    const courseToUpdate = await Course.findById(req.params.id)
    if (!courseToUpdate) {
        return next(new AppError('course not found', 404, httpStatus.FAIL))
    }
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, { ...req.body }, { returnDocument: 'after', runValidators: true })
    return res.status(200).json({
        status: httpStatus.SUCCESS,
        data: {
            oldCourse: courseToUpdate,
            newCourse: updatedCourse
        }
    })


})
const deleteCourse = asyncWrapper(async (req, res, next) => {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);

    if (!deletedCourse) {
        return next(new AppError('course not found', 404, httpStatus.FAIL))
    }

    return res.status(200).json({
        status: httpStatus.SUCCESS,
        data: deletedCourse
    });

})
module.exports = {
    getCoursses,
    getSpecificCourse,
    createCourse,
    updateCourse,
    deleteCourse
}