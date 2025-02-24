angular.module('app.ui-bootstrap', ['ui.bootstrap'])
    .config(config);

config.$inject = ['$uibTooltipProvider'];
function config ($uibTooltipProvider) {
    $uibTooltipProvider.options({
        appendToBody: true,
    });
}
