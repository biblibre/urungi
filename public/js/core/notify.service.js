(function () {
    'use strict';

    angular.module('app.core').factory('notify', notify);

    notify.$inject = ['PNotify', 'PNotifyBootstrap3', 'PNotifyFontAwesome4'];

    function notify (PNotify, PNotifyBootstrap3, PNotifyFontAwesome4) {
        PNotify.defaults.delay = 5000;

        // define the default stack display for notifications
        PNotify.defaults.stack = new PNotify.Stack({
            dir1: 'up',
            dir2: 'left',
            firstpos1: 25,
            firstpos2: 25,
            modal: false,
            maxOpen: 5,
            maxStrategy: 'wait',
            maxClosureCausesWait: false
        });

        PNotify.defaultModules.set(PNotifyBootstrap3, {});
        PNotify.defaultModules.set(PNotifyFontAwesome4, {});

        const service = {
            success,
            error,
            notice,
        };

        return service;

        function success (text) {
            PNotify.success({ text });
        }

        function error (text) {
            PNotify.error({ text });
        }

        function notice (text) {
            PNotify.notice({ text });
        }
    }
})();
