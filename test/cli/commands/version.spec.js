const cli = require('../../../src/cli');

describe('version', function () {
    let stdoutWriteSpy;
    let stdout;

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
            const exitCode = await cli.run(['version', '--help']);

            expect(exitCode).toBe(0);
            const expectedOutput =
                'Show Urungi version\n' +
                '\n' +
                'Usage:\n' +
                '    cli version\n';
            expect(stdout).toBe(expectedOutput);
        });
    });

    describe('without options', function () {
        it('should return 0 and display the version', async function () {
            const exitCode = await cli.run(['version']);

            expect(exitCode).toBe(0);
            const version = require('../../../package.json').version;
            expect(stdout).toBe(version + '\n');
        });
    });
});
