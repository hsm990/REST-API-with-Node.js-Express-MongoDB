const { validationResult } = require('express-validator')
const Course = require('../models/courses.model')
const Enrollment = require('../models/enrollments.model')
const User = require('../models/users.model')
const httpStatus = require('../utils/httpStatus')
const asyncWrapper = require('../middleware/asyncWrapper')
const AppError = require('../utils/appError')

// GET /courses?page=1&limit=10
const getCourses = asyncWrapper(async (req, res) => {
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.max(1, parseInt(req.query.limit) || 10)
    const skip = (page - 1) * limit

    const [courses, total] = await Promise.all([
        Course.find({}, { __v: false }, { skip, limit }),
        Course.countDocuments()
    ])

    return res.json({
        status: httpStatus.SUCCESS,
        data: {
            courses,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        }
    })
})

// GET /courses/:id
const getSpecificCourse = asyncWrapper(async (req, res, next) => {
    const course = await Course.findById(req.params.id, { __v: false })
    if (!course) {
        return next(new AppError('course not found', 404, httpStatus.FAIL))
    }
    return res.status(200).json({
        status: httpStatus.SUCCESS,
        data: { course }
    })
})

// POST /courses
const createCourse = asyncWrapper(async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return next(new AppError(errors.array()[0].msg, 400, httpStatus.FAIL))
    }

    // Destructure only the fields your schema expects
    const { title, description, price, instructor, category } = req.body
    const course = new Course({ title, description, price, instructor, category })
    await course.save()

    return res.status(201).json({
        status: httpStatus.SUCCESS,
        data: { course }
    })
})

// PATCH /courses/:id
const updateCourse = asyncWrapper(async (req, res, next) => {
    // FIX: one query instead of two — findByIdAndUpdate returns null if not found
    const updatedCourse = await Course.findByIdAndUpdate(
        req.params.id,
        { ...req.body },
        { new: true, runValidators: true, projection: { __v: false } }
    )

    if (!updatedCourse) {
        return next(new AppError('course not found', 404, httpStatus.FAIL))
    }

    return res.status(200).json({
        status: httpStatus.SUCCESS,
        data: { course: updatedCourse }
    })
})

// DELETE /courses/:id
const deleteCourse = asyncWrapper(async (req, res, next) => {
    const deleted = await Course.findByIdAndDelete(req.params.id)
    if (!deleted) {
        return next(new AppError('course not found', 404, httpStatus.FAIL))
    }

    // FIX: don't leak the full document — just confirm deletion
    return res.status(200).json({
        status: httpStatus.SUCCESS,
        message: 'course deleted successfully'
    })
})

// POST /courses/:id/enroll
const enrollInCourse = asyncWrapper(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
    if (!course) {
        return next(new AppError('course not found', 404, httpStatus.FAIL))
    }

    const userId = req.user.id
    try {
        const enrollment = await Enrollment.create({ user: userId, course: course._id })
        return res.status(201).json({
            status: httpStatus.SUCCESS,
            data: { enrollment }
        })
    } catch (err) {
        if (err.code === 11000) {
            return next(new AppError('already enrolled in this course', 409, httpStatus.FAIL))
        }
        return next(err)
    }
})

// DELETE /courses/:id/enroll
const unenrollFromCourse = asyncWrapper(async (req, res, next) => {
    const course = await Course.findById(req.params.id)
    if (!course) {
        return next(new AppError('course not found', 404, httpStatus.FAIL))
    }

    const result = await Enrollment.findOneAndDelete({
        user: req.user.id,
        course: course._id
    })
    if (!result) {
        return next(new AppError('not enrolled in this course', 404, httpStatus.FAIL))
    }

    return res.status(200).json({
        status: httpStatus.SUCCESS,
        message: 'unenrolled successfully'
    })
})

// GET /courses/stats/enrollments
const getInstructorEnrollmentStats = asyncWrapper(async (req, res, next) => {
    const user = await User.findById(req.user.id)
    if (!user) {
        return next(new AppError('user not found', 404, httpStatus.FAIL))
    }

    const instructorName = `${user.firstName} ${user.lastName}`.trim()
    const myCourses = await Course.find({ instructor: instructorName }, { _id: 1, title: 1 })
    const courseIds = myCourses.map(c => c._id)

    const perCourse = await Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: '$course', count: { $sum: 1 } } }
    ])

    const countMap = new Map(perCourse.map(p => [String(p._id), p.count]))
    const breakdown = myCourses.map(c => ({
        courseId: c._id,
        title: c.title,
        enrollments: countMap.get(String(c._id)) || 0
    }))

    const total = breakdown.reduce((sum, c) => sum + c.enrollments, 0)

    return res.json({
        status: httpStatus.SUCCESS,
        data: {
            instructor: instructorName,
            totalUniqueEnrollments: total,
            coursesCount: myCourses.length,
            breakdown
        }
    })
})

module.exports = {
    getCourses,
    getSpecificCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    getInstructorEnrollmentStats
}