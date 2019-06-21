const { app, login } = require('../common');

const chai = require('chai');
const expect = chai.expect;

describe('Layers API', function () {
    const Users = connection.model('Users');
    const Layers = connection.model('Layers');
    const DataSources = connection.model('DataSources');
    const Reports = connection.model('Reports');
    const Dashboardsv2 = connection.model('Dashboardsv2');
    let agent;
    let datasource;

    before(async function () {
        agent = chai.request.agent(app);
        datasource = await DataSources.create({
            companyID: 'COMPID',
            name: 'DataSource',
            type: 'MySQL',
            status: 1,
            nd_trash_deleted: false,
        });
    });

    after(async function () {
        agent.close();
        await datasource.remove();
    });

    describe('GET /api/layers/find-all', function () {
        it('should find all layers and their data', async function () {
            await login(agent);
            const res = await agent.get('/api/layers/find-all');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
        });
    });

    describe('GET /api/layers/find-one', function () {
        it('should find one layer and its data', async function () {
            const xsrfToken = await login(agent);
            let res = await agent.post('/api/layers/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });
            var decrypted = JSON.parse(res.text);
            res = await agent.get('/api/layers/find-one').query({ id: decrypted.item._id });
            expect(res).to.have.status(200);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('name', 'layer');
            expect(decrypted.item).to.have.property('status', 'active');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false); ;
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('objects');
            await Layers.deleteOne({ name: 'layer' });
        });
    });
    describe('POST /api/layers/create', function () {
        it('should create a layer', async function () {
            const xsrfToken = await login(agent);
            const res = await agent.post('/api/layers/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Item created');
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('name', 'layer');
            expect(decrypted.item).to.have.property('status', 'active');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false); ;
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('objects');
            await Layers.deleteOne({ name: 'layer' });
        });
    });
    describe('POST /api/layers/update/:id', function () {
        it('should update one layer ', async function () {
            const xsrfToken = await login(agent);
            let res = await agent.post('/api/layers/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });
            let decrypted = JSON.parse(res.text);

            const ds = await DataSources.create({
                companyID: 'COMPID',
                name: 'DataSource',
                type: 'DataSource',
                status: 1,
                nd_trash_deleted: false,
            });

            res = await agent.post('/api/layers/update/' + decrypted.item._id)
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ _id: decrypted.item._id, datasourceID: ds.id });

            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');

            await Layers.deleteOne({ name: 'layer' });
            await ds.remove();
        });
    });
    describe('POST /api/layers/delete:id', function () {
        it('should delete a layer', async function () {
            const xsrfToken = await login(agent);
            var User = await Users.findOne({ userName: 'administrator' });
            await agent.get('/api/get-user-data');
            let res = await agent.post('/api/layers/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, owner: User.id, isPublic: false, datasourceID: datasource._id });
            var layer = JSON.parse(res.text).item;
            res = await agent.post('/api/layers/delete/' + layer._id)
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ _id: layer._id });
            expect(res).to.have.status(200);
            var response = JSON.parse(res.text);
            expect(response).to.have.property('result', 1);
            expect(response).to.have.property('msg', '1 items deleted.');
            var Layer = await Layers.findOne({ _id: layer._id });
            expect(Layer).to.be.a('null');
        });
    });

    describe('POST /api/layers/delete:id', function () {
        it('should not delete a layer with dashboard conflict', async function () {
            const xsrfToken = await login(agent);
            await agent.get('/api/get-user-data');
            let res = await agent.post('/api/layers/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });
            var layer = JSON.parse(res.text).item;
            res = await agent.post('/api/dashboardsv2/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', dashboardName: 'Dashboard', nd_trash_deleted: false, reports: [{ selectedLayerID: layer._id, reportName: 'foo' }] });
            var response = JSON.parse(res.text).item;
            res = await agent.post('/api/layers/delete/' + layer._id)
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ id: layer._id });
            expect(res).to.have.status(200);
            response = JSON.parse(res.text);
            expect(response).to.have.property('result', 0);
            expect(response).to.have.property('msg', 'This layer cannot be deleted because at least one dashboard is using it (Dashboard)');
            res = await Dashboardsv2.deleteOne({ dashboardName: 'Dashboard' });
            res = await Layers.deleteOne({ name: 'layer' });
        });
    });

    describe('POST /api/layers/delete:id', function () {
        it('should not delete a layer with reports', async function () {
            const xsrfToken = await login(agent);
            var User = await Users.findOne({ userName: 'administrator' });
            await agent.get('/api/get-user-data');
            let res = await agent.post('/api/layers/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });
            var layer = JSON.parse(res.text).item;
            res = await agent.post('/api/reports/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', reportName: 'Report', selectedLayerID: layer._id, nd_trash_deleted: false, owner: User.id, isPublic: true });
            var response = JSON.parse(res.text);
            res = await agent.post('/api/layers/delete/' + layer._id)
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ id: layer._id });
            expect(res).to.have.status(200);
            response = JSON.parse(res.text);
            expect(response).to.have.property('result', 0);
            expect(response).to.have.property('msg', 'This layer cannot be deleted because at least one report is using it (Report)');
            await Reports.deleteOne({ reportName: 'Report' });
            await Layers.deleteOne({ name: 'layer' });
        });
    });

    describe('POST /api/layers/change-layer-status', function () {
        it('should change layer status', async function () {
            const xsrfToken = await login(agent);
            await Users.findOne({ userName: 'administrator' });
            await agent.get('/api/get-user-data');
            let res = await agent.post('/api/layers/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });
            var decrypted = JSON.parse(res.text);

            res = await agent.post('/api/layers/change-layer-status')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ layerID: decrypted.item._id, status: 'active' });
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Status updated.');
            await Layers.deleteOne({ name: 'layer' });
        });
    });
    describe('GET /api/layers/get-layers', function () {
        it('should get layers', async function () {
            const xsrfToken = await login(agent);

            let res = await agent.post('/api/layers/create')
                .set('X-XSRF-TOKEN', xsrfToken)
                .send({ companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });
            res = await agent.get('/api/layers/get-layers');
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items[0]).to.have.property('_id');
            expect(decrypted.items[0]).to.have.property('name', 'layer');
            expect(decrypted.items[0]).to.have.property('objects');
            res = await Layers.deleteOne({ name: 'layer' });
        });
    });
});
