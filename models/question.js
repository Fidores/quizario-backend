const mongoose = require('mongoose');
const Joi = require('joi');

const { Img, ValidationSchema: ImageValidationSchema } = require('./img');

const QuestionSchema =  new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    answers: {
        type: Object,
        required: true
    },
    correctAnswer: {
        type: String,
        required: true,
        enum: [ 'a', 'b', 'c', 'd' ]
    },
    duration: {
        type: Number,
        default: 0
    },
    img: {
        type: Img
    }
});

const ValidationSchema = {
    duration: Joi.number().optional(),
    title: Joi.string().required().min(5).max(100),
    answers: Joi.object().keys({
        a: Joi.string().max(50).required(),
        b: Joi.string().max(50).required(),
        c: Joi.string().max(50).required(),
        d: Joi.string().max(50).required()
    }),
    correctAnswer: Joi.string().valid('a', 'b', 'c', 'd'),
    img: ImageValidationSchema
}

function validate(question) {
    return Joi.validate(question, ValidationSchema);
}

module.exports.Question = QuestionSchema;
module.exports.ValidationSchema = ValidationSchema;
module.exports.validate = validate;