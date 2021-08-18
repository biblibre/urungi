// check out https://github.com/visionmedia/node-pwd

/**
 * Module dependencies.
 */

const crypto = require('crypto');

/**
 * Bytesize.
 */

const len = 128;

/**
 * Iterations. ~300ms
 */

const iterations = 12000;

/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api public
 */

module.exports = function (pwd, salt, fn) {
    if (arguments.length === 3) {
        crypto.pbkdf2(pwd, salt, iterations, len, 'SHA1', fn);
    } else {
        fn = salt;
        crypto.randomBytes(len, function (err, salt) {
            if (err) return fn(err);
            salt = salt.toString('base64');
            crypto.pbkdf2(pwd, salt, iterations, len, 'SHA1', function (err, hash) {
                if (err) return fn(err);
                fn(null, salt, hash);
            });
        });
    }
};
