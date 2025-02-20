require('angular-ui-sortable');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/drag-and-drop/drag-and-drop.module.js');
require('../../../../public/js/ng/theme/theme.module.js');
require('../../../../public/js/ng/report/report.module.js');
require('../../../../public/js/ng/report-edit/report-edit.module.js');
require('../../../../public/js/ng/report-edit/report-edit.report-settings-modal.component.js');

describe('appReportColumnSettingsModal', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.report'));
    beforeEach(angular.mock.module('app.report-edit'));

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
                    report,
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
