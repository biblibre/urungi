'use strict';

app.directive('ndPrompt', function($compile) {
return {
    transclude: true,
    scope: {
        elementId: '@',
        label: '@',
        prompts: '=',
        valueField: '@',
        showField: '@',
        onChange: '=',
        ngModel: '=',
        description: '@',
        selectedValue: '@'
    },

   templateUrl: "partials/prompts/promptsDirective.html",

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


      $scope.getPrompt = function(elementID)
        {
        for (var p in $scope.prompts)
            {
            if ($scope.prompts[p].elementID == elementID)
                return $scope.prompts[p];

            }

        }

      $scope.promptChanged = function(elementId) {
	        $scope.onChange(elementId,$scope.selectedValue);

        };


    }
  }



});