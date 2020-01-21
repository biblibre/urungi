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

describe('datasource-list', function () {
    let stdout, stdoutWriteSpy;

    beforeAll(function () {
        stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation((chunk) => {
            stdout += chunk;
        });
    });

    beforeEach(function () {
        stdout = '';
        stdoutWriteSpy.mockClear();
    });

    afterAll(function () {
        stdoutWriteSpy.mockRestore();
    });

    describe('with --help', function () {
        it('should return 0 and display a help message', async function () {
            const exitCode = await cli.run(['datasource-list', '--help']);

            expect(exitCode).toBe(0);
            const expectedOutput =
`List datasources

Usage:
    cli datasource-list
`;
            expect(stdout).toBe(expectedOutput);
        });
    });

    describe('without arguments', function () {
        beforeAll(async function () {
            const connection = require('../../../server/config/mongoose.js')();
            const Datasource = connection.model('Datasource');
            await Datasource.create({ _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'A', type: 'MySQL', status: 0 });
            await Datasource.create({ _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'B', type: 'MSSQL', status: 1 });
            await connection.close();
        });

        it('should return 0 and list datasources', async function () {
            const exitCode = await cli.run(['datasource-list']);

            expect(exitCode).toBe(0);

            const expectedOutput =
                'aaaaaaaaaaaaaaaaaaaaaaaa A\n' +
                'bbbbbbbbbbbbbbbbbbbbbbbb B\n';
            expect(stdout).toBe(expectedOutput);
        });
    });
});
