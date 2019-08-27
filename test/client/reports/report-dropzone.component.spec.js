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
                const data = {
                    'json/custom-object': element,
                };
                const dropEvent = new Event('drop');
                vm.onDropItem(data, dropEvent);
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

        describe('getColumnDescription', function () {
            it('should return a column description', function () {
                const column = {
                    originalLabel: 'original',
                    objectLabel: 'original (count)',
                    aggregation: 'sum',
                };
                const description = vm.getColumnDescription(column);
                expect(description).toBe('original (Sum)');
            });
        });
    });
});
