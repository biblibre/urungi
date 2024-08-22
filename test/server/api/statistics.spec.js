const helpers = require('../helpers');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

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

describe('Statistics API', function () {
    let headers;
    let User, Statistic;
    let statistic1, statistic2, statistic3;

    beforeAll(async () => {
        headers = await helpers.login(app);
        User = mongoose.model('User');
        Statistic = mongoose.model('Statistic');
    });

    beforeEach(async function () {
        const user = await User.findOne({ userName: 'administrator' });
        statistic1 = await Statistic.create({ type: 'report', relationedName: 'report1', action: 'execute', userID: user.id });
        statistic2 = await Statistic.create({ type: 'report', relationedName: 'report1', action: 'execute', userID: user.id });
        statistic3 = await Statistic.create({ type: 'dashboard', relationedName: 'dashboard1', action: 'execute', userID: user.id });
    });

    afterEach(async function () {
        await Promise.all([
            statistic1.deleteOne(),
            statistic2.deleteOne(),
            statistic3.deleteOne(),
        ]);
    });

    describe('GET /api/statistics/last-executions', function () {
        it('should return the last executed reports and dashboards', async function () {
            const res = await request(app).get('/api/statistics/last-executions')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveLength(2);
            expect(res.body.items[0]).toHaveProperty('lastDate');
            expect(res.body.items[0]).toHaveProperty('type', 'dashboard');
            expect(res.body.items[0]).toHaveProperty('relationedName', 'dashboard1');
            expect(res.body.items[0]).toHaveProperty('action', 'execute');
            expect(res.body.items[1]).toHaveProperty('lastDate');
            expect(res.body.items[1]).toHaveProperty('type', 'report');
            expect(res.body.items[1]).toHaveProperty('relationedName', 'report1');
            expect(res.body.items[1]).toHaveProperty('action', 'execute');
        });
    });

    describe('GET /api/statistics/most-executed', function () {
        it('should return the most executed reports and dashboards', async function () {
            const res = await request(app).get('/api/statistics/most-executed')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveLength(2);
            expect(res.body.items[0]).toHaveProperty('count', 2);
            expect(res.body.items[0]).toHaveProperty('type', 'report');
            expect(res.body.items[0]).toHaveProperty('relationedName', 'report1');
            expect(res.body.items[0]).toHaveProperty('action', 'execute');
            expect(res.body.items[1]).toHaveProperty('count', 1);
            expect(res.body.items[1]).toHaveProperty('type', 'dashboard');
            expect(res.body.items[1]).toHaveProperty('relationedName', 'dashboard1');
            expect(res.body.items[1]).toHaveProperty('action', 'execute');
        });
    });
});
