const command = {
    description: 'List datasources',
    usage,
    argSpec: {},
    run,
};

async function run (args) {
    const connection = require('../../../server/config/mongoose.js')();
    await connection.asPromise();
    const Datasource = connection.model('Datasource');
    const datasources = await Datasource.find({}, { name: 1 });
    for (const datasource of datasources) {
        process.stdout.write(`${datasource._id} ${datasource.name}\n`);
    }
    await connection.close();
}

function usage () {
    const usage =
`Usage:
    cli datasource-list
`;

    return usage;
}

module.exports = command;
