process.env.NODE_ENV = 'test';

const app = require('../server');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const CryptoJS = require('crypto-js');

before(() => {
    return connection.dropDatabase();
});

after(() => {
    // Close pending connections
    return Promise.all([
        new Promise(resolve => {
            connection.close(() => { resolve(); });
        }),
        new Promise(resolve => {
            app.locals.mongooseConnection.close(() => { resolve(); });
        }),
    ]);
});

module.exports = {
    app: app,
    encrypt: function (params) {
        const json = JSON.stringify(params);
        const encrypted = CryptoJS.AES.encrypt(json, 'SecretPassphrase');

        return { data: String(encrypted) };
    },
    decrypt: function (data) {
        const object = JSON.parse(data.substr(6));
        const decrypted = CryptoJS.AES.decrypt(object.data, 'SecretPassphrase');

        return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
    }
};
