const Knex = require('knex');

const { app } = require('../common');

const chai = require('chai');
const expect = chai.expect;

var DataSources = connection.model('DataSources');
var Layers = connection.model('Layers');

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

    const entries = [];

    var agent;
    var knex;

    before(async function () {
        agent = chai.request.agent(app);
        knex = Knex(dbConfig);

        // Test connection to database and skip the whole suite if needed
        try {
            await knex.raw('SELECT 1 AS connection_ok');
        } catch (e) {
            await agent.close();
            await knex.destroy();
            // This is needed to skip child suites
            // https://github.com/mochajs/mocha/issues/2819
            this.test.parent.pending = true;
            this.skip();
            return;
        }

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

        dtsId = createdDts._id.toString();

        entries.push(createdDts);

        for (const collection of simpleLayer.params.schema) {
            collection.datasourceID = dtsId;
        }

        const createdSL = await Layers.create(simpleLayer);

        simpleId = createdSL._id;
        entries.push(createdSL);

        const complexLayer = buildComplexLayer(knex);
        for (const collection of complexLayer.params.schema) {
            collection.datasourceID = dtsId;
        }

        const createdCL = await Layers.create(complexLayer);

        expect(createdCL).to.have.property('_id');
        complexId = createdCL._id;
        entries.push(createdCL);
    });

    after(async function () {
        await agent.close();
        for (const entry of entries) {
            await entry.remove();
        }
        await knex.destroy();
    });

    describe('Test datasource queries', function () {
        before(function () {
            return agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
        });

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

            const result = JSON.parse(res.text);

            expect(result.result).to.equal(1);
        });

        it('Should test /api/data-sources/getEntities', async function () {
            const res = await agent.get('/api/data-sources/getEntities')
                .query({ id: dtsId });

            expect(res).to.have.status(200);

            const result = JSON.parse(res.text);

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
                    entity: JSON.stringify({
                        database: dbConfig.connection.database,
                        name: table.tableName
                    })
                };

                const res = await agent.get('/api/data-sources/getEntitySchema').query(params);

                expect(res).to.have.status(200);

                const result = JSON.parse(res.text);

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

            const res = await agent.get('/api/data-sources/getsqlQuerySchema').query(params);

            expect(res).to.have.status(200);

            const result = JSON.parse(res.text);

            expect(result.result).to.equal(1);

            const schema = result.schema;

            expect(schema.collectionName).to.equal('simple query');
            expect(schema.isSQL).to.equal(true);
            expect(schema.sqlQuery).to.equal('select * from gems');

            schema.elements.sort(compareOn(a => a.elementName));

            const sourceData = testDataRef['gems'].tableColumns.map((item) => ({
                elementName: item.columnName,
                elementType: item.elementType,
                type: item.type,
            })).sort(compareOn(a => a.elementName));

            expect(schema.elements).to.have.lengthOf(sourceData.length);

            for (const i in schema.elements) {
                const element = schema.elements[i];
                expect(element.elementName).to.equal(sourceData[i].elementName);
                expect(element.elementType).to.equal(jsTypeFromDbType(dbConfig.client, sourceData[i].type));
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
                expect(+data[i].countfield).to.equal(sourceData[i].count);
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

                const res = await agent.post('/api/reports/get-data').send(params);

                console.error = oldConsoleError;

                expect(res).to.have.status(200);
                const result = JSON.parse(res.text);
                expect(result.result).to.equal(0);
                expect(result).to.have.property('msg');
                expect(error).to.be.an.instanceof(Error);
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

            expect(data).to.have.lengthOf(10);

            expect(data).to.eql([
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

            query.order.push({
                elementID: 'eevb',
                sortType: 1
            });
            query.order.push({
                elementID: 'eeve',
                sortType: 1
            });

            query.filters.push({
                elementID: 'eevd',
                filterType: 'notNull',
                criterion: {}
            });

            const data = await fetchData(agent, query);

            expect(data).to.have.lengthOf(5);

            let _false = false;
            let _true = true;
            if (dbConfig.client === 'mysql') {
                _false = 0;
                _true = 1;
            }

            expect(data).to.eql([
                {
                    'charname': 'pearl',
                    'episodetitle': 'Sworn to the sword',
                    'fusion': _false,
                    'song': 'You do it for him',
                    'weapon': 'spear',
                },
                {
                    'charname': 'garnet',
                    'episodetitle': 'Jail Break',
                    'fusion': _true,
                    'song': 'Stronger than you',
                    'weapon': 'fists',
                },
                {
                    'charname': 'Ruby',
                    'episodetitle': 'The question',
                    'fusion': _false,
                    'song': 'Ruby rider',
                    'weapon': 'fist',
                },
                {
                    'charname': 'Steven',
                    'episodetitle': 'Full Disclosure',
                    'fusion': _false,
                    'song': 'Full disclosure',
                    'weapon': 'Shield',
                },
                {
                    'charname': 'Steven',
                    'episodetitle': 'Giant Woman',
                    'fusion': _false,
                    'song': 'Giant Woman',
                    'weapon': 'Shield',
                }
            ]);
        });
    });
};

describe('Queries and data access', function () {
    describe('MySQL', generateTestSuite(config.get('tests.datasources.mysql')));
    describe('PostgreSQL', generateTestSuite(config.get('tests.datasources.postgresql')));
    // TODO Tests other databases
});

async function fetchData (agent, query) {
    const params = { query: query };

    const res = await agent.post('/api/reports/get-data').send(params);

    expect(res).to.have.status(200);

    const result = JSON.parse(res.text);

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

function jsTypeFromDbType (client, dbType) {
    const jsTypes = {
        mysql: {
            'boolean': 'number',
            'integer': 'number',
            'string': 'string',
            'date': 'date',
        },
        pg: {
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
        .groupBy('characters.id', 'characters.name', 'isFusion', 'weapon', 'song')
        .having('characters.name', '!=', 'Jasper')
        .orderBy('characters.name')
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

    return complexLayer;
}
