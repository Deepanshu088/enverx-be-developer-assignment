const { body, param } = require("express-validator");
const mongoose = require("mongoose");

const userPostInput = [
    body('title', "Title is required").not().isEmpty(),
    body('description', "Description is required").not().isEmpty(),
    body('category', "Atleast one category is required.").isArray({ min: 1 }),
    body('category.*').isLength({ max: 30, min: 3 }).toLowerCase()
]

const userPostIdParam = param('id', "Invalid Id").custom(value => mongoose.Types.ObjectId.isValid(value) );

exports.userPostInput = userPostInput;
exports.userPostIdParam = userPostIdParam;