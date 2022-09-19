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
    await new Promise(resolve => { mongoose.connection.close(resolve); });
    await mongod.stop();
});

describe('Reports API', function () {
    let Report;
    let Layer;
    let User;
    let Datasource;
    let Role;

    let user;
    let report;
    let layer;
    let datasource;
    let headers;

    beforeAll(async function () {
        Report = mongoose.model('Report');
        Layer = mongoose.model('Layer');
        User = mongoose.model('User');
        Datasource = mongoose.model('Datasource');
        Role = mongoose.model('Role');
        headers = await helpers.login(app);
        user = await User.findOne({ userName: 'administrator' });
    });

    beforeEach(async function () {
        datasource = await Datasource.create({
            name: 'MySQL Data Source',
            type: 'MySQL',
            status: 1,
        });

        layer = await Layer.create({
            name: 'Layer',
            status: 'active',
            datasourceID: datasource._id,
            objects: [
                {
                    elementID: 'abcd',
                    elementLabel: 'Foo',
                },
            ],
        });

        report = await Report.create({
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
            properties: {
                columns: [
                    {
                        elementID: 'abcd',
                    },
                ],
            },
        });
    });

    afterEach(async function () {
        await report.remove();
        await layer.remove();
        await datasource.remove();
    });

    describe('GET /api/reports/find-all on user "non-admin" session', function () {
        let report2;
        let user2;
        let user2Headers;
        beforeEach(async function () {
            user2 = await User.create({
                userName: 'johndoe',
                password: 'password',
                companyID: 'COMPID',
                roles: ['GUEST'],
                status: 'active',
                nd_trash_deleted: false,
            });
            user2Headers = await helpers.login(app, 'johndoe', 'password');
            report2 = await Report.create({
                companyID: 'COMPID',
                reportName: 'Report2',
                nd_trash_deleted: false,
                owner: user2._id,
                isPublic: false,
                createdBy: user2._id,
                createdOn: new Date(),
                selectedLayerID: layer._id,
                author: user2._id,
                reportType: 'grid',
            });
        });
        afterEach(async function () {
            await report2.remove();
            await user2.remove();
        });
        it('should find all reports and their data for user connected if not an admin', async function () {
            const res = await request(app).get('/api/reports/find-all?populate=layer')
                .set(user2Headers)
                .query({ owner: `${user2.id}` })
                .expect(200);
            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page', 1);
            expect(res.body).toHaveProperty('pages', 1);
            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveLength(1);
            expect(res.body.items[0]).toHaveProperty('reportName', 'Report2');

            res.body.items.forEach(e => expect(e.owner).toStrictEqual(user2.id));
        });

        it('should send layer name', async function () {
            const res = await request(app).get('/api/reports/find-all?populate=layer')
                .set(headers)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body.items[0]).toHaveProperty('layerName', 'Layer');
        });
    });

    describe('GET /api/reports/find-all on admin session', function () {
        let report2;
        let user2;
        beforeEach(async function () {
            user2 = await User.create({
                userName: 'johndoe',
                password: 'password',
                companyID: 'COMPID',
                roles: ['GUEST'],
                status: 'active',
                nd_trash_deleted: false,
            });
            report2 = await Report.create({
                companyID: 'COMPID',
                reportName: 'Report2',
                nd_trash_deleted: false,
                owner: user2._id,
                isPublic: false,
                createdBy: user2._id,
                createdOn: new Date(),
                selectedLayerID: layer._id,
                author: user2._id,
                reportType: 'grid',
            });
        });
        afterEach(async function () {
            await report2.remove();
            await user2.remove();
        });
        it('should find all reports and their data for all users', async function () {
            const res = await request(app).get('/api/reports/find-all?populate=layer')
                .set(headers)
                .expect(200);
            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('page', 1);
            expect(res.body).toHaveProperty('pages', 1);
            expect(res.body).toHaveProperty('items');
            expect(res.body.items).toHaveLength(2);
            expect(res.body.items[0]).toHaveProperty('reportName', 'Report');
            expect(res.body.items[1]).toHaveProperty('reportName', 'Report2');
            expect(res.body.items[0].owner).toStrictEqual(user.id);
            expect(res.body.items[1].owner).toStrictEqual(user2.id);
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
        let layer3;
        let report3;

        beforeAll(async function () {
            layer3 = await Layer.create({
                name: 'Layer3',
                status: 'active',
                datasourceID: datasource._id,
            });

            report3 = await Report.create({
                companyID: 'COMPID',
                reportName: 'Report3',
                nd_trash_deleted: false,
                owner: user.id,
                isPublic: false,
                createdBy: user.id,
                createdOn: new Date(),
                selectedLayerID: layer3._id,
                author: user.id,
                reportType: 'grid',
            });
        });

        afterAll(async function () {
            await layer3.remove();
            await report3.remove();
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
            expect(res.body.items[1]).toHaveProperty('reportName', 'Report3');
            expect(res.body.items[1]).toHaveProperty('nd_trash_deleted', false);
            expect(res.body.items[1]).toHaveProperty('owner', user.id);
            expect(res.body.items[1]).toHaveProperty('isPublic', false);
            expect(res.body.items[1]).toHaveProperty('createdBy');
            expect(res.body.items[1]).toHaveProperty('createdOn');
            expect(res.body.items[1]).toHaveProperty('author');
            expect(res.body.items[1]).toHaveProperty('owner');
            expect(res.body.items[1]).toHaveProperty('reportType');
            expect(res.body.items[1]).toHaveProperty('_id');
            expect(res.body.items[1]).toHaveProperty('layerName', 'Layer3');
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
                    selectedLayerID: 'abcdef123456789012345678',
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

            await Report.findByIdAndRemove(res.body.item._id);
        });
    });

    describe('POST /api/reports/update/:id', function () {
        let role2;
        let user2;
        let user2Headers;
        beforeAll(async function () {
            role2 = await Role.create({
                companyID: 'COMPID',
                name: 'GUEST',
                description: 'Role to test',
                permissions: [],
                grants: [],
                reportsCreate: false,
                reportsShare: false,
                dashboardsCreate: false,
                exploreData: true,
                viewSQL: true,
                dashboardsShare: false,
                nd_trash_deleted: false,
            });
            user2 = await User.create({
                userName: 'johndoe',
                password: 'password',
                companyID: 'COMPID',
                roles: role2._id,
                status: 'active',
                nd_trash_deleted: false,
            });
            user2Headers = await helpers.login(app, 'johndoe', 'password');
        });
        afterAll(async function () {
            await user2.remove();
        });
        it('should update a report', async function () {
            const res = await request(app).post('/api/reports/update/' + report.id)
                .set(headers)
                .send({ _id: report.id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('msg', '1 record updated.');
        });
        it('should not authorized to update a report without permission even is the report owner', async function () {
            const res = await request(app).post('/api/reports/update/' + report.id)
                .set(user2Headers)
                .send({
                    companyID: 'COMPID',
                    reportName: 'Report 2',
                    nd_trash_deleted: false,
                    owner: user2.id,
                    isPublic: false,
                    selectedLayerID: 'abcdef123456789012345678',
                })
                .expect(403);

            expect(res.body).toHaveProperty('result', 0);
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
        let userAdmin;
        let userGuest;
        let userAdminHeaders;
        let userGuestHeaders;
        let reportAdmin;
        let reportAdminShared;
        let reportAdminPublic;
        let reportGuest;
        let roleGuest;
        beforeEach(async function () {
            roleGuest = await Role.create({
                name: 'GUEST',
                permissions: [],
                grants: [
                    {
                        folderID: 'fooAdminFolder',
                        executeReports: true,
                        executeDashboards: false,
                        shareReports: false
                    },
                ],
                companyID: 'COMPID',
                reportsCreate: true
            });
            userAdmin = await User.create({
                userName: 'superjohn',
                password: 'password',
                companyID: 'COMPID',
                roles: ['ADMIN'],
                status: 'active',
                nd_trash_deleted: false,
            });
            userGuest = await User.create({
                userName: 'johndoe',
                password: 'password',
                companyID: 'COMPID',
                roles: [roleGuest.id],
                status: 'active',
                nd_trash_deleted: false,
            });
            userAdminHeaders = await helpers.login(app, 'superjohn', 'password');
            userGuestHeaders = await helpers.login(app, 'johndoe', 'password');
            reportAdmin = await Report.create({
                companyID: 'COMPID',
                reportName: 'ReportAdmin',
                nd_trash_deleted: false,
                owner: userAdmin._id,
                isPublic: false,
                createdBy: userAdmin._id,
                createdOn: new Date(),
                selectedLayerID: layer._id,
                author: userAdmin._id,
                reportType: 'grid',
                properties: {
                    columns: [
                        {
                            elementID: 'abcd',
                        },
                    ],
                },
            });
            reportAdminShared = await Report.create({
                companyID: 'COMPID',
                reportName: 'ReportAdminShared',
                nd_trash_deleted: false,
                owner: userAdmin._id,
                isPublic: false,
                createdBy: userAdmin._id,
                createdOn: new Date(),
                selectedLayerID: layer._id,
                author: userAdmin._id,
                reportType: 'grid',
                parentFolder: 'fooAdminFolder',
                properties: {
                    columns: [
                        {
                            elementID: 'abcd',
                        },
                    ],
                },
            });
            reportAdminPublic = await Report.create({
                companyID: 'COMPID',
                reportName: 'ReportAdminPublic',
                nd_trash_deleted: false,
                owner: userAdmin._id,
                isPublic: true,
                createdBy: userAdmin._id,
                createdOn: new Date(),
                selectedLayerID: layer._id,
                author: userAdmin._id,
                reportType: 'grid',
                properties: {
                    columns: [
                        {
                            elementID: 'abcd',
                        },
                    ],
                },
            });
            reportGuest = await Report.create({
                companyID: 'COMPID',
                reportName: 'ReportGuest',
                nd_trash_deleted: false,
                owner: userGuest._id,
                isPublic: false,
                createdBy: userGuest._id,
                createdOn: new Date(),
                selectedLayerID: layer._id,
                author: userGuest._id,
                reportType: 'grid',
                properties: {
                    columns: [
                        {
                            elementID: 'abcd',
                        },
                    ],
                },
            });
        });
        afterEach(async function () {
            await userAdmin.remove();
            await userGuest.remove();
            await reportAdmin.remove();
            await reportAdminShared.remove();
            await reportAdminPublic.remove();
            await reportGuest.remove();
        });
        it('should get report with Admin Role on Admin Report', async function () {
            const res = await request(app).get('/api/reports/get-report/' + reportAdmin.id)
                .query({ id: reportAdmin.id })
                .set(userAdminHeaders)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');

            const r = res.body.item;
            expect(r).toHaveProperty('_id');
            expect(r).toHaveProperty('companyID', 'COMPID');
            expect(r).toHaveProperty('reportName', 'ReportAdmin');
            expect(r).toHaveProperty('nd_trash_deleted', false);
            expect(r).toHaveProperty('owner', userAdmin.id);
            expect(r).toHaveProperty('isPublic', false);
            expect(r).toHaveProperty('createdBy', userAdmin.id);
            expect(r).toHaveProperty('createdOn');
            expect(r).toHaveProperty('__v');
            expect(r).toHaveProperty('history');
            expect(r).toHaveProperty('properties');

            expect(r.properties).toHaveProperty('columns');
            expect(r.properties.columns).toHaveLength(1);
            expect(r.properties.columns[0]).toHaveProperty('layerObject');
            expect(r.properties.columns[0].layerObject).toHaveProperty('elementLabel', 'Foo');
        });
        it('should get Guest report with Admin Role', async function () {
            const res = await request(app).get('/api/reports/get-report/' + reportGuest.id)
                .query({ id: reportAdmin.id })
                .set(userAdminHeaders)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');

            const r = res.body.item;
            expect(r).toHaveProperty('_id');
            expect(r).toHaveProperty('companyID', 'COMPID');
            expect(r).toHaveProperty('reportName', 'ReportGuest');
            expect(r).toHaveProperty('owner', userGuest.id);
        });
        it('should get Guest report with Admin Role even is not shared', async function () {
            const res = await request(app).get('/api/reports/get-report/' + reportGuest.id)
                .query({ id: reportAdmin.id })
                .set(userAdminHeaders)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');

            const r = res.body.item;
            expect(r).toHaveProperty('_id');
            expect(r).toHaveProperty('companyID', 'COMPID');
            expect(r).toHaveProperty('reportName', 'ReportGuest');
            expect(r).toHaveProperty('owner', userGuest.id);
        });
        it('should get Guest report with Guest Role', async function () {
            const res = await request(app).get('/api/reports/get-report/' + reportGuest.id)
                .query({ id: reportGuest.id })
                .set(userGuestHeaders)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');

            const r = res.body.item;
            expect(r).toHaveProperty('_id');
            expect(r).toHaveProperty('companyID', 'COMPID');
            expect(r).toHaveProperty('reportName', 'ReportGuest');
            expect(r).toHaveProperty('owner', userGuest.id);
        });
        it('should don\'t get Admin report with Guest Role', async function () {
            const res = await request(app).get('/api/reports/get-report/' + reportAdmin.id)
                .query({ id: reportGuest.id })
                .set(userGuestHeaders)
                .expect(403);

            expect(Object.entries(res.body).length).toBe(0);
        });
        it('should get Admin report with Guest Role only if is shared', async function () {
            const res = await request(app).get('/api/reports/get-report/' + reportAdminShared.id)
                .query({ id: reportAdminShared.id })
                .set(userGuestHeaders)
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');

            const r = res.body.item;
            expect(r).toHaveProperty('_id');
            expect(r).toHaveProperty('companyID', 'COMPID');
            expect(r).toHaveProperty('reportName', 'ReportAdminShared');
            expect(r).toHaveProperty('owner', userAdmin.id);
        });
        it('should get public report if user is not connected', async function () {
            const res = await request(app).get('/api/reports/get-report/' + reportAdminPublic.id)
                .query({ id: reportAdminPublic.id })
                .expect(200);

            expect(res.body).toHaveProperty('result', 1);
            expect(res.body).toHaveProperty('item');

            const r = res.body.item;
            expect(r).toHaveProperty('_id');
            expect(r).toHaveProperty('companyID', 'COMPID');
            expect(r).toHaveProperty('reportName', 'ReportAdminPublic');
            expect(r).toHaveProperty('owner', userAdmin.id);
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

            const r = await Report.findById(report.id);
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

            const r = await Report.findById(report.id);
            expect(r).toHaveProperty('isPublic', false);
            expect(r).toHaveProperty('parentFolder', undefined);
        });
    });

    describe('OPTIONS /api/reports/:id/png', function () {
        it('should return 404 if report does not exist', async function () {
            const res = await request(app).options('/api/reports/foo/png')
                .set(headers);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).options('/api/reports/' + report.id + '/png')
                .set(headers);

            expect(res.status).toBe(501);
        });
    });

    describe('POST /api/reports/:id/png', function () {
        it('should return 404 if report does not exist', async function () {
            const res = await request(app).post('/api/reports/foo/png')
                .set(headers);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).post('/api/reports/' + report.id + '/png')
                .set(headers);

            expect(res.status).toBe(501);
        });
    });

    describe('OPTIONS /api/reports/:id/pdf', function () {
        it('should return 404 if report does not exist', async function () {
            const res = await request(app).options('/api/reports/foo/pdf')
                .set(headers);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).options('/api/reports/' + report.id + '/pdf')
                .set(headers);

            expect(res.status).toBe(501);
        });
    });

    describe('POST /api/reports/:id/pdf', function () {
        it('should return 404 if report does not exist', async function () {
            const res = await request(app).post('/api/reports/foo/pdf')
                .set(headers);

            expect(res.status).toBe(404);
        });

        it('should return 501 if pikitia is not configured', async function () {
            const res = await request(app).post('/api/reports/' + report.id + '/pdf')
                .set(headers);

            expect(res.status).toBe(501);
        });
    });
});
