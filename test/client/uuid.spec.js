const uuid = require('../../public/js/uuid.js');

describe('uuid', function () {
    // crypto is not implemented in jsdom so provides an alternative using
    // Math.random
    // https://github.com/jsdom/jsdom/issues/1612
    window.crypto = {
        getRandomValues: function (buffer) {
            for (let i = 0, r; i < buffer.length; i++) {
                if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
                buffer[i] = r >>> ((i & 0x03) << 3) & 0xff;
            }
        },
    };

    it('should be defined', function () {
        expect(uuid).toBeDefined();
        expect(uuid.v4).toBeDefined();
    });

    it('should return a valid UUID', function () {
        expect(uuid.v4()).toMatch(/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/);
    });
});
