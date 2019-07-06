const request = require('supertest');
const setCookieParser = require('set-cookie-parser');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongod;
beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.MONGODB_URI = await mongod.getConnectionString();
    app = require('../../../server/app');
});
afterAll(async () => {
    await new Promise(resolve => { connection.close(resolve); });
    await new Promise(resolve => { app.locals.mongooseConnection.close(resolve); });
    await mongod.stop();
});

describe('Login API', function () {
    describe('POST /api/login', () => {
        let agent;
        beforeEach(() => {
            agent = request.agent(app);
        });

        describe('without X-XSRF-TOKEN header', () => {
            it('should return status 403', async () => {
                const res = await agent.post('/api/login')
                    .send({ userName: 'administrator', password: 'urungi' })
                    .ok(res => res.status === 403);

                expect(res.status).toBe(403);
            });
        });
        describe('with invalid credentials', () => {
            it('should return status 401', async function () {
                const res = await agent.get('/login');
                let setCookieHeader = res.headers['set-cookie'];
                if (setCookieHeader.length === 1) {
                    setCookieHeader = setCookieParser.splitCookiesString(setCookieHeader[0]);
                }
                const cookies = setCookieParser.parse(setCookieHeader, { map: true });
                const cookie = Object.values(cookies).map(c => c.name + '=' + c.value).join('; ');
                const xsrfToken = cookies['XSRF-TOKEN'].value;
                return request(app).post('/api/login')
                    .set('X-XSRF-TOKEN', xsrfToken)
                    .set('Cookie', cookie)
                    .send({ userName: 'administrator', password: 'invalidpassword' })
                    .expect(401);
            });
        });
        describe('with valid credentials', () => {
            it('should return a user object', async function () {
                let res = await request(app).get('/login');
                let setCookieHeader = res.headers['set-cookie'];
                if (setCookieHeader.length === 1) {
                    setCookieHeader = setCookieParser.splitCookiesString(setCookieHeader[0]);
                }
                const cookies = setCookieParser.parse(setCookieHeader, { map: true });
                const cookie = Object.values(cookies).map(c => c.name + '=' + c.value).join('; ');
                const xsrfToken = cookies['XSRF-TOKEN'].value;
                res = await request(app).post('/api/login')
                    .set('X-XSRF-TOKEN', xsrfToken)
                    .set('Cookie', cookie)
                    .send({ userName: 'administrator', password: 'urungi' })
                    .expect(200);

                expect(res.body).toHaveProperty('user');
                expect(res.body.user).toHaveProperty('roles');
                expect(res.body.user.roles).toContain('ADMIN');
            });
        });
    });
});
