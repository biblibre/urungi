(function () {
    'use strict';

    angular.module('app.core').directive('appDragstart', appDragstart);

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
})();
