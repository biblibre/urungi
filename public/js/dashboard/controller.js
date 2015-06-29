/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 09/01/15
 * Time: 13:05
 * To change this template use File | Settings | File Templates.
 */

'use strict';

app.controller('dashBoardCtrl', ['$scope', 'reportModel', '$timeout', '$routeParams' ,function ($scope, reportModel ,$timeout ,$routeParams ) {

    $scope.designMode = false;
    $scope.selectedElement != null;
    $scope.reportsModel = reportModel;
    $scope.rowPadding = "10px";
    $scope.orderNbr = 0;
    $scope.quote = "'";
    $scope.dashboardID = $routeParams.dashboardID;

    console.log('loading dashboard controller..');

   // $scope.$broadcast('gridster-resized', [width, height]);

    $scope.setDesignMode = function() {
        if ($scope.designMode)
        {
            $scope.designMode = false;
            $scope.rowPadding = "10px";
        }else {
            $scope.designMode = true;
            $scope.rowPadding = "10px";
        }
    }

    /*
    $scope.insertCode = function() {
        var $div = $('<div class="dashBoardItem"><div class="panel panel-default"><div class="panel-body">Basic panel example</div></div></div>');
        //$(document.body).append($div);
        $(dashBoardLayout).append($div);


            angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });
    } */

     /*
    $scope.generateDashBoard0 = function() {
      var generatedHTML = '';
      var dashBoardDefinition = {rows:[{rowHeight:"200px",cols:[{title:"el titulo 1",reportID:"11111"},{title:"Columna 2",reportID:"22222"}]},
                                        {rowHeight:"200px",cols:[{title:"row 2 1",reportID:"33333"},{title:"row 2 2",reportID:44444}]},
                                        {rowHeight:"200px",cols:[{title:"row 3 1",reportID:"55555"}]},
                                        {rowHeight:"400px",cols:[{title:"row 4 1",reportID:"66666"}]}
                                        ]};
        for (var r in dashBoardDefinition.rows) {

            var theRowHeight =  dashBoardDefinition.rows[r].rowHeight;
            var theRowID = 'row'+r;

                        //generatedHTML += '<div class="col-md-12" style="height: '+theRowHeight+';padding: {{rowPadding}}">';
            generatedHTML += '<div  class="col-md-12" style="padding: {{rowPadding}};position: relative;" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)">';

            var colClass = 'col-md-12';

            if (dashBoardDefinition.rows[r].cols.length == 2)
                colClass = 'col-md-6';
            if (dashBoardDefinition.rows[r].cols.length == 3)
                colClass = 'col-md-4';
            if (dashBoardDefinition.rows[r].cols.length == 4)
                colClass = 'col-md-3';
            if (dashBoardDefinition.rows[r].cols.length == 5)
                colClass = 'col-md-2';
            if (dashBoardDefinition.rows[r].cols.length == 6)
                colClass = 'col-md-2';


            for (var c in dashBoardDefinition.rows[r].cols) {
                generatedHTML += '<div class="'+colClass+'"  style="height: '+theRowHeight+';" x-lvl-draggable="true" x-lvl-drop-target="false" x-on-select="selected(selectedEl)"><div class="panel panel-default"  style="height: '+theRowHeight+';"><div class="panel-body">';
                //generatedHTML += '<div class="'+colClass+'"  ><div class="panel panel-default"><div class="panel-body">';

                //generación del componente
               // generatedHTML += dashBoardDefinition.rows[r].cols[c].title;

                reportsModel.getReportHTML($scope,'11111', function(theHTML) {
                    generatedHTML += theHTML;
                });

                generatedHTML += '</div></div></div>';

            }

            generatedHTML += '<div class="col-md-12 addNewRow" ng-show="designMode"><small>Add New Row</small></div>';
            generatedHTML += '</div>';



        }

        var $div = $(generatedHTML);
        $(dashBoardLayout).append($div);
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });

    }
        */
    $scope.generateDashBoard = function() {
        $scope.orderNbr = 0;
        var generatedHTML = '';

        /*
        var dashBoardDefinition = {rows:[
            {rowHeight:"200px",cols:[{title:"el titulo 1",reportID:"11111"},{title:"Columna 2",reportID:"22222"}]},
            {rowHeight:"200px",cols:[{title:"row 2 1",reportID:"33333"},{title:"row 2 2",reportID:44444}]},
            {rowHeight:"200px",cols:[{title:"row 3 1",reportID:"55555",verticalScroll:"yes"}]},
            {rowHeight:"200px",cols:[{title:"row 4 1",reportID:"66666",verticalScroll:"yes",horizontalScroll:"yes"}]}
        ]} ;
        */

        console.log ('este es el dID ' + $scope.dashboardID);

        if ($scope.dashboardID == 'clients')
        {
            $scope.dashBoardDefinitition = {backgroundColor:"#FFFFFF" ,items:[
                { itemType: "reportBlock",size: { x: 3, y: 2 }, position: [0, 0],title:"row 4 1",reportID:"101010",overflowy:"hidden",overflowx:"hidden" },
                { itemType: "reportBlock",size: { x: 1, y: 1 }, position: [0, 3],title:"% Retorno Clientes",reportID:"88888b",overflowy:"hidden",overflowx:"hidden" },
                { itemType: "reportBlock",size: { x: 1, y: 1 }, position: [0, 4],title:"Columna 2",reportID:"22222a",overflowy:"hidden",overflowx:"hidden" },
                { itemType: "reportBlock",size: { x: 1, y: 1 }, position: [0, 5],title:"Columna 2",reportID:"22222b",overflowy:"hidden",overflowx:"hidden" },
                { itemType: "reportBlock",size: { x: 3, y: 1 }, position: [1, 3],title:"Columna 2",reportID:"99999a",overflowy:"hidden",overflowx:"hidden" },
                { itemType: "reportBlock",size: { x: 3, y: 1 }, position: [2, 3],title:"el titulo 1",reportID:"11111",overflowy:"hidden",overflowx:"hidden" },

                { itemType: "reportBlock",size: { x: 3, y: 2 }, position: [2, 0],title:"row 3 1",reportID:"55555a",overflowy:"auto",overflowx:"hidden" }
               // { size: { x: 1, y: 1 }, position: [3, 4],title:"row 4 1",reportID:"77777",overflowy:"hidden",overflowx:"hidden" },

               // { size: { x: 1, y: 1 }, position: [3, 5],title:"row 4 1",reportID:"99999",overflowy:"hidden",overflowx:"hidden" }

            ]};
        }

        if ($scope.dashboardID == '1234567890')
        {
        $scope.dashBoardDefinitition = {items:[
            { itemType: "reportBlock",size: { x: 2, y: 2 }, position: [0, 0],title:"el titulo 1",reportID:"11111",overflowy:"hidden",overflowx:"hidden" },

            { itemType: "reportBlock",size: { x: 2, y: 2 }, position: [0, 2],title:"row 2 1",reportID:"33333",overflowy:"hidden",overflowx:"hidden" },
            { itemType: "reportBlock",size: { x: 2, y: 2 }, position: [0, 5],title:"row 2 2",reportID:"44444",overflowy:"hidden",overflowx:"hidden" }
            /*{ itemType: "reportBlock",size: { x: 2, y: 1 }, position: [1, 0],title:"row 3 1",reportID:"55555",overflowy:"auto",overflowx:"hidden" },
            { itemType: "reportBlock",size: { x: 1, y: 1 }, position: [1, 4],title:"row 4 1",reportID:"66666",overflowy:"auto",overflowx:"auto" },
            { itemType: "reportBlock",size: { x: 1, y: 1 }, position: [1, 5],title:"row 4 1",reportID:"77777",overflowy:"hidden",overflowx:"hidden" },
            { itemType: "reportBlock",size: { x: 1, y: 1 }, position: [2, 0],title:"row 4 1",reportID:"88888",overflowy:"hidden",overflowx:"hidden" },
            { itemType: "reportBlock",size: { x: 1, y: 1 }, position: [2, 1],title:"row 4 1",reportID:"99999",overflowy:"hidden",overflowx:"hidden" }*/
            ]};
        }


        if ($scope.dashboardID == 'clientDashboard')
        {
            $scope.dashBoardDefinitition = {items:[
                { itemType: "reportBlock",size: { x: 3, y: 2 }, position: [0, 0],title:"row 4 1",reportID:"101011",overflowy:"hidden",overflowx:"hidden" },
                { itemType: "reportBlock",size: { x: 3, y: 1 }, position: [0, 3],title:"% Retorno Clientes",reportID:"88888a",overflowy:"hidden",overflowx:"hidden" },
                { itemType: "reportBlock",size: { x: 3, y: 1 }, position: [1, 3],title:"el titulo 1",reportID:"11111",overflowy:"hidden",overflowx:"hidden" },


                { itemType: "tabBlock",size: { x: 6, y: 3 }, position: [2, 0],title:"row 3 1",reportID:"XXXXXX",overflowy:"auto",overflowx:"hidden", items:[{itemType: "reportBlock",size: { x: 3, y: 2 }, position: [2, 0],title:"Reservas",reportID:"XXXXXXa",overflowy:"auto",overflowx:"hidden"},{itemType: "reportBlock",size: { x: 3, y: 2 }, position: [2, 0],title:"Incidencias",reportID:"XXXXXXb",overflowy:"auto",overflowx:"hidden"},{itemType: "reportBlock",size: { x: 3, y: 2 }, position: [2, 0],title:"Facturación",reportID:"XXXXXXc",overflowy:"auto",overflowx:"hidden"}] }
            ]};
        }

        $scope.$apply;



        $timeout(function(){
            for (var r in $scope.dashBoardDefinitition.items) {
                if ($scope.dashBoardDefinitition.items[r].itemType == 'reportBlock')
                {
                    $scope.getReport($scope.dashBoardDefinitition.items[r].reportID);
                }
                if ($scope.dashBoardDefinitition.items[r].itemType == 'tabBlock')
                {
                    $scope.getTabBlock($scope.dashBoardDefinitition.items[r]);
                }
            }
        },1000);


        $scope.$watch('dashBoardDefinitition.items', function(items){
            // one of the items changed
            console.log('item changed: '+items);
            $(window).trigger('resize');
        }, true);
        /*
        $scope.$watch('dashBoardDefinitition.items',function(newValue,oldValue) {
            if(newValue) {
                for (var r in $scope.dashBoardDefinitition.items) {
                    $scope.getReport($scope.dashBoardDefinitition.items[r].reportID);
                }
            }
        });
          */

       /*
        for (var r in dashBoardDefinition.rows) {

            generatedHTML += generateRow(dashBoardDefinition,r,'');

        }

        var $div = $(generatedHTML);
        $(dashBoardLayout).append($div);
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });
       */

    }

    /*
    PARA ENTRAR EN MODO DISEÑO
    http://tympanus.net/Development/ButtonComponentMorph/index7.html#
    PARA HACER PAGINAS DE CONTENIDO
    http://builder.chillyorange.com/demo/
    PARA HACER EL DASHBOARD
    https://github.com/ManifestWebDesign/angular-gridster
    */
   /*
    function generateRow(dashBoardDefinition,index, htmlCode)
    {
        console.log("generating Row");
       // if (!dashBoardDefinition.rows[index])
       // {
            //done(htmlCode);
       //     return;
       // } else {
            var theRowHeight =  dashBoardDefinition.rows[index].rowHeight;
            var theRowID = 'row'+index;
            var generatedHTML = htmlCode;
            generatedHTML += '<div id="'+theRowID+'" class="col-md-12" style="padding: {{rowPadding}};position: relative;" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)">';

            var colClass = 'col-md-12';

            if (dashBoardDefinition.rows[index].cols.length == 2)
                colClass = 'col-md-6';
            if (dashBoardDefinition.rows[index].cols.length == 3)
                colClass = 'col-md-4';
            if (dashBoardDefinition.rows[index].cols.length == 4)
                colClass = 'col-md-3';
            if (dashBoardDefinition.rows[index].cols.length == 5)
                colClass = 'col-md-2';
            if (dashBoardDefinition.rows[index].cols.length == 6)
                colClass = 'col-md-2';


        for (var c in dashBoardDefinition.rows[index].cols) {
            generatedHTML += generateBlock(dashBoardDefinition.rows[index],c,'',theRowHeight,colClass);
        }

        //generatedHTML += theCode;
        generatedHTML += '</div>';


        return generatedHTML;
        //}

    }  */

    $scope.getVerticalScroll = function(isVertical)
    {
        var vscroll = 'overflow-y: hidden;';
        if (isVertical == 'yes')
            vscroll = 'overflow-y: scroll;';

        return vscroll;
    }

    $scope.getHorizontalScroll = function(isHorizontal)
    {
        var hscroll = 'overflow-x: hidden;';
        if (isHorizontal == 'yes')
            hscroll = 'overflow-x: scroll;';

        return vscroll;
    }
 /*
    function generateBlock(row,index, htmlCode, theRowHeight,colClass)
    {

            var generatedHTML = htmlCode;
            var quote = "'";

            var vscroll = 'overflow-y: hidden;';
            if (row.cols[index].verticalScroll == 'yes')
                vscroll = 'overflow-y: scroll;';

            var hscroll = 'overflow-x: hidden;';
            if (row.cols[index].horizontalScroll == 'yes')
                hscroll = 'overflow-x: scroll;';

            generatedHTML += '<div class="'+colClass+'">El titulo</div>';

            generatedHTML += '<div class="'+colClass+'"  style="height: '+theRowHeight+';" x-lvl-draggable="true" x-lvl-drop-target="false" x-on-select="selected(selectedEl)"><div class="panel panel-default"  style="height: '+theRowHeight+';"><div id="'+row.cols[index].reportID+'" class="panel-body" ng-init="getReport('+quote+row.cols[index].reportID+quote+')" style="height: '+theRowHeight+';'+vscroll+hscroll+'">';
                generatedHTML += '</div></div></div>';
           return generatedHTML;
        //}
    }
   */
    $scope.getReport = function(reportID)
    {


        console.log('entering on get report for report ID '+reportID)

        reportModel.getReportBlock($scope,reportID, function(errorCode) {

            if (errorCode != 0)
            {
             var el = document.getElementById(reportID);

             var theHTML = '';
             if (errorCode == 1)
                 theHTML = '<div class="alert">Report not found!</div>';
             if (errorCode == 2)
                 theHTML = '<div class="alert">Chart type not found!</div>';
             if (errorCode == 3)
                 theHTML = '<div class="alert">No data Found!</div>';

             if (el)
             {
                 console.log(el);
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

    $scope.getTabBlock = function(blockItem)
    {

        /*<tabset>
            <tab heading="Static title">Static content</tab>
            <tab ng-repeat="tab in tabs" heading="{{tab.title}}" active="tab.active" disabled="tab.disabled">
      {{tab.content}}
            </tab>
            <tab select="alertMe()">
                <tab-heading>
                    <i class="glyphicon glyphicon-bell"></i> Alert!
                </tab-heading>
            I've got an HTML heading, and a select callback. Pretty cool!
            </tab>
        </tabset>*/


        /*
        var theHTML = '<ul class="nav nav-tabs" style="width="100%">';

        for (var r in blockItem.items) {
            if (r == 0)
                theHTML += '<li class="active"><a href="#one-normal" data-toggle="tab"><i class="fa fa-camera"></i> One</a></li>';
            else
                theHTML += '<li><a href="#one-normal" data-toggle="tab"><i class="fa fa-camera"></i> One</a></li>';
        }

        theHTML += '</ul><div class="tab-content">';
        for (var r in blockItem.items) {
            if (r == 0)
                theHTML += '<div id="'+blockItem.items[r].reportID+'" class="tab-pane active" id="two-normal" ng-init="getReport('+blockItem.items[r].reportID+')"></div>';
            else
                theHTML += '<div id="'+blockItem.items[r].reportID+'" class="tab-pane" id="two-normal" ng-init="getReport('+blockItem.items[r].reportID+')"></div>';
        }

        theHTML += '</div>';
        */

        var theHTML = '<tabset>';

        for (var r in blockItem.items) {

                theHTML += '<tab heading="'+blockItem.items[r].title+'"><div id="'+blockItem.items[r].reportID+'"></div></tab>';

        }
        theHTML += '</tabset>';

        var el = document.getElementById(blockItem.reportID);

        var $div = $(theHTML);
        angular.element(el).append($div);
        //el.append($div);
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });


        $timeout(function(){
            for (var r in blockItem.items) {
                    $scope.getReport(blockItem.items[r].reportID);
            }
        },1000);

    }


    $scope.selected = function(selectedEl) {
        /*
        console.log('entering selected '+$scope.selectedElement + selectedEl)
        var theElement = angular.element(selectedEl);

        if ($scope.selectedElement != null)
        {
            console.log('removing selected ');
            $scope.selectedElement.removeClass('selected');
            theElement.addClass('style="background-color:#000000"');
            //$scope.selectedElement.attr("contenteditable", "false");
        }

        //$scope.selectedElement = angular.element(selectedEl);
        $scope.selectedElement = theElement;

        //angular.element(selectedEl).addClass('selected');
        theElement.addClass('selected');
        $scope.isSelected = true;
        //console.log('element selected bc '+selectedElement.attr('id'));
        */

        return true;
        //$scope.getElementProperties();

    }

    $scope.onReportAction = function(actionType,targetID,targetFilters,sourceID)
    {
        console.log('estamos entrando en la accion del informe '+ actionType);
        console.log('/dashboards/'+targetID+'/'+targetFilters+'/'+sourceID);

        //actions:[{actionEvent:"onRowClick",actionType:"goToDashBoard",targetID:"clientDashboard",targetFilters:['customerID'];
        if (actionType == 'goToDashBoard')
        {
            //window.location.href="/home/#/my-employee-profile";
            window.location.hash = '/dashboards/'+targetID; //+'/'+targetFilters+'/'+sourceID;
        }



    }

}]);/*.directive('dashBoardLayout', function($compile) {
        return {
            template: '<div><label>{{input.label}}: </label></div>',
            replace: true,
            link: function(scope, element) {
                var el = angular.element('<span/>');
                switch(scope.input.inputType) {
                    case 'checkbox':
                        el.append('<input type="checkbox" ng-model="input.checked"/><button ng-if="input.checked" ng-click="input.checked=false; doSomething()">X</button>');
                        break;
                    case 'text':
                        el.append('<input type="text" ng-model="input.value"/><button ng-if="input.value" ng-click="input.value=\'\'; doSomething()">X</button>');
                        break;
                }
                $compile(el)(scope);
                element.append(el);
            }
        }
    });
 */