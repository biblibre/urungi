process.env.NODE_ENV = 'test';
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const expect = chai.expect;
var CryptoJS = require('crypto-js');
chai.use(chaiHttp);
var agent = chai.request.agent(server);
var DataSources = connection.model('DataSources');
var Layers = connection.model('Layers');
var Reports = connection.model('Reports');
var Dashboards = connection.model('Dashboardsv2');
var Users = connection.model('Users');
var statistics = connection.model('statistics');

before(() => {
    return connection.dropDatabase();
});

after(() => {
    agent.close();
    // Close pending connections
    return Promise.all([
        new Promise(resolve => {
            connection.close(() => { resolve(); });
        }),
        new Promise(resolve => {
            server.locals.mongooseConnection.close(() => { resolve(); });
        }),
    ]);
});

describe('get /api/admin/users/find-all', function () {
    it('should find all users and their data', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return agent.get('/api/admin/users/find-all')
                    .then(res => {
                        expect(res).to.have.status(200);
                        var decrypted = decrypt(res.text);
                        expect(decrypted).to.be.a('object');
                        expect(decrypted).to.have.property('result');
                        expect(decrypted).to.have.property('page');
                        expect(decrypted).to.have.property('pages');
                        expect(decrypted.items).to.be.a('array');
                        expect(decrypted.items);
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
    });
});
describe('get /api/admin/users/find-one', function () {
    it('should not find the user because there is a missing parameter', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return agent.get('/api/admin/users/find-one')
                    .then(res => {
                        expect(res).to.have.status(200);
                        var decrypted = decrypt(res.text);
                        expect(decrypted).to.have.property('result', 0);
                        expect(decrypted).to.have.property('msg');
                    });
            });
    });

    it('should find the user and their data', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return Users.findOne({userName: 'administrator'}).then(function (User) {
                    return agent.get('/api/admin/users/find-one').query({id: User.id})
                        .then(res => {
                            expect(res).to.have.status(200);
                            var decrypted = decrypt(res.text);
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
            });
    });
});
describe('post /api/admin/users/create', function () {
    it('should create an user and delete him', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return agent.post('/api/admin/users/create')
                    .send({userName: 'test', pwd1: 'widestage'})
                    .then(res => {
                        expect(res).to.have.status(200);
                        var decrypted = decrypt(res.text);
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
                        return Users.deleteOne({userName: 'test'});
                    });
            });
    });
});

describe('post /api/admin/users/update/:id', function () {
    it('should update administrator data', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                return Users.findOne({userName: 'administrator'}).then(function (User) {
                    expect(res).to.have.status(200);
                    return agent.post('/api/admin/users/update/' + User.id)
                        .send({email: 'admin@example.com', _id: User.id, firstName: 'update'})
                        .then(res => {
                            expect(res).to.have.status(200);
                            var decrypted = decrypt(res.text);
                            expect(decrypted).to.have.property('result', 1);
                            expect(decrypted).to.have.property('msg', '1 record updated.');
                            return Users.findOne({userName: 'administrator'}).then(function (User) {
                                expect(User.firstName).to.equal('update');
                                expect(User.email).to.equal('admin@example.com');
                            });
                        });
                });
            });
    });
});

describe('post /api/admin/users/update/:id with new user', function () {
    it('should create a user and update his data ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return agent.post('/api/admin/users/create')
                    .send({userName: 'new', pwd1: 'widestage'})
                    .then(res => {
                        return Users.findOne({userName: 'new'}).then(function (User) {
                            expect(res).to.have.status(200);
                            return agent.post('/api/admin/users/update/' + User.id)
                                .send({email: 'new@example.com', _id: User.id, firstName: 'update'})
                                .then(res => {
                                    expect(res).to.have.status(200);
                                    var decrypted = decrypt(res.text);
                                    expect(decrypted).to.have.property('result', 1);
                                    expect(decrypted).to.have.property('msg', '1 record updated.');
                                    return Users.findOne({userName: 'new'})
                                        .then(function (User) {
                                            expect(User.firstName).to.equal('update');
                                            expect(User.email).to.equal('new@example.com');
                                            return Users.deleteOne({userName: 'new'});
                                        });
                                });
                        });
                    });
            });
    });
});

describe('post /api/admin/users/delete/:id', function () {
    it('should create an user and delete him ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return agent.post('/api/admin/users/create')
                    .send({userName: 'new', pwd1: 'widestage'})
                    .then(res => {
                        return Users.findOne({userName: 'new'}).then(function (User) {
                            expect(res).to.have.status(200);
                            return agent.post('/api/admin/users/delete/' + User.id)
                                .send({_id: User.id})
                                .then(res => {
                                    expect(res).to.have.status(200);
                                    var decrypted = decrypt(res.text);
                                    expect(decrypted).to.have.property('result', 1);
                                    expect(decrypted).to.have.property('msg', '1 items deleted.');
                                });
                        });
                    });
            });
    });
});

describe('post /api/admin/users/change-user-status', function () {
    it('should return status 200 ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return agent.post('/api/admin/users/create')
                    .send({userName: 'new', pwd1: 'widestage'})
                    .then(res => {
                        return Users.findOne({userName: 'new'}).then(function (User) {
                            return agent.get('/api/get-user-data').then(res => {
                                return agent.post('/api/admin/users/change-user-status')
                                    .send({userID: User.id, status: 'Not active'})
                                    .then(res => {
                                        var decrypted = decrypt(res.text);
                                        expect(decrypted).to.have.property('result', 1);
                                        expect(decrypted).to.have.property('msg', 'Status updated.');
                                        return Users.deleteOne({userName: 'new'});
                                    });
                            });
                        });
                    });
            });
    });
});

describe('post /api/logout', function () {
    it('should return status 200', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                return agent.post('/api/logout')
                    .then(res => {
                        expect(res).to.have.status(200);
                    });
            });
    });
});

describe('post /api/change-my-password', function () {
    it('should update admminstrator password ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return agent.post('/api/change-my-password')
                    .send({pwd1: 'widestage', pwd2: 'widestage'})
                    .then(res => {
                        expect(res).to.have.status(200);
                        var decrypted = decrypt(res.text);
                        expect(decrypted).to.have.property('result', 1);
                        expect(decrypted).to.have.property('msg', 'Password changed');
                    });
            });
    });
});
describe('post /api/change-my-password  Passwords do not match', function () {
    it('should not update adminstrator password because passwords do not match ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return agent.post('/api/change-my-password')
                    .send({pwd1: 'widestage1', pwd2: 'widestage'})
                    .then(res => {
                        var decrypted = decrypt(res.text);
                        expect(decrypted).to.have.property('result', 0);
                        expect(decrypted).to.have.property('msg', 'Passwords do not match');
                    });
            });
    });
});

describe('get /api/get-counts', function () {
    let datasource, layer, report, dashboard;
    beforeEach(function () {
        return DataSources.create({companyID: 'COMPID', name: 'DataSource', type: 'DataSource', status: 1, nd_trash_deleted: false})
            .then(d => {
                datasource = d;
                return Layers.create({companyID: 'COMPID', name: 'Layer', type: 'Layer', status: '1', nd_trash_deleted: false, createdBy: 'administrator'})
                    .then(function (Layer) {
                        layer = Layer;
                        return Users.findOne({userName: 'administrator'}).then(function (User) {
                            return Reports.create({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, createdBy: 'administrator', owner: User.id, selectedLayerID: Layer.id, isPublic: true})
                                .then(Report => {
                                    report = Report;
                                    return Dashboards.create({companyID: 'COMPID', dashboardName: 'Dashboard1', owner: User.id, nd_trash_deleted: false})
                                        .then(Dashboard => {
                                            dashboard = Dashboard;
                                        });
                                });
                        });
                    });
            });
    });

    afterEach(function () {
        return Promise.all([
            dashboard.remove(),
            report.remove(),
            layer.remove(),
            datasource.remove(),
        ]);
    });

    it('should count report, dashboards, layers and users ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return agent.get('/api/get-counts')
                    .then(count => {
                        expect(count).to.have.status(200);
                        var decrypted = decrypt(count.text);
                        expect(decrypted).to.have.property('reports', 1);
                        expect(decrypted).to.have.property('dashBoards', 1);
                        expect(decrypted).to.have.property('pages');
                        expect(decrypted).to.have.property('dataSources', 1);
                        expect(decrypted).to.have.property('layers', 1);
                        expect(decrypted).to.have.property('users', 1);
                        expect(decrypted).to.have.property('roles');
                    });
            });
    });
});

describe('get /api/get-user-counts/:id', function () {
    it('should count public and private reports and dashboard created by administrator ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return Users.findOne({userName: 'administrator'}).then(function (User) {
                    return Reports.create({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, createdBy: 'administrator', owner: User.id, isPublic: true})
                        .then(report => {
                            return Dashboards.create({companyID: 'COMPID', dashboardName: 'Dashboardcount', owner: User.id, nd_trash_deleted: false, isPublic: true})
                                .then(dashboard => {
                                    return agent.get('/api/get-user-counts/' + User.id)
                                        .query({userID: User.id})
                                        .then(count => {
                                            expect(count).to.have.status(200);
                                            var decrypted = decrypt(count.text);
                                            expect(decrypted).to.have.property('publishedReports', 1);
                                            expect(decrypted).to.have.property('publishedDashBoards', 1);
                                            expect(decrypted).to.have.property('privateReports');
                                            expect(decrypted).to.have.property('privateDashBoards');
                                            return report.remove()
                                                .then(res => {
                                                    return dashboard.remove();
                                                });
                                        });
                                });
                        });
                });
            });
    });
});

describe('get(/api/get-user-reports/:id', function () {
    it('should get a report with its data which was created by administrator ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return Users.findOne({userName: 'administrator'}).then(function (User) {
                    return Reports.create({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, createdBy: 'administrator', owner: User.id, isPublic: true, parentFolder: 'parent', reportDescription: 'report Description', reportType: 'report'})
                        .then(report => {
                            return agent.get('/api/get-user-reports/' + User.id)
                                .query({userID: User.id})
                                .then(res => {
                                    expect(res).to.have.status(200);
                                    var decrypted = decrypt(res.text);
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
                                    return report.remove();
                                });
                        });
                });
            });
    });
});

describe('get(/api/get-user-dashboards/:id', function () {
    it('should get a dashboard with its data which was created by administrator ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                expect(res).to.have.status(200);
                return Users.findOne({userName: 'administrator'}).then(function (User) {
                    return Dashboards.create({companyID: 'COMPID', dashboardName: 'Dashboardget', owner: User.id, nd_trash_deleted: false, isPublic: true, dashboardDescription: 'dashboard Description', dashboardType: 'dashboard'})
                        .then(dashboard => {
                            return agent.get('/api/get-user-dashboards/' + User.id)
                                .query({userID: User.id})
                                .then(res => {
                                    var decrypted = decrypt(res.text);
                                    expect(decrypted).to.have.property('result', 1);
                                    expect(decrypted).to.have.property('page');
                                    expect(decrypted).to.have.property('pages');
                                    expect(decrypted).to.have.property('items');
                                    expect(decrypted.items).to.be.a('array');
                                    expect(decrypted.items[0]).to.have.property('dashboardName', 'Dashboardget');
                                    expect(decrypted.items[0]).to.have.property('isPublic', true);
                                    expect(decrypted.items[0]).to.have.property('dashboardDescription', 'dashboard Description');
                                    expect(res).to.have.status(200);
                                    return dashboard.remove();
                                });
                        });
                });
            });
    });
});
describe('get(/api/get-user-data with new user', function () {
    it('should return status 200 ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                return Users.findOne({userName: 'administrator'}).then(function (administrator) {
                    expect(res).to.have.status(200);
                    return agent.post('/api/admin/users/create')
                        .send({userName: 'new', pwd1: 'widestage'})
                        .then(res => {
                            return Users.findOne({userName: 'new'}).then(newUser => {
                                expect(res).to.have.status(200);
                                return agent.get('/api/get-user-data').then(res => {
                                    return agent.post('/api/logout').then(res => {
                                        expect(res).to.have.status(200);
                                        return agent.post('/api/login')
                                            .send({ userName: 'new', password: 'widestage' })
                                            .then(res => {
                                                return Users.findOne({userName: 'new'}).then(newUser => {
                                                    expect(res).to.have.status(200);
                                                    return agent.get('/api/get-user-data').then(res => {
                                                        expect(res).to.have.status(200);
                                                        var decrypted = decrypt(res.text);
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
                                                        return newUser.remove();
                                                    });
                                                });
                                            });
                                    });
                                });
                            });
                        });
                });
            });
    });
});
describe('get(/api/get-user-data with administrator', function () {
    it('should get administrator data ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(res => {
                return Users.findOne({userName: 'administrator'}).then(function (administrator) {
                    expect(res).to.have.status(200);
                    return agent.get('/api/get-user-data').then(res => {
                        expect(res).to.have.status(200);
                        var decrypted = decrypt(res.text);
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
            });
    });
});
describe('get(/api/get-user-last-executions', function () {
    let statistics1, statistics2, statistics3;
    beforeEach(function () {
        return Users.findOne({userName: 'administrator'}).then(function (User) {
            return statistics.create({type: 'report', relationedName: 'report1', action: 'execute', companyID: 'COMPID', userID: User.id, userName: 'administrator', createdBy: User.id})
                .then(s1 => {
                    statistics1 = s1;
                    return statistics.create({type: 'report', relationedName: 'report1', action: 'execute', companyID: 'COMPID', userID: User.id, userName: 'administrator', createdBy: User.id})
                        .then(s2 => {
                            statistics2 = s2;
                            return statistics.create({type: 'report', relationedName: 'report2', action: 'execute', companyID: 'COMPID', userID: User.id, userName: 'administrator', createdBy: User.id})
                                .then(s3 => {
                                    statistics3 = s3;
                                });
                        });
                });
        });
    });
    afterEach(function () {
        return Promise.all([
            statistics1.remove(),
            statistics2.remove(),
            statistics3.remove(),
        ]);
    });
    it('should return the last executions and the most executed reports ', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(User => {
                return agent.get('/api/get-user-last-executions')
                    .then(res => {
                        var decrypted = decrypt(res.text);
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
    });
});

describe('get(/api/set-viewed-context-help', function () {
    it('should return status 200', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(User => {
                return Users.findOne({userName: 'administrator'}).then(function (User) {
                    expect(User).to.have.property('contextHelp').to.be.an('array').that.is.empty;// eslint-disable-line no-unused-expressions
                    return agent.get('/api/set-viewed-context-help').query({contextHelpName: 'homeIndex'})
                        .then(User => {
                            return Users.findOne({userName: 'administrator'}).then(function (User) {
                                expect(User).to.have.deep.property('contextHelp', ['homeIndex']);
                            });
                        });
                });
            });
    });
});
describe('get (/api/get-user-objects', function () {
    it('should get report and dashboard id and title which was created by administrator', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(User => {
                return Users.findOne({userName: 'administrator'}).then(function (User) {
                    return Reports.create({companyID: 'COMPID', reportName: 'Report', nd_trash_deleted: false, createdBy: 'administrator', owner: User.id, isPublic: true, parentFolder: 'root'})
                        .then(report => {
                            return Dashboards.create({companyID: 'COMPID', dashboardName: 'Dashboard', owner: User.id, nd_trash_deleted: false, isPublic: true, parentFolder: 'root'})
                                .then(dashboard => {
                                    return agent.get('/api/get-user-objects')
                                        .then(userObject => {
                                            var decrypted = decrypt(userObject.text);
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
                                            return report.remove()
                                                .then(res => {
                                                    return dashboard.remove();
                                                });
                                        });
                                });
                        });
                });
            });
    });
});
describe('get (/api/get-user-other-data', function () {
    it('should get administrator other data which is not get by get user data function', function () {
        return agent.post('/api/login')
            .send({ userName: 'administrator', password: 'widestage' })
            .then(User => {
                return Users.findOne({userName: 'administrator'})
                    .then(function (User) {
                        return agent.get('/api/get-user-other-data')
                            .then(otherData => {
                                var decrypted = decrypt(otherData.text);
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
    });
});
function decrypt (data) {
    var object = JSON.parse(data.substr(6));
    var decrypted = CryptoJS.AES.decrypt(object.data, 'SecretPassphrase');
    return JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
}
