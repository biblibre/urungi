require('../../../public/js/core/core.module.js');
require('../../../public/js/reports/reports.module.js');
require('../../../public/js/reports/reports.service.js');
require('../../../public/js/reports/report-dropzone.component.js');

describe('appReportDropzone', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.reports'));
    beforeEach(angular.mock.module('app.templates'));

    let $componentController;

    beforeEach(inject(function (_$componentController_, _$compile_, _$rootScope_) {
        $componentController = _$componentController_;
    }));

    describe('ReportDropzoneController', function () {
        let onDropSpy;
        let onRemoveSpy;
        let vm;

        beforeEach(function () {
            onDropSpy = jest.fn();
            onRemoveSpy = jest.fn();
            const bindings = {
                report: {},
                settingsAvailable: true,
                elements: [],
                zoneInfo: 'info',
                onDrop: onDropSpy,
                onRemove: onRemoveSpy,
            };
            vm = $componentController('appReportDropzone', null, bindings);
        });

        describe('onDropItem', function () {
            it('should call onDrop', function () {
                const element = {
                    elementID: 'abcd',
                };

                function DataTransfer () {
                    const _data = {};
                    this.setData = function (type, data) {
                        _data[type] = data;
                    };
                    this.getData = function (type) {
                        return _data[type];
                    };
                }

                function DragEvent (type, dragEventInit) {
                    Object.assign(this, dragEventInit);
                }

                const dataTransfer = new DataTransfer();
                dataTransfer.setData('application/vnd.urungi.layer-element+json', JSON.stringify(element));
                const dropEvent = new DragEvent('drop', { dataTransfer: dataTransfer });
                vm.onDropItem(dropEvent);
                expect(onDropSpy).toHaveBeenCalledWith({ elements: [], item: element });
            });
        });

        describe('onRemoveItem', function () {
            it('should call onRemove', function () {
                const element = {
                    elementID: 'abcd',
                };
                vm.onRemoveItem(element);
                expect(onRemoveSpy).toHaveBeenCalledWith({ elements: [], item: element });
            });
        });
    });
});
