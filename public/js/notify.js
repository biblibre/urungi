/* global PNotify: false, PNotifyBootstrap3: false, PNotifyFontAwesome4: false */
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

export function success (text, options = {}) {
    const args = createArgs(text, options);
    PNotify.success(args);
}

export function error (text, options = {}) {
    const args = createArgs(text, options);
    PNotify.error(args);
}

export function notice (text, options = {}) {
    const args = createArgs(text, options);
    PNotify.notice(args);
}
