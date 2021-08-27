/* global jsPlumb: false */
(function () {
    'use strict';

    angular.module('app.layers').controller('LayerViewController', LayerViewController);

    LayerViewController.$inject = ['$location', '$routeParams', '$scope', '$timeout', '$window', '$uibModal', 'gettextCatalog', 'api', 'notify', 'layerService'];

    function LayerViewController ($location, $routeParams, $scope, $timeout, $window, $uibModal, gettextCatalog, api, notify, layerService) {
        const vm = Object.assign(this, {
            datasources: [],
            initiated: false,
            save,
            addSQL,
            editSQL,
            editObject,
            deleteObject,
            addDatasetToLayer,
            selectElement,
            selectCollection,
            selectedCanvas,
            getDatasets,
            deleteSchemaElement,
            addFolder,
            editElement,
            allElementsAdded,
            promptAddAll,
            elementAdd,
            createComposedElement,
            toggleFolded,
            isInAJoin,
            selectedTab: 'elements',
        });

        activate();

        function activate () {
            if ($routeParams.layerID) {
                api.getLayer($routeParams.layerID).then(function (layer) {
                    vm.layer = layer;

                    getDatasources();

                    if (vm.layer.params) {
                        erDiagramInit();
                    } else {
                        vm.layer.params = {};
                        vm.layer.params.schema = [];
                    }
                });
            }
        }

        const endpointHoverStyle = {
            fill: '#000000',
            stroke: '#000000' // stroke: "#216477"
        };

        function _addEndpoints (toId, sourceAnchors, targetAnchors) {
            const jtkField = jsPlumb.getSelector('.jtk-field');
            instance.makeSource(jtkField, {
                filter: 'a',
                filterExclude: true,
                hoverPaintStyle: endpointHoverStyle,
                maxConnections: -1,
                anchor: ['LeftMiddle', 'RightMiddle']
            });

            instance.makeTarget(jtkField, {
                dropOptions: { hoverClass: 'hover' },
                anchor: ['LeftMiddle', 'RightMiddle']
            });
        }

        function setDraggable (selectors) {
            instance.draggable(document.querySelectorAll(selectors), {
                drag: function (e) {
                    jsPlumb.repaint($(this));
                },
                stop: function (event) {
                    if (typeof event.pos !== 'undefined') {
                        const id = event.el.id.replace('-parent', '');
                        const collection = vm.layer.params.schema.find(c => c.collectionID === id);
                        if (collection) {
                            collection.left = Math.max(0, event.pos[0]);
                            collection.top = Math.max(0, event.pos[1]);
                        }
                    }
                }
            });
        }

        function save () {
            const theLayer = vm.layer;

            try {
                calculateComponents();
            } catch (err) {
                notify.error(gettextCatalog.getString('An inconsistency exists in the layer and prevents saving the layer: {{message}}', { message: err.message }));
                return;
            }

            // clean up

            for (const collection in theLayer.params.schema) {
                for (const element in theLayer.params.schema[collection].elements) {
                    if (theLayer.params.schema[collection].elements[element].painted) {
                        theLayer.params.schema[collection].elements[element].painted = false;
                    }
                }
            }

            for (const join in theLayer.params.joins) {
                theLayer.params.joins[join].connection = undefined;
            }

            api.replaceLayer(theLayer).then(function () {
                $location.url('/layers');
            });
        }

        function getDatasources () {
            api.getDatasource(vm.layer.datasourceID).then(function (datasource) {
                vm.datasources = [datasource];
            });
        }

        function addSQL () {
            const modal = $uibModal.open({
                component: 'appLayerSqlModal',
                resolve: {
                    layer: () => vm.layer,
                    mode: () => 'add',
                },
            });

            modal.result.then(function (collection) {
                if (!vm.layer.params) { vm.layer.params = {}; }
                if (!vm.layer.params.schema) { vm.layer.params.schema = []; }

                vm.layer.params.schema.push(collection);

                setTimeout(function () {
                    for (const element in collection.elements) {
                        if (!collection.elements[element].painted) {
                            _addEndpoints(collection.elements[element].elementID, ['RightMiddle'], ['LeftMiddle']);
                        }
                    }
                    setDraggable('#' + collection.collectionID + '-parent');
                }, 100);

                erDiagramInit();
            }, function () {});
        }

        function editSQL () {
            const selectedCollection = vm.theSelectedElement;
            if (!selectedCollection.isSQL) {
                notify.error(gettextCatalog.getString('Cannot modify sql of an object which is not an sql request'));
                return;
            }

            const modal = $uibModal.open({
                component: 'appLayerSqlModal',
                resolve: {
                    layer: () => vm.layer,
                    mode: () => 'edit',
                    collection: () => selectedCollection,
                    sqlQuery: () => selectedCollection.sqlQuery,
                    name: () => selectedCollection.collectionName,
                },
            });

            modal.result.then(function (collection) {
                selectedCollection.sqlQuery = collection.sqlQuery;

                vm.layer.objects = vm.layer.objects.filter(function f (object) {
                    if (object.collectionID === selectedCollection.collectionID) {
                        return collection.elements.some(e => e.elementID === object.elementID);
                    }

                    if (Array.isArray(object.elements)) {
                        object.elements = object.elements.filter(f);
                    }

                    return true;
                });

                selectedCollection.elements = collection.elements;
            }, function () {});
        }

        function makeJoin (sourceID, targetID) {
            if (!vm.layer.params.joins) { vm.layer.params.joins = []; }

            let found = false;
            // First verify that the join does not exists
            for (const j in vm.layer.params.joins) {
                if (vm.layer.params.joins[j].sourceElementID === sourceID && vm.layer.params.joins[j].targetElementID === targetID) {
                    found = true;
                }
            }

            if (!found) {
                const join = {};
                join.joinID = 'J' + layerService.newID(vm.layer);

                for (const collection in vm.layer.params.schema) {
                    for (const element in vm.layer.params.schema[collection].elements) {
                        if (vm.layer.params.schema[collection].elements[element].elementID === sourceID) {
                            join.sourceElementID = vm.layer.params.schema[collection].elements[element].elementID;
                            join.sourceElementName = vm.layer.params.schema[collection].elements[element].elementName;
                            join.sourceCollectionID = vm.layer.params.schema[collection].collectionID;
                            join.sourceCollectionName = vm.layer.params.schema[collection].collectionName;
                        }

                        if (vm.layer.params.schema[collection].elements[element].elementID === targetID) {
                            join.targetElementID = vm.layer.params.schema[collection].elements[element].elementID;
                            join.targetElementName = vm.layer.params.schema[collection].elements[element].elementName;
                            join.targetCollectionID = vm.layer.params.schema[collection].collectionID;
                            join.targetCollectionName = vm.layer.params.schema[collection].collectionName;
                        }
                    }
                }

                if (join.sourceElementID && join.sourceCollectionID && join.targetElementID && join.targetCollectionID) {
                    join.joinType = 'default';
                    vm.layer.params.joins.push(join);
                }
            }
        }

        function deleteJoin (sourceID, targetID) {
            if (!vm.layer.params.joins) { vm.layer.params.joins = []; }

            // First verify that the join does not exists
            for (const j in vm.layer.params.joins) {
                if ((vm.layer.params.joins[j].sourceElementID === sourceID && vm.layer.params.joins[j].targetElementID === targetID) ||
                    (vm.layer.params.joins[j].sourceElementID === targetID && vm.layer.params.joins[j].targetElementID === sourceID)) {
                    const connections = instance.getAllConnections();

                    for (const c in connections) {
                        const source = connections[c].endpoints[0].getElement().id;
                        const target = connections[c].endpoints[1].getElement().id;

                        if ((target === sourceID && source === targetID) ||
                                (target === targetID && source === sourceID)) {
                            vm.layer.params.joins[j].connection = undefined;
                            instance.deleteConnection(connections[c]);
                        }
                    }

                    vm.layer.params.joins.splice(j, 1);
                }
            }
        }

        /**
         * The collections form a graph, and the joins are edges
         * A query can only contain elements from a single connected component,
         * otherwise it is impossible to join the collections
         *
         * @throws {Error} Will throw an error if it cannot calculate an element's component.
         */
        function calculateComponents () {
            if (!vm.layer.params.joins) {
                vm.layer.params.joins = [];
            }

            const collections = new Map(vm.layer.params.schema.map(c => [c.collectionID, c]));

            // Assign componentIdx to collection given in parameters and all
            // connected collections
            function visitComponent (collection, componentIdx) {
                collection.component = componentIdx;
                for (const join of vm.layer.params.joins) {
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

            forAllElements(function (element) {
                if (!element.isCustom) {
                    const collection = collections.get(element.collectionID);
                    element.component = collection.component;
                } else {
                    element.component = undefined;

                    try {
                        for (const el of layerUtils.getElementsUsedInCustomExpression(element.viewExpression, vm.layer)) {
                            if (el.isCustom) {
                                continue;
                            }
                            const collection = collections.get(el.collectionID);
                            const comp = collection.component;
                            if (element.component !== undefined && element.component !== comp) {
                                element.component = -1;
                                const msg = gettextCatalog.getString('One of the custom elements uses elements from tables which are not joined. This custom element cannot be fetched');
                                throw new Error(msg);
                            }

                            element.component = comp;
                        }
                    } catch (error) {
                        const message = gettextCatalog.getString('Failed to parse expression for element') + ' ' +
                            element.elementLabel + ' : ' + error.message;
                        throw new Error(message);
                    }
                }
            });
        }

        let instance;

        function erDiagramInit () {
            if (!vm.initiated) {
            // this timeout is here to give time to angular to create the element's divs'
                setTimeout(function () {
                    instance = jsPlumb.getInstance({
                        Connector: ['Flowchart', { cornerRadius: 5 }],
                        Endpoint: ['Dot', { radius: 2 }],
                        PaintStyle: {
                            strokeWidth: 4,
                            stroke: '#61B7CF',
                            outlineStroke: 'white',
                            outlineWidth: 2,
                        },
                        HoverPaintStyle: {
                            strokeWidth: 4,
                            stroke: '#216477',
                            outlineWidth: 2,
                            outlineStroke: 'white',
                        },
                        DragOptions: { cursor: 'pointer', zIndex: 2000 },
                        Container: 'canvas'
                    });

                    const rightJoinType = {
                        overlays: [
                            ['Label', { location: 0.88, label: '[' + gettextCatalog.getString('right') + ']', labelStyle: { cssClass: 'leftJoinType', color: '#000', font: 'bold 14px ER', fill: ' #fff no-repeat fixed center' } }]
                        ]

                    };

                    const leftJoinType = {
                        overlays: [
                            ['Label', { location: 0.10, label: '[' + gettextCatalog.getString('left') + ']', labelStyle: { cssClass: 'leftJoinType', color: '#000', font: 'bold 14px ER', fill: ' #fff no-repeat fixed center' } }]
                        ]
                    };

                    instance.registerConnectionType('right', rightJoinType);
                    instance.registerConnectionType('left', leftJoinType);

                    const endpointHoverStyle = {
                        fill: '#000000',
                        stroke: '#000000' // stroke: "#216477"
                    };

                    /*****************/
                    const jtkField = jsPlumb.getSelector('.jtk-field');
                    /*****************/
                    // suspend drawing and initialise.
                    instance.batch(function () {
                        instance.makeSource(jtkField, {
                            filter: 'a',
                            filterExclude: true,
                            hoverPaintStyle: endpointHoverStyle,
                            maxConnections: -1,
                            anchor: ['LeftMiddle', 'RightMiddle']
                        });

                        instance.makeTarget(jtkField, {
                            dropOptions: { hoverClass: 'hover' },
                            anchor: ['LeftMiddle', 'RightMiddle']
                        });

                        setDraggable('.window');

                        for (const j in vm.layer.params.joins) {
                            const c = instance.connect({ source: vm.layer.params.joins[j].targetElementID, target: vm.layer.params.joins[j].sourceElementID, id: vm.layer.params.joins[j].joinID });

                            if (vm.layer.params.joins[j].joinType === 'left') { c.setType('left'); }
                            if (vm.layer.params.joins[j].joinType === 'right') { c.setType('right'); }
                        }
                        /*****************/

                        //
                        // listen for clicks on connections, and offer to delete connections on click.
                        //
                        instance.bind('click', function (conn, originalEvent) {
                            for (const j in vm.layer.params.joins) {
                                if ((vm.layer.params.joins[j].sourceElementID === conn.sourceId && vm.layer.params.joins[j].targetElementID === conn.targetId) ||
                                 (vm.layer.params.joins[j].sourceElementID === conn.targetId && vm.layer.params.joins[j].targetElementID === conn.sourceId)) {
                                    vm.layer.params.joins[j].connection = conn;
                                    selectJoin(vm.layer.params.joins[j]);
                                }
                            }

                            originalEvent.stopPropagation();
                            conn.setPaintStyle({ stroke: '#000', strokeWidth: 4 });
                            conn.selected = true;
                        });

                        instance.bind('beforeDrop', function (info) {
                        // Here we can control if we are going to accept the join or not...
                            return true;
                        });

                        instance.bind('connectionDetached', function (info, originalEvent) {
                            // deleteJoin(info.sourceId, info.targetId);
                        });

                        instance.bind('connection', function (info, originalEvent) {
                            makeJoin(info.sourceId, info.targetId);
                        });
                    });

                    jsPlumb.fire('jsPlumbDemoLoaded', instance);

                    vm.instance = instance;
                }, 100);

                vm.initiated = true;
            }
        };

        function selectJoin (join) {
            unSelect();
            vm.selectedItem = 'join';
            vm.selectedTab = 'properties';
            vm.theSelectedElement = join;
            $scope.$apply();
        }

        function isInAJoin (element) {
            if (!vm.layer.params.joins) {
                return false;
            }
            for (const j of vm.layer.params.joins) {
                if (j.sourceCollectionID === element.collectionID && j.sourceElementID === element.elementID) {
                    return true;
                }
                if (j.targetCollectionID === element.collectionID && j.targetElementID === element.elementID) {
                    return true;
                }
            }
            return false;
        };

        function toggleFolded (collection) {
            collection.folded = !collection.folded;
            setTimeout(function () {
                const collectionObject = $('#' + collection.collectionID + '-parent')[0];
                instance.recalculateOffsets(collectionObject);
                instance.repaintEverything();
            }, 100);
        };

        function createComposedElement () {
            try {
                calculateComponents();
            } catch (err) {
                notify.error(gettextCatalog.getString('An inconsistency exists in the layer and prevents creating new elements: {{message}}', { message: err.message }));
                return;
            }

            const element = {
                isCustom: true,
                elementID: layerService.newID(vm.layer),
                viewExpression: '',
                elementName: 'comp',
            };

            const modal = $uibModal.open({
                component: 'appLayerElementModal',
                resolve: {
                    element: () => element,
                    layer: () => vm.layer,
                },
            });

            modal.result.then(function (modifiedElement) {
                angular.copy(modifiedElement, element);
                if (!vm.layer.objects) {
                    vm.layer.objects = [];
                }
                vm.layer.objects.push(element);
            }, function () {});
        };

        function elementAdd (element) {
            const modal = $uibModal.open({
                component: 'appLayerElementModal',
                resolve: {
                    element: () => element,
                    layer: () => vm.layer,
                },
            });

            modal.result.then(function (modifiedElement) {
                angular.copy(modifiedElement, element);
                if (!vm.layer.objects) {
                    vm.layer.objects = [];
                }
                vm.layer.objects.push(element);
            }, function () {});
        };

        function promptAddAll (collection) {
            const modal = $uibModal.open({
                component: 'appLayerAddAllModal',
                resolve: {
                    collection: () => collection,
                },
            });

            modal.result.then(function () {
                for (const el of collection.elements) {
                    if (!el.elementRole) {
                        el.elementRole = 'dimension';
                        vm.layer.objects.push(el);
                    }
                }
            }, function () {});
        };

        function allElementsAdded (collection) {
            for (const el of collection.elements) {
                if (!el.elementRole) {
                    return false;
                }
            }
            return true;
        };

        function editElement (element) {
            const modal = $uibModal.open({
                component: 'appLayerElementModal',
                resolve: {
                    element: () => element,
                    layer: () => vm.layer,
                },
            });

            modal.result.then(function (modifiedElement) {
                angular.copy(modifiedElement, element);
            }, function () {});
        };

        function addFolder () {
            const elementID = 'F' + layerService.newID(vm.layer);

            const element = {};
            element.elementLabel = gettextCatalog.getString('my folder');
            element.elementRole = 'folder';
            element.elementID = elementID;
            element.editing = true;
            element.elements = [];
            vm.layer.objects.push(element);
        };

        function deleteSchemaElement (element) {
            const elementID = element.elementID;

            for (const s in vm.layer.params.schema) {
                for (const e in vm.layer.params.schema[s].elements) {
                    if (vm.layer.params.schema[s].elements[e].elementID === elementID) {
                        delete vm.layer.params.schema[s].elements[e].elementRole;
                    }
                }
            }

            checkfordelete(vm.layer.objects, elementID);
        };

        function checkfordelete (elements, elementID) {
            for (const i in elements) {
                if (elements[i].elementID === elementID) {
                    unassingElementRole(elements[i]);
                    elements.splice(i, 1);
                    return;
                } else {
                    if (elements[i].elements) {
                        checkfordelete(elements[i].elements, elementID);
                    }
                }
            }
        }

        function unassingElementRole (element) {
            const elementID = element.elementID;

            for (const s in vm.layer.params.schema) {
                for (const e in vm.layer.params.schema[s].elements) {
                    if (vm.layer.params.schema[s].elements[e].elementID === elementID) {
                        delete vm.layer.params.schema[s].elements[e].elementRole;
                    }
                }
            }

            if (element.elements) {
                if (element.elements.length > 0) {
                    for (const i in element.elements) {
                        unassingElementRole(element.elements[i]);
                    }
                }
            }
        }

        // Drag & drop elements
        vm.onDrag = false;
        vm.sortableOptions = {
            connectWith: '.schema-container',
            update: function (e, ui) {

            },
            start: function (e, ui) {
                $scope.$apply(function () {
                    vm.onDrag = true;
                });
            },
            stop: function (e, ui) {
                $scope.$apply(function () {
                    vm.onDrag = false;
                });
            }
        };

        function deleteCollection (collection) {
            const theCollectionID = collection.collectionID;

            deleteAllCollectionJoins(theCollectionID);

            deleteAllCollectionElements(vm.layer.objects, theCollectionID);

            // delete all joins related to this collection

            for (const c in vm.layer.params.schema) {
                if (vm.layer.params.schema[c].collectionID === theCollectionID) {
                    for (const element in vm.layer.params.schema[c].elements) {
                        instance.deleteEndpoint(vm.layer.params.schema[c].elements[element].elementID);
                        instance.deleteEndpoint(vm.layer.params.schema[c].elements[element].elementID);
                    }
                    vm.layer.params.schema.splice(c, 1);
                }
            }

            vm.selectedCollection = undefined;
        };

        function deleteAllCollectionJoins (collectionID) {
            const joinsToDelete = [];

            for (const o in vm.layer.params.schema) {
                if (vm.layer.params.schema[o].collectionID === collectionID) {
                    for (const e in vm.layer.params.schema[o].elements) {
                        for (const j in vm.layer.params.joins) {
                            if ((vm.layer.params.joins[j].sourceElementID === vm.layer.params.schema[o].elements[e].elementID) ||
                                                (vm.layer.params.joins[j].targetElementID === vm.layer.params.schema[o].elements[e].elementID)) {
                                joinsToDelete.push({ sourceElementID: vm.layer.params.joins[j].sourceElementID, targetElementID: vm.layer.params.joins[j].targetElementID });
                            }
                        }
                    }
                }
            }

            for (const jtd in joinsToDelete) {
                deleteJoin(joinsToDelete[jtd].sourceElementID, joinsToDelete[jtd].targetElementID);
            }
        }

        function deleteAllCollectionElements (elements, collectionID) {
            for (let e = elements.length - 1; e >= 0; e--) {
                if (elements[e].elements) { deleteAllCollectionElements(elements[e].elements, collectionID); }

                if (elements[e].collectionID === collectionID) {
                    elements.splice(e, 1);
                }
            }
        }

        function getDatasets (datasource) {
            if (!datasource.loading) {
                datasource.loading = true;
                api.getDatasourceCollections(datasource._id).then(function (data) {
                    datasource.loading = false;
                    datasource.entities = data.data;
                }, function (err) {
                    notify.error(err.message);
                    datasource.loading = false;
                });
            }
        };

        function selectedCanvas (event) {
            unSelect();
            vm.selectedItem = 'layer';
            vm.theSelectedElement = vm.layer;
            vm.selectedTab = 'properties';
        };

        function unSelect () {
            for (const s in vm.selectedElements) {
                $('#' + vm.selectedElements[s]).removeClass('selectedElement');
            }
            const connections = instance.getAllConnections();

            for (const c in connections) {
                // connections[c].setType("default"); esto cambia el tipo left right, es solo el color lo que queremos cambiar
                connections[c].setPaintStyle({ stroke: '#61B7CF', strokeWidth: 4 });
                connections[c].selected = false;
            }

            $('#' + vm.selectedTargetId).css({ backgroundColor: '#d5d5d5' });
            $('#' + vm.selectedSourceId).css({ backgroundColor: '#d5d5d5' });
            vm.selectedTargetId = undefined;
            vm.selectedSourceId = undefined;
            vm.selectedConnection = undefined;
            vm.selectedElements = [];
            vm.selectedItem = '';
        }

        function selectCollection (theCollection, event) {
            event.stopPropagation();
            if (!event.shiftKey || vm.selectedItem !== 'collection') {
                unSelect();
            }

            vm.selectedItem = 'collection';
            vm.theSelectedElement = theCollection;
            // if (vm.joinMode)
            //  collectionHighliter(theCollection.collectionID);

            if (vm.selectedElements) {
                if (vm.selectedElements.indexOf(theCollection.collectionID) === -1) { vm.selectedElements.push(theCollection.collectionID); }
            }

            setSelectedElements();
        }

        function selectElement (theElement, event) {
            event.stopPropagation();
            unSelect();
            vm.selectedItem = 'element';
            vm.theSelectedElement = theElement;

            if (vm.selectedElements) {
                if (vm.selectedElements.indexOf(theElement.elementID) === -1) { vm.selectedElements.push(theElement.elementID); }
            }

            setSelectedElements();
        };

        function setSelectedElements () {
            for (const s in vm.selectedElements) {
                $('#' + vm.selectedElements[s]).addClass('selectedElement');
            }
            vm.selectedTab = 'properties';
        }

        function addDatasetToLayer (datasourceID, collectionName) {
            if (vm.layer.datasourceID === datasourceID) {
                api.getDatasourceCollection(datasourceID, collectionName).then(function (collection) {
                    collection.collectionID = 'C' + layerService.newID(vm.layer);

                    for (const element of collection.elements) {
                        element.elementID = layerService.newID(vm.layer);
                        element.collectionID = collection.collectionID;
                        element.collectionName = collection.collectionName;
                    }

                    if (!vm.layer.params) { vm.layer.params = {}; }
                    if (!vm.layer.params.schema) { vm.layer.params.schema = []; }

                    vm.layer.params.schema.push(collection);

                    setTimeout(function () {
                        for (const element in collection.elements) {
                            if (!collection.elements[element].painted) {
                                _addEndpoints(collection.elements[element].elementID, ['RightMiddle'], ['LeftMiddle']);
                            }
                        }
                        setDraggable('#' + collection.collectionID + '-parent');
                    }, 100);

                    erDiagramInit();
                });
            } else {
                notify.error(gettextCatalog.getString('Datasource must be the same for all entities'));
            }
        }

        function deleteObject (object, objectType) {
            if (vm.selectedItem === 'join') {
                deleteJoin(vm.theSelectedElement.sourceElementID, vm.theSelectedElement.targetElementID);
                unSelect();
            }
            if (vm.selectedItem === 'collection') {
                deleteCollection(vm.theSelectedElement);
                unSelect();
            }
        }

        function editObject () {
            if (vm.selectedItem === 'collection' && vm.theSelectedElement.isSQL) {
                vm.editSQL();
            }
        }

        function forAllElements (f) {
            function explore (elementList) {
                for (const el of elementList) {
                    if (el.elements) {
                        explore(el.elements);
                    } else {
                        f(el);
                    }
                }
            }

            explore(vm.layer.objects);
        }
    }
})();
