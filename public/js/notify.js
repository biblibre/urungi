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

    function createArgs (text, options = {}) {
        const args = { text };

        if (options && options.appendTo) {
            if (!options.appendTo.PNotifyStack) {
                options.appendTo.PNotifyStack = new PNotify.Stack({
                    modal: false,
                    positioned: false,
                    maxOpen: Infinity,
                    context: options.appendTo,
                });
            }
            args.stack = options.appendTo.PNotifyStack;
            args.width = null;
            args.shadow = false;
        }

        return args;
    }

    function success (text, options = {}) {
        const args = createArgs(text, options);
        PNotify.success(args);
    }

    function error (text, options = {}) {
        const args = createArgs(text, options);
        PNotify.error(args);
    }

    function notice (text, options = {}) {
        const args = createArgs(text, options);
        PNotify.notice(args);
    }

    return { success, error, notice };
}));
