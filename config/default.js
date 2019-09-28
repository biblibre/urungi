const os = require('os');

module.exports = {
    url: undefined,
    ip: undefined,
    port: undefined,

    // MongoDB connection string
    // See https://docs.mongodb.com/manual/reference/connection-string/
    db: undefined,

    session: {
        secret: 'CHANGE ME',
    },

    // URI path under which Urungi is served
    // eg. if Urungi is accessible on https://example.com/urungi/ base is '/urungi'
    base: '',

    mailer: {
        // See https://nodemailer.com/transports/sendmail/
        // or https://nodemailer.com/smtp/
        options: {
            sendmail: true,
        },
        defaults: {
            from: 'root@' + os.hostname()
        }
    },
    google: {
        clientID: 'your client id',
        clientSecret: 'your client secret',
        callbackURL: 'http://127.0.0.1:8080/auth/google/callback',
    },
    pagination: {
        itemsPerPage: 10,
    },
    query: {
        defaultRecordsPerPage: 500,
    },
    pikitia: {
        url: undefined,
        client_id: undefined,
        client_secret: undefined,
    }
};
