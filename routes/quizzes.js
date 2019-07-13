const router = require('express').Router();
const rmfr = require('rmfr');
const formidable = require('formidable');
const jwt = require('jsonwebtoken');
const config = require('config');

const { Quiz, validate } = require('../models/quiz');
const { User } = require('../models/user');
const auth = require('../middleware/auth');
const author = require('../middleware/author');
const validateObjId = require('../middleware/validateObjId');
const rootPath = require('../helpers/getRootPath')();
const extension = require('../helpers/getFileExtension');
const mkdir = require('../helpers/mkdirIfExists');

router.get('/', async (req, res) => {
    // Find all quizes and send them to the client
    console.log(req.query)
    const quizzes = await Quiz.find(req.query);
    res.send(quizzes);
});

router.get('/:id', validateObjId, async (req, res) => {
    // Check if quiz exists in database
    const quiz = await Quiz.findById(req.params.id);
    if(!quiz) return res.status(404).send('There is not a quiz with given ID.');

    // If the user is logged in, add the game to the history
    const token = req.header('x-auth-token');
    if(token){
        const userId = jwt.verify(token, config.get('jwtPrivateKey'))._id;
        const user = await User.findById(userId);
        user.gamesHistory.push({ quizId: quiz._id, title: quiz.title });
        await user.save();
    }
    
    // Increase games number
    quiz.games++;
    await quiz.save();

    // Send result to the client 
    res.send(quiz);
});

router.post('/', auth, async (req, res) => {
    // Check if quiz data is valid
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // Create new quiz in database
    let quiz = new Quiz({
        title: req.body.title,
        questions: req.body.questions,
        author: req.user._id
    });

    await quiz.save();

    // Send the result to the client
    res.send(quiz);
});

router.put('/:id', [validateObjId, auth, author], async (req, res) => {
    // Check if data is valid
    const { error } = validate(req.body);
    if(error) return res.status(401).send(error.details[0].message);

    // Find quiz to update
    let quiz = await Quiz.findById(req.params.id);
    if(!quiz) return res.status(404).send('There is no quiz with given ID.');

    // Update quiz in database
    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // Send result to the client
    res.send(quiz);
});

router.delete('/:id', [validateObjId, auth, author], async (req, res) => {
    // Find quiz to delete
    let quiz = await Quiz.findById(req.params.id);
    if(!quiz) return res.status(404).send('There is no quiz with given ID');

    // Delete quiz from database
    quiz = await Quiz.findByIdAndDelete(quiz._id);

    // Delete quiz assets
    await rmfr(`${ rootPath }\\assets\\quizzes\\${ quiz._id }`);

    // Send result to the client
    res.send(quiz);
});

router.post('/uploads/:id', [validateObjId, auth, author], async (req, res) => {
    const quiz = await Quiz.findById(req.params.id);
    if(!quiz) return res.status(404).send('No quiz with given id');

    const supportedExtensions = [
        'image/png',
        'image/jpeg'
    ];
    let error = false;
    const uploadDir = await mkdir(`${rootPath}\\uploads\\quizzes\\${quiz._id}`);
    
    const form = new formidable.IncomingForm({
        keepExtensions: true,
        uploadDir,
        multipart: true
    });

    form.parse(req);

    form.onPart = async part => {
        if(!supportedExtensions.some((extension) => extension === part.mime))
            form.emit('error', { message: 'Unsupported file extension, however files with supported extensions has been uploaded.', status: 207 });
        else
            form.handlePart(part);
    }

    form.on('fileBegin', async (name, file) => {
        // Check if requested document exists
        const document = quiz._id.toLocaleString() === name ? quiz : quiz.questions.id(name);
        if(!document)
            return form.emit('error', { message: 'No question with given id.', status: 404 });
        
        const uploadPath = `${uploadDir}\\${name}.${extension(file.name)}`;
        const path = `/uploads/quizzes/${ quiz._id }/${ name }.${ extension(file.name) }`;

        // Set where the file is saved
        file.path = uploadPath;

        // Add path to the document
        document.img = path;
    });

    form.on('error', async (err) => {
        if(error) return;
        error = true;
        return res.status(err.status).send(err.message);  
    });

    form.on('end', async () => {
        if(error) return;
        await quiz.save();
        res.send(quiz);
    });
});

module.exports = router;