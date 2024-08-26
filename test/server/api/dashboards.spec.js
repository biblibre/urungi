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

describe('Dashboards API', function () {
    let User;
    let Dashboard;
    let adminHeaders;
    let userHeaders;

    beforeAll(async () => {
        User = mongoose.model('User');
        Dashboard = mongoose.model('Dashboard');
        adminHeaders = await helpers.login(app);

        await User.create({ userName: 'user', password: 'password', status: 'active', companyID: 'COMPID' });
        userHeaders = await helpers.login(app, 'user', 'password');
    });

    const dashboards = [];
    let adminDashboard;

    beforeEach(async function createDashboard () {
        const admin = await User.findOne({ userName: 'administrator' });
        adminDashboard = await Dashboard.create({
            companyID: 'COMPID',
            dashboardName: 'Admin Dashboard',
            owner: admin.id,
        });
        dashboards.push(adminDashboard);
        const user = await User.findOne({ userName: 'user' });
        dashboards.push(await Dashboard.create({
            companyID: 'COMPID',
            dashboardName: 'Admin Dashboard',
            owner: user.id,
        }));
    });
    afterEach(async function removeDashboard () {
        for (const dashboard of dashboards) {
            await dashboard.deleteOne();
        }
    });

    describe('GET /api/dashboards/find-all', function () {
        describe('when admin', function () {
            it('should find all dashboards and their data', async function () {
                const res = await request(app).get('/api/dashboards/find-all')
                    .set(adminHeaders)
                    .expect(200);

                expect(res.body).toHaveProperty('result', 1);
                expect(res.body).toHaveProperty('page');
                expect(res.body).toHaveProperty('pages');
                expect(res.body).toHaveProperty('items');
                expect(res.body.items).toHaveLength(2);
            });
        });
        describe('when normal user', function () {
            it('should find all owned dashboards and their data', async function () {
                const res = await request(app).get('/api/dashboards/find-all')
                    .set(userHeaders)
                    .expect(200);

                expect(res.body).toHaveProperty('result', 1);
                expect(res.body).toHaveProperty('page');
                expect(res.body).toHaveProperty('pages');
                expect(res.body).toHaveProperty('items');
                expect(res.body.items).toHaveLength(1);
            });
        });
    });

    describe('GET /api/dashboards/find-one', function () {
        it('should find one dashboard and its data', async function () {
            const res = await request(app).get('/api/dashboards/find-one')
                .query({ id: adminDashboard.id })
                .set(adminHeaders)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('dashboardName', 'Admin Dashboard');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('history');
            expect(res.body.item).toHaveProperty('items');
            expect(res.body.item).toHaveProperty('reports');
            expect(res.body.item).not.toHaveProperty('nd_trash_deleted', false);
        });
    });
    describe('POST /api/dashboards/create', function () {
        it('should create a dashboard', async function () {
            const user = await User.findOne({ userName: 'administrator' });
            const res = await request(app).post('/api/dashboards/create')
                .set(adminHeaders)
                .send({ companyID: 'COMPID', dashboardName: 'Dashboard' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Item created');
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('__v');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('dashboardName', 'Dashboard');
            expect(res.body.item).toHaveProperty('owner', user.id);
            expect(res.body.item).toHaveProperty('isPublic', false);
            expect(res.body.item).toHaveProperty('createdBy', user.id);
            expect(res.body.item).toHaveProperty('createdOn');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('history');
            expect(res.body.item).toHaveProperty('items');
            expect(res.body.item).toHaveProperty('reports');
            expect(res.body.item).not.toHaveProperty('nd_trash_deleted', false);
            await Dashboard.deleteOne({ dashboardName: 'Dashboard' });
        });
    });

    describe('POST /api/dashboards/update/:id', function () {
        let role2;
        let user2;
        let user2Headers;
        beforeAll(async function () {
            role2 = await mongoose.model('Role').create({
                companyID: 'COMPID',
                name: 'GUEST',
                description: 'Role to test',
                permissions: [],
                grants: [],
                reportsCreate: false,
                reportsShare: false,
                dashboardsCreate: false,
                exploreData: true,
                viewSQL: true,
                dashboardsShare: false,
                nd_trash_deleted: false,
            });
            user2 = await User.create({
                userName: 'johndoe',
                password: 'password',
                companyID: 'COMPID',
                roles: role2._id,
                status: 'active',
                nd_trash_deleted: false,
            });
            user2Headers = await helpers.login(app, 'johndoe', 'password');
        });
        afterAll(async function () {
            await user2.deleteOne();
        });
        it('should update a dashboard', async function () {
            const res = await request(app).post('/api/dashboards/update/' + adminDashboard.id)
                .set(adminHeaders)
                .send({ _id: adminDashboard.id });
            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 record updated.');
            await Dashboard.deleteOne({ dashboardName: 'Dashboard' });
        });
        it('should not authorized to update a dashboard without permission', async function () {
            const res = await request(app).post('/api/dashboards/update/' + adminDashboard.id)
                .set(user2Headers)
                .send({
                    companyID: 'COMPID',
                    dashboardName: 'Dashboard 2',
                    nd_trash_deleted: false,
                    owner: user2.id,
                    isPublic: false,
                })
                .expect(403);

            expect(res.body).toHaveProperty('result', 0);
        });
    });

    describe('POST /api/dashboards/delete/:id', function () {
        it('should delete a dashboard', async function () {
            const dash = await Dashboard.create({ dashboardName: 'Dash', companyID: 'COMPID' });
            const res = await request(app).post('/api/dashboards/delete/' + dash.id)
                .set(adminHeaders)
                .send({ id: dash.id });
            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Dashboard deleted');
        });
    });

    describe('GET /api/dashboards/get/:id', function () {
        it('should get a dashboard and its data', async function () {
            const res = await request(app).get('/api/dashboards/get/' + adminDashboard.id)
                .query({ id: adminDashboard.id })
                .set(adminHeaders)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('dashboardName', 'Admin Dashboard');
            expect(res.body.item).not.toHaveProperty('nd_trash_deleted', false);
            expect(res.body.item).toHaveProperty('history');
            expect(res.body.item).toHaveProperty('items');
            expect(res.body.item).toHaveProperty('reports');
        });
    });

    describe('POST /api/dashboards/share-page', function () {
        it('should publish a dashboard', async function () {
            const res = await request(app).post('/api/dashboards/share-page')
                .set(adminHeaders)
                .send({ _id: adminDashboard.id, parentFolder: 'root' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Dashboard shared');

            const d = await Dashboard.findById(adminDashboard.id);
            expect(d).toHaveProperty('isShared', true);
            expect(d).toHaveProperty('parentFolder', 'root');
        });
    });

    describe('POST /api/dashboards/unpublish', function () {
        it('should unpublish a dashboard', async function () {
            const res = await request(app).post('/api/dashboards/unpublish')
                .set(adminHeaders)
                .send({ _id: adminDashboard._id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Dashboard unpublished');

            const d = await Dashboard.findById(adminDashboard.id);
            expect(d).toHaveProperty('isPublic', false);
            expect(d).toHaveProperty('parentFolder', undefined);
        });
    });

    describe('OPTIONS /api/dashboards/:id/png', function () {
        it('should return 404 if dashboard does not exist', async function () {
            const res = await request(app).options('/api/dashboards/foo/png')
                .set(adminHeaders);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).options('/api/dashboards/' + adminDashboard.id + '/png')
                .set(adminHeaders);

            expect(res.status).toBe(501);
        });
    });

    describe('POST /api/dashboards/:id/png', function () {
        it('should return 404 if dashboard does not exist', async function () {
            const res = await request(app).post('/api/dashboards/foo/png')
                .set(adminHeaders);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).post('/api/dashboards/' + adminDashboard.id + '/png')
                .set(adminHeaders);

            expect(res.status).toBe(501);
        });
    });

    describe('OPTIONS /api/dashboards/:id/pdf', function () {
        it('should return 404 if dashboard does not exist', async function () {
            const res = await request(app).options('/api/dashboards/foo/pdf')
                .set(adminHeaders);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).options('/api/dashboards/' + adminDashboard.id + '/pdf')
                .set(adminHeaders);

            expect(res.status).toBe(501);
        });
    });

    describe('POST /api/dashboards/:id/pdf', function () {
        it('should return 404 if dashboard does not exist', async function () {
            const res = await request(app).post('/api/dashboards/foo/pdf')
                .set(adminHeaders);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).post('/api/dashboards/' + adminDashboard.id + '/pdf')
                .set(adminHeaders);

            expect(res.status).toBe(501);
        });
    });
});
