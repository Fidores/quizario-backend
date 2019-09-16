class Base64File {
    constructor( file ) {
        this.file = file;
        this.mimeType = file.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];
        this.size = file.split(',')[1].length * 0.75 / 1000;
    }
}

module.exports = Base64File;