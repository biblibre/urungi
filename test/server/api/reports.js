const { app } = require('../../common');

const chai = require('chai');
const expect = chai.expect;

describe('Reports API', function () {
    const Reports = connection.model('Reports');
    const Users = connection.model('Users');
    let agent;

    before(function () {
        agent = chai.request.agent(app);
    });

    after(() => {
        agent.close();
    });

    describe('GET /api/reports/find-all', function () {
        it('should find all reports and their data', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            res = await agent.get('/api/reports/find-all');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
        });
    });

    describe('GET /api/reports/find-one', function () {
        it('should find one report and its data', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/reports/create')
                .send({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, owner: User.id, isPublic: false});
            var decrypted = JSON.parse(res.text);
            res = await agent.get('/api/reports/find-one').query({id: decrypted.item._id});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result');
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('reportName', 'Report');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false);
            expect(decrypted.item).to.have.property('owner', User.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy', User.id);
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('history');
            res = await Reports.deleteOne({reportName: 'Report'});
        });
    });

    describe('POST /api/reports/create', function () {
        it('should create a report', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/reports/create')
                .send({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, owner: User.id, isPublic: false});
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Item created');
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('reportName', 'Report');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false);
            expect(decrypted.item).to.have.property('owner', User.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy', User.id);
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('history');
            res = await Reports.deleteOne({reportName: 'Report'});
        });
    });
    describe('POST /api/reports/update:id', function () {
        it('should update a report', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/reports/create')
                .send({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, owner: User.id, isPublic: false});
            var decrypted = JSON.parse(res.text);
            res = await agent.post('/api/reports/update/' + decrypted.item._id)
                .send({_id: decrypted.item._id});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            res = await Reports.deleteOne({reportName: 'Report'});
        });
    });
    describe('POST /api/reports/delete:id', function () {
        it('should delete a report', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/reports/create')
                .send({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, owner: User.id, isPublic: false});
            var decrypted = JSON.parse(res.text);
            res = await agent.post('/api/reports/delete/' + decrypted.item._id)
                .send({_id: decrypted.item._id});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 items deleted.');
        });
    });
    describe('POST /api/reports/get-data', function () {
        it('should return data ');
    });

    describe('POST /api/reports/get-report/:id', function () {
        it('should get report', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            var User = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/reports/create')
                .send({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, owner: User.id, isPublic: false});
            var decrypted = JSON.parse(res.text);
            res = await agent.get('/api/reports/get-report/' + decrypted.item._id)
                .query({id: decrypted.item._id});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('companyID', 'COMPID');
            expect(decrypted.item).to.have.property('reportName', 'Report');
            expect(decrypted.item).to.have.property('nd_trash_deleted', false);
            expect(decrypted.item).to.have.property('owner', User.id);
            expect(decrypted.item).to.have.property('isPublic', false);
            expect(decrypted.item).to.have.property('createdBy', User.id);
            expect(decrypted.item).to.have.property('createdOn');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('history');
            res = await Reports.deleteOne({reportName: 'Report'});
        });
    });

    describe('POST /api/reports/publish-report', function () {
        it('should publish a report', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/reports/create')
                .send({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, owner: User.id, isPublic: false});
            var decrypted = JSON.parse(res.text);
            res = await agent.post('/api/reports/publish-report')
                .send({_id: decrypted.item._id});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            res = await Reports.deleteOne({reportName: 'Report'});
        });
    });

    describe('POST /api/reports/unpublish', function () {
        it('should unpublish a report', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'widestage' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({userName: 'administrator'});
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/reports/create')
                .send({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, owner: User.id, isPublic: true});
            var decrypted = JSON.parse(res.text);
            res = await agent.post('/api/reports/unpublish')
                .send({_id: decrypted.item._id});
            expect(res).to.have.status(200);
            decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            res = await Reports.deleteOne({reportName: 'Report'});
        });
    });
});
