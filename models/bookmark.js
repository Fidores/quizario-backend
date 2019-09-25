const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
    _id: false,
    quiz: {
        type: mongoose.Types.ObjectId,
        ref: 'Quiz'
    }
});

module.exports.Bookmark = BookmarkSchema;