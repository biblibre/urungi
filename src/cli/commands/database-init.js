const log = require('../log.js');

const command = {
    description: 'Initialize the MongoDB database with necessary data',
    usage,
    argSpec: {},
    run,
};

async function run (args) {
    if (args._.length !== 1) {
        log.error('bad number of arguments. To get help, run `cli database-init --help`');

        return 1;
    }

    const password = args._[0];

    const connection = require('../../../server/config/mongoose.js')();
    await connection.asPromise();
    try {
        const Company = connection.model('Company');
        const User = connection.model('User');

        const company = await Company.findOne({ companyID: 'COMPID' });
        if (company) {
            throw new Error('company COMPID already exists, which means that database has already been initialized');
        }

        const user = await User.findOne({ userName: 'administrator' });
        if (user) {
            throw new Error('user administrator already exists, which means that database has already been initialized');
        }

        await Company.create({
            companyID: 'COMPID',
            createdBy: 'urungi setup',
            nd_trash_deleted: false,
        });

        await User.create({
            userName: 'administrator',
            password: password,
            companyID: 'COMPID',
            roles: ['ADMIN'],
            status: 'active',
            nd_trash_deleted: false,
        });

        log.info('database initialization completed');
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
    cli database-init <adminPassword>

Create the administrator user with password <adminPassword>.
If database has already been initialized, this command does nothing.
`;

    return usage;
}

module.exports = command;
