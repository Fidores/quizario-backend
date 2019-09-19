const router = require('express').Router();

const { Quiz } = require('../models/quiz');
const asyncMiddleware = require('../middleware/asyncMiddleware');

router.get('/', asyncMiddleware(async (req, res) => {
    // res.setHeader('Content-type', 'text/html');
    // res.sendFile(`${ rootPath }\\view\\index.html`);

    const newests = await Quiz.find({}).sort({ creationTime: 'desc' }).limit(10);
    const popular = await Quiz.find({}).sort({ games: 'desc' }).limit(10);

    const sections = [
        {
            title: 'Najnowsze',
            quizzes: newests
        },
        {
            title: 'Najpopularniejsze',
            quizzes: popular
        }
    ]

    res.send(sections);
}));

module.exports = router;