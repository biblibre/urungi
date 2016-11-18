'use strict';

app.directive('ndPrompt', function($compile,queryModel) {
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
        selectedValue: '@',
        filter: '=',
        afterGetValues: '=',
        isPrompt: '@'
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

      $scope.queryModel = queryModel;


      $scope.setDatePatternFilterType = function(filter,option)
        {
          queryModel.setDatePatternFilterType(filter,option);
            var values = {};
            values.filterText1 = filter.filterText1;
            values.searchValue = filter.searchValue;
            values.filterValue = filter.filterValue;
            values.dateCustomFilterLabel = filter.dateCustomFilterLabel;
            values.filterText2 = filter.filterText2;

            $scope.onChange($scope.elementId,values);
        }



      $scope.getPrompt = function(elementID)
        {
        for (var p in $scope.prompts)
            {
            if ($scope.prompts[p].elementID == elementID)
                return $scope.prompts[p];

            }

        }

      $scope.clearFilter = function(filter)
      {

        filter.filterText1 = undefined;
        filter.searchValue = undefined;
        filter.filterValue = undefined;
        filter.dateCustomFilterLabel = undefined;
        filter.filterText2 = undefined;
        filter.filterLabel1 = undefined;
        filter.filterLabel2 = undefined;

        var values = {};
        values.filterText1 = filter.filterText1;
        values.searchValue = filter.searchValue;
        values.filterValue = filter.filterValue;
        values.dateCustomFilterLabel = filter.dateCustomFilterLabel;
        values.filterText2 = filter.filterText2;

        $scope.onChange($scope.elementId,values);
      }

      $scope.getPromptAsArray = function(elementID)
        {
            for (var p in $scope.prompts)
                {
                    if ($scope.prompts[p].elementID == elementID)
                        {
                            var theResult = [];
                            theResult.push($scope.prompts[p]);
                            return theResult;
                        }
                }
        }

      $scope.promptChanged = function(elementId) {
	        $scope.onChange(elementId,$scope.selectedValue);

        };

      $scope.onDateSet = function (newDate, oldDate, filter) {

          if (angular.isDate(newDate))
            {
                var year = newDate.getFullYear();
                var month = pad(newDate.getMonth()+1,2);
                var day = pad(newDate.getDate(),2);
                var theDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
                if (filter.filterType == 'in' || filter.filterType == 'notIn')
                {
                    if (!filter.filterText1)
                        filter.filterText1 = [];
                    filter.filterText1.push(theDate);
                } else
                    filter.filterText1 = theDate;

                filter.searchValue = theDate;
                filter.filterValue = theDate;
                filter.dateCustomFilterLabel = undefined;
            }

        var values = {};
        values.filterText1 = filter.filterText1;
        values.searchValue = filter.searchValue;
        values.filterValue = filter.filterValue;
        values.dateCustomFilterLabel = filter.dateCustomFilterLabel;
        values.filterText2 = filter.filterText2;

        $scope.onChange($scope.elementId,values);
    }

      $scope.onDateEndSet = function (newDate, oldDate, filter) {
        if (angular.isDate(newDate))
            {
                var year = newDate.getFullYear();
                var month = pad(newDate.getMonth()+1,2);
                var day = pad(newDate.getDate(),2);
                var theDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
                filter.filterText2 = theDate;
                filter.dateCustomFilterLabel = undefined;
            }
        var values = {};
        values.filterText1 = filter.filterText1;
        values.searchValue = filter.searchValue;
        values.filterValue = filter.filterValue;
        values.dateCustomFilterLabel = filter.dateCustomFilterLabel;
        values.filterText2 = filter.filterText2;

        $scope.onChange($scope.elementId,values);
    }

    $scope.filterSelectChanged = function(item,filter)
    {
        var theResult = '';

        for (var i in filter.searchValue)
            {
                theResult = theResult + filter.searchValue[i][filter.id]
                if (i < filter.searchValue.length-1)
                    theResult += ';';
            }
        filter.filterText1 = theResult;
        //filter.searchValue = theResult;
        var values = {};
        values.filterText1 = filter.filterText1;
        values.searchValue = filter.searchValue;
        values.filterValue = filter.filterValue;
        values.dateCustomFilterLabel = filter.dateCustomFilterLabel;

        $scope.onChange($scope.elementId,values);


        /*
        promptModel.filterSelectChanged(item,filter, function(filterText) {
            //$scope.getDataForPreview();
            $scope.processStructure();
        });*/
    }

    $scope.funcAsync = function(filter, search)
    {
        queryModel.getDistinctFiltered(filter,search, function(data,sql){
            filter.values = data;
        });
    }

    $scope.getDistinctValues = function(filter)
    {
        $scope.showList = true;
        $scope.selectedFilter = filter;
        console.log('the filter data',filter);
        if ($scope.selectedFilter.data == undefined || $scope.selectedFilter.data.length == 0)
            {
        queryModel.getDistinct($scope,filter, function(theData,sql){
                $scope.selectedFilter = filter;
                $scope.afterGetValues(filter,theData);

        });
            }

        //promptModel.getDistinctValues($scope, filter);
    };

    $scope.selectSearchValue = function(selectedValue)
    {
        $scope.selectedFilter.searchValue = selectedValue;
        var searchValue = '';
        if ($scope.selectedFilter.filterType == 'in' || $scope.selectedFilter.filterType == 'notIn') {
            for (var i in $scope.selectedFilter.searchValue) {
                searchValue += $scope.selectedFilter.searchValue[i][$scope.selectedFilter.id];
                if (i < $scope.selectedFilter.searchValue.length-1) {
                    searchValue += ';';
                }
            }
        }
        else {
            searchValue = $scope.selectedFilter.searchValue;
        }

        $scope.selectedFilter.filterText1 = searchValue;
        $scope.selectedFilter.filterValue = searchValue;
        $scope.showList = false;

        var values = {};
        values.filterText1 = $scope.selectedFilter.filterText1;
        values.searchValue = $scope.selectedFilter.searchValue;
        values.filterValue = $scope.selectedFilter.filterValue;
        values.dateCustomFilterLabel = $scope.selectedFilter.dateCustomFilterLabel;

        $scope.onChange($scope.elementId,values);

    }

    $scope.inputChanged = function(filter)
    {

    filter.searchValue = filter.filterText1;
    filter.filterValue = filter.filterText1;


         var values = {};
        values.filterText1 = filter.filterText1;
        values.searchValue = filter.searchValue;
        values.filterValue = filter.filterValue;
        values.dateCustomFilterLabel = filter.dateCustomFilterLabel;

        $scope.onChange($scope.elementId,values);
    }

    $scope.updateCondition = function(filter, condition) {
        filter.conditionType = condition.conditionType;
        filter.conditionLabel = condition.conditionLabel;
        queryModel.updateCondition(filter, condition);
    };

    $scope.conditionTypes = queryModel.conditionTypes;

    $scope.getElementFilterOptions = function(elementType)
    {
        return queryModel.getElementFilterOptions(elementType);
    }

    $scope.setFilterType = function(filter, filterOption)
    {
        queryModel.setFilterType(filter, filterOption);
        console.log('the filter',filter);
        if (filter.filterType == 'null' || filter.filterType == 'notNull')
            {
            var values = {};
        values.filterText1 = filter.filterText1;
        values.searchValue = filter.searchValue;
        values.filterValue = filter.filterValue;
        values.dateCustomFilterLabel = filter.dateCustomFilterLabel;

        $scope.onChange($scope.elementId,values);

            }
    }


    function pad(num, size) {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        while (s.length < size) s = "0" + s;
        return s;
    }
    }
  }



});
