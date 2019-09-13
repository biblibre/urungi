const config = require('config');

const db = config.get('db');
const lastSlashIndex = db.lastIndexOf('/');
const databaseName = db.substring(lastSlashIndex + 1);

const migrateMongoConfig = {
    mongodb: {
        url: db,
        databaseName: databaseName,
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    migrationsDir: 'migrations',
    changelogCollectionName: 'changelog'
};

module.exports = migrateMongoConfig;
