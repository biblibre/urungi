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

    SidebarController.$inject = ['userService', '$scope', '$rootScope'];

    function SidebarController (userService, $scope, $rootScope) {
        const vm = this;

        vm.counts = {};
        vm.userData = {};

        $scope.$on('deleteDashboard', function (evt) {
            vm.counts.dashboards--;
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
