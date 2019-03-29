describe('appPager', function () {
    beforeEach(module('app.core'));

    let $componentController, $compile, $rootScope, $httpBackend;

    beforeEach(inject(function (_$componentController_, _$compile_, _$rootScope_, _$httpBackend_) {
        $componentController = _$componentController_;
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        $httpBackend = _$httpBackend_;
    }));

    describe('PagerController', function () {
        let onPageChangeSpy;
        let vm;

        beforeEach(function () {
            onPageChangeSpy = jasmine.createSpy('onPageChange');
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
            // TODO Consider using karma-ng-html2js-preprocessor to use the real template
            const template = 'currentPage: {{ vm.currentPage }}, ' +
                'totalPages: {{ vm.totalPages }}';
            $httpBackend.expect('GET', 'partials/core/pager.html')
                .respond(template);

            const html = '<app-pager current-page="10" total-pages="15"></app-pager>';
            const element = $compile(html)($rootScope);
            $httpBackend.flush();
            $rootScope.$digest();

            expect(element.html()).toBe('currentPage: 10, totalPages: 15');
        });
    });
});
