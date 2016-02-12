module.exports = {
    development: {
        url: 'http://demo.intalligent.net/',
        port: 5004,
        db: 'mongodb://54.154.195.107:27017/widestage_development',
        app: {
            name: 'NodeDream',
            contactEmail: 'jmalarcon.dbteam@gmail.com,hromero@db-team.com',
            collectionsPrefix: 'nd_',
            customCollectionsPrefix: 'ndcustom_'
        },
        crypto: {
            enabled: true,
            secret: 'SecretPassphrase'
        },
        mailer: {
            service: 'sendgrid', //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            /*host: 'smtp.db-team.com', // hostname
            secureConnection: false, // use SSL
            port: 25, // port for secure SMTP*/
            auth: {
                user: 'hermesromero',
                pass: 'hROMERO{555}'
            },
            from: 'no_reply@db-team.com'
        },
        facebook: {
            clientID: "613248335369791",
            clientSecret: "b76f03e8149a374834efb8317f58eaa8",
            callbackURL: "http://demo.intalligent.net/auth/facebook/callback"
        },
        twitter: {
            consumerKey: "yBdq4nVnRio64yjQa0xvUg",
            consumerSecret: "heMl26bXSmHFNkvSw1b0wsIjchkJ2DhiIXf7gdNU",
            callbackURL: "http://demo.intalligent.net/auth/twitter/callback"
        },
        google: {
            returnURL: "http://demo.intalligent.net/auth/google/return",
            realm: "http://demo.intalligent.net/"
        },
        pagination: {
            itemsPerPage: 10
        }
    },
    production: {
        url: 'http://grupovips.intalligent.net/',
        port: 5003,
        db: 'mongodb://0.0.0.0:27017/database', //10.0.0.179
        app: {
            name: 'NodeDream',
            contactEmail: 'jmalarcon.dbteam@gmail.com,hromero@db-team.com',
            collectionsPrefix: 'nd_',
            customCollectionsPrefix: 'ndcustom_'
        },
        crypto: {
            enabled: true,
            secret: 'SecretPassphrase'
        },
        mailer: {
            service: 'SMTP', //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            host: 'smtp.db-team.com', // hostname
            secureConnection: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'no_reply@db-team.com',
                pass: 'no_reply_5'
            },
            from: 'no_reply@db-team.com'
        },
        facebook: {
            clientID: "613248335369791",
            clientSecret: "b76f03e8149a374834efb8317f58eaa8",
            callbackURL: "http://grupovips.intalligent.net/auth/facebook/callback"
        },
        twitter: {
            consumerKey: "yBdq4nVnRio64yjQa0xvUg",
            consumerSecret: "heMl26bXSmHFNkvSw1b0wsIjchkJ2DhiIXf7gdNU",
            callbackURL: "http://grupovips.intalligent.net/auth/twitter/callback"
        },
        google: {
            returnURL: "http://grupovips.intalligent.net/auth/google/return",
            realm: "http://grupovips.intalligent.net/"
        },
        pagination: {
            itemsPerPage: 10
        }
    },
    local: {
        url: 'http://localhost:8080/',
        port: 8081,
        db: 'localhost:27017/widestage_development',
        app: {
            name: 'NodeDream',
            contactEmail: 'jmalarcon.dbteam@gmail.com,hromero@db-team.com',
            collectionsPrefix: 'nd_',
            customCollectionsPrefix: 'ndcustom_'
        },
        crypto: {
            enabled: true,
            secret: 'SecretPassphrase'
        },
        mailer: {
            service: 'SMTP', //SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
            host: 'smtp.db-team.com', // hostname
            secureConnection: false, // use SSL
            port: 25, // port for secure SMTP
            auth: {
                user: 'no_reply@db-team.com',
                pass: 'no_reply_5'
            },
            from: 'no_reply@db-team.com'
        },
        facebook: {
            clientID: "613248335369791",
            clientSecret: "b76f03e8149a374834efb8317f58eaa8",
            callbackURL: "http://localhost:8080/auth/facebook/callback"
        },
        twitter: {
            consumerKey: "yBdq4nVnRio64yjQa0xvUg",
            consumerSecret: "heMl26bXSmHFNkvSw1b0wsIjchkJ2DhiIXf7gdNU",
            callbackURL: "http://127.0.0.1:8080/auth/twitter/callback"
        },
        google: {
            returnURL: "http://127.0.0.1:8080/auth/google/return",
            realm: "http://127.0.0.1:8080/"
        },
        pagination: {
            itemsPerPage: 10
        }
    }
}