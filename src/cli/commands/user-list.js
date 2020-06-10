
const command = {
    description: 'List Urungi users',
    usage: usage,
    argSpec: {},
    run,
};

async function run (args) {
    const connection = require('../../../server/config/mongoose.js')();
    const User = connection.model('User');
    const users = await User.find({});
    for (const user of users) {
        process.stdout.write(`${user._id} ${user.userName}\n`);
    }
    await connection.close();
}

function usage () {
    const usage =
`Usage:
    cli user-list
`;

    return usage;
}

module.exports = command;
