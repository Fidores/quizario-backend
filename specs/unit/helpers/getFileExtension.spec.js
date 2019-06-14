const fileExtension = require('../../../helpers/getFileExtension');

describe('getFileExtension', () => {
    it('should return the file extension', () => {
        const result = fileExtension('file.pdf.txt');
        expect(result).toBe('txt');
    });
});