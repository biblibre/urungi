const { Liquid } = require('liquidjs');
const liquidExpand = require('../../src/liquid-plugin/expand.js');

describe('liquid plugin expand', function () {
    let liquid;
    beforeAll(function () {
        liquid = new Liquid();
        liquid.plugin(liquidExpand);
    });

    describe('with no parameters', function () {
        test('it should not expand anything', function () {
            const template = '{{ "Hello, {{name}}" | expand }}';
            const output = liquid.parseAndRenderSync(template, { name: 'Jane' });
            expect(output).toBe('Hello, {{name}}');
        });
    });

    describe('with one parameter', function () {
        test('it should expand only parameters given', function () {
            const template = '{{ "Hello, {{title}} {{name}}" | expand: name: "John" }}';
            const output = liquid.parseAndRenderSync(template, { name: 'Jane' });
            expect(output).toBe('Hello, {{title}} John');
        });

        test('it should expand all occurrence of parameters given', function () {
            const template = '{{ "Hello, {{name}} {{name}}" | expand: name: "John" }}';
            const output = liquid.parseAndRenderSync(template, { name: 'Jane' });
            expect(output).toBe('Hello, John John');
        });
    });

    describe('with several parameters', function () {
        test('it should expand only parameters given', function () {
            const template = '{{ "Hello, {{title}} {{name}} {{nothing}}" | expand: name: "John", title: "Mr" }}';
            const output = liquid.parseAndRenderSync(template, { name: 'Jane' });
            expect(output).toBe('Hello, Mr John {{nothing}}');
        });

        test('it should expand all occurrences of parameters given', function () {
            const template = '{{ "Hello, {{title}} {{title}} {{name}} {{name}}" | expand: name: "John", title: "Mr" }}';
            const output = liquid.parseAndRenderSync(template, { name: 'Jane' });
            expect(output).toBe('Hello, Mr Mr John John');
        });
    });
});
