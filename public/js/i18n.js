import gettext from '../s/gettext.js/gettext.esm.min.js';

const i18n = gettext();

if (typeof document !== 'undefined') {
    const languageCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('language='));
    const language = languageCookie ? languageCookie.split('=')[1] : null;
    if (language) {
        i18n.setLocale(language);
        try {
            const { default: messages } = await import(`../translations/${language}.esm.js`)
            i18n.loadJSON(messages);
        } catch (err) {
            console.error(err);
        }
    }
}

export default i18n;

export const t = i18n.gettext.bind(i18n);

export function expand (s, scope) {
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
