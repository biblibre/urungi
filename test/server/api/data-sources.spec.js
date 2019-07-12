const helpers = require('../helpers');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let app;
let mongod;
beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.MONGODB_URI = await mongod.getConnectionString();
    app = require('../../../server/app');
});
afterAll(async () => {
    await new Promise(resolve => { mongoose.connection.close(resolve); });
    await mongod.stop();
});

async function seed () {
    var DataSources = mongoose.model('DataSources');

    const entries = [
        new DataSources(
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
        new DataSources(
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

    for (var entry of entries) {
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
    expect(item).toHaveProperty('nd_trash_deleted');
    expect(item).toHaveProperty('__v');
    expect(item).toHaveProperty('connection');
};

describe('Data sources API', function () {
    var DataSources;

    let headers;
    let entries;

    beforeAll(async () => {
        DataSources = mongoose.model('DataSources');
        headers = await helpers.login(app);
        entries = await seed();
    });

    afterAll(async function () {
        for (const entry of entries) {
            await entry.remove();
        }
    });

    describe('GET /api/data-sources/find-all', function () {
        it('should return status 403', async function () {
            return request(app).get('/api/data-sources/find-all')
                .expect(403);
        });

        it('should return all data sources', async function () {
            var res = await request(app).get('/api/data-sources/find-all')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');

            expect(res.body.items).toHaveLength(1);
            // We cannot expect the length to be equal to 2,
            // because other simultaneous tests may add entries to the database
            verifyItem(res.body.items[0]);
        });
    });

    describe('GET /api/data-sources/find-one', function () {
        it('should return status 403', async function () {
            return request(app).get('/api/data-sources/find-all')
                .expect(403);
        });

        it('should find no valid item', async function () {
            var res = await request(app).get('/api/data-sources/find-one')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result');
            expect(res.body.result).toBe(0);
        });

        it('should find a single valid item', async function () {
            const ds = await DataSources.findOne();

            var res = await request(app).get('/api/data-sources/find-one')
                .query({ id: ds.id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result');
            expect(res.body.result).toBe(1);

            verifyItem(res.body.item);
            // Is this test necessary ?
            // It makes the whole test sequence longer, and doesn't really change much
        });
    });

    describe('POST /api/data-sources/create', function () {
        // TODO : preliminary tests where the post is expected to fail
        // TODO : creating a post as an unauthentified user ?

        it('should create an entry made by an authenticated user', async function () {
            var res = await request(app).post('/api/data-sources/create')
                .set(headers)
                .send({
                    name: 'non existent db',
                    type: 'MySQL',
                    status: 1,
                    connection: {
                        database: 'database_name',
                        host: 'localhost'
                    }
                });

            expect(res.body).toHaveProperty('result');
            expect(res.body.result).toBe(1);
            expect(res.body).toHaveProperty('item');
            verifyItem(res.body.item);

            expect(res.body.item.connection.database)
                .toBe('database_name');

            await DataSources.deleteOne({ _id: res.body.item._id });
        });
    });

    describe('POST /api/data-sources/update', function () {
        it('should modify a database entry successfully', async function () {
            var res = await request(app).get('/api/data-sources/find-all')
                .set(headers)
                .expect(200);

            const entryID = res.body.items[0]._id;

            res = await request(app).post('/api/data-sources/update/' + String(entryID))
                .set(headers)
                .send({
                    _id: entryID,
                    name: 'renamed dummy db',
                    type: 'MySQL',
                    connection: {
                        database: 'modified_name'
                    }
                })
                .expect(200);

            expect(res.body).toHaveProperty('result');
            expect(res.body.result).toBe(1);

            res = await request(app).get('/api/data-sources/find-one')
                .query({ id: entryID })
                .set(headers)
                .expect(200);

            expect(res.body.item.name).toBe('renamed dummy db');
            expect(res.body.item.type).toBe('MySQL');
            expect(res.body.item.connection.database)
                .toBe('modified_name');
        });
    });
});
