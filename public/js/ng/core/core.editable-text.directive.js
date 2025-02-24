angular.module('app.core').directive('appEditableText', appEditableText);

appEditableText.$inject = ['$compile', '$timeout'];

function appEditableText ($compile, $timeout) {
    const directive = {
        restrict: 'A',
        link,
    };

    return directive;

    function link (scope, element, attrs) {
        element.addClass('editable-text');
        element.on('click', function () {
            const template = `<input ng-model="${attrs.appEditableText}" type="text">`;
            const input = $compile(template)(scope);

            element.hide();
            input.insertAfter(element);
            input.on('blur', function () {
                element.show();
                input.remove();
            });

            $timeout(function () {
                input.focus();
                const length = input.val().length;
                input[0].setSelectionRange(length, length);
            });
        });
    }
}
