const { Liquid } = require('liquidjs');
const liquidGettext = require('../../src/liquid-plugin/gettext.js');
const Gettext = require('gettext.js');

describe('liquid plugin gettext', function () {
    let liquid;
    beforeAll(function () {
        liquid = new Liquid();
        const gettext = new Gettext();
        gettext.setMessages('messages', 'fr', {
            Dashboard: 'Tableau de bord',
            'a dashboard': ['un tableau de bord', 'des tableaux de bord'],
        }, 'nplurals=2; plural=n>1;');
        gettext.setLocale('fr');
        liquid.plugin(liquidGettext(gettext));
    });

    describe('t', function () {
        test('it should translate text', function () {
            const template = '{% t \'Dashboard\' %}';
            const output = liquid.parseAndRenderSync(template, {});
            expect(output).toBe('Tableau de bord');
        });
        test('it should accept filters', function () {
            const template = '{% t \'Dashboard\' | upcase | truncatewords: 2 %}';
            const output = liquid.parseAndRenderSync(template, {});
            expect(output).toBe('TABLEAU DE...');
        });
    });

    describe('tn', function () {
        test('it should translate text (singular)', function () {
            const template = '{% tn "a dashboard" "dashboards" 1 %}';
            const output = liquid.parseAndRenderSync(template, {});
            expect(output).toBe('un tableau de bord');
        });
        test('it should translate text (plural)', function () {
            const template = '{% tn "a dashboard" "dashboards" 2 %}';
            const output = liquid.parseAndRenderSync(template, {});
            expect(output).toBe('des tableaux de bord');
        });
        test('it should accept filters', function () {
            const template = '{% tn "a dashboard" "dashboards" 2 | upcase | truncatewords: 2 %}';
            const output = liquid.parseAndRenderSync(template, {});
            expect(output).toBe('DES TABLEAUX...');
        });
    });
});
