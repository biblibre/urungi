require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/table/table.module.js');
require('../../../../public/js/ng/datasource-list/datasource-list.module.js');
require('../../../../public/js/ng/datasource-list/datasource-list.component.js');

describe('DatasourceListController', function () {
    beforeEach(angular.mock.module('app.datasource-list'));

    let $controller, $httpBackend;
    let vm;

    beforeEach(inject(function (_$controller_, _$httpBackend_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;

        $httpBackend.expect('GET', '/api/datasources?fields=name,type,connection.host,connection.port,connection.database&page=1')
            .respond(getDataSourcesFindAllResponse());

        const $scope = {};
        vm = $controller('DatasourceListController', { $scope: $scope });
        $httpBackend.flush();
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('intro options', function () {
        it('should have a length of 7', function () {
            expect(vm.IntroOptions).toBeDefined();
            expect(vm.IntroOptions.steps).toBeDefined();
            expect(vm.IntroOptions.steps.length).toBe(7);
        });
    });

    describe('getDatasources', function () {
        it('should populate items', function () {
            $httpBackend.expect('GET', '/api/datasources?fields=name,type,connection.host,connection.port,connection.database&page=1')
                .respond(getDataSourcesFindAllResponse());
            vm.getDatasources();
            $httpBackend.flush();

            expect(vm.items).toBeDefined();
            expect(vm.items.length).toBe(1);
            expect(vm.items[0]._id).toBe('fakeid');
        });
    });

    function getDataSourcesFindAllResponse () {
        return {
            page: 1,
            pages: 1,
            data: [
                {
                    _id: 'fakeid',
                    connection: {
                        host: 'localhost',
                        port: 3306,
                        database: 'database',
                    },
                    type: 'MySQL',
                    name: 'Database',
                }
            ],
        };
    }
});
