const router = require('express').Router();
const Joi = require('joi');
const bcrypt = require('bcrypt');

const { User } = require('../models/user');

router.post('/', async (req, res) => {
    // Validate user's email and password
    const { error } = validate(req.body);
    if(error) return res.status(401).send(error.details[0].message);

    // Search for the user in database
    const user = await User.findOne({ email: req.body.email });
    if(!user) return res.status(400).send('Invalid email or password');

    // Check if the password is correct
    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid email or password');

    // Generate and send token to the user
    const token = user.generateAuthToken();
    res.send(token);
});

function validate(body){
    const schema = {
        email: Joi.string().required().email().min(3).max(128),
        password: Joi.string().required().min(5).max(255)
    }

    return Joi.validate(body, schema);
}

module.exports = router;