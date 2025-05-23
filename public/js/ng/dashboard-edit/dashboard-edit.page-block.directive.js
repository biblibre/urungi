angular.module('app.dashboard-edit').directive('pageBlock', pageBlock);

pageBlock.$inject = ['$rootScope'];
function pageBlock ($rootScope) {
    return {

        restrict: 'A',

        link: function (scope, el, attrs, controller) {
            el.bind('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                $rootScope.$broadcast('element.reselected', el);

                if (el.hasClass('editable')) {
                    el.attr('contenteditable', 'true');
                    el.focus();
                } else {
                    el.attr('contenteditable', 'false');
                }
            });
        }
    };
}
