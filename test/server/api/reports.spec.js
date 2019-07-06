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

describe('Reports API', function () {
    let Reports;
    let Layers;
    let Users;
    let Datasources;

    let user;
    let report;
    let layer;
    let datasource;
    let headers;

    beforeAll(async function () {
        Reports = connection.model('Reports');
        Layers = connection.model('Layers');
        Users = connection.model('Users');
        Datasources = connection.model('DataSources');
        headers = await helpers.login(app);
        user = await Users.findOne({ userName: 'administrator' });
    });

    beforeEach(async function () {
        datasource = await Datasources.create({
            name: 'MySQL Data Source',
            type: 'MySQL',
            status: 1,
        });

        layer = await Layers.create({
            name: 'Layer',
            status: 'active',
            datasourceID: datasource._id,
        });

        report = await Reports.create({
            companyID: 'COMPID',
            reportName: 'Report',
            nd_trash_deleted: false,
            owner: user.id,
            isPublic: false,
            createdBy: user.id,
            createdOn: new Date(),
            selectedLayerID: layer._id,
            author: user.id,
            reportType: 'grid',
        });
    });

    afterEach(async function () {
        await report.remove();
        await layer.remove();
        await datasource.remove();
    });

    describe('GET /api/reports/find-all', function () {
        it('should find all reports and their data', async function () {
            const res = await request(app).get('/api/reports/find-all')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page', 1);
            expect(res.body).toHaveProperty('pages', 1);
            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveLength(1);
            expect(res.body.items[0]).toHaveProperty('reportName', 'Report');
        });

        it('should send layer name', async function () {
            const res = await request(app).get('/api/reports/find-all?populate=layer')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body.items[0]).toHaveProperty('layerName', 'Layer');
        });
    });

    describe('GET /api/reports/find-all?populate=layer', function () {
        var layer2;
        var report2;

        beforeAll(async function () {
            layer2 = await Layers.create({
                name: 'Layer2',
                status: 'active',
                datasourceID: datasource._id,
            });

            report2 = await Reports.create({
                companyID: 'COMPID',
                reportName: 'Report2',
                nd_trash_deleted: false,
                owner: user.id,
                isPublic: false,
                createdBy: user.id,
                createdOn: new Date(),
                selectedLayerID: layer2._id,
                author: user.id,
                reportType: 'grid',
            });
        });

        afterAll(async function () {
            await layer2.remove();
            await report2.remove();
        });

        it('should find all reports and their data', async function () {
            const res = await request(app).get('/api/reports/find-all?populate=layer&sort=layerName&sortType=1')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
            expect(res.body.items[0]).toHaveProperty('layerName', 'Layer');
            expect(res.body.items[0]).toHaveProperty('reportName', 'Report');
            expect(res.body.items[0]).toHaveProperty('nd_trash_deleted', false);
            expect(res.body.items[0]).toHaveProperty('owner', user.id);
            expect(res.body.items[0]).toHaveProperty('isPublic', false);
            expect(res.body.items[0]).toHaveProperty('createdBy');
            expect(res.body.items[0]).toHaveProperty('createdOn');
            expect(res.body.items[0]).toHaveProperty('author');
            expect(res.body.items[0]).toHaveProperty('owner');
            expect(res.body.items[0]).toHaveProperty('reportType');
            expect(res.body.items[0]).toHaveProperty('_id');
            expect(res.body.items[1]).toHaveProperty('reportName', 'Report2');
            expect(res.body.items[1]).toHaveProperty('nd_trash_deleted', false);
            expect(res.body.items[1]).toHaveProperty('owner', user.id);
            expect(res.body.items[1]).toHaveProperty('isPublic', false);
            expect(res.body.items[1]).toHaveProperty('createdBy');
            expect(res.body.items[1]).toHaveProperty('createdOn');
            expect(res.body.items[1]).toHaveProperty('author');
            expect(res.body.items[1]).toHaveProperty('owner');
            expect(res.body.items[1]).toHaveProperty('reportType');
            expect(res.body.items[1]).toHaveProperty('_id');
            expect(res.body.items[1]).toHaveProperty('layerName', 'Layer2');
        });
    });

    describe('GET /api/reports/find-one', function () {
        it('should find one report and its data', async function () {
            const res = await request(app).get('/api/reports/find-one')
                .query({ id: report.id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result');
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('reportName', 'Report');
            expect(res.body.item).toHaveProperty('nd_trash_deleted', false);
            expect(res.body.item).toHaveProperty('owner', user.id);
            expect(res.body.item).toHaveProperty('isPublic', false);
            expect(res.body.item).toHaveProperty('createdBy');
            expect(res.body.item).toHaveProperty('createdOn');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('history');
        });
    });

    describe('POST /api/reports/create', function () {
        it('should create a report', async function () {
            const res = await request(app).post('/api/reports/create')
                .set(headers)
                .send({
                    companyID: 'COMPID',
                    reportName: 'Report 2',
                    nd_trash_deleted: false,
                    owner: user.id,
                    isPublic: false,
                })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Item created');
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('reportName', 'Report 2');
            expect(res.body.item).toHaveProperty('nd_trash_deleted', false);
            expect(res.body.item).toHaveProperty('owner', user.id);
            expect(res.body.item).toHaveProperty('isPublic', false);
            expect(res.body.item).toHaveProperty('createdBy', user.id);
            expect(res.body.item).toHaveProperty('createdOn');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('history');

            await Reports.findByIdAndRemove(res.body.item._id);
        });
    });

    describe('POST /api/reports/update/:id', function () {
        it('should update a report', async function () {
            const res = await request(app).post('/api/reports/update/' + report.id)
                .set(headers)
                .send({ _id: report.id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 record updated.');
        });
    });
    describe('POST /api/reports/delete/:id', function () {
        it('should delete a report', async function () {
            const res = await request(app)
                .post('/api/reports/delete/' + report.id)
                .set(headers)
                .send({ _id: report.id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Report deleted');
        });
    });

    describe('POST /api/reports/get-report/:id', function () {
        it('should get report', async function () {
            const res = await request(app).get('/api/reports/get-report/' + report.id)
                .query({ id: report.id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('companyID', 'COMPID');
            expect(res.body.item).toHaveProperty('reportName', 'Report');
            expect(res.body.item).toHaveProperty('nd_trash_deleted', false);
            expect(res.body.item).toHaveProperty('owner', user.id);
            expect(res.body.item).toHaveProperty('isPublic', false);
            expect(res.body.item).toHaveProperty('createdBy', user.id);
            expect(res.body.item).toHaveProperty('createdOn');
            expect(res.body.item).toHaveProperty('__v');
            expect(res.body.item).toHaveProperty('history');
        });
    });

    describe('POST /api/reports/share-report', function () {
        it('should publish a report', async function () {
            const res = await request(app).post('/api/reports/share-report')
                .set(headers)
                .send({ _id: report.id, parentFolder: 'root' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Report shared');

            const r = await Reports.findById(report.id);
            expect(r).toHaveProperty('isShared', true);
            expect(r).toHaveProperty('parentFolder', 'root');
        });
    });

    describe('POST /api/reports/unpublish', function () {
        it('should unpublish a report', async function () {
            await report.publish('root');

            const res = await request(app).post('/api/reports/unpublish')
                .set(headers)
                .send({ _id: report.id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Report unpublished');

            const r = await Reports.findById(report.id);
            expect(r).toHaveProperty('isPublic', false);
            expect(r).toHaveProperty('parentFolder', undefined);
        });
    });
});
