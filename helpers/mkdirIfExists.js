const fs = require('fs');

module.exports = async dir => {
    if(!fs.existsSync(dir)) await fs.promises.mkdir(dir);
    return dir;
}