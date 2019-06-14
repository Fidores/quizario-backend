const express = require('express');

const users = require('../routes/users');
const home = require('../routes/home');
const quizzes = require('../routes/quizzes');
const auth = require('../routes/auth');
const error = require('../middleware/error');
const cors = require('../routes/cors');
const rootPath = require('../helpers/getRootPath')();

module.exports = function(app) {
    app.use(cors);
    app.use(express.json());
    app.use('/uploads', express.static(`${ rootPath }\\uploads\\`));
    app.use('/api/users', users);
    app.use('/api/quizzes', quizzes);
    app.use('/api/auth', auth);
    app.use('/', home);
    app.use(error);
}