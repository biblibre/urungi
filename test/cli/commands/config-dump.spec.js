const config = require('config');
const cli = require('../../../src/cli');

describe('config-dump', function () {
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
            const exitCode = await cli.run(['config-dump', '--help']);

            expect(exitCode).toBe(0);
            const expectedOutput =
`Dump configuration

Usage:
    cli config-dump
`;
            expect(stdout).toBe(expectedOutput);
        });
    });

    describe('without arguments', function () {
        it('should return 0 and print config', async function () {
            const exitCode = await cli.run(['config-dump']);

            expect(exitCode).toBe(0);

            const printedConfig = JSON.parse(stdout);
            expect(printedConfig).toStrictEqual(JSON.parse(JSON.stringify(config)));
        });
    });
});
