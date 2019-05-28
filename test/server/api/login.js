const { app } = require('../common');

const chai = require('chai');
const expect = chai.expect;
const setCookieParser = require('set-cookie-parser');

describe('Login API', function () {
    describe('POST /api/login', () => {
        let agent;
        beforeEach(() => {
            agent = chai.request.agent(app);
        });
        afterEach(() => {
            agent.close();
        });

        describe('without X-XSRF-TOKEN header', () => {
            it('should return status 403', () => {
                return chai.request(app).post('/api/login')
                    .send({ userName: 'administrator', password: 'urungi' })
                    .then(res => {
                        expect(res).to.have.status(403);
                    });
            });
        });
        describe('with invalid credentials', () => {
            it('should return status 401', async function () {
                let res = await agent.get('/login');
                const cookies = setCookieParser.parse(res, { map: true });
                const xsrfToken = cookies['XSRF-TOKEN'].value;
                res = await agent.post('/api/login')
                    .set('X-XSRF-TOKEN', xsrfToken)
                    .send({ userName: 'administrator', password: 'invalidpassword' });
                expect(res).to.have.status(401);
            });
        });
        describe('with valid credentials', () => {
            it('should return a user object', async function () {
                let res = await agent.get('/login');
                const cookies = setCookieParser.parse(res, { map: true });
                const xsrfToken = cookies['XSRF-TOKEN'].value;
                res = await agent.post('/api/login')
                    .set('X-XSRF-TOKEN', xsrfToken)
                    .send({ userName: 'administrator', password: 'urungi' });
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.property('user');
                expect(res.body.user).to.be.a('object');
                expect(res.body.user).to.have.property('roles');
                expect(res.body.user.roles).to.be.a('array');
                expect(res.body.user.roles).to.include('WSTADMIN');
            });
        });
    });
});
