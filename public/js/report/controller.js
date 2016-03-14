/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 10/01/15
 * Time: 08:01
 * To change this template use File | Settings | File Templates.
 */

'use strict';


/**
 *
 * https://github.com/jiren/filter.js
 *
 * Filter.js is client-side JSON objects filter and render html elements. Multiple filter criteria can be specified and used in conjunction with each other.
 */

app.controller('reportCtrl', function ($scope, connection, $routeParams, reportModel, $compile, promptModel,queryService, dashboardModel, $filter, $rootScope) {
    $scope.searchModal = 'partials/report/searchModal.html';
    $scope.promptsBlock = 'partials/report/promptsBlock.html';
    $scope.dateModal = 'partials/report/dateModal.html';
    $scope.linkModal = 'partials/report/linkModal.html';
    $scope.repeaterTemplate = 'partials/report/repeater.html';
    $scope.publishModal  = 'partials/report/publishModal.html';
    $scope.columnFormatModal = 'partials/report/columnFormatModal.html';
    $scope.columnSignalsModal = 'partials/report/columnSignalsModal.html';

                $scope.selectedReport = {};
                $scope.selectedReport.draft = true;
                $scope.selectedReport.badgeStatus = 0;
                $scope.selectedReport.exportable = true;
                $scope.selectedReport.badgeMode = 1;
                $scope.selectedReport.properties = {};
                $scope.selectedReport.properties.xkeys = [];
                $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.columns = [];
                $scope.selectedReport.reportType = 'grid';


    $scope.reportID = $routeParams.reportID;
    $scope.queryID = $routeParams.queryID || false;
    $scope.metrics = ['Count'];
    $scope.rows = [];
    $scope.columns = [];
    $scope.order = [];
    $scope.loaded = false;
    $scope.filters = [];
    $scope.dataSources = [];
    $scope.preview = false;
    $scope.rootItem = {elementLabel: '', elementRole: 'root', elements: []};
    $scope.reverse = false;

    $scope.textAlign = [
        {name: 'left', value: 'left'},
        {name: 'right', value: 'right'},
        {name: 'center', value: 'center'}
    ];

    $scope.fontSizes = [
        {name: '8px', value: '8px'},
        {name: '9px', value: '9px'},
        {name: '10px', value: '10px'},
        {name: '11px', value: '11px'},
        {name: '12px', value: '12px'},
        {name: '13px', value: '13px'},
        {name: '14px', value: '14px'},
        {name: '15px', value: '15px'},
        {name: '16px', value: '16px'},
        {name: '17px', value: '17px'},
        {name: '18px', value: '18px'},
        {name: '19px', value: '19px'},
        {name: '20px', value: '20px'}
    ];

    $scope.fontWeights = [
        {name: 'normal', value: 'normal'},
        {name: 'bold', value: 'bold'},
        {name: 'bolder', value: 'bolder'},
        {name: 'lighter', value: 'lighter'}
    ];

    $scope.fontStyles = [
        {name: 'normal', value: 'normal'},
        {name: 'italic', value: 'italic'},
        {name: 'oblique', value: 'oblique'}
    ];

    $scope.changed = function()
    {

    }

    function pad(num, size) {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        while (s.length < size) s = "0" + s;
        return s;
    }

    $scope.onDateSet = function (newDate, oldDate, filter) {

        //console.log(filter);
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

        filter.dateCustomFilterLabel = undefined;
    }

    $scope.removeItem = function(item, collection)
    {
       var id = collection.indexOf(item);
        collection.splice(id,1);
    }

    $scope.onDateEndSet = function (newDate, oldDate, filter) {
        var year = newDate.getFullYear();
        var month = pad(newDate.getMonth()+1,2);
        var day = pad(newDate.getDate(),2);
        var theDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
        filter.filterText2 = theDate;
        filter.dateCustomFilterLabel = undefined;
    }



    $scope.selectDateFilter = function(filter)
    {
        console.log('the date modal')
        $scope.selectedFilter = filter;
        $('#dateModal').modal('show');
    }

    $scope.setDateFilter = function() {
        $scope.selectedFilter.filterText1 = date;
        $scope.selectedFilter.filterLabel1 = date;
        $('#dateModal').modal('hide');
    }

    $scope.filterStringOptions = [
                                    {value:"equal",label:"equal"},
                                    {value:"diferentThan",label:"different than"},
                                    {value:"biggerThan",label:"bigger than"},
                                    {value:"biggerOrEqualThan",label:"bigger or equal than"},
                                    {value:"lessThan",label:"less than"},
                                    {value:"lessOrEqualThan",label:"less or equal than"},
                                    {value:"between",label:"between"},
                                    {value:"notBetween",label:"not between"},
                                    {value:"contains",label:"contains"},
                                    {value:"notContains",label:"not contains"},
                                    {value:"startWith",label:"start with"},
                                    {value:"notStartWith",label:"not start with"},
                                    {value:"endsWith",label:"ends with"},
                                    {value:"notEndsWith",label:"not ends with"},
                                    {value:"like",label:"like"},
                                    {value:"notLike",label:"not like"},
                                    {value:"null",label:"is null"},
                                    {value:"notNull",label:"is not null"},
                                    {value:"in",label:"in"},
                                    {value:"notIn",label:"not in"}
                                    ];
    $scope.filterArrayOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},   //TODO: el different than no está funcionando
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"},
        {value:"in",label:"in"},
        {value:"notIn",label:"not in"}
    ];

    $scope.filterNumberOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"},
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"},
        {value:"in",label:"in"},
        {value:"notIn",label:"not in"}
        /* RANKING
        el (los) primeros
        el (los) ultimos
        el (los) primeros %
        el (los) ultimos %

         */

    ];

    $scope.signalOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"}
    ];

    $scope.dateFilters = [
        {value:"#WST-TODAY#",label:"Today"},
        {value:"#WST-THISWEEK#",label:"This week"},
        {value:"#WST-THISMONTH#",label:"This month"},
        {value:"#WST-THISYEAR#",label:"This year"},
        {value:"#WST-FIRSTQUARTER#",label:"First quarter"},
        {value:"#WST-SECONDQUARTER#",label:"Second quarter"},
        {value:"#WST-THIRDQUARTER#",label:"Third quarter"},
        {value:"#WST-FOURTHQUARTER#",label:"Fourth quarter"},
        {value:"#WST-FIRSTSEMESTER#",label:"First semester"},
        {value:"#WST-SECONDSEMESTER#",label:"Second semester"},
        {value:"#WST-YESTERDAY#",label:"Yesterday"},
        {value:"#WST-LASTWEEK#",label:"Last week"},
        {value:"#WST-LASTMONTH#",label:"Last month"},
        {value:"#WST-LASTYEAR#",label:"Last year"},
        {value:"#WST-LYFIRSTQUARTER#",label:"Last year first quarter"},
        {value:"#WST-LYSECONDQUARTER#",label:"Last year second quarter"},
        {value:"#WST-LYTHIRDQUARTER#",label:"Last year third quarter"},
        {value:"#WST-LYFOURTHQUARTER#",label:"Last year fourth quarter"},
        {value:"#WST-LYFIRSTSEMESTER#",label:"Last year first semester"},
        {value:"#WST-LYSECONDSEMESTER#",label:"Last year second semester"}
    ]

    $scope.filterDateOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"},
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"},
        //TODO: in , not in or date elements
        {value:"in",label:"in"},
        {value:"notIn",label:"not in"}
    ];

    $scope.fieldsAggregations = {
        'number': [
            {name: 'Sum', value: 'sum'},
            {name: 'Avg', value: 'avg'},
            {name: 'Min', value: 'min'},
            {name: 'Max', value: 'max'}
        ],
        'date': [
            {name: 'Year', value: 'year'},
            {name: 'Month', value: 'month'},
            {name: 'Day', value: 'day'}
            /*{name: 'Semester', value: 'semester'},
            {name: 'Quarter', value: 'quarter'},
            {name: 'Trimester', value: 'trimester'}*/
        ]
    };



    $scope.stringVariables = [
        {value:"toUpper",label:"To Upper"},
        {value:"toLower",label:"To Lower"}
    ];

    $scope.filters = [
        {
            group: true,
            filters: []
        }
    ];

    $scope.getReports = function(params) {
        var params = (params) ? params : {};

        console.log(params);

        connection.get('/api/reports/find-all', params, function(data) {
            $scope.reports = data;
            console.log($scope.reports);
        });
    };


    $scope.reportClicked = function(reportID,parameters)
    {
        console.log('reportcliced ',reportID,parameters);
    }

    $scope.initForm = function() {
        $scope.dataMode = 'preview';
        if ($routeParams.reportID)
            if ($routeParams.reportID == 'true') {
                $scope.selectedReport = {};
                $scope.selectedReport.draft = true;
                $scope.selectedReport.badgeStatus = 0;
                $scope.selectedReport.exportable = true;
                $scope.selectedReport.badgeMode = 1;
                $scope.selectedReport.properties = {};
                $scope.selectedReport.properties.xkeys = [];
                $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.columns = [];
                $scope.selectedReport.reportType = 'grid';

                $scope.mode = 'add';

                console.log('entering in add mode for reports') ;
            }
              else {
                //This executes in edit mode
                reportModel.getReport($scope, $routeParams.reportID,'edit',false, function() {
                    generateQuery(function(){
                        $scope.processStructure(false);
                    });
                });
            }
        if ($routeParams.queryID)
            if ($routeParams.queryID == 'true') {
                $scope.isQuery = true;
                $scope.selectedReport = {};
                $scope.selectedReport.draft = true;
                $scope.selectedReport.badgeStatus = 0;
                $scope.selectedReport.exportable = true;
                $scope.selectedReport.badgeMode = 1;
                $scope.selectedReport.properties = {};
                $scope.selectedReport.properties.xkeys = [];
                $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.columns = [];
                $scope.selectedReport.reportType = 'grid';
                $scope.mode = 'add';
            }

    };

    $scope.saveQuery = function() {
        queryService.addQuery($scope.selectedReport);
    }

    $scope.getLayers = function() {
        connection.get('/api/layers/get-layers', {}, function(data) {
            $scope.errorMsg = (data.result === 0) ? data.msg : false;
            $scope.page = data.page;
            $scope.pages = data.pages;
            $scope.layers = data.items;
            //$scope.data = data;

            //console.log(JSON.stringify(data.items));

            //$scope.selectedLayer = data.items[0];
            $scope.rootItem.elements = data.items[0].objects;
            $scope.selectedLayer = data.items[0];
            $scope.selectedLayerID = data.items[0]._id;

            /*
            for (var i in $scope.data.items) {
                console.log($scope.data.items[i]);
                for (var z in $scope.data.items[i].params[0].schema) {
                    var dts = {};
                    dts.collection = $scope.data.items[i].params[0].schema[z];
                    dts.datasourceID = $scope.data.items[i]._id;

                    $scope.dataSources.push(dts);
                };
            } */
        });
    };

    $scope.changeLayer = function(selectedLayerID)
    {
        for (var i in $scope.layers)
        {
            if ($scope.layers[i]._id == selectedLayerID)
            {
                $scope.rootItem.elements = $scope.layers[i].objects;
                $scope.selectedLayer = $scope.layers[i];
                $scope.selectedLayerID = $scope.layers[i]._id;
            }
        }
    }

    $scope.getView = function (item) {
        if (item) {
            return 'nestable_item.html';
        }
        return null;
    };



    $scope.getElementFilterOptions = function(elementType)
    {
        //console.log(' es un '+elementType);

        if (elementType == 'array')
            return  $scope.filterArrayOptions;
        if (elementType == 'string')
           return  $scope.filterStringOptions;
        if (elementType == 'number')
            return  $scope.filterNumberOptions;
        if (elementType == 'date')
            return $scope.filterDateOptions
    }

    $scope.publishReport = function()
    {
        $scope.objectToPublish = selectedReport;
        $('#publishModal').modal('show');
    }

    $scope.unPublish = function()
    {
        connection.post('/api/reports/unpublish', {_id:selectedReport._id}, function(data) {
            selectedReport.isPublic = false;
            $('#publishModal').modal('hide');
        });
    }

    $scope.selectThisFolder = function(folderID)
    {
        connection.post('/api/reports/publish-report', {_id:selectedReport._id,parentFolder:folderID}, function(data) {
            selectedReport.parentFolder = folderID;
            selectedReport.isPublic = true;
            $('#publishModal').modal('hide');
        });
    }

    $scope.setFilterType = function(filter, filterOption)
    {
        filter.filterType = filterOption.value;
        filter.filterTypeLabel = filterOption.label;

        if (filter.filterType == 'in' || filter.filterType == 'notIn')
        {

            filter.filterText1 = [];
            filter.filterLabel1 = [];
        } else {
            filter.filterText1 = '';
            filter.filterLabel1 = '';
            filter.filterText2 = '';
            filter.filterLabel2 = '';
        }

        //set the appropiate interface for the choosed filter relation
    }

    $scope.getDistinctValues = function(filter)
    {
        promptModel.getDistinctValues($scope, filter);
    };


    $scope.selectSearchValue = function(searchValue)
    {
        promptModel.selectSearchValue($scope);
    };

    $scope.toggleSelection = function toggleSelection(value)
    {
        promptModel.toggleSelection($scope,value);
    };

    $scope.isValueSelected = function(value)
    {
        promptModel.isValueSelected($scope,value);
    }

    $scope.setHeight = function(element, height, correction) {
        var height = (height == 'full') ? $(document).height() : height;

        if (correction) height = height+correction;

        $('#'+element).css('height', height);
    };

    $scope.reportName = function () {
        $('#theReportNameModal').modal('show');
    };
    $scope.reportNameSave = function () {

        $('#theReportNameModal').modal('hide');
        $scope.save($scope.selectedReport);

        $('modal-backdrop').remove();

    };

    $scope.delete = function (reportID, reportName) {
        $scope.modalOptions = {};
        $scope.modalOptions.headerText = 'Confirm delete report'
        $scope.modalOptions.bodyText = 'Are you sure you want to delete the report:'+' '+reportName;
        $scope.modalOptions.ID = reportID;
        $('#deleteModal').modal('show');
    };

    $scope.deleteConfirmed = function (reportID) {


        connection.post('/api/reports/delete/'+reportID, {id:reportID}, function(result) {
            if (result.result == 1) {
                $('#deleteModal').modal('hide');

                var nbr = -1;
                for (var i in $scope.reports.items)
                {
                    if ($scope.reports.items[i]._id === reportID)
                        nbr = i;
                }

                if (nbr > -1)
                    $scope.reports.items.splice(nbr,1);
            }
        });



    };

    $scope.add = function() {

            $scope.selectedReport = {};
            $scope.selectedReport.draft = true;
            $scope.selectedReport.badgeStatus = 0;
            $scope.selectedReport.exportable = true;
            $scope.selectedReport.badgeMode = 1;

            $scope.mode = 'add';
            $scope.subPage= '/partial/custom/Badges/form.html';

    };

    $scope.save = function(data) {

        $('#reportNameModal').modal('hide');


        generateQuery(function(){

                data.query = $scope.query;

                if ($scope.selectedReport.reportType == 'grid')
                {
                    $scope.selectedReport.properties = {};
                    $scope.selectedReport.properties.columns = $scope.columns;
                }

                if ($scope.mode == 'add') {
                    connection.post('/api/reports/create', data, function(data) {
                        if (data.result == 1) {
                           setTimeout(function () {
                            $scope.goBack();
                            }, 400);
                        }
                    });
                }
                else {
                    connection.post('/api/reports/update/'+data._id, data, function(result) {
                        if (result.result == 1) {

                            //$scope.goBack();
                            setTimeout(function () {
                            $scope.goBack();
                            }, 400);
                        }
                    });
        }

        });
    };


    function setReportDiv(id)
    {
        $('#reportLayout').empty();
        var generatedHTML = '<div id="'+$routeParams.reportID+'" class="panel-body reportPageBlockDesktop" style="min-height=400px;width:100%;height:500px;" ng-init="getReportData2()">';

        var $div = $(generatedHTML);
        $('#reportLayout').append($div);
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });
    }

    $scope.getReportDiv = function()
    {
        var isLinked = false;

        if ($routeParams.elementID && $routeParams.elementValue)
               isLinked = true;


        reportModel.getReport($scope, $routeParams.reportID,'execute',isLinked, function(report) {
            if (report)
            {
                promptModel.getPrompts($scope,report, function(){
                    if ($routeParams.elementID && $routeParams.elementValue)
                    {
                        for (var p in $scope.prompts)
                        {
                            if ($scope.prompts[p].elementID == $routeParams.elementID)
                            {
                                $scope.prompts[p].filterText1 = $routeParams.elementValue;
                            }
                        }

                        $scope.checkPrompts();


                    }  else {
                        if ($scope.prompts.length > 0)
                        {
                            //console.log('loading prompts modal');
                            $scope.showPrompts = true;
                        } else {
                            setReportDiv($routeParams.reportID);
                        }
                    }
                });
            }
        });

    }

    $scope.checkPrompts = function()
    {
        promptModel.checkPrompts($scope, function (){
            setReportDiv();
        });
    }

    $scope.cellClick = function(hashID,row,elementID,elementName)
    {
        //console.log('cell click',row,elementID,elementName,reportModel.hierarchy1.elements);

        //TODO: If has been expanded before, no click then...
        if (!row.expandedHierarchy || row.expandedHierarchy == false)
        {
            row.expandedHierarchy = true;

            var hasChild = false;
            var nextElement = null;
            var element = null;

            for (var h in reportModel.hierarchy1.elements)
            {
                if (reportModel.hierarchy1.elements[h].elementID == elementID && h < reportModel.hierarchy1.elements.length -1)
                {
                    hasChild = true;
                    nextElement = reportModel.hierarchy1.elements[parseInt(h)+1];
                    element = reportModel.hierarchy1.elements[h];
                    console.log('this is the next element',h,h+1,reportModel.hierarchy1.elements[h+1],reportModel.hierarchy1.elements[h]);
                }
            }

            if (hasChild == true)
            {
                reportModel.getHierarchy($scope,hashID,row,elementID,element,row,nextElement,event.target.parentNode)
            }
        }

    }



    $scope.closePromptsBlock = function()
    {
        $scope.showPrompts = false;
    }

    $scope.openPromptsBlock = function()
    {

        $scope.showPrompts = true;
    }



    $scope.getReportData2 = function()
    {

            reportModel.getReportBlockForPreview($scope,$scope.selectedReport,$scope.selectedReport._id, function(errorCode) {

                if (errorCode != 0)
                {
                    var el = document.getElementById($scope.selectedReport._id);

                    var theHTML = '';
                    if (errorCode == 1)
                        theHTML = '<div class="alert">Report not found!</div>';
                    if (errorCode == 2)
                        theHTML = '<div class="alert">Chart type not found!</div>';
                    if (errorCode == 3)
                        theHTML = '<div class="alert">No data Found!</div>';

                    if (el)
                    {
                        var $div = $(theHTML);
                        angular.element(el).append($div);
                        //el.append($div);
                        angular.element(document).injector().invoke(function($compile) {
                            var scope = angular.element($div).scope();
                            $compile($div)(scope);
                        });
                    }
                }
            });


    }




    $scope.getReportDivForPreview = function()
    {
        if ($scope.selectedReport.reportType == 'grid')
        {

            $scope.selectedReport.properties.columns = $scope.columns;
        }



        $scope.selectedReport.query = $scope.query;

        var generatedHTML = '<div id="XXXXXXXXXX" class="panel-body reportPageBlockDesktop" style="max-height:500px;width:100%;position:relative;" ng-init="getReportDataForPreview()">';

        var $div = $(generatedHTML);
        $('#reportLayout').append($div);
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });
    }


    $scope.getReportDataForPreview = function()
    {
        /*
         var generatedHTML = '<div id="'+$routeParams.reportID+'" class="panel-body" style="heigth=400px;width:100%">';

         var $div = $(generatedHTML);
         $(reportLayout).append($div);
         angular.element(document).injector().invoke(function($compile) {
         var scope = angular.element($div).scope();
         $compile($div)(scope);
         });
         */

        reportModel.getReportBlockForPreview($scope,$scope.selectedReport,'XXXXXXXXXX', function(errorCode) {

            if (errorCode != 0)
            {
                var el = document.getElementById('XXXXXXXXXX');

                var theHTML = '';
                if (errorCode == 1)
                    theHTML = '<div class="alert">Report not found!</div>';
                if (errorCode == 2)
                    theHTML = '<div class="alert">Chart type not found!</div>';
                if (errorCode == 3)
                    theHTML = '<div class="alert">No data Found!</div>';

                if (el)
                {
                    var $div = $(theHTML);
                    angular.element(el).append($div);
                    //el.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)(scope);
                    });
                }
            }
        });
    }

    $scope.getReportData = function()
    {
        /*
        var generatedHTML = '<div id="'+$routeParams.reportID+'" class="panel-body" style="heigth=400px;width:100%">';

        var $div = $(generatedHTML);
        $(reportLayout).append($div);
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });
        */

        reportModel.getReportBlock($scope,$routeParams.reportID, function(errorCode) {

            if (errorCode != 0)
            {
                var el = document.getElementById($routeParams.reportID);

                var theHTML = '';
                if (errorCode == 1)
                    theHTML = '<div class="alert">Report not found!</div>';
                if (errorCode == 2)
                    theHTML = '<div class="alert">Chart type not found!</div>';
                if (errorCode == 3)
                    theHTML = '<div class="alert">No data Found!</div>';

                if (el)
                {
                    var $div = $(theHTML);
                    angular.element(el).append($div);
                    //el.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)(scope);
                    });
                }
            }
        });
    }

    $scope.getCubes = function()
    {
        console.log('entering getCubes');
        var data = [];
        var cube = {cubeID:'123456789',cubeName:'cube1',cubeLabel:'cuabe 1',cubeDescription:'Descripción del cubo 1', dimmensions:[
            {objectName:'nombreCampo',objectLabel:'etiqueta campo 1',objectType:'DIM',collectionID:'theCollection',connectionID:'theConnection',cubeID:'theCube',objectDescription:'the description for the object'},
            {objectName:'nombreCampo',objectLabel:'etiqueta campo 2',objectType:'DIM',collectionID:'theCollection',connectionID:'theConnection',cubeID:'theCube',objectDescription:'the description for the object'}

        ], measures: [
            {objectName:'nombreCampo',objectLabel:'measure 1',objectType:'MEA',collectionID:'theCollection',connectionID:'theConnection',cubeID:'theCube',objectDescription:'the description for the object'},
            {objectName:'nombreCampo',objectLabel:'measure 2',objectType:'MEA',collectionID:'theCollection',connectionID:'theConnection',cubeID:'theCube',objectDescription:'the description for the object'}

        ]};
        data.push(cube);
        var cube = {cubeID:'000006789',cubeName:'cube2',cubeLabel:'cuabe 2',cubeDescription:'Descripción del cubo 2'};
        data.push(cube);
        $scope.cubes = data;
    }


    $scope.getDataObjects = function()
    {

        console.log('entering getDataObjects');
        var data = [];


        var data1 = {objectName:'nombreCampo',objectLabel:'etiqueta campo',objectType:'DIM',collectionID:'theCollection',connectionID:'theConnection',cubeID:'theCube',objectDescription:'the description for the object'};

        for (var t in $scope.metadata.tables) {
            var table = {label: $scope.metadata.tables[t].name, id: $scope.metadata.tables[t].id, type: 'folder', children: []};

            for (var f in $scope.metadata.tables[t].fields) {
                var field = {label: $scope.metadata.tables[t].fields[f].alias, id: $scope.metadata.tables[t].fields[f].id, type: $scope.metadata.tables[t].fields[f].type};

                table.children.push(field);
            }

            data.push(table);
        }

        //Types: String, Object

        $scope.treedata = data;

        /*
        console.log(JSON.stringify(data));
            [
                { "label" : "User", "id" : "role1", "children" : [
                    { "label" : "subUser1", "id" : "role11", "children" : [] },
                    { "label" : "subUser2", "id" : "role12", "children" : [
                        { "label" : "subUser2-1", "id" : "role121", "children" : [
                            { "label" : "subUser2-1-1", "id" : "role1211", "children" : [] },
                            { "label" : "subUser2-1-2", "id" : "role1212", "children" : [] }
                        ]}
                    ]}
                ]},
                { "label" : "Admin", "id" : "role2", "children" : [] },
                { "label" : "Guest", "id" : "role3", "children" : [] }
            ];*/

        /*
        $('#myTree').tree({
            dataSource: function(options, callback){
                setTimeout(function () {

                    callback({ data: [
                        { name: 'Test Folder 1', type: 'folder', additionalParameters: { id: 'F1' },
                            data: [
                                { name: 'Test Sub Folder 1', type: 'folder', additionalParameters: { id: 'FF1' } },
                                { name: 'Test Sub Folder 2', type: 'folder', additionalParameters: { id: 'FF2' } },
                                { name: 'Test Item 2 in Folder 1', type: 'item', additionalParameters: { id: 'FI2' } }
                            ]
                        },
                        { name: 'Test Folder 2', type: 'folder', additionalParameters: { id: 'F2' } },
                        { name: 'Province', type: 'item', additionalParameters: { id: 'province' } },
                        { name: 'Party', type: 'item', additionalParameters: { id: 'party' } },
                        { name: 'Gender', type: 'item', additionalParameters: { id: 'gender' } },
                        { name: 'Age Bin', type: 'item', additionalParameters: { id: 'agebin' } },
                        { name: 'Name', type: 'item', additionalParameters: { id: 'name' } }
                    ]});

                }, 400);
            },
            multiSelect: true,
            cacheItems: true,
            folderSelect: false
        });
        */


    }

    $scope.onReportAction = function(actionType,targetID,targetFilters)
    {
        console.log('estamos entrando en la accion del informe');

        //actions:[{actionEvent:"onRowClick",actionType:"goToDashBoard",targetID:"clientDashboard",targetFilters:['customerID'];
        if (actionType == 'goToDashboard')
        {
            //window.location.href="/home/#/my-employee-profile";
            window.location.hash = '/dashboards/'+targetID;
        }

    }

    $scope.horiz = function()
    {
        console.log('soy horiz');
    }

    $scope.remove = function(object,type)
    {
        if (type == 'column')
        {
            if ($scope.selectedReport.properties.xkeys)
                $scope.removeFromArray($scope.selectedReport.properties.xkeys, object);
            if ($scope.selectedReport.properties.ykeys)
                $scope.removeFromArray($scope.selectedReport.properties.ykeys, object);
            if ($scope.columns)
                $scope.removeFromArray($scope.columns, object);
        }

        if (type == 'xkey')
        {
            if ($scope.selectedReport.properties.xkeys)
                $scope.removeFromArray($scope.selectedReport.properties.xkeys, object);
            if ($scope.columns)
                $scope.removeFromArray($scope.columns, object);
        }

        if (type == 'ykey')
        {
            if ($scope.selectedReport.properties.ykeys)
                $scope.removeFromArray($scope.selectedReport.properties.ykeys, object);
            if ($scope.columns)
                $scope.removeFromArray($scope.columns, object);
        }

        detectLayerJoins();

    }


    //};

    /*$scope.dropped = function(dragEl, dropEl) {
        // this is your application logic, do whatever makes sense
       // var drag = angular.element(dragEl);
       // var drop = angular.element(dropEl);

        var drop = angular.element(document.getElementById(dropEl));
        var drag = angular.element(document.getElementById(dragEl));

        //console.log(drop);
        console.log(drag[0].innerText);
        console.log("The element " + drag.attr('id') + " has been dropped on " + drop.attr("id") + "!");

       /* if (dragEl == 'unoid')
        {
            var generatedHTML = '<div > HELLO </div>';

            var $div = $(generatedHTML);
            //$(dropEl).append($div);
            drop.append($div);
            angular.element(document).injector().invoke(function($compile) {
                var scope = angular.element($div).scope();
                $compile($div)(scope);
            });
        }*/

        /*if (dropEl == "metricObjects")
        {
            $scope.metrics.push('guau'+$scope.metrics.length);
            console.log($scope.metrics);
            $scope.refreshPivot();
            $scope.$apply();
        }

        if (dropEl == "columnObjects")
        {
            //$scope.columns.push(dragEl);
            $scope.columns.push(String(drag[0].innerText).trim());
            console.log($scope.columns);
            $scope.refreshPivot();
            //$("#pivotOutput").pivot().refreshPivot();
            $scope.$apply();
        }

        if (dropEl == "rowObjects")
        {
            //$scope.rows.push(dragEl);
            $scope.rows.push(String(drag[0].innerText).trim());
            console.log($scope.rows);
            $scope.refreshPivot();
            $scope.$apply();

        }
    };*/


    $scope.dropped = function(dragEl, dropEl) {
        // this is your application logic, do whatever makes sense
        // var drag = angular.element(dragEl);
        // var drop = angular.element(dropEl);

        var drop = angular.element(document.getElementById(dropEl));
        var drag = angular.element(document.getElementById(dragEl));

        console.log("The element " + drag.attr('id') + " has been dropped on " + drop.attr("id") + "!");

        if (dropEl == "metricObjects")
        {
            //$scope.metrics.push('guau'+$scope.metrics.length);
            $scope.metrics = [];
            $scope.metrics.push(String(drag.context.innerHTML).trim());

            $('#pivotOutput').find('.pvtAggregator').val($scope.metrics[0]);
            $('#pivotOutput').find('.pvtAggregator').trigger( "change" );

            console.log($scope.metrics);
        }

        if (dropEl == "columnObjects")
        {
            if (!$scope.columns)
                $scope.columns = [];
            $scope.columns.push(String(drag[0].innerText).trim());


        }

        if (dropEl == "rowObjects")
        {
            $scope.rows.push(String(drag[0].innerText).trim());
            console.log($scope.rows);
        }

        $scope.$apply();
    };

    $scope.generatePivot = function() {
        $scope.tableCols = [];
        $scope.tableData = [];

        for (var c in $scope.columns) {
            for (var d in $scope.data) {
                var index = locateIndex($scope.tableData, $scope.columns[c], $scope.data[d][$scope.columns[c]]);
                if (index > -1) {
                    //$scope.tableData[index][$scope.columns[c]]
                }
            }

        }
    };

    function locateIndex(array, field, value) {
        for (var i in array) {
            if (array[i][field] == value) {
                return i;
            }
        }

        return -1;
    }

    $scope.saveData = function(data) {
        data = {
            rows: data.rows,
            cols: data.cols,
            renderer: data.rendererName,
            metric: data.aggregatorName
        };
        console.log('saveData');
        console.log(data);
        $scope.jsonDataPreview = JSON.stringify(data, undefined, 2);

        $scope.$apply();
    };

    var rendered = false;
    $scope.refreshPivot = function()
    {
        var derivers = $.pivotUtilities.derivers;

        var pivotUI = $("#pivotOutput").pivotUI($scope.data , {
                renderers: $.extend(
                    $.pivotUtilities.renderers,
                    $.pivotUtilities.gchart_renderers,
                    $.pivotUtilities.d3_renderers
                ),
                derivedAttributes: {
                    "Age Bin": derivers.bin("Age", 10),
                    "Gender Imbalance": function(mp) {
                        return mp["Gender"] == "Male" ? 1 : -1;
                    }
                },
                cols: $scope.columns, rows: $scope.rows,
                rendererName: "Table",
                onRefresh: function(config) {
                    var config_copy = JSON.parse(JSON.stringify(config));

                    if (!rendered) {
                        //var treeNode = $('<li><i class="collapsed fa fa-folder"></i><span>Fields</span><div><ul><table><td class="pvtAxisContainer pvtHorizList pvtCols ui-sortable ng-isolate-scope"></td></table></ul></div></li>');

                        /*$('#pivotOutput').find('.pvtUnused').hide();
                        $('#pivotOutput').find('.pvtUnused').children('li').each(function() {

                            //$(this).attr("x-lvl-draggable", true);
                            //treeNode.find('td').append($(this));
                            $("#pivotDesigner").find('.pvtCols').append($(this));
                        });*/

                        /*var clone = $("#pivotDesigner").find('.pvtCols').clone();
                         $("#pivotOutput").find('.pvtCols').replaceWith(clone);
                         $scope.$apply();*/

                        //$('#tablesTree').children('ul').append(treeNode);

                        $('#pivot-renderer').append($("#pivotOutput").find('.pvtRenderer'));

                        $('#pivotOutput').find('tbody').append($('#metrics-row'));

                        /*$('#pivot-renderer').on('change', function() {
                            $("#pivotOutput").find('.pvtRenderer').val(this.value);
                        });*/

                    }

                    rendered = true;

                    $scope.saveData(config_copy);
                }
            });

        $("#pivotOutputReadOnly").pivot(
            $scope.data,
            {
                rows: ["Gender"],
                cols: ["Province"],
                derivedAttributes: {
                    "Age Bin": derivers.bin("Age", 10),
                    "Gender Imbalance": function(mp) {
                        return mp["Gender"] == "Male" ? 1 : -1;
                    }
                }
            }
        );

        //$scope.$apply();
    }

    $scope.sortableOptions = {
        stop: function(e, ui) {
            // this callback has the changed model
            //$scope.refreshPivot();
            //console.log('despues de ordenar');
            $scope.filtersUpdated();
        }
    };

    var lastDrop = null;
    // Drop handler.
    $scope.onDrop = function (data, event, type, group) {
        event.stopPropagation();
        if (lastDrop && lastDrop == 'onFilter') {
            lastDrop = null;
            return;
        }
        console.log('en box');
        // Get custom object data.
        var customObjectData = data['json/custom-object']; // {foo: 'bar'}

        // Get other attached data.
        var uriList = data['text/uri-list']; // http://mywebsite.com/..
        //console.log('soltado uno '+JSON.stringify(customObjectData));


        if (type == 'column') {
            var el = document.getElementById('column-zone');
            var theTemplate =  $compile('<div class="column-box">'+customObjectData.objectLabel+'</div>')($scope);
            if (!$scope.columns)
                $scope.columns = [];
            $scope.columns.push(customObjectData);
            //Add to x and y keys to prevent reportType change
            if (customObjectData.elementType == 'count' || customObjectData.elementType == 'number')
            {
                if (!$scope.selectedReport.properties.ykeys)
                    $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.ykeys.push(customObjectData);
            } else {
                if (!$scope.selectedReport.properties.xkeys)
                    $scope.selectedReport.properties.xkeys = [];
                $scope.selectedReport.properties.xkeys.push(customObjectData);
            }
        }
        if (type == 'xkey') {
            var el = document.getElementById('xkey-zone');
            var theTemplate =  $compile('<div class="column-box">'+customObjectData.objectLabel+'</div>')($scope);
            if (!$scope.columns)
                $scope.columns = [];
            $scope.columns.push(customObjectData);
            if (!$scope.selectedReport.properties.xkeys)
                $scope.selectedReport.properties.xkeys = [];
            $scope.selectedReport.properties.xkeys.push(customObjectData);
        }
        if (type == 'ykey') {
            if (customObjectData.elementType == 'count' || customObjectData.elementType == 'number')
            {
                var el = document.getElementById('ykey-zone');
                var theTemplate =  $compile('<div class="column-box">'+customObjectData.objectLabel+'</div>')($scope);
                if (!$scope.columns)
                    $scope.columns = [];
                $scope.columns.push(customObjectData);
                if (!$scope.selectedReport.properties.ykeys)
                    $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.ykeys.push(customObjectData);
                $scope.onlyNumericValuesAlert = false;
            } else {
                $scope.onlyNumericValuesAlert = true;
            }
        }

        if (type == 'order') {
            customObjectData.sortType = -1;
            $scope.order.push(customObjectData);
            console.log($scope.order);
        }
        if (type == 'filter') {
            var el = document.getElementById('filter-zone');

            //var theTemplate =  $compile('<div class="filter-box">'+customObjectData.objectLabel+'</div>')($scope);;
            $scope.filters.push(customObjectData);
            console.log('the filters '+JSON.stringify($scope.filters));

            $scope.filtersUpdated();
        }
        if (type == 'group') {
            group.filters.push(customObjectData);
            //$scope.filters.push(customObjectData);
            console.log('the filters '+JSON.stringify($scope.filters));

            $scope.filtersUpdated();
        }
        /*generateQuery(function(){
            $scope.processStructure();
        });*/

        detectLayerJoins();
        $scope.processStructure();

        //angular.element(el).append(theTemplate);
        // ...
    };

    $scope.onDropOnFilter = function (data, event, filter) {
        lastDrop = 'onFilter';

        var droppedFilter = data['json/custom-object'];
        console.log('en filtro');
        console.log(droppedFilter);
        console.log(filter);

        filter.filters = [jQuery.extend({}, filter), droppedFilter];
        filter.group = true;

        $scope.updateConditions(filter.filters);

        delete(filter.collectionID);
        delete(filter.datasourceID);
        delete(filter.elementID);
        delete(filter.elementName);
        delete(filter.elementType);
        delete(filter.filterType);
        delete(filter.filterTypeLabel);
        delete(filter.objectLabel);
        delete(filter.filterText1);
        delete(filter.filterText2);

        /*filter = {
            group: true,
            filters: [jQuery.extend({}, filter), droppedFilter]
        };*/

       /* $scope.filters[$scope.filters.indexOf(filter)] = {
            group: true,
            groupType: 'and',
            groupLabel: 'AND',
            filters: [filter, droppedFilter]
        };*/

        console.log($scope.filters);
        event.stopPropagation();
        return;
    };

    $scope.conditionTypes = [
        {conditionType: 'and', conditionLabel: 'AND'},
        {conditionType: 'or', conditionLabel: 'OR'},
        {conditionType: 'andNot', conditionLabel: 'AND NOT'},
        {conditionType: 'orNot', conditionLabel: 'OR NOT'}
    ];

    $scope.updateCondition = function(conditionFrom, conditionTo) {
        conditionFrom.conditionType = conditionTo.conditionType;
        conditionFrom.conditionLabel = conditionTo.conditionLabel;
    };

    $scope.filtersUpdated = function(filters, mainFilters) {
        console.log(filters);
        var filters = (filters) ? filters : $scope.filters;
        var mainFilters = (typeof mainFilters === 'undefined') ? true : mainFilters;
        console.log('filtersUpdated');
        console.log(filters);

        $scope.updateConditions(filters);
        $scope.updateGroups(filters, mainFilters);

        for (var i in filters) {
            if (filters[i].group) {
                $scope.filtersUpdated(filters[i].filters, false);
            }
        }

        console.log('filtersUpdated FINISH');
        console.log(filters);
    };

    $scope.updateGroups = function(filters, mainFilters) {
        var filters = (filters) ? filters : $scope.filters;

        for (var i in filters) {
            if (filters[i].group && filters[i].filters.length == 0 && !mainFilters) {
                filters.splice(i, 1);
                $scope.updateConditions(filters);
                return $scope.updateGroups(filters, mainFilters);
            }
        }

        console.log('updateGroups FINISH');
        console.log(filters);
    };

    $scope.updateConditions = function(filters) {
        var filters = (filters) ? filters : $scope.filters;

        for (var i in filters) {
            if (i%2) { //must be condition
                if (!filters[i].condition) {
                    filters.splice(i, 0, {
                        condition: true,
                        conditionType: 'and',
                        conditionLabel: 'AND'
                    });
                    return $scope.updateConditions(filters);
                }
                else { //is a condition, next is a filter?
                    console.log(filters[i]);
                    console.log(filters[Number(i)+1]);
                    if (filters[Number(i)+1]) {
                        if (filters[Number(i)+1].condition) { //if next is a condition
                            filters.splice(i, 1);
                            return $scope.updateConditions(filters);
                        }
                    }
                    else {
                        filters.splice(i, 1);
                        return $scope.updateConditions(filters);
                    }
                }
            }
            else { //must not be condition
                if (filters[i].condition) {
                    filters.splice(i, 1);
                    return $scope.updateConditions(filters);
                }
            }
        }

        console.log('updateConditions FINISH');
        console.log(filters);
    };

    // Drag over handler.
    $scope.onDragOver = function (event) {
        // ...
    };


    $scope.previewQuery = function()
    {
       /*
        console.log('entering preview');
        var params = {};
        //console.log(JSON.stringify($scope.columns))
        params.query = $scope.query;
        //params.filters = $scope.filters;
        connection.get('/api/reports/preview-query', params, function(data) {
            console.log(data);
            $scope.previewData = data;
            $scope.preview = true;
        });*/
    };

    $scope.addYKeyField = function() {
        if (!$scope.selectedReport.properties.ykeys) $scope.selectedReport.properties.ykeys = [];

        if (!$scope.selectedReport.properties.ykeys)
            $scope.selectedReport.properties.ykeys = [];
        $scope.selectedReport.properties.ykeys.push({});
    };

    $scope.page = 0;
    $scope.queryData = [];
    $scope.busy = false;

    $scope.getData = function() {

        if ($scope.dataMode == 'preview') {
            $scope.previewQuery();
            return;
        }

        /*if ($scope.selectedReport.reportType == 'chart') {
            $scope.getChartData($scope.selectedReport.reportSubType);
            return;
        }*/

        if ($scope.busy) return;
        $scope.busy = true;
        $scope.page += 1;

        console.log('entering view query');

        reportModel.getReportData($scope.selectedReport._id, {page: $scope.page}, function(data) {
            console.log(data);

            for (var i in data) {
                $scope.queryData.push(data[i]);
            }

            $scope.busy = false;
        });

        /*connection.get('/api/reports/get-data', {page: $scope.page, query: $scope.query}, function(data) {
            console.log(data);

            for (var i in data) {
                $scope.queryData.push(data[i]);
            }

            $scope.busy = false;
        });*/
    };
    $scope.getChartData = function(chartType) {
        connection.get('/api/reports/get-data', {query: $scope.query}, function(data) {
            var chartData = [];

            switch (chartType) {
                case 'bar': case 'donut':
                for (var i in data) {
                        chartData.push({value: data[i][$scope.selectedReport.properties.valueField], label: data[i][$scope.selectedReport.properties.labelField]});
                    }
            }

            $scope.chartData = chartData;
        });
    };


    function generateQuery(done)
    {
        $scope.query = {};
        $scope.query.datasources = [];
        $scope.query.order = $scope.order;

        var filters = $scope.filters[0].filters;

        var datasourcesList = [];
        var layersList = [];

        for (var i in $scope.columns) {
            if (datasourcesList.indexOf($scope.columns[i].datasourceID) == -1)
                datasourcesList.push($scope.columns[i].datasourceID);
            if (layersList.indexOf($scope.columns[i].layerID) == -1)
                layersList.push($scope.columns[i].layerID);
        }

        for (var i in filters) {
            if (datasourcesList.indexOf(filters[i].datasourceID) == -1)
                datasourcesList.push(filters[i].datasourceID);
            if (layersList.indexOf(filters[i].layerID) == -1)
                layersList.push(filters[i].layerID);
        }

        /*for (var i in filters) {
         if (datasourcesList.indexOf(filters[i].datasourceID) == -1)
         datasourcesList.push(filters[i].datasourceID);
         }*/

        for (var i in datasourcesList) {

            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];

            for (var z in $scope.columns) {
                if ($scope.columns[z].datasourceID == datasourcesList[i])
                {
                    if (dtsCollections.indexOf($scope.columns[z].collectionID) == -1)
                        dtsCollections.push($scope.columns[z].collectionID);
                }
            }

            for (var z in filters) {
                if (filters[z].datasourceID == datasourcesList[i])
                {
                    if (dtsCollections.indexOf(filters[z].collectionID) == -1)
                        dtsCollections.push(filters[z].collectionID);
                }
            }

            for (var n in dtsCollections) {

                var collection = {};
                collection.collectionID = dtsCollections[n];

                collection.columns = [];

                for (var n1 in $scope.columns) {
                    if ($scope.columns[n1].collectionID == dtsCollections[n])
                    {
                        collection.columns.push($scope.columns[n1]);
                    }
                }

                collection.order = [];

                for (var n1 in $scope.order) {
                    if ($scope.order[n1].collectionID == dtsCollections[n])
                    {
                        collection.order.push($scope.order[n1]);
                    }
                }


                collection.filters = [];
                 for (var n1 in filters) {
                    if (filters[n1].collectionID == dtsCollections[n])
                        {
                            collection.filters.push(filters[n1]);
                        }
                 }

                //collection.filters = filters;

                dtsObject.collections.push(collection);

            }
            $scope.query.datasources.push(dtsObject);
            $scope.query.layers = layersList;
            $scope.query.groupFilters = $scope.filters;
        }

        done();
    }



    $scope.processStructure = function(execute) {
        var execute = (typeof execute !== 'undefined') ? execute : true;
        /*
        $scope.query = {};
        $scope.query.datasources = [];
        
        var filters = $scope.filters[0].filters;

        var datasourcesList = [];
        var layersList = [];

        for (var i in $scope.columns) {
            if (datasourcesList.indexOf($scope.columns[i].datasourceID) == -1)
                datasourcesList.push($scope.columns[i].datasourceID);
            if (layersList.indexOf($scope.columns[i].layerID) == -1)
                layersList.push($scope.columns[i].layerID);
        }

        for (var i in filters) {
            if (datasourcesList.indexOf(filters[i].datasourceID) == -1)
                datasourcesList.push(filters[i].datasourceID);
            if (layersList.indexOf(filters[i].layerID) == -1)
                layersList.push(filters[i].layerID);
        }



        for (var i in datasourcesList) {

            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];

            for (var z in $scope.columns) {
                if ($scope.columns[z].datasourceID == datasourcesList[i])
                {
                    if (dtsCollections.indexOf($scope.columns[z].collectionID) == -1)
                        dtsCollections.push($scope.columns[z].collectionID);
                }
            }

            for (var z in filters) {
                if (filters[z].datasourceID == datasourcesList[i])
                {
                    if (dtsCollections.indexOf(filters[z].collectionID) == -1)
                        dtsCollections.push(filters[z].collectionID);
                }
            }

            for (var n in dtsCollections) {

                var collection = {};
                collection.collectionID = dtsCollections[n];

                collection.columns = [];

                for (var n1 in $scope.columns) {
                    if ($scope.columns[n1].collectionID == dtsCollections[n])
                    {
                            collection.columns.push($scope.columns[n1]);
                    }
                }

                collection.order = [];

                for (var n1 in $scope.order) {
                    if ($scope.order[n1].collectionID == dtsCollections[n])
                    {
                        collection.order.push($scope.order[n1]);
                    }
                }

                collection.filters = filters;

                dtsObject.collections.push(collection);

            }
            $scope.query.datasources.push(dtsObject);
            $scope.query.layers = layersList;
        }   */
      //console.log(JSON.stringify($scope.query));
        /*$scope.selectedReport.properties.xkeys = [];
        $scope.selectedReport.properties.ykeys = [];
        $scope.selectedReport.properties.columns = [];
        $scope.selectedReport.reportType = 'grid';
          */

        //detectLayerJoins();

        $('#reportLayout').empty();

        if ($scope.selectedReport.reportType == 'grid')
        {
            if ($scope.columns.length > 0 && execute)
                $scope.getReportDivForPreview();
        }

        if ($scope.selectedReport.reportType == 'chart-bar')
        {
            if ($scope.selectedReport.properties.xkeys)
            if ($scope.selectedReport.properties.xkeys.length > 0 && execute && $scope.selectedReport.properties.ykeys.length > 0 )
                $scope.getReportDivForPreview();
        }

        if ($scope.selectedReport.reportType == 'chart-line')
        {
            if ($scope.selectedReport.properties.xkeys)
            if ($scope.selectedReport.properties.xkeys.length > 0 && execute && $scope.selectedReport.properties.ykeys.length > 0 )
                $scope.getReportDivForPreview();
        }

        if ($scope.selectedReport.reportType == 'chart-area')
        {
            if ($scope.selectedReport.properties.xkeys)
            if ($scope.selectedReport.properties.xkeys.length > 0 && execute && $scope.selectedReport.properties.ykeys.length > 0 )
                $scope.getReportDivForPreview();
        }

        if ($scope.selectedReport.reportType == 'chart-donut')
        {
            if ($scope.selectedReport.properties.xkeys)
            if ($scope.selectedReport.properties.xkeys.length > 0 && execute && $scope.selectedReport.properties.ykeys.length > 0 )
                $scope.getReportDivForPreview();
        }

        if($scope.selectedReport.reportType == 'indicator')
        {
            if ($scope.selectedReport.properties.xkeys)
            if (execute && $scope.selectedReport.properties.ykeys.length > 0 )
                $scope.getReportDivForPreview();
        }

        if($scope.selectedReport.reportType == 'pivot')
        {
            //if (execute && $scope.selectedReport.properties.ykeys.length > 0 )
            $scope.getReportDivForPreview();
        }

        if($scope.selectedReport.reportType == 'vectorMap')
        {
            //if (execute && $scope.selectedReport.properties.ykeys.length > 0 )
                $scope.getReportDivForPreview();
        }

        if($scope.selectedReport.reportType == 'gauge')
        {
            if ($scope.selectedReport.properties.xkeys)
            if (execute && $scope.selectedReport.properties.ykeys.length > 0 )
            $scope.getReportDivForPreview();
        }

    }

    $scope.changeReportType = function(newReportType)
    {
        //If there are no xkeys and y keys move from columns

        if (!$scope.selectedReport.properties.xkeys)
         {
            for (var c in $scope.selectedReport.properties.columns)
            {

            if ($scope.selectedReport.properties.columns[c].elementType == 'count' || $scope.selectedReport.properties.columns[c].elementType == 'number')
                {
                    if (!$scope.selectedReport.properties.ykeys)
                        $scope.selectedReport.properties.ykeys = [];
                    $scope.selectedReport.properties.ykeys.push($scope.selectedReport.properties.columns[c]);
                } else {
                    if (!$scope.selectedReport.properties.xkeys)
                        $scope.selectedReport.properties.xkeys = [];
                    $scope.selectedReport.properties.xkeys.push($scope.selectedReport.properties.columns[c]);
                }
            }
        }

        if (newReportType == 'grid')
        {
            $scope.selectedReport.reportType = 'grid';
        }
        if (newReportType == 'chart-bar')
        {
            $scope.selectedReport.reportType = 'chart-bar';
        }
        if (newReportType == 'chart-line')
        {
            $scope.selectedReport.reportType = 'chart-line';
        }
        if (newReportType == 'chart-area')
        {
            $scope.selectedReport.reportType = 'chart-area';
        }
        if (newReportType == 'chart-donut')
        {
            $scope.selectedReport.reportType = 'chart-donut';
        }
        if (newReportType == 'pivot')
        {
            $scope.selectedReport.reportType = 'pivot';
        }
        if (newReportType == 'indicator')
        {
            $scope.selectedReport.reportType = 'indicator';
            console.log('indicator type selected')
            if (!$scope.selectedReport.properties.style)
                $scope.selectedReport.properties.style = 'style1';
            if (!$scope.selectedReport.properties.backgroundColor)
                $scope.selectedReport.properties.backgroundColor = '#68b828';
            if (!$scope.selectedReport.properties.reportIcon)
                $scope.selectedReport.properties.reportIcon = 'fa-bolt';
            if (!$scope.selectedReport.properties.mainFontColor)
                $scope.selectedReport.properties.mainFontColor = '#000000';
            if (!$scope.selectedReport.properties.descFontColor)
                $scope.selectedReport.properties.descFontColor = '#CCCCCC';

        }
        if (newReportType == 'vectorMap')
        {
            $scope.selectedReport.reportType = 'vectorMap';
        }

        if (newReportType == 'gauge')
        {
            $scope.selectedReport.reportType = 'gauge';

            if (!$scope.selectedReport.properties.lines)
                $scope.selectedReport.properties.lines = 20; // The number of lines to draw    12
            if (!$scope.selectedReport.properties.angle)
                $scope.selectedReport.properties.angle = 15; // The length of each line
            if (!$scope.selectedReport.properties.lineWidth)
                $scope.selectedReport.properties.lineWidth = 44; // The line thickness
            if (!$scope.selectedReport.properties.pointerLength)
                $scope.selectedReport.properties.pointerLength = 70;
            if (!$scope.selectedReport.properties.pointerStrokeWidth)
                $scope.selectedReport.properties.pointerStrokeWidth = 35;
            if (!$scope.selectedReport.properties.pointerColor)
                $scope.selectedReport.properties.pointerColor =  '#000000';
            if (!$scope.selectedReport.properties.limitMax)
                $scope.selectedReport.properties.limitMax = 'false';   // If true, the pointer will not go past the end of the gauge
            if (!$scope.selectedReport.properties.colorStart)
                $scope.selectedReport.properties.colorStart = '#6FADCF';   // Colors
            if (!$scope.selectedReport.properties.colorStop)
                $scope.selectedReport.properties.colorStop = '#8FC0DA';    // just experiment with them
            if (!$scope.selectedReport.properties.strokeColor)
                $scope.selectedReport.properties.strokeColor = '#E0E0E0';   // to see which ones work best for you
            if (!$scope.selectedReport.properties.generateGradient)
                $scope.selectedReport.properties.generateGradient = true;
            if (!$scope.selectedReport.properties.minValue)
                $scope.selectedReport.properties.minValue = 0;
            if (!$scope.selectedReport.properties.maxValue)
                $scope.selectedReport.properties.maxValue = 100;
            if (!$scope.selectedReport.properties.animationSpeed)
                $scope.selectedReport.properties.animationSpeed = 32;



        }

        $scope.processStructure();
    }

    $scope.changeReportStyle  = function(newReportStyle)
    {
        if (newReportStyle == 'style1')
        {
            $scope.selectedReport.properties.style = 'style1';
            $scope.selectedReport.properties.mainFontColor = '#000000';
            $scope.selectedReport.properties.descFontColor = '#CCCCCC';
        }
        if (newReportStyle == 'style2')
        {
            $scope.selectedReport.properties.style = 'style2';

            $scope.selectedReport.properties.mainFontColor = '#FFFFFF';
            $scope.selectedReport.properties.descFontColor = '#7AD2A0';
        }
        if (newReportStyle == 'style3')
        {
            $scope.selectedReport.properties.style = 'style3';
            $scope.selectedReport.properties.mainFontColor = '#FFFFFF';
            $scope.selectedReport.properties.descFontColor = '#FFFFFF';
        }
        $scope.processStructure();
    }


    $scope.changeReportIcon  = function(newReportIcon)
    {
        console.log('this is the report Icon selected '+newReportIcon);
        $scope.selectedReport.properties.reportIcon = newReportIcon;
        $scope.processStructure();
    }

    $scope.changeReportBackgroundColor  = function(newBackgroundColor)
    {

        $scope.selectedReport.properties.backgroundColor = newBackgroundColor;
        $scope.processStructure();
    }

    $scope.changeReportMainFontColor  = function(newMainFontColor)
    {

        $scope.selectedReport.properties.mainFontColor = newMainFontColor;
        $scope.processStructure();
    }

    $scope.changeReportDescFontColor  = function(newDescFontColor)
    {

        $scope.selectedReport.properties.descFontColor = newDescFontColor;
        $scope.processStructure();
    }

    $scope.getFontColor = function(theColor)
    {
        if (theColor = '#FFFFFF')
            return '#000000'
        else
        return '#FFFFFF'
    }

    $scope.setFilterPrompt = function(filter)
    {
        $('#filterPromptsModal').modal('hide');
        if (filter.filterPrompt == true)
            filter.filterPrompt = false;
        else
            filter.filterPrompt = true;
    }

    $scope.getButtonFilterPromptMessage = function(filter)
    {
        if (filter.filterPrompt == true)
            return 'Select to deactivate the prompt for this filter';
            else
            return 'Create a prompt for this filter, the filter will ask for a value each time the report is executed.' + "\n" +' '+ 'Click here to activate the prompt for this filter.';
    }

    $scope.filterPromptsClick = function (filter) {
        $scope.selectedFilter = filter;
        if (!$scope.selectedFilter.promptTitle || $scope.selectedFilter.promptTitle == '')
            $scope.selectedFilter.promptTitle = $scope.selectedFilter.objectLabel;

        $('#filterPromptsModal').modal('show');
    };

    /*
    $scope.getDistinct = function(attribute) {


        var execute = (typeof execute !== 'undefined') ? execute : true;

        var query = {};
        query.datasources = [];
        query.order = $scope.order;

        //var filters = $scope.filters[0].filters;

        var datasourcesList = [];
        datasourcesList.push(attribute.datasourceID);



        for (var i in datasourcesList) {

            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];
            dtsCollections.push(attribute.collectionID);



            for (var n in dtsCollections) {

                var collection = {};
                collection.collectionID = dtsCollections[n];

                collection.columns = [];
                collection.columns.push(attribute);



                collection.order = [];
                attribute.sortType = 1;
                collection.order.push(attribute);


                dtsObject.collections.push(collection);

            }
            query.datasources.push(dtsObject);
        }




        reportModel.getData($scope, query, {page: 0}, function(data) {
            console.log('datos de distinct value ' + JSON.stringify(data));
            $scope.searchValues = data;
            $scope.errorMsg = (data.result === 0) ? data.msg : false;
            $scope.page = data.page;
            $scope.pages = data.pages;
            //$scope.data = data;
        });




    } */

    $scope.selectFilterArrayValue = function(type, filter)
    {
        reportModel.selectFilterArrayValue(type, filter);

        /*
        if (type == 'multiple')
        {
            for (var n1 in filter.filterLabel1) {
                if (n1 > 0)
                    filter.filterText1 = filter.filterText1 +';'+ filter.filterLabel1[n1].value;
                else
                    filter.filterText1 = filter.filterLabel1[n1].value;
            }
        } else {
            filter.filterText1 = filter.filterLabel1.value;
        }

        //filter.filterText1 = item.value;
        // Filter.filterLabel1 = item.label;
        */
    }


    $scope.selectFilterDateValue = function(filter)
    {

            filter.filterText1 = filter.filterLabel1.value;

    }


    function checkChoosedElements()
    {
        if ($scope.columns.length > 1)
        {
            for( var e=$scope.columns.length -1;e>=0;e--)
            {
                if (thereIsAJoinForMe($scope.columns[e]) == 0)
                {

                   //is this element in the xkeys?
                    if ($scope.selectedReport.properties.xkeys.length > 0)
                    {
                        for( var x=$scope.selectedReport.properties.xkeys.length -1;x>=0;x--)
                        {
                           if ($scope.selectedReport.properties.xkeys[x].elementID == $scope.columns[e].elementID)
                               $scope.selectedReport.properties.xkeys.splice(x,1);
                        }
                    }

                    if ($scope.selectedReport.properties.ykeys.length > 0)
                    {
                        for( var y=$scope.selectedReport.properties.ykeys.length -1;y>=0;y--)
                        {
                            if ($scope.selectedReport.properties.ykeys[y].elementID == $scope.columns[e].elementID)
                                $scope.selectedReport.properties.ykeys.splice(y,1);
                        }
                    }

                $scope.columns.splice(e,1);
                }
            }
        }


    }

    function thereIsAJoinForMe(element)
    {
        var found = 0;
        for (var i in $scope.columns)
        {
             if (element.elementID != $scope.columns[i].elementID)
             {
                 if (joinExists(element.collectionID,$scope.columns[i].collectionID))
                    found = found+1;
             }
        }

        return found;
    }

    function joinExists(collection1,collection2)
    {
        var found = false;

        if (collection1 != collection2)
        {
            for (var j in $scope.selectedLayer.params.joins)
            {
                if (($scope.selectedLayer.params.joins[j].sourceCollectionID == collection1 && $scope.selectedLayer.params.joins[j].targetCollectionID == collection2) ||
                    ($scope.selectedLayer.params.joins[j].sourceCollectionID == collection2 && $scope.selectedLayer.params.joins[j].targetCollectionID == collection1))
                {
                    found = true;
                    console.log('join encontrada');
                }
            }
        } else
            found = true;

        return found;
    }

    $scope.detectLayerJoins = function()
    {
        detectLayerJoins();
    }

    function detectLayerJoins()
    {
        checkChoosedElements();

        generateQuery(function(){

            //this function enables and disables elements in the layer if there is a join between the elements in the report and the element in the layer...
            var reportCollections = [];
            var selectableCollections = [];

            for (var i in $scope.query.datasources) {
                for (var c in $scope.query.datasources[i].collections) {
                     reportCollections.push($scope.query.datasources[i].collections[c].collectionID);
                     selectableCollections.push($scope.query.datasources[i].collections[c].collectionID);
                }
            }

            //get the joins for these collections

            for (var j in $scope.selectedLayer.params.joins)
            {
                for (var c in reportCollections)
                {
                    if ($scope.selectedLayer.params.joins[j].sourceCollectionID == reportCollections[c])
                    {
                             if (selectableCollections.indexOf($scope.selectedLayer.params.joins[j].sourceCollectionID) == -1)
                                 selectableCollections.push($scope.selectedLayer.params.joins[j].sourceCollectionID);

                             if (selectableCollections.indexOf($scope.selectedLayer.params.joins[j].targetCollectionID) == -1)
                                 selectableCollections.push($scope.selectedLayer.params.joins[j].targetCollectionID);
                    }

                    if ($scope.selectedLayer.params.joins[j].targetCollectionID == reportCollections[c])
                    {
                        if (selectableCollections.indexOf($scope.selectedLayer.params.joins[j].sourceCollectionID) == -1)
                            selectableCollections.push($scope.selectedLayer.params.joins[j].sourceCollectionID);

                        if (selectableCollections.indexOf($scope.selectedLayer.params.joins[j].targetCollectionID) == -1)
                            selectableCollections.push($scope.selectedLayer.params.joins[j].targetCollectionID);
                    }
                }
            }

            console.log('the selected collections',JSON.stringify(selectableCollections));

            if (selectableCollections.length == 0)
                enableAllElements($scope.rootItem.elements);
            else
                detectLayerJoins4Elements($scope.rootItem.elements,selectableCollections);
        });
    }

    function detectLayerJoins4Elements(elements,selectableCollections)
    {
        for (var e in elements)
        {
            if (elements[e].elementRole != 'folder')
            {
                if (selectableCollections.indexOf(elements[e].collectionID) == -1)
                {
                    elements[e].enabled = false;
                } else
                    elements[e].enabled = true;
            }
            if (elements[e].elements)
                detectLayerJoins4Elements(elements[e].elements,selectableCollections);

        }
    }

    function enableAllElements(elements)
    {
        for (var e in elements)
        {
            if (elements[e].elementRole != 'folder')
            {
                    elements[e].enabled = true;
            }

            if (elements[e].elements)
                enableAllElements(elements[e].elements);
        }
    }


    $scope.setLinkForColumn = function(column)
    {
        var params = (params) ? params : {};

        if (!column.link)
            $scope.selectedLink = {};
        else
            $scope.selectedLink = column.link;

        $scope.linkWizardStep = 1;

        connection.get('/api/reports/find-all', params, function(data) {

            connection.get('/api/dashboards/find-all', params, function(data2) {
                $scope.dashboards = data2;
                $scope.reports = data;
                $scope.selectedColumn = column;
                $('#linkModal').modal('show');
            });


        });

    }

    $scope.getPromptForLink = function()
    {
        if ($scope.selectedLink.type == 'report')
        {
            reportModel.getReportDefinition($scope.selectedLink._id, function(report) {
                promptModel.getPrompts($scope,report,function(){
                    if ($scope.prompts.length > 0)
                    {

                    } else {

                    }
                    $scope.linkWizardStep = 2;
                });
            });
        }

        if ($scope.selectedLink.type == 'dashboard')
        {
            dashboardModel.getDashBoard($scope.selectedLink._id, function(dashboard) {
                dashboardModel.getPromptsForDashboard($scope,dashboard,function(){
                    if ($scope.prompts.length > 0)
                    {

                    } else {

                    }
                    $scope.linkWizardStep = 2;
                });
            });
        }
    }

    $scope.saveLinkForColumn = function()
    {
        $scope.selectedColumn.link = $scope.selectedLink;
        $('#linkModal').modal('hide');
    }

    $scope.linkBack = function()
    {
        $scope.linkWizardStep = 1;
    }

    $scope.linkDelete = function()
    {
        $scope.selectedColumn.link = undefined;
        $('#linkModal').modal('hide');
    }

    $scope.changeColumnStyle = function(columnIndex ,hashedID)
    {

        $scope.selectedColumn = $scope.selectedReport.properties.columns[columnIndex];
        $scope.selectedColumnHashedID  = hashedID;
        $scope.selectedColumnIndex  = columnIndex;

        console.log('el formato 1',JSON.stringify($scope.selectedColumn.columnStyle));
        if (!$scope.selectedColumn.columnStyle)
            $scope.selectedColumn.columnStyle = {color:'#000','background-color':'#EEEEEE','text-align':'left','font-size':"12px",'font-weight':"normal",'font-style':"normal"};

        console.log('el formato',JSON.stringify($scope.selectedColumn.columnStyle));

        $('#columnFormatModal').modal('show');


    }

    $scope.changeColumnColor = function(color)
    {
        if ($scope.selectedColumn.columnStyle)
        $scope.selectedColumn.columnStyle.color = color;
    }

    $scope.changeColumnBackgroundColor = function(color)
    {
        if ($scope.selectedColumn.columnStyle)
        $scope.selectedColumn.columnStyle['background-color'] = color;
    }

    $scope.setColumnFormat = function()
    {
        console.log('aqui 1',$scope.selectedColumnHashedID);
        reportModel.changeColumnStyle($scope,$scope.selectedColumnIndex ,$scope.selectedColumnHashedID);
    }

    $scope.changeColumnSignals = function(columnIndex ,hashedID)
    {

        $scope.selectedColumn = $scope.selectedReport.properties.columns[columnIndex];
        $scope.selectedColumnHashedID  = hashedID;
        $scope.selectedColumnIndex  = columnIndex;

        if (!$scope.selectedColumn.signals)
            $scope.selectedColumn.signals = [];


        $('#columnSignalsModal').modal('show');


    }


    $scope.setColumnSignals = function()
    {
        reportModel.changeColumnSignals($scope,$scope.selectedColumnIndex ,$scope.selectedColumnHashedID);
    }


    $scope.orderColumn = function(predicate,hashedID) {

        reportModel.orderColumn($scope, predicate,hashedID);

    };


    $scope.columnCalculation = function(operation, columnIndex, hashedID) {

        reportModel.columnCalculation($scope,operation, columnIndex, hashedID);

    }


    $scope.getColumnWidthClass = function(column)
    {
        return 'col-xs-'+12/$scope.selectedReport.properties.columns.length;
    }

    $scope.getColumnStyle = function(column)
    {
        console.log('entering getColumnStyle' ,column.format );

        var columnFormat = '';
        if (column.format)
        {
            //columnFormat = 'color:'+column.format.color+';';

            for (var key in column.format) {
                columnFormat += key+':'+column.format[key]+';';
            }
        }
        console.log('getColumnStyle' ,columnFormat );
        return columnFormat;
    }


    $scope.saveToExcel = function(reportHash)
    {
        reportModel.saveToExcel($scope,reportHash) ;
    }



    $scope.faList = [{name:"fa-adjust",value:"fa-adjust"},
    {name:"fa-adn",value:"fa-adn"},
    {name:"fa-align-center",value:"fa-align-center"},
    {name:"fa-align-justify",value:"fa-align-justify"},
    {name:"fa-align-left",value:"fa-align-left"},
    {name:"fa-align-right",value:"fa-align-right"},
    {name:"fa-ambulance",value:"fa-ambulance"},
    {name:"fa-anchor",value:"fa-anchor"},
    {name:"fa-android",value:"fa-android"},
    {name:"fa-angle-double-down",value:"fa-angle-double-down"},
    {name:"fa-angle-double-left",value:"fa-angle-double-left"},
    {name:"fa-angle-double-right",value:"fa-angle-double-right"},
    {name:"fa-angle-double-up",value:"fa-angle-double-up"},
    {name:"fa-angle-down",value:"fa-angle-down"},
    {name:"fa-angle-left",value:"fa-angle-left"},
    {name:"fa-angle-right",value:"fa-angle-right"},
    {name:"fa-angle-up",value:"fa-angle-up"},
    {name:"fa-apple",value:"fa-apple"},
    {name:"fa-archive",value:"fa-archive"},
    {name:"fa-arrow-circle-down",value:"fa-arrow-circle-down"},
    {name:"fa-arrow-circle-left",value:"fa-arrow-circle-left"},
    {name:"fa-arrow-circle-o-down",value:"fa-arrow-circle-o-down"},
    {name:"fa-arrow-circle-o-left",value:"fa-arrow-circle-o-left"},
    {name:"fa-arrow-circle-o-right",value:"fa-arrow-circle-o-right"},
    {name:"fa-arrow-circle-o-up",value:"fa-arrow-circle-o-up"},
    {name:"fa-arrow-circle-right",value:"fa-arrow-circle-right"},
    {name:"fa-arrow-circle-up",value:"fa-arrow-circle-up"},
    {name:"fa-arrow-down",value:"fa-arrow-down"},
    {name:"fa-arrow-left",value:"fa-arrow-left"},
    {name:"fa-arrow-right",value:"fa-arrow-right"},
    {name:"fa-arrow-up",value:"fa-arrow-up"},
    {name:"fa-arrows",value:"fa-arrows"},
    {name:"fa-arrows-alt",value:"fa-arrows-alt"},
    {name:"fa-arrows-h",value:"fa-arrows-h"},
    {name:"fa-arrows-v",value:"fa-arrows-v"},
    {name:"fa-asterisk",value:"fa-asterisk"},
    {name:"fa-automobile",value:"fa-automobile"},
    {name:"fa-backward",value:"fa-backward"},
    {name:"fa-ban",value:"fa-ban"},
    {name:"fa-bank",value:"fa-bank"},
    {name:"fa-bar-chart-o",value:"fa-bar-chart-o"},
    {name:"fa-barcode",value:"fa-barcode"},
    {name:"fa-bars",value:"fa-bars"},
    {name:"fa-beer",value:"fa-beer"},
    {name:"fa-behance",value:"fa-behance"},
    {name:"fa-behance-square",value:"fa-behance-square"},
    {name:"fa-bell",value:"fa-bell"},
    {name:"fa-bell-o",value:"fa-bell-o"},
    {name:"fa-bitbucket",value:"fa-bitbucket"},
    {name:"fa-bitbucket-square",value:"fa-bitbucket-square"},
    {name:"fa-bitcoin",value:"fa-bitcoin"},
    {name:"fa-bold",value:"fa-bold"},
    {name:"fa-bolt",value:"fa-bolt"},
    {name:"fa-bomb",value:"fa-bomb"},
    {name:"fa-book",value:"fa-book"},
    {name:"fa-bookmark",value:"fa-bookmark"},
    {name:"fa-bookmark-o",value:"fa-bookmark-o"},
    {name:"fa-briefcase",value:"fa-briefcase"},
    {name:"fa-btc",value:"fa-btc"},
    {name:"fa-bug",value:"fa-bug"},
    {name:"fa-building",value:"fa-building"},
    {name:"fa-building-o",value:"fa-building-o"},
    {name:"fa-bullhorn",value:"fa-bullhorn"},
    {name:"fa-bullseye",value:"fa-bullseye"},
    {name:"fa-cab",value:"fa-cab"},
    {name:"fa-calendar",value:"fa-calendar"},
    {name:"fa-calendar-o",value:"fa-calendar-o"},
    {name:"fa-camera",value:"fa-camera"},
    {name:"fa-camera-retro",value:"fa-camera-retro"},
    {name:"fa-car",value:"fa-car"},
    {name:"fa-caret-down",value:"fa-caret-down"},
    {name:"fa-caret-left",value:"fa-caret-left"},
    {name:"fa-caret-right",value:"fa-caret-right"},
    {name:"fa-caret-square-o-down",value:"fa-caret-square-o-down"},
    {name:"fa-caret-square-o-left",value:"fa-caret-square-o-left"},
    {name:"fa-caret-square-o-right",value:"fa-caret-square-o-right"},
    {name:"fa-caret-square-o-up",value:"fa-caret-square-o-up"},
    {name:"fa-caret-up",value:"fa-caret-up"},
    {name:"fa-certificate",value:"fa-certificate"},
    {name:"fa-chain",value:"fa-chain"},
    {name:"fa-chain-broken",value:"fa-chain-broken"},
    {name:"fa-check",value:"fa-check"},
    {name:"fa-check-circle",value:"fa-check-circle"},
    {name:"fa-check-circle-o",value:"fa-check-circle-o"},
    {name:"fa-check-square",value:"fa-check-square"},
    {name:"fa-check-square-o",value:"fa-check-square-o"},
    {name:"fa-chevron-circle-down",value:"fa-chevron-circle-down"},
    {name:"fa-chevron-circle-left",value:"fa-chevron-circle-left"},
    {name:"fa-chevron-circle-right",value:"fa-chevron-circle-right"},
    {name:"fa-chevron-circle-up",value:"fa-chevron-circle-up"},
    {name:"fa-chevron-down",value:"fa-chevron-down"},
    {name:"fa-chevron-left",value:"fa-chevron-left"},
    {name:"fa-chevron-right",value:"fa-chevron-right"},
    {name:"fa-chevron-up",value:"fa-chevron-up"},
    {name:"fa-child",value:"fa-child"},
    {name:"fa-circle",value:"fa-circle"},
    {name:"fa-circle-o",value:"fa-circle-o"},
    {name:"fa-circle-o-notch",value:"fa-circle-o-notch"},
    {name:"fa-circle-thin",value:"fa-circle-thin"},
    {name:"fa-clipboard",value:"fa-clipboard"},
    {name:"fa-clock-o",value:"fa-clock-o"},
    {name:"fa-cloud",value:"fa-cloud"},
    {name:"fa-cloud-download",value:"fa-cloud-download"},
    {name:"fa-cloud-upload",value:"fa-cloud-upload"},
    {name:"fa-cny",value:"fa-cny"},
    {name:"fa-code",value:"fa-code"},
    {name:"fa-code-fork",value:"fa-code-fork"},
    {name:"fa-codepen",value:"fa-codepen"},
    {name:"fa-coffee",value:"fa-coffee"},
    {name:"fa-cog",value:"fa-cog"},
    {name:"fa-cogs",value:"fa-cogs"},
    {name:"fa-columns",value:"fa-columns"},
    {name:"fa-comment",value:"fa-comment"},
    {name:"fa-comment-o",value:"fa-comment-o"},
    {name:"fa-comments",value:"fa-comments"},
    {name:"fa-comments-o",value:"fa-comments-o"},
    {name:"fa-compass",value:"fa-compass"},
    {name:"fa-compress",value:"fa-compress"},
    {name:"fa-copy",value:"fa-copy"},
    {name:"fa-credit-card",value:"fa-credit-card"},
    {name:"fa-crop",value:"fa-crop"},
    {name:"fa-crosshairs",value:"fa-crosshairs"},
    {name:"fa-css3",value:"fa-css3"},
    {name:"fa-",value:"fa-"},
    {name:"fa-s",value:"fa-s"},
    {name:"fa-cut",value:"fa-cut"},
    {name:"fa-cutlery",value:"fa-cutlery"},
    {name:"fa-dashboard",value:"fa-dashboard"},
    {name:"fa-database",value:"fa-database"},
    {name:"fa-dedent",value:"fa-dedent"},
    {name:"fa-delicious",value:"fa-delicious"},
    {name:"fa-desktop",value:"fa-desktop"},
    {name:"fa-deviantart",value:"fa-deviantart"},
    {name:"fa-digg",value:"fa-digg"},
    {name:"fa-dollar",value:"fa-dollar"},
    {name:"fa-dot-circle-o",value:"fa-dot-circle-o"},
    {name:"fa-download",value:"fa-download"},
    {name:"fa-dribbble",value:"fa-dribbble"},
    {name:"fa-dropbox",value:"fa-dropbox"},
    {name:"fa-drupal",value:"fa-drupal"},
    {name:"fa-edit",value:"fa-edit"},
    {name:"fa-eject",value:"fa-eject"},
    {name:"fa-ellipsis-h",value:"fa-ellipsis-h"},
    {name:"fa-ellipsis-v",value:"fa-ellipsis-v"},
    {name:"fa-empire",value:"fa-empire"},
    {name:"fa-envelope",value:"fa-envelope"},
    {name:"fa-envelope-o",value:"fa-envelope-o"},
    {name:"fa-envelope-square",value:"fa-envelope-square"},
    {name:"fa-eraser",value:"fa-eraser"},
    {name:"fa-eur",value:"fa-eur"},
    {name:"fa-euro",value:"fa-euro"},
    {name:"fa-exchange",value:"fa-exchange"},
    {name:"fa-exclamation",value:"fa-exclamation"},
    {name:"fa-exclamation-circle",value:"fa-exclamation-circle"},
    {name:"fa-exclamation-triangle",value:"fa-exclamation-triangle"},
    {name:"fa-expand",value:"fa-expand"},
    {name:"fa-external-link",value:"fa-external-link"},
    {name:"fa-external-link-square",value:"fa-external-link-square"},
    {name:"fa-eye",value:"fa-eye"},
    {name:"fa-eye-slash",value:"fa-eye-slash"},
    {name:"fa-facebook",value:"fa-facebook"},
    {name:"fa-facebook-square",value:"fa-facebook-square"},
    {name:"fa-fast-backward",value:"fa-fast-backward"},
    {name:"fa-fast-forward",value:"fa-fast-forward"},
    {name:"fa-fax",value:"fa-fax"},
    {name:"fa-female",value:"fa-female"},
    {name:"fa-fighter-jet",value:"fa-fighter-jet"},
    {name:"fa-file",value:"fa-file"},
    {name:"fa-file-archive-o",value:"fa-file-archive-o"},
    {name:"fa-file-audio-o",value:"fa-file-audio-o"},
    {name:"fa-file-code-o",value:"fa-file-code-o"},
    {name:"fa-file-excel-o",value:"fa-file-excel-o"},
    {name:"fa-file-image-o",value:"fa-file-image-o"},
    {name:"fa-file-movie-o",value:"fa-file-movie-o"},
    {name:"fa-file-o",value:"fa-file-o"},
    {name:"fa-file-pdf-o",value:"fa-file-pdf-o"},
    {name:"fa-file-photo-o",value:"fa-file-photo-o"},
    {name:"fa-file-picture-o",value:"fa-file-picture-o"},
    {name:"fa-file-powerpoint-o",value:"fa-file-powerpoint-o"},
    {name:"fa-file-sound-o",value:"fa-file-sound-o"},
    {name:"fa-file-text",value:"fa-file-text"},
    {name:"fa-file-text-o",value:"fa-file-text-o"},
    {name:"fa-file-video-o",value:"fa-file-video-o"},
    {name:"fa-file-word-o",value:"fa-file-word-o"},
    {name:"fa-file-zip-o",value:"fa-file-zip-o"},
    {name:"fa-files-o",value:"fa-files-o"},
    {name:"fa-film",value:"fa-film"},
    {name:"fa-filter",value:"fa-filter"},
    {name:"fa-fire",value:"fa-fire"},
    {name:"fa-fire-extinguisher",value:"fa-fire-extinguisher"},
    {name:"fa-flag",value:"fa-flag"},
    {name:"fa-flag-checkered",value:"fa-flag-checkered"},
    {name:"fa-flag-o",value:"fa-flag-o"},
    {name:"fa-flash",value:"fa-flash"},
    {name:"fa-flask",value:"fa-flask"},
    {name:"fa-flickr",value:"fa-flickr"},
    {name:"fa-floppy-o",value:"fa-floppy-o"},
    {name:"fa-folder",value:"fa-folder"},
    {name:"fa-folder-o",value:"fa-folder-o"},
    {name:"fa-folder-open",value:"fa-folder-open"},
    {name:"fa-folder-open-o",value:"fa-folder-open-o"},
    {name:"fa-font",value:"fa-font"},
    {name:"fa-forward",value:"fa-forward"},
    {name:"fa-foursquare",value:"fa-foursquare"},
    {name:"fa-frown-o",value:"fa-frown-o"},
    {name:"fa-gamepad",value:"fa-gamepad"},
    {name:"fa-gavel",value:"fa-gavel"},
    {name:"fa-gbp",value:"fa-gbp"},
    {name:"fa-ge",value:"fa-ge"},
    {name:"fa-gear",value:"fa-gear"},
    {name:"fa-gears",value:"fa-gears"},
    {name:"fa-gift",value:"fa-gift"},
    {name:"fa-git",value:"fa-git"},
    {name:"fa-git-square",value:"fa-git-square"},
    {name:"fa-github",value:"fa-github"},
    {name:"fa-github-alt",value:"fa-github-alt"},
    {name:"fa-github-square",value:"fa-github-square"},
    {name:"fa-gittip",value:"fa-gittip"},
    {name:"fa-glass",value:"fa-glass"},
    {name:"fa-globe",value:"fa-globe"},
    {name:"fa-google",value:"fa-google"},
    {name:"fa-google-plus",value:"fa-google-plus"},
    {name:"fa-google-plus-square",value:"fa-google-plus-square"},
    {name:"fa-graduation-cap",value:"fa-graduation-cap"},
    {name:"fa-group",value:"fa-group"},
    {name:"fa-h-square",value:"fa-h-square"},
    {name:"fa-hacker-news",value:"fa-hacker-news"},
    {name:"fa-hand-o-down",value:"fa-hand-o-down"},
    {name:"fa-hand-o-left",value:"fa-hand-o-left"},
    {name:"fa-hand-o-right",value:"fa-hand-o-right"},
    {name:"fa-hand-o-up",value:"fa-hand-o-up"},
    {name:"fa-hdd-o",value:"fa-hdd-o"},
    {name:"fa-header",value:"fa-header"},
    {name:"fa-headphones",value:"fa-headphones"},
    {name:"fa-heart",value:"fa-heart"},
    {name:"fa-heart-o",value:"fa-heart-o"},
    {name:"fa-history",value:"fa-history"},
    {name:"fa-home",value:"fa-home"},
    {name:"fa-hospital-o",value:"fa-hospital-o"},
    {name:"fa-html5",value:"fa-html5"},
    {name:"fa-image",value:"fa-image"},
    {name:"fa-inbox",value:"fa-inbox"},
    {name:"fa-indent",value:"fa-indent"},
    {name:"fa-info",value:"fa-info"},
    {name:"fa-info-circle",value:"fa-info-circle"},
    {name:"fa-inr",value:"fa-inr"},
    {name:"fa-instagram",value:"fa-instagram"},
    {name:"fa-institution",value:"fa-institution"},
    {name:"fa-italic",value:"fa-italic"},
    {name:"fa-joomla",value:"fa-joomla"},
    {name:"fa-jpy",value:"fa-jpy"},
    {name:"fa-jsfiddle",value:"fa-jsfiddle"},
    {name:"fa-key",value:"fa-key"},
    {name:"fa-keyboard-o",value:"fa-keyboard-o"},
    {name:"fa-krw",value:"fa-krw"},
    {name:"fa-language",value:"fa-language"},
    {name:"fa-laptop",value:"fa-laptop"},
    {name:"fa-leaf",value:"fa-leaf"},
    {name:"fa-legal",value:"fa-legal"},
    {name:"fa-lemon-o",value:"fa-lemon-o"},
    {name:"fa-level-down",value:"fa-level-down"},
    {name:"fa-level-up",value:"fa-level-up"},
    {name:"fa-life-bouy",value:"fa-life-bouy"},
    {name:"fa-life-ring",value:"fa-life-ring"},
    {name:"fa-life-saver",value:"fa-life-saver"},
    {name:"fa-lightbulb-o",value:"fa-lightbulb-o"},
    {name:"fa-link",value:"fa-link"},
    {name:"fa-linkedin",value:"fa-linkedin"},
    {name:"fa-linkedin-square",value:"fa-linkedin-square"},
    {name:"fa-linux",value:"fa-linux"},
    {name:"fa-list",value:"fa-list"},
    {name:"fa-list-alt",value:"fa-list-alt"},
    {name:"fa-list-ol",value:"fa-list-ol"},
    {name:"fa-list-ul",value:"fa-list-ul"},
    {name:"fa-location-arrow",value:"fa-location-arrow"},
    {name:"fa-lock",value:"fa-lock"},
    {name:"fa-long-arrow-down",value:"fa-long-arrow-down"},
    {name:"fa-long-arrow-left",value:"fa-long-arrow-left"},
    {name:"fa-long-arrow-right",value:"fa-long-arrow-right"},
    {name:"fa-long-arrow-up",value:"fa-long-arrow-up"},
    {name:"fa-magic",value:"fa-magic"},
    {name:"fa-magnet",value:"fa-magnet"},
    {name:"fa-mail-forward",value:"fa-mail-forward"},
    {name:"fa-mail-reply",value:"fa-mail-reply"},
    {name:"fa-mail-reply-all",value:"fa-mail-reply-all"},
    {name:"fa-male",value:"fa-male"},
    {name:"fa-map-marker",value:"fa-map-marker"},
    {name:"fa-maxcdn",value:"fa-maxcdn"},
    {name:"fa-medkit",value:"fa-medkit"},
    {name:"fa-meh-o",value:"fa-meh-o"},
    {name:"fa-microphone",value:"fa-microphone"},
    {name:"fa-microphone-slash",value:"fa-microphone-slash"},
    {name:"fa-minus",value:"fa-minus"},
    {name:"fa-minus-circle",value:"fa-minus-circle"},
    {name:"fa-minus-square",value:"fa-minus-square"},
    {name:"fa-minus-square-o",value:"fa-minus-square-o"},
    {name:"fa-mobile",value:"fa-mobile"},
    {name:"fa-mobile-phone",value:"fa-mobile-phone"},
    {name:"fa-money",value:"fa-money"},
    {name:"fa-moon-o",value:"fa-moon-o"},
    {name:"fa-mortar-board",value:"fa-mortar-board"},
    {name:"fa-music",value:"fa-music"},
    {name:"fa-navicon",value:"fa-navicon"},
    {name:"fa-openid",value:"fa-openid"},
    {name:"fa-outdent",value:"fa-outdent"},
    {name:"fa-pagelines",value:"fa-pagelines"},
    {name:"fa-paper-plane",value:"fa-paper-plane"},
    {name:"fa-paper-plane-o",value:"fa-paper-plane-o"},
    {name:"fa-paperclip",value:"fa-paperclip"},
    {name:"fa-paragraph",value:"fa-paragraph"},
    {name:"fa-paste",value:"fa-paste"},
    {name:"fa-pause",value:"fa-pause"},
    {name:"fa-paw",value:"fa-paw"},
    {name:"fa-pencil",value:"fa-pencil"},
    {name:"fa-pencil-square",value:"fa-pencil-square"},
    {name:"fa-pencil-square-o",value:"fa-pencil-square-o"},
    {name:"fa-phone",value:"fa-phone"},
    {name:"fa-phone-square",value:"fa-phone-square"},
    {name:"fa-photo",value:"fa-photo"},
    {name:"fa-picture-o",value:"fa-picture-o"},
    {name:"fa-pied-piper",value:"fa-pied-piper"},
    {name:"fa-pied-piper-alt",value:"fa-pied-piper-alt"},
    {name:"fa-pied-piper-square",value:"fa-pied-piper-square"},
    {name:"fa-pinterest",value:"fa-pinterest"},
    {name:"fa-pinterest-square",value:"fa-pinterest-square"},
    {name:"fa-plane",value:"fa-plane"},
    {name:"fa-play",value:"fa-play"},
    {name:"fa-play-circle",value:"fa-play-circle"},
    {name:"fa-play-circle-o",value:"fa-play-circle-o"},
    {name:"fa-plus",value:"fa-plus"},
    {name:"fa-plus-circle",value:"fa-plus-circle"},
    {name:"fa-plus-square",value:"fa-plus-square"},
    {name:"fa-plus-square-o",value:"fa-plus-square-o"},
    {name:"fa-power-off",value:"fa-power-off"},
    {name:"fa-print",value:"fa-print"},
    {name:"fa-puzzle-piece",value:"fa-puzzle-piece"},
    {name:"fa-qq",value:"fa-qq"},
    {name:"fa-qrcode",value:"fa-qrcode"},
    {name:"fa-question",value:"fa-question"},
    {name:"fa-question-circle",value:"fa-question-circle"},
    {name:"fa-quote-left",value:"fa-quote-left"},
    {name:"fa-quote-right",value:"fa-quote-right"},
    {name:"fa-ra",value:"fa-ra"},
    {name:"fa-random",value:"fa-random"},
    {name:"fa-rebel",value:"fa-rebel"},
    {name:"fa-recycle",value:"fa-recycle"},
    {name:"fa-reddit",value:"fa-reddit"},
    {name:"fa-reddit-square",value:"fa-reddit-square"},
    {name:"fa-refresh",value:"fa-refresh"},
    {name:"fa-renren",value:"fa-renren"},
    {name:"fa-reorder",value:"fa-reorder"},
    {name:"fa-repeat",value:"fa-repeat"},
    {name:"fa-reply",value:"fa-reply"},
    {name:"fa-reply-all",value:"fa-reply-all"},
    {name:"fa-retweet",value:"fa-retweet"},
    {name:"fa-rmb",value:"fa-rmb"},
    {name:"fa-road",value:"fa-road"},
    {name:"fa-rocket",value:"fa-rocket"},
    {name:"fa-rotate-left",value:"fa-rotate-left"},
    {name:"fa-rotate-right",value:"fa-rotate-right"},
    {name:"fa-rouble",value:"fa-rouble"},
    {name:"fa-rss",value:"fa-rss"},
    {name:"fa-rss-square",value:"fa-rss-square"},
    {name:"fa-rub",value:"fa-rub"},
    {name:"fa-ruble",value:"fa-ruble"},
    {name:"fa-rupee",value:"fa-rupee"},
    {name:"fa-save",value:"fa-save"},
    {name:"fa-scissors",value:"fa-scissors"},
    {name:"fa-search",value:"fa-search"},
    {name:"fa-search-minus",value:"fa-search-minus"},
    {name:"fa-search-plus",value:"fa-search-plus"},
    {name:"fa-send",value:"fa-send"},
    {name:"fa-send-o",value:"fa-send-o"},
    {name:"fa-share",value:"fa-share"},
    {name:"fa-share-alt",value:"fa-share-alt"},
    {name:"fa-share-alt-square",value:"fa-share-alt-square"},
    {name:"fa-share-square",value:"fa-share-square"},
    {name:"fa-share-square-o",value:"fa-share-square-o"},
    {name:"fa-shield",value:"fa-shield"},
    {name:"fa-shopping-cart",value:"fa-shopping-cart"},
    {name:"fa-sign-in",value:"fa-sign-in"},
    {name:"fa-sign-out",value:"fa-sign-out"},
    {name:"fa-signal",value:"fa-signal"},
    {name:"fa-sitemap",value:"fa-sitemap"},
    {name:"fa-skype",value:"fa-skype"},
    {name:"fa-slack",value:"fa-slack"},
    {name:"fa-sliders",value:"fa-sliders"},
    {name:"fa-smile-o",value:"fa-smile-o"},
    {name:"fa-sort",value:"fa-sort"},
    {name:"fa-sort-alpha-asc",value:"fa-sort-alpha-asc"},
    {name:"fa-sort-alpha-desc",value:"fa-sort-alpha-desc"},
    {name:"fa-sort-amount-asc",value:"fa-sort-amount-asc"},
    {name:"fa-sort-amount-desc",value:"fa-sort-amount-desc"},
    {name:"fa-sort-asc",value:"fa-sort-asc"},
    {name:"fa-sort-desc",value:"fa-sort-desc"},
    {name:"fa-sort-down",value:"fa-sort-down"},
    {name:"fa-sort-numeric-asc",value:"fa-sort-numeric-asc"},
    {name:"fa-sort-numeric-desc",value:"fa-sort-numeric-desc"},
    {name:"fa-sort-up",value:"fa-sort-up"},
    {name:"fa-soundcloud",value:"fa-soundcloud"},
    {name:"fa-space-shuttle",value:"fa-space-shuttle"},
    {name:"fa-spinner",value:"fa-spinner"},
    {name:"fa-spoon",value:"fa-spoon"},
    {name:"fa-spotify",value:"fa-spotify"},
    {name:"fa-square",value:"fa-square"},
    {name:"fa-square-o",value:"fa-square-o"},
    {name:"fa-stack-exchange",value:"fa-stack-exchange"},
    {name:"fa-stack-overflow",value:"fa-stack-overflow"},
    {name:"fa-star",value:"fa-star"},
    {name:"fa-star-half",value:"fa-star-half"},
    {name:"fa-star-half-empty",value:"fa-star-half-empty"},
    {name:"fa-star-half-full",value:"fa-star-half-full"},
    {name:"fa-star-half-o",value:"fa-star-half-o"},
    {name:"fa-star-o",value:"fa-star-o"},
    {name:"fa-steam",value:"fa-steam"},
    {name:"fa-steam-square",value:"fa-steam-square"},
    {name:"fa-step-backward",value:"fa-step-backward"},
    {name:"fa-step-forward",value:"fa-step-forward"},
    {name:"fa-stethoscope",value:"fa-stethoscope"},
    {name:"fa-stop",value:"fa-stop"},
    {name:"fa-strikethrough",value:"fa-strikethrough"},
    {name:"fa-stumbleupon",value:"fa-stumbleupon"},
    {name:"fa-stumbleupon-circle",value:"fa-stumbleupon-circle"},
    {name:"fa-subscript",value:"fa-subscript"},
    {name:"fa-suitcase",value:"fa-suitcase"},
    {name:"fa-sun-o",value:"fa-sun-o"},
    {name:"fa-superscript",value:"fa-superscript"},
    {name:"fa-support",value:"fa-support"},
    {name:"fa-table",value:"fa-table"},
    {name:"fa-tablet",value:"fa-tablet"},
    {name:"fa-tachometer",value:"fa-tachometer"},
    {name:"fa-tag",value:"fa-tag"},
    {name:"fa-tags",value:"fa-tags"},
    {name:"fa-tasks",value:"fa-tasks"},
    {name:"fa-taxi",value:"fa-taxi"},
    {name:"fa-tencent-weibo",value:"fa-tencent-weibo"},
    {name:"fa-terminal",value:"fa-terminal"},
    {name:"fa-text-height",value:"fa-text-height"},
    {name:"fa-text-width",value:"fa-text-width"},
    {name:"fa-th",value:"fa-th"},
    {name:"fa-th-large",value:"fa-th-large"},
    {name:"fa-th-list",value:"fa-th-list"},
    {name:"fa-thumb-tack",value:"fa-thumb-tack"},
    {name:"fa-thumbs-down",value:"fa-thumbs-down"},
    {name:"fa-thumbs-o-down",value:"fa-thumbs-o-down"},
    {name:"fa-thumbs-o-up",value:"fa-thumbs-o-up"},
    {name:"fa-thumbs-up",value:"fa-thumbs-up"},
    {name:"fa-ticket",value:"fa-ticket"},
    {name:"fa-times",value:"fa-times"},
    {name:"fa-times-circle",value:"fa-times-circle"},
    {name:"fa-times-circle-o",value:"fa-times-circle-o"},
    {name:"fa-tint",value:"fa-tint"},
    {name:"fa-toggle-down",value:"fa-toggle-down"},
    {name:"fa-toggle-left",value:"fa-toggle-left"},
    {name:"fa-toggle-right",value:"fa-toggle-right"},
    {name:"fa-toggle-up",value:"fa-toggle-up"},
    {name:"fa-trash-o",value:"fa-trash-o"},
    {name:"fa-tree",value:"fa-tree"},
    {name:"fa-trello",value:"fa-trello"},
    {name:"fa-trophy",value:"fa-trophy"},
    {name:"fa-truck",value:"fa-truck"},
    {name:"fa-try",value:"fa-try"},
    {name:"fa-tumblr",value:"fa-tumblr"},
    {name:"fa-tumblr-square",value:"fa-tumblr-square"},
    {name:"fa-turkish-lira",value:"fa-turkish-lira"},
    {name:"fa-twitter",value:"fa-twitter"},
    {name:"fa-twitter-square",value:"fa-twitter-square"},
    {name:"fa-umbrella",value:"fa-umbrella"},
    {name:"fa-underline",value:"fa-underline"},
    {name:"fa-undo",value:"fa-undo"},
    {name:"fa-university",value:"fa-university"},
    {name:"fa-unlink",value:"fa-unlink"},
    {name:"fa-unlock",value:"fa-unlock"},
    {name:"fa-unlock-alt",value:"fa-unlock-alt"},
    {name:"fa-unsorted",value:"fa-unsorted"},
    {name:"fa-upload",value:"fa-upload"},
    {name:"fa-usd",value:"fa-usd"},
    {name:"fa-user",value:"fa-user"},
    {name:"fa-user-md",value:"fa-user-md"},
    {name:"fa-users",value:"fa-users"},
    {name:"fa-video-camera",value:"fa-video-camera"},
    {name:"fa-vimeo-square",value:"fa-vimeo-square"},
    {name:"fa-vine",value:"fa-vine"},
    {name:"fa-vk",value:"fa-vk"},
    {name:"fa-volume-down",value:"fa-volume-down"},
    {name:"fa-volume-off",value:"fa-volume-off"},
    {name:"fa-volume-up",value:"fa-volume-up"},
    {name:"fa-warning",value:"fa-warning"},
    {name:"fa-wechat",value:"fa-wechat"},
    {name:"fa-weibo",value:"fa-weibo"},
    {name:"fa-weixin",value:"fa-weixin"},
    {name:"fa-wheelchair",value:"fa-wheelchair"},
    {name:"fa-windows",value:"fa-windows"},
    {name:"fa-won",value:"fa-won"},
    {name:"fa-wordpress",value:"fa-wordpress"},
    {name:"fa-wrench",value:"fa-wrench"},
    {name:"fa-xing",value:"fa-xing"},
    {name:"fa-xing-square",value:"fa-xing-square"},
    {name:"fa-yahoo",value:"fa-yahoo"},
    {name:"fa-yen",value:"fa-yen"},
    {name:"fa-youtube",value:"fa-youtube"},
    {name:"fa-youtube-play",value:"fa-youtube-play"},
    {name:"fa-youtube-square",value:"fa-youtube-square"}];


    $rootScope.colors = [
        "#000000",
        "#000033",
        "#000066",
        "#000099",
        "#0000CC",
        "#0000FF",
        "#003300",
        "#003333",
        "#003366",
        "#003399",
        "#0033CC",
        "#0033FF",
        "#006600",
        "#006633",
        "#006666",
        "#006699",
        "#0066CC",
        "#0066FF",
        "#009900",
        "#009933",
        "#009966",
        "#009999",
        "#0099CC",
        "#0099FF",
        "#00CC00",
        "#00CC33",
        "#00CC66",
        "#00CC99",
        "#00CCCC",
        "#00CCFF",
        "#00FF00",
        "#00FF33",
        "#00FF66",
        "#00FF99",
        "#00FFCC",
        "#00FFFF",
        "#330000",
        "#330033",
        "#330066",
        "#330099",
        "#3300CC",
        "#3300FF",
        "#333300",
        "#333333",
        "#333366",
        "#333399",
        "#3333CC",
        "#3333FF",
        "#336600",
        "#336633",
        "#336666",
        "#336699",
        "#3366CC",
        "#3366FF",
        "#339900",
        "#339933",
        "#339966",
        "#339999",
        "#3399CC",
        "#3399FF",
        "#33CC00",
        "#33CC33",
        "#33CC66",
        "#33CC99",
        "#33CCCC",
        "#33CCFF",
        "#33FF00",
        "#33FF33",
        "#33FF66",
        "#33FF99",
        "#33FFCC",
        "#33FFFF",
        "#660000",
        "#660033",
        "#660066",
        "#660099",
        "#6600CC",
        "#6600FF",
        "#663300",
        "#663333",
        "#663366",
        "#663399",
        "#6633CC",
        "#6633FF",
        "#666600",
        "#666633",
        "#666666",
        "#666699",
        "#6666CC",
        "#6666FF",
        "#669900",
        "#669933",
        "#669966",
        "#669999",
        "#6699CC",
        "#6699FF",
        "#66CC00",
        "#66CC33",
        "#66CC66",
        "#66CC99",
        "#66CCCC",
        "#66CCFF",
        "#66FF00",
        "#66FF33",
        "#66FF66",
        "#66FF99",
        "#66FFCC",
        "#66FFFF",
        "#990000",
        "#990033",
        "#990066",
        "#990099",
        "#9900CC",
        "#9900FF",
        "#993300",
        "#993333",
        "#993366",
        "#993399",
        "#9933CC",
        "#9933FF",
        "#996600",
        "#996633",
        "#996666",
        "#996699",
        "#9966CC",
        "#9966FF",
        "#999900",
        "#999933",
        "#999966",
        "#999999",
        "#9999CC",
        "#9999FF",
        "#99CC00",
        "#99CC33",
        "#99CC66",
        "#99CC99",
        "#99CCCC",
        "#99CCFF",
        "#99FF00",
        "#99FF33",
        "#99FF66",
        "#99FF99",
        "#99FFCC",
        "#99FFFF",
        "#CC0000",
        "#CC0033",
        "#CC0066",
        "#CC0099",
        "#CC00CC",
        "#CC00FF",
        "#CC3300",
        "#CC3333",
        "#CC3366",
        "#CC3399",
        "#CC33CC",
        "#CC33FF",
        "#CC6600",
        "#CC6633",
        "#CC6666",
        "#CC6699",
        "#CC66CC",
        "#CC66FF",
        "#CC9900",
        "#CC9933",
        "#CC9966",
        "#CC9999",
        "#CC99CC",
        "#CC99FF",
        "#CCCC00",
        "#CCCC33",
        "#CCCC66",
        "#CCCC99",
        "#CCCCCC",
        "#CCCCFF",
        "#CCFF00",
        "#CCFF33",
        "#CCFF66",
        "#CCFF99",
        "#CCFFCC",
        "#CCFFFF",
        "#FF0000",
        "#FF0033",
        "#FF0066",
        "#FF0099",
        "#FF00CC",
        "#FF00FF",
        "#FF3300",
        "#FF3333",
        "#FF3366",
        "#FF3399",
        "#FF33CC",
        "#FF33FF",
        "#FF6600",
        "#FF6633",
        "#FF6666",
        "#FF6699",
        "#FF66CC",
        "#FF66FF",
        "#FF9900",
        "#FF9933",
        "#FF9966",
        "#FF9999",
        "#FF99CC",
        "#FF99FF",
        "#FFCC00",
        "#FFCC33",
        "#FFCC66",
        "#FFCC99",
        "#FFCCCC",
        "#FFCCFF",
        "#FFFF00",
        "#FFFF33",
        "#FFFF66",
        "#FFFF99",
        "#FFFFCC",
        "#FFFFFF"];

});
