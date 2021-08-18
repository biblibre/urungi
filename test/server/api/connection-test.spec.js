const helpers = require('../helpers');
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const mysql = require('../../../server/database-adapters/mysql.js');
const pg = require('../../../server/database-adapters/pg.js');
const mssql = require('../../../server/database-adapters/mssql.js');
const oracle = require('../../../server/database-adapters/oracle.js');

jest.mock('../../../server/database-adapters/mysql.js');
jest.mock('../../../server/database-adapters/pg.js');
jest.mock('../../../server/database-adapters/mssql.js');
jest.mock('../../../server/database-adapters/oracle.js');

let app;
let mongod;
beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.MONGODB_URI = await mongod.getUri();
    app = require('../../../server/app');
});
afterAll(async () => {
    await new Promise(resolve => { mongoose.connection.close(resolve); });
    await mongod.stop();
});

describe('Connection Test API', function () {
    let headers;

    beforeAll(async () => {
        headers = await helpers.login(app);
    });

    describe('POST /api/connection-test', function () {
        const datasources = [
            ['mysql', mysql.MysqlAdapter, {
                type: 'MySQL',
                connection: { host: 'localhost', port: '3306', database: 'DB', userName: 'root', password: 'secret' },
            }],
            ['pg', pg.PgAdapter, {
                type: 'POSTGRE',
                connection: { host: 'localhost', port: '5432', database: 'DB', userName: 'root', password: 'secret' },
            }],
            ['mssql', mssql.MssqlAdapter, {
                type: 'MSSQL',
                connection: { host: 'localhost', port: '1433', database: 'DB', userName: 'root', password: 'secret' },
            }],
            ['oracle', oracle.OracleAdapter, {
                type: 'ORACLE',
                connection: { host: 'localhost', port: '1521', database: 'DB', userName: 'root', password: 'secret' },
            }],
        ];

        describe('when using an invalid datasource', function () {
            beforeAll(function () {
                mysql.MysqlAdapter.prototype.testConnection.mockImplementation(function () {
                    return Promise.reject(new Error('Connection error'));
                });
                pg.PgAdapter.prototype.testConnection.mockImplementation(function () {
                    return Promise.reject(new Error('Connection error'));
                });
                mssql.MssqlAdapter.prototype.testConnection.mockImplementation(function () {
                    return Promise.reject(new Error('Connection error'));
                });
                oracle.OracleAdapter.prototype.testConnection.mockImplementation(function () {
                    return Promise.reject(new Error('Connection error'));
                });
            });

            it.each(datasources)('should return an error (%s)', async function (type, adapter, datasource) {
                const res = await request(app).post('/api/connection-test')
                    .set(headers)
                    .send(datasource);

                expect(adapter).toHaveBeenCalledWith({
                    host: datasource.connection.host,
                    port: datasource.connection.port,
                    database: datasource.connection.database,
                    user: datasource.connection.userName,
                    password: datasource.connection.password,
                });

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('ok', false);
                expect(res.body).toHaveProperty('error', 'Connection error');
            });
        });

        describe('when using a valid datasource', function () {
            beforeAll(function () {
                mysql.MysqlAdapter.prototype.testConnection.mockImplementation(function () {
                    return Promise.resolve();
                });
                pg.PgAdapter.prototype.testConnection.mockImplementation(function () {
                    return Promise.resolve();
                });
                mssql.MssqlAdapter.prototype.testConnection.mockImplementation(function () {
                    return Promise.resolve();
                });
                oracle.OracleAdapter.prototype.testConnection.mockImplementation(function () {
                    return Promise.resolve();
                });
            });

            it.each(datasources)('should return ok (%s)', async function (type, adapter, datasource) {
                const res = await request(app).post('/api/connection-test')
                    .set(headers)
                    .send(datasource);

                expect(adapter).toHaveBeenCalledWith({
                    host: datasource.connection.host,
                    port: datasource.connection.port,
                    database: datasource.connection.database,
                    user: datasource.connection.userName,
                    password: datasource.connection.password,
                });

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('ok', true);
            });
        });
    });
});
