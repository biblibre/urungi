const config = require('config');
global.config = config;

const connection = require('../server/config/mongoose')();
const User = connection.model('User');

if (process.argv.length !== 4) {
    console.error('Usage: node set-password.js USERNAME PASSWORD');
    process.exit(1);
}

(async function () {
    const username = process.argv[2];
    const user = await User.findOne({ userName: username });
    if (!user) {
        console.error('User ' + username + ' does not exist');
        process.exit(1);
    }

    const password = process.argv[3];
    user.password = password;

    await user.save();

    connection.close();
})();
