require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/api.js');
require('../../../public/js/themes/themes.module.js');
require('../../../public/js/themes/theme-select.component.js');

describe('appThemeSelect', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.themes'));

    let $componentController, $compile, $rootScope;
    let $httpBackend;

    beforeEach(inject(function (_$componentController_, _$compile_, _$rootScope_, _$httpBackend_) {
        $componentController = _$componentController_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('ThemeSelectController', function () {
        let onChangeSpy;
        let vm;

        beforeEach(function () {
            onChangeSpy = jest.fn();
            const bindings = {
                theme: 'foo',
                onChange: onChangeSpy,
            };
            vm = $componentController('appThemeSelect', null, bindings);
        });

        it('should fetch available themes on init', function () {
            $httpBackend.expect('GET', '/api/themes').respond({ data: ['foo', 'bar'] });
            vm.$onInit();
            $httpBackend.flush();
            expect(vm.themes).toEqual(['foo', 'bar']);
        });

        it('should call onChange', function () {
            vm.theme = 'bar';
            vm.change();
            expect(onChangeSpy).toHaveBeenCalledWith({ theme: 'bar' });
        });
    });

    describe('component', function () {
        it('should replace the element with appropriate content', function () {
            $httpBackend.expect('GET', '/api/themes').respond({ data: ['foo', 'bar'] });
            const html = '<app-theme-select theme="\'foo\'"></app-theme-select>';
            const element = $compile(html)($rootScope);
            $rootScope.$digest();
            $httpBackend.flush();

            const select = element.find('select');
            expect(select).toHaveLength(1);
            expect(select.val()).toBe('string:foo');
            expect(select.find('option')).toHaveLength(3);
            expect(select.find('option:eq(0)').attr('value')).toBe('');
            expect(select.find('option:eq(0)').text()).toBe('');
            expect(select.find('option:eq(1)').attr('value')).toBe('string:foo');
            expect(select.find('option:eq(1)').text()).toBe('foo');
            expect(select.find('option:eq(2)').attr('value')).toBe('string:bar');
            expect(select.find('option:eq(2)').text()).toBe('bar');
        });
    });
});
