/* global jsPlumb: false */
(function () {
    'use strict';

    angular.module('app').controller('layerCtrl', LayerController);

    LayerController.$inject = ['$location', '$routeParams', '$scope', '$timeout', '$window', '$uibModal', 'gettextCatalog', 'api', 'notify'];

    function LayerController ($location, $routeParams, $scope, $timeout, $window, $uibModal, gettextCatalog, api, notify) {
        $scope.layerModal = 'partials/layer/layerModal.html';
        $scope.sqlModal = 'partials/layer/sqlModal.html';
        $scope.elementModal = 'partials/layer/elementModal.html';
        $scope.setupModal = 'partials/layer/setupModal.html';
        $scope.ReadOnlyDataSourceSelector = false;
        $scope.items = [];
        $scope.datasources = [];
        $scope.tab = { active: 1 };

        $scope.customElements = {
            elements: [],
            collectionLabel: 'Custom elements',
        };

        $scope.initiated = false;

        $scope.elementTypes = [
            { name: 'object', value: 'object' },
            { name: 'string', value: 'string' },
            { name: 'number', value: 'number' },
            { name: 'boolean', value: 'boolean' },
            { name: 'date', value: 'date' },
            { name: 'array', value: 'array' }
        ];

        $scope.numberDefaultAggregation = [
            { name: 'raw', value: 'value' },
            { name: 'SUM', value: 'sum' },
            { name: 'AVG', value: 'avg' },
            { name: 'MIN', value: 'min' },
            { name: 'MAX', value: 'max' },
            { name: 'COUNT', value: 'count' }
        ];
        $scope.stringDefaultAggregation = [
            { name: 'raw', value: 'value' },
            { name: 'COUNT', value: 'count' }
        ];

        $scope.rootItem = { elementLabel: '', elementRole: 'root', elements: [] };

        $scope.deletingJoin = false;

        if ($location.hash() === 'intro') {
            $timeout(function () { $scope.showIntro(); }, 1000);
        }

        $scope.IntroOptions = {
            // IF width > 300 then you will face problems with mobile devices in responsive mode
            steps: [

            ]
        };

        const connectorPaintStyle = {
            strokeWidth: 4,
            stroke: '#61B7CF',
            joinstyle: 'round',
            outlineStroke: 'white',
            outlineWidth: 2
        };
        const connectorHoverStyle = {
            strokeWidth: 4,
            stroke: '#216477',
            outlineWidth: 2,
            outlineStroke: 'white'
        };
        const endpointHoverStyle = {
            fill: '#000000',
            stroke: '#000000' // stroke: "#216477"
        };

        // the definition of source endpoints (the small blue ones)
        const sourceEndpoint = {
            endpoint: 'Dot',
            paintStyle: {
                stroke: '#7AB02C',
                fill: 'transparent',
                radius: 6,
                strokeWidth: 3
            },
            isSource: true,
            connector: ['Flowchart', { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true }],
            connectorStyle: connectorPaintStyle,
            hoverPaintStyle: endpointHoverStyle,
            connectorHoverStyle: connectorHoverStyle,
            maxConnections: -1,
            dragOptions: {},
            overlays: [
                ['Label', {
                    location: [0.5, 1.5],
                    label: '',
                    cssClass: 'endpointSourceLabel'
                }]
            ]
        };

        // the definition of target endpoints (will appear when the user drags a connection)
        const targetEndpoint = {
            endpoint: 'Dot',
            paintStyle: { fill: '#7AB02C', radius: 6 },
            hoverPaintStyle: endpointHoverStyle,
            maxConnections: -1,
            dropOptions: { hoverClass: 'hover', activeClass: 'active' },
            isTarget: true,
            overlays: [
                ['Label', { location: [0.5, -0.5], label: '', cssClass: 'endpointTargetLabel' }]
            ]
        };

        const _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
            const newEndpoints = [];
            for (let i = 0; i < sourceAnchors.length; i++) {
                const sourceUUID = toId + sourceAnchors[i];

                const nedp = instance.addEndpoint(toId, sourceEndpoint, {
                    anchor: sourceAnchors[i], uuid: sourceUUID
                });
                newEndpoints.push(nedp.getUuid());
            }
            for (let j = 0; j < targetAnchors.length; j++) {
                const targetUUID = toId + targetAnchors[j];

                const nedp = instance.addEndpoint(toId, targetEndpoint, {
                    anchor: targetAnchors[j], uuid: targetUUID
                });
                newEndpoints.push(nedp.getUuid());
            }
            return newEndpoints;
        };

        function setDraggable (targetID) {
            instance.draggable(document.querySelectorAll(targetID), {

                drag: function (e) {
                    // Your code comes here
                    jsPlumb.repaint($(this));
                },
                stop: function (event, ui) {
                    if (typeof ui.position !== 'undefined') {
                        let pos_x = ui.position.left;
                        let pos_y = ui.position.top;

                        if (pos_x < 0) { pos_x = 0; }

                        if (pos_y < 0) { pos_y = 0; }

                        const parentId = $(this).attr('id');

                        const id = parentId.replace('-parent', '');

                        for (const c in $scope._Layer.params.schema) {
                            if ($scope._Layer.params.schema[c].collectionID === id) {
                                $scope._Layer.params.schema[c].left = pos_x;
                                $scope._Layer.params.schema[c].top = pos_y;
                            }
                        }
                    }
                }
            });
        }

        $scope.view = function () {
            if ($routeParams.layerID) {
                api.getLayer($routeParams.layerID).then(function (layer) {
                    $scope._Layer = layer;
                    $scope.rootItem.elements = $scope._Layer.objects;

                    $scope.forAllElements((element) => {
                        if (element.isCustom) {
                            $scope.customElements.elements.push(element);
                        }
                    });

                    getDatasources();

                    if ($scope._Layer.params) {
                        $scope.erDiagramInit();
                    } else {
                        $scope._Layer.params = {};
                        $scope._Layer.params.schema = [];
                    }
                });
            };
        };

        $scope.save = function () {
            const theLayer = $scope._Layer;

            $scope.calculateComponents();

            // clean up

            for (const collection in theLayer.params.schema) {
                for (const element in theLayer.params.schema[collection].elements) {
                    if (theLayer.params.schema[collection].elements[element].painted) { theLayer.params.schema[collection].elements[element].painted = false; }
                }
            }

            for (const join in theLayer.params.joins) {
                theLayer.params.joins[join].connection = undefined;
            }

            api.replaceLayer(theLayer).then(function () {
                $location.url('/layers');
            });
        };

        function getDatasources () {
            api.getDatasource($scope._Layer.datasourceID).then(function (datasource) {
                $scope.datasources = [datasource];
            });
        };

        $scope.addSQL = function () {
            $scope.temporarySQLCollection = {};
            $scope.temporarySQLCollection.mode = 'add';
            $('#sqlModal').modal('show');
        };

        $scope.editSQL = function () {
            const selectedCollection = $scope.theSelectedElement;
            if (!selectedCollection.isSQL) {
                notify.error(gettextCatalog.getString('Cannot modify sql of an object which is not an sql request'));
                return;
            }

            $scope.temporarySQLCollection = {};
            $scope.temporarySQLCollection.mode = 'edit';
            $scope.temporarySQLCollection.sqlQuery = selectedCollection.sqlQuery;
            $scope.temporarySQLCollection.name = selectedCollection.collectionName;

            $scope.ReadOnlyDataSourceSelector = true;

            $scope.newSQLCollection = undefined;
            $('#sqlModal').modal('show');
        };

        $scope.setSelectedEntity = function (entity) {
            if ($scope.selectedEntities.indexOf(entity) === -1) {
                $scope.selectedEntities.push(entity);
            } else {
                const index = $scope.selectedEntities.indexOf(entity);
                $scope.selectedEntities.splice(index, 1);
            }
        };

        $scope.addSqlToLayer = function () {
            delete $scope.temporarySQLCollection.error;

            api.getSqlQueryCollection($scope._Layer.datasourceID, $scope.temporarySQLCollection).then(function (collection) {
                collection.collectionID = 'C' + $scope.newID();

                for (const element of collection.elements) {
                    element.elementID = $scope.newID();
                    element.collectionID = collection.collectionID;
                    element.collectionName = collection.collectionName;
                }

                if (!$scope._Layer.params) { $scope._Layer.params = {}; }
                if (!$scope._Layer.params.schema) { $scope._Layer.params.schema = []; }

                $scope._Layer.params.schema.push(collection);

                setTimeout(function () {
                    for (const element in collection.elements) {
                        if (!collection.elements[element].painted) {
                            _addEndpoints(collection.elements[element].elementID, ['RightMiddle'], ['LeftMiddle']);
                        }
                    }
                    setDraggable('#' + collection.collectionID + '-parent');
                }, 100);

                $('#sqlModal').modal('hide');
                $scope.erDiagramInit();
            }, function (err) {
                $scope.temporarySQLCollection.error = err.message;
            });
        };

        $scope.saveSQLChanges = function () {
            delete $scope.temporarySQLCollection.error;

            api.getSqlQueryCollection($scope._Layer.datasourceID, $scope.temporarySQLCollection).then(function (newCol) {
                const currentCol = $scope.theSelectedElement;

                for (const e in newCol.elements) {
                    newCol.elements[e].collectionID = currentCol.collectionID;
                    newCol.elements[e].collectionName = currentCol.collectionName;
                }

                $scope.elementMatch = {};
                $scope.lostElements = [];
                $scope.newElements = [];
                $scope.matchedElements = [];

                for (const e1 of newCol.elements) {
                    $scope.elementMatch[e1.elementID] = null;
                    for (const e2 of currentCol.elements) {
                        if (e1.elementName === e2.elementName) {
                            $scope.elementMatch[e1.elementID] = e2;
                            $scope.matchedElements.push(e2);
                        }
                    }
                }

                for (const el of currentCol.elements) {
                    if ($scope.matchedElements.indexOf(el) < 0) {
                        $scope.lostElements.push(el);
                    }
                }

                for (const el of newCol.elements) {
                    if (!$scope.elementMatch[el.elementID]) {
                        $scope.newElements.push(el);
                    }
                }

                $scope.newSQLCollection = newCol;
            }, function (err) {
                $scope.temporarySQLCollection.error = err.message;
            });
        };

        $scope.confirmSQLChanges = function () {
            $scope.theSelectedElement.sqlQuery = $scope.newSQLCollection.sqlQuery;

            for (const el of $scope.newSQLCollection.elements) {
                if ($scope.elementMatch[el.elementID]) {
                    const oldElement = $scope.elementMatch[el.elementID];
                    el.elementID = oldElement.elementID;
                    el.elementRole = oldElement.elementRole;
                    el.elementLabel = oldElement.elementLabel;
                }
            }

            const deletedIndexes = [];

            for (const i in $scope._Layer.objects) {
                const e1 = $scope._Layer.objects[i];
                if (e1.collectionID === $scope.theSelectedElement.collectionID) {
                    for (const e2 of $scope.lostElements) {
                        if (e2.elementID === e1.elementID) {
                            deletedIndexes.push(i);
                            break;
                        }
                    }
                }
            }

            for (let k = deletedIndexes.length - 1; k >= 0; k--) {
                // Iterate backwards so the indexes to be removed don't change as we remove the ones before
                $scope._Layer.objects.splice(deletedIndexes[k], 1);
            }

            $scope.theSelectedElement.elements = $scope.newSQLCollection.elements;

            $scope.newSQLElements = undefined;
            $('#sqlModal').modal('hide');
        };

        function makeJoin (sourceID, targetID) {
            if (!$scope._Layer.params.joins) { $scope._Layer.params.joins = []; }

            let found = false;
            // First verify that the join does not exists
            for (const j in $scope._Layer.params.joins) {
                if ($scope._Layer.params.joins[j].sourceElementID === sourceID && $scope._Layer.params.joins[j].targetElementID === targetID) {
                    found = true;
                }
            }

            if (!found) {
                const join = {};
                join.joinID = 'J' + $scope.newID();

                for (const collection in $scope._Layer.params.schema) {
                    for (const element in $scope._Layer.params.schema[collection].elements) {
                        if ($scope._Layer.params.schema[collection].elements[element].elementID === sourceID) {
                            join.sourceElementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                            join.sourceElementName = $scope._Layer.params.schema[collection].elements[element].elementName;
                            join.sourceCollectionID = $scope._Layer.params.schema[collection].collectionID;
                            join.sourceCollectionName = $scope._Layer.params.schema[collection].collectionName;
                        }

                        if ($scope._Layer.params.schema[collection].elements[element].elementID === targetID) {
                            join.targetElementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                            join.targetElementName = $scope._Layer.params.schema[collection].elements[element].elementName;
                            join.targetCollectionID = $scope._Layer.params.schema[collection].collectionID;
                            join.targetCollectionName = $scope._Layer.params.schema[collection].collectionName;
                        }
                    }
                }

                if (join.sourceElementID && join.sourceCollectionID && join.targetElementID && join.targetCollectionID) {
                    join.joinType = 'default';
                    $scope._Layer.params.joins.push(join);
                }
            }
        }

        function deleteJoin (sourceID, targetID) {
            if (!$scope._Layer.params.joins) { $scope._Layer.params.joins = []; }

            // First verify that the join does not exists
            for (const j in $scope._Layer.params.joins) {
                if (($scope._Layer.params.joins[j].sourceElementID === sourceID && $scope._Layer.params.joins[j].targetElementID === targetID) ||
                    ($scope._Layer.params.joins[j].sourceElementID === targetID && $scope._Layer.params.joins[j].targetElementID === sourceID)) {
                    const connections = instance.getAllConnections();

                    for (const c in connections) {
                        const source = connections[c].endpoints[0].getElement().id;
                        const target = connections[c].endpoints[1].getElement().id;

                        if ((target === sourceID && source === targetID) ||
                                (target === targetID && source === sourceID)) {
                            $scope._Layer.params.joins[j].connection = undefined;
                            $scope.instance.deleteConnection(connections[c]);
                        }
                    }

                    $scope._Layer.params.joins.splice(j, 1);
                }
            }
        }

        /*
         * The collections form a graph, and the joins are edges
         * A query can only contain elements from a single connected component,
         * otherwise it is impossible to join the collections
         */
        $scope.calculateComponents = function () {
            if (!$scope._Layer.params.joins) {
                $scope._Layer.params.joins = [];
            }

            const collections = new Map($scope._Layer.params.schema.map(c => [c.collectionID, c]));

            // Assign componentIdx to collection given in parameters and all
            // connected collections
            function visitComponent (collection, componentIdx) {
                collection.component = componentIdx;
                for (const join of $scope._Layer.params.joins) {
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

            $scope.forAllElements(function (element) {
                if (!element.isCustom) {
                    const collection = collections.get(element.collectionID);
                    element.component = collection.component;
                } else {
                    element.component = undefined;

                    try {
                        for (const el of layerUtils.getElementsUsedInCustomExpression(element.viewExpression, $scope._Layer)) {
                            if (el.isCustom) {
                                continue;
                            }
                            const collection = collections.get(el.collectionID);
                            const comp = collection.component;
                            if (element.component !== undefined && element.component !== comp) {
                                element.component = -1;
                                const msg = gettextCatalog.getString('One of the custom elements uses elements from tables which are not joined. This custom element cannot be fetched');
                                notify.notice(msg);
                                return;
                            }
                            element.component = comp;
                        }
                    } catch (error) {
                        const message = gettextCatalog.getString('Failed to parse expression for element') + ' ' +
                            element.elementLabel + ' : ' + error.message;
                        notify.notice(message);
                    }
                }
            });
        };

        let instance;

        $scope.erDiagramInit = function () {
            if (!$scope.initiated) {
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

                    const init = function (connection) {
                    // connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
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

                        // listen for new connections; initialise them the same way we initialise the connections at startup.
                        instance.bind('connection', function (connInfo, originalEvent) {
                            init(connInfo.connection);
                        });

                        instance.draggable(document.querySelectorAll('.window'), {
                            drag: function (e) {
                                jsPlumb.repaint($(this));
                            },
                            stop: function (event) {
                                if (typeof event.pos !== 'undefined') {
                                    let pos_x = event.pos[0];
                                    let pos_y = event.pos[1];

                                    if (pos_x < 0) { pos_x = 0; }

                                    if (pos_y < 0) { pos_y = 0; }

                                    const parentId = event.el.getAttribute('id');

                                    const id = parentId.replace('-parent', '');

                                    for (const c in $scope._Layer.params.schema) {
                                        if ($scope._Layer.params.schema[c].collectionID === id) {
                                            $scope._Layer.params.schema[c].left = pos_x;
                                            $scope._Layer.params.schema[c].top = pos_y;
                                        }
                                    }
                                }
                            }
                        });

                        for (const j in $scope._Layer.params.joins) {
                            const c = instance.connect({ source: $scope._Layer.params.joins[j].targetElementID, target: $scope._Layer.params.joins[j].sourceElementID, id: $scope._Layer.params.joins[j].joinID });

                            if ($scope._Layer.params.joins[j].joinType === 'left') { c.setType('left'); }
                            if ($scope._Layer.params.joins[j].joinType === 'right') { c.setType('right'); }
                        }
                        /*****************/

                        //
                        // listen for clicks on connections, and offer to delete connections on click.
                        //
                        instance.bind('click', function (conn, originalEvent) {
                            for (const j in $scope._Layer.params.joins) {
                                if (($scope._Layer.params.joins[j].sourceElementID === conn.sourceId && $scope._Layer.params.joins[j].targetElementID === conn.targetId) ||
                                 ($scope._Layer.params.joins[j].sourceElementID === conn.targetId && $scope._Layer.params.joins[j].targetElementID === conn.sourceId)) {
                                    $scope._Layer.params.joins[j].connection = conn;
                                    selectJoin($scope._Layer.params.joins[j]);
                                }
                            }

                            originalEvent.stopPropagation();
                            conn.setPaintStyle({ stroke: '#000', strokeWidth: 4 });
                            conn.selected = true;
                        });

                        instance.bind('connectionDrag', function (connection) {

                        });

                        instance.bind('dblclick', function (connection, originalEvent) {

                        });

                        instance.bind('click', function (connection, originalEvent) {

                        });

                        instance.bind('beforeDrop', function (info) {
                        // Here we can control if we are going to accept the join or not...
                            return true;
                        });

                        instance.bind('connectionMoved', function (params) {

                        });

                        instance.bind('connectionDetached', function (info, originalEvent) {
                            deleteJoin(info.sourceId, info.targetId);
                        });

                        instance.bind('connection', function (info, originalEvent) {
                            makeJoin(info.sourceId, info.targetId);
                        });
                    });

                    jsPlumb.fire('jsPlumbDemoLoaded', instance);

                    $scope.instance = instance;
                }, 100);

                $scope.initiated = true;
            }
        };

        function selectJoin (join) {
            unSelect();
            $scope.selectedItem = 'join';
            $scope.tabs.selected = 'properties';
            $scope.theSelectedElement = join;
            $scope.$apply();
        }

        $scope.isInAJoin = function (element) {
            if (!$scope._Layer.params.joins) {
                return false;
            }
            for (const j of $scope._Layer.params.joins) {
                if (j.sourceCollectionID === element.collectionID && j.sourceElementID === element.elementID) {
                    return true;
                }
                if (j.targetCollectionID === element.collectionID && j.targetElementID === element.elementID) {
                    return true;
                }
            }
            return false;
        };

        $scope.toggleFolded = function (collection) {
            collection.folded = !collection.folded;
            setTimeout(function () {
                const collectionObject = $('#' + collection.collectionID + '-parent')[0];
                instance.recalculateOffsets(collectionObject);
                instance.repaintEverything();
            }, 100);
        };

        $scope.createComposedElement = function () {
            $scope.calculateComponents();

            const element = {};

            element.isCustom = true;
            element.elementID = $scope.newID();

            element.viewExpression = '';

            element.elementName = 'comp';

            $scope.selectedCollection = undefined;

            $scope.modalElement = element;
            $scope.modalCycle = false;
            $scope.elementEditing = false;
            $scope.tab.active = 0;
            $('#elementModal').modal('show');
        };

        $scope.selectModalCollection = function (collection) {
            $scope.selectedModalCollection = collection;
        };

        $scope.addElementToExpression = function (element) {
            if (!$scope.modalElement.viewExpression) {
                $scope.modalElement.viewExpression = '';
            }
            $scope.modalElement.viewExpression += ('#' + element.elementID);
            $scope.modalElement.component = element.component;
        };

        $scope.validateCustomElement = function () {
            if ($scope.compileExpression()) {
                $scope.tab.active = 1;
            }
        };

        $scope.getElementsUsedInCustomExpression = function () {
            if (!$scope.modalElement) {
                return [];
            }
            return layerUtils.getElementsUsedInCustomExpression($scope.modalElement.viewExpression, $scope._Layer);
        };

        $scope.compileExpression = function () {
            const elements = layerUtils.getElementsUsedInCustomExpression($scope.modalElement.viewExpression, $scope._Layer);

            if (elements.length === 0) {
                // custom elements without arguments will break the GROUP BY clause.
                // They're disabled for now.  To enable them, we need to modify
                // queryProcessor so it doesn't add them to group Keys
                $scope.modalElement.expression = $scope.modalElement.viewExpression;
                return false;
            }

            if (!$scope.modalElement.component) {
                $scope.modalElement.component = elements[0].component;
            }

            for (const element of elements) {
                if (element.isCustom) {
                    const cycle = testForCycle($scope.modalElement, element);
                    if (cycle) {
                        $scope.modalCycle = cycle;
                        return false;
                    }
                }
            }

            return true;
        };

        function testForCycle (startElement, currentElement) {
            if (currentElement.elementID === startElement.elementID) {
                return [currentElement];
            }

            if (currentElement.isCustom) {
                const elements = layerUtils.getElementsUsedInCustomExpression(currentElement.viewExpression, $scope._Layer);
                for (const element of elements) {
                    const cycle = testForCycle(startElement, element);
                    if (cycle) {
                        return [currentElement].concat(cycle);
                    }
                }
            }

            return false;
        }

        $scope.elementAdd = function (element) {
            $scope.modalElement = element;
            $scope.elementEditing = false;
            $scope.tab.active = 1;
            $('#elementModal').modal('show');
        };

        $scope.promptAddAll = function (collection) {
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
                        $scope._Layer.objects.push(el);
                    }
                }
            }, function () {});
        };

        $scope.allElementsAdded = function (collection) {
            for (const el of collection.elements) {
                if (!el.elementRole) {
                    return false;
                }
            }
            return true;
        };

        $scope.editElement = function (element) {
            $scope.selectedElement = element;
            $scope.modalElement = Object.create(element);

            $scope.elementEditing = true;
            $scope.tab.active = 1;
            $('#elementModal').modal('show');
        };

        $scope.saveElement = function () {
            if ($scope.modalElement.isCustom && !$scope.compileExpression()) {
                console.error('cannot compile');
                return;
            }
            if (!$scope.elementEditing) {
                if (!$scope._Layer.objects) { $scope._Layer.objects = []; }

                $scope.modalElement.elementRole = 'dimension';
                $scope._Layer.objects.push($scope.modalElement);

                if ($scope.modalElement.isCustom) {
                    $scope.customElements.elements.push($scope.modalElement);
                }

                $('#elementModal').modal('hide');
            } else {
                saveEditElement();
            }
        };

        function saveEditElement () {
            const element = $scope.modalElement;

            const result = checkElementOk(element);
            if (!result.result) {
                $scope.elementEditingWarning = result.message;
                return;
            }

            $.extend($scope.selectedElement, element);

            $scope.elementEditing = false;
            $('#elementModal').modal('hide');
        }

        function checkElementOk (element) {
            let isOk = true;
            let message = '';

            if (element.elementType === 'date') {
                if (element.extractFromString) {
                    if (!element.yearPositionFrom) {
                        isOk = false;
                        message = gettextCatalog.getString('You have to setup a valid "FROM" position number to extract the year from the string');
                    }

                    if (angular.isNumber(element.yearPositionFrom)) {
                        isOk = false;
                        message = gettextCatalog.getString('You have to setup a valid "FROM" position number to extract the year from the string');
                    }

                    if (!element.yearPositionTo || angular.isNumber(element.yearPositionTo)) {
                        isOk = false;
                        message = gettextCatalog.getString('You have to setup a valid "TO" position number to extract the year from the string');
                    }

                    if (!element.monthPositionFrom || angular.isNumber(element.monthPositionFrom)) {
                        isOk = false;
                        message = gettextCatalog.getString('You have to setup a valid "FROM" position number to extract the month from the string');
                    }

                    if (!element.monthPositionTo || angular.isNumber(element.monthPositionTo)) {
                        isOk = false;
                        message = gettextCatalog.getString('You have to setup a valid "TO" position number to extract the month from the string');
                    }

                    if (!element.dayPositionFrom || angular.isNumber(element.dayPositionFrom)) {
                        isOk = false;
                        message = gettextCatalog.getString('You have to setup a valid "FROM" position number to extract the day from the string');
                    }

                    if (!element.dayPositionTo || angular.isNumber(element.dayPositionTo)) {
                        isOk = false;
                        message = gettextCatalog.getString('You have to setup a valid "TO" position number to extract the day from the string');
                    }
                }
            }

            const theResult = {};
            if (isOk) { theResult.result = 1; } else { theResult.result = 0; }

            theResult.message = message;

            return theResult;
        };

        $scope.zoom = function (ratio) {
            const theWidth = 200 * ratio + 'px';
            let theFontSize = '10px';
            let theIconSize = '12px';

            if (ratio === 0.5) {
                theFontSize = '8px';
                theIconSize = '12px';
            }
            if (ratio === 2) {
                theFontSize = '12px';
                theIconSize = '14px';
            }

            $('.jtk-field').css('width', theWidth);
            $('.jtk-header').css('width', theWidth);
            $('.window').css('width', theWidth);
            $('.jtk-node').css('width', theWidth);

            $('.jtk-field-label').css('font-size', theFontSize);
            $('.jtk-header').css('font-size', theFontSize);
            $('.window').css('font-size', theFontSize);
            $('.jtk-node').css('font-size', theFontSize);

            $('.jtk-field-icon').css('font-size', theIconSize);
            $('.jtk-field-selected').css('font-size', theIconSize);

            const leftCorrection = (200 * ratio);

            for (const collection in $scope._Layer.params.schema) {
                const theID = $scope._Layer.params.schema[collection].collectionID;

                const p = $(theID);
                const position = p.parent().position();
                const theLeft = position.left;

                $($scope._Layer.params.schema[collection].collectionID).css('left', theLeft + leftCorrection + 'px');
            }

            for (const collection in $scope._Layer.params.schema) {
                for (const element in $scope._Layer.params.schema[collection].elements) {
                    instance.revalidate($scope._Layer.params.schema[collection].elements[element].elementID);
                }
            }
        };

        $scope.addValueToElement = function (element, value, label) {
            if (!element.values) element.values = [];

            element.values.push({ value: value, label: label });
        };

        $scope.addFolder = function () {
            const elementID = 'F' + $scope.newID();

            const element = {};
            element.elementLabel = gettextCatalog.getString('my folder');
            element.elementRole = 'folder';
            element.elementID = elementID;
            element.editing = true;
            element.elements = [];
            $scope._Layer.objects.push(element);
        };

        $scope.deleteSchemaElement = function (element) {
            const elementID = element.elementID;

            for (const s in $scope._Layer.params.schema) {
                for (const e in $scope._Layer.params.schema[s].elements) {
                    if ($scope._Layer.params.schema[s].elements[e].elementID === elementID) {
                        delete $scope._Layer.params.schema[s].elements[e].elementRole;
                    }
                }
            }

            if (element.isCustom) {
                for (const i in $scope.customElements.elements) {
                    if ($scope.customElements.elements[i].elementID === elementID) {
                        $scope.customElements.elements.splice(i, 1);
                    }
                }
            }

            checkfordelete($scope.rootItem.elements, elementID);
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

            for (const s in $scope._Layer.params.schema) {
                for (const e in $scope._Layer.params.schema[s].elements) {
                    if ($scope._Layer.params.schema[s].elements[e].elementID === elementID) {
                        delete $scope._Layer.params.schema[s].elements[e].elementRole;
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
        $scope.onDrag = false;
        $scope.sortableOptions = {
            connectWith: '.schema-container',
            update: function (e, ui) {

            },
            start: function (e, ui) {
                $scope.$apply(function () {
                    $scope.onDrag = true;
                });
            },
            stop: function (e, ui) {
                $scope.$apply(function () {
                    $scope.onDrag = false;
                });
            }
        };

        $scope.deleteCollection = function (collection) {
            const theCollectionID = collection.collectionID;

            deleteAllCollectionJoins(theCollectionID);

            deleteAllCollectionElements($scope.rootItem.elements, theCollectionID);

            // delete all joins related to this collection

            for (const c in $scope._Layer.params.schema) {
                if ($scope._Layer.params.schema[c].collectionID === theCollectionID) {
                    for (const element in $scope._Layer.params.schema[c].elements) {
                        instance.deleteEndpoint($scope._Layer.params.schema[c].elements[element].elementID);
                        instance.deleteEndpoint($scope._Layer.params.schema[c].elements[element].elementID);
                    }
                    $scope._Layer.params.schema.splice(c, 1);
                }
            }

            $scope.selectedCollection = undefined;
        };

        function deleteAllCollectionJoins (collectionID) {
            const joinsToDelete = [];

            for (const o in $scope._Layer.params.schema) {
                if ($scope._Layer.params.schema[o].collectionID === collectionID) {
                    for (const e in $scope._Layer.params.schema[o].elements) {
                        for (const j in $scope._Layer.params.joins) {
                            if (($scope._Layer.params.joins[j].sourceElementID === $scope._Layer.params.schema[o].elements[e].elementID) ||
                                                ($scope._Layer.params.joins[j].targetElementID === $scope._Layer.params.schema[o].elements[e].elementID)) {
                                joinsToDelete.push({ sourceElementID: $scope._Layer.params.joins[j].sourceElementID, targetElementID: $scope._Layer.params.joins[j].targetElementID });
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

        $scope.getDatasetsForThisDts = function (_id, theDataSource) {
            if (!theDataSource.loading) {
                theDataSource.loading = true;
                api.getDatasourceCollections(_id).then(function (data) {
                    theDataSource.loading = false;
                    theDataSource.entities = data.data;
                });
            }
        };

        $scope.selectedCanvas = function (event) {
            unSelect();
            $scope.selectedItem = 'layer';
            $scope.theSelectedElement = $scope._Layer;
            $scope.tabs.selected = 'properties';
        };

        function unSelect () {
            for (const s in $scope.selectedElements) {
                $('#' + $scope.selectedElements[s]).removeClass('selectedElement');
            }
            const connections = instance.getAllConnections();

            for (const c in connections) {
                // connections[c].setType("default"); esto cambia el tipo left right, es solo el color lo que queremos cambiar
                connections[c].setPaintStyle({ stroke: '#61B7CF', strokeWidth: 4 });
                connections[c].selected = false;
            }

            $('#' + $scope.selectedTargetId).css({ backgroundColor: '#d5d5d5' });
            $('#' + $scope.selectedSourceId).css({ backgroundColor: '#d5d5d5' });
            $scope.selectedTargetId = undefined;
            $scope.selectedSourceId = undefined;
            $scope.selectedConnection = undefined;
            $scope.selectedElements = [];
            $scope.selectedItem = '';
        }

        $scope.selectCollection = function (theCollection, event) {
            event.stopPropagation();
            if (!event.shiftKey || $scope.selectedItem !== 'collection') {
                unSelect();
            }

            $scope.selectedItem = 'collection';
            $scope.theSelectedElement = theCollection;
            // if ($scope.joinMode)
            //  collectionHighliter(theCollection.collectionID);

            if ($scope.selectedElements) {
                if ($scope.selectedElements.indexOf(theCollection.collectionID) === -1) { $scope.selectedElements.push(theCollection.collectionID); }
            }

            setSelectedElements();
        };

        $scope.selectElement = function (theElement, event) {
            event.stopPropagation();
            unSelect();
            $scope.selectedItem = 'element';
            $scope.theSelectedElement = theElement;
            if (theElement.isPK) { $scope.selected_primary_key = true; } else { $scope.selected_primary_key = false; }

            if ($scope.selectedElements) {
                if ($scope.selectedElements.indexOf(theElement.elementID) === -1) { $scope.selectedElements.push(theElement.elementID); }
            }

            setSelectedElements();
        };

        function setSelectedElements () {
            for (const s in $scope.selectedElements) {
                $('#' + $scope.selectedElements[s]).addClass('selectedElement');
            }
            $scope.tabs.selected = 'properties';
        }

        $scope.addDatasetToLayer = function (datasourceID, collectionName) {
            if ($scope._Layer.datasourceID === datasourceID) {
                api.getDatasourceCollection(datasourceID, collectionName).then(function (collection) {
                    collection.collectionID = 'C' + $scope.newID();

                    for (const element of collection.elements) {
                        element.elementID = $scope.newID();
                        element.collectionID = collection.collectionID;
                        element.collectionName = collection.collectionName;
                    }

                    if (!$scope._Layer.params) { $scope._Layer.params = {}; }
                    if (!$scope._Layer.params.schema) { $scope._Layer.params.schema = []; }

                    $scope._Layer.params.schema.push(collection);

                    setTimeout(function () {
                        for (const element in collection.elements) {
                            if (!collection.elements[element].painted) {
                                _addEndpoints(collection.elements[element].elementID, ['RightMiddle'], ['LeftMiddle']);
                            }
                        }
                        setDraggable('#' + collection.collectionID + '-parent');
                    }, 100);

                    $scope.erDiagramInit();
                });
            } else {
                notify.error(gettextCatalog.getString('Datasource must be the same for all entities'));
            }
        };

        $scope.deleteObject = function (object, objectType) {
            if ($scope.selectedItem === 'join') {
                deleteJoin($scope.theSelectedElement.sourceElementID, $scope.theSelectedElement.targetElementID);
                unSelect();
            }
            if ($scope.selectedItem === 'collection') {
                $scope.deleteCollection($scope.theSelectedElement);
                unSelect();
            }
        };

        $scope.editObject = function () {
            if ($scope.selectedItem === 'collection' && $scope.theSelectedElement.isSQL) {
                $scope.editSQL();
            }
        };

        $scope.newID = function () {
            let counter = $scope._Layer.idCounter;
            if (counter === undefined) {
                counter = 0;
            }
            counter = (counter + 1) % 676; // 676 === 26**2
            $scope._Layer.idCounter = counter;
            let uid = 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(counter / 26)) +
                'abcdefghijklmnopqrstuvwxyz'.charAt(counter % 26);
            const rand = Math.floor(Math.random() * 676);
            uid += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(rand / 26)) +
            'abcdefghijklmnopqrstuvwxyz'.charAt(rand % 26);
            // I couldn't decide between using a counter to guarantee unique ids in theory,
            // or using random characters to be certain the ids are very different from each other in practice
            // so I ended up doing both.
            return uid;
        };

        $scope.findElement = function (elID) {
            function explore (elementList) {
                for (const el of elementList) {
                    if (el.elementID === elID) {
                        return el;
                    }
                    if (el.elements) {
                        explore(el.elements);
                    }
                }
            }

            explore($scope._Layer.objects);
        };

        $scope.forAllElements = function (f) {
            function explore (elementList) {
                for (const el of elementList) {
                    if (el.elements) {
                        explore(el.elements);
                    } else {
                        f(el);
                    }
                }
            }

            explore($scope._Layer.objects);
        };

        $scope.customExpressionCollections = function () {
            if (!$scope._Layer) {
                return [];
            }

            return $scope._Layer.params.schema.concat($scope.customElements);
        };

        $scope.removeFromArray = function (array, item) {
            const index = array.indexOf(item);

            if (index > -1) array.splice(index, 1);
        };
    }
})();
