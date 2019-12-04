const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongod;
beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.MONGODB_URI = await mongod.getConnectionString();
    require('../../../server/app');
});
afterAll(async () => {
    await new Promise(resolve => { mongoose.connection.close(resolve); });
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

    it('should return items correctly filtered and ordered', async function () {
        const req = {
            query: {
                fields: 'userName,status',
                filters: JSON.stringify({ userName: '1' }),
                page: 1,
                sort: 'userName',
            },
        };

        const result = await mongooseHelper.find(User, req);
        expect(result).toHaveProperty('page', 1);
        expect(result).toHaveProperty('pages', 2);
        expect(result).toHaveProperty('items');
        expect(result.items).toHaveLength(10);
        expect(result.items[0]).toHaveProperty('userName', 'user 1');
        expect(result.items[0]).toHaveProperty('status', 'active');
        expect(result.items[1]).toHaveProperty('userName', 'user 10');
        expect(result.items[2]).toHaveProperty('userName', 'user 11');
        expect(result.items[3]).toHaveProperty('userName', 'user 12');
        expect(result.items[4]).toHaveProperty('userName', 'user 13');
        expect(result.items[5]).toHaveProperty('userName', 'user 14');
        expect(result.items[6]).toHaveProperty('userName', 'user 15');
        expect(result.items[7]).toHaveProperty('userName', 'user 16');
        expect(result.items[8]).toHaveProperty('userName', 'user 17');
        expect(result.items[9]).toHaveProperty('userName', 'user 18');
    });
});
