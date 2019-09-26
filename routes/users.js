const router = require('express').Router();
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const auth = require('../middleware/auth');
const { User, validate, validateUpdate } = require('../models/user');
const asyncMiddleware = require('../middleware/asyncMiddleware');


router.get('/me', auth, asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password -__v');
    const history = user.gamesHistory.toObject().sort((a, b) => new Date(b.dateOfGame).getTime() - new Date(a.dateOfGame).getTime() ).slice(0, 50);
    user.gamesHistory = history;
    res.send(user);
}));

router.post('/', asyncMiddleware(async (req, res) => {
    // Check if user data is valid
    const { error } = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    // Check if user already exists
    let user = await User.findOne({ email: req.body.email });
    if(user) return res.status(400).send('User already registered');

    // Create a new user in database
    user = new User({
        name: req.body.name,
        surname: req.body.surname,
        password: req.body.password,
        email: req.body.email
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    await user.save();

    // Generate and send auth token for client
    const token = user.generateAuthToken();
    res.header('x-auth-token', token).send({
        _id: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email
    });
}));

router.put('/', auth, asyncMiddleware(async (req, res) => {
    const { error } = validateUpdate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.user._id);
    
    if(req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
    } else delete req.body.password;
    
    user.set(req.body);
    await user.save();
    res.send(user);
}));

module.exports = router;