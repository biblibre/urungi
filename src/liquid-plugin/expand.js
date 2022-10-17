const expand = require('../../public/js/expand');
module.exports = function () {
    this.registerFilter('expand', function (s, ...args) {
        const scope = Object.fromEntries(args);
        return expand(s, scope);
    });
};
