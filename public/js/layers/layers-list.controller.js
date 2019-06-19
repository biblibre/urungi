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

            return api.getLayers(params).then(result => {
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
                nextLabel: gettextCatalog.getString('Next'),
                prevLabel: gettextCatalog.getString('Back'),
                skipLabel: gettextCatalog.getString('Skip'),
                doneLabel: gettextCatalog.getString('Done'),
                tooltipPosition: 'auto',
                showStepNumbers: false,
                steps: [
                    {
                        intro: '<h4>' +
                            gettextCatalog.getString('Layers') +
                            '</h4><p>' +
                            gettextCatalog.getString('Layers define the interface for your users to access the data.') +
                            '</p><p>' +
                            gettextCatalog.getString('Layers allow your users to create reports dragging and dropping familiar elements that points in the background to the fields contained in tables in your data sources.') +
                            '</p><p>' +
                            gettextCatalog.getString('Here you can create and manage the layers that later will be used by your users to create reports or explore data.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can create several layers depending on your necessities, but you have to define one at least.') +
                            '</p>',
                    },
                    {
                        element: '#newLayerButton',
                        intro: '<h4>' +
                            gettextCatalog.getString('New Layer') +
                            '</h4><p>' +
                            gettextCatalog.getString('Click here to create a new layer.') +
                            '</p>',
                    },
                    {
                        element: '#layerList',
                        intro: '<h4>' +
                            gettextCatalog.getString('Layers list') +
                            '</h4><p>' +
                            gettextCatalog.getString('Here all the layers are listed.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can edit the layer to configure the tables, elements and joins between tables.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can also activate or deactivate layers.') +
                            '</p>',
                    },
                    {
                        element: '#layerList .badge',
                        intro: '<h4>' +
                            gettextCatalog.getString('Layer status') +
                            '</h4><p>' +
                            gettextCatalog.getString('The status of the layer defines if the layer is visible or not for your users when creating or editing a report or exploring data.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can change the status of the layer simply clicking over this label') +
                            '</p>',
                    },
                    {
                        element: '.btn-delete',
                        intro: '<h4>' +
                            gettextCatalog.getString('Layer delete') +
                            '</h4><p>' +
                            gettextCatalog.getString('Click here to delete the layer.') +
                            '</p><p>' +
                            gettextCatalog.getString('Once deleted the layer will not be recoverable again.') +
                            '</p><p>' +
                            gettextCatalog.getString('Requires 2 step confirmation.') +
                            '</p>',
                    },
                    {
                        intro: '<h4>' +
                            gettextCatalog.getString('Next Step') +
                            '</h4><p>' +
                            gettextCatalog.getString('Design your company public space') +
                            '</p><p>' +
                            gettextCatalog.getString('The public space is the place where your users can publish reports to be shared across the company, in this place you will define the folder strucuture for the company&quot;s public space') +
                            '</p><a class="btn btn-info btn-xs" href="/#/shared-space#intro">' +
                            gettextCatalog.getString('Go to the public space definition and continue tour') +
                            '</a>',
                    }
                ]
            };

            return introOptions;
        }
    }
})();
