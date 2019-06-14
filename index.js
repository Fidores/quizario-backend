require('express-async-errors');
const express = require('express');
const app = express();

require('./startup/config')();
require('./startup/logging')();
require('./startup/database')();
require('./startup/routes')(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log(`Server is listening on port: ${ port }`));

module.exports = server;