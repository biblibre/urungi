const log = require('../log.js');

const command = {
    description: 'Change user password',
    usage,
    argSpec: {},
    run,
};

async function run (args) {
    if (args._.length !== 2) {
        log.error('bad number of arguments. To get help, run `cli user-set-password --help`');
        return 1;
    }

    const [username, password] = args._;

    const connection = require('../../../server/config/mongoose.js')();
    try {
        const User = connection.model('User');
        const user = await User.findOne({ userName: username });
        if (!user) {
            throw new Error(`user ${username} does not exist`);
        }

        user.password = password;
        await user.save();

        log.info(`password changed successfully for user ${username}`);
    } catch (err) {
        log.error(err.message);

        return 1;
    } finally {
        await connection.close();
    }
}

function usage () {
    const usage =
`Usage:
    cli user-set-password <username> <password>

Examples:

    cli user-set-password administrator '3FGad$f@SiP!6j'
`;

    return usage;
}

module.exports = command;
