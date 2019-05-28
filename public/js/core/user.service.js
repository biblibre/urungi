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
                getUserDataPromise = api.getUserData().then(data => {
                    const user = data.items.user;
                    user.companyData = data.items.companyData;
                    user.rolesData = data.items.rolesData;
                    user.reportsCreate = data.items.reportsCreate;
                    user.dashboardsCreate = data.items.dashboardsCreate;
                    user.pagesCreate = data.items.pagesCreate;
                    user.exploreData = data.items.exploreData;
                    user.isWSTADMIN = data.items.isWSTADMIN;
                    user.viewSQL = data.items.viewSQL;

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
