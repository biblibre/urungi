const { app } = require('../../common');

const chai = require('chai');
const expect = chai.expect;

describe('Dashboards API', function () {
    const Users = connection.model('Users');
    const Dashboardsv2 = connection.model('Dashboardsv2');
    let agent;

    before(function () {
        agent = chai.request.agent(app);
    });

    after(() => {
        agent.close();
    });

    describe('GET /api/dashboardsv2/find-all', function () {
        it('should find all dashboards and their data', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await agent.get('/api/dashboardsv2/find-all');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
        });
    });

    describe('GET /api/dashboardsv2/find-one', function () {
        it('should find one dashboard and its data', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            var user = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/dashboardsv2/create')
                .send({companyID: 'COMPID', dashboardName: 'Dashboard'});
            var decrypted = JSON.parse(res.text);
            res = await agent.get('/api/dashboardsv2/find-one').query({id: decrypted.item._id});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('dashboardName', 'Dashboard');
            expect(decrypted.item).to.have.property('owner', user.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy', user.id);
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('history');
            expect(decrypted.item).to.have.property('items');
            expect(decrypted.item).to.have.property('reports');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false); ;

            res = await Dashboardsv2.deleteOne({dashboardName: 'Dashboard'});
        });
    });
    describe('POST /api/dashboardsv2/create', function () {
        it('should create a dashboard', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            var user = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/dashboardsv2/create')
                .send({companyID: 'COMPID', dashboardName: 'Dashboard'});
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Item created');
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('dashboardName', 'Dashboard');
            expect(decrypted.item).to.have.property('owner', user.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy', user.id);
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('history');
            expect(decrypted.item).to.have.property('items');
            expect(decrypted.item).to.have.property('reports');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false); ;
            res = await Dashboardsv2.deleteOne({dashboardName: 'Dashboard'});
        });
    });

    describe('POST /api/dashboardsv2/duplicate', function () {
        it('should duplicate a dashboard', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            var user = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/dashboardsv2/create')
                .send({companyID: 'COMPID', dashboardName: 'Dashboard'});
            expect(res).to.have.status(200);
            res = await agent.post('/api/dashboardsv2/duplicate')
                .send({companyID: 'COMPID', dashboardName: 'Dashboard'});
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Item created');
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('dashboardName', 'Copy of Dashboard');
            expect(decrypted.item).to.have.property('owner', user.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy', user.id);
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('history');
            expect(decrypted.item).to.have.property('items');
            expect(decrypted.item).to.have.property('reports');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false); ;
            res = await Dashboardsv2.deleteOne({dashboardName: 'Copy of Dashboard'});
            res = await Dashboardsv2.deleteOne({dashboardName: 'Dashboard'});
        });
    });

    describe('POST /api/dashboardsv2/update:id', function () {
        it('should update a dashboard', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/dashboardsv2/create')
                .send({companyID: 'COMPID', dashboardName: 'Dashboard'});
            var decrypted = JSON.parse(res.text);
            res = await agent.post('/api/dashboardsv2/update/' + decrypted.item._id)
                .send({_id: decrypted.item._id});
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            res = await Dashboardsv2.deleteOne({dashboardName: 'Dashboard'});
        });
    });

    describe('POST /api/dashboardsv2/delete:id', function () {
        it('should delete a dashboard', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/dashboardsv2/create')
                .send({companyID: 'COMPID', dashboardName: 'Dashboard'});
            var decrypted = JSON.parse(res.text);
            res = await agent.post('/api/dashboardsv2/delete/' + decrypted.item._id)
                .send({id: decrypted.item._id});
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            res = await Dashboardsv2.deleteOne({dashboardName: 'Dashboard'});
        });
    });

    describe('GET /api/dashboardsv2/get/:id', function () {
        it('should get a dashboard and its data', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            var user = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/dashboardsv2/create')
                .send({companyID: 'COMPID', dashboardName: 'Dashboard'});
            var decrypted = JSON.parse(res.text);
            res = await agent.get('/api/dashboardsv2/get/' + decrypted.item._id)
                .query({id: decrypted.item._id});
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('dashboardName', 'Dashboard');
            expect(decrypted.item).to.have.property('owner', user.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy', user.id);
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false);
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('history');
            expect(decrypted.item).to.have.property('items');
            expect(decrypted.item).to.have.property('reports');
            res = await Dashboardsv2.deleteOne({dashboardName: 'Dashboard'});
        });
    });

    describe('POST /api/dashboardsv2/publish-page', function () {
        it('should publish a dashboard', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/dashboardsv2/create')
                .send({companyID: 'COMPID', dashboardName: 'Dashboard'});
            var decrypted = JSON.parse(res.text);
            res = await agent.post('/api/dashboardsv2/publish-page')
                .send({_id: decrypted.item._id});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            res = await Dashboardsv2.deleteOne({dashboardName: 'Dashboard'});
        });
    });

    describe('POST /api/dashboardsv2/unpublish', function () {
        it('should unpublish a dashboard', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/dashboardsv2/create')
                .send({companyID: 'COMPID', dashboardName: 'Dashboard'});
            var decrypted = JSON.parse(res.text);
            res = await agent.post('/api/dashboardsv2/unpublish')
                .send({_id: decrypted.item._id});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            res = await Dashboardsv2.deleteOne({dashboardName: 'Dashboard'});
        });
    });
});
