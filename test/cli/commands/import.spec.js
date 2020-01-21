const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const cli = require('../../../src/cli');

let mongod;
beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.MONGODB_URI = await mongod.getConnectionString();
});
afterAll(async () => {
    await mongod.stop();
});

describe('import', function () {
    let stdout, stdoutWriteSpy;
    let stderr, stderrWriteSpy;

    beforeAll(function () {
        stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
            stdout += chunk;
        });
        stderrWriteSpy = jest.spyOn(process.stderr, 'write').mockImplementation((chunk) => {
            stderr += chunk;
        });
    });

    beforeEach(function () {
        stdout = '';
        stdoutWriteSpy.mockClear();
        stderr = '';
        stderrWriteSpy.mockClear();
    });

    afterAll(function () {
        stdoutWriteSpy.mockRestore();
        stderrWriteSpy.mockRestore();
    });

    describe('with --help', function () {
        it('should return 0 and display a help message', async function () {
            const exitCode = await cli.run(['import', '--help']);

            expect(exitCode).toBe(0);
            expect(stdout).toMatchSnapshot();
        });
    });

    describe('with too many arguments', function () {
        it('should return 1 and log an error', async function () {
            const exitCode = await cli.run(['import', 'a', 'b']);

            expect(exitCode).toBe(1);
            expect(stderr).toMatch('error: too many arguments');
        });
    });

    describe('with correct arguments', function () {
        beforeAll(async function () {
            const connection = require('../../../server/config/mongoose.js')();
            const Datasource = connection.model('Datasource');
            await Datasource.create({ _id: 'dd0000000000000000000002', name: 'Datasource 2', type: 'MySQL', status: 1 });
            await connection.close();
        });

        it('should return 0 and import the valid layers, reports and dashboards', async function () {
            const args = [
                'import',
                '-vvvv',
                '--datasource-map=d00000000000000000000002:dd0000000000000000000002',
                '--datasource-map=*:dd0000000000000000000003',
                path.join(__dirname, '__data__', 'export.json'),
            ];

            const exitCode = await cli.run(args);

            expect(exitCode).toBe(0);

            const stderrLines = stderr.split('\n');
            expect(stderrLines).toHaveLength(11);
            expect(stderrLines[0]).toMatch('warn: layer at position 0 is not valid: datasource dd0000000000000000000003 does not exist');
            expect(stderrLines[1]).toMatch('info: layer a00000000000000000000002 was successfully created');
            expect(stderrLines[2]).toMatch('warn: report at position 0 is not valid');
            expect(stderrLines[3]).toMatch('warn: report at position 1 is not valid: layer a00000000000000000000000 does not exist');
            expect(stderrLines[4]).toMatch('warn: report at position 2 is not valid: layer a00000000000000000000001 does not exist');
            expect(stderrLines[5]).toMatch('info: report 000000000000000000000003 was successfully created');
            expect(stderrLines[6]).toMatch('warn: dashboard at position 0 is not valid');
            expect(stderrLines[7]).toMatch('warn: dashboard at position 1 is not valid: layer a00000000000000000000000 does not exist');
            expect(stderrLines[8]).toMatch('warn: dashboard at position 2 is not valid: layer a00000000000000000000001 does not exist');
            expect(stderrLines[9]).toMatch('info: dashboard b00000000000000000000003 was successfully created');

            expect(stdout).toBe('');

            const connection = require('../../../server/config/mongoose.js')();
            const Layer = connection.model('Layer');
            const Report = connection.model('Report');
            const Dashboard = connection.model('Dashboard');

            const dashboards = await Dashboard.find();
            expect(dashboards).toHaveLength(1);
            expect(dashboards[0]).toHaveProperty('dashboardName', 'Dashboard 3');

            const reports = await Report.find();
            expect(reports).toHaveLength(1);
            expect(reports[0]).toHaveProperty('reportName', 'Report 3');

            const layers = await Layer.find();
            expect(layers).toHaveLength(1);
            expect(layers[0]).toHaveProperty('name', 'Layer 2');

            await connection.close();
        });
    });
});
