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
    await new Promise(resolve => { mongoose.connection.close(resolve); });
    await mongod.stop();
});

describe('Roles API', function () {
    let Role, User;

    let adminHeaders, userHeaders;

    beforeAll(async () => {
        User = mongoose.model('User');
        Role = mongoose.model('Role');

        adminHeaders = await helpers.login(app);

        await Role.create({ name: 'Role 1' });

        await User.create({ userName: 'user', password: 'password', companyID: 'COMPID' });
        userHeaders = await helpers.login(app, 'user', 'password');
    });

    describe('GET /api/roles', function () {
        it('should return status 403 if not authenticated', async function () {
            const res = await request(app).get('/api/roles');

            expect(res.status).toBe(403);
        });

        it('should return roles if not admin', async function () {
            const res = await request(app).get('/api/roles').set(userHeaders);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('page', 1);
            expect(res.body).toHaveProperty('pages', 1);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0]).toHaveProperty('name', 'Role 1');
        });

        it('should return roles if admin', async function () {
            const res = await request(app).get('/api/roles')
                .set(adminHeaders);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('page', 1);
            expect(res.body).toHaveProperty('pages', 1);
            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0]).toHaveProperty('name', 'Role 1');
        });
    });

    describe('POST /api/roles', function () {
        it('should return status 403 if not authenticated', async function () {
            const res = await request(app).post('/api/roles');

            expect(res.status).toBe(403);
        });

        it('should return status 403 if not admin', async function () {
            const res = await request(app).post('/api/roles').set(userHeaders);

            expect(res.status).toBe(403);
        });

        it('should create a role', async function () {
            const res = await request(app).post('/api/roles')
                .set(adminHeaders)
                .send({ name: 'test' });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('name', 'test');

            await Role.deleteOne({ name: 'test' });
        });
    });

    describe('GET /api/roles/:roleId', function () {
        describe('when not authenticated', function () {
            it('should return status 403', async function () {
                const role = await Role.findOne({ name: 'Role 1' });
                const res = await request(app).get('/api/roles/' + role.id);

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated as a normal user', function () {
            it('should return role', async function () {
                const role = await Role.findOne({ name: 'Role 1' });
                const res = await request(app).get('/api/roles/' + role.id)
                    .set(userHeaders);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('name', 'Role 1');
            });
        });

        describe('when authenticated as admin', function () {
            it('should return role', async function () {
                const role = await Role.findOne({ name: 'Role 1' });
                const res = await request(app).get('/api/roles/' + role.id)
                    .set(adminHeaders);

                expect(res.status).toBe(200);
                expect(res.body).toHaveProperty('name', 'Role 1');
            });
        });
    });

    describe('PATCH /api/roles/:roleId', function () {
        describe('when not authenticated', function () {
            it('should return status 403', async function () {
                const role = await Role.findOne({ name: 'Role 1' });
                const res = await request(app).patch('/api/roles/' + role.id);

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated as a normal user', function () {
            it('should return status 403', async function () {
                const role = await Role.findOne({ name: 'Role 1' });
                const res = await request(app).patch('/api/roles/' + role.id)
                    .set(userHeaders);

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated as admin', function () {
            it('should update role data', async function () {
                let role = await Role.findOne({ name: 'Role 1' });
                const res = await request(app).patch('/api/roles/' + role.id)
                    .set(adminHeaders)
                    .send({ reportsCreate: true });

                expect(res.status).toBe(200);

                expect(res.body).toHaveProperty('reportsCreate', true);

                role = await Role.findById(role.id);
                expect(role.reportsCreate).toBe(true);
            });
        });
    });
    describe('DELETE /api/roles/:roleId', function () {
        describe('when not authenticated', function () {
            it('should return status 403', async function () {
                const role = await Role.findOne({ name: 'Role 1' });
                const res = await request(app).delete('/api/roles/' + role.id);

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated as a normal user', function () {
            it('should return status 403', async function () {
                const role = await Role.findOne({ name: 'Role 1' });
                const res = await request(app).delete('/api/roles/' + role.id)
                    .set(userHeaders);

                expect(res.status).toBe(403);
            });
        });

        describe('when authenticated as admin', function () {
            it('should delete role', async function () {
                const role = await Role.findOne({ name: 'Role 1' });
                const res = await request(app).delete('/api/roles/' + role.id)
                    .set(adminHeaders);

                expect(res.status).toBe(204);
            });
        });

        describe('when role does not exist', function () {
            it('should return 404', async function () {
                const res = await request(app).delete('/api/roles/notexisting')
                    .set(adminHeaders);

                expect(res.status).toBe(404);
            });
        });
    });
});
