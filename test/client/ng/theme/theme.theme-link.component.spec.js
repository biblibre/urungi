require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/theme/theme.module.js');
require('../../../../public/js/ng/theme/theme.theme-link.component.js');

describe('appThemeLink', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.theme'));

    let $compile, $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    describe('component', function () {
        it('should replace the element with appropriate content', function () {
            const html = '<app-theme-link theme="\'foo\'"></app-theme-link>';
            const element = $compile(html)($rootScope);
            $rootScope.$digest();

            const link = element.find('link');
            expect(link).toHaveLength(1);
            expect(link.attr('href')).toBe('themes/foo.css');
        });
    });
});
