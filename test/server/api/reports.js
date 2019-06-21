const { app, login } = require('../common');

const chai = require('chai');
const expect = chai.expect;

describe('Reports API', function () {
    const Reports = connection.model('Reports');
    const Layers = connection.model('Layers');
    const Users = connection.model('Users');
    const Datasources = connection.model('DataSources');

    let agent;
    let user;
    let report;
    let layer;
    let datasource;
    let xsrfToken;

    before(async function () {
        agent = chai.request.agent(app);
        xsrfToken = await login(agent);
        await agent.get('/api/get-user-data');
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

    after(() => {
        agent.close();
    });

    describe('GET /api/reports/find-all', function () {
        it('should find all reports and their data', async function () {
            const res = await agent.get('/api/reports/find-all');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
        });
    });

    describe('GET /api/reports/find-all?populate=layer', function () {
        it('should find all reports and their data', async function () {
            const res = await agent.get('/api/reports/find-all?populate=layer');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items[0]).to.have.property('layerName', 'Layer');
            expect(decrypted.items[0]).to.have.property('reportName', 'Report');
            expect(decrypted.items[0]).to.have.property('nd_trash_deleted', false);
            expect(decrypted.items[0]).to.have.property('owner', user.id);
            expect(decrypted.items[0]).to.have.property('isPublic', false);
            expect(decrypted.items[0]).to.have.property('createdBy');
            expect(decrypted.items[0]).to.have.property('createdOn');
            expect(decrypted.items[0]).to.have.property('author');
            expect(decrypted.items[0]).to.have.property('owner');
            expect(decrypted.items[0]).to.have.property('reportType');
            expect(decrypted.items[0]).to.have.property('_id');
        });
    });

    describe('GET /api/reports/find-all?populate=layer', function () {
        var layer2;
        var report2;

        before(async function () {
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

        after(async function () {
            await layer2.remove();
            await report2.remove();
        });

        it('should find all reports and their data', async function () {
            const res = await agent.get('/api/reports/find-all?populate=layer&sort=layerName&sortType=1');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items[0]).to.have.property('layerName', 'Layer');
            expect(decrypted.items[0]).to.have.property('reportName', 'Report');
            expect(decrypted.items[0]).to.have.property('nd_trash_deleted', false);
            expect(decrypted.items[0]).to.have.property('owner', user.id);
            expect(decrypted.items[0]).to.have.property('isPublic', false);
            expect(decrypted.items[0]).to.have.property('createdBy');
            expect(decrypted.items[0]).to.have.property('createdOn');
            expect(decrypted.items[0]).to.have.property('author');
            expect(decrypted.items[0]).to.have.property('owner');
            expect(decrypted.items[0]).to.have.property('reportType');
            expect(decrypted.items[0]).to.have.property('_id');
            expect(decrypted.items[1]).to.have.property('reportName', 'Report2');
            expect(decrypted.items[1]).to.have.property('nd_trash_deleted', false);
            expect(decrypted.items[1]).to.have.property('owner', user.id);
            expect(decrypted.items[1]).to.have.property('isPublic', false);
            expect(decrypted.items[1]).to.have.property('createdBy');
            expect(decrypted.items[1]).to.have.property('createdOn');
            expect(decrypted.items[1]).to.have.property('author');
            expect(decrypted.items[1]).to.have.property('owner');
            expect(decrypted.items[1]).to.have.property('reportType');
            expect(decrypted.items[1]).to.have.property('_id');
            expect(decrypted.items[1]).to.have.property('layerName', 'Layer2');
        });
    });

    describe('GET /api/reports/find-one', function () {
        it('should find one report and its data', async function () {
            const res = await agent.get('/api/reports/find-one').query({ id: report.id });
            expect(res).to.have.status(200);
            const decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result');
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('reportName', 'Report');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false);
            expect(decrypted.item).to.have.property('owner', user.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy');
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('history');
        });
    });

    describe('POST /api/reports/create', function () {
        it('should create a report', async function () {
            const res = await agent.post('/api/reports/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({
                    companyID: 'COMPID',
                    reportName: 'Report 2',
                    nd_trash_deleted: false,
                    owner: user.id,
                    isPublic: false,
                });
            expect(res).to.have.status(200);
            const decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Item created');
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('reportName', 'Report 2');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false);
            expect(decrypted.item).to.have.property('owner', user.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy', user.id);
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('history');

            await Reports.findByIdAndRemove(decrypted.item._id);
        });
    });
    describe('POST /api/reports/update/:id', function () {
        it('should update a report', async function () {
            const res = await agent.post('/api/reports/update/' + report.id)
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ _id: report.id });
            expect(res).to.have.status(200);
            const decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
        });
    });
    describe('POST /api/reports/delete/:id', function () {
        it('should delete a report', async function () {
            const res = await agent.post('/api/reports/delete/' + report.id)
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ _id: report.id });
            expect(res).to.have.status(200);
            const decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Report deleted');
        });
    });

    describe('POST /api/reports/get-report/:id', function () {
        it('should get report', async function () {
            const res = await agent.get('/api/reports/get-report/' + report.id)
                .query({ id: report.id });
            expect(res).to.have.status(200);
            const decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('reportName', 'Report');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false);
            expect(decrypted.item).to.have.property('owner', user.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy', user.id);
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('history');
        });
    });

    describe('POST /api/reports/share-report', function () {
        it('should publish a report', async function () {
            const res = await agent.post('/api/reports/share-report')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ _id: report.id, parentFolder: 'root' });
            expect(res).to.have.status(200);
            const decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Report shared');

            const r = await Reports.findById(report.id);
            expect(r).to.have.property('isShared', true);
            expect(r).to.have.property('parentFolder', 'root');
        });
    });

    describe('POST /api/reports/unpublish', function () {
        it('should unpublish a report', async function () {
            await report.publish('root');

            const res = await agent.post('/api/reports/unpublish')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ _id: report.id });
            expect(res).to.have.status(200);
            const decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Report unpublished');

            const r = await Reports.findById(report.id);
            expect(r).to.have.property('isPublic', false);
            expect(r).to.have.property('parentFolder', undefined);
        });
    });
});
