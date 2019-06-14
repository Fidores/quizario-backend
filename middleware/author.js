const { Quiz } = require('../models/quiz');

const author = async (req, res, next) => {
    const quiz = await Quiz.findById(req.params.id);
    if(!quiz) return res.status(404).send('There is no quiz with given ID.');

    if(!quiz.isAuthor(req.user._id)) return res.status(403).send('You are not author of this quiz.');

    next();
}

module.exports = author;