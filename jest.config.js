module.exports = {
    collectCoverageFrom: [
        'public/**/*.js',
        'server/**/*.js',
    ],
    coverageReporters: [
        'lcovonly',
        'clover',
        'text-summary',
    ],
    projects: [
        {
            displayName: 'client',
            testEnvironment: 'jsdom',
            testMatch: [
                '<rootDir>/test/client/**/*.spec.js',
            ],
            setupFilesAfterEnv: [
                '<rootDir>/test/client/setup.js',
            ],
        },
        {
            displayName: 'server',
            testEnvironment: 'node',
            testMatch: [
                '<rootDir>/test/server/**/*.spec.js',
            ],
            globalSetup: '<rootDir>/test/server/setup.js',
        },
    ],
};
