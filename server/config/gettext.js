const Gettext = require('gettext.js');

const gettext = new Gettext();
const locales = ['fr', 'es'];
for (const locale of locales) {
    const translations = require('../../public/translations/' + locale + '.js');
    gettext.loadJSON(translations);
}

module.exports = gettext;
