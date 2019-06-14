const mongoose = require('mongoose');
const config = require('config');

module.exports = function() {
    const database = config.get('database');
    mongoose.connect(database, { useNewUrlParser: true })
    .then(() => console.log(`Connected to ${ database }`))
    .catch(() => console.log(`Could not connect to ${ database }`));
}