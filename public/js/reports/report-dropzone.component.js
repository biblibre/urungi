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
        vm.getColumnDescription = getColumnDescription;
        vm.openColumnSettingsModal = openColumnSettingsModal;

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

        function getColumnDescription (column) {
            let columnDescription = column.originalLabel || column.objectLabel;
            if (column.aggregation) {
                const aggregationDescription = reportsService.getAggregationDescription(column.aggregation);
                columnDescription += ' (' + aggregationDescription + ')';
            }

            return columnDescription;
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
                column.type = settings.type;
            }, () => {});

            return modal;
        }
    }
})();
