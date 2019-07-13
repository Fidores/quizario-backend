const router = require('express').Router();
const bcrypt = require('bcrypt');

const auth = require('../middleware/auth');
const { User, validate } = require('../models/user');

router.get('/me', auth, async (req, res) => {
    const historySelection = req.query.includeHistory ? '+gamesHistory' : '-gamesHistory';
    const user = await User.findById(req.user._id).select('-password -__v ' + historySelection);
    res.send(user);
});

router.post('/', async (req, res) => {
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
});

module.exports = router;