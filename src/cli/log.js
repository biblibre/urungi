const util = require('util');

class CliLogger {
    constructor () {
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            verbose: 3,
            debug: 4,
        };
        this.level = 'error';
    }

    setLevel (level) {
        if (!(level in this.levels)) {
            throw new Error(`Invalid level '${level}'`);
        }

        this.level = level;
    }

    getLevel () {
        return this.level;
    }

    setVerbosity (verbosity) {
        const entry = Object.entries(this.levels).find(entry => entry[1] === verbosity);
        if (!entry) {
            throw new Error(`Invalid verbosity '${verbosity}'`);
        }

        this.level = entry[0];
    }

    log (level, format, ...args) {
        if (this.levels[level] <= this.levels[this.level]) {
            const message = util.format(format, ...args);
            process.stderr.write(`${level}: ${message}\n`);
        }
    }

    error (format, ...args) {
        this.log('error', format, ...args);
    }

    warn (format, ...args) {
        this.log('warn', format, ...args);
    }

    info (format, ...args) {
        this.log('info', format, ...args);
    }

    verbose (format, ...args) {
        this.log('verbose', format, ...args);
    }

    debug (format, ...args) {
        this.log('debug', format, ...args);
    }
}

const logger = new CliLogger();

module.exports = logger;
