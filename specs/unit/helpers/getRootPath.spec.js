const rootPath = require('../../../helpers/getRootPath');

describe('getRootPath', () => {
    it('should return an absolute path to the project', () => {
        const result = rootPath();

        expect(result).toMatch(/^[a-zA-Z]:\\(((?![<>:"/\\|?*]).)+((?<![ .])\\)?)*$/);
    });
});