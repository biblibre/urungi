require('../../../public/js/core/core.module.js');
require('../../../public/js/reports/reports.module.js');
require('../../../public/js/reports/report-settings-modal.component.js');

describe('appReportColumnSettingsModal', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.reports'));
    beforeEach(angular.mock.module('app.templates'));

    let $componentController;

    beforeEach(inject(function (_$componentController_, _$compile_, _$rootScope_) {
        $componentController = _$componentController_;
    }));

    describe('ReportSettingsModalController', function () {
        let closeSpy;
        let dismissSpy;
        let vm;

        beforeEach(function () {
            closeSpy = jest.fn();
            dismissSpy = jest.fn();

            const report = {
                reportType: 'chart-pie',
                properties: {
                    legendPosition: 'bottom',
                    height: '300',
                },
            };

            const bindings = {
                resolve: {
                    report: report,
                },
                close: closeSpy,
                dismiss: dismissSpy,
            };
            vm = $componentController('appReportSettingsModal', null, bindings);
        });

        describe('$onInit', function () {
            it('should initialize correctly', function () {
                vm.$onInit();

                expect(vm.settings.reportType).toBe('chart-pie');
                expect(vm.settings.legendPosition).toBe('bottom');
                expect(vm.settings.height).toBe('300');
            });
        });
    });
});
