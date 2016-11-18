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


    this.getFilterValues = function(filter,done)
    {

        queryModel.getFilterValues(filter,function(data,sql){
           //console.log('the data',data);
           filter.data = data;
            console.log('getting values for filter',filter);
           done();
       });
    }

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



    this.getPromptsForReportsV2 = function(reports,done)
    {
        //clean it up the environment for prompts
        prompts = [];
        duplicatePrompts = [];

        //1st get all prompts and common prompts over all the reports
        for (var r in reports)
            {
                getPromptsV2(reports[r]);
            }

        for (var p in prompts)
            {
                this.getFilterValues(prompts[p],function(){

                });
            }

        done(prompts);

    }



    var prompts = [];
    var duplicatePrompts = [];
    var promptMessage = '';


    this.getPromptsV2 = function(report,done)
    {
        done(getPromptsV2(report));
    }

    function getPromptsV2(report)
    {
          console.log('this is the report',report);
        var reportPrompts = [];
           for (var g in report.query.groupFilters) {

                    //for (var f in report.query.groupFilters[g].filters)
                      // {
                            var filter = report.query.groupFilters[g];
                            if (filter.filterPrompt == true)
                            {
                                filter.reportID = report.id;
                                if (checkIfPromptExistsV2(prompts,filter) == true)
                                {
                                    reportPrompts.push(filter);
                                    duplicatePrompts.push(filter);
                                } else {
                                    prompts.push(filter);
                                    reportPrompts.push(filter);
                                }

                            }
                        //}
                }
        console.log('founded prompts',reportPrompts);
        return reportPrompts;
    }

function checkIfPromptExistsV2(promptslist,prompt)
    {

        for (var i in promptslist)
        {
            if (promptslist[i].datasourceID == prompt.datasourceID && promptslist[i].collectionID == prompt.collectionID && promptslist[i].elementID == prompt.elementID)
            {
                return true;
            }
        }

    }

 this.checkPromptsV2 = function()
    {
        var emptyFound = [];
        promptMessage = '';

        if (prompts.length > 0)
        {
            for (var p in prompts) {

                if (prompts[p].promptMandatory == true)
                    if (!prompts[p].filterText1 || prompts[p].filterText1 == '')
                    {
                        emptyFound.push(prompts[p].objectLabel);
                    }
            }
        }  else {
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
                promptMessage = 'The following filter must be completed: '+theFilters;
            else
                promptMessage = 'The following filters must be completed: '+theFilters;
        }  else {
            this.completeDuplicatePromptsV2();
        }

    }


 this.completeDuplicatePromptsV2 = function ()
    {
        for (var d in duplicatePrompts)
        {
            prompt = duplicatePrompts[d];

            for (var i in prompts)
            {
                if (prompts[i].datasourceID == prompt.datasourceID && prompts[i].collectionID == prompt.collectionID && prompts[i].elementID == prompt.elementID)
                {
                    prompt.filterText1 = prompts[i].filterText1;
                    prompt.filterText2 = prompts[i].filterText2;
                }
            }
        }

        return;
    }


    this.getPromptsForReport_new = function(report, done)
    {
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


    this.funcAsync = function(filter, search,done) //SELECT2
    {
        funcAsync(filter,search,done);
    }

    function funcAsync(filter,search, done) {   //SELECT2
        queryModel.getDistinctFiltered(filter,search, function(data,sql){
            filter.values = data;
            done(data);
        });
    }

    this.filterSelectChanged = function(item, filter, done)
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
        done();
    }

    return this;

}]);


