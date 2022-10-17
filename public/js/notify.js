/* global PNotify: false, PNotifyBootstrap3: false, PNotifyFontAwesome4: false */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Urungi.notify = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

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

    function success (text) {
        PNotify.success({ text });
    }

    function error (text) {
        PNotify.error({ text });
    }

    function notice (text) {
        PNotify.notice({ text });
    }

    return { success, error, notice };
}));
