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

describe('Users API', function () {
    let Datasource;
    let Layer;
    let Report;
    let Dashboard;
    let User;
    let Statistic;

    let headers;

    beforeAll(async () => {
        Datasource = mongoose.model('Datasource');
        Layer = mongoose.model('Layer');
        Report = mongoose.model('Report');
        Dashboard = mongoose.model('Dashboard');
        User = mongoose.model('User');
        Statistic = mongoose.model('Statistic');
        headers = await helpers.login(app);
    });

    describe('GET /api/admin/users/find-all', function () {
        it('should find all users and their data', async function () {
            const res = await request(app).get('/api/admin/users/find-all')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result');
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body.items[0]).toHaveProperty('_id');
            expect(res.body.items[0]).toHaveProperty('userName', 'administrator');
            expect(res.body.items[0]).toHaveProperty('companyID', 'COMPID');
            expect(res.body.items[0]).toHaveProperty('status', 'active');
            expect(res.body.items[0]).toHaveProperty('nd_trash_deleted');
            expect(res.body.items[0]).toHaveProperty('salt');
            expect(res.body.items[0]).toHaveProperty('hash');
            expect(res.body.items[0]).toHaveProperty('__v');
            expect(res.body.items[0]).toHaveProperty('last_login_date');
            expect(res.body.items[0]).toHaveProperty('last_login_ip');
            expect(res.body.items[0]).toHaveProperty('privateSpace');
            expect(res.body.items[0]).toHaveProperty('dialogs');
            expect(res.body.items[0]).toHaveProperty('contextHelp');
            expect(res.body.items[0]).toHaveProperty('filters');
            expect(res.body.items[0]).toHaveProperty('roles');
            expect(res.body.items[0].roles).toContain('ADMIN');
        });
    });
    describe('GET /api/admin/users/find-one', function () {
        it('should not find the user because there is a missing parameter', async function () {
            const res = await request(app).get('/api/admin/users/find-one')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 0);
            expect(res.body).toHaveProperty('msg');
        });

        it('should find the user and their data', async function () {
            var user = await User.findOne({ userName: 'administrator' });
            const res = await request(app).get('/api/admin/users/find-one')
                .query({ id: user.id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');
            expect(res.body.item).toHaveProperty('_id');
            expect(res.body.item).toHaveProperty('userName');
            expect(res.body.item).toHaveProperty('companyID');
            expect(res.body.item).toHaveProperty('status');
            expect(res.body.item).toHaveProperty('nd_trash_deleted');
            expect(res.body.item).toHaveProperty('__v');
            expect(res.body.item).toHaveProperty('last_login_date');
            expect(res.body.item).toHaveProperty('last_login_ip');
            expect(res.body.item).toHaveProperty('privateSpace');
            expect(res.body.item).toHaveProperty('startDate');
            expect(res.body.item).toHaveProperty('dialogs');
            expect(res.body.item).toHaveProperty('contextHelp');
            expect(res.body.item).toHaveProperty('filters');
            expect(res.body.item).toHaveProperty('roles');
            expect(res.body.item.roles).toContain('ADMIN');
        });
    });
    describe('POST /api/admin/users/create', function () {
        it('should create an user and delete him', async function () {
            const res = await request(app).post('/api/admin/users/create')
                .set(headers)
                .send({ userName: 'test', pwd1: 'urungi' });

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'User created.');
            expect(res.body).toHaveProperty('user');
            expect(res.body.user).toHaveProperty('__v');
            expect(res.body.user).toHaveProperty('userName');
            expect(res.body.user).toHaveProperty('companyID');
            expect(res.body.user).toHaveProperty('status');
            expect(res.body.user).toHaveProperty('nd_trash_deleted');
            expect(res.body.user).toHaveProperty('salt');
            expect(res.body.user).toHaveProperty('hash');
            expect(res.body.user).toHaveProperty('_id');
            expect(res.body.user).toHaveProperty('privateSpace');
            expect(res.body.user).toHaveProperty('startDate');
            expect(res.body.user).toHaveProperty('dialogs');
            expect(res.body.user).toHaveProperty('contextHelp');
            expect(res.body.user).toHaveProperty('filters');
            expect(res.body.user).toHaveProperty('roles');
            await User.deleteOne({ userName: 'test' });
        });
    });

    describe('POST /api/admin/users/update/:id', function () {
        it('should update administrator data', async function () {
            var user = await User.findOne({ userName: 'administrator' });
            const res = await request(app).post('/api/admin/users/update/' + user.id)
                .set(headers)
                .send({ email: 'admin@example.com', _id: user.id, firstName: 'update' });

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 record updated.');
            user = await User.findOne({ userName: 'administrator' });
            expect(user.firstName).toBe('update');
            expect(user.email).toBe('admin@example.com');
        });
    });

    describe('POST /api/admin/users/update/:id with new user', function () {
        it('should create a user and update his data ', async function () {
            let res = await request(app).post('/api/admin/users/create')
                .set(headers)
                .send({ userName: 'new', pwd1: 'urungi' });
            var user = await User.findOne({ userName: 'new' });
            res = await request(app).post('/api/admin/users/update/' + user.id)
                .set(headers)
                .send({ email: 'new@example.com', _id: user.id, firstName: 'update' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 record updated.');
            user = await User.findOne({ userName: 'new' });
            expect(user.firstName).toBe('update');
            expect(user.email).toBe('new@example.com');
            res = await User.deleteOne({ userName: 'new' });
        });
    });

    describe('POST /api/admin/users/delete/:id', function () {
        it('should create an user and delete him ', async function () {
            let res = await request(app).post('/api/admin/users/create')
                .set(headers)
                .send({ userName: 'new', pwd1: 'urungi' })
                .expect(200);

            var user = await User.findOne({ userName: 'new' });
            res = await request(app).post('/api/admin/users/delete/' + user.id)
                .set(headers)
                .send({ _id: user.id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 item deleted.');
        });
    });

    describe('POST /api/admin/users/change-user-status', function () {
        it('should return status 204 ', async function () {
            await request(app).post('/api/admin/users/create')
                .set(headers)
                .send({ userName: 'new', pwd1: 'urungi' });

            var user = await User.findOne({ userName: 'new' });
            await request(app).post('/api/admin/users/change-user-status')
                .set(headers)
                .send({ userID: user.id, status: 'Not active' })
                .expect(204);

            await User.deleteOne({ userName: 'new' });
        });

        it('should return status 500 if status is invalid', async function () {
            const user = await User.create({ userName: 'new', pwd1: 'password' });

            await request(app).post('/api/admin/users/change-user-status')
                .set(headers)
                .send({ userID: user.id, status: {} })
                .expect(500);

            await user.remove();
        });
    });

    describe('POST /api/change-my-password', function () {
        it('should update administrator password ', async function () {
            const res = await request(app).post('/api/change-my-password')
                .set(headers)
                .send({ pwd1: 'urungi', pwd2: 'urungi' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', 'Password changed');
        });

        it('should not update administrator password because passwords do not match ', async function () {
            const res = await request(app).post('/api/change-my-password')
                .set(headers)
                .send({ pwd1: 'urungi1', pwd2: 'urungi' })
                .expect(200);

            expect(res.body).toHaveProperty('result', 0);
            expect(res.body).toHaveProperty('msg', 'Passwords do not match');
        });
    });

    describe('GET /api/get-counts', function () {
        let datasource, layer, report, dashboard;
        let user;
        beforeEach(async function () {
            datasource = await Datasource.create({ companyID: 'COMPID', name: 'DataSource', type: 'DataSource', status: 1, nd_trash_deleted: false });
            layer = await Layer.create({ companyID: 'COMPID', name: 'Layer', status: 'active', nd_trash_deleted: false, datasourceID: datasource._id });
            user = await User.findOne({ userName: 'administrator' });
            report = await Report.create({ companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, createdBy: 'administrator', owner: user.id, selectedLayerID: layer.id, isShared: true });
            dashboard = await Dashboard.create({ companyID: 'COMPID', dashboardName: 'Dashboard1', owner: user.id, nd_trash_deleted: false });
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
            var res = await request(app).get('/api/get-counts')
                .set(headers)
                .expect(200);

            const reportsCount = await Report.countDocuments({ owner: user._id });
            const dashboardsCount = await Dashboard.countDocuments({ owner: user._id });
            const datasourcesCount = await Datasource.countDocuments({});
            const layersCount = await Layer.countDocuments({});
            const usersCount = await User.countDocuments({});

            expect(res.body).toHaveProperty('reports', reportsCount);
            expect(res.body).toHaveProperty('dashBoards', dashboardsCount);
            expect(res.body).toHaveProperty('dataSources', datasourcesCount);
            expect(res.body).toHaveProperty('layers', layersCount);
            expect(res.body).toHaveProperty('users', usersCount);
            expect(res.body).toHaveProperty('roles');
        });
    });

    describe('GET /api/get-user-counts/:id', function () {
        it('should count public and private reports and dashboard created by administrator ', async function () {
            var user = await User.findOne({ userName: 'administrator' });
            var report = await Report.create({
                companyID: 'COMPID',
                reportName: 'Report',
                nd_trash_deleted: false,
                createdBy: 'administrator',
                owner: user.id,
                isShared: true,
            });

            var dashboard = await Dashboard.create({
                companyID: 'COMPID',
                dashboardName: 'Dashboardcount',
                owner: user.id,
                nd_trash_deleted: false,
                isShared: true,
            });

            const res = await request(app).get('/api/get-user-counts/' + user.id)
                .query({ userID: user.id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('sharedReports', 1);
            expect(res.body).toHaveProperty('sharedDashBoards', 1);
            expect(res.body).toHaveProperty('privateReports');
            expect(res.body).toHaveProperty('privateDashBoards');
            await report.remove();
            await dashboard.remove();
        });
    });

    describe('GET /api/get-user-reports/:id', function () {
        it('should get a report with its data which was created by administrator ', async function () {
            var user = await User.findOne({ userName: 'administrator' });
            var report = await Report.create({
                companyID: 'COMPID',
                reportName: 'Report',
                nd_trash_deleted: false,
                createdBy: 'administrator',
                owner: user.id,
                isShared: true,
                parentFolder: 'parent',
                reportDescription: 'report Description',
                reportType: 'report',
            });

            const res = await request(app).get('/api/get-user-reports/' + user.id)
                .query({ userID: user.id })
                .set(headers)
                .expect(200);

            const reportsCount = await Report.countDocuments({ owner: user.id });

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveLength(reportsCount);
            expect(res.body.items.some(r => r._id === report.id)).toBeTruthy();
            await report.remove();
        });
    });

    describe('GET /api/get-user-dashboards/:id', function () {
        it('should get a dashboard with its data which was created by administrator ', async function () {
            var user = await User.findOne({ userName: 'administrator' });
            var dashboard = await Dashboard.create({
                companyID: 'COMPID',
                dashboardName: 'Dashboardget',
                owner: user.id,
                nd_trash_deleted: false,
                isShared: true,
                dashboardDescription: 'dashboard Description',
                dashboardType: 'dashboard',
            });
            const res = await request(app).get('/api/get-user-dashboards/' + user.id)
                .query({ userID: user.id })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveLength(1);
            expect(res.body.items[0]).toHaveProperty('dashboardName', 'Dashboardget');
            expect(res.body.items[0]).toHaveProperty('isShared', true);
            expect(res.body.items[0]).toHaveProperty('dashboardDescription', 'dashboard Description');
            await dashboard.remove();
        });
    });

    describe('GET /api/get-user-data with new user', function () {
        it('should return status 200 ', async function () {
            await User.findOne({ userName: 'administrator' });
            let res = await request(app).post('/api/admin/users/create')
                .set(headers)
                .send({ userName: 'new', pwd1: 'urungi' })
                .expect(200);

            var newUser = await User.findOne({ userName: 'new' });
            const newHeaders = await helpers.login(app, 'new', 'urungi');
            newUser = await User.findOne({ userName: 'new' });
            res = await request(app).get('/api/get-user-data')
                .set(newHeaders)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveProperty('user');
            expect(res.body.items.user).toHaveProperty('companyData');
            expect(res.body.items.user).toHaveProperty('companyID', 'COMPID');
            expect(res.body.items.user).toHaveProperty('contextHelp');
            expect(res.body.items.user).toHaveProperty('dialogs');
            expect(res.body.items.user).toHaveProperty('filters');
            expect(res.body.items.user).toHaveProperty('privateSpace');
            expect(res.body.items.user).toHaveProperty('roles');
            expect(res.body.items.user).toHaveProperty('status', 'active');
            expect(res.body.items.user).toHaveProperty('userName', 'new');
            expect(res.body.items).toHaveProperty('companyData');
            expect(res.body.items.companyData).toHaveProperty('_id');
            expect(res.body.items.companyData).toHaveProperty('companyID', 'COMPID');
            expect(res.body.items.companyData).toHaveProperty('createdBy');
            expect(res.body.items.companyData).toHaveProperty('nd_trash_deleted', false);
            expect(res.body.items.companyData).toHaveProperty('__v');
            expect(res.body.items.companyData).toHaveProperty('history');
            expect(res.body.items.companyData).toHaveProperty('sharedSpace');
            expect(res.body.items).toHaveProperty('rolesData');
            expect(res.body.items).toHaveProperty('reportsCreate');
            expect(res.body.items).toHaveProperty('dashboardsCreate');
            expect(res.body.items).toHaveProperty('exploreData');
            expect(res.body.items).toHaveProperty('viewSQL');
            await newUser.remove();
        });
    });
    describe('GET /api/get-user-data with administrator', function () {
        it('should get administrator data ', async function () {
            await User.findOne({ userName: 'administrator' });
            const res = await request(app).get('/api/get-user-data')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveProperty('user');
            expect(res.body.items.user).toHaveProperty('companyData');
            expect(res.body.items.user).toHaveProperty('companyID', 'COMPID');
            expect(res.body.items.user).toHaveProperty('contextHelp');
            expect(res.body.items.user).toHaveProperty('dialogs');
            expect(res.body.items.user).toHaveProperty('filters');
            expect(res.body.items.user).toHaveProperty('privateSpace');
            expect(res.body.items.user).toHaveProperty('roles');
            expect(res.body.items.user).toHaveProperty('status', 'active');
            expect(res.body.items.user).toHaveProperty('userName', 'administrator');
            expect(res.body.items.user).toHaveProperty('reportsCreate', true);
            expect(res.body.items.user).toHaveProperty('dashboardsCreate', true);
            expect(res.body.items.user).toHaveProperty('exploreData', true);
            expect(res.body.items.user).toHaveProperty('viewSQL', true);
            expect(res.body.items.user).toHaveProperty('canShare', true);
            expect(res.body.items.user).toHaveProperty('shareReports', true);
            expect(res.body.items.user).toHaveProperty('shareDashboards', true);
            expect(res.body.items).toHaveProperty('companyData');
            expect(res.body.items.companyData).toHaveProperty('_id');
            expect(res.body.items.companyData).toHaveProperty('companyID', 'COMPID');
            expect(res.body.items.companyData).toHaveProperty('createdBy');
            expect(res.body.items.companyData).toHaveProperty('nd_trash_deleted', false);
            expect(res.body.items.companyData).toHaveProperty('__v');
            expect(res.body.items.companyData).toHaveProperty('history');
            expect(res.body.items.companyData).toHaveProperty('sharedSpace');
            expect(res.body.items).toHaveProperty('rolesData');
            expect(res.body.items).toHaveProperty('reportsCreate', true);
            expect(res.body.items).toHaveProperty('dashboardsCreate', true);
            expect(res.body.items).toHaveProperty('exploreData', true);
            expect(res.body.items).toHaveProperty('viewSQL', true);
        });
    });
    describe('GET /api/get-user-last-executions', function () {
        let statistics1, statistics2, statistics3;

        beforeEach(async function () {
            var user = await User.findOne({ userName: 'administrator' });
            statistics1 = await Statistic.create({ type: 'report', relationedName: 'report1', action: 'execute', companyID: 'COMPID', userID: user.id, userName: 'administrator', createdBy: user.id });
            statistics2 = await Statistic.create({ type: 'report', relationedName: 'report1', action: 'execute', companyID: 'COMPID', userID: user.id, userName: 'administrator', createdBy: user.id });
            statistics3 = await Statistic.create({ type: 'report', relationedName: 'report2', action: 'execute', companyID: 'COMPID', userID: user.id, userName: 'administrator', createdBy: user.id });
        });
        afterEach(async function () {
            await Promise.all([
                statistics1.remove(),
                statistics2.remove(),
                statistics3.remove(),
            ]);
        });

        it('should return the last executions and the most executed reports ', async function () {
            const res = await request(app).get('/api/get-user-last-executions')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveProperty('theLastExecutions');
            expect(res.body.items).toHaveProperty('theMostExecuted');
            expect(res.body.items.theLastExecutions[0]).toHaveProperty('_id');
            expect(res.body.items.theLastExecutions[0]).toHaveProperty('lastDate');
            expect(res.body.items.theLastExecutions[0]._id).toHaveProperty('type');
            expect(res.body.items.theLastExecutions[0]._id).toHaveProperty('relationedName', 'report2');
            expect(res.body.items.theLastExecutions[0]._id).toHaveProperty('action');
            expect(res.body.items.theLastExecutions[1]).toHaveProperty('_id');
            expect(res.body.items.theLastExecutions[1]._id).toHaveProperty('type');
            expect(res.body.items.theLastExecutions[1]._id).toHaveProperty('relationedName', 'report1');
            expect(res.body.items.theLastExecutions[1]._id).toHaveProperty('action');
            expect(res.body.items.theMostExecuted[0]).toHaveProperty('_id');
            expect(res.body.items.theMostExecuted[0]).toHaveProperty('count', 2);
            expect(res.body.items.theMostExecuted[0]._id).toHaveProperty('type');
            expect(res.body.items.theMostExecuted[0]._id).toHaveProperty('relationedName', 'report1');
            expect(res.body.items.theMostExecuted[0]._id).toHaveProperty('action');
            expect(res.body.items.theMostExecuted[1]).toHaveProperty('_id');
            expect(res.body.items.theMostExecuted[1]).toHaveProperty('count', 1);
            expect(res.body.items.theMostExecuted[1]._id).toHaveProperty('type');
            expect(res.body.items.theMostExecuted[1]._id).toHaveProperty('relationedName', 'report2');
            expect(res.body.items.theMostExecuted[1]._id).toHaveProperty('action');
        });
    });

    describe('GET /api/set-viewed-context-help', function () {
        it('should return status 200', async function () {
            var user = await User.findOne({ userName: 'administrator' });
            expect(user).toHaveProperty('contextHelp');
            expect(user.contextHelp).toHaveLength(0);
            const res = await request(app).get('/api/set-viewed-context-help')
                .query({ contextHelpName: 'homeIndex' })
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('data');
            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0]).toBe('homeIndex');

            user = await User.findOne({ userName: 'administrator' });
            expect(user.contextHelp).toContain('homeIndex');
        });
    });

    describe('GET /api/get-user-objects', function () {
        it('should get report and dashboard id and title which was created by administrator', async function () {
            var user = await User.findOne({ userName: 'administrator' });
            var report = await Report.create({
                companyID: 'COMPID',
                reportName: 'Report',
                createdBy: 'administrator',
                owner: user.id,
                isShared: true,
                parentFolder: 'root',
                nd_trash_deleted: false,
            });
            var dashboard = await Dashboard.create({
                companyID: 'COMPID',
                dashboardName: 'Dashboard',
                owner: user.id,
                isShared: true,
                parentFolder: 'root',
                nd_trash_deleted: false,
            });
            const res = await request(app).get('/api/get-user-objects')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
            expect(res.body).toHaveProperty('userCanShare', true);
            expect(res.body.items[0]).toHaveProperty('id', report.id);
            expect(res.body.items[0]).toHaveProperty('title', 'Report');
            expect(res.body.items[0]).toHaveProperty('nodeType', 'report');
            expect(res.body.items[1]).toHaveProperty('id', dashboard.id);
            expect(res.body.items[1]).toHaveProperty('title', 'Dashboard');
            expect(res.body.items[1]).toHaveProperty('nodeType', 'dashboard');
            await report.remove();
            await dashboard.remove();
        });
    });
    describe('GET /api/get-user-other-data', function () {
        it('should get administrator other data which is not get by get user data function', async function () {
            const res = await request(app).get('/api/get-user-other-data')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page');
            expect(res.body).toHaveProperty('pages');
            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveProperty('_id');
            expect(res.body.items).toHaveProperty('userName', 'administrator');
            expect(res.body.items).toHaveProperty('companyID', 'COMPID');
            expect(res.body.items).toHaveProperty('status', 'active');
            expect(res.body.items).toHaveProperty('nd_trash_deleted');
            expect(res.body.items).toHaveProperty('salt');
            expect(res.body.items).toHaveProperty('hash');
            expect(res.body.items).toHaveProperty('__v');
            expect(res.body.items).toHaveProperty('last_login_date');
            expect(res.body.items).toHaveProperty('last_login_ip');
            expect(res.body.items).toHaveProperty('email');
            expect(res.body.items).toHaveProperty('firstName');
            expect(res.body.items).toHaveProperty('privateSpace');
            expect(res.body.items).toHaveProperty('startDate');
            expect(res.body.items).toHaveProperty('dialogs');
            expect(res.body.items).toHaveProperty('contextHelp');
            expect(res.body.items).toHaveProperty('filters');
            expect(res.body.items).toHaveProperty('roles');
        });
    });

    describe('POST /api/logout', function () {
        it('should return status 200', async function () {
            return request(app).post('/api/logout')
                .set(headers)
                .expect(204);
        });
    });
});
