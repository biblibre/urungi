/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 15/12/13
 * Time: 10:49
 * To change this template use File | Settings | File Templates.
 */

var directives = angular.module('nd.contentEditable', []);

directives.directive('contenteditable', function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            // view -> model
            elm.bind('blur', function() {
                scope.$apply(function() {
                    ctrl.$setViewValue(elm.html());
                });
            });

            // model -> view
            ctrl.render = function(value) {
                elm.html(value);
            };

            // load init value from DOM
            ctrl.$setViewValue(elm.html());

            elm.bind('keydown', function(event) {
                console.log("keydown " + event.which);
                var esc = event.which == 27,
                    el = event.target;

                if (esc) {
                    console.log("esc");
                    ctrl.$setViewValue(elm.html());
                    el.blur();
                    event.preventDefault();
                }

            });

        }
    };
});
