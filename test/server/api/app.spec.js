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
    await mongoose.connection.close();
    await mongod.stop();
});

describe('API', function () {
    describe('GET /', function () {
        it('should redirect to /login', async function () {
            const res = await request(app).get('/')
                .expect(302);

            expect(res.headers.location).toBe('/login');
        });
    });
    describe('GET /any/route/that/is/not/declared', function () {
        it('should return 404', async function () {
            const res = await request(app).get('/any/route/that/is/note/declared');
            expect(res.status).toBe(404);
        });
    });
});
