(function () {
    'use strict';

    angular.module('app.layer-edit').component('appLayerEditElementModal', {
        templateUrl: 'partials/layer-edit/layer-edit.element-modal.component.html',
        controller: LayerEditElementModalController,
        controllerAs: 'vm',
        bindings: {
            resolve: '<',
            close: '&',
            dismiss: '&',
        },
    });

    LayerEditElementModalController.$inject = ['i18n', 'layerUtils', 'layerElementTypes', 'layerNumberDefaultAggregation', 'layerStringDefaultAggregation'];

    function LayerEditElementModalController (i18n, layerUtils, layerElementTypes, layerNumberDefaultAggregation, layerStringDefaultAggregation) {
        const vm = Object.assign(this, {
            $onInit,
            activeTab: 'general',
            addElementToExpression,
            addValueToElement,
            elementTypes: layerElementTypes,
            getElementsUsedInCustomExpression,
            layer: null,
            element: null,
            numberDefaultAggregation: layerNumberDefaultAggregation,
            onExpressionChange: onExpressionChange,
            removeFromArray,
            saveElement,
            selectedCollection: null,
            selectCollection,
            stringDefaultAggregation: layerStringDefaultAggregation,
            validateCustomElement,
        });

        function $onInit () {
            vm.layer = angular.copy(vm.resolve.layer);
            vm.element = angular.copy(vm.resolve.element);

            if (vm.element.isCustom) {
                vm.activeTab = 'expression';
            }
        }

        function addElementToExpression (element) {
            if (!vm.element.viewExpression) {
                vm.element.viewExpression = '';
            }
            vm.element.viewExpression += ('#' + element.elementID);
            vm.element.component = getElementComponent(element);
        }

        function addValueToElement (element, value, label) {
            if (!element.values) element.values = [];

            element.values.push({ value: value, label: label });
        }

        function compileExpression () {
            const elements = layerUtils.getElementsUsedInCustomExpression(vm.element.viewExpression, vm.layer);

            if (elements.length === 0) {
                vm.element.expression = vm.element.viewExpression;
                throw new Error('Custom element need to use at least one element');
            }

            if (!vm.element.component) {
                vm.element.component = elements[0].component;
            }
        }

        function getElementsUsedInCustomExpression () {
            if (!vm.element) {
                return [];
            }

            try {
                vm.errorMessage = '';
                compileExpression();
                return layerUtils.getElementsUsedInCustomExpression(vm.element.viewExpression, vm.layer);
            } catch (err) {
                vm.errorMessage = err.message;
            }

            return [];
        }

        function removeFromArray (array, item) {
            const index = array.indexOf(item);

            if (index > -1) array.splice(index, 1);
        }

        function saveElement () {
            if (vm.element.isCustom) {
                try {
                    compileExpression();
                    vm.errorMessage = '';
                } catch (err) {
                    console.error(err);
                    vm.errorMessage = err.message;
                    return;
                }
            }

            vm.element.elementRole = 'dimension';

            vm.close({ $value: vm.element });
        }

        function selectCollection (collection) {
            vm.selectedCollection = collection;
        }

        function validateCustomElement () {
            try {
                compileExpression();
                vm.errorMessage = '';
                vm.activeTab = 'general';
            } catch (err) {
                vm.errorMessage = err.message;
                vm.form.$setDirty();
            }
        }

        function onExpressionChange () {
            const elements = getElementsUsedInCustomExpression();
            if (elements.length > 0) {
                vm.element.component = getElementComponent(elements[0]);
            } else {
                vm.element.component = undefined;
            }
        }

        function getElementComponent (element) {
            const collectionId = element.collectionID;
            const collection = vm.layer.params.schema.find(c => c.collectionID === collectionId);

            if (collection) {
                return collection.component;
            }
        }
    }
})();
