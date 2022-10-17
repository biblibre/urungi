require('../../../../public/js/ng/drag-and-drop/drag-and-drop.module.js');

describe('appDragstart', function () {
    beforeEach(angular.mock.module('app.drag-and-drop'));

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
