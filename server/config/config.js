module.exports = {
    development: {
        url: 'http://localhost:8080/',
        port: 8080,
        db: 'mongodb://localhost:27017/widestage_development',
        app: {
            name: 'WideStage',
            contactEmail: '',
            collectionsPrefix: 'nd_',
            customCollectionsPrefix: 'wst_'
        },
        crypto: {
            enabled: true,
            secret: 'SecretPassphrase'
        },
        mailer: {
            service: 'SMTP', //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            host: 'smtp.yourserver.com', // hostname
            secureConnection: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'no_reply@yourserver.com',
                pass: 'yourpassword'
            },
            from: 'no_reply@yourserver.com'
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
            name: 'WideStage',
            contactEmail: '',
            collectionsPrefix: 'nd_',
            customCollectionsPrefix: 'wst_'
        },
        crypto: {
            enabled: true,
            secret: 'SecretPassphrase'
        },
        mailer: {
            service: 'SMTP', //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            host: 'smtp.yourserver.com', // hostname
            secureConnection: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'no_reply@yourserver.com',
                pass: 'yourpassword'
            },
            from: 'no_reply@yourserver.com'
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
            name: 'WideStage',
            contactEmail: '',
            collectionsPrefix: 'nd_',
            customCollectionsPrefix: 'wst_'
        },
        crypto: {
            enabled: true,
            secret: 'SecretPassphrase'
        },
        mailer: {
            service: 'SMTP', //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            host: 'smtp.yourserver.com', // hostname
            secureConnection: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'no_reply@yourserver.com',
                pass: 'yourpassword'
            },
            from: 'no_reply@yourserver.com'
        },
        pagination: {
            itemsPerPage: 10
        }
    }
}