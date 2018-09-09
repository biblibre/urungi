process.env.NODE_ENV = 'test';

const app = require('../server');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);

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
};
