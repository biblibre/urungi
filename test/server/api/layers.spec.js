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
    await new Promise(resolve => { connection.close(resolve); });
    await new Promise(resolve => { app.locals.mongooseConnection.close(resolve); });
    await mongod.stop();
});

describe('Layers API', function () {
    let Users;
    let Layers;
    let DataSources;
    let Reports;
    let Dashboardsv2;

    let datasource;
    let headers;

    beforeAll(async () => {
        Users = connection.model('Users');
        Layers = connection.model('Layers');
        DataSources = connection.model('DataSources');
        Reports = connection.model('Reports');
        Dashboardsv2 = connection.model('Dashboardsv2');
        headers = await helpers.login(app);

        datasource = await DataSources.create({
            companyID: 'COMPID',
            name: 'DataSource',
            type: 'MySQL',
            status: 1,
            nd_trash_deleted: false,
        });
    });

    afterAll(async function () {
        await datasource.remove();
    });

    describe('GET /api/layers/find-all', function () {
        it('should find all layers and their data', async function () {
            const res = await request(app).get('/api/layers/find-all')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
        });
    });

    describe('GET /api/layers/find-one', function () {
        it('should find one layer and its data', async function () {
            let res = await request(app).post('/api/layers/create')
                .set(headers)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });

            res = await request(app).get('/api/layers/find-one')
                .query({ id: res.body.item._id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('__v');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('name', 'layer');
            expect(res.body.item).toHaveProperty('status', 'active');
            expect(res.body.item).toHaveProperty('nd_trash_deleted', false); ;
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('objects');

            await Layers.deleteOne({ name: 'layer' });
        });
    });
    describe('POST /api/layers/create', function () {
        it('should create a layer', async function () {
            const res = await request(app).post('/api/layers/create')
                .set(headers)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Item created');
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('__v');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('name', 'layer');
            expect(res.body.item).toHaveProperty('status', 'active');
            expect(res.body.item).toHaveProperty('nd_trash_deleted', false); ;
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('objects');

            await Layers.deleteOne({ name: 'layer' });
        });
    });
    describe('POST /api/layers/update/:id', function () {
        it('should update one layer ', async function () {
            let res = await request(app).post('/api/layers/create')
                .set(headers)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });

            const ds = await DataSources.create({
                companyID: 'COMPID',
                name: 'DataSource',
                type: 'DataSource',
                status: 1,
                nd_trash_deleted: false,
            });

            res = await request(app).post('/api/layers/update/' + res.body.item._id)
                .set(headers)
                .send({ _id: res.body.item._id, datasourceID: ds.id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 record updated.');

            await Layers.deleteOne({ name: 'layer' });
            await ds.remove();
        });
    });
    describe('POST /api/layers/delete/:id', function () {
        it('should delete a layer', async function () {
            var User = await Users.findOne({ userName: 'administrator' });
            let res = await request(app).post('/api/layers/create')
                .set(headers)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, owner: User.id, isPublic: false, datasourceID: datasource._id });
            var layer = res.body.item;
            res = await request(app).post('/api/layers/delete/' + layer._id)
                .set(headers)
                .send({ _id: layer._id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 item deleted.');
            var Layer = await Layers.findOne({ _id: layer._id });
            expect(Layer).toBeNull();
        });

        it('should not delete a layer with dashboard conflict', async function () {
            let res = await request(app).post('/api/layers/create')
                .set(headers)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });

            var layer = res.body.item;
            res = await request(app).post('/api/dashboardsv2/create')
                .set(headers)
                .send({ companyID: 'COMPID', dashboardName: 'Dashboard', nd_trash_deleted: false, reports: [{ selectedLayerID: layer._id, reportName: 'foo' }] });

            res = await request(app).post('/api/layers/delete/' + layer._id)
                .set(headers)
                .send({ id: layer._id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 0);
            expect(res.body).toHaveProperty('msg', 'This layer cannot be deleted because at least one dashboard is using it (Dashboard)');

            res = await Dashboardsv2.deleteOne({ dashboardName: 'Dashboard' });
            res = await Layers.deleteOne({ name: 'layer' });
        });

        it('should not delete a layer with reports', async function () {
            var User = await Users.findOne({ userName: 'administrator' });
            let res = await request(app).post('/api/layers/create')
                .set(headers)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id })
                .expect(200);

            var layer = res.body.item;
            res = await request(app).post('/api/reports/create')
                .set(headers)
                .send({ companyID: 'COMPID', reportName: 'Report', selectedLayerID: layer._id, nd_trash_deleted: false, owner: User.id, isPublic: true })
                .expect(200);

            res = await request(app).post('/api/layers/delete/' + layer._id)
                .set(headers)
                .send({ id: layer._id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 0);
            expect(res.body).toHaveProperty('msg', 'This layer cannot be deleted because at least one report is using it (Report)');

            await Reports.deleteOne({ reportName: 'Report' });
            await Layers.deleteOne({ name: 'layer' });
        });
    });

    describe('POST /api/layers/change-layer-status', function () {
        it('should change layer status', async function () {
            await Users.findOne({ userName: 'administrator' });
            let res = await request(app).post('/api/layers/create')
                .set(headers)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });

            res = await request(app).post('/api/layers/change-layer-status')
                .set(headers)
                .send({ layerID: res.body.item._id, status: 'active' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Status updated.');
            await Layers.deleteOne({ name: 'layer' });
        });
    });
    describe('GET /api/layers/get-layers', function () {
        it('should get layers', async function () {
            let res = await request(app).post('/api/layers/create')
                .set(headers)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });
            res = await request(app).get('/api/layers/get-layers')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
            expect(res.body.items[0]).toHaveProperty('_id');
            expect(res.body.items[0]).toHaveProperty('name', 'layer');
            expect(res.body.items[0]).toHaveProperty('objects');
            res = await Layers.deleteOne({ name: 'layer' });
        });
    });
});
