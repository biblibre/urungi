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

describe('API', function () {
    describe('GET /', function () {
        it('should return HTML and set xsrf cookie', async function () {
            const res = await request(app).get('/')
                .expect(200);

            expect(res.type).toBe('text/html');
            const expected = [
                expect.stringContaining('XSRF-TOKEN='),
            ];
            expect(res.headers['set-cookie']).toEqual(expect.arrayContaining(expected));
        });
    });
    describe('GET /any/route/that/is/not/declared', function () {
        it('should return HTML and set xsrf cookie', async function () {
            const res = await request(app).get('/any/route/that/is/note/declared')
                .expect(200);

            expect(res.type).toBe('text/html');
            const expected = [
                expect.stringContaining('XSRF-TOKEN='),
            ];
            expect(res.headers['set-cookie']).toEqual(expect.arrayContaining(expected));
        });
    });
});
