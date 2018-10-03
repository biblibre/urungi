const config = require('config');
global.config = config;

const hash = require('../server/util/hash');

require('../server/config/mongoose')();
const Users = connection.model('Users');

if (process.argv.length !== 4) {
    console.error('Usage: node set-password.js USERNAME PASSWORD');
    process.exit(1);
}

(async function () {
    const username = process.argv[2];
    const user = await Users.findOne({ userName: username });
    if (!user) {
        console.error('User ' + username + ' does not exist');
        process.exit(1);
    }

    function hashPassword (password) {
        return new Promise(function (resolve, reject) {
            hash(password, function (err, salt, hash) {
                if (err) {
                    return reject(err);
                }

                resolve({ salt: salt, hash: hash });
            });
        });
    }

    const password = process.argv[3];
    const result = await hashPassword(password);

    await user.update({ $set: { salt: result.salt, hash: result.hash } });

    connection.close();
})();
