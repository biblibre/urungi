module.exports = {
    url: undefined,
    ip: undefined,
    port: undefined,
    db_type: 'mongoDB', // tingoDB or mongoDB

    // MongoDB connection string
    // See https://docs.mongodb.com/manual/reference/connection-string/
    db: undefined,

    sql_db: false,

    crypto: {
        enabled: true,
        secret: 'SecretPassphrase',
    },
    mailer: {
        service: 'SMTP', // SMTP, sendgrid, mandrill, etc... list of services nodemailer-wellknown
        host: 'smtp.yourserver.com', // hostname
        secureConnection: false, // use SSL
        port: 25, // port for secure SMTP
        auth: {
            user: 'no_reply@yourserver.com',
            pass: 'yourpassword',
        },
        from: 'no_reply@yourserver.com',
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
