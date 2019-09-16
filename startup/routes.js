const express = require('express');

const users = require('../routes/users');
const home = require('../routes/home');
const quizzes = require('../routes/quizzes');
const auth = require('../routes/auth');
const error = require('../middleware/error');
const cors = require('../routes/cors');
const bodyParser = require('body-parser');

module.exports = function(app) {
    app.use(cors);
    app.use(bodyParser.json({ limit: '2mb' }));
    app.use(express.json());
    app.use('/api/users', users);
    app.use('/api/quizzes', quizzes);
    app.use('/api/auth', auth);
    app.use('/', home);
    app.use(error);
}