require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/api.js');
require('../../../public/js/reports/reports.module.js');
require('../../../public/js/reports/reports.service.js');
require('../../../public/js/reports/report-column-settings-modal.component.js');

describe('appReportColumnSettingsModal', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.reports'));
    beforeEach(angular.mock.module('app.templates'));

    let $componentController;

    beforeEach(inject(function (_$componentController_, _$compile_, _$rootScope_) {
        $componentController = _$componentController_;
    }));

    describe('ReportColumnSettingsModalController', function () {
        let closeSpy;
        let dismissSpy;
        let vm;

        beforeEach(function () {
            closeSpy = jest.fn();
            dismissSpy = jest.fn();

            const report = {};
            const column = {};

            const bindings = {
                resolve: {
                    report: report,
                    column: column,
                },
                close: closeSpy,
                dismiss: dismissSpy,
            };
            vm = $componentController('appReportColumnSettingsModal', null, bindings);
        });

        describe('$onInit', function () {
            it('should set sane defaults', function () {
                vm.$onInit();

                expect(vm.settings.aggregation).toBeUndefined();
                expect(vm.settings.doNotStack).toBe(false);
                expect(vm.settings.type).toBe('bar');
                expect(vm.aggregationsOptions).toStrictEqual([
                    { name: 'Count', value: 'count' },
                    { name: 'Count distinct', value: 'countDistinct' },
                ]);
            });
        });
    });
});
