require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/theme/theme.module.js');
require('../../../../public/js/ng/report/report.module.js');
require('../../../../public/js/ng/report/report.filter-prompt.component.js');

describe('appFilterPrompt', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.report'));

    let $componentController;

    beforeEach(inject(function (_$componentController_, _$compile_, _$rootScope_) {
        $componentController = _$componentController_;
    }));

    describe('FilterPromptController', function () {
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
