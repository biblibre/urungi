const helpers = require('../helpers');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let app;
let mongod;
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    app = require('../../../server/app');
});
afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});

describe('Users API', function () {
    let User;

    let adminHeaders, userHeaders;

    beforeAll(async () => {
        User = mongoose.model('User');

        adminHeaders = await helpers.login(app);

        await User.create({ userName: 'user', password: 'password', companyID: 'COMPID' });
        userHeaders = await helpers.login(app, 'user', 'password');
    });

    describe('GET /api/users', function () {
        it('should return status 403 if not authenticated', async function () {
            const res = await request(app).get('/api/users');

            expect(res.status).toBe(403);
        });

        it('should return status 403 if not admin', async function () {
            const res = await request(app).get('/api/users').set(userHeaders);

            expect(res.status).toBe(403);
        });

        it('should find all users and their data', async function () {
            const res = await request(app).get('/api/users')
                .set(adminHeaders);

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('data');
            expect(res.body.data[0]).toHaveProperty('_id');
            expect(res.body.data[0]).toHaveProperty('userName', 'administrator');
            expect(res.body.data[0]).toHaveProperty('companyID', 'COMPID');
            expect(res.body.data[0]).toHaveProperty('status', 'active');
            expect(res.body.data[0]).toHaveProperty('nd_trash_deleted');
            expect(res.body.data[0]).toHaveProperty('salt');
            expect(res.body.data[0]).toHaveProperty('hash');
            expect(res.body.data[0]).toHaveProperty('__v');
            expect(res.body.data[0]).toHaveProperty('last_login_date');
            expect(res.body.data[0]).toHaveProperty('last_login_ip');
            expect(res.body.data[0]).toHaveProperty('privateSpace');
            expect(res.body.data[0]).toHaveProperty('dialogs');
            expect(res.body.data[0]).toHaveProperty('contextHelp');
            expect(res.body.data[0]).toHaveProperty('filters');
            expect(res.body.data[0]).toHaveProperty('roles');
            expect(res.body.data[0].roles).toContain('ADMIN');
        });
    });

    describe('POST /api/users', function () {
        it('should return status 403 if not authenticated', async function () {
            const res = await request(app).post('/api/users');

            expect(res.status).toBe(403);
        });

        it('should return status 403 if not admin', async function () {
            const res = await request(app).post('/api/users').set(userHeaders);

            expect(res.status).toBe(403);
        });

        it('should create a user', async function () {
            const res = await request(app).post('/api/users')
                .set(adminHeaders)
                .send({ userName: 'test', pwd1: 'urungi' });

            expect(res.body).toHaveProperty('__v');
            expect(res.body).toHaveProperty('userName');
            expect(res.body).toHaveProperty('companyID');
            expect(res.body).toHaveProperty('status');
            expect(res.body).not.toHaveProperty('salt');
            expect(res.body).not.toHaveProperty('hash');
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('privateSpace');
            expect(res.body).toHaveProperty('startDate');
            expect(res.body).toHaveProperty('dialogs');
            expect(res.body).toHaveProperty('contextHelp');
            expect(res.body).toHaveProperty('filters');
            expect(res.body).toHaveProperty('roles');

            await User.deleteOne({ userName: 'test' });
        });
    });

    describe('GET /api/users/:userId', function () {
        describe('when not authenticated', function () {
            it('should return status 403', async function () {
                const admin = await User.findOne({ userName: 'administrator' });
                const res = await request(app).get('/api/users/' + admin.id);

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated as a normal user', function () {
            it('should return status 403 if asking for another user', async function () {
                const admin = await User.findOne({ userName: 'administrator' });
                const res = await request(app).get('/api/users/' + admin.id)
                    .set(userHeaders);

                expect(res.status).toBe(403);
            });

            it('should return user data if asking for its own account data', async function () {
                const user = await User.findOne({ userName: 'user' });
                const res = await request(app).get('/api/users/' + user.id)
                    .set(userHeaders);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('userName', 'user');
            });
        });

        describe('when authenticated as admin', function () {
            it('should return user data', async function () {
                const user = await User.findOne({ userName: 'user' });
                const res = await request(app).get('/api/users/' + user.id)
                    .set(adminHeaders);

                expect(res.status).toBe(200);

                expect(res.body).toHaveProperty('_id');
                expect(res.body).toHaveProperty('userName', 'user');
                expect(res.body).toHaveProperty('companyID');
                expect(res.body).toHaveProperty('status');
                expect(res.body).toHaveProperty('last_login_date');
                expect(res.body).toHaveProperty('last_login_ip');
                expect(res.body).toHaveProperty('privateSpace');
                expect(res.body).toHaveProperty('startDate');
                expect(res.body).toHaveProperty('dialogs');
                expect(res.body).toHaveProperty('contextHelp');
                expect(res.body).toHaveProperty('filters');
                expect(res.body).toHaveProperty('roles');
            });
        });
    });

    describe('PATCH /api/users/:userId', function () {
        describe('when not authenticated', function () {
            it('should return status 403', async function () {
                const admin = await User.findOne({ userName: 'administrator' });
                const res = await request(app).patch('/api/users/' + admin.id);

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated as a normal user', function () {
            it('should return status 403', async function () {
                const admin = await User.findOne({ userName: 'administrator' });
                const res = await request(app).patch('/api/users/' + admin.id)
                    .set(userHeaders);

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated as admin', function () {
            it('should update user data', async function () {
                let user = await User.findOne({ userName: 'user' });
                const res = await request(app).patch('/api/users/' + user.id)
                    .set(adminHeaders)
                    .send({ email: 'user@example.com', firstName: 'update' });

                expect(res.status).toBe(200);

                expect(res.body).toHaveProperty('email', 'user@example.com');
                expect(res.body).toHaveProperty('firstName', 'update');

                user = await User.findOne({ userName: 'user' });
                expect(user.firstName).toBe('update');
                expect(user.email).toBe('user@example.com');
            });
        });
    });
});
