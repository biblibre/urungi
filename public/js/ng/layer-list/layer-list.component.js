(function () {
    'use strict';

    angular.module('app.layer-list')
        .component('appLayerList', {
            templateUrl: 'partials/layer-list/layer-list.component.html',
            controller: LayerListController,
            controllerAs: 'vm',
        });

    LayerListController.$inject = ['$window', '$timeout', '$uibModal', 'notify', 'api', 'gettextCatalog', 'userService'];

    function LayerListController ($window, $timeout, $uibModal, notify, api, gettextCatalog, userService) {
        const vm = this;

        vm.currentPage = 1;
        vm.filters = {};
        vm.goToPage = goToPage;
        vm.introOptions = {};
        vm.layers = [];
        vm.lastRefreshParams = {};
        vm.onFilter = onFilter;
        vm.onSort = onSort;
        vm.page = 1;
        vm.pages = 1;
        vm.refresh = refresh;
        vm.showIntro = showIntro;
        vm.showNewLayerModal = showNewLayerModal;
        vm.sortDir = {};
        vm.toggleActive = toggleActive;

        activate();

        function activate () {
            vm.introOptions = getIntroOptions();
            vm.sortDir.name = 1;

            if ($window.location.hash === '#intro') {
                $timeout(function () { vm.showIntro(); }, 1000);
            }

            refresh();
        }

        function goToPage (page) {
            vm.page = page;
            refresh();
        }

        function onFilter (name, value) {
            vm.filters[name] = { contains: value };
            vm.page = 1;
            refresh();
        }

        function onSort (name, dir) {
            for (const key in vm.sortDir) {
                vm.sortDir[key] = 0;
            }
            vm.sortDir[name] = dir;
            refresh();
        }

        function showIntro () {
            $window.introJs().setOptions(vm.introOptions).start();
        }

        function showNewLayerModal () {
            const modal = $uibModal.open({
                component: 'appLayerListNewModal',
            });
            modal.result.then(function () {
                refresh();
            });
        }

        function refresh () {
            const params = {};

            params.fields = 'name,status';
            params.filters = vm.filters;
            params.sort = Object.keys(vm.sortDir).find(k => vm.sortDir[k]);
            if (vm.sortDir[params.sort] === -1) {
                params.sort = '-' + params.sort;
            }
            params.page = vm.page;

            return api.getLayers(params).then(result => {
                vm.layers = result.data;
                vm.currentPage = result.page;
                vm.pages = result.pages;
            });
        }

        function toggleActive (layer) {
            userService.getCurrentUser().then(user => {
                if (user.isAdmin()) {
                    const newStatus = layer.status === 'active' ? 'Not active' : 'active';

                    api.changeLayerStatus(layer._id, newStatus).then(() => {
                        layer.status = newStatus;
                        notify.success(gettextCatalog.getString('Status updated'));
                    });
                }
            });
        }

        function getIntroOptions () {
            const introOptions = {
                nextLabel: gettextCatalog.getString('Next'),
                prevLabel: gettextCatalog.getString('Back'),
                skipLabel: '&times;',
                doneLabel: gettextCatalog.getString('Done'),
                tooltipPosition: 'auto',
                showStepNumbers: false,
                steps: [
                    {
                        title: gettextCatalog.getString('Layers'),
                        intro: '<p>' +
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
                        title: gettextCatalog.getString('New Layer'),
                        intro: '<p>' +
                            gettextCatalog.getString('Click here to create a new layer.') +
                            '</p>',
                    },
                    {
                        element: '#layerList',
                        title: gettextCatalog.getString('Layers list'),
                        intro: '<p>' +
                            gettextCatalog.getString('Here all the layers are listed.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can edit the layer to configure the tables, elements and joins between tables.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can also activate or deactivate layers.') +
                            '</p>',
                    },
                    {
                        element: '#layerList .badge',
                        title: gettextCatalog.getString('Layer status'),
                        intro: '<p>' +
                            gettextCatalog.getString('The status of the layer defines if the layer is visible or not for your users when creating or editing a report or exploring data.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can change the status of the layer simply clicking over this label') +
                            '</p>',
                    },
                    {
                        element: '.btn-delete',
                        title: gettextCatalog.getString('Layer delete'),
                        intro: '<p>' +
                            gettextCatalog.getString('Click here to delete the layer.') +
                            '</p><p>' +
                            gettextCatalog.getString('Once deleted the layer will not be recoverable again.') +
                            '</p><p>' +
                            gettextCatalog.getString('Requires 2 step confirmation.') +
                            '</p>',
                    },
                    {
                        title: gettextCatalog.getString('Next Step'),
                        intro: '<p>' +
                            gettextCatalog.getString('Design your company public space') +
                            '</p><p>' +
                            gettextCatalog.getString('The public space is the place where your users can publish reports to be shared across the company, in this place you will define the folder strucuture for the company&quot;s public space') +
                            '</p><a class="btn btn-info btn-xs" href="shared-space#intro">' +
                            gettextCatalog.getString('Go to the public space definition and continue tour') +
                            '</a>',
                    }
                ]
            };

            return introOptions;
        }
    }
})();
