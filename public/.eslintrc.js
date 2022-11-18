module.exports = {
    env: {
        browser: true,
        jquery: true,
    },
    globals: {
        angular: false,
        layerUtils: false,
    },
    overrides: [
        {
            files: ['*.js'],
            rules: {
                'node/no-callback-literal': 'off',
            }
        }
    ],
};
