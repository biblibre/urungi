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

    SidebarController.$inject = ['userService', '$scope', 'api'];

    function SidebarController (userService, $scope, api) {
        const vm = this;

        vm.counts = {};
        vm.userData = {};

        activate();

        function activate () {
            userService.getCounts().then(data => {
                vm.counts = data;
            });
            userService.getCurrentUser().then(user => {
                vm.user = user;
            }, () => {});
        }

        $scope.$on('counts-changes', function (evt) {
            api.getCounts().then(data => {
                vm.counts = data;
                console.log('vm.counts: ', vm.counts);
            });
        });
    }
})();
