module.exports = function () {
    this.registerFilter('expand', function (s, ...args) {
        const scope = Object.fromEntries(args);
        return expand(s, scope);
    });

    function expand (s, scope) {
        const pattern =
            '\\{\\{(' +
            Object.keys(scope).map(escapeRegExp).join('|') +
            ')\\}\\}';
        const re = new RegExp(pattern, 'g');
        const replacer = function (match, key) {
            return scope[key] !== null && scope[key] !== undefined ? scope[key] : '';
        };
        return s.replace(re, replacer);
    }

    function escapeRegExp (string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};
