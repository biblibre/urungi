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
    Pipeline('node:12 mongo:4.0', '12', '4.0.27'),
    Pipeline('node:12 mongo:4.2', '12', '4.2.17'),
    Pipeline('node:12 mongo:4.4', '12', '4.4.9'),
    Pipeline('node:12 mongo:5.0', '12', '5.0.3'),
    Pipeline('node:14 mongo:4.0', '14', '4.0.27'),
    Pipeline('node:14 mongo:4.2', '14', '4.2.17'),
    Pipeline('node:14 mongo:4.4', '14', '4.4.9'),
    Pipeline('node:14 mongo:5.0', '14', '5.0.3'),
    Pipeline('node:16 mongo:4.2', '16', '4.2.17'),
    Pipeline('node:16 mongo:4.4', '16', '4.4.9'),
    Pipeline('node:16 mongo:5.0', '16', '5.0.3'),
]
