const helpers = require('../helpers');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

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
    app = require('../../../server/app');
});
afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});

describe('Query API', function () {
    const datasources = [
        ['mysql', mysql.MysqlAdapter, {
            type: 'MySQL',
            name: 'MySQL',
            connection: { host: 'localhost', port: '3306', database: 'DB', userName: 'root', password: 'secret' },
        }],
        ['pg', pg.PgAdapter, {
            type: 'POSTGRE',
            name: 'PostgreSQL',
            connection: { host: 'localhost', port: '5432', database: 'DB', userName: 'root', password: 'secret' },
        }],
        ['mssql', mssql.MssqlAdapter, {
            type: 'MSSQL',
            name: 'SQL Server',
            connection: { host: 'localhost', port: '1433', database: 'DB', userName: 'root', password: 'secret' },
        }],
        ['oracle', oracle.OracleAdapter, {
            type: 'ORACLE',
            name: 'Oracle',
            connection: { host: 'localhost', port: '1521', database: 'DB', userName: 'root', password: 'secret' },
        }],
    ];

    let headers;

    let Datasource, Layer;

    beforeAll(async () => {
        Datasource = mongoose.model('Datasource');
        Layer = mongoose.model('Layer');

        headers = await helpers.login(app);
    });

    describe('POST /api/reports/data-query', function () {
        describe.each(datasources)('with %s', function (type, adapter, datasource) {
            let ds, layer;

            beforeEach(function () {
                adapter.prototype.getQueryResults.mockReset();
                adapter.prototype.getQueryResults.mockImplementation(function () {
                    return Promise.resolve({ data: [{ artist_1_name_raw: 'foo' }] });
                });
            });

            beforeEach(async function () {
                ds = await Datasource.create(datasource);
                layer = await Layer.create(Object.assign({}, getLayer(), {
                    datasourceID: ds._id,
                }));
            });
            afterEach(async function () {
                await layer.deleteOne();
                await ds.deleteOne();
            });

            it('should call getQueryResults with correct parameters', async function () {
                const report = {
                    properties: {
                        columns: [
                            {
                                elementID: 'artist_1_name',
                                id: 'artist_1_name_raw',
                            },
                            {
                                elementID: 'song_1_title',
                                id: 'song_1_title_raw',
                            },
                        ],
                    },
                    selectedLayerID: layer._id,
                };

                const res = await request(app).post('/api/reports/data-query')
                    .set(headers)
                    .send({ report })
                    .expect(200);

                const expectedQuery = {
                    columns: [
                        expect.objectContaining({
                            collectionID: 'artist_1',
                            elementID: 'artist_1_name',
                            elementName: 'name',
                            id: 'artist_1_name_raw',
                        }),
                        expect.objectContaining({
                            collectionID: 'song_1',
                            elementID: 'song_1_title',
                            elementName: 'title',
                            id: 'song_1_title_raw',
                        }),
                    ],
                    joinTree: expect.objectContaining({
                        collection: expect.objectContaining({
                            collectionID: 'artist_1',
                            collectionName: 'artist',
                        }),
                        joins: [
                            expect.objectContaining({
                                collection: expect.objectContaining({
                                    collectionID: 'album_1',
                                    collectionName: 'album',
                                }),
                                parentJoin: expect.objectContaining(layer.toObject().params.joins[0]),
                                joins: [
                                    expect.objectContaining({
                                        collection: expect.objectContaining({
                                            collectionID: 'song_1',
                                            collectionName: 'song',
                                        }),
                                        parentJoin: expect.objectContaining(layer.toObject().params.joins[1]),
                                        joins: [],
                                    }),
                                ],
                            }),
                        ],
                    }),
                    layer: expect.objectContaining({
                        _id: layer._id,
                    }),
                    order: [],
                    page: 1,
                };

                expect(adapter.prototype.getQueryResults).toHaveBeenCalledWith(expect.objectContaining(expectedQuery));
                expect(res.body).toHaveProperty('data');
                expect(res.body.data).toHaveLength(1);
                expect(res.body.data[0]).toEqual({ artist_1_name_raw: 'foo' });
            });
        });
    });

    describe('POST /api/reports/filter-values-query', function () {
        describe.each(datasources)('with %s', function (type, adapter, datasource) {
            let ds, layer;

            beforeEach(function () {
                adapter.prototype.getQueryResults.mockReset();
                adapter.prototype.getQueryResults.mockImplementation(function () {
                    return Promise.resolve({ data: [{ f: 'foo' }] });
                });
            });

            beforeEach(async function () {
                ds = await Datasource.create(datasource);
                layer = await Layer.create(Object.assign({}, getLayer(), {
                    datasourceID: ds._id,
                }));
            });
            afterEach(async function () {
                await layer.deleteOne();
                await ds.deleteOne();
            });

            it('should call getQueryResults with correct parameters', async function () {
                const filter = {
                    collectionID: 'artist_1',
                    elementID: 'artist_1_name',
                    elementName: 'name',
                    elementType: 'string',
                    layerID: layer._id,
                };

                const res = await request(app).post('/api/reports/filter-values-query')
                    .set(headers)
                    .send({ filter })
                    .expect(200);

                const expectedQuery = expect.objectContaining({
                    columns: [
                        expect.objectContaining({
                            elementID: 'artist_1_name',
                            id: 'f',
                        }),
                        expect.objectContaining({
                            elementID: 'artist_1_name',
                            id: 'count',
                            aggregation: 'count',
                        }),
                    ],
                    groupKeys: [
                        expect.objectContaining({
                            elementID: 'artist_1_name',
                            id: 'f',
                        }),
                    ],
                    order: [
                        expect.objectContaining({
                            elementID: 'artist_1_name',
                            id: 'f',
                            sortDesc: false,
                        }),
                    ],
                });

                expect(adapter.prototype.getQueryResults).toHaveBeenCalledWith(expectedQuery);
                const data = res.body.data;
                expect(data).toEqual([{ f: 'foo' }]);
            });
        });
    });
});

function getLayer () {
    return {
        name: 'empty layer',
        status: 'active',
        params: {
            schema: [
                {
                    collectionID: 'artist_1',
                    collectionName: 'artist',
                    elements: [
                        {
                            collectionID: 'artist_1',
                            collectionName: 'artist',
                            elementID: 'artist_1_artist_id',
                            elementName: 'id',
                        },
                        {
                            collectionID: 'artist_1',
                            collectionName: 'artist',
                            elementID: 'artist_1_name',
                            elementName: 'name',
                        },
                    ],
                },
                {
                    collectionID: 'album_1',
                    collectionName: 'album',
                    elements: [
                        {
                            collectionID: 'album_1',
                            collectionName: 'album',
                            elementID: 'album_1_album_id',
                            elementName: 'album_id',
                        },
                        {
                            collectionID: 'album_1',
                            collectionName: 'album',
                            elementID: 'album_1_artist_id',
                            elementName: 'artist_id',
                        },
                        {
                            collectionID: 'album_1',
                            collectionName: 'album',
                            elementID: 'album_1_title',
                            elementName: 'title',
                        },
                    ],
                },
                {
                    collectionID: 'song_1',
                    collectionName: 'song',
                    elements: [
                        {
                            collectionID: 'song_1',
                            collectionName: 'song',
                            elementID: 'song_1_song_id',
                            elementName: 'song_id',
                        },
                        {
                            collectionID: 'song_1',
                            collectionName: 'song',
                            elementID: 'song_1_album_id',
                            elementName: 'album_id',
                        },
                        {
                            collectionID: 'song_1',
                            collectionName: 'song',
                            elementID: 'song_1_title',
                            elementName: 'title',
                        },
                    ],
                },
            ],
            joins: [
                {
                    sourceCollectionID: 'artist_1',
                    sourceCollectionName: 'artist',
                    sourceElementID: 'artist_1_artist_id',
                    sourceElementName: 'artist_id',
                    targetCollectionID: 'album_1',
                    targetCollectionName: 'album',
                    targetElementID: 'album_1_artist_id',
                    targetElementName: 'artist_id',
                },
                {
                    sourceCollectionID: 'album_1',
                    sourceCollectionName: 'album',
                    sourceElementID: 'album_1_album_id',
                    sourceElementName: 'album_id',
                    targetCollectionID: 'song_1',
                    targetCollectionName: 'song',
                    targetElementID: 'song_1_album_id',
                    targetElementName: 'album_id',
                },
            ],
        },
        objects: [
            {
                collectionID: 'artist_1',
                collectionName: 'artist',
                elementID: 'artist_1_name',
                elementName: 'name',
            },
            {
                collectionID: 'song_1',
                collectionName: 'song',
                elementID: 'song_1_title',
                elementName: 'title',
            },
        ],
    };
}
