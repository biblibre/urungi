/* global define: false */
/* eslint-env browser */
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.layerUtils = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    const getElementsUsedInCustomExpression = function (expression, layer) {
        const elements = [];
        const re = /#([a-z0-9_]+)/g;
        let found;

        while ((found = re.exec(expression)) !== null) {
            const elementID = found[1];
            let element;
            for (const collection of layer.params.schema) {
                const el = collection.elements.find(e => e.elementID === elementID);
                if (el !== undefined) {
                    element = el;
                    break;
                }
            }

            if (element === undefined) {
                throw new Error('Error in custom expression, element not found: #' + elementID);
            }
            if (!elements.find(e => e.elementID === elementID)) {
                elements.push(element);
            }
        }

        return elements;
    };

    function newID (layer) {
        // FIXME idCounter is not persistent
        const counter = ((layer.idCounter || 0) + 1) % (26 ** 2);
        layer.idCounter = counter;
        let uid = 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(counter / 26)) +
            'abcdefghijklmnopqrstuvwxyz'.charAt(counter % 26);
        const rand = Math.floor(Math.random() * 676);
        uid += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(rand / 26)) +
        'abcdefghijklmnopqrstuvwxyz'.charAt(rand % 26);
        // I couldn't decide between using a counter to guarantee unique ids in theory,
        // or using random characters to be certain the ids are very different from each other in practice
        // so I ended up doing both.

        return uid;
    }

    return {
        getElementsUsedInCustomExpression,
        newID,
    };
}));
