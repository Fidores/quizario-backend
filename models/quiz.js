const mongoose = require('mongoose');
const Joi = require('joi');

const QuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 50
    },
    questions: {
        type: [ new mongoose.Schema({
            title: {
                type: String,
                required: true,
                minlength: 5,
                maxlength: 50
            },
            answers: {
                type: Object,
                required: true
            },
            rightAnswer: {
                type: String,
                required: true,
                enum: [ 'a', 'b', 'c', 'd' ]
            },
            img: {
                type: String
            }
        }) ],
        required: true
    },
    creationTime: {
        type: Date,
        default: Date.now
    },
    img: {
        type: String
    },
    author: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    games: {
        type: Number,
        default: 0
    }
});

QuizSchema.methods.isAuthor = function(userId) {
    return mongoose.Types.ObjectId(this.author).equals(userId);
}

const Quiz = mongoose.model('Quiz', QuizSchema);

function validateQuiz(quiz){
    const schema = {
        title: Joi.string().required().min(5).max(50),
        questions: Joi.array().max(128).items({
            title: Joi.string().required().min(5).max(50),
            answers: Joi.object().keys({
                a: Joi.string().max(50).required(),
                b: Joi.string().max(50).required(),
                c: Joi.string().max(50).required(),
                d: Joi.string().max(50).required()
            }),
            rightAnswer: Joi.string().valid('a', 'b', 'c', 'd')
        })
    }

    return Joi.validate(quiz, schema);
}

module.exports.Quiz = Quiz;
module.exports.validate = validateQuiz;