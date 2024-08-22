const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const helpers = require('../helpers.js');

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

describe('Themes API', function () {
    let adminHeaders;

    beforeAll(async function () {
        adminHeaders = await helpers.login(app);
    });

    describe('GET /api/themes', function () {
        describe('when not authenticated', function () {
            it('should return status 403', async function () {
                const res = await request(app).get('/api/themes');

                expect(res.status).toBe(403);
            });
        });
        describe('when authenticated', function () {
            it('should return the list of themes', async function () {
                const res = await request(app).get('/api/themes').set(adminHeaders);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('data');
                expect(res.body.data).toEqual(['blue', 'grey']);
            });
        });
    });
});
