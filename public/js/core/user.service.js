(function () {
    'use strict';

    angular.module('app.core').factory('userService', userService);

    userService.$inject = ['api'];

    function userService (api) {
        let getUserDataPromise;
        let getCountsPromise;

        const service = {
            getCurrentUser: getCurrentUser,
            getCounts: getCounts,
        };

        return service;

        function getCurrentUser () {
            if (!getUserDataPromise) {
                getUserDataPromise = api.getUserData().then(user => {
                    user.isAdmin = () => {
                        return user.roles.includes('ADMIN');
                    };

                    return user;
                });
            }

            return getUserDataPromise;
        }

        function getCounts () {
            if (!getCountsPromise) {
                getCountsPromise = api.getCounts();
            }

            return getCountsPromise;
        }
    }
})();
