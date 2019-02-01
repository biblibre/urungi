# Urungi

Lightweight Business Intelligence tool for reporting MongoDB, PostgreSQL, MySQL
and others, see [Supported databases](#supported-databases)


## Supported databases

- MongoDB
- PostgreSQL
- MySQL
- MS SQL Server
- Oracle
- Google Big Query


## Requirements

- [nodejs](https://nodejs.org) (>= 8.x)
- [npm](https://www.npmjs.com)
- [MongoDB](https://www.mongodb.org)
- [OpenJDK](http://openjdk.java.net/install/)
- g++ and make (package build-essential on Debian-based distributions)

MongoDB is used to store Urungi metadata, you have to install it even if you are
not going to explore MondoDB data.


## Installation

1. Install the requirements listed above
2. Clone the github repository

    ```
    git clone https://github.com/biblibre/urungi.git
    cd urungi
    ```

3. Download and install dependencies

    ```
    npm ci
    ```


## Configuration

Urungi uses [config](https://www.npmjs.com/package/config) to manage its
configuration files.

You can change the configuration by creating a file in `config/` directory named
`local-{env}.js` (where {env} is one of: `production`, `development`) and
overriding any properties defined in `config/default.js`

More info at https://github.com/lorenwest/node-config/wiki/Configuration-Files


## Oracle connections

If you are going to use oracle connections, first you need to install in your
server the Oracle instant client and then run:

    npm install oracledb

More info at https://github.com/oracle/node-oracledb


## Starting up the Urungi server

1. Launch the server

    ```
    npm start
    ```

2. Point your browser to your ip/server name (eg. http://localhost:8080)
3. Enter the credentials

    - Username: `administrator`
    - Password: `urungi`

4. Enjoy!!!


## Upgrade

To upgrade Urungi to the latest version, follow these steps:

1. Update sources

    ```
    git pull --rebase
    ```

2. Update dependencies

    ```
    npm ci
    ```

3. Update database

    ```
    npx migrate-mongo up
    ```

4. Restart the server


## Tests

[![Build Status](https://travis-ci.org/biblibre/urungi.svg?branch=master)](https://travis-ci.org/biblibre/urungi)

To run the tests:

    npm test

Some tests need SQL databases to connect to. To run those tests, copy
config/test.js to config/local-test.js and modify the configured datasources
accordingly. If database servers are not available, tests will be skipped.

## License

[GPL 3.0](https://opensource.org/licenses/GPL-3.0)
