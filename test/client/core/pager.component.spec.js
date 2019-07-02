require('../../../public/js/core/core.module.js');
require('../../../public/js/core/pager.component.js');

describe('appPager', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.templates'));

    let $componentController, $compile, $rootScope;

    beforeEach(inject(function (_$componentController_, _$compile_, _$rootScope_) {
        $componentController = _$componentController_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    describe('PagerController', function () {
        let onPageChangeSpy;
        let vm;

        beforeEach(function () {
            onPageChangeSpy = jest.fn();
            const bindings = {
                currentPage: 10,
                totalPages: 15,
                onPageChange: onPageChangeSpy,
            };
            vm = $componentController('appPager', null, bindings);
        });

        it('should calculate the list of pages', function () {
            vm.$onChanges();
            expect(vm.pages).toEqual([5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
        });

        it('should call onPageChange', function () {
            vm.goToPage(3);
            expect(onPageChangeSpy).toHaveBeenCalledWith({ page: 3 });

            vm.goToPage(-1);
            expect(onPageChangeSpy).toHaveBeenCalledWith({ page: 1 });

            vm.goToPage(17);
            expect(onPageChangeSpy).toHaveBeenCalledWith({ page: 15 });
        });
    });

    describe('component', function () {
        it('should replace the element with appropriate content', function () {
            const html = '<app-pager current-page="10" total-pages="15"></app-pager>';
            const element = $compile(html)($rootScope);
            $rootScope.$digest();

            expect(element.find('ul').hasClass('pagination')).toBe(true);
            expect(element.find('ul > li').length).toBe(14);
            expect(element.find('ul > li').eq(0).text().trim()).toBe('First');
            expect(element.find('ul > li').eq(1).text().trim()).toBe('Previous');
            expect(element.find('ul > li').eq(2).text().trim()).toBe('5');
            expect(element.find('ul > li').eq(11).text().trim()).toBe('14');
            expect(element.find('ul > li').eq(12).text().trim()).toBe('Next');
            expect(element.find('ul > li').eq(13).text().trim()).toBe('Last');
        });
    });
});
