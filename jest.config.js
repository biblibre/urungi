module.exports = {
    collectCoverageFrom: [
        'public/js/**/*.js',
        'server/**/*.js',
        'src/**/*.js',
    ],
    coverageReporters: [
        'lcovonly',
        'clover',
        'text-summary',
    ],
    projects: [
        {
            displayName: 'server',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/server/**/*.spec.js',
            ],
            globalSetup: '<rootDir>/test/server/setup.js',
            setupFilesAfterEnv: [
                '<rootDir>/test/server/jest-custom-matchers.js',
            ],
        },
        {
            displayName: 'cli',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/cli/**/*.spec.js',
            ],
            globalSetup: '<rootDir>/test/cli/setup.js',
        },
        {
            displayName: 'liquid-plugin',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/liquid-plugin/**/*.spec.js',
            ],
        },
    ],
};
