(function () {
    'use strict';

    angular.module('app.core').factory('uuid', uuid);

    function uuid () {
        const service = {
            v4: v4,
        };

        const byteToHex = [];
        for (let i = 0; i < 256; ++i) {
            byteToHex[i] = (i + 0x100).toString(16).substr(1);
        }

        return service;

        function v4 () {
            const bytes = new Uint8Array(16);
            crypto.getRandomValues(bytes);

            // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
            bytes[6] = (bytes[6] & 0x0f) | 0x40;
            bytes[8] = (bytes[8] & 0x3f) | 0x80;

            return bytesToUuid(bytes);
        }

        function bytesToUuid (buf) {
            const bth = byteToHex;
            const uuid = [
                bth[buf[0]], bth[buf[1]], bth[buf[2]], bth[buf[3]], '-',
                bth[buf[4]], bth[buf[5]], '-',
                bth[buf[6]], bth[buf[7]], '-',
                bth[buf[8]], bth[buf[9]], '-',
                bth[buf[10]], bth[buf[11]], bth[buf[12]],
                bth[buf[13]], bth[buf[14]], bth[buf[15]]
            ].join('');

            return uuid;
        }
    }
})();
