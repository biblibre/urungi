describe('DataSourcesListController', function () {
    beforeEach(module('app.data-sources'));

    let $controller, $httpBackend;
    let vm;

    beforeEach(inject(function (_$controller_, _$httpBackend_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;

        const $scope = {};
        vm = $controller('DataSourcesListController', { $scope: $scope });
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

    describe('getDataSources', function () {
        it('should populate items', function () {
            $httpBackend.expect('GET', '/api/data-sources/find-all?page=1')
                .respond(getDataSourcesFindAllResponse());
            vm.getDataSources();
            $httpBackend.flush();

            expect(vm.items).toBeDefined();
            expect(vm.items.length).toBe(1);
            expect(vm.items[0]._id).toBe('fakeid');
        });

        function getDataSourcesFindAllResponse () {
            return {
                result: 1,
                page: 1,
                pages: 1,
                items: [
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
});
