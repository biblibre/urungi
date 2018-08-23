const Knex = require('knex');

const { app, encrypt, decrypt } = require('../common');

const dbParameters = config.get('sql_db');

const chai = require('chai');
const expect = chai.expect;

var DataSources = connection.model('DataSources');
var Layers = connection.model('Layers');

const entries = [];

const userInfo = {
    userName: 'administrator',
    password: 'widestage',
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
                'publishDate': new Date(2013, 11, 4)
            },
            {
                'id': 'oudh7khs-54fdt12-s',
                'title': 'Steven\'s Lion',
                'publishDate': new Date(2014, 1, 27)
            },
            {
                'id': 'oijs7g2-dgc09-qjds',
                'title': 'Giant Woman',
                'publishDate': new Date(2014, 2, 24)
            },
            {
                'id': 'ipjqd56-ftfls2-4',
                'title': 'Jail Break',
                'publishDate': new Date(2015, 4, 12)
            },
            {
                'id': 'ujsd-2-sijd67jisql',
                'title': 'Full Disclosure',
                'publishDate': new Date(2015, 4, 13)
            },
            {
                'id': 'okpsd123-hidsi77-d',
                'title': 'Sworn to the sword',
                'publishDate': new Date(2015, 6, 15)
            },
            {
                'id': 'nfsujis7_dyiq-2',
                'title': 'It could\'ve been great',
                'publishDate': new Date(2016, 1, 6)
            },
            {
                'id': 'ojoqjdo0099098',
                'title': 'The question',
                'publishDate': new Date(2018, 6, 4)
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
                type: 'string',
                elementType: 'string'
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
    customElements: []
};

for (const table of testData) {
    const collectionID = table.collectionID;
    const collectionName = table.tableName;

    simpleLayer.params.schema.push({
        collectionID,
        collectionName,
        component: 0,
        datasourceId: dtsId,
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

const customQuery1 = 'SELECT name, id as gemId, colour FROM gems ORDER BY gemId';
const customQuery2 = 'SELECT characters.id, characters.name, isFusion, weapons.name as weapon, Title as song FROM ( SELECT * FROM (SELECT id, name, isFusion FROM gems) g UNION (SELECT id, name, isFusion FROM humans)) characters LEFT JOIN songs ON characters.id = songs.singerId LEFT JOIN weapons ON weapons.gemId = characters.id GROUP BY characters.id HAVING name != \'Jasper\' ORDER BY name';

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
                {elementID: 'eead'},
                {elementID: 'eeba'},
                {elementID: 'eebb'},
                {elementID: 'eeca'},
                {elementID: 'eecb'},
                {elementID: 'eecc'},
                {elementID: 'eeda'},
                {elementID: 'eedb'},
                {elementID: 'eedc'},
            ]
        },
        {
            // For now, the join fails unless the elements needed for the join are in the layer
            // If this is ever changed, test it by removing this folder
            // It's elements are never queried, but they are used for joins
            elementRole: 'folder',
            elements: [
                {elementID: 'eebc'},
                {elementID: 'eedd'},
                {elementID: 'eeca'}
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
                    isCustom: 'true',
                    expression: 'eeaa + 1',
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
                datasourceID: dtsId,
                isSQL: true,
                sqlQuery: customQuery1
            },
            {
                collectionID: 'Cuuab',
                component: 3,
                datasourceID: dtsId,
                isSQL: true,
                sqlQuery: customQuery2
            }
        ]
    },
    customElements: []
};

for (const table of testData) {
    const collectionID = table.collectionID;
    const collectionName = table.tableName;

    complexLayer.params.schema.push({
        collectionID,
        collectionName,
        component: 0,
        datasourceId: dtsId,
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

function findElement (elementID, list, f) {
    for (const el of list) {
        if (el.elementID === elementID) {
            f(el);
        }
        if (el.elements) {
            findElement(elementID, el.elements, f);
        }
        if (el.arguments) {
            findElement(elementID, el.arguments, f);
        }
    }
}

const generateTestSuite = (dbConfig) => function () {
    var dbType;
    switch (dbConfig.client) {
    case 'mysql':
        dbType = 'MySQL';
        break;
    case 'pg':
        dbType = 'POSTGRE';
        break;
    case 'oracledb':
        dbType = 'ORACLE';
        break;
    case 'mssql':
        dbType = 'MSSQL';
        break;
    }

    var cq1Data;
    var cq2Data;

    var agent;

    before(async function () {
        agent = chai.request.agent(app);
    });

    after(async function () {
        await agent.close();
        for (const entry of entries) {
            await entry.remove();
        }
    });

    describe('Prepare databases for query tests', function () {
        var knex;

        before(function () {
            knex = Knex(dbConfig);
        });

        after(async function () {
            await knex.destroy();
        });

        it('Should connect knex to the test database', async function () {
            var testResult;

            testResult = await knex.select().from('information_schema.tables');

            expect(testResult).to.be.a('array');
        });

        it('Should drop all tables', async function () {
            const tableList = await knex.select('table_name')
                .from('information_schema.tables')
                .where('table_schema', '=', dbConfig.connection.database);

            for (const table of tableList) {
                await knex.schema.dropTableIfExists(table.table_name);
            }
        });

        it('Should create and seed some tables', async function () {
            for (const table of testData) {
                const creation = await knex.schema.createTable(table.tableName, function (builder) {
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

                const insertion = await knex(table.tableName).insert(table.tableData);

                expect(creation).to.be.an('array');
                expect(insertion).to.be.an('array');
            }

            cq1Data = await knex.select().from(knex.raw('(' + customQuery1 + ') rawtable'));
            cq2Data = await knex.select().from(knex.raw('(' + customQuery2 + ') rawtable'));
        });

        it('Should Add datasource and layers to the urungi database', async function () {
            expect(['mysql', 'pg', 'oracledb', 'mssql']).to.include(dbConfig.client);

            const dts = new DataSources({

                createdOn: new Date(),
                name: 'query tests',
                createdBy: userInfo.id,
                companyID: userInfo.compID,
                packetSize: 500,
                status: 1,

                type: dbType,
                connection: {
                    database: dbConfig.connection.database,
                    host: dbConfig.connection.host,
                    password: dbConfig.connection.password,
                    userName: dbConfig.connection.user
                }
            });

            const createdDts = await dts.save();

            expect(createdDts).to.have.property('_id');
            dtsId = createdDts._id;

            entries.push(createdDts);

            for (const collection of simpleLayer.params.schema) {
                collection.datasourceID = dtsId;
            }

            const createdSL = await Layers.create(simpleLayer);

            expect(createdSL).to.have.property('_id');
            simpleId = createdSL._id;
            entries.push(createdSL);

            for (const collection of complexLayer.params.schema) {
                collection.datasourceID = dtsId;
            }

            const createdCL = await Layers.create(complexLayer);

            expect(createdCL).to.have.property('_id');
            complexId = createdCL._id;
            entries.push(createdCL);
        });

        it('Should login successfully', async function () {
            var res = await agent.post('/api/login')
                .send(encrypt({ userName: 'administrator', password: 'widestage' }));
            expect(res).to.have.status(200);

            res = await agent.get('/api/layers/find-all');
            expect(res).to.have.status(200);
            var layers = decrypt(res.text);

            expect(layers.result).to.equal(1);
            expect(layers.items).to.be.an('array');
            expect(layers.items).to.have.lengthOf(2);
        });
    });

    describe('Test datasource queries', function () {
        it('Should test /api/data-sources/testConnection', async function () {
            const params = {
                type: dbType,

                host: dbConfig.connection.host,
                userName: dbConfig.connection.user,
                password: dbConfig.connection.password,
                database: dbConfig.connection.database
            };

            const res = await agent.post('/api/data-sources/testConnection')
                .send(params);

            expect(res).to.have.status(200);

            const result = decrypt(res.text);

            expect(result.result).to.equal(1);
        });

        it('Should test /api/data-sources/getEntities', async function () {
            const res = await agent.get('/api/data-sources/getEntities')
                .query(encrypt({ id: dtsId }));

            expect(res).to.have.status(200);

            const result = decrypt(res.text);

            expect(result.result).to.equal(1);
            expect(result.items).to.be.an('array');

            const data = result.items;

            const sourceData = [];
            for (const table of testData) {
                sourceData.push({name: table.tableName});
            }

            data.sort(compareOn(a => a.name));
            sourceData.sort(compareOn(a => a.name));

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i].name).to.equal(sourceData[i].name);
            }
        });

        it('Should test /api/data-sources/getEntitySchema', async function () {
            for (const table of testData) {
                const params = {
                    datasourceID: dtsId,
                    entity: {
                        database: dbConfig.connection.database,
                        name: table.tableName
                    }
                };

                const res = await agent.get('/api/data-sources/getEntitySchema').query(encrypt(params));

                expect(res).to.have.status(200);

                const result = decrypt(res.text);

                expect(result.result).to.equal(1);

                const schema = result.schema;

                expect(schema.collectionName).to.equal(table.tableName);
                expect(schema.elements).to.have.lengthOf(table.tableColumns.length);

                expect(schema.elements[0]).to.have.property('elementName');
                expect(schema.elements[0]).to.have.property('elementType');
                expect(schema.elements[0]).to.have.property('elementLabel');
            }
        });

        it('Should test /api/data-sources/getsqlQuerySchema', async function () {
            const params = {
                datasourceID: dtsId,
                collection: {
                    sqlQuery: 'select * from gems',
                    collectionName: 'simple query'
                }
            };

            const res = await agent.get('/api/data-sources/getsqlQuerySchema').query(encrypt(params));

            expect(res).to.have.status(200);

            const result = decrypt(res.text);

            expect(result.result).to.equal(1);

            const schema = result.schema;

            expect(schema.collectionName).to.equal('simple query');
            expect(schema.isSQL).to.equal(true);
            expect(schema.sqlQuery).to.equal('select * from gems');

            schema.elements.sort(compareOn(a => a.elementName));

            const sourceData = testDataRef['gems'].tableColumns.map((item) => ({
                elementName: item.columnName,
                elementType: item.elementType
            })).sort(compareOn(a => a.elementName));

            expect(schema.elements).to.have.lengthOf(sourceData.length);

            for (const i in schema.elements) {
                const element = schema.elements[i];
                expect(element.elementName).to.equal(sourceData[i].elementName);
                expect(element.elementType).to.equal(sourceData[i].elementType);
                expect(element).to.have.property('elementLabel');
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

            const data = await fetchData(agent, query);

            const sourceData = testDataRef['gems'].tableData;

            expect(data).to.have.lengthOf(sourceData.length);
            expect(data[0]).to.have.property('namefield');
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
                sortType: 1
            });

            query.filters.push({
                elementID: 'eead',
                filterType: 'equal',
                criterion: {
                    text1: 'false'
                }
            });

            const data = await fetchData(agent, query);

            const sourceData = testDataRef['gems'].tableData.filter((item) => !item.isFusion)
                .sort(compareOn(a => a.name.toLowerCase()));

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i]['namefield']).to.equal(sourceData[i].name);
                expect(data[i]['colourfield']).to.equal(sourceData[i].colour);
            }
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
                sortType: 1
            });

            const data = await fetchData(agent, query);

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

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i].countfield).to.equal(sourceData[i].count);
                expect(data[i].colourfield).to.equal(sourceData[i].colour);
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
                elementID: 'eebb',
                id: 'weaponname',
            });

            query.order.push({
                elementID: 'eeaa',
                sortType: -1
            });

            const data = await fetchData(agent, query);

            var sourceData = [];

            for (const litem of testDataRef['gems'].tableData) {
                for (const ritem of testDataRef['weapons'].tableData) {
                    if (litem.id === ritem.gemId) {
                        sourceData.push({
                            id: litem.id,
                            namefield: litem.name,
                            colourfield: litem.colour,
                            weaponname: ritem.name
                        });
                    }
                }
            }

            sourceData.sort(compareOn(a => a.id, true));

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i].namefield).to.equal(sourceData[i].namefield);
                expect(data[i].colourfield).to.equal(sourceData[i].colourfield);
                expect(data[i].weaponname).to.equal(sourceData[i].weaponname);
            }
        });

        it('Should handle all errors and return a result of 0', async function () {
            console.log('The console is now going to log some errors. This is part of the testing, and not a sign that there is an issue.');

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

            for (const query of invalidQueries) {
                const params = encrypt({ query: query });

                const res = await agent.post('/api/reports/get-data').send(params);

                expect(res).to.have.status(200);
                const result = decrypt(res.text);
                expect(result.result).to.equal(0);
                expect(result).to.have.property('msg');
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
                id: 'gemquote',
                elementID: 'eedb'
            });

            query.order.push({
                elementID: 'eeaa',
                sortType: 1
            });

            const data = await fetchData(agent, query);

            var sourceData = [];

            for (const litem of testDataRef['gems'].tableData) {
                for (const ritem of testDataRef['songs'].tableData) {
                    if (litem.id === ritem.singerId) {
                        sourceData.push({
                            'gemId': litem.id,
                            'gemname': litem.name,
                            'gemquote': ritem.Title
                        });
                    }
                }
            }

            sourceData.sort(compareOn(a => a.id));

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i].gemname).to.equal(sourceData[i].gemname);
                expect(data[i].gemquote).to.equal(sourceData[i].gemquote);
            }
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
                sortType: 1
            });

            query.filters.push({
                elementID: 'eecc',
                filterType: 'diferentThan',
                criterion: {
                    date1: new Date(2014, 2, 24)
                }
            });

            const data = await fetchData(agent, query);

            const sourceData = testDataRef['episodes'].tableData
                .filter((item) => (item.publishDate.getTime() !== (new Date(2014, 2, 24)).getTime()))
                .sort(compareOn(a => a.publishDate));

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i].titlefield).to.equal(sourceData[i].title);
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

            query.order.push({
                elementID: 'eeba',
                sortType: 1
            });

            query.order.push({
                elementID: 'eecb',
                sortType: 1
            });

            const data = await fetchData(agent, query);

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

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i].gemweapon).to.equal(sourceData[i].gemweapon);
                expect(data[i].episodetitle).to.equal(sourceData[i].episodetitle);
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

            const data = await fetchData(agent, query);

            expect(data).to.have.lengthOf(5);
        });

        it('Should test several kinds of aggregation to make sure they all work');

        it('Should test several filters to make sure they all work');

        it('Should run a query with a simple custom element', async function () {
            const query = {
                layerID: complexId,
                columns: [],
                order: [],
                filters: []
            };

            query.columns.push({
                id: 'gemvalue',
                elementID: 'eepa'
            });

            query.columns.push({
                id: 'gemname',
                elementID: 'eeab'
            });

            const data = await fetchData(agent, query);

            const sourceData = testDataRef['gems'].tableData.map((item) => ({ gemvalue: (item.id + 1), gemname: item.name }));

            data.sort(compareOn(a => a.gemvalue));
            sourceData.sort(compareOn(a => a.gemvalue));

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i].gemvalue).to.equal(sourceData[i].gemvalue);
                expect(data[i].gemname).to.equal(sourceData[i].gemname);
            }
        });

        it('Should run a query with more ambitious custom elements');

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
                sortType: 1
            });
            // In an ideal world, the order of the custom SQL query would be preserved by the main query
            // However, the GROUP BY clause seems to be messing with that.
            // The lazy 'just GROUP BY everything' strategy used by Urungi has it's downsides

            query.filters.push({
                elementID: 'eeuc',
                filterType: 'diferentThan',
                criterion: {
                    text1: 'purple'
                }
            });

            const data = await fetchData(agent, query);

            const sourceData = cq1Data.filter((item) => item.colour !== 'purple');

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i].gemname).to.equal(sourceData[i].name);
                expect(data[i].gemid).to.equal(sourceData[i].gemId);
                expect(data[i].gemcolour).to.equal(sourceData[i].colour);
            }
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

            query.order.push({
                elementID: 'eevb',
                sortType: 1
            });

            query.filters.push({
                elementID: 'eevd',
                filterType: 'notNull',
                criterion: {}
            });

            const data = await fetchData(agent, query);

            const sourceData = cq2Data.filter((item) => (item.weapon && item.song)).sort(compareOn(a => a.id));

            expect(data).to.have.lengthOf(sourceData.length);

            for (const i in data) {
                expect(data[i].charname).to.equal(sourceData[i].name);
                expect(data[i].fusion).to.equal(sourceData[i].isFusion);
                expect(data[i].weapon).to.equal(sourceData[i].weapon);
                expect(data[i].song).to.equal(sourceData[i].song);
            }
        });

        it('Should run some more queries, just to have more chances of catching if something broke');
    });
};

var testCount = 0;

if (dbParameters) {
    if (Array.isArray(dbParameters)) {
        for (const dbc of dbParameters) {
            var info = 'Queries and data access for test database number ' + testCount + ' ( ' + dbc.client + ' database )';
            describe(info, generateTestSuite(dbc));
            testCount += 1;
        }
    } else {
        describe('Queries and data access', generateTestSuite(dbParameters));
        testCount += 1;
    }
}

if (testCount === 0) {
    describe('Queries and data access', async function () {
        it('Query tests are disabled - setup a SQL test database to test queries');
    });
}

async function fetchData (agent, query) {
    const params = encrypt({ query: query });

    const res = await agent.post('/api/reports/get-data').send(params);

    expect(res).to.have.status(200);

    const result = decrypt(res.text);

    if (result.result === 0) {
        console.log(result);
    }

    expect(result.result).to.equal(1, 'The query execution was unsuccessful (returned result 0)');
    expect(result).to.have.property('data');
    expect(result.data).to.be.an('array');

    if (result.warnings.length > 0) {
        console.log(result.warnings);
    }

    expect(result.warnings).to.have.lengthOf(0, 'The query has returned warnings');

    return result.data;
}

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
