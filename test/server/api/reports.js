const { app } = require('../../common');

const chai = require('chai');
const expect = chai.expect;

describe('Reports API', function () {
    const Reports = connection.model('Reports');
    const Users = connection.model('Users');

    let agent;
    let user;
    let report;

    before(async function () {
        agent = chai.request.agent(app);
        await agent.post('/api/login').send({ userName: 'administrator', password: 'urungi' });
        await agent.get('/api/get-user-data');
        user = await Users.findOne({ userName: 'administrator' });
    });

    beforeEach(async function () {
        report = await Reports.create({
            companyID: 'COMPID',
            reportName: 'Report',
            nd_trash_deleted: false,
            owner: user.id,
            isPublic: false,
            createdBy: user.id,
            createdOn: new Date(),
        });
    });

    afterEach(async function () {
        await report.remove();
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
            const res = await agent.post('/api/reports/create').send({
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
