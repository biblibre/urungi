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

- [nodejs](https://nodejs.org)
- [npm](https://www.npmjs.com)
- [bower](http://bower.io)
- [MongoDB](https://www.mongodb.org)

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
    bower install
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
    - Password: `widestage`

4. Enjoy!!!


## Tests

[![Build Status](https://travis-ci.org/biblibre/Urungi.svg?branch=master)](https://travis-ci.org/biblibre/Urungi)

To run the tests:

    npm test

To run a single test suite:

    npm test test/file-name.js


## License

[GPL 3.0](https://opensource.org/licenses/GPL-3.0)
