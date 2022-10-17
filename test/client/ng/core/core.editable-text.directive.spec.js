require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.editable-text.directive.js');

describe('appEditableText', function () {
    beforeEach(angular.mock.module('app.core'));

    let $compile, $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    describe('directive', function () {
        it('should listen on click events and show an input bound to the model', function () {
            $rootScope.title = 'Page title';
            const html = '<h1 app-editable-text="title">{{ title }}</h1>';
            const element = $compile(html)($rootScope);
            $rootScope.$digest();

            element[0].dispatchEvent(new MouseEvent('click'));
            $rootScope.$digest();

            expect(element.hasClass('editable-text')).toBe(true);
            const input = element[0].nextElementSibling;
            expect(input).toBeDefined();

            input.value += ' modified';
            input.dispatchEvent(new Event('input'));
            expect($rootScope.title).toBe('Page title modified');

            input.dispatchEvent(new Event('blur'));
            expect(element[0].nextElementSibling).toBe(null);
        });
    });
});
