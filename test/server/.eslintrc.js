module.exports = {
    env: {
        node: true,
    },
    globals: {
        // defined in server.js
        config: false,

        // defined in server/config/mongoose.js
        connection: false,
    },
};
