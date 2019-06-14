const dummyText = require('../../../helpers/createDummyText');

describe('createDummyText', () => {
    it('should return a dummy text based on passed length', () => {
        const result = dummyText(50);

        expect(result.length).toBe(50);
    });
});