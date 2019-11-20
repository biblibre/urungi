require('../../../public/js/core/core.module.js');
require('../../../public/js/core/dragstart.directive.js');

describe('appDragstart', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.templates'));

    let $compile, $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    describe('directive', function () {
        it('should add an event listener for dragstart event', function () {
            $rootScope.onDragStart = jest.fn();
            const html = '<div app-dragstart="onDragStart($event)"></div>';
            const element = $compile(html)($rootScope);
            $rootScope.$digest();

            const dragEvent = new Event('dragstart');
            element[0].dispatchEvent(dragEvent);
            expect($rootScope.onDragStart).toHaveBeenCalledWith(dragEvent);
        });
    });
});
