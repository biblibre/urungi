(function () {
    'use strict';

    angular.module('app.sidebar').component('appSidebar', {
        templateUrl: 'partials/sidebar/sidebar.html',
        controller: SidebarController,
        controllerAs: 'vm',
        bindings: {
            showIntro: '&?',
        },
    });

    SidebarController.$inject = ['userService', '$scope'];

    function SidebarController (userService, $scope) {
        const vm = this;

        vm.counts = {};
        vm.userData = {};

        $scope.$on('delete-dashboard', function (evt) {
            vm.counts.dashboards--;
        });

        $scope.$on('duplicate-dashboard', function (evt) {
            vm.counts.dashboards++;
        });

        $scope.$on('delete-report', function (evt) {
            vm.counts.reports--;
        });

        $scope.$on('delete-layer', function (evt) {
            vm.counts.layers--;
        });

        activate();

        function activate () {
            userService.getCounts().then(data => {
                vm.counts = data;
            });
            userService.getCurrentUser().then(user => {
                vm.user = user;
            }, () => {});
        }
    }
})();
