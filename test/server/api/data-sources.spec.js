const helpers = require('../helpers');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoose = require('mongoose');

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
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    mongoose = require('mongoose');
    app = require('../../../server/app');
});
afterAll(async () => {
    await new Promise(resolve => { mongoose.connection.close(resolve); });
    await mongod.stop();
});

async function seed () {
    const Datasource = mongoose.model('Datasource');

    const entries = [
        new Datasource(
            {
                companyID: 'COMPID',
                name: 'dummy db',
                type: 'MySQL',
                status: 1,
                connection: {
                    database: 'non_existent_db',
                    host: 'localhost'
                },
                nd_trash_deleted: false
            }
        ),
        new Datasource(
            {
                companyID: 'COMPID',
                name: 'sql db',
                type: 'MySQL',
                status: 1,
                connection: {
                    database: 'will_need_to_be_created',
                    host: 'localhost'
                }
            }
        )
    ];

    for (const entry of entries) {
        await entry.save();
    }

    return entries;
};

function verifyItem (item) {
    expect(item).toHaveProperty('_id');
    expect(item).toHaveProperty('companyID');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('type');
    expect(item).toHaveProperty('status');
    expect(item).toHaveProperty('connection');
};

describe('Datasources API', function () {
    const datasources = [
        ['mysql', mysql.MysqlAdapter, {
            name: 'MySQL datasource',
            type: 'MySQL',
            connection: { host: 'localhost', port: '3306', database: 'DB', userName: 'root', password: 'secret' },
        }],
        ['pg', pg.PgAdapter, {
            name: 'PostgreSQL datasource',
            type: 'POSTGRE',
            connection: { host: 'localhost', port: '5432', database: 'DB', userName: 'root', password: 'secret' },
        }],
        ['mssql', mssql.MssqlAdapter, {
            name: 'MS SQL datasource',
            type: 'MSSQL',
            connection: { host: 'localhost', port: '1433', database: 'DB', userName: 'root', password: 'secret' },
        }],
        ['oracle', oracle.OracleAdapter, {
            name: 'Oracle datasource',
            type: 'ORACLE',
            connection: { host: 'localhost', port: '1521', database: 'DB', userName: 'root', password: 'secret' },
        }],
    ];

    let Datasource;

    let headers;
    let entries;

    beforeAll(async () => {
        Datasource = mongoose.model('Datasource');
        headers = await helpers.login(app);
        entries = await seed();
    });

    afterAll(async function () {
        for (const entry of entries) {
            await entry.remove();
        }
    });

    describe('GET /api/datasources', function () {
        it('should return status 403', async function () {
            const res = await request(app).get('/api/datasources');

            expect(res.status).toBe(403);
        });

        it('should return all data sources', async function () {
            const res = await request(app).get('/api/datasources')
                .set(headers);

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');

            expect(res.body.data).toHaveLength(2);
            verifyItem(res.body.data[0]);
            verifyItem(res.body.data[1]);
        });
    });

    describe('GET /api/datasources/:datasourceId', function () {
        it('should return status 403', async function () {
            const datasource = await Datasource.findOne();

            const res = await request(app).get('/api/datasources/' + datasource.id);

            expect(res.status).toBe(403);
        });

        it('should find no valid item', async function () {
            const res = await request(app).get('/api/datasources/foo')
                .set(headers);

            expect(res.status).toBe(404);
        });

        it('should find a single valid item', async function () {
            const datasource = await Datasource.findOne();

            const res = await request(app).get('/api/datasources/' + datasource.id)
                .set(headers);

            expect(res.status).toBe(200);

            verifyItem(res.body);
        });
    });

    describe('POST /api/datasources', function () {
        it('should create a datasource', async function () {
            const res = await request(app).post('/api/datasources')
                .set(headers)
                .send({
                    name: 'non existent db',
                    type: 'MySQL',
                    status: 1,
                    connection: {
                        database: 'database_name',
                        host: 'localhost',
                    },
                });

            expect(res.status).toBe(201);

            verifyItem(res.body);

            expect(res.body.connection.database).toBe('database_name');

            await Datasource.deleteOne({ _id: res.body._id });
        });
    });

    describe('PATCH /api/datasources/:datasourceId', function () {
        it('should modify a database entry successfully', async function () {
            const datasource = await Datasource.findOne();

            const res = await request(app).patch('/api/datasources/' + datasource.id)
                .set(headers)
                .send({
                    name: 'renamed dummy db',
                    type: 'MySQL',
                    connection: {
                        database: 'modified_name'
                    }
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('connection.database', 'modified_name');

            const updatedDatasource = await Datasource.findById(datasource.id);
            expect(updatedDatasource).toHaveProperty('connection.database', 'modified_name');
        });
    });

    describe('GET /api/datasources/:datasourceId/collections', function () {
        describe.each(datasources)('%s', function (type, adapter, datasource) {
            let d;
            beforeAll(async function () {
                d = await Datasource.create(datasource);
            });
            afterAll(async function () {
                await d.remove();
            });

            describe('when connection is ok', function () {
                beforeAll(async function () {
                    adapter.prototype.getCollectionNames.mockImplementation(function () {
                        return Promise.resolve(['foo', 'bar', 'baz']);
                    });
                });

                it('should return a list of table names', async function () {
                    const res = await request(app).get('/api/datasources/' + d.id + '/collections')
                        .set(headers);

                    expect(res.status).toBe(200);
                    expect(res.body).toHaveProperty('data');
                    expect(res.body.data).toEqual(['foo', 'bar', 'baz']);
                });
            });

            describe('when connection is not ok', function () {
                beforeAll(async function () {
                    adapter.prototype.getCollectionNames.mockImplementation(function () {
                        return Promise.reject(new Error('Connection error'));
                    });
                });

                it('should return status 500 with an error message', async function () {
                    const res = await request(app).get('/api/datasources/' + d.id + '/collections')
                        .set(headers);

                    expect(res.status).toBe(500);
                    expect(res.body).toHaveProperty('error', 'Connection error');
                });
            });
        });
    });

    describe('GET /api/datasources/:datasourceId/collections/:collectionName', function () {
        describe.each(datasources)('%s', function (type, adapter, datasource) {
            let d;
            beforeAll(async function () {
                d = await Datasource.create(datasource);
            });
            afterAll(async function () {
                await d.remove();
            });

            describe('when connection is ok', function () {
                beforeAll(async function () {
                    adapter.prototype.getCollectionSchema.mockImplementation(function () {
                        return Promise.resolve({ columns: [{ name: 'bar', type: 'string' }] });
                    });
                });

                it('should return a collection', async function () {
                    const res = await request(app).get('/api/datasources/' + d.id + '/collections/foo')
                        .set(headers);

                    expect(res.status).toBe(200);
                    expect(res.body).toEqual({
                        collectionName: 'foo',
                        collectionLabel: 'foo',
                        elements: [
                            {
                                elementName: 'bar',
                                elementLabel: 'bar',
                                elementType: 'string',
                            },
                        ],
                    });
                });
            });

            describe('when connection is not ok', function () {
                beforeAll(async function () {
                    adapter.prototype.getCollectionSchema.mockImplementation(function () {
                        return Promise.reject(new Error('Connection error'));
                    });
                });

                it('should return status 500 with an error message', async function () {
                    const res = await request(app).get('/api/datasources/' + d.id + '/collections/foo')
                        .set(headers);

                    expect(res.status).toBe(500);
                    expect(res.body).toHaveProperty('error', 'Connection error');
                });
            });
        });
    });

    describe('GET /api/datasources/:datasourceId/sql-query-collection', function () {
        describe.each(datasources)('%s', function (type, adapter, datasource) {
            let d;
            beforeAll(async function () {
                d = await Datasource.create(datasource);
            });
            afterAll(async function () {
                await d.remove();
            });

            describe('when connection is ok', function () {
                beforeAll(async function () {
                    adapter.prototype.getSqlQuerySchema.mockImplementation(function () {
                        return Promise.resolve({ columns: [{ name: 'bar', type: 'string' }] });
                    });
                });

                it('should return a collection', async function () {
                    const res = await request(app).get('/api/datasources/' + d.id + '/sql-query-collection')
                        .query({ sqlQuery: 'SELECT * FROM foo', collectionName: 'foo' })
                        .set(headers);

                    expect(res.status).toBe(200);
                    expect(res.body).toEqual({
                        collectionName: 'foo',
                        collectionLabel: 'foo',
                        isSQL: true,
                        sqlQuery: 'SELECT * FROM foo',
                        elements: [
                            {
                                elementName: 'bar',
                                elementLabel: 'bar',
                                elementType: 'string',
                            },
                        ],
                    });
                });
            });

            describe('when connection is not ok', function () {
                beforeAll(async function () {
                    adapter.prototype.getSqlQuerySchema.mockImplementation(function () {
                        return Promise.reject(new Error('Connection error'));
                    });
                });

                it('should return status 500 with an error message', async function () {
                    const res = await request(app).get('/api/datasources/' + d.id + '/collections/sql-query-collection')
                        .query({ sqlQuery: 'SELECT * FROM foo', collectionName: 'foo' })
                        .set(headers);

                    expect(res.status).toBe(500);
                    expect(res.body).toHaveProperty('error', 'Connection error');
                });
            });
        });
    });
});
