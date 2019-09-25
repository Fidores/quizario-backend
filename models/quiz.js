const mongoose = require('mongoose');
const Joi = require('joi');

const { Img, ValidationSchema: ImageValidationSchema } = require('./img');
const { Question, ValidationSchema: QuestionValidationSchema } = require('./question');

const QuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 100
    },
    questions: {
        type: [ Question ],
        required: true
    },
    creationTime: {
        type: Date,
        default: Date.now
    },
    img: {
        type: Img
    },
    author: {
        type: mongoose.Types.ObjectId,
        required: true,
        ref: 'User'
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
        title: Joi.string().required().min(5).max(100),
        questions: Joi.array().max(128).items(QuestionValidationSchema),
        img: ImageValidationSchema
    }

    return Joi.validate(quiz, schema);
}

module.exports.Quiz = Quiz;
module.exports.validate = validateQuiz;