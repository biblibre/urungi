const fs = require('fs');
const util = require('util');
const mongoose = require('mongoose');
const log = require('../log.js');

const command = {
    description: 'Import layers, reports, dashboards',
    usage,
    argSpec: {
        '--datasource-map': [String],
        '--overwrite': Boolean,
    },
    run,
};

async function run (args) {
    if (args._.length > 1) {
        log.error('too many arguments. To get help, run `cli import --help`');

        return 1;
    }

    const ctx = {
        datasourceMap: new Map(),
        overwrite: false,
    };

    if (args['--datasource-map']) {
        ctx.datasourceMap = new Map(args['--datasource-map'].map(m => m.split(':')));
    }
    if (args['--overwrite']) {
        ctx.overwrite = true;
    }

    const file = args._.length > 0 ? args._[0] : '-';
    const connection = require('../../../server/config/mongoose.js')();
    await connection.asPromise();
    try {
        await importFile(file, ctx);
    } catch (err) {
        log.error(`import has failed: ${err.message}\n`);

        return 1;
    } finally {
        await connection.close();
    }

    return 0;
}

async function importFile (file, ctx) {
    let input;
    if (file === '-') {
        input = await readStdin();
    } else {
        const readFile = util.promisify(fs.readFile);
        input = await readFile(file);
    }

    const data = JSON.parse(input);
    for (const key of ['layers', 'reports', 'dashboards']) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
            throw new Error(`missing required key "${key}"`);
        }
    }

    const Datasource = mongoose.model('Datasource');
    const Layer = mongoose.model('Layer');
    const Report = mongoose.model('Report');
    const Dashboard = mongoose.model('Dashboard');

    const validLayers = [];
    for (const [idx, layer] of data.layers.entries()) {
        try {
            await Layer.validate(layer);

            const datasourceID = String(layer.datasourceID);
            if (ctx.datasourceMap.has(datasourceID)) {
                layer.datasourceID = ctx.datasourceMap.get(datasourceID);
            } else if (ctx.datasourceMap.has('*')) {
                layer.datasourceID = ctx.datasourceMap.get('*');
            }

            await Layer.validate(layer, ['datasourceID']);

            const datasource = await Datasource.findById(layer.datasourceID);
            if (!datasource) {
                throw new Error(`datasource ${layer.datasourceID} does not exist`);
            }

            validLayers.push(layer);
        } catch (err) {
            let message = err.message;
            if (err.errors) {
                message = Object.entries(err.errors)
                    .map(([path, error]) => error.message)
                    .join(', ');
            }

            log.warn(`layer at position ${idx} is not valid: ${message}`);
        }
    }

    for (const layer of validLayers) {
        await insertDoc(Layer, layer, ctx);
    }

    const validReports = [];
    for (const [idx, report] of data.reports.entries()) {
        try {
            await Report.validate(report);

            const layer = await Layer.findById(report.selectedLayerID);
            if (!layer) {
                throw new Error(`layer ${report.selectedLayerID} does not exist`);
            }

            validReports.push(report);
        } catch (err) {
            let message = err.message;
            if (err.errors) {
                message = Object.entries(err.errors)
                    .map(([path, error]) => error.message)
                    .join(', ');
            }

            log.warn(`report at position ${idx} is not valid: ${message}`);
        }
    }

    for (const report of validReports) {
        await insertDoc(Report, report, ctx);
    }

    const validDashboards = [];
    for (const [idx, dashboard] of data.dashboards.entries()) {
        try {
            await Dashboard.validate(dashboard);

            for (const report of dashboard.reports) {
                const layer = await Layer.findById(report.selectedLayerID);
                if (!layer) {
                    throw new Error(`layer ${report.selectedLayerID} does not exist`);
                }
            }

            validDashboards.push(dashboard);
        } catch (err) {
            let message = err.message;
            if (err.errors) {
                message = Object.entries(err.errors)
                    .map(([path, error]) => error.message)
                    .join(', ');
            }

            log.warn(`dashboard at position ${idx} is not valid: ${message}`);
        }
    }

    for (const dashboard of validDashboards) {
        await insertDoc(Dashboard, dashboard, ctx);
    }
}

async function insertDoc (model, doc, ctx) {
    const modelName = model.modelName.toLowerCase();
    try {
        const existingDoc = await model.findById(doc._id);
        if (existingDoc) {
            if (ctx.overwrite) {
                await existingDoc.replaceOne(doc);
                log.info(`${modelName} ${doc._id} was successfully replaced`);
            } else {
                log.warn(`${modelName} ${doc._id} already exists`);
            }
        } else {
            await model.create(doc);
            log.info(`${modelName} ${doc._id} was successfully created`);
        }
    } catch (err) {
        log.error(`importing ${modelName} ${doc._id} has failed: ${err.message}`);
    }
}

function readStdin () {
    return new Promise((resolve, reject) => {
        const chunks = [];

        process.stdin.setEncoding('utf8');
        process.stdin.on('readable', function () {
            let chunk;
            while ((chunk = process.stdin.read()) !== null) {
                chunks.push(chunk);
            }
        });
        process.stdin.on('end', () => {
            resolve(chunks.join(''));
        });
    });
}

function usage () {
    const usage =
`Usage:
    cli import [options...] [<file>]

<file> should be a JSON file generated by Urungi export tool.
If <file> is - or if there is no <file>, standard input is read.

Available options:
    --datasource-map=<from>:<to>
        Replace \`datasourceID\` in imported layers.

        This is useful if you want to import layers from another Urungi instance
        that doesn't have the same datasources.

        <from> should be a datasource id existing in <file>, or '*' to replace
        all \`datasourceID\`.

        <to> should be a datasource id existing in the Urungi database

        This option is repeatable.
        If this option is given multiple times, and <from> is '*' in one of
        them, it acts as a fallback.

    --overwrite
        By default, if a layer/report/dashboard in the import file also exists
        in Urungi database, it will not be imported.

        Enabling this option will overwrite the existing layers, reports and
        dashboards with the ones in <file>

Examples:

    cli import --datasource-map=5e18537d852fdfb9f0f9a777:5e18538872b444e87d0053d1 \\
        --datasource-map=*:5e1853a1aa2814a2b33a9080 export.json

    This will replace all \`datasourceID\` in layers by:
      - 5e18538872b444e87d0053d1 if \`datasourceID\` is 5e18537d852fdfb9f0f9a777
      - 5e1853a1aa2814a2b33a9080 otherwise
    and create new layers/reports/dashboards. Those who already exists in
    database will not be replaced.
`;

    return usage;
}

module.exports = command;
