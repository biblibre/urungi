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

describe('Shared space API', function () {
    let Company;

    let headers;

    beforeAll(async () => {
        Company = mongoose.model('Company');
        headers = await helpers.login(app);
    });

    describe('GET /api/shared-space', function () {
        it('should returns 403 if not authenticated', async function () {
            const res = await request(app).get('/api/shared-space');

            expect(res.status).toBe(403);
        });

        it('should returns the shared space if authenticated', async function () {
            const company = await Company.findOne({ companyID: 'COMPID' });
            const sharedSpace = [
                {
                    id: 'foo',
                    title: 'Foo',
                    nodes: [],
                },
                {
                    id: 'bar',
                    title: 'Bar',
                    nodes: [],
                },
            ];
            company.sharedSpace = sharedSpace;
            await company.save();

            const res = await request(app).get('/api/shared-space')
                .set(headers);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('items');

            const folders = res.body.items;
            expect(folders).toEqual(sharedSpace);
        });
    });

    describe('PUT /api/shared-space', function () {
        it('should returns 403 if not authenticated', async function () {
            const res = await request(app).put('/api/shared-space');

            expect(res.status).toBe(403);
        });

        it('should set the shared space if authenticated', async function () {
            const sharedSpace = [{ id: 'foo' }];
            const res = await request(app).put('/api/shared-space')
                .send(sharedSpace)
                .set(headers);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('items');

            const folders = res.body.items;
            expect(folders).toEqual(sharedSpace);

            const company = await Company.findOne({ companyID: 'COMPID' });
            expect(company.toObject().sharedSpace).toEqual(sharedSpace);
        });
    });
});
