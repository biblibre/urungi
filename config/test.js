module.exports = {
    url: 'http://localhost:8080/',
    ip: '127.0.0.1',
    port: 8080,
    db: 'mongodb://localhost:27017/widestage_test',
    tests: {
        datasources: {
            // See https://knexjs.org/#Installation-client for configuration
            mysql: {
                client: 'mysql',
                connection: {
                    host: 'localhost',
                    user: 'urungi',
                    password: 'urungi',
                    database: 'urungi_tests',
                }
            },
            postgresql: {
                client: 'pg',
                connection: {
                    host: 'localhost',
                    user: 'postgres',
                    database: 'urungi_tests',
                }
            },
        }
    }
};
