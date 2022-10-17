(function(){'use strict';angular.module('app.user').run(['$templateCache', function($templateCache) {$templateCache.put('partials/user/user.edit-modal.component.html','<div class="modal-header ng-scope">\n    <button type="button" class="close" ng-click="vm.dismiss()" aria-hidden="true"><i class="fa fa-close"></i></button>\n    <h4 ng-if="vm.mode == \'new\'" class="modal-title" translate>New User</h4>\n    <h4 ng-if="vm.mode != \'new\'" class="modal-title" translate>Edit User</h4>\n</div>\n\n<div class="modal-body ng-scope">\n    <div class="panel panel-default" style="background-color: #eee;">\n        <div class="panel-body">\n            <form name="myForm">\n                <div class="row">\n                    <div class="col-md-6">\n                        <div class="form-group">\n                            <label for="username" class="control-label" translate>User Nick</label>\n                            <input id="username" name="username" ng-disabled="vm.mode != \'new\'" class="form-control" ng-model="vm.user.userName" required>\n                            <div role="alert"><span class="error" ng-show="myForm.username.$error.required" translate>User Nick is required</span> </div>\n\n                        </div>\n                        <div class="form-group">\n                            <label for="fname" class="control-label" translate>First Name</label>\n                            <input id="fname" name="fname" class="form-control" ng-model="vm.user.firstName" required>\n                            <div role="alert"><span class="error" ng-show="myForm.fname.$error.required" translate>First Name is required</span> </div>\n                        </div>\n                        <div class="form-group">\n                            <label for="lname" class="control-label" translate>Last Name</label>\n                            <input id="lname" name="lname" class="form-control" ng-model="vm.user.lastName" required>\n                            <div role="alert"><span class="error" ng-show="myForm.lname.$error.required" translate>Last Name is required</span> </div>\n                        </div>\n                        <div class="form-group">\n                            <label for="email" class="control-label" translate>email</label>\n                            <input id="email" name="email" class="form-control" ng-model="vm.user.email" required>\n                            <div role="alert"><span class="error" ng-show="myForm.email.$error.required" translate>email is required</span> </div>\n                        </div>\n                        <div ng-if="vm.mode == \'new\'" class="checkbox">\n                            <label>\n                                <input type="checkbox" id="sendPassword" ng-model="vm.user.sendPassword" >\n                                <p translate>Send password through email</p>\n                            </label>\n                        </div>\n\n                        <div ng-show="(vm.user.sendPassword == false && vm.mode == \'new\') || (vm.mode == \'edit\')" class="form-group">\n                            <label for="email" class="control-label" translate>Password</label>\n                            <table>\n                                <tr>\n                                    <td>\n                                        <input id="pwd1" class="form-control" placeholder="{{ \'Introduce password\' | translate }}" ng-model="vm.user.pwd1" required>\n                                    </td>\n                                    <td>\n                                        <input id="pwd2" class="form-control" placeholder="{{ \'Repeat password\' | translate }}" ng-model="vm.user.pwd2" required>\n                                    </td>\n                                </tr>\n                            </table>\n                        </div>\n\n                        <div ng-show="(vm.mode == \'edit\' && vm.user.email)" class="form-group">\n                              <button class="btn btn-warning" translate>Reset user password</button>\n                        </div>\n                    </div>\n\n                    <div class="col-md-6">\n                        <div class="form-group">\n                            <label for="title" class="control-label" translate>Title</label>\n                            <input id="title" class="form-control" ng-model="vm.user.title" >\n                        </div>\n\n                        <div class="form-group">\n                            <label for="department" class="control-label" translate>Department</label>\n                            <input id="department" class="form-control" ng-model="vm.user.department" >\n                        </div>\n\n                        <div class="form-group">\n                            <label for="businessUnit" class="control-label" translate>Business unit</label>\n                            <input id="businessUnit" class="form-control" ng-model="vm.user.businessUnit" >\n                        </div>\n\n                        <div class="form-group">\n                            <label for="unit" class="control-label" translate>Unit</label>\n                            <input id="unit" class="form-control" ng-model="vm.user.unit">\n                        </div>\n\n                        <div class="form-group">\n                            <label for="brand" class="control-label" translate>Brand</label>\n                            <input id="brand" class="form-control" ng-model="vm.user.brand" >\n                        </div>\n                    </div>\n                </div>\n\n                <div ng-if="vm.alertMessage && vm.alertMessage != \'\'" class="alert-block">{{ vm.alertMessage }}</div>\n\n                <div class="container-fluid">\n                    <button type="button" class="btn btn-info ng-pristine ng-valid pull-right"  ng-click="vm.checkForNewUser()" translate>Save</button>\n                    <button type="button" class="btn btn-white pull-right" ng-click="vm.dismiss()" translate>Close</button>\n                </div>\n            </form>\n        </div>\n    </div>\n</div>\n');}]);})();