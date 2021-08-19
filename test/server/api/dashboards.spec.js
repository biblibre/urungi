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

describe('Dashboards API', function () {
    let User;
    let Dashboard;
    let headers;

    beforeAll(async () => {
        User = mongoose.model('User');
        Dashboard = mongoose.model('Dashboard');
        headers = await helpers.login(app);
    });

    let dashboard;

    beforeEach(async function createDashboard () {
        dashboard = await Dashboard.create({
            companyID: 'COMPID',
            dashboardName: 'Dashboard',
        });
    });
    afterEach(async function removeDashboard () {
        return dashboard.remove();
    });

    describe('GET /api/dashboards/find-all', function () {
        it('should find all dashboards and their data', async function () {
            const res = await request(app).get('/api/dashboards/find-all')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
        });
    });

    describe('GET /api/dashboards/find-one', function () {
        it('should find one dashboard and its data', async function () {
            const res = await request(app).get('/api/dashboards/find-one')
                .query({ id: dashboard.id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('dashboardName', 'Dashboard');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('history');
            expect(res.body.item).toHaveProperty('items');
            expect(res.body.item).toHaveProperty('reports');
            expect(res.body.item).not.toHaveProperty('nd_trash_deleted', false); ;
        });
    });
    describe('POST /api/dashboards/create', function () {
        it('should create a dashboard', async function () {
            const user = await User.findOne({ userName: 'administrator' });
            const res = await request(app).post('/api/dashboards/create')
                .set(headers)
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
            expect(res.body.item).not.toHaveProperty('nd_trash_deleted', false); ;
            await Dashboard.deleteOne({ dashboardName: 'Dashboard' });
        });
    });

    describe('POST /api/dashboards/update/:id', function () {
        it('should update a dashboard', async function () {
            const res = await request(app).post('/api/dashboards/update/' + dashboard.id)
                .set(headers)
                .send({ _id: dashboard.id });
            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 record updated.');
            await Dashboard.deleteOne({ dashboardName: 'Dashboard' });
        });
    });

    describe('POST /api/dashboards/delete/:id', function () {
        it('should delete a dashboard', async function () {
            const dash = await Dashboard.create({ dashboardName: 'Dash', companyID: 'COMPID' });
            const res = await request(app).post('/api/dashboards/delete/' + dash.id)
                .set(headers)
                .send({ id: dash.id });
            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Dashboard deleted');
        });
    });

    describe('GET /api/dashboards/get/:id', function () {
        it('should get a dashboard and its data', async function () {
            const res = await request(app).get('/api/dashboards/get/' + dashboard.id)
                .query({ id: dashboard.id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('dashboardName', 'Dashboard');
            expect(res.body.item).not.toHaveProperty('nd_trash_deleted', false);
            expect(res.body.item).toHaveProperty('history');
            expect(res.body.item).toHaveProperty('items');
            expect(res.body.item).toHaveProperty('reports');
        });
    });

    describe('POST /api/dashboards/share-page', function () {
        it('should publish a dashboard', async function () {
            const res = await request(app).post('/api/dashboards/share-page')
                .set(headers)
                .send({ _id: dashboard.id, parentFolder: 'root' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Dashboard shared');

            const d = await Dashboard.findById(dashboard.id);
            expect(d).toHaveProperty('isShared', true);
            expect(d).toHaveProperty('parentFolder', 'root');
        });
    });

    describe('POST /api/dashboards/unpublish', function () {
        it('should unpublish a dashboard', async function () {
            const res = await request(app).post('/api/dashboards/unpublish')
                .set(headers)
                .send({ _id: dashboard._id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Dashboard unpublished');

            const d = await Dashboard.findById(dashboard.id);
            expect(d).toHaveProperty('isPublic', false);
            expect(d).toHaveProperty('parentFolder', undefined);
        });
    });

    describe('OPTIONS /api/dashboards/:id/png', function () {
        it('should return 404 if dashboard does not exist', async function () {
            const res = await request(app).options('/api/dashboards/foo/png')
                .set(headers);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).options('/api/dashboards/' + dashboard.id + '/png')
                .set(headers);

            expect(res.status).toBe(501);
        });
    });

    describe('POST /api/dashboards/:id/png', function () {
        it('should return 404 if dashboard does not exist', async function () {
            const res = await request(app).post('/api/dashboards/foo/png')
                .set(headers);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).post('/api/dashboards/' + dashboard.id + '/png')
                .set(headers);

            expect(res.status).toBe(501);
        });
    });

    describe('OPTIONS /api/dashboards/:id/pdf', function () {
        it('should return 404 if dashboard does not exist', async function () {
            const res = await request(app).options('/api/dashboards/foo/pdf')
                .set(headers);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).options('/api/dashboards/' + dashboard.id + '/pdf')
                .set(headers);

            expect(res.status).toBe(501);
        });
    });

    describe('POST /api/dashboards/:id/pdf', function () {
        it('should return 404 if dashboard does not exist', async function () {
            const res = await request(app).post('/api/dashboards/foo/pdf')
                .set(headers);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).post('/api/dashboards/' + dashboard.id + '/pdf')
                .set(headers);

            expect(res.status).toBe(501);
        });
    });
});
