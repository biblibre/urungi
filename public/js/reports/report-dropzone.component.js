(function () {
    'use strict';

    angular.module('app.reports').component('appReportDropzone', {
        templateUrl: 'partials/reports/report-dropzone.component.html',
        controller: DropzoneController,
        controllerAs: 'vm',
        bindings: {
            report: '<',
            settingsAvailable: '<',
            elements: '<',
            zoneInfo: '<',
            onDrop: '&',
            onRemove: '&',
            setSortType: '&?',
        },
    });

    DropzoneController.$inject = ['$uibModal', 'reportsService'];

    function DropzoneController ($uibModal, reportsService) {
        const vm = this;

        vm.onDropItem = onDropItem;
        vm.onRemoveItem = onRemoveItem;
        vm.openColumnSettingsModal = openColumnSettingsModal;
        vm.getColumnDescription = reportsService.getColumnDescription;

        function onDropItem (data, event) {
            event.stopPropagation();

            var newItem = data['json/custom-object'];

            const found = vm.elements.find(e => e.elementID === newItem.elementID);

            if (!found) {
                vm.onDrop({ elements: vm.elements, item: newItem });
            }
        };

        function onRemoveItem (item) {
            vm.onRemove({ elements: vm.elements, item: item });
        };

        function openColumnSettingsModal (column) {
            const modal = $uibModal.open({
                component: 'appReportColumnSettingsModal',
                resolve: {
                    column: () => column,
                    report: () => vm.report,
                },
            });
            modal.result.then(function (settings) {
                if (settings.aggregation) {
                    column.aggregation = settings.aggregation;
                } else {
                    delete column.aggregation;
                }
                column.id = reportsService.getColumnId(column);

                column.doNotStack = settings.doNotStack;
                column.label = settings.label;
                column.type = settings.type;
                column.format = settings.format;
                column.calculateTotal = settings.calculateTotal;
            }, () => {});

            return modal;
        }
    }
})();
