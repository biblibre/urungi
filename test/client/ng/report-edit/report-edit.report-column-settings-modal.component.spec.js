require('angular-ui-sortable');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/drag-and-drop/drag-and-drop.module.js');
require('../../../../public/js/ng/modal/modal.module.js');
require('../../../../public/js/ng/theme/theme.module.js');
require('../../../../public/js/ng/report/report.module.js');
require('../../../../public/js/ng/report/report.reports-service.service.js');
require('../../../../public/js/ng/report-edit/report-edit.module.js');
require('../../../../public/js/ng/report-edit/report-edit.report-column-settings-modal.component.js');

describe('appReportColumnSettingsModal', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.report'));
    beforeEach(angular.mock.module('app.report-edit'));

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
                    report,
                    column,
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
