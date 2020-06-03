const arg = require('arg');
const log = require('./log.js');

async function run (argv) {
    const commands = [
        'database-init',
        'datasource-list',
        'import',
        'user-set-password',
        'version',
        'user-list',

    ];

    const args = arg({
        '--help': Boolean,
        '--verbose': arg.COUNT,
        '-h': '--help',
        '-v': '--verbose',
    }, {
        argv,
        permissive: true,
    });

    const usageWithDescription = `Command line interface for Urungi\n\n${usage()}`;
    const command = args._.find(a => !a.startsWith('-'));

    if (args['--help'] && !command) {
        process.stdout.write(usageWithDescription);

        return 0;
    }

    if (args._.length === 0) {
        process.stdout.write(usageWithDescription);

        return 0;
    }

    if (args['--verbose']) {
        try {
            log.setVerbosity(args['--verbose']);
        } catch (err) {
            log.error(err.message);

            return 1;
        }
    }

    if (!command) {
        log.error('no command specified. To get help, run `cli --help`');

        return 1;
    }

    if (!commands.includes(command)) {
        log.error(`unknown command '${command}'. To list available commands, run \`cli --help\``);

        return 1;
    }

    const cmd = require(`./commands/${command}.js`);

    try {
        const cmdArgs = arg(cmd.argSpec, { argv: args._.slice(args._.indexOf(command) + 1) });
        if (args['--help']) {
            process.stdout.write(cmd.description + '\n\n');
            process.stdout.write(cmd.usage());

            return 0;
        }

        const exitCode = await cmd.run(cmdArgs);

        return exitCode || 0;
    } catch (err) {
        if (err.code && err.code === 'ARG_UNKNOWN_OPTION') {
            log.error(`${err.message}. To get help, run \`cli --help\``);
        } else {
            log.error(err.message);
        }

        return 1;
    }
}

function usage () {
    const usage =
`Usage:
    cli [global_options...] <command> [command_options...]

Global options:
    -h, --help      show this help message and exit
    -v, --verbose   increase verbosity
                    verbosity levels are: error, warn, info, verbose, debug
                    defaults to 0 (error) and can be increased up to 4 (debug)

Global options can be placed anywhere in the command line, but command options
must be placed after the command.
For instance, \`cli -vv import file.json\` is the same as \`cli import file.json -vv\`

Commands:
    database-init       initialize database
    datasource-list     list datasources
    import              import layers, reports, dashboards
    user-set-password   change user password
    version             show Urungi version

To get help for a specific command, run \`cli <command> --help\`
`;

    return usage;
}

module.exports = {
    run,
};
