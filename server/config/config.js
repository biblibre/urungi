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
        mailer: {
            service: 'SMTP', //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            host: 'smtp.1and1.es', // hostname
            secureConnection: true, // use SSL
            port: 587, // port for secure SMTP
            auth: {
                user: 'noreply@db-team.com',
                pass: 'no_reply_5'
            },
            from: 'noreply@db-team.com'
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
        mailer: {
            service: 'SMTP', //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            host: 'smtp.1and1.es', // hostname
            secureConnection: true, // use SSL
            port: 587, // port for secure SMTP
            auth: {
                user: 'noreply@db-team.com',
                pass: 'no_reply_5'
            },
            from: 'noreply@db-team.com'
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
        mailer: {
            service: 'SMTP', //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            host: 'smtp.1and1.es', // hostname
            secureConnection: true, // use SSL
            port: 587, // port for secure SMTP
            auth: {
                user: 'noreply@db-team.com',
                pass: 'no_reply_5'
            },
            from: 'noreply@db-team.com'
        },
        pagination: {
            itemsPerPage: 10
        }
    }
}