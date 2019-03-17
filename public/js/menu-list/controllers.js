angular.module('app').controller('listCtrl', function ($scope, $rootScope, connection, pager, $routeParams, $timeout) {
    $scope.init = function () {
        $scope.nav.page = 1;

        console.log('initiating');

        $scope.nav.sort = $scope.nav.infoFields[0].name;
        $scope.nav.sortTypes = {};
        for (const field of $scope.nav.infoFields) {
            $scope.nav.sortTypes[field.name] = 1;
        }

        $scope.nav.filters = {};

        $scope.nav.refreshItems();

        if ($routeParams.extra === 'intro') {
            $timeout(function () { $scope.$broadcast('showIntro'); }, 1000);
        }
    };

    $scope.viewDuplicateModal = function (item) {
        $scope.duplicateOptions.item = item;
        $scope.duplicateOptions.newName = item[$scope.nav.nameField] + ' copy';
        $('#duplicateModal').modal('show');
    };

    $scope.viewDeleteModal = function (item) {
        $scope.deleteOptions.itemName = item[$scope.nav.nameField];
        $scope.deleteOptions.id = item._id;
        $('#deleteModal').modal('show');
    };

    $scope.clickOnSort = function (field) {
        $scope.nav.sort = field.name;
        $scope.nav.sortTypes[field.name] *= -1;
        $scope.nav.refreshItems();
    };

    $scope.filterKeydown = function (event) {
        if (event.key === 'Enter') {
            event.target.blur();
        } else {
            $scope.lastFilterChange = event;
            setTimeout(function () {
                if ($scope.lastFilterChange === event) {
                    $scope.nav.refreshItems();
                }
            }, 250);
        }
    };

    $scope.filterBlur = function (event) {
        $scope.nav.refreshItems();
    };

    $scope.goToPage = function (page) {
        $scope.nav.page = page;
        $scope.nav.refreshItems();
    };

    $scope.nav.refreshItems = function () {
        var params = {
            fields: $scope.nav.fetchFields,
            page: $scope.nav.page,
            sort: $scope.nav.sort,
            sortType: $scope.nav.sortTypes[$scope.nav.sort],
            filters: $scope.nav.filters
        };

        for (const field of $scope.nav.infoFields) {
            if (!params.filters[field.name]) {
                delete params.filters[field.name];
            }
        }

        return connection.get($scope.nav.apiFetchUrl, params).then(function (result) {
            if (result.result === 0) {
                return;
            }

            $scope.nav.items = result.items;
            $scope.nav.page = result.page;
            $scope.nav.pager = pager.getPager(result.page, result.pages);
        });
    };
})
    .controller('reportListCtrl', function ($scope, $location, connection, reportModel, gettextCatalog) {
        $scope.listView = '/partials/menu-list/list.html';

        $scope.duplicateOptions = {};
        $scope.deleteOptions = {};

        $scope.nav = {};

        $scope.nav.apiFetchUrl = '/api/reports/find-all';
        $scope.creationAuthorised = $scope.user.reportsCreate;
        $scope.nav.editButtons = true;
        $scope.nav.deleteButtons = true;
        $scope.nav.layerButtons = false;
        $scope.nav.itemsPerPage = 10;

        $scope.nav.fetchFields = ['reportName', 'reportType', 'isPublic', 'owner', 'reportDescription', 'author', 'createdOn'];
        $scope.nav.nameField = 'reportName';

        $scope.nav.infoFields = [
            {
                name: 'reportName',
                label: 'Name',
                widthClass: 'col-md-6'
            },
            {
                name: 'author',
                label: 'Author',
                widthClass: 'col-md-3'
            },
            {
                name: 'createdOn',
                label: 'Date of creation',
                widthClass: 'col-md-3',
                date: true
            }
        ];

        $scope.nav.tooltips = {
            itemClick: 'View this report',
            delete: 'Delete this report',
            duplicate: 'Duplicate this report',
            edit: 'Edit this report'
        };

        $scope.nav.text = {
            duplicateHeader: 'Duplicate this report',
            deleteHeader: 'Confirm delete report',
            deleteBody: 'Are you sure you want to delete the report: '
        };

        $scope.nav.clickItem = function (item) {
            $location.path('/reports/view/' + item._id);
        };

        $scope.getEditLink = function (item) {
            return '/#/reports/edit/' + item._id;
        };

        $scope.duplicate = function () {
            $scope.duplicateOptions.freeze = true;
            return reportModel.duplicateReport({report: $scope.duplicateOptions.item, newName: $scope.duplicateOptions.newName}).then(function () {
                $scope.nav.refreshItems();
                $scope.duplicateOptions.freeze = false;
                $('#duplicateModal').modal('hide');
            });
        };

        $scope.delete = function () {
            return connection.post('/api/reports/delete/' + $scope.deleteOptions.id, {id: $scope.deleteOptions.id}).then(function () {
                $scope.nav.refreshItems();
                $('#deleteModal').modal('hide');
            });
        };

        $scope.introOptions = {
            steps: [
                {
                    element: '#parentIntro',
                    html: '<div><h3>' +
                gettextCatalog.getString('Reports') +
                '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                gettextCatalog.getString('Here you can create and execute reports.') +
                '</span><br/><br/><iframe width="350" height="225" src="https://www.youtube.com/embed/_g1NcBIgGQU" frameborder="0" allowfullscreen></iframe><br/><br/><span>' +
                gettextCatalog.getString('Watch this short tutorial to see how to create a report.') +
                '</span></div>',
                    width: '500px',
                    objectArea: false,
                    verticalAlign: 'top',
                    height: '400px'
                },
                {
                    element: '#parentIntro',
                    html: '<div><h3>' +
                gettextCatalog.getString('Reports') +
                '</h3><span style="font-weight:bold;color:#8DC63F"></span><br/><span>' +
                gettextCatalog.getString('Choose a report type and drag and drop elements from the selected layer to compose your report.') +
                '</span><br/><br/><span>' +
                gettextCatalog.getString('You can also add runtime filters to split your data in real time.') +
                '</span><br/><br/><span></span></div>',
                    width: '350px',
                    objectArea: false,
                    verticalAlign: 'top',
                    height: '200px'
                },
                {
                    element: '#newReportButton',
                    html: '<div><h3>' +
                gettextCatalog.getString('New Report') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('Click here to create a new report.') +
                '</span><br/><span></span></div>',
                    width: '300px',
                    height: '150px',
                    areaColor: 'transparent',
                    horizontalAlign: 'right',
                    areaLineColor: '#fff'
                },
                {
                    element: '#reportList',
                    html: '<div><h3>' +
                gettextCatalog.getString('Reports list') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('Here all your reports are listed.') +
                '</span><br/><span>' +
                gettextCatalog.getString('Click over a report\'s name to execute it.') +
                '<br/><br/>' +
                gettextCatalog.getString('You can also modify or drop the report, clicking into the modify or delete buttons.') +
                '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    verticalAlign: 'top',
                    height: '180px'

                },
                {
                    element: '.btn-edit',
                    html: '<div><h3>' +
                gettextCatalog.getString('Edit report') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('Click here to modify the report.') +
                '</span><br/><br/><span></span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    horizontalAlign: 'right',
                    height: '200px'

                },
                {
                    element: '.btn-delete',
                    html: '<div><h3>' +
                gettextCatalog.getString('Delete report') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('Click here to delete the report.') +
                '</span><br/><br/><span>' +
                gettextCatalog.getString('Once deleted the report will not be recoverable again.') +
                '</span><br/><br/><span>' +
                gettextCatalog.getString('Requires 2 step confirmation.') +
                '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    horizontalAlign: 'right',
                    height: '200px'

                },
                {
                    element: '.btn-duplicate',
                    html: '<div><h3>' +
                gettextCatalog.getString('Duplicate report') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('Click here to duplicate the report.') +
                '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    horizontalAlign: 'right',
                    height: '200px'

                },
                {
                    element: '.published-tag',
                    html: '<div><h3>' +
                gettextCatalog.getString('Report published') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('This label indicates that this report is public.') +
                '</span><br/><br/><span>' +
                gettextCatalog.getString('If you drop or modify a published report, it will have and impact on other users, think about it before making any updates on the report.') +
                '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    horizontalAlign: 'right',
                    height: '200px'

                }
            ]
        };
    })
    .controller('dashboardListCtrl', function ($scope, $location, connection, dashboardv2Model, gettextCatalog) {
        $scope.listView = '/partials/menu-list/list.html';

        $scope.duplicateOptions = {};
        $scope.deleteOptions = {};

        $scope.nav = {};

        $scope.nav.apiFetchUrl = '/api/dashboardsv2/find-all';
        $scope.creationAuthorised = $scope.user.dashboardsCreate;
        $scope.nav.editButtons = true;
        $scope.nav.deleteButtons = true;
        $scope.nav.layerButtons = false;
        $scope.nav.itemsPerPage = 10;

        $scope.nav.fetchFields = ['dashboardName', 'isPublic', 'owner', 'dashboardDescription', 'author', 'createdOn'];
        $scope.nav.nameField = 'dashboardName';

        $scope.nav.infoFields = [
            {
                name: 'dashboardName',
                label: 'Name',
                widthClass: 'col-md-6'
            },
            {
                name: 'author',
                label: 'Author',
                widthClass: 'col-md-3'
            },
            {
                name: 'createdOn',
                label: 'Date of creation',
                widthClass: 'col-md-3',
                date: true
            }
        ];

        $scope.tooltips = {
            itemClick: 'View this dashboard',
            delete: 'Delete this dashboard',
            duplicate: 'Duplicate this dashboard',
            edit: 'Edit this dashboard'
        };

        $scope.text = {
            duplicateHeader: 'Duplicate this dashboard',
            deleteHeader: 'Confirm delete dashboard',
            deleteBody: 'Are you sure you want to delete the dashboard: '
        };

        $scope.duplicate = function () {
            $scope.duplicateOptions.freeze = true;
            return dashboardv2Model.duplicateDashboard({ dashboard: $scope.duplicateOptions.item, newName: $scope.duplicateOptions.newName }).then(function () {
                $scope.nav.refreshItems();
                $scope.duplicateOptions.freeze = false;
                $('#duplicateModal').modal('hide');
            });
        };

        $scope.delete = function () {
            return connection.post('/api/dashboardsv2/delete/' + $scope.deleteOptions.id, {id: $scope.deleteOptions.id}).then(function () {
                $scope.nav.refreshItems();
                $('#deleteModal').modal('hide');
            });
        };

        $scope.nav.clickItem = function (item) {
            $location.path('/dashboards/view/' + item._id);
        };

        $scope.getEditLink = function (item) {
            return '/#/dashboards/edit/' + item._id;
        };

        $scope.introOptions = {
            steps: [
                {
                    element: '#parentIntro',
                    html: '<div><h3>' +
            gettextCatalog.getString('Dashboards') +
            '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
            gettextCatalog.getString('In here you can create and execute dashboards like web pages.') +
            '</span><br/><br/><span>' +
            gettextCatalog.getString('Define several reports using filters and dragging and dropping from different layers.') +
            '</span><br/><br/><span>' +
            gettextCatalog.getString('After you define the report/s to get and visualize your data, you can drag and drop different html layout elements, and put your report in, using different formats to show it.') +
            '</span><br/><br/><span></span></div>',
                    width: '500px',
                    objectArea: false,
                    verticalAlign: 'top',
                    height: '300px'
                },
                {
                    element: '#newDashboardButton',
                    html: '<div><h3>' +
            gettextCatalog.getString('New Dashboard') +
            '</h3><span style="font-weight:bold;">' +
            gettextCatalog.getString('Click here to create a new dashboard.') +
            '</span><br/><span></span></div>',
                    width: '300px',
                    height: '150px',
                    areaColor: 'transparent',
                    horizontalAlign: 'right',
                    areaLineColor: '#fff'
                },
                {
                    element: '#dashboardList',
                    html: '<div><h3>' +
            gettextCatalog.getString('Dashboards list') +
            '</h3><span style="font-weight:bold;">' +
            gettextCatalog.getString('Here all your dashboards are listed.') +
            '</span><br/><span>' +
            gettextCatalog.getString('Click over a dashboard\'s name to execute it.') +
            '<br/><br/>' +
            gettextCatalog.getString('You can also modify or drop the dashboard, clicking into the modify or delete buttons.') +
            '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    verticalAlign: 'top',
                    height: '180px'

                },
                {
                    element: '.btn-edit',
                    html: '<div><h3>' +
            gettextCatalog.getString('Dashboard edit') +
            '</h3><span style="font-weight:bold;">' +
            gettextCatalog.getString('Click here to modify the dashboard.') +
            '</span><br/><br/><span></span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    horizontalAlign: 'right',
                    height: '200px'

                },
                {
                    element: '.btn-delete',
                    html: '<div><h3>' +
            gettextCatalog.getString('Dashboard delete') +
            '</h3><span style="font-weight:bold;">' +
            gettextCatalog.getString('Click here to delete the dashboard.') +
            '</span><br/><br/><span>' +
            gettextCatalog.getString('Once deleted the dashboard will not be recoverable again.') +
            '</span><br/><br/><span>' +
            gettextCatalog.getString('Requires 2 step confirmation.') +
            '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    horizontalAlign: 'right',
                    height: '200px'

                },
                {
                    element: '.published-tag',
                    html: '<div><h3>' +
            gettextCatalog.getString('Dashboard published') +
            '</h3><span style="font-weight:bold;">' +
            gettextCatalog.getString('This label indicates that this dashboard is public.') +
            '</span><br/><br/><span>' +
            gettextCatalog.getString('If you drop or modify a published dashboard, it will have and impact on other users, think about it before making any updates on the dashboard.') +
            '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    horizontalAlign: 'right',
                    height: '200px'

                }
            ]
        };
    })
    .controller('layerListCtrl', function ($scope, $rootScope, $location, connection, gettextCatalog) {
        $scope.layerOptions = {};
        $scope.deleteOptions = {};

        $scope.listView = '/partials/menu-list/list.html';

        $scope.nav = {};

        $scope.nav.apiFetchUrl = '/api/layers/find-all';
        $scope.creationAuthorised = true;
        $scope.nav.deleteButtons = true;
        $scope.nav.editButtons = false;
        $scope.layerButtons = true;
        $scope.nav.itemsPerPage = 10;

        $scope.nav.fetchFields = ['name', 'status', 'description', 'createdOn'];

        $scope.nav.infoFields = [
            {
                name: 'name',
                label: 'Name',
                widthClass: 'col-md-8'
            },
            {
                name: 'createdOn',
                label: 'Date of creation',
                widthClass: 'col-md-4',
                date: true
            }
        ];

        $scope.tooltips = {
            itemClick: 'View this layer',
            delete: 'Delete this layer',
            duplicate: 'Duplicate this layer',
        };

        $scope.text = {
            duplicateHeader: 'Duplicate this layer',
            deleteHeader: 'Confirm delete layer',
            deleteBody: 'Are you sure you want to delete the layer : '
        };

        $scope.newLayer = function () {
            $scope.layerOptions.params = {};
            $scope.layerOptions.status = 'Not active';
            $('#layerModal').modal('show');
        };

        $scope.delete = function () {
            return connection.post('/api/layers/delete/' + $scope.deleteOptions.id, {id: $scope.deleteOptions.id}).then(function () {
                $scope.nav.refreshItems();
                $('#deleteModal').modal('hide');
            });
        };

        $scope.saveLayer = function () {
            var data = $scope.layerOptions;
            return connection.post('/api/layers/create', data).then(function () {
                $scope.nav.refreshItems();
                $('#layerModal').modal('hide');
            });
        };

        $scope.nav.clickItem = function (item) {
            $location.path('/layers/' + item._id);
        };

        $scope.toggleActive = function (layer) {
            if ($rootScope.isWSTADMIN) {
                let newStatus;
                if (layer.status === 'active') { newStatus = 'Not active'; }
                if (layer.status === 'Not active') { newStatus = 'active'; }

                var data = {layerID: layer._id, status: newStatus};

                connection.post('/api/layers/change-layer-status', data).then(function (result) {
                    layer.status = newStatus;
                });
            }
        };

        $scope.introOptions = {
            steps: [
                {
                    element: '#parentIntro',
                    html: '<div><h3>' +
                        gettextCatalog.getString('Layers') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                        gettextCatalog.getString('Layers define the interface for your users to access the data.') +
                        '</span><br/><br/><span>' +
                        gettextCatalog.getString('Layers allow your users to create reports dragging and droping familiar elements that points in the background to the fields contained in tables in your data sources.') +
                        '</span><br/><br/><span>' +
                        gettextCatalog.getString('Here you can create and manage the layers that later will be used by your users to create reports or explore data.') +
                        '</span><br/><br/><span>' +
                        gettextCatalog.getString('You can create several layers depending on your necessities, but you have to define one at least.') +
                        '</span></div>',
                    width: '500px',
                    objectArea: false,
                    verticalAlign: 'top',
                    height: '300px'
                },
                {
                    element: '#newLayerButton',
                    html: '<div><h3>' +
                        gettextCatalog.getString('New Layer') +
                        '</h3><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Click here to create a new layer.') +
                        '</span><br/><span></span></div>',
                    width: '300px',
                    height: '150px',
                    areaColor: 'transparent',
                    horizontalAlign: 'right',
                    areaLineColor: '#fff'
                },
                {
                    element: '#layerList',
                    html: '<div><h3>' +
                        gettextCatalog.getString('Layers list') +
                        '</h3><span style="font-weight:bold;">' +
                        gettextCatalog.getString('Here all the layers are listed.') +
                        '</span><br/><span>' +
                        gettextCatalog.getString('You can edit the layer to configure the tables, elements and joins between tables.') +
                        '<br/><br/>' +
                        gettextCatalog.getString('You can also activate or deactivate layers.') +
                        '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    verticalAlign: 'top',
                    height: '180px'

                },
                {
                    element: '#layerListItemStatus',
                    html: '<div><h3>' +
                        gettextCatalog.getString('Layer status') +
                        '</h3><span style="font-weight:bold;">' +
                        gettextCatalog.getString('The status of the layer defines if the layer is visible or not for your users when creating or editing a report or exploring data.') +
                        '</span><br/><br/><span>' +
                        gettextCatalog.getString('You can change the status of the layer simply clicking over this label') +
                        '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    horizontalAlign: 'right',
                    height: '200px'

                },

                {
                    element: '.btn-delete',
                    html: '<div><h3>' +
            gettextCatalog.getString('Layer delete') +
            '</h3><span style="font-weight:bold;">' +
            gettextCatalog.getString('Click here to delete the layer.') +
            '</span><br/><br/><span>' +
            gettextCatalog.getString('Once deleted the layer will not be recoverable again.') +
            '</span><br/><br/><span>' +
            gettextCatalog.getString('Requires 2 step confirmation.') +
            '</span></div>',
                    width: '300px',
                    areaColor: 'transparent',
                    areaLineColor: '#fff',
                    horizontalAlign: 'right',
                    height: '200px'

                },
                {
                    element: '#parentIntro',
                    html: '<div><h3>' +
                        gettextCatalog.getString('Next Step') +
                        '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                        gettextCatalog.getString('Design your company public space') +
                        '</span><br/><br/>' +
                        gettextCatalog.getString('The public space is the place where your users can publish reports to be shared across the company, in this place you will define the folder strucuture for the company&quot;s public space') +
                        '<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/public-space/intro">' +
                        gettextCatalog.getString('Go to the public space definition and continue tour') +
                        '</a></span></div>',
                    width: '500px',
                    objectArea: false,
                    verticalAlign: 'top',
                    height: '250px'
                }
            ]
        };
    });
