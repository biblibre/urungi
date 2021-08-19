(function () {
    'use strict';

    angular.module('app.core').factory('notify', notify);

    notify.$inject = ['PNotify', 'PNotifyBootstrap4'];

    function notify (PNotify, PNotifyBootstrap4) {
        const settings = {
            delay: 3500,
        };

        PNotify.defaultModules.set(PNotifyBootstrap4, {});

        // define the maxOpen stack display for notifications
        const maxOpenWait = new PNotify.Stack({
            dir1: 'down',
            dir2: 'left',
            firstpos1: 25,
            firstpos2: 25,
            modal: false,
            maxOpen: 5,
            maxStrategy: 'wait',
            maxClosureCausesWait: false
        });

        const service = {
            success: success,
            error: error,
            notice: notice,
        };

        return service;

        function clickToClose (notifyObject) {
            notifyObject.on('click', () => {
                notifyObject.close();
            });
        };

        function success (content) {
            const context = settings;
            context.stack = maxOpenWait;
            context.text = content;
            PNotify.success(context);
        }

        function error (content) {
            const context = settings;
            context.stack = maxOpenWait;
            context.text = content;
            clickToClose(PNotify.error(context));
        }
        function notice (content) {
            const context = settings;
            context.stack = maxOpenWait;
            context.text = content;
            clickToClose(PNotify.notice(context));
        }
    }
})();
