(function () {
    'use strict';

    angular.module('app.roles').component('appRoleEditModal', {
        templateUrl: 'partials/roles/role-edit-modal.component.html',
        controller: RoleEditModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    RoleEditModalController.$inject = ['gettextCatalog', 'notify', 'api', 'userService', '$rootScope'];

    function RoleEditModalController (gettextCatalog, notify, api, userService, $rootScope) {
        const vm = this;

        vm.$onInit = $onInit;
        vm.grantsMap = {};
        vm.onNodeChange = onNodeChange;
        vm.role = {};
        vm.save = save;
        vm.sharedSpace = [];

        function $onInit () {
            vm.role = angular.copy(vm.resolve.role);
            if (!vm.role.grants) {
                vm.role.grants = [];
            }

            for (const grant of vm.role.grants) {
                vm.grantsMap[grant.folderID] = grant;
            }

            api.getSharedSpace().then(data => {
                const sharedSpace = data.items;
                addMissingGrants(sharedSpace);
                vm.sharedSpace = sharedSpace;
            });
        }

        function onNodeChange (node, key) {
            const grant = vm.grantsMap[node.id];
            for (const n of node.nodes) {
                vm.grantsMap[n.id][key] = grant[key];
                onNodeChange(n, key);
            }
        }

        function save () {
            let p;
            if (vm.role._id) {
                p = api.updateRole(vm.role);
            } else {
                p = api.createRole(vm.role).then(function () { $rootScope.$broadcast('counts-changes'); }); ;
            }

            return p.then(function (role) {
                vm.close({ $value: role });
            }, function () {
                notify.error(gettextCatalog.getString('Failed to save role'));
            });
        }

        /*
         * Browse shared space and add missing grants to vm.role.grants and
         * vm.grantsMap
         */
        function addMissingGrants (nodes) {
            for (const node of nodes) {
                if (!(node.id in vm.grantsMap)) {
                    const grant = {
                        folderID: node.id,
                        executeReports: false,
                        executeDashboards: false,
                        shareReports: false,
                    };
                    vm.role.grants.push(grant);
                    vm.grantsMap[grant.folderID] = grant;
                }
                addMissingGrants(node.nodes);
            }
        }
    }
})();
