const mongoose = require('mongoose');

const GameSchema = new mongoose.Schema({
    _id: false,
    quizId: {
        type: mongoose.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports.Game = GameSchema;