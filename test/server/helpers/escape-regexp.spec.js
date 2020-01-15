const escapeRegExp = require('../../../server/helpers/escape-regexp.js');

describe('escapeRegExp', function () {
    it('should escape regexp meta characters', function () {
        const escaped = escapeRegExp('foo^$.*+?()[]{}|bar');
        expect(escaped).toBe('foo\\^\\$\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|bar');
    });
});
