(function () {
    'use strict';

    angular.module('app.about').controller('AboutController', AboutController);

    AboutController.$inject = ['api'];

    function AboutController (api) {
        const vm = this;

        vm.version = undefined;
        vm.gitVersion = undefined;

        activate();

        function activate () {
            api.getVersion().then(res => {
                vm.version = res.data.version;
                vm.gitVersion = res.data.gitVersion;
            });
        }
    }
})();
