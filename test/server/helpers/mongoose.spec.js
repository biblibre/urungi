const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    require('../../../server/app');
});
afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});

describe('mongooseHelper', function () {
    let mongooseHelper;
    let User;

    beforeAll(async function () {
        mongooseHelper = require('../../../server/helpers/mongoose.js');
        User = mongoose.model('User');
        for (let i = 0; i < 20; i++) {
            await User.create({ userName: `user ${i}` });
        }
    });

    describe('getAggregationPipelineFromQuery', () => {
        describe('with an empty query', () => {
            let res;
            beforeAll(async () => {
                const pipeline = mongooseHelper.getAggregationPipelineFromQuery({});
                res = (await User.aggregate(pipeline))[0];
            });

            it('should return everything', function () {
                expect(res).toHaveProperty('data');
                expect(res.data).toHaveLength(20);
                expect(res.data[0]).toHaveProperty('_id');
                expect(res.data[0]).toHaveProperty('createdOn');
                expect(res.data[0]).toHaveProperty('roles');
                expect(res.data[0]).toHaveProperty('status');
                expect(res.data[0]).toHaveProperty('userName');
            });

            it('should have properties page and pages equal to 1', function () {
                expect(res.page).toBe(1);
                expect(res.pages).toBe(1);
            });
        });

        describe('with fields, filters, pagination and sort', () => {
            let res;
            beforeAll(async () => {
                const query = {
                    fields: 'userName,status',
                    filters: JSON.stringify({ userName: { contains: '1' } }),
                    page: 1,
                    sort: 'userName',
                };
                const pipeline = mongooseHelper.getAggregationPipelineFromQuery(query);
                res = (await User.aggregate(pipeline))[0];
            });

            it('should return only 10 items', () => {
                expect(res).toHaveProperty('data');
                expect(res.data).toHaveLength(10);
            });

            it('should return only wanted fields', () => {
                expect(res.data[0]).toHaveProperty('_id');
                expect(res.data[0]).toHaveProperty('userName');
                expect(res.data[0]).toHaveProperty('status');
                expect(res.data[0]).not.toHaveProperty('createdOn');
                expect(res.data[0]).not.toHaveProperty('roles');
            });

            it('should have properties page and pages correctly set', function () {
                expect(res.page).toBe(1);
                expect(res.pages).toBe(2);
            });

            it('should return items correctly filtered and ordered', async function () {
                expect(res.data[0]).toHaveProperty('userName', 'user 1');
                expect(res.data[1]).toHaveProperty('userName', 'user 10');
                expect(res.data[2]).toHaveProperty('userName', 'user 11');
                expect(res.data[3]).toHaveProperty('userName', 'user 12');
                expect(res.data[4]).toHaveProperty('userName', 'user 13');
                expect(res.data[5]).toHaveProperty('userName', 'user 14');
                expect(res.data[6]).toHaveProperty('userName', 'user 15');
                expect(res.data[7]).toHaveProperty('userName', 'user 16');
                expect(res.data[8]).toHaveProperty('userName', 'user 17');
                expect(res.data[9]).toHaveProperty('userName', 'user 18');
            });
        });

        describe('with exact filter', () => {
            let res;
            beforeAll(async () => {
                const query = {
                    filters: JSON.stringify({ userName: 'user 1' }),
                };
                const pipeline = mongooseHelper.getAggregationPipelineFromQuery(query);
                res = (await User.aggregate(pipeline))[0];
            });

            it('should return only results that match exactly', () => {
                expect(res.data).toHaveLength(1);
                expect(res.data[0]).toHaveProperty('userName', 'user 1');
            });
        });

        describe('with descending sort', () => {
            let res;
            beforeAll(async () => {
                const query = {
                    sort: '-userName',
                    page: 1,
                };
                const pipeline = mongooseHelper.getAggregationPipelineFromQuery(query);
                res = (await User.aggregate(pipeline))[0];
            });

            it('should return results correctly sorted', () => {
                expect(res.data).toHaveLength(10);
                expect(res.data[0]).toHaveProperty('userName', 'user 9');
                expect(res.data[1]).toHaveProperty('userName', 'user 8');
                expect(res.data[2]).toHaveProperty('userName', 'user 7');
                expect(res.data[3]).toHaveProperty('userName', 'user 6');
                expect(res.data[4]).toHaveProperty('userName', 'user 5');
                expect(res.data[5]).toHaveProperty('userName', 'user 4');
                expect(res.data[6]).toHaveProperty('userName', 'user 3');
                expect(res.data[7]).toHaveProperty('userName', 'user 2');
                expect(res.data[8]).toHaveProperty('userName', 'user 19');
                expect(res.data[9]).toHaveProperty('userName', 'user 18');
            });
        });
    });
});
