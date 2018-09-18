module.exports = {
    url: 'http://localhost:8080/',
    ip: '127.0.0.1',
    port: 8080,
    db: 'mongodb://localhost:27017/urungi_test',
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
            mssql: {
                client: 'mssql',
                connection: {
                    host: 'localhost',
                    user: 'SA',
                    password: 'Micros0ft',
                    database: 'urungi_tests',
                }
            },
        }
    }
};
