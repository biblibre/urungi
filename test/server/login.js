const { app } = require('../common');

const chai = require('chai');
const expect = chai.expect;

describe('Login API', function () {
    describe('POST /api/login', () => {
        describe('with invalid credentials', () => {
            it('should return status 401', () => {
                return chai.request(app).post('/api/login')
                    .send({ userName: 'administrator', password: 'invalidpassword' })
                    .then(res => {
                        expect(res).to.have.status(401);
                    });
            });
        });
        describe('with valid credentials', () => {
            it('should return a user object', () => {
                return chai.request(app).post('/api/login')
                    .send({ userName: 'administrator', password: 'widestage' })
                    .then(res => {
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
});
