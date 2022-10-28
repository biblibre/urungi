(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Urungi.expand = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    return function expand (s, scope) {
        const pattern =
            '\\{\\{(' +
            Object.keys(scope).map(escapeRegExp).join('|') +
            ')\\}\\}';
        const re = new RegExp(pattern, 'g');
        const replacer = function (match, key) {
            return scope[key] !== null && scope[key] !== undefined ? scope[key] : '';
        };
        return s.replace(re, replacer);
    };

    function escapeRegExp (string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}));
