(function () {
    'use strict';

    angular.module('app.layer-edit').component('appLayerEditSqlModal', {
        templateUrl: 'partials/layer-edit/layer-edit.sql-modal.component.html',
        controller: LayerEditSqlModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    LayerEditSqlModalController.$inject = ['api', 'layerEditService'];

    function LayerEditSqlModalController (api, layerEditService) {
        const vm = this;

        vm.$onInit = $onInit;
        vm.addSqlToLayer = addSqlToLayer;
        vm.collection = null;
        vm.confirmSQLChanges = confirmSQLChanges;
        vm.error = null;
        vm.layer = null;
        vm.mode = null;
        vm.name = null;
        vm.saveSQLChanges = saveSQLChanges;
        vm.sqlQuery = null;

        function $onInit () {
            vm.collection = vm.resolve.collection;
            vm.layer = vm.resolve.layer;
            vm.mode = vm.resolve.mode;
            vm.name = vm.resolve.name;
            vm.sqlQuery = vm.resolve.sqlQuery;
        }

        function addSqlToLayer () {
            const temporarySqlCollection = { sqlQuery: vm.sqlQuery, name: vm.name };

            api.getSqlQueryCollection(vm.layer.datasourceID, temporarySqlCollection).then(function (collection) {
                collection.collectionID = 'C' + layerEditService.newID(vm.layer);

                for (const element of collection.elements) {
                    element.elementID = layerEditService.newID(vm.layer);
                    element.collectionID = collection.collectionID;
                    element.collectionName = collection.collectionName;
                }

                vm.close({ $value: collection });
            }, function (err) {
                vm.error = err.message;
            });
        }

        function saveSQLChanges () {
            delete vm.error;

            const sqlCollection = { sqlQuery: vm.sqlQuery, name: vm.name };

            api.getSqlQueryCollection(vm.layer.datasourceID, sqlCollection).then(function (newCol) {
                const currentCol = vm.collection;

                for (const e in newCol.elements) {
                    newCol.elements[e].collectionID = currentCol.collectionID;
                    newCol.elements[e].collectionName = currentCol.collectionName;
                }

                vm.lostElements = [];
                vm.newElements = [];
                vm.matchedElements = [];

                for (const e1 of newCol.elements) {
                    const elementInCurrentCollection = currentCol.elements.find(e => e.elementName === e1.elementName);
                    if (elementInCurrentCollection) {
                        e1.elementID = elementInCurrentCollection.elementID;
                        e1.elementRole = elementInCurrentCollection.elementRole;
                        e1.elementLabel = elementInCurrentCollection.elementLabel;
                        vm.matchedElements.push(elementInCurrentCollection);
                    } else {
                        e1.elementID = layerEditService.newID(vm.layer);
                        vm.newElements.push(e1);
                    }
                }

                for (const el of currentCol.elements) {
                    if (vm.matchedElements.indexOf(el) < 0) {
                        vm.lostElements.push(el);
                    }
                }

                vm.newSQLCollection = newCol;
            }, function (err) {
                vm.error = err.message;
            });
        }

        function confirmSQLChanges () {
            vm.close({ $value: vm.newSQLCollection });
        }
    }
})();
