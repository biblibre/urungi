require('../../../public/js/core/core.module.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/roles/roles.module.js');
require('../../../public/js/roles/roles-list.controller.js');

describe('RolesListController', function () {
    beforeEach(angular.mock.module('app.roles'));

    let $controller, $httpBackend;
    let vm;

    beforeEach(inject(function (_$controller_, _$httpBackend_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('activate', function () {
        it('should call /api/roles/find-all', function () {
            $httpBackend.expect('GET', '/api/roles?fields=name,description&page=1')
                .respond(getRolesFindAllResponse());

            vm = $controller('RolesListController');
            $httpBackend.flush();

            expect(vm.items).toHaveLength(2);
        });
    });

    describe('goToPage', function () {
        it('should call /api/roles/find-all', function () {
            $httpBackend.expect('GET', '/api/roles?fields=name,description&page=1')
                .respond(getRolesFindAllResponse());

            vm = $controller('RolesListController');
            $httpBackend.flush();

            $httpBackend.expect('GET', '/api/roles?fields=name,description&page=2')
                .respond(getRolesFindAllResponse(2));

            vm.goToPage(2);
            $httpBackend.flush();

            expect(vm.page).toBe(2);
            expect(vm.pages).toBe(2);
        });
    });

    function getRolesFindAllResponse (page = 1) {
        return {
            page: page,
            pages: page,
            data: [
                {
                    _id: 'one',
                    name: 'One',
                    description: 'One description',
                    grants: [],
                    dashboardsCreate: true,
                    reportsCreate: true,
                },
                {
                    _id: 'two',
                    name: 'Two',
                    description: 'Two description',
                    grants: [],
                    dashboardsCreate: true,
                    reportsCreate: true,
                },
            ],
        };
    }
});
