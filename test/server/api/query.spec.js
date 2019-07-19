const Knex = require('knex');
const helpers = require('../helpers');
const request = require('supertest');
const config = require('config');
const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoose = require('mongoose');

let app;
let mongod;
beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.MONGODB_URI = await mongod.getConnectionString();
    jest.resetModules(); // Needed for config to take MONGODB_URI into account
    mongoose = require('mongoose');
    app = require('../../../server/app');
});
afterAll(async () => {
    await new Promise(resolve => { mongoose.connection.close(resolve); });
    await mongod.stop();
});

const userInfo = {
    userName: 'administrator',
    password: 'urungi',
    id: '5b7e6bc911485d03a6afe1c7',
    compID: 'COMPID'
};

const testData = [
    {
        tableName: 'gems',
        collectionID: 'Caaaa',
        tableColumns: [
            {
                columnName: 'id',
                elementID: 'eeaa',
                type: 'integer',
                elementType: 'number'
            },
            {
                columnName: 'name',
                elementID: 'eeab',
                type: 'string',
                elementType: 'string'
            },
            {
                columnName: 'colour',
                elementID: 'eeac',
                type: 'string',
                elementType: 'string'
            },
            {
                columnName: 'isFusion',
                elementID: 'eead',
                type: 'boolean',
                elementType: 'number'
            }
        ],
        tableData: [
            {
                'id': 0,
                'name': 'amethyst',
                'colour': 'purple',
                'isFusion': false
            },
            {
                'id': 1,
                'name': 'pearl',
                'colour': 'white',
                'isFusion': false
            },
            {
                'id': 2,
                'name': 'garnet',
                'colour': 'purple',
                'isFusion': true
            },
            {
                'id': 3,
                'name': 'peridot',
                'colour': 'green',
                'isFusion': false
            },
            {
                'id': 4,
                'name': 'Lapis-Lazuli',
                'colour': 'blue',
                'isFusion': false
            },
            {
                'id': 5,
                'name': 'Sugalite',
                'colour': 'purple',
                'isFusion': true
            },
            {
                'id': 6,
                'name': 'Sardonyx',
                'colour': 'purple',
                'isFusion': true
            },
            {
                'id': 7,
                'name': 'Opal',
                'colour': 'blue',
                'isFusion': true
            },
            {
                'id': 8,
                'name': 'Jasper',
                'colour': 'yellow',
                'isFusion': false
            },
            {
                'id': 9,
                'name': 'Malachite',
                'colour': 'green',
                'isFusion': true
            },
            {
                'id': 10,
                'name': 'Ruby',
                'colour': 'red',
                'isFusion': false
            },
            {
                'id': 11,
                'name': 'Saphire',
                'colour': 'blue',
                'isFusion': false
            },
            {
                'id': 101,
                'name': 'Steven',
                'colour': 'pink',
                'isFusion': false
            },
            {
                'id': 103,
                'name': 'Stevonie',
                'colour': 'pink',
                'isFusion': true
            },

        ]
    }, {
        tableName: 'humans',
        collectionID: 'Caaba',
        tableColumns: [
            {
                columnName: 'id',
                elementID: 'eeae',
                type: 'integer',
                elementType: 'number'
            },
            {
                columnName: 'name',
                elementID: 'eeaf',
                type: 'string',
                elementType: 'string'
            },
            {
                columnName: 'age',
                elementID: 'eeag',
                type: 'integer',
                elementType: 'number'
            },
            {
                columnName: 'isFusion',
                elementID: 'eeah',
                type: 'boolean',
                elementType: 'string'
            }
        ],
        tableData: [
            {
                'id': 101,
                'name': 'Steven',
                'age': 14,
                'isFusion': false
            },
            {
                'id': 102,
                'name': 'Connie',
                'age': 12,
                'isFusion': false
            },
            {
                'id': 103,
                'name': 'Stevonie',
                'isFusion': true
            },
            {
                'id': 104,
                'name': 'Greg',
                'age': 40,
                'isFusion': false
            },

        ]
    },
    {
        tableName: 'weapons',
        collectionID: 'Caaab',
        tableColumns: [
            {
                columnName: 'id',
                elementID: 'eeba',
                type: 'integer',
                elementType: 'number'
            },
            {
                columnName: 'name',
                elementID: 'eebb',
                type: 'string',
                elementType: 'string'
            },
            {
                columnName: 'gemId',
                elementID: 'eebc',
                type: 'integer',
                elementType: 'number'
            }
        ],
        tableData: [
            {
                'id': 7,
                'name': 'whip',
                'gemId': 0
            },
            {
                'id': 15,
                'name': 'fists',
                'gemId': 2
            },
            {
                'id': 16,
                'name': 'fist',
                'gemId': 10
            },
            {
                'id': 834,
                'name': 'spear',
                'gemId': 1
            },
            {
                'id': 12,
                'name': 'helmet',
                'gemId': 8
            },
            {
                'id': 4,
                'name': 'Telkinesis; Depression',
                'gemId': 4
            },
            {
                'id': 206,
                'name': 'Shield',
                'gemId': 101
            },
            {
                'id': 206,
                'name': 'Sword',
                'gemId': 102
            },
            {
                'id': 206,
                'name': 'Shield',
                'gemId': 103
            },
            {
                'id': 206,
                'name': 'Sword',
                'gemId': 103
            }
        ]
    },
    {
        tableName: 'episodes',
        collectionID: 'Caaac',
        tableColumns: [
            {
                columnName: 'id',
                elementID: 'eeca',
                type: 'string',
                elementType: 'string'
            },
            {
                columnName: 'title',
                elementID: 'eecb',
                type: 'string',
                elementType: 'string'
            },
            {
                columnName: 'publishDate',
                elementID: 'eecc',
                type: 'date',
                elementType: 'date'
            }
        ],
        tableData: [
            {
                'id': 'ijosd3-qs2dqo98k-qs',
                'title': 'Laser Light Canon',
                'publishDate': new Date('2013-12-04')
            },
            {
                'id': 'oudh7khs-54fdt12-s',
                'title': 'Steven\'s Lion',
                'publishDate': new Date('2014-02-27')
            },
            {
                'id': 'oijs7g2-dgc09-qjds',
                'title': 'Giant Woman',
                'publishDate': new Date('2014-03-24')
            },
            {
                'id': 'ipjqd56-ftfls2-4',
                'title': 'Jail Break',
                'publishDate': new Date('2015-05-12')
            },
            {
                'id': 'ujsd-2-sijd67jisql',
                'title': 'Full Disclosure',
                'publishDate': new Date('2015-05-13')
            },
            {
                'id': 'okpsd123-hidsi77-d',
                'title': 'Sworn to the sword',
                'publishDate': new Date('2015-07-15')
            },
            {
                'id': 'nfsujis7_dyiq-2',
                'title': 'It could\'ve been great',
                'publishDate': new Date('2016-02-06')
            },
            {
                'id': 'ojoqjdo0099098',
                'title': 'The question',
                'publishDate': new Date('2018-07-04')
            }
        ]
    },
    {
        tableName: 'songs',
        collectionID: 'Caaad',
        tableColumns: [
            {
                columnName: 'id',
                elementID: 'eeda',
                type: 'integer',
                elementType: 'number'
            },
            {
                columnName: 'Title',
                elementID: 'eedb',
                type: 'string',
                elementType: 'string'
            },
            {
                columnName: 'episodeId',
                elementID: 'eedc',
                type: 'string',
                elementType: 'string'
            },
            {
                columnName: 'singerId',
                elementID: 'eedd',
                type: 'integer',
                elementType: 'number'
            }
        ],
        tableData: [
            {
                'id': 0,
                'Title': 'You do it for him',
                'episodeId': 'okpsd123-hidsi77-d',
                'singerId': 1
            },
            {
                'id': 1,
                'Title': 'Stronger than you',
                'episodeId': 'ipjqd56-ftfls2-4',
                'singerId': 2
            },
            {
                'id': 2,
                'Title': 'Full disclosure',
                'episodeId': 'ujsd-2-sijd67jisql',
                'singerId': 101
            },
            {
                'id': 3,
                'Title': 'Peace and love',
                'episodeId': 'nfsujis7_dyiq-2',
                'singerId': 3
            },
            {
                'id': 4,
                'Title': 'Ruby rider',
                'episodeId': 'ojoqjdo0099098',
                'singerId': 10
            },
            {
                'id': 5,
                'Title': 'Giant Woman',
                'episodeId': 'oijs7g2-dgc09-qjds',
                'singerId': 101
            },
        ]
    }
];

const testDataRef = {};

for (const table of testData) {
    testDataRef[table.tableName] = table;
}

var dtsId;
var simpleId;
var complexId;

const simpleLayer = {
    createdBy: userInfo.id,
    companyID: userInfo.compID,
    name: 'simple',
    description: 'A simple layer, to test basic query functionalities',
    status: 1,
    nd_trash_deleted: false,

    objects: [],
    params: {
        joins: [
            {
                joinID: 'Jjjaa',
                joinType: 'default',
                sourceCollectionID: 'Caaaa',
                sourceCollectionName: 'gems',
                sourceElementID: 'eeaa',
                sourceElementName: 'id',
                targetCollectionID: 'Caaab',
                targetCollectionName: 'weapons',
                targetElementID: 'eebc',
                targetElementName: 'gemId',
            }
        ],
        schema: []
    },
};

for (const table of testData) {
    const collectionID = table.collectionID;
    const collectionName = table.tableName;

    simpleLayer.params.schema.push({
        collectionID,
        collectionName,
        component: 0,
        elements: table.tableColumns.map(element => {
            return {
                collectionID,
                component: 0,

                elementID: element.elementID,
                elementRole: 'dimension',
                elementType: element.elementType,
                elementName: element.columnName
            };
        }),
    });

    for (const element of table.tableColumns) {
        simpleLayer.objects.push({
            collectionID,
            component: 0,

            elementID: element.elementID,
            elementRole: 'dimension',
            elementType: element.elementType,
            elementName: element.columnName
        });
    }
}

function findElement (elementID, list, f) {
    for (const el of list) {
        if (el.elementID === elementID) {
            f(el);
        }
        if (el.elements) {
            findElement(elementID, el.elements, f);
        }
    }
}

describe('Queries and data access', function () {
    const datasources = config.get('tests.datasources');
    for (const datasource of Object.values(datasources)) {
        if (datasource.status === 1) {
            // eslint-disable-next-line jest/valid-describe
            describe(datasource.name, function () {
                const knexClientsByDatasourceType = {
                    'MySQL': 'mysql',
                    'POSTGRE': 'pg',
                    'ORACLE': 'oracledb',
                    'MSSQL': 'mssql',
                };

                const entries = [];

                var knex;
                var DataSources;
                var Layers;

                let headers;

                beforeAll(async () => {
                    DataSources = mongoose.model('DataSources');
                    Layers = mongoose.model('Layers');
                    headers = await helpers.login(app);
                });

                beforeAll(async function () {
                    const config = {
                        client: knexClientsByDatasourceType[datasource.type],
                        connection: {
                            host: datasource.connection.host,
                            port: datasource.connection.port,
                            user: datasource.connection.userName,
                            password: datasource.connection.password,
                            database: datasource.connection.database,
                        },
                    };
                    knex = Knex(config);

                    for (const table of testData) {
                        await knex.schema.dropTableIfExists(table.tableName);
                        await knex.schema.createTable(table.tableName, function (builder) {
                            for (const column of table.tableColumns) {
                                switch (column.type) {
                                case 'string':
                                    builder.string(column.columnName);
                                    break;
                                case 'integer':
                                    builder.integer(column.columnName);
                                    break;
                                case 'date':
                                    builder.dateTime(column.columnName);
                                    break;
                                case 'boolean':
                                    builder.boolean(column.columnName);
                                }
                            }
                        });

                        await knex(table.tableName).insert(table.tableData);
                    }

                    const dts = new DataSources({
                        createdOn: new Date(),
                        name: 'query tests',
                        createdBy: userInfo.id,
                        companyID: userInfo.compID,
                        status: 1,
                        type: datasource.type,
                        connection: datasource.connection,
                    });

                    const createdDts = await dts.save();

                    dtsId = createdDts._id.toString();

                    entries.push(createdDts);

                    simpleLayer.datasourceID = dtsId;

                    const createdSL = await Layers.create(simpleLayer);

                    simpleId = createdSL._id;
                    entries.push(createdSL);

                    const complexLayer = buildComplexLayer(knex);
                    complexLayer.datasourceID = dtsId;

                    const createdCL = await Layers.create(complexLayer);

                    expect(createdCL).toHaveProperty('_id');
                    complexId = createdCL._id;
                    entries.push(createdCL);
                });

                afterAll(async function () {
                    for (const entry of entries) {
                        await entry.remove();
                    }
                    await knex.destroy();
                });

                describe('Test datasource queries', function () {
                    it('Should test /api/data-sources/testConnection', async function () {
                        const params = {
                            type: datasource.type,

                            host: datasource.connection.host,
                            userName: datasource.connection.userName,
                            password: datasource.connection.password,
                            database: datasource.connection.database
                        };

                        const res = await request(app).post('/api/data-sources/testConnection')
                            .set(headers)
                            .send(params)
                            .expect(200);

                        expect(res.body.result).toBe(1);
                    });

                    it('Should test /api/data-sources/getEntities', async function () {
                        const res = await request(app).get('/api/data-sources/getEntities')
                            .set(headers)
                            .query({ id: dtsId })
                            .expect(200);

                        const result = JSON.parse(res.text);

                        expect(result.result).toBe(1);
                        expect(result.items).toBeInstanceOf(Array);

                        const data = result.items;

                        const sourceData = [];
                        for (const table of testData) {
                            sourceData.push({ name: table.tableName });
                        }

                        data.sort(compareOn(a => a.name));
                        sourceData.sort(compareOn(a => a.name));

                        expect(data).toHaveLength(sourceData.length);

                        for (const i in data) {
                            expect(data[i].name).toBe(sourceData[i].name);
                        }
                    });

                    it('Should test /api/data-sources/getEntitySchema', async function () {
                        for (const table of testData) {
                            const params = {
                                datasourceID: dtsId,
                                entity: JSON.stringify({
                                    database: datasource.connection.database,
                                    name: table.tableName
                                })
                            };

                            const res = await request(app).get('/api/data-sources/getEntitySchema')
                                .set(headers)
                                .query(params)
                                .expect(200);

                            const result = JSON.parse(res.text);

                            expect(result.result).toBe(1);

                            const schema = result.schema;

                            expect(schema.collectionName).toBe(table.tableName);
                            expect(schema.elements).toHaveLength(table.tableColumns.length);

                            expect(schema.elements[0]).toHaveProperty('elementName');
                            expect(schema.elements[0]).toHaveProperty('elementType');
                            expect(schema.elements[0]).toHaveProperty('elementLabel');
                        }
                    });

                    it('Should test /api/data-sources/getsqlQuerySchema', async function () {
                        const params = {
                            datasourceID: dtsId,
                            collection: JSON.stringify({
                                sqlQuery: 'select * from gems',
                                name: 'simple query'
                            })
                        };

                        const res = await request(app).get('/api/data-sources/getsqlQuerySchema')
                            .query(params)
                            .set(headers)
                            .expect(200);

                        const result = JSON.parse(res.text);

                        expect(result.result).toBe(1);

                        const schema = result.schema;

                        expect(schema.collectionName).toBe('simple query');
                        expect(schema.isSQL).toBe(true);
                        expect(schema.sqlQuery).toBe('select * from gems');

                        schema.elements.sort(compareOn(a => a.elementName));

                        const sourceData = testDataRef['gems'].tableColumns.map((item) => ({
                            elementName: item.columnName,
                            elementType: item.elementType,
                            type: item.type,
                        })).sort(compareOn(a => a.elementName));

                        expect(schema.elements).toHaveLength(sourceData.length);

                        for (const i in schema.elements) {
                            const element = schema.elements[i];
                            expect(element.elementName).toBe(sourceData[i].elementName);
                            expect(element.elementType).toBe(jsTypeFromDbType(datasource.type, sourceData[i].type), sourceData[i].type);
                            expect(element).toHaveProperty('elementLabel');
                        }
                    });
                });

                describe('Test report queries with a simple layer', function () {
                    it('Should query a single field', async function () {
                        const query = {
                            layerID: simpleId,
                            columns: [],
                            order: [],
                            filters: []
                        };

                        query.columns.push({
                            elementID: 'eeab',
                            id: 'namefield',
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        const sourceData = testDataRef['gems'].tableData;

                        expect(data).toHaveLength(sourceData.length);
                        expect(data[0]).toHaveProperty('namefield');
                    });

                    it('should not use GROUP BY when there is no aggregation', async function () {
                        const query = {
                            layerID: simpleId,
                            columns: [
                                {
                                    elementID: 'eeac',
                                    id: 'color',
                                },
                            ],
                            order: [],
                            filters: [
                                {
                                    elementID: 'eeac',
                                    filterType: 'equal',
                                    criterion: {
                                        text1: 'purple'
                                    }
                                },
                            ],
                        };

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        expect(data).toHaveLength(4);
                        expect(data[0].color).toBe('purple');
                        expect(data[1].color).toBe('purple');
                        expect(data[2].color).toBe('purple');
                        expect(data[3].color).toBe('purple');
                    });

                    it('Should query with order and filter', async function () {
                        const query = {
                            layerID: simpleId,
                            columns: [],
                            order: [],
                            filters: []
                        };

                        query.columns.push({
                            elementID: 'eeab',
                            id: 'namefield',
                        });

                        query.columns.push({
                            elementID: 'eeac',
                            id: 'colourfield',
                        });

                        query.order.push({
                            elementID: 'eeab',
                            id: 'namefield',
                            sortType: 1
                        });

                        query.filters.push({
                            elementID: 'eeac',
                            filterType: 'equal',
                            criterion: {
                                text1: 'purple'
                            }
                        });
                        query.filters.push({
                            elementID: 'eeab',
                            filterType: 'startWith',
                            criterion: {
                                text1: 'S'
                            }
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        expect(data).toHaveLength(2);
                        expect(data[0]).toHaveProperty('namefield', 'Sardonyx');
                        expect(data[0]).toHaveProperty('colourfield', 'purple');
                        expect(data[1]).toHaveProperty('namefield', 'Sugalite');
                        expect(data[1]).toHaveProperty('colourfield', 'purple');
                    });

                    it('Should query with aggregation', async function () {
                        const query = {
                            layerID: simpleId,
                            columns: [],
                            order: [],
                            filters: []
                        };

                        query.columns.push({
                            elementID: 'eeaa',
                            id: 'countfield',
                            aggregation: 'count'
                        });

                        query.columns.push({
                            elementID: 'eeac',
                            id: 'colourfield',
                        });

                        query.order.push({
                            elementID: 'eeac',
                            id: 'colourfield',
                            sortType: 1
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        var sourceData = testDataRef['gems'].tableData.filter(() => true).sort(compareOn(a => a.colour)).reduce((acc, cur) => {
                            if (acc.length > 0 && cur.colour === acc[acc.length - 1].colour) {
                                acc[acc.length - 1].count += 1;
                            } else {
                                acc.push({
                                    colour: cur.colour,
                                    count: 1
                                });
                            }
                            return acc;
                        }, []);

                        expect(data).toHaveLength(sourceData.length);

                        for (const i in data) {
                            expect(+data[i].countfield).toBe(sourceData[i].count);
                            expect(data[i].colourfield).toBe(sourceData[i].colour);
                        }
                    });

                    it('Should query with a join', async function () {
                        const query = {
                            layerID: simpleId,
                            columns: [],
                            order: [],
                            filters: []
                        };

                        query.columns.push({
                            elementID: 'eeab',
                            id: 'namefield',
                        });

                        query.columns.push({
                            elementID: 'eeac',
                            id: 'colourfield',
                        });

                        query.columns.push({
                            elementID: 'eeaa',
                            id: 'countfield',
                        });

                        query.columns.push({
                            elementID: 'eebb',
                            id: 'weaponname',
                        });

                        query.order.push({
                            elementID: 'eeaa',
                            id: 'countfield',
                            sortType: -1
                        });
                        query.order.push({
                            elementID: 'eebb',
                            id: 'weaponname',
                            sortType: -1
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        expect(data).toHaveLength(9);
                        expect(data[0].namefield).toBe('Stevonie');
                        expect(data[0].colourfield).toBe('pink');
                        expect(data[0].countfield).toBe(103);
                        expect(data[0].weaponname).toBe('Sword');
                        expect(data[1].namefield).toBe('Stevonie');
                        expect(data[1].colourfield).toBe('pink');
                        expect(data[1].countfield).toBe(103);
                        expect(data[1].weaponname).toBe('Shield');
                        expect(data[2].namefield).toBe('Steven');
                        expect(data[2].colourfield).toBe('pink');
                        expect(data[2].countfield).toBe(101);
                        expect(data[2].weaponname).toBe('Shield');
                        expect(data[3].namefield).toBe('Ruby');
                        expect(data[3].colourfield).toBe('red');
                        expect(data[3].countfield).toBe(10);
                        expect(data[3].weaponname).toBe('fist');

                        expect(data[8].namefield).toBe('amethyst');
                        expect(data[8].colourfield).toBe('purple');
                        expect(data[8].countfield).toBe(0);
                        expect(data[8].weaponname).toBe('whip');
                    });

                    it('Should handle all errors and return a result of 0', async function () {
                        const invalidQueries = [
                            {},
                            {
                                layerID: simpleId
                            },
                            {
                                layerID: simpleId,
                                columns: [],
                                order: [],
                                filters: []
                            },
                            {
                                layerID: simpleId,
                                columns: [{
                                    elementID: 'zzzz'
                                }],
                                order: [],
                                filters: []
                            }
                        ];

                        for (const i in invalidQueries) {
                            const query = invalidQueries[i];
                            const params = { query: query };

                            let error;
                            const oldConsoleError = console.error;
                            console.error = function (err) { error = err; };

                            const res = await request(app).post('/api/reports/get-data')
                                .set(headers)
                                .send(params)
                                .expect(200);

                            console.error = oldConsoleError;

                            const result = JSON.parse(res.text);
                            expect(result.result).toBe(0);
                            expect(result).toHaveProperty('msg');
                            expect(error).toBeInstanceOf(Error);
                        }
                    });
                });

                describe('Test report queries with a complex layer', function () {
                    it('should run a simple query', async function () {
                        const query = {
                            layerID: complexId,
                            columns: [],
                            order: [],
                            filters: []
                        };

                        query.columns.push({
                            id: 'gemname',
                            elementID: 'eeab'
                        });

                        query.columns.push({
                            id: 'countfield',
                            elementID: 'eeaa'
                        });

                        query.columns.push({
                            id: 'gemquote',
                            elementID: 'eedb'
                        });

                        query.order.push({
                            elementID: 'eeaa',
                            id: 'countfield',
                            sortType: 1
                        });
                        query.order.push({
                            elementID: 'eedb',
                            id: 'gemquote',
                            sortType: 1
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        expect(data).toHaveLength(6);
                        expect(data[0].gemname).toBe('pearl');
                        expect(data[0].gemquote).toBe('You do it for him');
                        expect(data[0].countfield).toBe(1);
                        expect(data[1].gemname).toBe('garnet');
                        expect(data[1].gemquote).toBe('Stronger than you');
                        expect(data[1].countfield).toBe(2);
                        expect(data[2].gemname).toBe('peridot');
                        expect(data[2].gemquote).toBe('Peace and love');
                        expect(data[2].countfield).toBe(3);
                        expect(data[3].gemname).toBe('Ruby');
                        expect(data[3].gemquote).toBe('Ruby rider');
                        expect(data[3].countfield).toBe(10);
                        expect(data[4].gemname).toBe('Steven');
                        expect(data[4].gemquote).toBe('Full disclosure');
                        expect(data[4].countfield).toBe(101);
                        expect(data[5].gemname).toBe('Steven');
                        expect(data[5].gemquote).toBe('Giant Woman');
                        expect(data[5].countfield).toBe(101);
                    });

                    it('Should successfully fetch, order by and filter by date', async function () {
                        const query = {
                            layerID: simpleId,
                            columns: [],
                            order: [],
                            filters: []
                        };

                        query.columns.push({
                            elementID: 'eecb',
                            id: 'titlefield'
                        });

                        query.columns.push({
                            elementID: 'eecc',
                            id: 'datefield',
                        });

                        query.order.push({
                            elementID: 'eecc',
                            id: 'datefield',
                            sortType: 1
                        });

                        query.filters.push({
                            elementID: 'eecc',
                            id: 'datefield',
                            filterType: 'diferentThan',
                            criterion: {
                                date1: new Date('2014-03-24')
                            }
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        const sourceData = testDataRef['episodes'].tableData
                            .filter((item) => (item.publishDate.getTime() !== (new Date('2014-03-24')).getTime()))
                            .sort(compareOn(a => a.publishDate));

                        expect(data).toHaveLength(sourceData.length);

                        for (const i in data) {
                            expect(data[i].titlefield).toBe(sourceData[i].title);
                        }
                    });

                    it('Should successfully chain joins', async function () {
                        const query = {
                            layerID: complexId,
                            columns: [],
                            order: [],
                            filters: []
                        };

                        query.columns.push({
                            id: 'gemweapon',
                            elementID: 'eebb'
                        });

                        query.columns.push({
                            id: 'episodetitle',
                            elementID: 'eecb'
                        });

                        query.columns.push({
                            id: 'wid',
                            elementID: 'eeba'
                        });

                        query.order.push({
                            elementID: 'eeba',
                            id: 'wid',
                            sortType: 1
                        });

                        query.order.push({
                            elementID: 'eecb',
                            id: 'episodetitle',
                            sortType: 1
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        const sourceData = [];

                        for (const i1 of testDataRef['weapons'].tableData) {
                            for (const i2 of testDataRef['gems'].tableData) {
                                if (i1.gemId === i2.id) {
                                    for (const i3 of testDataRef['songs'].tableData) {
                                        if (i3.singerId === i2.id) {
                                            for (const i4 of testDataRef['episodes'].tableData) {
                                                if (i3.episodeId === i4.id) {
                                                    sourceData.push({
                                                        'gemweapon': i1.name,
                                                        'episodetitle': i4.title,
                                                        'wid': i1.id
                                                    });
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        sourceData.sort(compareOn(a => a.title));
                        sourceData.sort(compareOn(a => a.wid));

                        expect(data).toHaveLength(sourceData.length);

                        for (const i in data) {
                            expect(data[i].gemweapon).toBe(sourceData[i].gemweapon);
                            expect(data[i].episodetitle).toBe(sourceData[i].episodetitle);
                        }
                    });

                    it('Should fetch only 5 elements', async function () {
                        const query = {
                            layerID: complexId,
                            columns: [],
                            order: [],
                            filters: [],
                            recordLimit: 5
                        };

                        query.columns.push({
                            id: 'episodetitle',
                            elementID: 'eecb'
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        expect(data).toHaveLength(5);
                    });

                    it('Should run a query with a simple custom element', async function () {
                        const query = {
                            layerID: complexId,
                            columns: [],
                            order: [],
                            filters: [],
                        };

                        query.columns.push({
                            id: 'gemvalue',
                            elementID: 'eepa'
                        });

                        query.columns.push({
                            id: 'gemname',
                            elementID: 'eeab'
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        const sourceData = testDataRef['gems'].tableData.map((item) => ({ gemvalue: (item.id + 1), gemname: item.name }));

                        data.sort(compareOn(a => a.gemvalue));
                        sourceData.sort(compareOn(a => a.gemvalue));

                        expect(data).toHaveLength(sourceData.length);

                        for (const i in data) {
                            expect(data[i].gemvalue).toBe(sourceData[i].gemvalue);
                            expect(data[i].gemname).toBe(sourceData[i].gemname);
                        }
                    });

                    it('Should run a query with a simple custom SQL collection', async function () {
                        const query = {
                            layerID: complexId,
                            columns: [],
                            order: [],
                            filters: []
                        };

                        query.columns.push({
                            elementID: 'eeua',
                            id: 'gemname'
                        });

                        query.columns.push({
                            elementID: 'eeub',
                            id: 'gemid'
                        });

                        query.columns.push({
                            elementID: 'eeuc',
                            id: 'gemcolour'
                        });

                        query.order.push({
                            elementID: 'eeub',
                            id: 'gemid',
                            sortType: 1
                        });
                        // In an ideal world, the order of the custom SQL query would be preserved by the main query
                        // However, the GROUP BY clause seems to be messing with that.
                        // The lazy 'just GROUP BY everything' strategy used by Urungi has it's downsides

                        query.filters.push({
                            elementID: 'eeuc',
                            id: 'gemcolour',
                            filterType: 'diferentThan',
                            criterion: {
                                text1: 'purple'
                            }
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);
                        const data = res.body.data;

                        expect(data).toHaveLength(10);

                        expect(data).toEqual([
                            {
                                gemname: 'pearl',
                                gemid: 1,
                                gemcolour: 'white',
                            },
                            {
                                gemcolour: 'green',
                                gemid: 3,
                                gemname: 'peridot',
                            },
                            {
                                gemcolour: 'blue',
                                gemid: 4,
                                gemname: 'Lapis-Lazuli',
                            },
                            {
                                gemcolour: 'blue',
                                gemid: 7,
                                gemname: 'Opal',
                            },
                            {
                                gemcolour: 'yellow',
                                gemid: 8,
                                gemname: 'Jasper',
                            },
                            {
                                gemcolour: 'green',
                                gemid: 9,
                                gemname: 'Malachite',
                            },
                            {
                                gemcolour: 'red',
                                gemid: 10,
                                gemname: 'Ruby',
                            },
                            {
                                gemcolour: 'blue',
                                gemid: 11,
                                gemname: 'Saphire',
                            },
                            {
                                gemcolour: 'pink',
                                gemid: 101,
                                gemname: 'Steven',
                            },
                            {
                                gemcolour: 'pink',
                                gemid: 103,
                                gemname: 'Stevonie',
                            },
                        ]);
                    });

                    it('Should run a query is a more ambitious custom sql collection', async function () {
                        const query = {
                            layerID: complexId,
                            columns: [],
                            order: [],
                            filters: []
                        };

                        query.columns.push({
                            elementID: 'eecb',
                            id: 'episodetitle'
                        });

                        query.columns.push({
                            id: 'charname',
                            elementID: 'eeva'
                        });

                        query.columns.push({
                            id: 'fusion',
                            elementID: 'eevc'
                        });

                        query.columns.push({
                            id: 'weapon',
                            elementID: 'eevd'
                        });

                        query.columns.push({
                            id: 'song',
                            elementID: 'eeve'
                        });

                        query.columns.push({
                            id: 'id',
                            elementID: 'eevb'
                        });

                        query.order.push({
                            elementID: 'eevb',
                            id: 'id',
                            sortType: 1
                        });
                        query.order.push({
                            elementID: 'eeve',
                            id: 'song',
                            sortType: 1
                        });

                        query.filters.push({
                            elementID: 'eevd',
                            id: 'weapon',
                            filterType: 'notNull',
                            criterion: {}
                        });

                        const res = await request(app).post('/api/reports/get-data')
                            .set(headers)
                            .send({ query: query })
                            .expect(200);

                        expect(res.body.result).toBe(1);

                        const data = res.body.data;

                        expect(data).toHaveLength(5);

                        let _false = false;
                        let _true = true;
                        if (datasource.type === 'MySQL') {
                            _false = 0;
                            _true = 1;
                        }

                        expect(data).toEqual([
                            {
                                'charname': 'pearl',
                                'episodetitle': 'Sworn to the sword',
                                'fusion': _false,
                                'id': 1,
                                'song': 'You do it for him',
                                'weapon': 'spear',
                            },
                            {
                                'charname': 'garnet',
                                'episodetitle': 'Jail Break',
                                'fusion': _true,
                                'id': 2,
                                'song': 'Stronger than you',
                                'weapon': 'fists',
                            },
                            {
                                'charname': 'Ruby',
                                'episodetitle': 'The question',
                                'fusion': _false,
                                'id': 10,
                                'song': 'Ruby rider',
                                'weapon': 'fist',
                            },
                            {
                                'charname': 'Steven',
                                'episodetitle': 'Full Disclosure',
                                'fusion': _false,
                                'id': 101,
                                'song': 'Full disclosure',
                                'weapon': 'Shield',
                            },
                            {
                                'charname': 'Steven',
                                'episodetitle': 'Giant Woman',
                                'fusion': _false,
                                'id': 101,
                                'song': 'Giant Woman',
                                'weapon': 'Shield',
                            }
                        ]);
                    });
                });
            });
        }
    }
});

function compareOn (f, inverse) {
    const inv = inverse ? (-1) : 1;
    return function (a, b) {
        if (f(a) > f(b)) {
            return inv;
        }
        if (f(a) < f(b)) {
            return (-1) * inv;
        }
        return 0;
    };
}

function jsTypeFromDbType (client, dbType) {
    const jsTypes = {
        MySQL: {
            'boolean': 'number',
            'integer': 'number',
            'string': 'string',
            'date': 'date',
        },
        POSTGRE: {
            'boolean': 'boolean',
            'integer': 'number',
            'string': 'string',
            'date': 'date',
        },
        MSSQL: {
            'boolean': 'boolean',
            'integer': 'number',
            'string': 'string',
            'date': 'date',
        },
    };

    if (client in jsTypes && dbType in jsTypes[client]) {
        return jsTypes[client][dbType];
    }
}

function buildComplexLayer (knex) {
    const customQuery1 = knex.select('name', knex.ref('id').as('gemId'), 'colour')
        .from('gems')
        .orderBy('gemId')
        .limit(500)
        .toString();

    const customQuery2 = knex.select('characters.id', 'characters.name', 'isFusion', knex.ref('weapons.name').as('weapon'), knex.ref('Title').as('song'))
        .from(function () {
            this.select().from(function () {
                this.select('id', 'name', 'isFusion').from('gems').as('g').union(function () {
                    this.select('id', 'name', 'isFusion').from('humans');
                });
            }).as('characters');
        })
        .leftJoin('songs', 'characters.id', 'songs.singerId')
        .leftJoin('weapons', 'weapons.gemId', 'characters.id')
        .groupBy('characters.id', 'characters.name', 'isFusion', 'weapons.name', 'Title')
        .having('characters.name', '!=', 'Jasper')
        .orderBy('characters.name')
        .limit(500)
        .toString();

    const complexLayer = {
        createdBy: userInfo.id,
        companyID: userInfo.compID,
        name: 'complex',
        description: 'A more complex layer, to test special cases',
        status: 1,
        nd_trash_deleted: false,

        objects: [
            {
                elementRole: 'folder',
                elements: [
                    {
                        elementRole: 'dimension',
                        elementID: 'eeab'
                    },
                    {
                        elementRole: 'dimension',
                        elementID: 'eeac',
                        collectionName: 'thisShouldntBreakAnything'
                    },
                    {
                        elementRole: 'folder',
                        elements: [
                            {
                                elementRole: 'folder',
                                elements: [
                                    {
                                        elementRole: 'dimension',
                                        elementID: 'eeda'
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                elementRole: 'dimension',
                elementID: 'eeaa'
            },
            {
                elementRole: 'folder',
                elements: [
                    { elementID: 'eead' },
                    { elementID: 'eeba' },
                    { elementID: 'eebb' },
                    { elementID: 'eeca' },
                    { elementID: 'eecb' },
                    { elementID: 'eecc' },
                    { elementID: 'eeda' },
                    { elementID: 'eedb' },
                    { elementID: 'eedc' },
                ]
            },
            {
                // Elements from the simple custom query
                elementRole: 'folder',
                elements: [
                    {
                        elementRole: 'dimension',
                        elementID: 'eeua',
                        elementName: 'name',
                        collectionID: 'Cuuaa',
                        collectionName: 'thisShouldntBreakAnything',
                        component: 1,
                        elementType: 'string'
                    },
                    {
                        elementRole: 'dimension',
                        elementID: 'eeub',
                        elementName: 'gemId',
                        collectionID: 'Cuuaa',
                        component: 1,
                        elementType: 'number'
                    },
                    {
                        elementRole: 'dimension',
                        elementID: 'eeuc',
                        elementName: 'colour',
                        collectionID: 'Cuuaa',
                        component: 1,
                        elementType: 'string'
                    }
                ]
            },
            {
                // Elements from the complex custom query
                elementRole: 'folder',
                elements: [
                    {
                        elementRole: 'dimension',
                        elementID: 'eeva',
                        elementName: 'name',
                        collectionID: 'Cuuab',
                        component: 3,
                        elementType: 'string'
                    },
                    {
                        elementRole: 'dimension',
                        elementID: 'eevb',
                        elementName: 'id',
                        collectionID: 'Cuuab',
                        component: 3,
                        elementType: 'string'
                    },
                    {
                        elementRole: 'dimension',
                        elementID: 'eevc',
                        elementName: 'isFusion',
                        collectionID: 'Cuuab',
                        component: 3,
                        elementType: 'string'
                    },
                    {
                        elementRole: 'dimension',
                        elementID: 'eevd',
                        elementName: 'weapon',
                        collectionID: 'Cuuab',
                        component: 3,
                        elementType: 'string'
                    },
                    {
                        elementRole: 'dimension',
                        elementID: 'eeve',
                        elementName: 'song',
                        collectionID: 'Cuuab',
                        component: 3,
                        elementType: 'string'
                    },
                ]
            },
            {
                // Custom elements
                elementRole: 'folder',
                elements: [
                    {
                        elementID: 'eepa',
                        isCustom: true,
                        expression: 'eeaa + 1',
                        viewExpression: '#eeaa + 1',
                        arguments: [
                            {
                                elementID: 'eeaa'
                            }
                        ],

                        component: 0
                    }
                ]
            }
        ],

        params: {
            joins: [
                {
                    joinID: 'Jjjba',
                    joinType: 'default',
                    sourceCollectionID: 'Caaab',
                    sourceCollectionName: 'weapons',
                    sourceElementID: 'eebc',
                    sourceElementName: 'gemId',
                    targetCollectionID: 'Caaaa',
                    targetCollectionName: 'gems',
                    targetElementID: 'eeaa',
                    targetElementName: 'id'
                },
                {
                    joinID: 'Jjjbb',
                    joinType: 'default',
                    sourceCollectionID: 'Caaaa',
                    sourceCollectionName: 'gems',
                    sourceElementID: 'eeaa',
                    sourceElementName: 'id',
                    targetCollectionID: 'Caaad',
                    targetCollectionName: 'songs',
                    targetElementID: 'eedd',
                    targetElementName: 'singerId'
                },
                {
                    joinID: 'Jjjbc',
                    joinType: 'default',
                    sourceCollectionID: 'Caaac',
                    sourceCollectionName: 'episodes',
                    sourceElementID: 'eeca',
                    sourceElementName: 'id',
                    targetCollectionID: 'Caaad',
                    targetCollectionName: 'songs',
                    targetElementID: 'eedc',
                    targetElementName: 'episodeId'
                },
                {
                    joinID: 'Jjjbd',
                    joinType: 'default',
                    sourceCollectionID: 'Cuuab',
                    sourceCollectionName: 'rawsql',
                    sourceElementID: 'eeve',
                    sourceElementName: 'song',
                    targetCollectionID: 'Caaad',
                    targetCollectionName: 'songs',
                    targetElementID: 'eedb',
                    targetElementName: 'Title'
                },
            ],
            schema: [
                {
                    collectionID: 'Cuuaa',
                    component: 0,
                    isSQL: true,
                    sqlQuery: customQuery1,
                    elements: [
                        {
                            elementRole: 'dimension',
                            elementID: 'ffaa',
                            elementName: 'name',
                            collectionID: 'Cuuaa',
                            component: 0,
                            elementType: 'string',
                        },
                    ],
                },
                {
                    collectionID: 'Cuuab',
                    component: 3,
                    isSQL: true,
                    sqlQuery: customQuery2,
                    elements: [
                        {
                            elementRole: 'dimension',
                            elementID: 'eeva',
                            elementName: 'name',
                            collectionID: 'Cuuab',
                            component: 3,
                            elementType: 'string'
                        },
                        {
                            elementRole: 'dimension',
                            elementID: 'eevb',
                            elementName: 'id',
                            collectionID: 'Cuuab',
                            component: 3,
                            elementType: 'string'
                        },
                        {
                            elementRole: 'dimension',
                            elementID: 'eevc',
                            elementName: 'isFusion',
                            collectionID: 'Cuuab',
                            component: 3,
                            elementType: 'string'
                        },
                        {
                            elementRole: 'dimension',
                            elementID: 'eevd',
                            elementName: 'weapon',
                            collectionID: 'Cuuab',
                            component: 3,
                            elementType: 'string'
                        },
                        {
                            elementRole: 'dimension',
                            elementID: 'eeve',
                            elementName: 'song',
                            collectionID: 'Cuuab',
                            component: 3,
                            elementType: 'string'
                        },
                    ],
                }
            ]
        },
    };

    for (const table of testData) {
        const collectionID = table.collectionID;
        const collectionName = table.tableName;

        complexLayer.params.schema.push({
            collectionID,
            collectionName,
            component: 0,
            datasourceId: dtsId,
            elements: table.tableColumns.map(element => {
                return {
                    collectionID: collectionID,
                    component: 0,
                    elementID: element.elementID,
                    elementRole: 'dimension',
                    elementType: element.elementType,
                    elementName: element.columnName,
                };
            }),
        });

        for (const element of table.tableColumns) {
            findElement(element.elementID, complexLayer.objects, function (found) {
                found.elementRole = 'dimension';
                found.collectionID = collectionID;
                found.collectionName = collectionName;
                found.component = 0;
                found.elementType = element.elementType;
                found.elementName = element.columnName;
            });
        }
    }

    return complexLayer;
}
