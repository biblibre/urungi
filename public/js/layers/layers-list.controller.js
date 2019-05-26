(function () {
    'use strict';

    angular.module('app.layers').controller('LayersListController', LayersListController);

    LayersListController.$inject = ['$scope', '$location', '$timeout', '$uibModal', 'connection', 'api', 'gettext', 'gettextCatalog'];

    function LayersListController ($scope, $location, $timeout, $uibModal, connection, api, gettext, gettextCatalog) {
        const vm = this;

        vm.layers = [];
        vm.columns = [];
        vm.lastRefreshParams = {};
        vm.introOptions = {};
        vm.showNewLayerModal = showNewLayerModal;
        vm.refresh = refresh;

        activate();

        function activate () {
            vm.columns = getColumns();
            vm.introOptions = getIntroOptions();

            if ($location.hash() === 'intro') {
                $timeout(function () { vm.showIntro(); }, 1000);
            }
        }

        function showNewLayerModal () {
            const modal = $uibModal.open({
                component: 'appLayersNewModal',
            });
            modal.result.then(function () {
                refresh();
            });
        }

        function refresh (params) {
            params = params || vm.lastRefreshParams;
            vm.lastRefreshParams = params;

            params.fields = ['name', 'status'];

            return api.layersFindAll(params).then(result => {
                vm.layers = result.items;

                return { page: result.page, pages: result.pages };
            });
        }

        function getColumns () {
            return [
                {
                    name: 'name',
                    label: 'Name',
                    width: 6,
                    filter: true,
                },
                {
                    name: 'status',
                    label: 'Status',
                    width: 4,
                    filter: true,
                },
            ];
        }

        function getIntroOptions () {
            const introOptions = {
                steps: [
                    {
                        element: '#parentIntro',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Layers') +
                            '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                            gettextCatalog.getString('Layers define the interface for your users to access the data.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('Layers allow your users to create reports dragging and dropping familiar elements that points in the background to the fields contained in tables in your data sources.') +
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
                            '<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/shared-space#intro">' +
                            gettextCatalog.getString('Go to the public space definition and continue tour') +
                            '</a></span></div>',
                        width: '500px',
                        objectArea: false,
                        verticalAlign: 'top',
                        height: '250px'
                    }
                ]
            };

            return introOptions;
        }
    }
})();
