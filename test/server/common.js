process.env.NODE_ENV = 'test';

const app = require('../../app');

const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const setCookieParser = require('set-cookie-parser');

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

async function login (agent, username = 'administrator', password = 'urungi') {
    const res = await agent.get('/login');
    const cookies = setCookieParser.parse(res, { map: true });
    const xsrfToken = cookies['XSRF-TOKEN'].value;
    await agent.post('/api/login')
        .set('X-XSRF-TOKEN', xsrfToken)
        .send({ userName: username, password: password });

    return xsrfToken;
}

module.exports = {
    app: app,
    login: login,
};
