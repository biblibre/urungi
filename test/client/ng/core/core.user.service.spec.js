require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.user.service.js');

describe('userService', function () {
    beforeEach(angular.mock.module('app.core'));

    let $httpBackend;
    let userService;

    beforeEach(inject(function (_$httpBackend_, _userService_) {
        $httpBackend = _$httpBackend_;
        userService = _userService_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be defined', function () {
        expect(userService).toBeDefined();
        expect(userService.getCurrentUser).toBeDefined();
        expect(userService.getCounts).toBeDefined();
        expect(userService.clearCountsCache).toBeDefined();
    });

    describe('getCurrentUser', function () {
        it('should return a valid user', async function () {
            $httpBackend.expect('GET', '/api/user')
                .respond(apiGetUserDataResponse());

            setTimeout($httpBackend.flush);
            const user = await userService.getCurrentUser();

            expect(user.userName).toBe('foo');
            expect(user.status).toBe('active');
            expect(user.isAdmin()).toBe(true);
        });

        function apiGetUserDataResponse () {
            return {
                userName: 'foo',
                status: 'active',
                roles: ['ADMIN'],
            };
        }
    });

    describe('getCounts', function () {
        it('should return valid counts', async function () {
            $httpBackend.expect('GET', '/api/user/counts')
                .respond(apiGetCountsResponse());

            setTimeout($httpBackend.flush);
            const counts = await userService.getCounts();

            expect(counts.reports).toBe(7);
            expect(counts.dashboards).toBe(4);
            expect(counts.datasources).toBe(12);
            expect(counts.layers).toBe(3);
            expect(counts.users).toBe(10);
            expect(counts.roles).toBe(11);
        });

        function apiGetCountsResponse () {
            return {
                reports: 7,
                dashboards: 4,
                datasources: 12,
                layers: 3,
                users: 10,
                roles: 11,
            };
        }
    });
});
