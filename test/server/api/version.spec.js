const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

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

describe('Version API', function () {
    it('should return the version', async function () {
        const res = await request(app).get('/api/version')
            .expect(200);

        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('version');
        expect(res.body.data.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
});
