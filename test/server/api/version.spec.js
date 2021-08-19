const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongod;
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    app = require('../../../server/app');
});
afterAll(async () => {
    await new Promise(resolve => { mongoose.connection.close(resolve); });
    await mongod.stop();
});

describe('Version API', function () {
    it('should return the version', async function () {
        const res = await request(app).get('/api/version');

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('version');
        expect(res.body.data.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
});
