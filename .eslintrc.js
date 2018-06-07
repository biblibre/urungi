module.exports = {
    extends: 'standard',
    env: {
        jquery: true,
        mocha: true,
    },
    globals: {
        // defined in server.js
        config: false,

        // defined in server/config/mongoose.js
        connection: false,

        // defined in server/globals.js
        appRoot: false,
        debug: false,
        generateUserFilter: false,
        generateUserFilterValue: false,
        getNextSequence: false,
        isAllowed: false,
        passthrough: false,
        restrict: false,
        restrictRole: false,
        saveToLog: false,
        sendEmailTemplate: false,
        sendCommunication: false,
        sendNotification: false,
        serverResponse: false,

        // Browser
        angular: false,
        app: false,
        noty: false,
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
