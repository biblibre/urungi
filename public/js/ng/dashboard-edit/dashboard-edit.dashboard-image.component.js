(function () {
    'use strict';

    angular.module('app.dashboard-edit').component('appDashboardImage', {
        bindings: {
            url: '<?',
            size: '<',
        },
        controller: DashboardImageController,
        controllerAs: 'vm',
        template: '<img class="img-responsive" draggable="false" ng-src="{{ vm.url }}">',
    });

    DashboardImageController.$inject = ['$element', '$uibModal'];

    function DashboardImageController ($element, $uibModal) {
        const vm = this;

        vm.$onInit = $onInit;

        function $onInit () {
            if (!vm.url) {
                const modal = $uibModal.open({
                    component: 'appDashboardImageModal',
                });
                modal.result.then(function (file) {
                    let url = file.url;
                    if (vm.size === 700 && file.source700) {
                        url = file.source700;
                    }
                    if (vm.size === 1400 && file.source1400) {
                        url = file.source1400;
                    }
                    $element.attr('url', "'" + url + "'");
                    vm.url = url;
                }, function () {
                    $element.remove();
                });
            }
        }
    }
})();
