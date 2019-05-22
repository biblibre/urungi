/* global define: false */
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
        const re = /#([a-z0-9]+)/g;
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

    return {
        getElementsUsedInCustomExpression: getElementsUsedInCustomExpression,
    };
}));
