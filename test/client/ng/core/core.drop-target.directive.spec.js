require('../../../../public/js/ng/drag-and-drop/drag-and-drop.module.js');

describe('appDropTarget', function () {
    beforeEach(angular.mock.module('app.drag-and-drop'));

    let $compile, $rootScope;

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    describe('directive', function () {
        let onDropSpy;
        let element;

        beforeEach(function () {
            onDropSpy = jest.fn();
            $rootScope.onDrop = onDropSpy;
            const html = '<div class="drop" app-drop-target drop-accept="text/html" on-drop="onDrop($event)"><div class="drop"></div><div class="nodrop"></div></div>';
            element = $compile(html)($rootScope);
            $rootScope.$digest();
        });

        it('should add a class on dragover', function () {
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/html', 'foo');

            const dragEvent = new DragEvent('dragover', { dataTransfer: dataTransfer });
            element[0].dispatchEvent(dragEvent);
            expect(element[0].classList).toContain('dragover');
        });

        it('should remove dragover class on dragleave', function () {
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/html', 'foo');

            element[0].classList.add('dragover');
            const dragEvent = new DragEvent('dragleave', { dataTransfer: dataTransfer });
            element[0].dispatchEvent(dragEvent);
            expect(element[0].classList).not.toContain('dragover');
        });

        it('should remove dragover class and call onDrop on drop', function () {
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/html', 'foo');

            element[0].classList.add('dragover');
            const dragEvent = new DragEvent('drop', { dataTransfer: dataTransfer });
            element[0].dispatchEvent(dragEvent);
            expect(element[0].classList).not.toContain('dragover');
            expect(onDropSpy).toHaveBeenCalledWith(dragEvent);
        });
    });

    class DragEvent extends MouseEvent {
        constructor (type, dragEventInit) {
            super(type, dragEventInit);
            this.dataTransfer = dragEventInit.dataTransfer;
        }
    }

    class DataTransfer {
        constructor () {
            this.types = [];
            this._data = {};
        }

        getData (type) {
            return this._data[type];
        }

        setData (type, data) {
            this.types.push(type);
            this._data[type] = data;
        }
    }
});
