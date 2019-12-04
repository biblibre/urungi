require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/user.service.js');

describe('userService', function () {
    beforeEach(angular.mock.module('app.core'));

    let $httpBackend;
    let userService;

    beforeEach(inject(function (_$httpBackend_, _userService_) {
        $httpBackend = _$httpBackend_;
        userService = _userService_;
    }));

    it('should be defined', function () {
        expect(userService).toBeDefined();
        expect(userService.getCurrentUser).toBeDefined();
        expect(userService.getCounts).toBeDefined();
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
});
