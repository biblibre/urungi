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

describe('Themes API', function () {
    describe('GET /api/themes', function () {
        it('should return the list of themes', async function () {
            const res = await request(app).get('/api/themes')
                .expect(200);

            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toEqual(['blue', 'grey']);
        });
    });
});
