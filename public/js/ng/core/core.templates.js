(function(){'use strict';angular.module('app.core').run(['$templateCache', function($templateCache) {$templateCache.put('partials/core/core.duplicate-modal.component.html','<div class="modal-header">\n    <button type="button" class="close" ng-click="vm.dismiss()" aria-hidden="true">&times;</button>\n    <h3 translate>Duplicate \'{{vm.resolve.name}}\' ?</h3>\n</div>\n<div class="modal-body">\n    <div class="form-group">\n        <label translate for="duplicate-modal-new-name">Choose a new name for the copy :</label>\n        <input id="duplicate-modal-new-name" type="text" class="form-control" ng-model="vm.newName" ng-required="true">\n    </div>\n</div>\n<div class="modal-footer">\n    <button type="button" class="btn" ng-click="vm.dismiss()" translate>Cancel</button>\n    <button ng-click="vm.onDuplicate();" class="btn btn-info" translate>Duplicate</button>\n</div>\n');}]);})();