/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 04/08/15
 * Time: 13:21
 * To change this template use File | Settings | File Templates.
 */

app.service('promptModel', ['reportModel' , function ( reportModel) {

    this.getDistinctValues = function($scope, filter)
    {
        $scope.selectedFilter = filter;
        $scope.selectedFilter.searchValue = [];

        $('#searchModal').modal('show');

        reportModel.getDistinct($scope,filter);
    };

    this.toggleSelection = function toggleSelection($scope,value) {
        var idx = $scope.selectedFilter.searchValue.indexOf(value);

        if (idx > -1) {
            $scope.selectedFilter.searchValue.splice(idx, 1);
        }
        else {
            $scope.selectedFilter.searchValue.push(value);
        }
    };

    this.selectSearchValue = function($scope) {
        var searchValue = '';
        console.log('selected values '+searchValue);
        //console.log($scope.selectedFilter.searchValue);
        if ($scope.selectedFilter.filterType == 'in' || $scope.selectedFilter.filterType == 'notIn') {
            for (var i in $scope.selectedFilter.searchValue) {
                searchValue += $scope.selectedFilter.searchValue[i][$scope.selectedFilter.elementName];

                if (i < $scope.selectedFilter.searchValue.length-1) {
                    searchValue += ';';
                }
            }
        }
        else {
            searchValue = $scope.selectedFilter.searchValue;
        }

        $scope.selectedFilter.filterText1 = searchValue;

        $('#searchModal').modal('hide');
    };


    this.checkPrompts = function($scope, done)
    {
        var emptyFound = [];
        $scope.promptMessage = '';

        if ($scope.prompts.length > 0)
        {
            for (var p in $scope.prompts) {

                if ($scope.prompts[p].promptMandatory == true)
                    if (!$scope.prompts[p].filterText1 || $scope.prompts[p].filterText1 == '')
                    {
                        emptyFound.push($scope.prompts[p].objectLabel);
                    }
            }
        }  else {
            done();
            return;

        }



        if (emptyFound.length > 0)
        {
            var theFilters = '';
            for (var f in emptyFound) {
                theFilters += emptyFound[f];
                if (f < emptyFound.length -1)
                    theFilters += ', ';
            }
            if (emptyFound.length == 1)
                $scope.promptMessage = 'The following filter must be completed: '+theFilters;
            else
                $scope.promptMessage = 'The following filters must be completed: '+theFilters;
        }  else {
            this.completeDuplicatePrompts($scope, function(){
                done();
            });
        }

    }

    this.completeDuplicatePrompts = function ($scope, done)
    {
        console.log('Check for duplicate prompt');

        for (var d in $scope.duplicatePrompts)
        {
            prompt = $scope.duplicatePrompts[d];
            console.log('duplicated prompt '+prompt.objectLabel);


            for (var i in $scope.prompts)
            {
                if ($scope.prompts[i].datasourceID == prompt.datasourceID && $scope.prompts[i].collectionID == prompt.collectionID && $scope.prompts[i].elementID == prompt.elementID)
                {
                    prompt.filterText1 = $scope.prompts[i].filterText1;
                    prompt.filterText2 = $scope.prompts[i].filterText2;
                    console.log('assigned duplicated prompt value');
                }
            }
        }

        done();
        return;
    }


    this.getPrompts = function($scope,report, done)
    {
        if (!$scope.prompts)
            $scope.prompts = [];

        for (var i in report.query.datasources) {
            var dataSource = report.query.datasources[i];

            for (var c in dataSource.collections) {
                var collection = dataSource.collections[c];
                for (var f in collection.filters) {
                    var filter = collection.filters[f];
                    if (filter.filterPrompt == true)
                    {
                        filter.reportID = report._id;
                        if (checkIfPromptExists($scope,filter) == true)
                        {
                            if (!$scope.duplicatePrompts)
                                $scope.duplicatePrompts = [];
                            $scope.duplicatePrompts.push(filter);
                            console.log('ADD a duplicate prompt');
                        } else {
                            $scope.prompts.push(filter);
                        }

                        //console.log('added for '+report._id);
                    }
                }
            }
        }

        done(0);
        return;

    }

    this.getPromptsForReport_new = function(report, done)
    {
       console.log('getPromptsForReport');
        var thePrompts = [];


        var duplicatePrompts = [];

        for (var i in report.query.datasources) {
            var dataSource = report.query.datasources[i];

            for (var c in dataSource.collections) {
                var collection = dataSource.collections[c];
                for (var f in collection.filters) {
                    var filter = collection.filters[f];
                    if (filter.filterPrompt == true)
                    {
                        filter.reportID = report._id;
                        if (checkIfPromptExists(thePrompts,filter) == true)
                        {
                            duplicatePrompts.push(filter);
                        } else {
                            thePrompts.push(filter);
                            console.log(JSON.stringify(filter));
                        }
                    }
                }
            }
        }

        done(thePrompts,duplicatePrompts);
        return;

    }


    function checkIfPromptExists_new(prompts,prompt)
    {
        console.log('if exits',JSON.stringify(prompts));
        for (var i in prompts)
        {
            if (prompts[i].datasourceID == prompt.datasourceID && prompts[i].collectionID == prompt.collectionID && prompts[i].elementID == prompt.elementID)
            {
                return true;
            }
        }

    }


    function checkIfPromptExists($scope,prompt)
    {

        for (var i in $scope.prompts)
        {
            if ($scope.prompts[i].datasourceID == prompt.datasourceID && $scope.prompts[i].collectionID == prompt.collectionID && $scope.prompts[i].elementID == prompt.elementID)
            {
                return true;
            }
        }

    }





    return this;

}]);
