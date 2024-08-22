const helpers = require('../helpers');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let app;
let mongod;
beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    process.env.MONGODB_URI = mongod.getUri();
    app = require('../../../server/app');
});
afterAll(async () => {
    await mongoose.connection.close();
    await mongod.stop();
});

describe('User API', function () {
    let adminHeaders, userHeaders;
    let User, Datasource, Layer, Report, Dashboard, Company, Role;

    beforeAll(async () => {
        User = mongoose.model('User');
        Datasource = mongoose.model('Datasource');
        Layer = mongoose.model('Layer');
        Report = mongoose.model('Report');
        Dashboard = mongoose.model('Dashboard');
        Company = mongoose.model('Company');
        Role = mongoose.model('Role');

        adminHeaders = await helpers.login(app);

        const role = await Role.create({
            name: 'Normal user',
            reportsCreate: true,
            grants: [
                {
                    folderID: 'foo.bar',
                    shareReports: true,
                    executeReports: true,
                    executeDashboards: true,
                },
            ],
        });
        await User.create({
            userName: 'user',
            password: 'password',
            companyID: 'COMPID',
            roles: [role.id],
        });

        userHeaders = await helpers.login(app, 'user', 'password');
    });

    describe('GET /api/user', function () {
        describe('when authenticated as a normal user', function () {
            it('should return authenticated user data', async function () {
                await User.findOne({ userName: 'administrator' });
                const res = await request(app).get('/api/user')
                    .set(userHeaders);

                expect(res.status).toBe(200);

                expect(res.body).toHaveProperty('companyID', 'COMPID');
                expect(res.body).toHaveProperty('contextHelp');
                expect(res.body).toHaveProperty('dialogs');
                expect(res.body).toHaveProperty('filters');
                expect(res.body).toHaveProperty('privateSpace');
                expect(res.body).toHaveProperty('roles');
                expect(res.body).toHaveProperty('status', 'active');
                expect(res.body).toHaveProperty('userName', 'user');
                expect(res.body).toHaveProperty('reportsCreate', true);
            });
        });

        describe('when authenticated as admin', function () {
            it('should return authenticated user data', async function () {
                await User.findOne({ userName: 'administrator' });
                const res = await request(app).get('/api/user')
                    .set(adminHeaders);

                expect(res.status).toBe(200);

                expect(res.body).toHaveProperty('companyID', 'COMPID');
                expect(res.body).toHaveProperty('contextHelp');
                expect(res.body).toHaveProperty('dialogs');
                expect(res.body).toHaveProperty('filters');
                expect(res.body).toHaveProperty('privateSpace');
                expect(res.body).toHaveProperty('roles');
                expect(res.body).toHaveProperty('status', 'active');
                expect(res.body).toHaveProperty('userName', 'administrator');
                expect(res.body).toHaveProperty('reportsCreate', true);
                expect(res.body).toHaveProperty('dashboardsCreate', true);
                expect(res.body).toHaveProperty('exploreData', true);
                expect(res.body).toHaveProperty('viewSQL', true);
            });
        });

        describe('when authenticated as an inactive user', function () {
            beforeAll(async () => {
                await User.updateOne({ userName: 'user' }, { $set: { status: 'Not active' } });
            });
            afterAll(async () => {
                await User.updateOne({ userName: 'user' }, { $set: { status: 'active' } });
            });

            it('should return 403', async function () {
                const res = await request(app).get('/api/user')
                    .set(userHeaders);

                expect(res.status).toBe(403);
            });
        });
    });

    describe('GET /api/user/counts', function () {
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
                dashboard.deleteOne(),
                report.deleteOne(),
                layer.deleteOne(),
                datasource.deleteOne(),
            ]);
        });

        it('should count report, dashboards, layers and users', async function () {
            const res = await request(app).get('/api/user/counts')
                .set(adminHeaders)
                .expect(200);

            const reportsCount = await Report.countDocuments({ owner: user._id });
            const dashboardsCount = await Dashboard.countDocuments({ owner: user._id });
            const datasourcesCount = await Datasource.countDocuments({});
            const layersCount = await Layer.countDocuments({});
            const usersCount = await User.countDocuments({});

            expect(res.body).toHaveProperty('reports', reportsCount);
            expect(res.body).toHaveProperty('dashboards', dashboardsCount);
            expect(res.body).toHaveProperty('datasources', datasourcesCount);
            expect(res.body).toHaveProperty('layers', layersCount);
            expect(res.body).toHaveProperty('users', usersCount);
            expect(res.body).toHaveProperty('roles');
        });

        it('should returns only reports and dashboards count if not admin', async function () {
            const user = new User({ userName: 'a', password: 'a', companyID: 'COMPID' });
            await user.save();
            const headers = await helpers.login(app, 'a', 'a');
            const res = await request(app).get('/api/user/counts').set(headers);

            const reportsCount = await Report.countDocuments({ owner: user._id });
            const dashboardsCount = await Dashboard.countDocuments({ owner: user._id });

            expect(res).toHaveProperty('status', 200);
            expect(res.body).toHaveProperty('reports', reportsCount);
            expect(res.body).toHaveProperty('dashboards', dashboardsCount);
            expect(res.body).not.toHaveProperty('datasources');
            expect(res.body).not.toHaveProperty('layers');
            expect(res.body).not.toHaveProperty('users');
            expect(res.body).not.toHaveProperty('roles');

            await user.deleteOne();
        });
    });

    describe('GET /api/user/objects', function () {
        let report, dashboard;

        beforeEach(async function () {
            const user = await User.findOne({ userName: 'user' });
            const company = await Company.findOne({ companyID: 'COMPID' });
            company.sharedSpace = [
                {
                    id: 'foo',
                    title: 'Foo',
                    nodes: [
                        {
                            id: 'foo.bar',
                            title: 'FooBar',
                            nodes: [],
                        },
                    ],
                },
            ];
            await company.save();

            report = await Report.create({
                companyID: 'COMPID',
                reportName: 'Report',
                createdBy: 'administrator',
                owner: user.id,
                isShared: true,
                parentFolder: 'foo',
                selectedLayerID: 'abcdef123456789012345678',
            });
            dashboard = await Dashboard.create({
                companyID: 'COMPID',
                dashboardName: 'Dashboard',
                owner: user.id,
                isShared: true,
                parentFolder: 'foo.bar',
            });
        });

        afterEach(async function () {
            await report.deleteOne();
            await dashboard.deleteOne();
        });

        describe('when authenticated as a normal user', function () {
            it('should returns the shared space with reports and dashboards', async function () {
                const userHeaders = await helpers.login(app, 'user', 'password');

                const res = await request(app).get('/api/user/objects')
                    .set(userHeaders)
                    .expect(200);

                expect(res.body).toHaveProperty('items');
                expect(res.body.items).toEqual([
                    {
                        id: 'foo',
                        grants: {
                            executeDashboards: false,
                            executeReports: false,
                            shareReports: false,
                        },
                        nodes: [
                            {
                                id: 'foo.bar',
                                grants: {
                                    executeDashboards: true,
                                    executeReports: true,
                                    shareReports: true,
                                },
                                nodes: [
                                    {
                                        id: dashboard.id,
                                        nodeType: 'dashboard',
                                        nodes: [],
                                        title: 'Dashboard'
                                    }
                                ],
                                title: 'FooBar'
                            }
                        ],
                        title: 'Foo'
                    }
                ]);
            });
        });

        describe('when authenticated as admin', function () {
            it('should returns the shared space with reports and dashboards', async function () {
                const res = await request(app).get('/api/user/objects')
                    .set(adminHeaders);

                expect(res.status).toBe(200);

                expect(res.body).toHaveProperty('items');
                expect(res.body.items).toEqual([
                    {
                        id: 'foo',
                        grants: {
                            executeDashboards: true,
                            executeReports: true,
                            shareReports: true,
                        },
                        nodes: [
                            {
                                id: 'foo.bar',
                                grants: {
                                    executeDashboards: true,
                                    executeReports: true,
                                    shareReports: true,
                                },
                                nodes: [
                                    {
                                        id: dashboard.id,
                                        nodeType: 'dashboard',
                                        nodes: [],
                                        title: 'Dashboard',
                                    },
                                ],
                                title: 'FooBar',
                            },
                            {
                                id: report.id,
                                nodeType: 'report',
                                nodes: [],
                                title: 'Report',
                            },
                        ],
                        title: 'Foo',
                    },
                ]);
            });
        });
    });

    describe('PUT /api/user/context-help/:name', function () {
        it('should add :name to user.contextHelp', async function () {
            let user = await User.findOne({ userName: 'administrator' });
            expect(user).toHaveProperty('contextHelp');
            expect(user.contextHelp).toHaveLength(0);
            const res = await request(app).put('/api/user/context-help/homeIndex')
                .set(adminHeaders)
                .expect(200);

            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveLength(1);
            expect(res.body.items[0]).toBe('homeIndex');

            user = await User.findOne({ userName: 'administrator' });
            expect(user.contextHelp).toContain('homeIndex');
        });
    });

    describe('PUT /api/user/password', function () {
        let user;
        beforeEach(async () => {
            user = await User.create({
                userName: 'user',
                password: 'password',
                companyID: 'COMPID',
                roles: ['GUEST'],
            });
            userHeaders = await helpers.login(app, 'user', 'password');
        });
        afterEach(async function () {
            await Promise.all([
                user.deleteOne(),
            ]);
        });

        it('should return status 401 if the old password is false', async function () {
            const res = await request(app).put('/api/user/password')
                .set(userHeaders)
                .send({ oldPassword: 'plop', newPassword: 'newAwesomePassword' });

            expect(res).toHaveProperty('status', 401);
            expect(res).toHaveProperty('text', '{"error":"Old password incorrect"}');
        });

        it('should return status 200 if password is updated', async function () {
            const res = await request(app).put('/api/user/password')
                .set(userHeaders)
                .send({ oldPassword: 'password', newPassword: 'newAwesomePassword' });

            expect(res).toHaveProperty('status', 200);

            await new Promise((resolve, reject) => {
                User.isValidUserPassword('user', 'newAwesomePassword', (err, user) => {
                    if (err) return reject(err);
                    resolve(user);
                });
            });
            expect(user).toBeTruthy();
            expect(user).toHaveProperty('userName', 'user');
        });
    });
});
