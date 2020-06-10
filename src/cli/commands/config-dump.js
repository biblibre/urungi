const config = require('config');

const command = {
    description: 'Dump configuration',
    usage: usage,
    argSpec: {},
    run,
};

async function run (args) {
    process.stdout.write(JSON.stringify(config, null, 2));
    process.stdout.write('\n');

    return 0;
}

function usage () {
    const usage =
`Usage:
    cli config-dump
`;

    return usage;
}

module.exports = command;
