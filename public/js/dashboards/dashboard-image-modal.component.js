(function () {
    'use strict';

    angular.module('app.dashboards').component('appDashboardImageModal', {
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
        controller: DashboardImageModalController,
        controllerAs: 'vm',
        templateUrl: 'partials/dashboards/dashboard-image-modal.component.html',
    });

    DashboardImageModalController.$inject = ['gettextCatalog', 'Noty', 'api'];

    function DashboardImageModalController (gettextCatalog, Noty, api) {
        const vm = this;

        vm.$onInit = $onInit;
        vm.catalogIcons = [];
        vm.catalogImages = [];
        vm.files = [];
        vm.onFileSelected = onFileSelected;
        vm.upload = upload;

        function $onInit () {
            api.getFiles().then(function (files) {
                vm.files = files;
            });

            for (let i = 1; i < 100; ++i) {
                const idx = Number(i).toString().padStart(2, '0');
                const image = {
                    url: 'resources/images/tumbnails100/JPEG/photo-' + idx + '_1.jpg',
                    source1400: 'resources/images/width1400/JPEG/photo-' + idx + '_1.jpg',
                    source700: 'resources/images/width700/JPEG/photo-' + idx + '_1.jpg',
                };

                vm.catalogImages.push(image);
            }

            for (let i = 1; i < 55; ++i) {
                const idx = Number(i).toString().padStart(2, '0');
                const icon = {
                    url: 'resources/images/icons/icon-' + idx + '.png',
                };

                vm.catalogIcons.push(icon);
            }
        }

        function onFileSelected (file) {
            vm.close({ $value: file });
        }

        function upload (file) {
            if (!file) {
                return;
            }

            const type = file.type.split('/')[0];
            if (type !== 'image') {
                new Noty({ text: gettextCatalog.getString('You may only upload images'), type: 'error' }).show();
                return;
            }

            var uploadPromise = api.uploadFile(file);

            var newFile = {
                loading: true
            };
            vm.files.push(newFile);

            uploadPromise.then(file => {
                $.extend(newFile, file);
                newFile.loading = false;
            });
        }
    }
})();
