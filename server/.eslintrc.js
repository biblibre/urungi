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

        // defined in server/config/mailer.js
        sendEmailTemplate: false,
    },
};
