module.exports = {
    env: {
        node: true,
    },
    plugins: ['node'],
    extends: ['plugin:node/recommended'],
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
    },
};
