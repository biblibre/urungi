module.exports = {
    development: {
        url: 'http://localhost:8080/',
        port: 8080,
        db: 'mongodb://localhost:27017/widestage_development',
        app: {
            name: 'NodeDream',
            contactEmail: '',
            collectionsPrefix: 'nd_',
            customCollectionsPrefix: 'wst_'
        },
        crypto: {
            enabled: true,
            secret: 'SecretPassphrase'
        },
        pagination: {
            itemsPerPage: 10
        }
    },
    production: {
        url: 'http://localhost',
        port: 80,
        db: 'mongodb://localhost:27017/widestage',
        app: {
            name: 'NodeDream',
            contactEmail: '',
            collectionsPrefix: 'nd_',
            customCollectionsPrefix: 'wst_'
        },
        crypto: {
            enabled: true,
            secret: 'SecretPassphrase'
        },
        pagination: {
            itemsPerPage: 10
        }
    },
    local: {
        url: 'http://localhost:8081/',
        port: 8081,
        db: 'localhost:27017/widestage_development',
        app: {
            name: 'NodeDream',
            contactEmail: '',
            collectionsPrefix: 'nd_',
            customCollectionsPrefix: 'wst_'
        },
        crypto: {
            enabled: true,
            secret: 'SecretPassphrase'
        },
        pagination: {
            itemsPerPage: 10
        }
    }
}