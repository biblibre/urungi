const config = require('config');
const { Liquid } = require('liquidjs');
const gettext = require('./gettext.js');
const liquidGettext = require('../../src/liquid-plugin/gettext.js');
const liquidExpand = require('../../src/liquid-plugin/expand.js');
const liquidMoment = require('../../src/liquid-plugin/moment.js');
const liquid = new Liquid({
    cache: config.get('liquid.cache'),
    extname: '.liquid',
    jsTruthy: false,
    relativeReference: false,
    strictFilters: true,
});

liquid.plugin(liquidExpand);
liquid.plugin(liquidGettext(gettext));
liquid.plugin(liquidMoment);

module.exports = liquid;
