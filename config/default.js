const os = require('os');
const path = require('path');

module.exports = {
    url: undefined,
    ip: undefined,
    port: undefined,

    // Number of processes to spawn
    // Defaults to the number of logical CPU cores
    workers: os.cpus().length,

    // MongoDB connection string
    // See https://docs.mongodb.com/manual/reference/connection-string/
    db: undefined,

    session: {
        secret: 'CHANGE ME',
    },

    // URI path under which Urungi is served
    // eg. if Urungi is accessible on https://example.com/urungi/ base is '/urungi'
    base: '',

    liquid: {
        // See https://liquidjs.com/tutorials/options.html#cache
        cache: false,
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

    uploads: {
        // Absolute path where uploaded files will be stored
        path: path.join(__dirname, '..', 'uploads'),
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
