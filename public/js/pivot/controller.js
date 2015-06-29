app.controller('pivotCtrl', function ($scope, $routeParams, reportModel ) {

$scope.dropped = function(dragEl, dropEl) { // function referenced by the drop target
    //this is application logic, for the demo we just want to color the grid squares
    //the directive provides a native dom object, wrap with jqlite
    var drop = angular.element(dropEl);
    var drag = angular.element(dragEl);

    console.log(drag.attr("id"))
    /*
    //clear the previously applied color, if it exists
    var bgClass = drop.attr('data-color');
    if (bgClass) {
        drop.removeClass(bgClass);
    }

    //add the dragged color
    bgClass = drag.attr("data-color");
    drop.addClass(bgClass);
    drop.attr('data-color', bgClass);

    //if element has been dragged from the grid, clear dragged color
    if (drag.attr("x-lvl-drop-target")) {
        drag.removeClass(bgClass);
    }
    */

    //http://logicbomb.github.io/ng-directives/drag-drop.html
}

    $scope.horiz = function()
    {

    }

});