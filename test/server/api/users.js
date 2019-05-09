const { app } = require('../../common');

const chai = require('chai');
const expect = chai.expect;

describe('Users API', function () {
    const DataSources = connection.model('DataSources');
    const Layers = connection.model('Layers');
    const Reports = connection.model('Reports');
    const Dashboards = connection.model('Dashboardsv2');
    const Users = connection.model('Users');
    const statistics = connection.model('statistics');
    let agent;

    before(function () {
        agent = chai.request.agent(app);
    });

    after(() => {
        agent.close();
    });

    describe('GET /api/admin/users/find-all', function () {
        it('should find all users and their data', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await agent.get('/api/admin/users/find-all');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.be.a('object');
            expect(decrypted).to.have.property('result');
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted.items).to.be.a('array');
            expect(decrypted.items[0]).to.have.property('_id');
            expect(decrypted.items[0]).to.have.property('userName', 'administrator');
            expect(decrypted.items[0]).to.have.property('companyID', 'COMPID');
            expect(decrypted.items[0]).to.have.property('status', 'active');
            expect(decrypted.items[0]).to.have.property('nd_trash_deleted');
            expect(decrypted.items[0]).to.have.property('salt');
            expect(decrypted.items[0]).to.have.property('hash');
            expect(decrypted.items[0]).to.have.property('__v');
            expect(decrypted.items[0]).to.have.property('last_login_date');
            expect(decrypted.items[0]).to.have.property('last_login_ip').to.be.an.ip;// eslint-disable-line no-unused-expressions
            expect(decrypted.items[0]).to.have.property('privateSpace');
            expect(decrypted.items[0]).to.have.property('dialogs');
            expect(decrypted.items[0]).to.have.property('contextHelp');
            expect(decrypted.items[0]).to.have.property('filters');
            expect(decrypted.items[0]).to.have.property('roles').to.be.a('array').to.include('WSTADMIN');
        });
    });
    describe('GET /api/admin/users/find-one', function () {
        it('should not find the user because there is a missing parameter', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await agent.get('/api/admin/users/find-one');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 0);
            expect(decrypted).to.have.property('msg');
        });

        it('should find the user and their data', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({ userName: 'administrator' });
            res = await agent.get('/api/admin/users/find-one').query({ id: User.id });
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('item');
            expect(decrypted.item).to.have.property('_id');
            expect(decrypted.item).to.have.property('userName');
            expect(decrypted.item).to.have.property('companyID');
            expect(decrypted.item).to.have.property('status');
            expect(decrypted.item).to.have.property('nd_trash_deleted');
            expect(decrypted.item).to.have.property('__v');
            expect(decrypted.item).to.have.property('last_login_date');
            expect(decrypted.item).to.have.property('last_login_ip').to.be.an.ip;// eslint-disable-line no-unused-expressions
            expect(decrypted.item).to.have.property('privateSpace');
            expect(decrypted.item).to.have.property('startDate');
            expect(decrypted.item).to.have.property('dialogs');
            expect(decrypted.item).to.have.property('contextHelp');
            expect(decrypted.item).to.have.property('filters');
            expect(decrypted.item).to.have.property('roles').to.be.a('array').to.include('WSTADMIN');
        });
    });
    describe('POST /api/admin/users/create', function () {
        it('should create an user and delete him', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/admin/users/create')
                .send({ userName: 'test', pwd1: 'urungi' });
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'User created.');
            expect(decrypted).to.have.property('user');
            expect(decrypted.user).to.have.property('__v');
            expect(decrypted.user).to.have.property('userName');
            expect(decrypted.user).to.have.property('companyID');
            expect(decrypted.user).to.have.property('status');
            expect(decrypted.user).to.have.property('nd_trash_deleted');
            expect(decrypted.user).to.have.property('salt');
            expect(decrypted.user).to.have.property('hash');
            expect(decrypted.user).to.have.property('_id');
            expect(decrypted.user).to.have.property('privateSpace');
            expect(decrypted.user).to.have.property('startDate');
            expect(decrypted.user).to.have.property('dialogs');
            expect(decrypted.user).to.have.property('contextHelp');
            expect(decrypted.user).to.have.property('filters');
            expect(decrypted.user).to.have.property('roles');
            res = await Users.deleteOne({ userName: 'test' });
        });
    });

    describe('POST /api/admin/users/update/:id', function () {
        it('should update administrator data', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            var User = await Users.findOne({ userName: 'administrator' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/admin/users/update/' + User.id)
                .send({ email: 'admin@example.com', _id: User.id, firstName: 'update' });
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            User = await Users.findOne({ userName: 'administrator' });
            expect(User.firstName).to.equal('update');
            expect(User.email).to.equal('admin@example.com');
        });
    });

    describe('POST /api/admin/users/update/:id with new user', function () {
        it('should create a user and update his data ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/admin/users/create')
                .send({ userName: 'new', pwd1: 'urungi' });
            var User = await Users.findOne({ userName: 'new' });
            res = await agent.post('/api/admin/users/update/' + User.id)
                .send({ email: 'new@example.com', _id: User.id, firstName: 'update' });
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 record updated.');
            User = await Users.findOne({ userName: 'new' });
            expect(User.firstName).to.equal('update');
            expect(User.email).to.equal('new@example.com');
            res = await Users.deleteOne({ userName: 'new' });
        });
    });

    describe('POST /api/admin/users/delete/:id', function () {
        it('should create an user and delete him ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/admin/users/create')
                .send({ userName: 'new', pwd1: 'urungi' });
            var User = await Users.findOne({ userName: 'new' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/admin/users/delete/' + User.id)
                .send({ _id: User.id });
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', '1 items deleted.');
        });
    });

    describe('POST /api/admin/users/change-user-status', function () {
        it('should return status 200 ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/admin/users/create')
                .send({ userName: 'new', pwd1: 'urungi' });
            var User = await Users.findOne({ userName: 'new' });
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/admin/users/change-user-status')
                .send({ userID: User.id, status: 'Not active' });
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Status updated.');
            res = await Users.deleteOne({ userName: 'new' });
        });
    });

    describe('POST /api/logout', function () {
        it('should return status 200', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            res = await agent.post('/api/logout');
            expect(res).to.have.status(200);
        });
    });

    describe('POST /api/change-my-password', function () {
        it('should update admminstrator password ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/change-my-password')
                .send({ pwd1: 'urungi', pwd2: 'urungi' });
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('msg', 'Password changed');
        });
        it('should not update administrator password because passwords do not match ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/change-my-password')
                .send({ pwd1: 'urungi1', pwd2: 'urungi' });
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 0);
            expect(decrypted).to.have.property('msg', 'Passwords do not match');
        });
    });

    describe('GET /api/get-counts', function () {
        let datasource, layer, report, dashboard;
        beforeEach(async function () {
            datasource = await DataSources.create({ companyID: 'COMPID', name: 'DataSource', type: 'DataSource', status: 1, nd_trash_deleted: false });
            layer = await Layers.create({ companyID: 'COMPID', name: 'Layer', type: 'Layer', status: '1', nd_trash_deleted: false, createdBy: 'administrator' });
            var User = await Users.findOne({ userName: 'administrator' });
            report = await Reports.create({ companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, createdBy: 'administrator', owner: User.id, selectedLayerID: layer.id, isPublic: true });
            dashboard = await Dashboards.create({ companyID: 'COMPID', dashboardName: 'Dashboard1', owner: User.id, nd_trash_deleted: false });
        });

        afterEach(async function () {
            await Promise.all([
                dashboard.remove(),
                report.remove(),
                layer.remove(),
                datasource.remove(),
            ]);
        });

        it('should count report, dashboards, layers and users ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            var count = await agent.get('/api/get-counts');
            expect(count).to.have.status(200);
            var decrypted = JSON.parse(count.text);
            expect(decrypted).to.have.property('reports', 1);
            expect(decrypted).to.have.property('dashBoards', 1);
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('dataSources', 1);
            expect(decrypted).to.have.property('layers', 1);
            expect(decrypted).to.have.property('users', 1);
            expect(decrypted).to.have.property('roles');
        });
    });

    describe('GET /api/get-user-counts/:id', function () {
        it('should count public and private reports and dashboard created by administrator ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({ userName: 'administrator' });
            var report = await Reports.create({ companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, createdBy: 'administrator', owner: User.id, isPublic: true });
            var dashboard = await Dashboards.create({ companyID: 'COMPID', dashboardName: 'Dashboardcount', owner: User.id, nd_trash_deleted: false, isPublic: true });
            var count = await agent.get('/api/get-user-counts/' + User.id)
                .query({ userID: User.id });
            expect(count).to.have.status(200);
            var decrypted = JSON.parse(count.text);
            expect(decrypted).to.have.property('publishedReports', 1);
            expect(decrypted).to.have.property('publishedDashBoards', 1);
            expect(decrypted).to.have.property('privateReports');
            expect(decrypted).to.have.property('privateDashBoards');
            res = await report.remove();
            res = await dashboard.remove();
        });
    });

    describe('GET /api/get-user-reports/:id', function () {
        it('should get a report with its data which was created by administrator ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({ userName: 'administrator' });
            var report = await Reports.create({ companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, createdBy: 'administrator', owner: User.id, isPublic: true, parentFolder: 'parent', reportDescription: 'report Description', reportType: 'report' });
            res = await agent.get('/api/get-user-reports/' + User.id)
                .query({ userID: User.id });
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.be.a('array');
            expect(decrypted.items[0]).to.have.property('reportName', 'Report');
            expect(decrypted.items[0]).to.have.property('isPublic', true);
            expect(decrypted.items[0]).to.have.property('parentFolder', 'parent');
            expect(decrypted.items[0]).to.have.property('reportDescription', 'report Description');
            expect(decrypted.items[0]).to.have.property('reportType', 'report');
            res = await report.remove();
        });
    });

    describe('GET /api/get-user-dashboards/:id', function () {
        it('should get a dashboard with its data which was created by administrator ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            expect(res).to.have.status(200);
            var User = await Users.findOne({ userName: 'administrator' });
            var dashboard = await Dashboards.create({ companyID: 'COMPID', dashboardName: 'Dashboardget', owner: User.id, nd_trash_deleted: false, isPublic: true, dashboardDescription: 'dashboard Description', dashboardType: 'dashboard' });
            res = await agent.get('/api/get-user-dashboards/' + User.id)
                .query({ userID: User.id });
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.be.a('array');
            expect(decrypted.items[0]).to.have.property('dashboardName', 'Dashboardget');
            expect(decrypted.items[0]).to.have.property('isPublic', true);
            expect(decrypted.items[0]).to.have.property('dashboardDescription', 'dashboard Description');
            expect(res).to.have.status(200);
            res = await dashboard.remove();
        });
    });
    describe('GET /api/get-user-data with new user', function () {
        it('should return status 200 ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            await Users.findOne({ userName: 'administrator' });
            expect(res).to.have.status(200);
            res = await agent.post('/api/admin/users/create')
                .send({ userName: 'new', pwd1: 'urungi' });
            var newUser = await Users.findOne({ userName: 'new' });
            expect(res).to.have.status(200);
            res = await agent.get('/api/get-user-data');
            res = await agent.post('/api/logout');
            expect(res).to.have.status(200);
            res = await agent.post('/api/login')
                .send({ userName: 'new', password: 'urungi' });
            newUser = await Users.findOne({ userName: 'new' });
            expect(res).to.have.status(200);
            res = await agent.get('/api/get-user-data');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.have.property('user');
            expect(decrypted.items.user).to.have.property('companyData');
            expect(decrypted.items.user).to.have.property('companyID', 'COMPID');
            expect(decrypted.items.user).to.have.property('contextHelp');
            expect(decrypted.items.user).to.have.property('dialogs');
            expect(decrypted.items.user).to.have.property('filters');
            expect(decrypted.items.user).to.have.property('privateSpace');
            expect(decrypted.items.user).to.have.property('roles');
            expect(decrypted.items.user).to.have.property('status', 'active');
            expect(decrypted.items.user).to.have.property('userName', 'new');
            expect(decrypted.items).to.have.property('companyData');
            expect(decrypted.items.companyData).to.have.property('_id');
            expect(decrypted.items.companyData).to.have.property('companyID', 'COMPID');
            expect(decrypted.items.companyData).to.have.property('createdBy');
            expect(decrypted.items.companyData).to.have.property('nd_trash_deleted', false);
            expect(decrypted.items.companyData).to.have.property('__v');
            expect(decrypted.items.companyData).to.have.property('history');
            expect(decrypted.items.companyData).to.have.property('publicSpace');
            expect(decrypted.items).to.have.property('rolesData');
            expect(decrypted.items).to.have.property('reportsCreate');
            expect(decrypted.items).to.have.property('dashboardsCreate');
            expect(decrypted.items).to.have.property('pagesCreate');
            expect(decrypted.items).to.have.property('exploreData');
            expect(decrypted.items).to.have.property('viewSQL');
            expect(decrypted.items).to.have.property('isWSTADMIN', false);
            expect(res).to.have.status(200);
            res = await newUser.remove();
        });
    });
    describe('GET /api/get-user-data with administrator', function () {
        it('should get administrator data ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            await Users.findOne({ userName: 'administrator' });
            expect(res).to.have.status(200);
            res = await agent.get('/api/get-user-data');
            expect(res).to.have.status(200);
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.have.property('user');
            expect(decrypted.items.user).to.have.property('companyData');
            expect(decrypted.items.user).to.have.property('companyID', 'COMPID');
            expect(decrypted.items.user).to.have.property('contextHelp');
            expect(decrypted.items.user).to.have.property('dialogs');
            expect(decrypted.items.user).to.have.property('filters');
            expect(decrypted.items.user).to.have.property('privateSpace');
            expect(decrypted.items.user).to.have.property('roles');
            expect(decrypted.items.user).to.have.property('status', 'active');
            expect(decrypted.items.user).to.have.property('userName', 'administrator');
            expect(decrypted.items.user).to.have.property('reportsCreate', true);
            expect(decrypted.items.user).to.have.property('dashboardsCreate', true);
            expect(decrypted.items.user).to.have.property('exploreData', true);
            expect(decrypted.items.user).to.have.property('viewSQL', true);
            expect(decrypted.items.user).to.have.property('isWSTADMIN', true);
            expect(decrypted.items.user).to.have.property('canPublish', true);
            expect(decrypted.items.user).to.have.property('publishReports', true);
            expect(decrypted.items.user).to.have.property('publishDashboards', true);
            expect(decrypted.items).to.have.property('companyData');
            expect(decrypted.items.companyData).to.have.property('_id');
            expect(decrypted.items.companyData).to.have.property('companyID', 'COMPID');
            expect(decrypted.items.companyData).to.have.property('createdBy');
            expect(decrypted.items.companyData).to.have.property('nd_trash_deleted', false);
            expect(decrypted.items.companyData).to.have.property('__v');
            expect(decrypted.items.companyData).to.have.property('history');
            expect(decrypted.items.companyData).to.have.property('publicSpace');
            expect(decrypted.items).to.have.property('rolesData');
            expect(decrypted.items).to.have.property('reportsCreate', true);
            expect(decrypted.items).to.have.property('dashboardsCreate', true);
            expect(decrypted.items).to.have.property('pagesCreate', true);
            expect(decrypted.items).to.have.property('exploreData', true);
            expect(decrypted.items).to.have.property('viewSQL', true);
            expect(decrypted.items).to.have.property('isWSTADMIN', true);
        });
    });
    describe('GET /api/get-user-last-executions', function () {
        let statistics1, statistics2, statistics3;
        beforeEach(async function () {
            var User = await Users.findOne({ userName: 'administrator' });
            statistics1 = await statistics.create({ type: 'report', relationedName: 'report1', action: 'execute', companyID: 'COMPID', userID: User.id, userName: 'administrator', createdBy: User.id });
            statistics2 = await statistics.create({ type: 'report', relationedName: 'report1', action: 'execute', companyID: 'COMPID', userID: User.id, userName: 'administrator', createdBy: User.id });
            statistics3 = await statistics.create({ type: 'report', relationedName: 'report2', action: 'execute', companyID: 'COMPID', userID: User.id, userName: 'administrator', createdBy: User.id });
        });
        afterEach(async function () {
            await Promise.all([
                statistics1.remove(),
                statistics2.remove(),
                statistics3.remove(),
            ]);
        });
        it('should return the last executions and the most executed reports ', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            res = await agent.get('/api/get-user-last-executions');
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.have.property('theLastExecutions');
            expect(decrypted.items).to.have.property('theMostExecuted');
            expect(decrypted.items.theLastExecutions[0]).to.have.property('_id');
            expect(decrypted.items.theLastExecutions[0]).to.have.property('lastDate');
            expect(decrypted.items.theLastExecutions[0]._id).to.have.property('type');
            expect(decrypted.items.theLastExecutions[0]._id).to.have.property('relationedName', 'report2');
            expect(decrypted.items.theLastExecutions[0]._id).to.have.property('action');
            expect(decrypted.items.theLastExecutions[1]).to.have.property('_id');
            expect(decrypted.items.theLastExecutions[1]._id).to.have.property('type');
            expect(decrypted.items.theLastExecutions[1]._id).to.have.property('relationedName', 'report1');
            expect(decrypted.items.theLastExecutions[1]._id).to.have.property('action');
            expect(decrypted.items.theMostExecuted[0]).to.have.property('_id');
            expect(decrypted.items.theMostExecuted[0]).to.have.property('count', 2);
            expect(decrypted.items.theMostExecuted[0]._id).to.have.property('type');
            expect(decrypted.items.theMostExecuted[0]._id).to.have.property('relationedName', 'report1');
            expect(decrypted.items.theMostExecuted[0]._id).to.have.property('action');
            expect(decrypted.items.theMostExecuted[1]).to.have.property('_id');
            expect(decrypted.items.theMostExecuted[1]).to.have.property('count', 1);
            expect(decrypted.items.theMostExecuted[1]._id).to.have.property('type');
            expect(decrypted.items.theMostExecuted[1]._id).to.have.property('relationedName', 'report2');
            expect(decrypted.items.theMostExecuted[1]._id).to.have.property('action');
        });
    });

    describe('GET /api/set-viewed-context-help', function () {
        it('should return status 200', async function () {
            await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            var User = await Users.findOne({ userName: 'administrator' });
            expect(User).to.have.property('contextHelp').to.be.an('array').that.is.empty;// eslint-disable-line no-unused-expressions
            await agent.get('/api/set-viewed-context-help').query({ contextHelpName: 'homeIndex' });
            User = await Users.findOne({ userName: 'administrator' });
            expect(User).to.have.deep.property('contextHelp', ['homeIndex']);
        });
    });
    describe('GET /api/get-user-objects', function () {
        it('should get report and dashboard id and title which was created by administrator', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            var User = await Users.findOne({ userName: 'administrator' });
            var report = await Reports.create({ companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, createdBy: 'administrator', owner: User.id, isPublic: true, parentFolder: 'root' });
            var dashboard = await Dashboards.create({ companyID: 'COMPID', dashboardName: 'Dashboard', owner: User.id, nd_trash_deleted: false, isPublic: true, parentFolder: 'root' });
            res = await agent.get('/api/get-user-objects');
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted).to.have.property('userCanPublish', true);
            expect(decrypted.items[0]).to.have.property('id', report.id);
            expect(decrypted.items[0]).to.have.property('title', 'Report');
            expect(decrypted.items[0]).to.have.property('nodeType', 'report');
            expect(decrypted.items[1]).to.have.property('id', dashboard.id);
            expect(decrypted.items[1]).to.have.property('title', 'Dashboard');
            expect(decrypted.items[1]).to.have.property('nodeType', 'dashboard');
            res = await report.remove();
            res = await dashboard.remove();
        });
    });
    describe('GET /api/get-user-other-data', function () {
        it('should get administrator other data which is not get by get user data function', async function () {
            var res = await agent.post('/api/login')
                .send({ userName: 'administrator', password: 'urungi' });
            res = await Users.findOne({ userName: 'administrator' });
            res = await agent.get('/api/get-user-other-data');
            var decrypted = JSON.parse(res.text);
            expect(decrypted).to.have.property('result', 1);
            expect(decrypted).to.have.property('page');
            expect(decrypted).to.have.property('pages');
            expect(decrypted).to.have.property('items');
            expect(decrypted.items).to.have.property('_id');
            expect(decrypted.items).to.have.property('userName', 'administrator');
            expect(decrypted.items).to.have.property('companyID', 'COMPID');
            expect(decrypted.items).to.have.property('status', 'active');
            expect(decrypted.items).to.have.property('nd_trash_deleted');
            expect(decrypted.items).to.have.property('salt');
            expect(decrypted.items).to.have.property('hash');
            expect(decrypted.items).to.have.property('__v');
            expect(decrypted.items).to.have.property('last_login_date');
            expect(decrypted.items).to.have.property('last_login_ip');
            expect(decrypted.items).to.have.property('email');
            expect(decrypted.items).to.have.property('firstName');
            expect(decrypted.items).to.have.property('privateSpace');
            expect(decrypted.items).to.have.property('startDate');
            expect(decrypted.items).to.have.property('dialogs');
            expect(decrypted.items).to.have.property('contextHelp');
            expect(decrypted.items).to.have.property('filters');
            expect(decrypted.items).to.have.property('roles');
        });
    });
});
