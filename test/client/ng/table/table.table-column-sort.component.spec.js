require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/table/table.module.js');
require('../../../../public/js/ng/table/table.templates.js');
require('../../../../public/js/ng/table/table.table-column-sort.component.js');

describe('appTableColumnSort', function () {
    beforeEach(angular.mock.module('app.table'));

    let $compile, $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    describe('component', function () {
        it('should not be active by default', function () {
            const html = '<app-table-column-sort></app-table-column-sort>';
            const element = $compile(html)($rootScope);
            $rootScope.$digest();

            const child = element.children();
            expect(child.hasClass('sort-button')).toBeTruthy();
            expect(child.hasClass('active')).toBeFalsy();
        });

        it('should be active and asc if sortDir is 1', function () {
            const html = '<app-table-column-sort sort-dir="1"></app-table-column-sort>';
            const element = $compile(html)($rootScope);
            $rootScope.$digest();

            const child = element.children();
            expect(child.hasClass('sort-button')).toBeTruthy();
            expect(child.hasClass('active')).toBeTruthy();

            const icon = child.children('i');
            expect(icon.hasClass('fa-sort-asc')).toBeTruthy();
        });

        it('should be active and desc if sortDir is -1', function () {
            const html = '<app-table-column-sort sort-dir="-1"></app-table-column-sort>';
            const element = $compile(html)($rootScope);
            $rootScope.$digest();

            const child = element.children();
            expect(child.hasClass('sort-button')).toBeTruthy();
            expect(child.hasClass('active')).toBeTruthy();

            const icon = child.children('i');
            expect(icon.hasClass('fa-sort-desc')).toBeTruthy();
        });

        it('should call onSort', function () {
            const html = '<app-table-column-sort sort-dir="sortDir" on-sort="sort($dir)"></app-table-column-sort>';
            $rootScope.sortDir = 0;
            $rootScope.sort = jest.fn();
            const element = $compile(html)($rootScope);
            $rootScope.$digest();

            element.find('.sort-button').trigger('click');
            expect($rootScope.sort).toHaveBeenCalledWith(1);

            $rootScope.sortDir = 1;
            $rootScope.$digest();

            element.find('.sort-button').trigger('click');
            expect($rootScope.sort).toHaveBeenCalledWith(-1);

            $rootScope.sortDir = -1;
            $rootScope.$digest();

            element.find('.sort-button').trigger('click');
            expect($rootScope.sort).toHaveBeenCalledWith(1);
        });
    });
});
