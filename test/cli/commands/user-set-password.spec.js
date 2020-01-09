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

describe('user-set-password', function () {
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
            const exitCode = await cli.run(['user-set-password', '--help']);

            expect(exitCode).toBe(0);
            const expectedOutput =
`Change user password

Usage:
    cli user-set-password <username> <password>

Examples:

    cli user-set-password administrator '3FGad$f@SiP!6j'
`;
            expect(stdout).toBe(expectedOutput);
        });
    });

    describe('without arguments', function () {
        it('should return 1 and log an error', async function () {
            const exitCode = await cli.run(['user-set-password']);

            expect(exitCode).toBe(1);
            expect(stderr).toMatch('error: bad number of arguments');
        });
    });

    describe('with unknown user', function () {
        it('should return 1', async function () {
            const exitCode = await cli.run(['user-set-password', 'unknown', 'l0ngpassw0rd']);

            expect(exitCode).toBe(1);
            expect(stderr).toMatch('user unknown does not exist');
        });
    });

    describe('with correct arguments', function () {
        beforeAll(async function () {
            const connection = require('../../../server/config/mongoose.js')();
            const User = connection.model('User');
            await User.create({ userName: 'administrator' });
            await connection.close();
        });

        it('should return 0 and initialize the database', async function () {
            const exitCode = await cli.run(['user-set-password', 'administrator', 'l0ngpassw0rd']);

            expect(exitCode).toBe(0);

            const connection = require('../../../server/config/mongoose.js')();
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
});
