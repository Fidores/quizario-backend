const router = require('express').Router();
const jwt = require('jsonwebtoken');
const config = require('config');

const { Quiz, validate } = require('../models/quiz');
const { User } = require('../models/user');
const auth = require('../middleware/auth');
const author = require('../middleware/author');
const validateObjId = require('../middleware/validateObjId');
const Base64 = require('../helpers/readPayloadFromBase64');
const asyncMiddleware = require('../middleware/asyncMiddleware');

router.get('/', asyncMiddleware(async (req, res) => {
    // Find all quizes and send them to the client 
    const query = JSON.parse(req.query.query);
    const quizzes = await Quiz.find(query).sort('-creationTime');
    res.send(quizzes);
}));

router.get('/:id', validateObjId, asyncMiddleware(async (req, res) => {
    // Check if quiz exists in database
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).send('There is not a quiz with given ID.');

    const token = req.get('x-auth-token');
    if (token && !req.query.skipHistory) {
        const { _id } = jwt.verify(token, config.get('jwtPrivateKey'));
        const user = await User.findById(_id);
        user.gamesHistory.push({
            quizId: quiz._id,
            title: quiz.title
        });
        await user.save();
    }

    // Increase games number
    quiz.games++;
    await quiz.save();

    // Send result to the client 
    res.send(quiz);
}));

router.post('/', auth, asyncMiddleware(async (req, res) => {
    // Check if quiz data is valid
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    req.body.questions.forEach((question, index) => {
        if(!question.img) return;
        const file = new Base64(question.img);
        const isSupported = config.get('supportedImageExtensions').includes(file.mimeType);

        // Validate image
        if (!isSupported) return res.status(400).send('Not supported file type.');
        if (file.size > config.get('maxImageSize')) return res.status(400).send('Image is too large.');

        // Conver base64 type to Buffer type.
        if(question.img) req.body.questions[index].img = {
            binaryData: Buffer.from(file.base64Body, 'base64'),
            header: file.base64Header
        };
    });

    // Create new quiz in database
    let quiz = new Quiz({
        title: req.body.title,
        questions: req.body.questions,
        author: req.user._id
    });

    await quiz.save();

    // Send the result to the client
    res.send(quiz);

}));

router.put('/:id', [validateObjId, auth, author], asyncMiddleware(async (req, res) => {
    // Check if quiz data is valid
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let quiz = await Quiz.findById(req.params.id);
    if(!quiz) return res.status(404).send('There is not a quiz with given ID.');

    req.body.questions.forEach((question, index) => {
        if(!question.img) return;
        const file = new Base64(question.img);
        const isSupported = config.get('supportedImageExtensions').includes(file.mimeType);

        // Validate image
        if (!isSupported) return res.status(400).send('Not supported file type.');
        if (file.size > config.get('maxImageSize')) return res.status(400).send('Image is too large.');

        // Conver base64 type to Buffer type.
        if(question.img) req.body.questions[index].img = {
            binaryData: Buffer.from(file.base64Body, 'base64'),
            header: file.base64Header
        };
    });

    // Update quiz in database

    await quiz.update({
        title: req.body.title,
        questions: req.body.questions,
        author: req.user._id
    }, { new: true });

    // Send the result to the client
    res.send(quiz);
}));

router.delete('/:id', [validateObjId, auth, author], asyncMiddleware(async (req, res) => {
    // Find quiz to delete
    let quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).send('There is no quiz with given ID');

    // Delete quiz from database
    quiz = await quiz.delete();

    // Send result to the client
    res.send(quiz);
}));

module.exports = router;