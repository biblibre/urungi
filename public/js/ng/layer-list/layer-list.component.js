(function () {
    'use strict';

    angular.module('app.layer-list')
        .component('appLayerList', {
            templateUrl: 'partials/layer-list/layer-list.component.html',
            controller: LayerListController,
            controllerAs: 'vm',
        });

    LayerListController.$inject = ['$window', '$timeout', 'notify', 'api', 'i18n', 'userService'];

    function LayerListController ($window, $timeout, notify, api, i18n, userService) {
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
            import('../../modal/layer-new-modal.js').then(({ default: LayerNewModal }) => {
                const modal = new LayerNewModal();
                modal.open().then(() => { refresh() }, () => {});
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
                        notify.success(i18n.gettext('Status updated'));
                    });
                }
            });
        }

        function getIntroOptions () {
            const introOptions = {
                nextLabel: i18n.gettext('Next'),
                prevLabel: i18n.gettext('Back'),
                doneLabel: i18n.gettext('Done'),
                steps: [
                    {
                        title: i18n.gettext('Layers'),
                        intro: '<p>' +
                            i18n.gettext('Layers define the interface for your users to access the data.') +
                            '</p><p>' +
                            i18n.gettext('Layers allow your users to create reports dragging and dropping familiar elements that points in the background to the fields contained in tables in your data sources.') +
                            '</p><p>' +
                            i18n.gettext('Here you can create and manage the layers that later will be used by your users to create reports or explore data.') +
                            '</p><p>' +
                            i18n.gettext('You can create several layers depending on your necessities, but you have to define one at least.') +
                            '</p>',
                    },
                    {
                        element: '#newLayerButton',
                        title: i18n.gettext('New Layer'),
                        intro: '<p>' +
                            i18n.gettext('Click here to create a new layer.') +
                            '</p>',
                    },
                    {
                        element: 'app-layer-list table',
                        title: i18n.gettext('Layers list'),
                        intro: '<p>' +
                            i18n.gettext('Here all the layers are listed.') +
                            '</p><p>' +
                            i18n.gettext('You can edit the layer to configure the tables, elements and joins between tables.') +
                            '</p><p>' +
                            i18n.gettext('You can also activate or deactivate layers.') +
                            '</p>',
                    },
                    {
                        element: 'app-layer-list table .badge',
                        title: i18n.gettext('Layer status'),
                        intro: '<p>' +
                            i18n.gettext('The status of the layer defines if the layer is visible or not for your users when creating or editing a report or exploring data.') +
                            '</p><p>' +
                            i18n.gettext('You can change the status of the layer simply clicking over this label') +
                            '</p>',
                    },
                    {
                        element: 'app-layer-list table .btn-danger',
                        title: i18n.gettext('Layer delete'),
                        intro: '<p>' +
                            i18n.gettext('Click here to delete the layer.') +
                            '</p><p>' +
                            i18n.gettext('Once deleted the layer will not be recoverable again.') +
                            '</p><p>' +
                            i18n.gettext('Requires 2 step confirmation.') +
                            '</p>',
                    },
                    {
                        title: i18n.gettext('Next Step'),
                        intro: '<p>' +
                            i18n.gettext('Design your company public space') +
                            '</p><p>' +
                            i18n.gettext('The public space is the place where your users can publish reports to be shared across the company, in this place you will define the folder strucuture for the company&quot;s public space') +
                            '</p><a href="shared-space#intro">' +
                            i18n.gettext('Go to the public space definition and continue tour') +
                            '</a>',
                    }
                ]
            };

            return introOptions;
        }
    }
})();
