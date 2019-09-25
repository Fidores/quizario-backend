class Base64File {
    constructor( file ) {
        this.file = file;
        this.base64Body = file.split(',')[1];
        this.base64Header = file.split(',')[0];
        this.mimeType = file.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/)[1];
        this.size = this.base64Body.length * 0.75 / 1000;
    }
}

module.exports = Base64File;