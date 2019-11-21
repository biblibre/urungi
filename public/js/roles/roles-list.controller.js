(function () {
    'use strict';

    angular.module('app.roles').controller('RolesListController', RolesListController);

    RolesListController.$inject = ['$scope', 'connection', '$routeParams', 'userService'];

    function RolesListController ($scope, connection, $routeParams, userService) {
        const vm = this;

        vm.checkForNode = checkForNode;
        vm.clearNodes = clearNodes;
        vm.clickedExecuteDashboardsForTheNode = clickedExecuteDashboardsForTheNode;
        vm.clickedExecuteReportsForTheNode = clickedExecuteReportsForTheNode;
        vm.clickedShareReportsForTheNode = clickedShareReportsForTheNode;
        vm.items = [];
        vm.getRoles = getRoles;
        vm.goToPage = goToPage;
        vm.newRole = newRole;
        vm.roleModal = 'partials/roles/roleModal.html';
        vm.save = save;
        vm.view = view;

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.sharedSpace = user.companyData.sharedSpace;
            });
            vm.getRoles(1, '', ['name', 'description']);
        }

        function newRole () {
            vm._Role = {};
            vm._Role.permissions = [];
            vm._Role.reportsCreate = false;
            vm._Role.reportsShare = false;
            vm._Role.dashboardsCreate = false;
            vm._Role.dashboardsShare = false;
            vm._Role.viewSQL = false;
            vm._Role.grants = [];
            vm.mode = 'add';
            $('#roleModal').modal('show');
        };

        function view (roleID) {
            if (roleID) {
                connection.get('/api/roles/find-one', { id: roleID }).then(function (data) {
                    vm._Role = data.item;
                    vm.mode = 'edit';
                    vm.clearNodes(vm.sharedSpace);
                    vm.checkForNode(vm.sharedSpace);
                    $('#roleModal').modal('show');
                });
            };
        };

        function save () {
            if (vm.mode === 'add') {
                var data = vm._Role;

                connection.post('/api/roles/create', data).then(function (data) {
                    vm.items.push(data.item);
                    $('#roleModal').modal('hide');
                });
            } else {
                connection.post('/api/roles/update/' + vm._Role._id, vm._Role).then(function (result) {
                    if (result.result === 1) {
                        $('#roleModal').modal('hide');
                    }
                });
            }
        };

        function getRoles (page, search, fields) {
            var params = {};

            params.page = (page) || 1;

            if (search) {
                vm.search = search;
            } else if (page === 1) {
                vm.search = '';
            }
            if (vm.search) {
                params.search = vm.search;
            }

            if (fields) params.fields = fields;

            connection.get('/api/roles/find-all', params).then(function (data) {
                vm.items = data.items;
                vm.page = data.page;
                vm.pages = data.pages;
            });
        };

        function goToPage (page) {
            vm.getRoles(page, '', ['name', 'description']);
        };

        function clickedExecuteReportsForTheNode (node) {
            setGrant(node);
            for (var i in node.nodes) {
                node.nodes[i].executeReports = node.executeReports;
                setGrant(node.nodes[i]);
                if (node.nodes[i].nodes.length > 0) { vm.clickedExecuteReportsForTheNode(node.nodes[i]); }
            }
        };

        function clickedExecuteDashboardsForTheNode (node) {
            setGrant(node);
            for (var i in node.nodes) {
                node.nodes[i].executeDashboards = node.executeDashboards;
                setGrant(node.nodes[i]);
                if (node.nodes[i].nodes.length > 0) { vm.clickedExecuteDashboardsForTheNode(node.nodes[i]); }
            }
        };

        function clickedShareReportsForTheNode (node) {
            setGrant(node);
            for (var i in node.nodes) {
                node.nodes[i].shareReports = node.shareReports;
                setGrant(node.nodes[i]);
                if (node.nodes[i].nodes.length > 0) { vm.clickedShareReportsForTheNode(node.nodes[i]); }
            }
        };

        function setGrant (node) {
            if (!vm._Role.grants) { vm._Role.grants = []; }

            var grants = vm._Role.grants;

            var found = false;

            for (var i in grants) {
                if (grants[i].folderID === node.id) {
                    found = true;
                    grants[i].executeReports = node.executeReports;
                    grants[i].executeDashboards = node.executeDashboards;
                    grants[i].shareReports = node.shareReports;
                }
            }

            if (!found) {
                grants.push({
                    folderID: node.id,
                    executeReports: node.executeReports,
                    executeDashboards: node.executeDashboards,
                    shareReports: node.shareReports
                });
            }
        }

        function clearNodes (nodes) {
            for (var n in nodes) {
                var node = nodes[n];
                if (node.nodes) {
                    if (node.nodes.length > 0) { vm.clearNodes(node.nodes); }
                }

                node.executeReports = undefined;
                node.executeDashboards = undefined;
                node.shareReports = undefined;
            }
        };

        function checkForNode (nodes) {
            var grants = vm._Role.grants;

            for (var n in nodes) {
                var node = nodes[n];
                if (node.nodes) {
                    if (node.nodes.length > 0) { vm.checkForNode(node.nodes); }
                }

                for (var i in grants) {
                    if (node.id === grants[i].folderID) {
                        node.executeReports = grants[i].executeReports;
                        node.executeDashboards = grants[i].executeDashboards;
                        node.shareReports = grants[i].shareReports;
                    }
                }
            }
        };
    }
})();
