(function () {
    'use strict';

    angular.module('app.core').factory('notify', notify);

    notify.$inject = ['PNotify', 'PNotifyBootstrap3'];

    function notify (PNotify, PNotifyBootstrap3) {
        const settings = {
            delay: 3500,
        };

        PNotify.defaultModules.set(PNotifyBootstrap3, {});

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
            getNotify: getNotify,
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

        function getNotify (text, type) {
            const context = angular.copy(settings);
            context.stack = maxOpenWait;
            context.text = text;
            clickToClose(PNotify[type](context));
        }

        function success (text) {
            getNotify(text, 'success');
        }

        function error (text) {
            getNotify(text, 'error');
        }
        function notice (text) {
            getNotify(text, 'notice');
        }
    }
})();
