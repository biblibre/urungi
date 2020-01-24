# How to run tests

Tests are located under `test/` and can be run using the following command:

    npm test

Some tests need SQL databases to connect to. To run those tests, set the
following environment variables: `URUNGI_TEST_MSSQL`, `URUNGI_TEST_MYSQL`,
`URUNGI_TEST_ORACLE`, `URUNGI_TEST_PG`. Each variable, if defined, should
contain database connection parameters as a JSON string.

Example:

    URUNGI_TEST_MSSQL='{"host": "localhost", "port": "1433", "database": "urungi_tests", "user": "urungi", "password": "urungi"}'
    URUNGI_TEST_MYSQL='{"host": "localhost", "port": "3306", "database": "urungi_tests", "user": "urungi", "password": "urungi"}'
    URUNGI_TEST_ORACLE='{"host": "localhost", "port": "1521", "database": "urungi_tests", "user": "urungi", "password": "urungi"}'
    URUNGI_TEST_PG='{"host": "localhost", "port": "5432", "database": "urungi_tests", "user": "urungi", "password": "urungi"}'

Before executing tests, the latest version of MongoDB will be downloaded, and
each test file will get its own instance of MongoDB running with the in-memory
storage engine. This allows tests to run in parallel and ease testing with
different versions of MongoDB.

By default, MongoDB binaries are saved inside `node_modules` directory, which
is deleted each time you call `npm ci`. To avoid re-downloading MongoDB
binaries, use a different download directory by setting environment variable
`MONGOMS_DOWNLOAD_DIR`. For instance

    export MONGOMS_DOWNLOAD_DIR=$HOME/.cache/mongodb-memory-server/mongodb-binaries

Or you can avoid the download by using your already installed MongoDB server

    export MONGOMS_SYSTEM_BINARY=/usr/bin/mongod

All options are described at https://github.com/nodkz/mongodb-memory-server#options-which-can-be-set-via-environment-variables

## Generate coverage reports

To generate a coverage report, run the following command

    npx jest --coverage --coverageReporters lcov

The report will be available at `coverage/lcov-report/`
