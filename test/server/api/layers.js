const { app } = require('../../common');

const chai = require('chai');
const expect = chai.expect;

describe('Layers API', function () {
    const Users = connection.model('Users');
    const Layers = connection.model('Layers');
    const DataSources = connection.model('DataSources');
    let agent;

    before(function () {
        agent = chai.request.agent(app);
    });

    after(() => {
        agent.close();
    });

    describe('GET /api/layers/find-all', function () {
        it('should find all layers and their data', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            res = await agent.get('/api/layers/find-all');
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
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/layers/create')
                .send({companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false});
            var decrypted = JSON.parse(res.text);
            res = await agent.get('/api/layers/find-one').query({id: decrypted.item._id});
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
            res = await Layers.deleteOne({name: 'layer'});
        });
    });
    describe('POST /api/layers/create', function () {
        it('should create a layer', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/layers/create')
                .send({companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false});
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
            res = await Layers.deleteOne({name: 'layer'});
        });
    });
    describe('POST /api/layers/update/:id', function () {
        it('should update one layer ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            var datasource = await DataSources.create({companyID: 'COMPID', name: 'DataSource', type: 'DataSource', status: 1, nd_trash_deleted: false});
            res = await agent.post('/api/layers/create')
                .send({companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false});
            var decrypted = JSON.parse(res.text);
            res = await agent.post('/api/layers/update/' + decrypted.item._id)
                .send({_id: decrypted.item._id, params: {schema: [{datasourceID: datasource.id}]}});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            res = await Layers.deleteOne({name: 'layer'});
            res = await DataSources.deleteOne({name: 'DataSource'});
        });
    });
    describe('POST /api/layers/change-layer-status', function () {
        it('should change layer status', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            res = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/layers/create')
                .send({companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false});
            var decrypted = JSON.parse(res.text);

            res = await agent.post('/api/layers/change-layer-status')
                .send({layerID: decrypted.item._id, status: 'active'});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Status updated.');
            res = await Layers.deleteOne({name: 'layer'});
        });
    });
    describe('GET /api/layers/get-layers', function () {
        it('should get layers', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);

            res = await agent.post('/api/layers/create')
                .send({companyID: 'COMPID', name: 'layer', status: 'active', nd_trash_deleted: false});
            res = await agent.get('/api/layers/get-layers');
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items[0]).to.have.property('_id');
            expect(decrypted.items[0]).to.have.property('name', 'layer');
            expect(decrypted.items[0]).to.have.property('objects');
            res = await Layers.deleteOne({name: 'layer'});
        });
    });
});
