const { Quiz } = require('../../../models/quiz');
const mongoose = require('mongoose');

describe('user.isAuthor', () => {
    it('should return true if user is the author of the quiz', () => {
        const userID = new mongoose.Types.ObjectId().toHexString();
        const quiz = new Quiz({
            author: userID
        });
        const result = quiz.isAuthor(userID);

        expect(result).toBeTruthy();
    });

    it('should return false if user is not the author of the quiz', () => {
        const userID = new mongoose.Types.ObjectId().toHexString();
        const quiz = new Quiz({
            author: new mongoose.Types.ObjectId().toHexString()
        });
        const result = quiz.isAuthor(userID);

        expect(result).toBeFalsy();
    });
});