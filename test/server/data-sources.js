const { app, encrypt, decrypt } = require('../common');

const chai = require('chai');
const expect = chai.expect;

var agent = chai.request.agent(app);

var DataSources = connection.model('DataSources');

async function seed () {
    const entries = [
        new DataSources(
            {
                companyID: 'COMPID',
                name: 'widestage',
                type: 'MONGODB',
                status: 1,
                params: [{
                    packetSize: 500,
                    connection: {
                        database: 'widestage_test',
                        host: 'localhost',
                        port: '27017'

                    }
                }],

                nd_trash_deleted: false
                // This field is necessary for the search to return this entry
            }
        ),
        new DataSources(
            {
                companyID: 'COMPID',
                name: 'dummy db',
                type: 'MySQL',
                status: 1,
                params: [{
                    packetSize: 500,
                    connection: {
                        database: 'non_existent_db',
                        host: 'localhost'
                    }
                }],
                nd_trash_deleted: false
            }
        ),
        new DataSources(
            {
                companyID: 'COMPID',
                name: 'sql db',
                type: 'MySQL',
                status: 1,
                params: [{
                    packetSize: 500,
                    connection: {
                        database: 'will_need_to_be_created',
                        host: 'localhost'
                    }
                }]
            }
        )
    ];

    for (var entry of entries) {
        await entry.save();
    }

    return entries;
};

function verifyItem (item) {
    expect(item).to.have.property('_id');
    expect(item).to.have.property('companyID');
    expect(item).to.have.property('name');
    expect(item).to.have.property('type');
    expect(item).to.have.property('status');
    expect(item).to.have.property('nd_trash_deleted');
    expect(item).to.have.property('__v');
    expect(item).to.have.property('params');
};

async function authentifyAgent (agent) {
    const res = await agent.post('/api/login')
        .send(encrypt({ userName: 'administrator', password: 'widestage' }));
    expect(res).to.have.status(200);
}

async function getValidID (agent, index) {
    if (!index) {
        index = 0;
    }

    var res = await agent.get('/api/data-sources/find-all');
    expect(res).to.have.status(200);
    return decrypt(res.text).items[index]._id;
};

async function testUnidentifiedConnection (agent, url) {
    it('should return status 401', async function () {
        var res = await chai.request(app).get(url);
        expect(res).to.have.status(401);
    });
}

describe('/api/data-sources', function () {
    let entries;
    before(async function () {
        entries = await seed();
    });

    after(async function () {
        agent.close();
        for (const entry of entries) {
            await entry.remove();
        }
    });

    describe('/api/data-sources/find-all', function () {
        testUnidentifiedConnection(agent, '/api/data-sources/find-all');

        it('should return all data sources', async function () {
            await authentifyAgent(agent);

            var res = await agent.get('/api/data-sources/find-all');
            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);

            expect(decrypted).to.be.a('object');
            expect(decrypted).to.have.property('result');
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted.items).to.be.a('array');

            expect(decrypted.items).to.have.lengthOf.above(1);
            // We cannot expect the length to be equal to 2,
            // because other simultaneous tests may add entries to the database
            verifyItem(decrypted.items[0]);
        });
    });

    describe('api/data-sources/find-one', function () {
        testUnidentifiedConnection(agent, '/api/data-sources/find-one');

        it('should find no valid item', async function () {
            await authentifyAgent(agent);

            var res = await agent.get('/api/data-sources/find-one');
            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);
            expect(decrypted).to.have.property('result');
            expect(decrypted.result).to.equal(0);
        });

        it('should find a single valid item', async function () {
            await authentifyAgent(agent);

            const entryID = await getValidID(agent, 0);

            var res = await agent.get('/api/data-sources/find-one')
                .query(encrypt({id: entryID}));
            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);
            expect(decrypted).to.have.property('result');
            expect(decrypted.result).to.equal(1);

            verifyItem(decrypted.item);
            // Is this test necessary ?
            // It makes the whole test sequence longer, and doesn't really change much
        });
    });

    describe('/api/data-sources/get-element-distinct-values', function () {
        testUnidentifiedConnection(agent, '/api/data-sources/get-element-distinct-values');

        it('should return no result due to data source not found', async function () {
            await authentifyAgent(agent);

            var res = await agent.get('/api/data-sources/get-element-distinct-values');
            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);
            expect(decrypted.result).to.equal(0);
        });

        it('should return distinct values for the given element', async function () {
            await authentifyAgent(agent);

            const entryId = await getValidID(agent, 0);

            // const ds = await DataSources.findOne({_id: entryID});
            // console.log(ds);

            var res = await agent.get('/api/data-sources/get-element-distinct-values')
                .query(encrypt({
                    datasourceID: entryId,
                    collectionName: 'wst_DataSources',
                    elementName: 'name'
                }));
            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);

            expect(decrypted.result).to.equal(1);
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.be.a('array');
            expect(decrypted.items[0]).to.have.property('_id');
            expect(decrypted.items[0]._id).to.have.property('name');
        });
    });

    describe('/api/data-sources/getEntities', function () {
        testUnidentifiedConnection(agent, '/api/data-sources/getEntities');

        it("should access the widestage_test database and read it's content", async function () {
            await authentifyAgent(agent);

            const entryID = await getValidID(agent, 0);

            var res = await agent.get('/api/data-sources/getEntities')
                .query(encrypt({id: entryID}));
            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);

            expect(decrypted.result).to.equal(1);
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.be.a('array');
            expect(decrypted.items).to.have.lengthOf.above(1);
            expect(decrypted.items[0]).to.have.property('name');
        });
    });

    describe('/api/data-sources/getEntitySchema', function () {
        testUnidentifiedConnection(agent, '/api/data-sources/getEntitySchema');

        it("should access the widestage_test database and read it's schema", async function () {
            await authentifyAgent(agent);

            const entryID = await getValidID(agent, 0);

            var res = await agent.get('/api/data-sources/getEntitySchema')
                .query(encrypt({
                    datasourceID: entryID,
                    misc_field: [
                        {f1: 'v1', f2: 'v2'},
                        {f1: 'v3', f2: 'v4'}
                    ],
                    entities: [ { name: 'wst_Users',
                        type: 'collection',
                        options: {}},
                    { name: 'wst_Sessions',
                        type: 'collection',
                        options: {}},
                    { name: 'wst_Companies',
                        type: 'collection',
                        options: {}},
                    { name: 'wst_Logs',
                        type: 'collection',
                        options: {}},
                    { name: 'wst_DataSources',
                        type: 'collection',
                        options: {}} ]
                }));

            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);

            expect(decrypted.result).to.equal(1);
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.be.a('array');
            expect(decrypted.items).to.have.lengthOf.above(1);

            expect(decrypted.items[0]).to.have.property('collectionID');
            expect(decrypted.items[0]).to.have.property('collectionName');
            expect(decrypted.items[0]).to.have.property('visible');
            expect(decrypted.items[0]).to.have.property('collectionLabel');
            expect(decrypted.items[0]).to.have.property('elements');
            expect(decrypted.items[0].elements).to.be.a('array');
        });
    });

    describe('/api/data-sources/getsqlQuerySchema', function () {
        it('should return a 400 error due to interogating a mongoDB database', async function () {
            await authentifyAgent(agent);
            var entryID = await getValidID(agent, 0);

            var res = await agent.get('/api/data-sources/getsqlQuerySchema')
                .query(encrypt({
                    datasourceID: entryID
                }));
            expect(res).to.have.status(400);
        });

    // We would need a sql database to run an interesting test
    });

    describe('/api/data-sources/create', function () {
    // TODO : preliminary tests where the post is expected to fail
    // TODO : creating a post as an unauthentified user ?

        it('should create an entry made by an authenticated user', async function () {
            await authentifyAgent(agent);

            var res = await agent.post('/api/data-sources/create')
                .send(encrypt({
                    name: 'non existent db',
                    type: 'MONGODB',
                    status: 1,
                    params: [{
                        packetSize: 500,
                        connection: {
                            database: 'database_name',
                            host: 'localhost'
                        }
                    }]
                }));

            const decrypted = decrypt(res.text);

            expect(decrypted).to.have.property('result');
            expect(decrypted.result).to.equal(1);
            expect(decrypted).to.have.property('item');
            verifyItem(decrypted.item);

            expect(decrypted.item.params[0].connection.database)
                .to.equal('database_name');

            await DataSources.deleteOne({_id: decrypted.item._id});
        });
    });

    describe('/api/data-sources/upload-config-file', function () {
        it('Should return an error because the file is undefined', async function () {
            await authentifyAgent(agent);

            var res = await agent.post('/api/data-sources/upload-config-file');
            expect(res).to.have.status(500);
        });

        it('should upload the file successfully', async function () {
            // TODO : fill this after figuring out what a config file is
        });
    });

    describe('/api/data-sources/update', function () {
        it('should modify a database entry successfully', async function () {
            await authentifyAgent(agent);

            var res = await agent.get('/api/data-sources/find-all');
            const entryID = decrypt(res.text).items[1]._id;

            res = await agent.post('/api/data-sources/update/' + String(entryID))
                .send(encrypt({
                    _id: entryID,
                    name: 'renamed dummy db',
                    type: 'MongoDB',
                    params: [{
                        connection: {
                            database: 'modified_name'
                        }
                    }]
                }));
            expect(res).to.have.status(200);

            var decrypted = decrypt(res.text);
            expect(decrypted).to.have.property('result');
            expect(decrypted.result).to.equal(1);

            res = await agent.get('/api/data-sources/find-one')
                .query(encrypt({id: entryID}));
            expect(res).to.have.status(200);
            decrypted = decrypt(res.text);
            verifyItem(decrypted.item);

            expect(decrypted.item.name).to.equal('renamed dummy db');
            expect(decrypted.item.type).to.equal('MongoDB');
            expect(decrypted.item.params[0].connection.database)
                .to.equal('modified_name');
        });
    });

    describe('/api/data-sources/testConnection', function () {
        it('should recieve a connection error', async function () {
            await authentifyAgent(agent);

            var res = await agent.post('/api/data-sources/testConnection')
                .send(encrypt({ type: 'MONGODB' }));
            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);
            expect(decrypted.result).to.equal(0);
        });

        it('should recieve no result due to invalid database type', async function () {
            await authentifyAgent(agent);

            var res = await agent.post('/api/data-sources/testConnection');
            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);
            expect(decrypted.result).to.equal(0);
        });

        it('should successfully connect to the projects own database', async function () {
            await authentifyAgent(agent);

            var res = await agent.post('/api/data-sources/testConnection')
                .send(encrypt({
                    companyID: 'COMPID',
                    name: 'widestage',
                    type: 'MONGODB',

                    userName: '',
                    password: '',
                    host: 'localhost',
                    port: '27017',
                    database: 'widestage_test'
                }));
            expect(res).to.have.status(200);
            var decrypted = decrypt(res.text);

            expect(decrypted.result).to.equal(1);
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.be.a('array');
        });
    });
});
