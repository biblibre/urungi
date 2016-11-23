'use strict';

app.directive('wstColor', function($compile,colors) {
return {
    transclude: true,
    scope: {
        onChange: '=',
        ngModel: '='
    },

   templateUrl: "partials/widgets/wstColor.html",

    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {
        switch (attrs['type']) {
            case "text":
                // append input field to "template"
            case "select":
                // append select dropdown to "template"
        }

    $scope.colors = colors.colors;

    $scope.$watch('ngModel', function(){
          //console.log('this is the selected color',$scope.ngModel);
            $scope.selectedColor = $scope.ngModel;
            //$scope.onChange($scope.selectedColor);
      });

     $scope.changeColor = function(color)
     {
         $scope.selectedColor = color;
         $scope.ngModel = color;
         if ($scope.onChange)
         $scope.onChange($scope.selectedColor);
     }

     $scope.clearColor = function()
     {
         $scope.selectedColor = 'transparent';
         $scope.ngModel = 'transparent';
         if ($scope.onChange)
         $scope.onChange($scope.selectedColor);
     }

     $scope.changeInput = function()
     {
         $scope.ngModel = $scope.selectedColor;
     }

     // $scope.$watch('element', function(){

    }
}
});
