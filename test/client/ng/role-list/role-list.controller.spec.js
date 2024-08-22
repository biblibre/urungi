require('angular-ui-tree');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/table/table.module.js');
require('../../../../public/js/ng/role-list/role-list.module.js');
require('../../../../public/js/ng/role-list/role-list.component.js');

describe('RoleListController', function () {
    beforeEach(angular.mock.module('app.role-list'));

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

            vm = $controller('RoleListController');
            $httpBackend.flush();

            expect(vm.items).toHaveLength(2);
        });
    });

    describe('goToPage', function () {
        it('should call /api/roles/find-all', function () {
            $httpBackend.expect('GET', '/api/roles?fields=name,description&page=1')
                .respond(getRolesFindAllResponse());

            vm = $controller('RoleListController');
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
            page,
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
