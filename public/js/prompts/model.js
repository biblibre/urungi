/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 04/08/15
 * Time: 13:21
 * To change this template use File | Settings | File Templates.
 */

app.service('promptModel', ['queryModel' , function (queryModel) {

    this.getDistinctValues = function($scope, filter)
    {
        $scope.selectedFilter = filter;
        if (!$scope.selectedFilter.searchValue)
            $scope.selectedFilter.searchValue = [];

        $('#searchModal').modal('show');

        queryModel.getDistinct($scope,filter);
    };

    this.toggleSelection = function toggleSelection($scope,value) {
        if( typeof $scope.selectedFilter.searchValue === 'string' ) {
            $scope.selectedFilter.searchValue = [];
        }
        
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
        if ($scope.selectedFilter.filterType == 'in' || $scope.selectedFilter.filterType == 'notIn') {
            for (var i in $scope.selectedFilter.searchValue) {
                console.log('multiple values',$scope.selectedFilter.searchValue);
                searchValue += $scope.selectedFilter.searchValue[i][$scope.selectedFilter.collectionID.toLowerCase()+'_'+$scope.selectedFilter.elementName];
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

    this.isValueSelected = function($scope,value)
    {
        //console.log('checking if is selected this value',value);

        var found = false;
        if ($scope.selectedFilter.filterType == 'in' || $scope.selectedFilter.filterType == 'notIn') {
            for (var i in $scope.selectedFilter.searchValue) {
                if (value == $scope.selectedFilter.searchValue[i][$scope.selectedFilter.collectionID.toLowerCase()+'_'+$scope.selectedFilter.elementName])
                {
                  found = true;

                }
            }
        }

        return found;
    }


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


    this.getPromptsV0 = function($scope,report, done)
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

                    }
                }
            }
        }

        done(0);
        return;

    }

    this.getPrompts = function($scope,report, done)
    {
        if (!$scope.prompts)
            $scope.prompts = [];
            //TODO: Duplicate prompts

                for (var g in report.query.groupFilters) {

                    for (var f in report.query.groupFilters[g].filters)
                       {
                            var filter = report.query.groupFilters[g].filters[f];
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


    this.getPromptsForQuery = function($scope,query)
    {

            scanFilters4Prompt($scope,query.filters,query.id);
    }

    function scanFilters4Prompt($scope,filters,queryID)
    {
            for (var g in filters) {
                            var filter = filters[g];//.filters[f];

                            if (filter.filterPrompt == true)
                            {
                                filter.queryID = queryID;
                                if (checkIfPromptExists($scope,filter) == true)
                                {
                                    if (!$scope.duplicatePrompts)
                                        $scope.duplicatePrompts = [];
                                    $scope.duplicatePrompts.push(filter);

                                } else {
                                    $scope.prompts.push(filter);
                                }

                            }

                            if (filter.group == true)
                            {

                                scanFilters4Prompt($scope,filter.filters,queryID)
                            }

                }

    }


    this.updatePromptsForQuery = function($scope,query,prompt,done)
    {
            updateFilters4Prompt($scope,query.filters,prompt);

            updateFilters4Prompt($scope,query.query.groupFilters,prompt);

            for (var d in query.query.datasources)
            {
                for (var c in query.query.datasources[d].collections)
                    {
                    updateFilters4Prompt($scope,query.query.datasources[d].collections[c].filters,prompt);

                    }
            }

            done(query);
    }

    function updateFilters4Prompt($scope,filters,prompt)
    {

        var hasPrompts = false;

            for (var g in filters) {
                            var filter = filters[g];

                            if (filter.filterPrompt == true)
                            {
                                if (prompt.elementID == filter.elementID)
                                    {
                                    console.log('we are here',prompt.searchValue,prompt);
                                    filter.filterText1 = prompt.filterText1;
                                    filter.searchValue = prompt.searchValue;
                                    }

                            }

                            if (filter.group == true)
                            {

                                updateFilters4Prompt($scope,filter.filters,prompt)
                            }

                }

    }

    return this;

}]);
