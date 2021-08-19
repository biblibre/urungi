const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
    // Make sure the mongod binary is downloaded before running tests
    const mongod = await MongoMemoryServer.create();
    await mongod.stop();
};
