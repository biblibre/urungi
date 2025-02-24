angular.module('app.drag-and-drop', [])
    .directive('appDragstart', appDragstart)
    .directive('appDropTarget', appDropTarget);

function appDragstart () {
    const directive = {
        bindToController: {
            appDragstart: '&',
        },
        controller: DragstartController,
        restrict: 'A',
    };

    return directive;
}

DragstartController.$inject = ['$scope', '$element'];

function DragstartController ($scope, $element) {
    const vm = this;

    vm.$postLink = $postLink;

    function $postLink () {
        $element[0].addEventListener('dragstart', function (ev) {
            ev.stopPropagation();
            $scope.$apply(function () {
                vm.appDragstart({ $event: ev });
            });
        });
    }
}

function appDropTarget () {
    const directive = {
        bindToController: {
            appDropTarget: '@',
            dropAccept: '@',
            onDrop: '&',
        },
        controller: DropTargetController,
        restrict: 'A',
    };

    return directive;
}

DropTargetController.$inject = ['$scope', '$element'];

function DropTargetController ($scope, $element) {
    const vm = this;

    vm.$postLink = $postLink;

    function $postLink () {
        const el = $element[0];

        el.addEventListener('dragover', function (ev) {
            if (!ev.dataTransfer.types.includes(vm.dropAccept)) {
                return;
            }

            let dropTarget = this;
            if (vm.appDropTarget) {
                dropTarget = findDropTarget(ev.target);
            }

            dropTarget.classList.add('dragover');

            ev.preventDefault();
            ev.stopPropagation();

            ev.dataTransfer.dropEffect = 'copy';
        });

        el.addEventListener('dragleave', function (ev) {
            let dropTarget = this;
            if (vm.appDropTarget) {
                dropTarget = findDropTarget(ev.target);
            }

            dropTarget.classList.remove('dragover');
        });

        el.addEventListener('drop', function (ev) {
            if (!ev.dataTransfer.types.includes(vm.dropAccept)) {
                return;
            }

            let dropTarget = this;
            if (vm.appDropTarget) {
                dropTarget = findDropTarget(ev.target);
            }

            ev.stopPropagation();
            dropTarget.classList.remove('dragover');

            $scope.$apply(function () {
                vm.onDrop({ $event: ev, dropTarget });
            });
        });
    }

    function findDropTarget (node) {
        if (!(node instanceof Element)) {
            node = node.parentNode;
        }

        return node.closest(vm.appDropTarget);
    }
}
