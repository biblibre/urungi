(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Urungi.dom = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const dom = {
        el,
        parse,
    };

    /*
     * el(tagName, children...)
     * el(tagName, attributes, children...)
     */
    function el (spec, ...args) {
        const attributes = (typeof args[0] === 'object' && !(args[0] instanceof Node))
            ? args.shift()
            : {};

        const ident = '[a-zA-Z][a-zA-Z0-9-]*';
        const re = new RegExp(`^(?<tagName>${ident})?(?<id>#${ident})?(?<classes>(?:\\.${ident})+)?$`);
        const result = re.exec(spec);
        if (result === null) {
            throw new Error('Invalid element spec: ' + spec);
        }

        const tagName = result.groups.tagName || 'div';
        const id = result.groups.id ? result.groups.id.substring(1) : undefined;
        const classes = result.groups.classes ? result.groups.classes.substring(1).split('.') : [];

        const elementCreationOptions = {};
        if ('is' in attributes) {
            elementCreationOptions.is = attributes.is;
        }
        const e = document.createElement(tagName, elementCreationOptions);

        if (id) {
            e.id = id;
        }
        if (classes.length > 0) {
            e.classList.add(...classes);
        }

        for (const [name, value] of Object.entries(attributes)) {
            e.setAttribute(name, value);
        }

        e.append(...args);

        return e;
    }

    function parse (html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content;
    }

    return dom;
}));
