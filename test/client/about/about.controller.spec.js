require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/notification.service');
require('../../../public/js/core/api.js');
require('../../../public/js/about/about.module.js');
require('../../../public/js/about/about.controller.js');

describe('AboutController', function () {
    beforeEach(angular.mock.module('app.about'));

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

    it('should request /api/version', function () {
        $httpBackend.expect('GET', '/api/version')
            .respond({ data: { version: '1.2.3', gitVersion: 'v1.2.3-10-g1234abc' } });

        const $scope = {};
        vm = $controller('AboutController', { $scope: $scope });

        $httpBackend.flush();

        expect(vm.version).toBe('1.2.3');
        expect(vm.gitVersion).toBe('v1.2.3-10-g1234abc');
    });
});
