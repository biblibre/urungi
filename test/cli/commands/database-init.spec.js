const { MongoMemoryServer } = require('mongodb-memory-server');
const cli = require('../../../src/cli');

let mongod;
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
});
afterAll(async () => {
    await mongod.stop();
});

describe('database-init', function () {
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
            const exitCode = await cli.run(['database-init', '--help']);

            expect(exitCode).toBe(0);
            const expectedOutput =
`Initialize the MongoDB database with necessary data

Usage:
    cli database-init <adminPassword>

Create the administrator user with password <adminPassword>.
If database has already been initialized, this command does nothing.
`;
            expect(stdout).toBe(expectedOutput);
        });
    });

    describe('without arguments', function () {
        it('should return 1 and log an error', async function () {
            const exitCode = await cli.run(['database-init']);

            expect(exitCode).toBe(1);
            expect(stderr).toMatch('error: bad number of arguments');
        });
    });

    describe('with correct arguments', function () {
        it('should return 0 and initialize the database', async function () {
            const exitCode = await cli.run(['database-init', 'l0ngpassw0rd']);

            expect(exitCode).toBe(0);

            const connection = require('../../../server/config/mongoose.js')();
            await connection.asPromise();
            const User = connection.model('User');
            const user = await new Promise((resolve, reject) => {
                User.isValidUserPassword('administrator', 'l0ngpassw0rd', (err, user) => {
                    if (err) return reject(err);
                    resolve(user);
                });
            });
            expect(user).toBeTruthy();
            expect(user).toHaveProperty('userName', 'administrator');
            await connection.close();
        });
    });

    describe('with correct arguments and an already initialized database', function () {
        it('should return 1', async function () {
            const exitCode = await cli.run(['database-init', 'l0ngpassw0rd']);

            expect(exitCode).toBe(1);
        });
    });
});
