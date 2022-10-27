(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        const i18n = factory();
        root.Urungi.i18n = i18n;
        root.Urungi.t = i18n.gettext.bind(i18n);
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const i18n = window.i18n();

    const languageCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('language='));
    const language = languageCookie ? languageCookie.split('=')[1] : null;
    if (language) {
        i18n.setLocale(language);
    }
    if (window.Urungi.messages) {
        // gettext.js removes the '' key from messages, but AngularJS code
        // (core.module.js) needs it to set the correct locale
        // So we clone the object first
        const messages = Object.assign({}, window.Urungi.messages);
        i18n.loadJSON(messages);
    }

    return i18n;
}));
