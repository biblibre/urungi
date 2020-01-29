const helpers = require('../helpers');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let app;
let mongod;
beforeAll(async () => {
    mongod = new MongoMemoryServer();
    process.env.MONGODB_URI = await mongod.getConnectionString();
    app = require('../../../server/app');
});
afterAll(async () => {
    await new Promise(resolve => { mongoose.connection.close(resolve); });
    await mongod.stop();
});

describe('Layers API', function () {
    let Layer;
    let Datasource;
    let Report;
    let Dashboard;

    let datasource;
    let headers;

    beforeAll(async () => {
        Layer = mongoose.model('Layer');
        Datasource = mongoose.model('Datasource');
        Report = mongoose.model('Report');
        Dashboard = mongoose.model('Dashboard');
        headers = await helpers.login(app);

        datasource = await Datasource.create({
            companyID: 'COMPID',
            name: 'DataSource',
            type: 'MySQL',
            status: 1,
        });
    });

    afterAll(async function () {
        await datasource.remove();
    });

    describe('GET /api/layers', function () {
        it('should find all layers and their data', async function () {
            const res = await request(app).get('/api/layers')
                .set(headers);

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('data');
        });
    });

    describe('GET /api/layers/:layerId', function () {
        it('should find one layer and its data', async function () {
            const layer = await Layer.create({ name: 'layer', status: 'active', datasourceID: datasource._id });

            const res = await request(app).get('/api/layers/' + layer.id)
                .set(headers);

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty('name', 'layer');
            expect(res.body).toHaveProperty('status', 'active');
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('objects');

            await layer.remove();
        });
    });

    describe('POST /api/layers', function () {
        it('should create a layer', async function () {
            const res = await request(app).post('/api/layers')
                .set(headers)
                .send({ name: 'layer', status: 'active', datasourceID: datasource._id });

            expect(res.status).toBe(201);

            expect(res.body).toHaveProperty('name', 'layer');
            expect(res.body).toHaveProperty('status', 'active');
            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('objects');

            await Layer.deleteOne({ _id: res.body._id });
        });
    });

    describe('PUT /api/layers/:layerId', function () {
        it('should update one layer ', async function () {
            const layer = await Layer.create({
                name: 'layer',
                status: 'active',
                datasourceID: datasource._id,
                createdBy: 'tests',
                objects: [
                    {
                        component: 1,
                    },
                ],
            });

            const res = await request(app).put('/api/layers/' + layer.id)
                .set(headers)
                .send({
                    name: 'renamed layer',
                    status: 'active',
                    datasourceID: datasource._id,
                    objects: [
                        {
                            component: 2,
                        },
                    ],
                });

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty('name', 'renamed layer');
            expect(res.body).not.toHaveProperty('createdBy');
            expect(res.body.objects).toHaveLength(1);
            expect(res.body.objects[0]).toHaveProperty('component', 2);

            await layer.remove();
        });
    });

    describe('DELETE /api/layers/:layerId', function () {
        it('should delete a layer', async function () {
            let layer = await Layer.create({ name: 'layer', status: 'active', datasourceID: datasource._id });

            const res = await request(app).delete('/api/layers/' + layer.id)
                .set(headers);

            expect(res.status).toBe(204);

            layer = await Layer.findOne({ _id: layer._id });
            expect(layer).toBeNull();
        });

        it('should not delete a layer with dashboard conflict', async function () {
            const layer = await Layer.create({ name: 'layer', status: 'active', datasourceID: datasource._id });
            const dashboard = await Dashboard.create({ companyID: 'COMPID', dashboardName: 'Dashboard', nd_trash_deleted: false, reports: [{ selectedLayerID: layer._id, reportName: 'foo' }] });

            const res = await request(app).delete('/api/layers/' + layer.id)
                .set(headers);

            expect(res.status).toBe(403);
            expect(res.body).toHaveProperty('error', 'This layer cannot be deleted because at least one dashboard is using it (Dashboard)');

            await dashboard.remove();
            await layer.remove();
        });

        it('should not delete a layer with reports', async function () {
            const layer = await Layer.create({ name: 'layer', status: 'active', datasourceID: datasource._id });
            const report = await Report.create({ companyID: 'COMPID', reportName: 'Report', selectedLayerID: layer._id, nd_trash_deleted: false });

            const res = await request(app).delete('/api/layers/' + layer.id)
                .set(headers);

            expect(res.status).toBe(403);

            expect(res.body).toHaveProperty('error', 'This layer cannot be deleted because at least one report is using it (Report)');

            await report.remove();
            await layer.remove();
        });
    });

    describe('PATCH /api/layers/:layerId', function () {
        it('should partially update a layer', async function () {
            const layer = await Layer.create({ name: 'layer', status: 'Not active', datasourceID: datasource._id });

            const res = await request(app).patch('/api/layers/' + layer.id)
                .set(headers)
                .send({ status: 'active' });

            expect(res.status).toBe(200);

            expect(res.body).toHaveProperty('status', 'active');

            await layer.remove();
        });
    });
});
