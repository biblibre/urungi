module.exports = {
    development: {
        url: 'http://localhost:8080/',
        ip: "0.0.0.0",
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
<<<<<<< HEAD
            host: 'smtp.1and1.es', // hostname
            secureConnection: true, // use SSL
            port: 587, // port for secure SMTP
            auth: {
                user: 'noreply@db-team.com',
                pass: 'no_reply_5'
            },
            from: 'noreply@db-team.com'
=======
            host: 'smtp.yourserver.com', // hostname
            secureConnection: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'no_reply@yourserver.com',
                pass: 'yourpassword'
            },
            from: 'no_reply@yourserver.com'
>>>>>>> 455740930a702e05dfb736b5cae857304584f614
        },
        pagination: {
            itemsPerPage: 10
        }
    },
    production: {
        url: 'http://localhost',
        ip: "0.0.0.0",
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
<<<<<<< HEAD
            host: 'smtp.1and1.es', // hostname
            secureConnection: true, // use SSL
            port: 587, // port for secure SMTP
            auth: {
                user: 'noreply@db-team.com',
                pass: 'no_reply_5'
            },
            from: 'noreply@db-team.com'
=======
            host: 'smtp.yourserver.com', // hostname
            secureConnection: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'no_reply@yourserver.com',
                pass: 'yourpassword'
            },
            from: 'no_reply@yourserver.com'
>>>>>>> 455740930a702e05dfb736b5cae857304584f614
        },
        pagination: {
            itemsPerPage: 10
        }
    },
    local: {
        url: 'http://localhost:8081/',
        ip:  "127.0.0.1",
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
<<<<<<< HEAD
            host: 'smtp.1and1.es', // hostname
            secureConnection: true, // use SSL
            port: 587, // port for secure SMTP
            auth: {
                user: 'noreply@db-team.com',
                pass: 'no_reply_5'
            },
            from: 'noreply@db-team.com'
=======
            host: 'smtp.yourserver.com', // hostname
            secureConnection: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'no_reply@yourserver.com',
                pass: 'yourpassword'
            },
            from: 'no_reply@yourserver.com'
>>>>>>> 455740930a702e05dfb736b5cae857304584f614
        },
        pagination: {
            itemsPerPage: 10
        }
    }
}