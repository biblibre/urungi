const moment = require('moment');
module.exports = function () {
    this.registerFilter('timeFromNow', function (s) {
        return moment(s).fromNow();
    });
};
