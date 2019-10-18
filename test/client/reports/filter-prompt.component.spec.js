require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/api.js');
require('../../../public/js/reports/reports.module.js');
require('../../../public/js/reports/filter-prompt.component.js');

describe('appReportDropzone', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.reports'));
    beforeEach(angular.mock.module('app.templates'));

    let $componentController;

    beforeEach(inject(function (_$componentController_, _$compile_, _$rootScope_) {
        $componentController = _$componentController_;
    }));

    describe('ReportDropzoneController', function () {
        let onChangeSpy;
        let onRemoveSpy;
        let setPromptSpy;
        let vm;

        beforeEach(function () {
            onChangeSpy = jest.fn();
            onRemoveSpy = jest.fn();
            setPromptSpy = jest.fn();
            const bindings = {
                filter: {},
                isPrompt: false,
                onChange: onChangeSpy,
                onRemove: onRemoveSpy,
                setPrompt: setPromptSpy,
            };
            vm = $componentController('appFilterPrompt', null, bindings);
        });

        describe('getFilterTypeLabel', function () {
            it('should returns the correct label', function () {
                expect(vm.getFilterTypeLabel('equal')).toBe('is equal to');
            });

            it('should return undefined for an unknown type', function () {
                expect(vm.getFilterTypeLabel('???')).toBeUndefined();
            });
        });
    });
});
