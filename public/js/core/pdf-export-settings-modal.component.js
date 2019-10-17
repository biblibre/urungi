(function () {
    'use strict';

    angular.module('app.core').component('appPdfExportSettingsModal', {
        templateUrl: 'partials/core/pdf-export-settings-modal.component.html',
        controller: PdfExportSettingsModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    PdfExportSettingsModalController.$inject = [];

    function PdfExportSettingsModalController () {
        const vm = this;

        vm.$onInit = $onInit;
        vm.submit = submit;
        vm.settings = {};

        function $onInit () {
            vm.settings.displayHeaderFooter = false;
            vm.settings.headerTemplate = '<div style="font-size: 10px; width: 100%; padding: 0 12px;"><span style="float: right" class="date"></span></div>';
            vm.settings.footerTemplate = '<div style="font-size: 10px; width: 100%; padding: 0 12px;"><span style="float: right;"><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>';
        }

        function submit () {
            vm.settings.headerTemplate = replaceDate(vm.settings.headerTemplate);
            vm.settings.footerTemplate = replaceDate(vm.settings.footerTemplate);
            vm.close({ $value: vm.settings });
        }

        function replaceDate (template) {
            const dateString = new Date().toLocaleDateString();

            const el = document.createElement('div');
            el.innerHTML = template;
            el.querySelectorAll('.date').forEach(function (node) {
                node.textContent = dateString;
                node.classList.remove('date');
            });

            return el.innerHTML;
        }
    }
})();
