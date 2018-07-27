app.service('queryModel', function (uuid2) {
    /*
    * The purpose of this service is to provide functions for updating the query object as a report is edited
    * The query object will be the argument used when data is fetched
    *
    * The query should be loaded in this service when the report edition begins
    * This service should not be used in any other context than report edition
    */

    var loadedQuery = {};
    var layers = [];
    var layer = {};

    /*
    *   Initialisation
    */

    this.newQuery = function () {
        loadedQuery = {};
        loadedQuery.id = uuid2.newguid();
        loadedQuery.columns = [];
        loadedQuery.order = [];
        loadedQuery.groupFilters = [];
        return loadedQuery;
    };

    this.loadQuery = function (query) {
        loadedQuery = query;
    };

    this.loadLayers = function (loadedLayers) {
        layers = loadedLayers;
    };

    /*
    *   Update functions
    *
    * these functions are used as the columns are moved and changes, to keep the query synchronized
    */

    this.onDateEndSet = function (newDate, oldDate, filter) {
        if (angular.isDate(newDate)) {
            var year = newDate.getFullYear();
            var month = this.pad(newDate.getMonth() + 1, 2);
            var day = this.pad(newDate.getDate(), 2);
            var theDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');
            filter.filterText2 = theDate;
            filter.dateCustomFilterLabel = undefined;
        }
    };

    this.pad = function (num, size) {
        var s = num + '';
        while (s.length < size) s = '0' + s;
        while (s.length < size) s = '0' + s;
        return s;
    };

    this.onDateSet = function (newDate, oldDate, filter) {
        if (angular.isDate(newDate)) {
            var year = newDate.getFullYear();
            var month = this.pad(newDate.getMonth() + 1, 2);
            var day = this.pad(newDate.getDate(), 2);
            var theDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');
            if (filter.filterType === 'in' || filter.filterType === 'notIn') {
                if (!filter.filterText1) { filter.filterText1 = []; }
                filter.filterText1.push(theDate);
            } else { filter.filterText1 = theDate; }

            filter.searchValue = theDate;
            filter.filterValue = theDate;
            filter.dateCustomFilterLabel = undefined;
        }
    };

    this.onDrop = function (item, queryBind) {
        switch (queryBind) {
        case 'column':
            if (!loadedQuery.columns) { loadedQuery.columns = []; }
            loadedQuery.columns.push(item);
            break;

        case 'order':
            item.sortType = -1;
            loadedQuery.order.push(item);
            break;

        case 'filter':
            if (loadedQuery.groupFilters.length > 0) {
                item.condition = 'AND';
                item.conditionLabel = 'AND';
            }

            loadedQuery.groupFilters.push(item);
            filtersUpdated();
            break;

        case 'group':
            loadedQuery.groupFilters.push(item);
            filtersUpdated();
            break;

        default:
            noty({text: 'Invalid loadedQuery bind', timeout: 2000, type: 'error'});
        }
    };

    this.removeQueryItem = function (object, type) {
        switch (type) {
        case 'column':
            if (loadedQuery.columns) { removeFromArray(loadedQuery.columns, object); }

            for (const i in loadedQuery.columns) {
                if (loadedQuery.columns[i].elementID === object.elementID) {
                    loadedQuery.columns.splice(i, 1);
                }
            }
            break;

        case 'order':
            removeFromArray(loadedQuery.order, object);
            for (const i in loadedQuery.order) {
                if (loadedQuery.order[i].elementID === object.elementID) {
                    loadedQuery.order.splice(i, 1);
                }
            }
            break;

        case 'filter':
            removeFromArray(loadedQuery.groupFilters, object);
            this.reorderFilters();
            filtersUpdated();

            break;
        }
    };

    this.updateColumnField = function (column, field, newValue) {
        var col = loadedQuery.columns.find(c => c.id === column.id);
        col[field] = newValue;
    };

    // this.changeZone = function (column, newZone) {
    //     var col = loadedQuery.columns.find(c => c.id === column.id);
    //     col.zone = newZone;
    // };

    // this.hideColumn = function (elementID, hidden) {
    //     for (var i in loadedQuery.columns) {
    //         if (loadedQuery.columns[i].elementID === elementID) {
    //             loadedQuery.columns[i].hidden = hidden;
    //         }
    //     }
    // };

    this.updateCondition = function (filter, condition) {
        // TODO : figure out what this does
        filter.conditionType = condition.conditionType;
        filter.conditionLabel = condition.conditionLabel;
        this.processStructure();
    };

    this.orderColumn = function (predicate) {
        this.reverse = (this.predicate === predicate) ? !this.reverse : false;
        this.predicate = predicate;
    };

    this.reorderFilters = function () {
        if (loadedQuery.groupFilters.length > 0) {
            delete (loadedQuery.groupFilters[0].condition);
            delete (loadedQuery.groupFilters[0].conditionLabel);
        }

        for (let i = 1; i < loadedQuery.groupFilters.length; ++i) {
            if (typeof loadedQuery.groupFilters[i].condition === 'undefined') {
                loadedQuery.groupFilters[i].condition = 'AND';
                loadedQuery.groupFilters[i].conditionLabel = 'AND';
            }
        }
    };

    /*
    *   Process functions
    *
    * These functions are used when processQuery is called
    */

    this.processQuery = function (query) {
        /*
        * Prepares the query so that it can be used to run a database request
        */

        if (!query) {
            query = loadedQuery;
        }

        layer = layers.find(l => l._id === query.selectedLayerID);
        if (!layer) {
            noty({text: 'Layer not found', timeout: 2000, type: 'error'});
            return;
        }
        setupCount(query);

        generateDataSourceList(query);
        // This function fills query.datasources with all the query information.
        // Any change to the query fields in the query processing must be ran before this function

        detectLayerJoins(query);
        processStructure(query);
        cleanQuery(query);
    };

    function cleanQuery (query) {
        query.data = [];
        for (const f in query.groupFilters) {
            query.groupFilters[f].data = [];
            query.groupFilters[f].values = [];
        }
        for (const c in query.collections) {
            for (const cf in query.collections[c].filters) {
                query.collections[c].filters[cf].data = [];
                query.collections[c].filters[cf].values = [];
            }
        }
    }

    function setupCount (query) {
        /*
        * Get add to the query some columns to count all of the y keys
        */
        function isPivotTableCount (id) {
            return (id.substring(id.length - 3, id.length) === 'ptc');
        }
        for (var i = query.columns.length - 1; i >= 0; i--) {
            if (isPivotTableCount(query.columns[i].id)) {
                query.columns.splice(i, 1);
            }
        }
        if (!query.countYKeys) { return; }
        var countColumns = [];
        for (const col of query.columns) {
            if (col.zone === 'ykeys') {
                countColumns.push(countColumn(col));
            }
        }
        for (const col of countColumns) { query.columns.push(col); }
    };

    function countColumn (col) {
        return {
            aggregation: 'count',
            collectionID: col.collectionID,
            datasourceID: col.datasourceID,
            elementID: col.elementID,
            elementLabel: col.elementLabel,
            elementName: col.elementName,
            elementType: col.elementName,
            filterPrompt: false,
            id: col.id + 'ptc',
            layerID: col.layerID,
            objectLabel: col.objectLabel + ' count'
        };
    }

    function detectLayerJoins (query) {
        if (layers.length === 0) {
            return;
        }

        // this function enables and disables elements in the layer if there is a join between the elements in the report and the element in the layer...
        var reportCollections = [];
        var selectableCollections = [];

        for (const i in query.datasources) {
            for (const c in query.datasources[i].collections) {
                reportCollections.push(query.datasources[i].collections[c].collectionID);
                selectableCollections.push(query.datasources[i].collections[c].collectionID);
            }
        }

        if (layer.params && layer.params.joins) {
            for (const j in layer.params.joins) {
                for (const c in reportCollections) {
                    if (layer.params.joins[j].sourceCollectionID === reportCollections[c]) {
                        if (selectableCollections.indexOf(layer.params.joins[j].sourceCollectionID) === -1) { selectableCollections.push(layer.params.joins[j].sourceCollectionID); }

                        if (selectableCollections.indexOf(layer.params.joins[j].targetCollectionID) === -1) { selectableCollections.push(layer.params.joins[j].targetCollectionID); }
                    }

                    if (layer.params.joins[j].targetCollectionID === reportCollections[c]) {
                        if (selectableCollections.indexOf(layer.params.joins[j].sourceCollectionID) === -1) { selectableCollections.push(layer.params.joins[j].sourceCollectionID); }

                        if (selectableCollections.indexOf(layer.params.joins[j].targetCollectionID) === -1) { selectableCollections.push(layer.params.joins[j].targetCollectionID); }
                    }
                }
            }
        }

        if (selectableCollections.length === 0) {
            enableAllElements(layer.rootItem.elements);
        } else {
            detectLayerJoins4Elements(layer.rootItem.elements, selectableCollections);
        }
    }

    function detectLayerJoins4Elements (elements, selectableCollections) {
        for (var e in elements) {
            if (elements[e].elementRole !== 'folder') {
                if (selectableCollections.indexOf(elements[e].collectionID) === -1) {
                    elements[e].enabled = false;
                } else {
                    elements[e].enabled = true;
                }
            }
            if (elements[e].elements) { detectLayerJoins4Elements(elements[e].elements, selectableCollections); }
        }
    }

    function enableAllElements (elements) {
        for (var e in elements) {
            if (elements[e].elementRole !== 'folder') {
                elements[e].enabled = true;
            }

            if (typeof elements[e].id === 'undefined') {
                if (elements[e].collectionID) {
                    // var elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName;
                    var elementID = 'wst' + elements[e].elementID.toLowerCase();

                    if (elements[e].aggregation) {
                        elementID = 'wst' + elements[e].elementID.toLowerCase() + elements[e].aggregation;
                    }

                    elements[e].id = elementID.replace(/[^a-zA-Z ]/g, '');
                }
            }

            if (elements[e].elements) { enableAllElements(elements[e].elements); }
        }
    }

    function checkFilters (thefilters) {
        for (var g in thefilters) {
            var filter = thefilters[g];
            if (filter) {
                if (!this.isfilterComplete(filter) && filter.promptMandatory) {
                    this.wrongFilters.push(filter.id);
                }

                if (filter.group) {
                    checkFilters(filter.filters);
                }
            }
        }
    }

    /*
    *   Internal functions
    */

    function generateDataSourceList (query) {
        /*
        * Initialize query.datasources with all of the datasources used by the query.
        */

        query.id = uuid2.newguid();
        query.datasources = [];
        var datasourcesList = [];
        var layersList = [];
        layersList.push(query.selectedLayerID);

        for (const i in query.columns) {
            if (datasourcesList.indexOf(query.columns[i].datasourceID) === -1) { datasourcesList.push(query.columns[i].datasourceID); }
            if (layersList.indexOf(query.columns[i].layerID) === -1) { layersList.push(query.columns[i].layerID); }
        }

        for (const i in query.groupFilters) {
            if (datasourcesList.indexOf(query.groupFilters[i].datasourceID) === -1) { datasourcesList.push(query.groupFilters[i].datasourceID); }
            if (layersList.indexOf(query.groupFilters[i].layerID) === -1) { layersList.push(query.groupFilters[i].layerID); }
        }

        for (const i in query.order) {
            if (datasourcesList.indexOf(query.order[i].datasourceID) === -1) { datasourcesList.push(query.order[i].datasourceID); }
            if (layersList.indexOf(query.order[i].layerID) === -1) { layersList.push(query.order[i].layerID); }
        }

        for (const i in datasourcesList) {
            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];

            for (const z in query.columns) {
                if (query.columns[z].datasourceID === datasourcesList[i]) {
                    if (dtsCollections.indexOf(query.columns[z].collectionID) === -1) { dtsCollections.push(query.columns[z].collectionID); }
                }
            }

            for (const z in query.order) {
                if (query.order[z].datasourceID === datasourcesList[i]) {
                    if (dtsCollections.indexOf(query.order[z].collectionID) === -1) { dtsCollections.push(query.order[z].collectionID); }
                }
            }

            getFiltersCollections(query.groupFilters, dtsCollections, datasourcesList[i]);

            for (const n in dtsCollections) {
                var collection = {};
                collection.collectionID = dtsCollections[n];

                collection.columns = [];

                for (const n1 in query.columns) {
                    if (query.columns[n1].collectionID === dtsCollections[n]) {
                        collection.columns.push(query.columns[n1]);
                    }
                }

                collection.order = [];

                for (const n1 in query.order) {
                    if (query.order[n1].collectionID === dtsCollections[n]) {
                        collection.order.push(query.order[n1]);
                    }
                }

                collection.filters = [];

                dtsObject.collections.push(collection);
            }

            query.datasources.push(dtsObject);
            query.layers = layersList;
        }
    }

    function getFiltersCollections (thefilters, dtsCollections, dtsID) {
        for (var z in thefilters) {
            if (thefilters[z].datasourceID === dtsID) {
                if (dtsCollections.indexOf(thefilters[z].collectionID) === -1) {
                    dtsCollections.push(thefilters[z].collectionID);
                }
            }
        }
    }

    /*
    function getGroupCollections(theGroup,dtsCollections,dtsID,isRoot,done){
            for (var ff in theGroup)
                {
                    if (theGroup[ff].datasourceID)
                    {
                        if (theGroup[ff].datasourceID === dtsID)
                            {
                                    if (dtsCollections.indexOf(theGroup[ff].collectionID) === -1)
                                    {
                                        dtsCollections.push(theGroup[ff].collectionID);
                                    }
                            }
                        }
                        var well = theGroup[ff];

                    if (theGroup[ff].group)
                        {
                            getGroupCollections(theGroup[ff].filters,dtsCollections,false,done);
                        }

                }

            if (isRoot)
                done();

    }
    */

    function processStructure (query) {
        this.wrongFilters = [];
        checkFilters(this.wrongFilters, query.groupFilters);
        if (this.wrongFilters.length === 0) {
            $('#reportLayout').empty();
            return (query.columns.length > 0);
        } else {
            var errorMsg = 'There are incomplete filters';
            noty({text: errorMsg, timeout: 6000, type: 'error'});
        }
    }

    function filtersUpdated (theFilters, mainFilters) {
        theFilters = (theFilters) || loadedQuery.groupFilters;
        mainFilters = (typeof mainFilters === 'undefined') ? true : mainFilters;
    };

    function removeFromArray (array, element) {
        var index = array.indexOf(element);

        if (index > -1) array.splice(index, 1);
    }

    /*
    *   Getters and setters
    */

    function clone (obj) {
        if (obj == null || typeof obj !== 'object') return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    };

    this.getFilterValuesQuery = function (filter) {
        var query = clone(loadedQuery);

        query.groupFilters = query.groupFilters.filter(f => (f.id !== filter.id || f.filterType !== filter.filterType));

        for (var fil of query.groupFilters) {
            delete fil.filterValuesQuery;
        }

        var newColumn = {
            id: 'f',
            collectionID: filter.collectionID,
            datasourceID: filter.datasourceID,
            elementID: filter.elementID,
            elementName: filter.elementName,
            elementType: filter.elementType,
            layerID: filter.layerID
        };

        query.columns.push(newColumn);

        this.processQuery(query);

        return query;
    };

    /*
    *   Options
    */

    this.fieldsAggregations = {
        'number': [
            {name: 'Sum', value: 'sum'},
            {name: 'Avg', value: 'avg'},
            {name: 'Min', value: 'min'},
            {name: 'Max', value: 'max'},
            {name: 'Count', value: 'count'},
            {name: 'Raw', value: 'raw'}
        ],
        'date': [
            {name: 'Year', value: 'year'},
            {name: 'Month', value: 'month'},
            {name: 'Day', value: 'day'},
            {name: 'Count', value: 'count'},
            {name: 'Raw', value: 'raw'}
            /* {name: 'Semester', value: 'semester'},
            {name: 'Quarter', value: 'quarter'},
            {name: 'Trimester', value: 'trimester'} */
        ],
        'string': [
            {name: 'Count', value: 'count'},
            {name: 'Raw', value: 'raw'}
        ]
    };

    this.conditionTypes = [
        {conditionType: 'and', conditionLabel: 'AND'},
        {conditionType: 'or', conditionLabel: 'OR'},
        {conditionType: 'andNot', conditionLabel: 'AND NOT'},
        {conditionType: 'orNot', conditionLabel: 'OR NOT'}
    ];
});
