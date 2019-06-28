const os = require('os');

module.exports = {
    url: undefined,
    ip: undefined,
    port: undefined,
    db_type: 'mongoDB', // tingoDB or mongoDB

    // MongoDB connection string
    // See https://docs.mongodb.com/manual/reference/connection-string/
    db: undefined,

    session: {
        secret: 'CHANGE ME',
    },

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
};
