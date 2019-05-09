module.exports = {
    up (db) {
        return db.collection('wst_Layers').find({}).forEach(function (layer) {
            if (!layer.params || !layer.params.schema) {
                return;
            }

            const collections = new Map(layer.params.schema.map(c => [c.collectionID, c]));

            function visitComponent (collection, componentIdx) {
                collection.component = componentIdx;
                for (const join of layer.params.joins) {
                    let c;
                    if (join.sourceCollectionID === collection.collectionID) {
                        c = collections.get(join.targetCollectionID);
                    } else if (join.targetCollectionID === collection.collectionID) {
                        c = collections.get(join.sourceCollectionID);
                    }

                    if (c && !c.component) {
                        visitComponent(c, componentIdx);
                    }
                }
            }

            let componentIdx = 1;
            collections.forEach(c => { c.component = 0; });
            collections.forEach(c => {
                if (!c.component) {
                    visitComponent(c, componentIdx);
                    componentIdx++;
                }
            });

            function fixElementComponent (element) {
                if (element.isCustom) {
                    const re = /#([a-z0-9]+)/g;
                    let found;

                    while ((found = re.exec(element.viewExpression)) !== null) {
                        const elementID = found[1];
                        for (const collection of layer.params.schema) {
                            const el = collection.elements.find(e => e.elementID === elementID);
                            if (el !== undefined) {
                                element.component = collection.component;
                                break;
                            }
                        }
                    }

                    if (!element.component) {
                        console.error('Error: unable to find a component for the following custom element:');
                        console.error(element);

                        element.component = -1;
                    }
                } else {
                    const component = collections.get(element.collectionID).component;
                    element.component = component;
                }
            }

            function fixObjects (objects) {
                for (const object of objects) {
                    if (object.elements) {
                        fixObjects(object.elements);
                    } else {
                        fixElementComponent(object);
                        delete object.arguments;
                        delete object.tempArguments;
                    }
                }
            }

            fixObjects(layer.objects);

            delete layer.customElements;

            return db.collection('wst_Layers').replaceOne({ _id: layer._id }, layer);
        });
    },

    down (db) {
    }
};
