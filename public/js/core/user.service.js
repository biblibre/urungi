(function () {
    'use strict';

    angular.module('app.core').factory('userService', userService);

    userService.$inject = ['connection'];

    function userService (connection) {
        let getUserDataPromise;
        const service = {
            getCurrentUser: getCurrentUser,
        };

        return service;

        function getCurrentUser () {
            if (!getUserDataPromise) {
                getUserDataPromise = connection.get('/api/get-user-data').then(data => {
                    const user = data.items.user;
                    user.companyData = data.items.companyData;
                    user.rolesData = data.items.rolesData;
                    user.reportsCreate = data.items.reportsCreate;
                    user.dashboardsCreate = data.items.dashboardsCreate;
                    user.pagesCreate = data.items.pagesCreate;
                    user.exploreData = data.items.exploreData;
                    user.isWSTADMIN = data.items.isWSTADMIN;
                    user.contextHelp = data.items.contextHelp;
                    user.dialogs = data.items.dialogs;
                    user.viewSQL = data.items.viewSQL;

                    return user;
                });
            }

            return getUserDataPromise;
        }
    }
})();
