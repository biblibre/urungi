module.exports = {
    extends: 'standard',
    env: {
        browser: true,
        jquery: true,
        mocha: true,
        jasmine: true,
    },
    globals: {
        // defined in server.js
        config: false,

        // defined in server/config/mongoose.js
        connection: false,

        // defined in server/globals.js
        appRoot: false,
        restrict: false,
        restrictRole: false,
        saveToLog: false,
        sendEmailTemplate: false,

        // Browser
        angular: false,
        noty: false,
        layerUtils: false,

        // Angular mocks
        inject: false,
    },
    rules: {
        'no-console': 'off',
        'camelcase': 'off',
        'indent': ['error', 4],
        'linebreak-style': ['error', 'unix'],
        'semi': ['error', 'always'],
        'comma-dangle': ['error', 'only-multiline'],
        'prefer-const': 'error',
    }
};
