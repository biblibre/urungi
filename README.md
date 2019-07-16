# Urungi

Lightweight Business Intelligence tool for reporting PostgreSQL, MySQL
and others, see [Supported databases](#supported-databases)

[![Travis (.org) branch](https://img.shields.io/travis/biblibre/urungi/master.svg)](https://travis-ci.org/biblibre/urungi)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/biblibre/urungi.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/biblibre/urungi/context:javascript)

## Supported databases

- PostgreSQL
- MySQL
- MS SQL Server
- Oracle


## Requirements

- [nodejs](https://nodejs.org) (>= 8.x)
- [npm](https://www.npmjs.com)
- [MongoDB](https://www.mongodb.org) (>= 3.4)


## Installation

1. Install the requirements listed above
2. Clone the github repository

    ```
    git clone https://github.com/biblibre/urungi.git
    cd urungi
    ```

3. Download and install dependencies

    ```
    # In development environment
    npm ci
    
    # In production environment
    npm ci --only=production
    ```

4. Run MongoDB migrations

    ```
    # In development environment
    npx migrate-mongo up
    
    # In production environment
    NODE_ENV=production npx migrate-mongo up
    ```

5. (Optional but recommended) Create a local config file and change the
   session's secret (see [Configuration](#configuration))

## Configuration

Urungi uses [config](https://www.npmjs.com/package/config) to manage its
configuration files.

You can change the configuration by creating a file in `config/` directory named
`local-{env}.js` (where {env} is one of: `production`, `development`) and
overriding any properties defined in `config/default.js`

More info at https://github.com/lorenwest/node-config/wiki/Configuration-Files


## Oracle connections

If you are going to use oracle connections, Oracle Client libraries must be
installed. To get libraries, install an Instant Client Basic or Basic Light
package from
https://www.oracle.com/database/technologies/instant-client/downloads.html

Installation instructions: https://oracle.github.io/node-oracledb/INSTALL.html


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
    # In development environment
    npm ci
    
    # In production environment
    npm ci --only=production
    ```

3. Update database

    ```
    # In development environment
    npx migrate-mongo up
    
    # In production environment
    NODE_ENV=production npx migrate-mongo up
    ```

4. Restart the server


## Tests

To run the tests:

    npm test

Some tests need SQL databases to connect to. To run those tests, copy
config/test.js to config/local-test.js and modify the configured datasources
accordingly. The 'status' property determines if the corresponding tests will
be executed or not.

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

## License

[GPL 3.0](https://opensource.org/licenses/GPL-3.0)
