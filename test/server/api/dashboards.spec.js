const helpers = require('../helpers');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app;
let mongod;
beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.MONGODB_URI = await mongod.getConnectionString();
    app = require('../../../server/app');
});
afterAll(async () => {
    await mongod.stop();
});

afterAll(() => {
    return Promise.all([
        new Promise(resolve => { connection.close(resolve); }),
        new Promise(resolve => { app.locals.mongooseConnection.close(resolve); }),
    ]);
});

describe('Dashboards API', function () {
    let Users;
    let Dashboardsv2;
    let headers;

    beforeAll(async () => {
        Users = connection.model('Users');
        Dashboardsv2 = connection.model('Dashboardsv2');
        headers = await helpers.login(app);
    });

    describe('GET /api/dashboardsv2/find-all', function () {
        it('should find all dashboards and their data', async function () {
            const res = await request(app).get('/api/dashboardsv2/find-all')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
        });
    });

    describe('GET /api/dashboardsv2/find-one', function () {
        it('should find one dashboard and its data', async function () {
            var user = await Users.findOne({ userName: 'administrator' });
            let res = await request(app).post('/api/dashboardsv2/create')
                .set(headers)
                .send({ companyID: 'COMPID', dashboardName: 'Dashboard' });
            res = await request(app).get('/api/dashboardsv2/find-one')
                .query({ id: res.body.item._id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
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
            expect(res.body.item).toHaveProperty('nd_trash_deleted', false); ;

            await Dashboardsv2.deleteOne({ dashboardName: 'Dashboard' });
        });
    });
    describe('POST /api/dashboardsv2/create', function () {
        it('should create a dashboard', async function () {
            var user = await Users.findOne({ userName: 'administrator' });
            const res = await request(app).post('/api/dashboardsv2/create')
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
            expect(res.body.item).toHaveProperty('nd_trash_deleted', false); ;
            await Dashboardsv2.deleteOne({ dashboardName: 'Dashboard' });
        });
    });

    describe('POST /api/dashboardsv2/duplicate', function () {
        it('should duplicate a dashboard', async function () {
            var user = await Users.findOne({ userName: 'administrator' });
            let res = await request(app).post('/api/dashboardsv2/create')
                .set(headers)
                .send({ companyID: 'COMPID', dashboardName: 'Dashboard' })
                .expect(200);

            res = await request(app).post('/api/dashboardsv2/duplicate')
                .set(headers)
                .send({ companyID: 'COMPID', dashboardName: 'Dashboard' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Item created');
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('__v');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('dashboardName', 'Copy of Dashboard');
            expect(res.body.item).toHaveProperty('owner', user.id);
            expect(res.body.item).toHaveProperty('isPublic', false);
            expect(res.body.item).toHaveProperty('createdBy', user.id);
            expect(res.body.item).toHaveProperty('createdOn');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('history');
            expect(res.body.item).toHaveProperty('items');
            expect(res.body.item).toHaveProperty('reports');
            expect(res.body.item).toHaveProperty('nd_trash_deleted', false); ;
            res = await Dashboardsv2.deleteOne({ dashboardName: 'Copy of Dashboard' });
            res = await Dashboardsv2.deleteOne({ dashboardName: 'Dashboard' });
        });
    });

    describe('POST /api/dashboardsv2/update/:id', function () {
        it('should update a dashboard', async function () {
            await Users.findOne({ userName: 'administrator' });
            let res = await request(app).post('/api/dashboardsv2/create')
                .set(headers)
                .send({ companyID: 'COMPID', dashboardName: 'Dashboard' });
            res = await request(app).post('/api/dashboardsv2/update/' + res.body.item._id)
                .set(headers)
                .send({ _id: res.body.item._id });
            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 record updated.');
            await Dashboardsv2.deleteOne({ dashboardName: 'Dashboard' });
        });
    });

    describe('POST /api/dashboardsv2/delete/:id', function () {
        let dashboard;

        beforeEach(async function createDashboard () {
            dashboard = await Dashboardsv2.create({
                companyID: 'COMPID',
                dashboardName: 'Dashboard',
            });
            await dashboard.publish('root');
        });
        afterEach(async function removeDashboard () {
            return dashboard.remove();
        });

        it('should delete a dashboard', async function () {
            const res = await request(app).post('/api/dashboardsv2/delete/' + dashboard.id)
                .set(headers)
                .send({ id: dashboard.id });
            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Dashboard deleted');
        });
    });

    describe('GET /api/dashboardsv2/get/:id', function () {
        it('should get a dashboard and its data', async function () {
            var user = await Users.findOne({ userName: 'administrator' });
            let res = await request(app).post('/api/dashboardsv2/create')
                .set(headers)
                .send({ companyID: 'COMPID', dashboardName: 'Dashboard' });
            res = await request(app).get('/api/dashboardsv2/get/' + res.body.item._id)
                .query({ id: res.body.item._id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('dashboardName', 'Dashboard');
            expect(res.body.item).toHaveProperty('owner', user.id);
            expect(res.body.item).toHaveProperty('isPublic', false);
            expect(res.body.item).toHaveProperty('createdBy', user.id);
            expect(res.body.item).toHaveProperty('createdOn');
            expect(res.body.item).toHaveProperty('nd_trash_deleted', false);
            expect(res.body.item).toHaveProperty('__v');
            expect(res.body.item).toHaveProperty('history');
            expect(res.body.item).toHaveProperty('items');
            expect(res.body.item).toHaveProperty('reports');
            await Dashboardsv2.deleteOne({ dashboardName: 'Dashboard' });
        });
    });

    describe('POST /api/dashboardsv2/share-page', function () {
        let dashboard;

        beforeEach(async function createDashboard () {
            dashboard = await Dashboardsv2.create({
                companyID: 'COMPID',
                dashboardName: 'Dashboard',
            });
        });
        afterEach(async function removeDashboard () {
            return dashboard.remove();
        });
        it('should publish a dashboard', async function () {
            const res = await request(app).post('/api/dashboardsv2/share-page')
                .set(headers)
                .send({ _id: dashboard.id, parentFolder: 'root' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Dashboard shared');

            const d = await Dashboardsv2.findById(dashboard.id);
            expect(d).toHaveProperty('isShared', true);
            expect(d).toHaveProperty('parentFolder', 'root');
        });
    });

    describe('POST /api/dashboardsv2/unpublish', function () {
        let dashboard;

        beforeEach(async function createDashboard () {
            dashboard = await Dashboardsv2.create({
                companyID: 'COMPID',
                dashboardName: 'Dashboard',
            });
            await dashboard.publish('root');
        });
        afterEach(async function removeDashboard () {
            return dashboard.remove();
        });

        it('should unpublish a dashboard', async function () {
            const res = await request(app).post('/api/dashboardsv2/unpublish')
                .set(headers)
                .send({ _id: dashboard._id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Dashboard unpublished');

            const d = await Dashboardsv2.findById(dashboard.id);
            expect(d).toHaveProperty('isPublic', false);
            expect(d).toHaveProperty('parentFolder', undefined);
        });
    });
});
