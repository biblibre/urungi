const version = require('../../../package.json').version;

const command = {
    description: 'Show Urungi version',
    usage,
    argSpec: {},
    run,
};

async function run (args) {
    process.stdout.write(version + '\n');

    return 0;
}

function usage () {
    const usage =
`Usage:
    cli version
`;

    return usage;
}

module.exports = command;
