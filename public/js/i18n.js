(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Urungi.i18n = factory();
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
        i18n.loadJSON(window.Urungi.messages);
    }

    return i18n;
}));
