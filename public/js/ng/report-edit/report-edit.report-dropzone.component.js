import ReportColumnSettingsModal from '../../modal/report-column-settings-modal.js';
import { getColumnDescription, getColumnId } from '../../report/util.js';

angular.module('app.report-edit').component('appReportDropzone', {
    templateUrl: 'partials/report-edit/report-edit.report-dropzone.component.html',
    controller: DropzoneController,
    controllerAs: 'vm',
    bindings: {
        report: '<',
        settingsAvailable: '<',
        elements: '<',
        zoneInfo: '<',
        onDrop: '&',
        onRemove: '&',
        onChange: '&?',
        setSortType: '&?',
    },
});

DropzoneController.$inject = [];

function DropzoneController () {
    const vm = this;

    vm.onDropItem = onDropItem;
    vm.onRemoveItem = onRemoveItem;
    vm.openColumnSettingsModal = openColumnSettingsModal;
    vm.getColumnDescription = getColumnDescription;

    function onDropItem (ev) {
        const type = 'application/vnd.urungi.layer-element+json';
        const data = ev.dataTransfer.getData(type);
        const layerElement = JSON.parse(data);

        const found = vm.elements.find(e => e.elementID === layerElement.elementID);
        if (!found) {
            vm.onDrop({ elements: vm.elements, item: layerElement });
        }
    }

    function onRemoveItem (item) {
        vm.onRemove({ elements: vm.elements, item });
    }

    function openColumnSettingsModal (column) {
        const modal = new ReportColumnSettingsModal({
            column: column,
            report: vm.report,
        });
        modal.open().then(JSON.parse).then(function (settings) {
            if (settings.aggregation) {
                column.aggregation = settings.aggregation;
            } else {
                delete column.aggregation;
            }
            column.id = getColumnId(column);

            column.doNotStack = settings.doNotStack;
            column.label = settings.label;
            column.type = settings.type;
            column.format = settings.format;
            column.calculateTotal = settings.calculateTotal;

            if (vm.onChange) {
                vm.onChange({ item: column });
            }
        }, () => {});

        return modal;
    }
}
