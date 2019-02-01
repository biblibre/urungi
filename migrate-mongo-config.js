const config = require('config');

const db = config.get('db');
const lastSlashIndex = db.lastIndexOf('/');
const url = db.substring(0, lastSlashIndex);
const databaseName = db.substring(lastSlashIndex + 1);

const migrateMongoConfig = {
    mongodb: {
        url: url,
        databaseName: databaseName,
        options: {
            useNewUrlParser: true
        }
    },
    migrationsDir: 'migrations',
    changelogCollectionName: 'changelog'
};

module.exports = migrateMongoConfig;
