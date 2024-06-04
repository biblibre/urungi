local Pipeline(name, nodeVersion, mongoVersion) = {
    kind: 'pipeline',
    type: 'docker',
    name: name,
    steps: [
        {
            name: 'test',
            image: 'node:' + nodeVersion,
            user: 'node',
            environment: {
                URUNGI_TEST_MYSQL: '{ "host": "mariadb", "database": "urungi_tests", "user": "urungi", "password": "urungi" }',
                URUNGI_TEST_PG: '{ "host": "postgres", "database": "urungi_tests", "user": "urungi", "password": "urungi" }',
                MONGOMS_VERSION: mongoVersion
            },
            commands: [
                'npm ci',
                'npx jest --coverage',
            ],
        },
    ],
    services: [
        {
            name: 'mariadb',
            image: 'mariadb:10.3',
            environment: {
                MYSQL_RANDOM_ROOT_PASSWORD: 'yes',
                MYSQL_DATABASE: 'urungi_tests',
                MYSQL_USER: 'urungi',
                MYSQL_PASSWORD: 'urungi',
            },
        },
        {
            name: 'postgres',
            image: 'postgres:9.6',
            environment: {
                POSTGRES_DB: 'urungi_tests',
                POSTGRES_USER: 'urungi',
                POSTGRES_PASSWORD: 'urungi',
            },
        },
    ],
};

[
    Pipeline('node:16 mongo:5.0', '16', '5.0.26'),
    Pipeline('node:18 mongo:5.0', '18', '5.0.26'),
    Pipeline('node:18 mongo:6.0', '18', '6.0.15'),
    Pipeline('node:18 mongo:7.0', '18', '7.0.2'),
]
