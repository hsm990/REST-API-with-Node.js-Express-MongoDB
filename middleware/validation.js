const { body } = require('express-validator')
const validation = () => {

    return [body('title')
        .notEmpty()
        .withMessage("the title is required")
        .isLength({ min: 2 })
        .withMessage("need to be more then 2 char")
        ,
    body('price')
        .notEmpty()
        .withMessage("the price is required")]
}
module.exports = validation