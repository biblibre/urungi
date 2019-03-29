angular.module('app').controller('rolesCtrl', function ($scope, connection, $routeParams, uuid2, $rootScope) {
    $scope.items = [];
    $scope.roleModal = 'partials/roles/roleModal.html';

    $scope.publicSpace = $rootScope.user.companyData.publicSpace;

    $scope.newRole = function () {
        $scope._Role = {};
        $scope._Role.permissions = [];
        $scope._Role.reportsCreate = false;
        $scope._Role.reportsPublish = false;
        $scope._Role.dashboardsCreate = false;
        $scope._Role.dashboardsPublish = false;
        $scope._Role.viewSQL = false;
        $scope._Role.grants = [];
        $scope.mode = 'add';
        $('#roleModal').modal('show');
    };

    $scope.view = function (roleID) {
        if (roleID) {
            connection.get('/api/roles/find-one', {id: roleID}).then(function (data) {
                $scope._Role = data.item;
                $scope.mode = 'edit';
                $scope.clearNodes($scope.publicSpace);
                $scope.checkForNode($scope.publicSpace);
                $('#roleModal').modal('show');
            });
        };
    };

    $scope.save = function () {
        // $scope._Role.grants = $scope.grants;
        if ($scope.mode === 'add') {
            var data = $scope._Role;

            connection.post('/api/roles/create', data).then(function (data) {
                $scope.items.push(data.item);
                $('#roleModal').modal('hide');
            });
        } else {
            connection.post('/api/roles/update/' + $scope._Role._id, $scope._Role).then(function (result) {
                if (result.result === 1) {
                    $('#roleModal').modal('hide');
                }
            });
        }
    };

    $scope.getRoles = function (page, search, fields) {
        var params = {};

        params.page = (page) || 1;

        if (search) {
            $scope.search = search;
        } else if (page === 1) {
            $scope.search = '';
        }
        if ($scope.search) {
            params.search = $scope.search;
        }

        if (fields) params.fields = fields;

        connection.get('/api/roles/find-all', params).then(function (data) {
            $scope.items = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;
        });
    };

    $scope.goToPage = function (page) {
        $scope.getRoles(page, '', ['name', 'description']);
    };

    $scope.clickedExecutePagesForTheNode = function (node) {
        setGrant(node);
        for (var i in node.nodes) {
            node.nodes[i].executePages = node.executePages;
            setGrant(node.nodes[i]);
            if (node.nodes[i].nodes.length > 0) { $scope.clickedExecutePagesForTheNode(node.nodes[i]); }
        }
    };

    $scope.clickedExecuteReportsForTheNode = function (node) {
        setGrant(node);
        for (var i in node.nodes) {
            node.nodes[i].executeReports = node.executeReports;
            setGrant(node.nodes[i]);
            if (node.nodes[i].nodes.length > 0) { $scope.clickedExecuteReportsForTheNode(node.nodes[i]); }
        }
    };

    $scope.clickedExecuteDashboardsForTheNode = function (node) {
        setGrant(node);
        for (var i in node.nodes) {
            node.nodes[i].executeDashboards = node.executeDashboards;
            setGrant(node.nodes[i]);
            if (node.nodes[i].nodes.length > 0) { $scope.clickedExecuteDashboardsForTheNode(node.nodes[i]); }
        }
    };

    $scope.clickedPublishReportsForTheNode = function (node) {
        setGrant(node);
        for (var i in node.nodes) {
            node.nodes[i].publishReports = node.publishReports;
            setGrant(node.nodes[i]);
            if (node.nodes[i].nodes.length > 0) { $scope.clickedPublishReportsForTheNode(node.nodes[i]); }
        }
    };

    function setGrant (node) {
        if (!$scope._Role.grants) { $scope._Role.grants = []; }

        var grants = $scope._Role.grants;

        var found = false;

        for (var i in grants) {
            if (grants[i].folderID === node.id) {
                found = true;
                grants[i].executePages = node.executePages;
                grants[i].executeReports = node.executeReports;
                grants[i].executeDashboards = node.executeDashboards;
                grants[i].publishReports = node.publishReports;
            }
        }

        if (!found) {
            grants.push({
                folderID: node.id,
                executePages: node.executePages,
                executeReports: node.executeReports,
                executeDashboards: node.executeDashboards,
                publishReports: node.publishReports
            });
        }
    }

    $scope.clearNodes = function (nodes) {
        for (var n in nodes) {
            var node = nodes[n];
            if (node.nodes) {
                if (node.nodes.length > 0) { $scope.clearNodes(node.nodes); }
            }

            node.executePages = undefined;
            node.executeReports = undefined;
            node.executeDashboards = undefined;
            node.publishReports = undefined;
        }
    };

    $scope.checkForNode = function (nodes) {
        var grants = $scope._Role.grants;

        for (var n in nodes) {
            var node = nodes[n];
            if (node.nodes) {
                if (node.nodes.length > 0) { $scope.checkForNode(node.nodes); }
            }

            for (var i in grants) {
                if (node.id === grants[i].folderID) {
                    node.executePages = grants[i].executePages;
                    node.executeReports = grants[i].executeReports;
                    node.executeDashboards = grants[i].executeDashboards;
                    node.publishReports = grants[i].publishReports;
                }
            }
        }
    };
});
