const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
    // Make sure the mongod binary is downloaded before running tests
    const mongod = new MongoMemoryServer();
    await mongod.getUri();
    await mongod.stop();
};
