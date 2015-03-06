/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 10/01/15
 * Time: 08:01
 * To change this template use File | Settings | File Templates.
 */

'use strict';

app.controller('reportCtrl', function ($scope, $routeParams, reportModel ) {

    $scope.reportID = $routeParams.reportID;
    $scope.metrics = ['Count'];
    $scope.rows = [];
    $scope.columns = [];

    $scope.metadata = {
        tables: [
            {
                id: "T1",
                name: "ndcustom_Employees",
                datasourceID: "SSSS1",
                fields: [{
                        id: "F1",
                        alias: "Employee",
                        fieldName: "employeeName",
                        tableID: "T1",
                        type: "String",
                        role: "Dimension",
                        parent: "F1",
                        visible: true


                    },
                    {
                        id: "F2",
                        alias: "Code",
                        fieldName: "employeeCode",
                        tableID: "T1",
                        type: "String",
                        role: "Dimension",
                        parent: "F2",
                        visible: true
                    },
                    {
                        id: "F2",
                        alias: "idunit",
                        fieldName: "idunit",
                        tableID: "T1",
                        type: "String",
                        role: "Dimension",
                        parent: "",
                        visible: false
                    }]
            },
            {
                id: "T2",
                name: "ndcustom_Units",
                datasourceID: "SSSS1",
                fields: [{
                        id: "F3",
                        alias: "_id",
                        fieldName: "_id",
                        tableID: "T2",
                        type: "Object",
                        role: "Dimension",
                        parent: "",
                        visible: false
                    },
                    {
                        id: "F4",
                        alias: "brand",
                        fieldName: "brand",
                        tableID: "T2",
                        type: "String",
                        role: "Dimension",
                        parent: "",
                        visible: false
                    }]
            }
            ,
            {
                id: "T3",
                name: "ndcustom_Brands",
                datasourceID: "SSSS1",
                fields: [{
                        id: "F5",
                        alias: "_id",
                        fieldName: "_id",
                        tableID: "T3",
                        type: "Object",
                        role: "Dimension",
                        parent: "YYYYY",
                        visible: false
                    },
                    {
                        id: "F6",
                        alias: "brand",
                        fieldName: "brand",
                        tableID: "T3",
                        type: "String",
                        role: "Dimension",
                        parent: "F1",
                        visible: true
                    }]
            }

            ,
            {
                id: "T4",
                name: "Fields",
                datasourceID: "SSS771",
                fields: [{
                    id: "F5",
                    alias: "Province",
                    fieldName: "Province",
                    tableID: "T4",
                    type: "String",
                    role: "Dimension",
                    parent: "YYYYY",
                    visible: false
                },
                    {
                        id: "F5",
                        alias: "Gender",
                        fieldName: "Gender",
                        tableID: "T4",
                        type: "String",
                        role: "Dimension",
                        parent: "YYYYY",
                        visible: false
                    },
                    {
                        id: "F5",
                        alias: "Age",
                        fieldName: "Age",
                        tableID: "T4",
                        type: "String",
                        role: "Dimension",
                        parent: "YYYYY",
                        visible: false
                    },
                    {
                        id: "F5",
                        alias: "Party",
                        fieldName: "Party",
                        tableID: "T4",
                        type: "String",
                        role: "Dimension",
                        parent: "YYYYY",
                        visible: false
                    },
                    {
                        id: "F5",
                        alias: "Age Bin",
                        fieldName: "Age Bin",
                        tableID: "T4",
                        type: "String",
                        role: "Dimension",
                        parent: "YYYYY",
                        visible: false
                    }]
            }
        ],

        joins: [
            {
                id: "J1",
                leftTableID: "T1",
                rightTableID: "T2",
                leftFieldID:"idunit",
                rightFieldID: "_id",
                joinType: "inner",
                cardinality: ""
            },
            {
                id: "J2",
                leftTableID: "T2",
                rightTableID: "T3",
                leftFieldID:"brand",
                rightFieldID: "_id",   //la conversión del campo se hace por el tipo si String = Object (hay que hacer esa conversión...
                joinType: "inner",
                cardinality: ""
            }
        ],

        hierarchies: [
            {
                id: "XXXXXXXX1",
                name: "el que sea",
                fields : ["XXXXXXX1", "XXXXW2","XXXXD4"]
            },
            {
                id: "XXXXXXXX2",
                name: "el que sea 2",
                fields : ["XXXXXXX2", "XXXXW3","XXXXD5"]
            }
        ],

        dataSources: [
            {
                id: "SSSS1",
                type: "mongoDB",
                host: "192.168.1.1",
                port: "27017",
                username: "username",
                password: "contraseña"
            }
        ],

        folders: [
            {
                id:"F1",
                label: "folder 1",
                parent: ""
            },
            {
                id:"F2",
                label: "folder 2",
                parent: "F1"
            }

        ]


    } ;

    $scope.objectMap = {
          //debería venir ya anidado folder, campo... como resultado de la consulta con metadata, tiene que venir el alias, el id , el rol, el tipo
    }

    $scope.getReportDiv = function()
    {

        var generatedHTML = '<div id="'+$routeParams.reportID+'" class="panel-body reportPageBlockDesktop" style="min-height=400px;width:100%" ng-init="getReport()">';

        var $div = $(generatedHTML);
        $(reportLayout).append($div);
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });
    }

    $scope.getReport = function()
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


    $scope.getDataObjects = function()
    {
        var data = [];

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
            /*[
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
                        { name: 'Age Bin', type: 'item', additionalParameters: { id: 'agebin' } }
                    ]});

                }, 400);
            },
            multiSelect: true,
            cacheItems: true,
            folderSelect: false
        });



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

    $scope.onDrop = function() {
        var derivers = $.pivotUtilities.derivers;

        var mps = [ {"Province": "Quebec", "Party": "NDP", "Age": 22, "Name": "Liu, Laurin", "Gender": "Female"},{"Province": "Quebec", "Party": "Bloc Quebecois", "Age": 43, "Name": "Mourani, Maria", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": "", "Name": "Sellah, Djaouida", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 72, "Name": "St-Denis, Lise", "Gender": "Female"},{"Province": "British Columbia", "Party": "Liberal", "Age": 71, "Name": "Fry, Hedy", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 70, "Name": "Turmel, Nycole", "Gender": "Female"},{"Province": "Ontario", "Party": "Liberal", "Age": 68, "Name": "Sgro, Judy", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 67, "Name": "Raynault, Francine", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 66, "Name": "Davidson, Patricia", "Gender": "Female"},{"Province": "Manitoba", "Party": "Conservative", "Age": 65, "Name": "Smith, Joy", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 64, "Name": "Wong, Alice", "Gender": "Female"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 63, "Name": "O'Neill Gordon, Tilly", "Gender": "Female"},{"Province": "Alberta", "Party": "Conservative", "Age": 63, "Name": "Ablonczy, Diane", "Gender": "Female"},{"Province": "Alberta", "Party": "NDP", "Age": 63, "Name": "Duncan, Linda Francis", "Gender": "Female"},{"Province": "Ontario", "Party": "Liberal", "Age": 62, "Name": "Bennett, Carolyn", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 61, "Name": "Nash, Peggy", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 61, "Name": "Mathyssen, Irene", "Gender": "Female"},{"Province": "British Columbia", "Party": "NDP", "Age": 60, "Name": "Sims, Jinny Jogindera", "Gender": "Female"},{"Province": "Newfoundland and Labrador", "Party": "Liberal", "Age": 60, "Name": "Foote, Judy", "Gender": "Female"},{"Province": "British Columbia", "Party": "NDP", "Age": 60, "Name": "Crowder, Jean", "Gender": "Female"},{"Province": "British Columbia", "Party": "NDP", "Age": 59, "Name": "Davies, Libby", "Gender": "Female"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 59, "Name": "Yelich, Lynne", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 58, "Name": "Day, Anne-Marie", "Gender": "Female"},{"Province": "British Columbia", "Party": "Green", "Age": 58, "Name": "May, Elizabeth", "Gender": "Female"},{"Province": "British Columbia", "Party": "Liberal", "Age": 58, "Name": "Murray, Joyce", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 57, "Name": "Findlay, Kerry-Lynne D.", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 57, "Name": "Brown, Lois", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 57, "Name": "Laverdi\u008fre, H\u008el\u008fne", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 57, "Name": "Boutin-Sweet, Marjolaine", "Gender": "Female"},{"Province": "Alberta", "Party": "Conservative", "Age": 56, "Name": "Crockatt, Joan", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 55, "Name": "Chow, Olivia", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 55, "Name": "McLeod, Cathy", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 55, "Name": "Finley, Diane", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 54, "Name": "LeBlanc, H\u008el\u008fne", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 54, "Name": "Grewal, Nina", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 54, "Name": "Hughes, Carol", "Gender": "Female"},{"Province": "Prince Edward Island", "Party": "Conservative", "Age": 53, "Name": "Shea, Gail", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 53, "Name": "Truppe, Susan", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 52, "Name": "Young, Wai", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 52, "Name": "Gallant, Cheryl", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 52, "Name": "Boivin, Fran\u008doise", "Gender": "Female"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 51, "Name": "Block, Kelly", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 50, "Name": "Ayala, Paulina", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 50, "Name": "Groguh\u008e, Sadia", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 49, "Name": "Charlton, Chris", "Gender": "Female"},{"Province": "Manitoba", "Party": "Conservative", "Age": 48, "Name": "Bergen, Candice", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 46, "Name": "Perreault, Manon", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 46, "Name": "James, Roxanne", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 46, "Name": "Ambler, Stella", "Gender": "Female"},{"Province": "Ontario", "Party": "Liberal", "Age": 46, "Name": "Duncan, Kirsty", "Gender": "Female"},{"Province": "Manitoba", "Party": "Conservative", "Age": 45, "Name": "Glover, Shelly", "Gender": "Female"},{"Province": "Territories", "Party": "Conservative", "Age": 45, "Name": "Aglukkaq, Leona", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 44, "Name": "Raitt, Lisa", "Gender": "Female"},{"Province": "Alberta", "Party": "Conservative", "Age": 43, "Name": "Ambrose, Rona", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 42, "Name": "Leitch, Kellie", "Gender": "Female"},{"Province": "Nova Scotia", "Party": "NDP", "Age": 39, "Name": "Leslie, Megan", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 38, "Name": "Hassainia, Sana", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 38, "Name": "Adams, Eve", "Gender": "Female"},{"Province": "Alberta", "Party": "Conservative", "Age": 32, "Name": "Rempel, Michelle", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 32, "Name": "Papillon, Annick", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 31, "Name": "Sitsabaiesan, Rathika", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 30, "Name": "Quach, Anne Minh-Thu", "Gender": "Female"},{"Province": "Manitoba", "Party": "NDP", "Age": 30, "Name": "Ashton, Niki", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 29, "Name": "Moore, Christine", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Morin, Isabelle", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Blanchette-Lamothe, Lysane", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Brosseau, Ruth Ellen", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Latendresse, Alexandrine", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Dor\u008e Lefebvre, Rosane", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 27, "Name": "Morin, Marie-Claude", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 27, "Name": "Michaud, \u0083laine", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 24, "Name": "P\u008eclet, \u00e9ve", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 23, "Name": "Freeman, Myl\u008fne", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 22, "Name": "Borg, Charmaine", "Gender": "Female"},{"Province": "Manitoba", "Party": "Conservative", "Age": "", "Name": "Bateman, Joyce", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 43, "Name": "Hiebert, Russ", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 59, "Name": "Jacob, Pierre", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 57, "Name": "Vellacott, Maurice", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 75, "Name": "Boughen, Ray", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 73, "Name": "O'Connor, Gordon", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 72, "Name": "Cotler, Irwin", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 72, "Name": "Oliver, Joe", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 71, "Name": "Tilson, David Allan", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 70, "Name": "Fantino, Julian", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 69, "Name": "Kent, Peter", "Gender": "Male"},{"Province": "Quebec", "Party": "Bloc Quebecois", "Age": 69, "Name": "Plamondon, Louis", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 69, "Name": "Schellenberger, Gary", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 68, "Name": "Lauzon, Guy", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 68, "Name": "Harris, Richard M.", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 68, "Name": "Goldring, Peter", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 67, "Name": "Atamanenko, Alex", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 67, "Name": "Payne, LaVar", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 67, "Name": "Breitkreuz, Garry W.", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 66, "Name": "Genest, R\u008ejean", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 66, "Name": "MacKenzie, Dave", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 66, "Name": "Hyer, Bruce", "Gender": "Male"},{"Province": "Prince Edward Island", "Party": "Liberal", "Age": 66, "Name": "MacAulay, Lawrence", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 65, "Name": "Galipeau, Royal", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 65, "Name": "Marston, Wayne", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 65, "Name": "Hawn, Laurie", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 65, "Name": "Kramp, Daryl", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 65, "Name": "Shipley, Bev", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Conservative", "Age": 65, "Name": "Kerr, Greg", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 65, "Name": "Comartin, Joe", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 64, "Name": "Norlock, Rick", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 64, "Name": "McKay, John", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 64, "Name": "Mayes, Colin", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 64, "Name": "Rae, Bob", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "NDP", "Age": 64, "Name": "Harris, Jack", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 64, "Name": "Duncan, John", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 63, "Name": "Chisu, Corneliu", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 63, "Name": "Garneau, Marc", "Gender": "Male"},{"Province": "Prince Edward Island", "Party": "Liberal", "Age": 63, "Name": "Easter, Arnold Wayne", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 63, "Name": "Aspin, Jay", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Liberal", "Age": 63, "Name": "Goodale, Ralph", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 63, "Name": "Albrecht, Harold", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 63, "Name": "Gravelle, Claude", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 63, "Name": "Komarnicki, Ed", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 62, "Name": "Flaherty, James Michael (Jim)", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 62, "Name": "Rankin, Murray", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 62, "Name": "McCallum, John", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 62, "Name": "Warawa, Mark", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 62, "Name": "Obhrai, Deepak", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 62, "Name": "Benoit, Leon Earl", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 62, "Name": "Leung, Chungsen", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 61, "Name": "Morin, Marc-Andr\u008e", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 61, "Name": "Sopuck, Robert", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 61, "Name": "Ritz, Gerry", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 61, "Name": "Garrison, Randall", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 61, "Name": "Lunney, James", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 61, "Name": "Lukiwski, Tom", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 60, "Name": "Carmichael, John", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 60, "Name": "Menzies, Ted", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 60, "Name": "Valcourt, Bernard", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 60, "Name": "Ashfield, Keith", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 60, "Name": "Nicholson, Rob", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 60, "Name": "Young, Terence H.", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 60, "Name": "Toews, Vic", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 60, "Name": "Sullivan, Mike", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 59, "Name": "Patry, Claude", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Conservative", "Age": 59, "Name": "Keddy, Gerald", "Gender": "Male"},{"Province": "Territories", "Party": "NDP", "Age": 59, "Name": "Bevington, Dennis Fraser", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 59, "Name": "Allen, Malcolm", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 59, "Name": "Rafferty, John", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 59, "Name": "Dreeshen, Earl", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 59, "Name": "Kamp, Randy", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 59, "Name": "Merrifield, Rob", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "Woodworth, Stephen", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "McColeman, Phil", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 58, "Name": "Lebel, Denis", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "Lizon, Wladyslaw", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "Holder, Ed", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 58, "Name": "Valeriote, Frank", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 58, "Name": "Christopherson, David", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 58, "Name": "Mulcair, Thomas J.", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "Daniel, Joe", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 57, "Name": "Karygiannis, Jim", "Gender": "Male"},{"Province": "New Brunswick", "Party": "NDP", "Age": 57, "Name": "Godin, Yvon", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 57, "Name": "Dionne Labelle, Pierre", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 57, "Name": "Preston, Joe", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 57, "Name": "B\u008elanger, Mauril", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 57, "Name": "Fast, Edward", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 57, "Name": "Tweed, Mervin C.", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 57, "Name": "Dion, St\u008ephane", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 57, "Name": "Van Kesteren, Dave", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Liberal", "Age": 57, "Name": "Cuzner, Rodger", "Gender": "Male"},{"Province": "Manitoba", "Party": "NDP", "Age": 57, "Name": "Martin, Pat", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "NDP", "Age": 56, "Name": "Stoffer, Peter", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 56, "Name": "Miller, Larry", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 56, "Name": "Blanchette, Denis", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 56, "Name": "Nunez-Melo, Jos\u008e", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 55, "Name": "Goguen, Robert", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 55, "Name": "Scarpaleggia, Francis", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 55, "Name": "Sweet, David", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 55, "Name": "Anderson, David", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "NDP", "Age": 55, "Name": "Chisholm, Robert", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 55, "Name": "Stanton, Bruce", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 54, "Name": "Goodyear, Gary", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 54, "Name": "Weston, John", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 54, "Name": "Dechert, Bob", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 54, "Name": "Shory, Devinder", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 54, "Name": "Pilon, Fran\u008dois", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 54, "Name": "Hayes, Bryan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 54, "Name": "Gigu\u008fre, Alain", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 54, "Name": "Sorenson, Kevin", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 53, "Name": "Benskin, Tyrone", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 53, "Name": "Menegakis, Costas", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 53, "Name": "Harper, Stephen", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 53, "Name": "Wilks, David", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Liberal", "Age": 53, "Name": "Regan, Geoff", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 52, "Name": "McGuinty, David", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 52, "Name": "Gosal, Bal", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 52, "Name": "Aubin, Robert", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Liberal", "Age": 52, "Name": "Eyking, Mark", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 52, "Name": "Brown, Gordon", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 52, "Name": "Allen, Mike", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 51, "Name": "Clement, Tony", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 51, "Name": "Cannan, Ronald", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 51, "Name": "Rousseau, Jean", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 51, "Name": "Opitz, Ted", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 50, "Name": "Toet, Lawrence", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 50, "Name": "Cash, Andrew", "Gender": "Male"},{"Province": "Manitoba", "Party": "Liberal", "Age": 50, "Name": "Lamoureux, Kevin", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 50, "Name": "Scott, Craig", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 50, "Name": "Adler, Mark", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 50, "Name": "Carrie, Colin", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 50, "Name": "Julian, Peter", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 50, "Name": "Pacetti, Massimo", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 50, "Name": "Saganash, Romeo", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 50, "Name": "Angus, Charlie", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 49, "Name": "Davies, Don", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 49, "Name": "Bernier, Maxime", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 49, "Name": "Dewar, Paul", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 49, "Name": "Jean, Brian", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 49, "Name": "Devolin, Barry", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 49, "Name": "Lemieux, Pierre", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 49, "Name": "Van Loan, Peter", "Gender": "Male"},{"Province": "Prince Edward Island", "Party": "Liberal", "Age": 49, "Name": "Casey, Sean", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 49, "Name": "Nantel, Pierre", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 49, "Name": "Coderre, Denis", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 49, "Name": "Wallace, Mike", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 48, "Name": "Braid, Peter", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 48, "Name": "Gourde, Jacques", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 48, "Name": "Reid, Scott", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 48, "Name": "Hsu, Ted", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 48, "Name": "Saxton, Andrew", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 48, "Name": "Weston, Rodney", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "Conservative", "Age": 48, "Name": "Penashue, Peter", "Gender": "Male"},{"Province": "Quebec", "Party": "Bloc Quebecois", "Age": 48, "Name": "Bellavance, Andr\u008e", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 48, "Name": "Rathgeber, Brent", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 48, "Name": "Kellway, Matthew", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 47, "Name": "Toone, Philip", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 47, "Name": "Allison, Dean", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 47, "Name": "Trottier, Bernard", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 47, "Name": "Blaney, Steven", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 47, "Name": "Bezan, James", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Conservative", "Age": 47, "Name": "MacKay, Peter Gordon", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 46, "Name": "Dykstra, Richard", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 46, "Name": "Sandhu, Jasbir", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 46, "Name": "Donnelly, Fin", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Conservative", "Age": 46, "Name": "Armstrong, Scott", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "Liberal", "Age": 46, "Name": "Byrne, Gerry", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 46, "Name": "Stewart, Kennedy", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "NDP", "Age": 46, "Name": "Cleary, Ryan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 45, "Name": "C\u0099t\u008e, Raymond", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 45, "Name": "Clarke, Rob", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Liberal", "Age": 45, "Name": "Brison, Scott", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 45, "Name": "Butt, Brad", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 45, "Name": "Rickford, Greg", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Liberal", "Age": 45, "Name": "LeBlanc, Dominic", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 45, "Name": "Hoback, Randy", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 44, "Name": "Caron, Guy", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 44, "Name": "Brahmi, Tarik", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 44, "Name": "Kenney, Jason", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 44, "Name": "Masse, Brian", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 44, "Name": "Alexander, Chris", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 44, "Name": "Zimmer, Bob", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 44, "Name": "Calkins, Blaine", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 43, "Name": "Baird, John", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 43, "Name": "Lake, Mike", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "Liberal", "Age": 43, "Name": "Simms, Scott", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 43, "Name": "Thibeault, Glenn", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 42, "Name": "Williamson, John", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 42, "Name": "Calandra, Paul", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 42, "Name": "Chicoine, Sylvain", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 42, "Name": "Del Mastro, Dean", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 42, "Name": "Rajotte, James", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 42, "Name": "Seeback, Kyle", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 41, "Name": "Watson, Jeff", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 41, "Name": "Lapointe, Fran\u008dois", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 41, "Name": "Nicholls, Jamie", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 41, "Name": "Chong, Michael D.", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 41, "Name": "Trudeau, Justin", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 40, "Name": "Larose, Jean-Fran\u008dois", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 40, "Name": "Anders, Rob", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 40, "Name": "Fletcher, Steven John", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 40, "Name": "Cullen, Nathan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 39, "Name": "Ravignat, Mathieu", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 39, "Name": "Bruinooge, Rod", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 39, "Name": "Mai, Hoang", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 39, "Name": "Boulerice, Alexandre", "Gender": "Male"},{"Province": "Quebec", "Party": "Bloc Quebecois", "Age": 39, "Name": "Fortin, Jean-Fran\u008dois", "Gender": "Male"},{"Province": "Territories", "Party": "Conservative", "Age": 38, "Name": "Leef, Ryan", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 38, "Name": "Paradis, Christian", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 38, "Name": "Choquette, Fran\u008dois", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 38, "Name": "Moore, Rob", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 38, "Name": "Trost, Brad", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 38, "Name": "Gill, Parm", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 38, "Name": "Hillyer, Jim", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 38, "Name": "Richards, Blake", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 38, "Name": "Uppal, Tim", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "Liberal", "Age": 37, "Name": "Andrews, Scott", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 36, "Name": "Moore, James", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 36, "Name": "Lobb, Ben", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 36, "Name": "Albas, Dan", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 34, "Name": "Storseth, Brian", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 34, "Name": "Strahl, Mark", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 34, "Name": "Brown, Patrick W.", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 34, "Name": "Warkentin, Chris", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 33, "Name": "Scheer, Andrew", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 33, "Name": "Poilievre, Pierre", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 33, "Name": "Genest-Jourdain, Jonathan", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 33, "Name": "Harris, Dan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Tremblay, Jonathan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 27, "Name": "Morin, Dany", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 24, "Name": "Dub\u008e, Matthew", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 21, "Name": "Dusseault, Pierre-Luc", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": "", "Name": "O'Toole, Erin", "Gender": "Male"} ];
        var cols = [], rows = [];

        console.log($scope.columns);
        console.log($scope.rows);

        /*$("#pivotOutput").empty();
        $("#pivotOutput").pivotUI(mps, {
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
            rendererName: "Table"
        });*/
    };

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

    $scope.data = [ {"Province": "Quebec", "Party": "NDP", "Age": 22, "Name": "Liu, Laurin", "Gender": "Female"},{"Province": "Quebec", "Party": "Bloc Quebecois", "Age": 43, "Name": "Mourani, Maria", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": "", "Name": "Sellah, Djaouida", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 72, "Name": "St-Denis, Lise", "Gender": "Female"},{"Province": "British Columbia", "Party": "Liberal", "Age": 71, "Name": "Fry, Hedy", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 70, "Name": "Turmel, Nycole", "Gender": "Female"},{"Province": "Ontario", "Party": "Liberal", "Age": 68, "Name": "Sgro, Judy", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 67, "Name": "Raynault, Francine", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 66, "Name": "Davidson, Patricia", "Gender": "Female"},{"Province": "Manitoba", "Party": "Conservative", "Age": 65, "Name": "Smith, Joy", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 64, "Name": "Wong, Alice", "Gender": "Female"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 63, "Name": "O'Neill Gordon, Tilly", "Gender": "Female"},{"Province": "Alberta", "Party": "Conservative", "Age": 63, "Name": "Ablonczy, Diane", "Gender": "Female"},{"Province": "Alberta", "Party": "NDP", "Age": 63, "Name": "Duncan, Linda Francis", "Gender": "Female"},{"Province": "Ontario", "Party": "Liberal", "Age": 62, "Name": "Bennett, Carolyn", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 61, "Name": "Nash, Peggy", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 61, "Name": "Mathyssen, Irene", "Gender": "Female"},{"Province": "British Columbia", "Party": "NDP", "Age": 60, "Name": "Sims, Jinny Jogindera", "Gender": "Female"},{"Province": "Newfoundland and Labrador", "Party": "Liberal", "Age": 60, "Name": "Foote, Judy", "Gender": "Female"},{"Province": "British Columbia", "Party": "NDP", "Age": 60, "Name": "Crowder, Jean", "Gender": "Female"},{"Province": "British Columbia", "Party": "NDP", "Age": 59, "Name": "Davies, Libby", "Gender": "Female"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 59, "Name": "Yelich, Lynne", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 58, "Name": "Day, Anne-Marie", "Gender": "Female"},{"Province": "British Columbia", "Party": "Green", "Age": 58, "Name": "May, Elizabeth", "Gender": "Female"},{"Province": "British Columbia", "Party": "Liberal", "Age": 58, "Name": "Murray, Joyce", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 57, "Name": "Findlay, Kerry-Lynne D.", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 57, "Name": "Brown, Lois", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 57, "Name": "Laverdi\u008fre, H\u008el\u008fne", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 57, "Name": "Boutin-Sweet, Marjolaine", "Gender": "Female"},{"Province": "Alberta", "Party": "Conservative", "Age": 56, "Name": "Crockatt, Joan", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 55, "Name": "Chow, Olivia", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 55, "Name": "McLeod, Cathy", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 55, "Name": "Finley, Diane", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 54, "Name": "LeBlanc, H\u008el\u008fne", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 54, "Name": "Grewal, Nina", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 54, "Name": "Hughes, Carol", "Gender": "Female"},{"Province": "Prince Edward Island", "Party": "Conservative", "Age": 53, "Name": "Shea, Gail", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 53, "Name": "Truppe, Susan", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 52, "Name": "Young, Wai", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 52, "Name": "Gallant, Cheryl", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 52, "Name": "Boivin, Fran\u008doise", "Gender": "Female"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 51, "Name": "Block, Kelly", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 50, "Name": "Ayala, Paulina", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 50, "Name": "Groguh\u008e, Sadia", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 49, "Name": "Charlton, Chris", "Gender": "Female"},{"Province": "Manitoba", "Party": "Conservative", "Age": 48, "Name": "Bergen, Candice", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 46, "Name": "Perreault, Manon", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 46, "Name": "James, Roxanne", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 46, "Name": "Ambler, Stella", "Gender": "Female"},{"Province": "Ontario", "Party": "Liberal", "Age": 46, "Name": "Duncan, Kirsty", "Gender": "Female"},{"Province": "Manitoba", "Party": "Conservative", "Age": 45, "Name": "Glover, Shelly", "Gender": "Female"},{"Province": "Territories", "Party": "Conservative", "Age": 45, "Name": "Aglukkaq, Leona", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 44, "Name": "Raitt, Lisa", "Gender": "Female"},{"Province": "Alberta", "Party": "Conservative", "Age": 43, "Name": "Ambrose, Rona", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 42, "Name": "Leitch, Kellie", "Gender": "Female"},{"Province": "Nova Scotia", "Party": "NDP", "Age": 39, "Name": "Leslie, Megan", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 38, "Name": "Hassainia, Sana", "Gender": "Female"},{"Province": "Ontario", "Party": "Conservative", "Age": 38, "Name": "Adams, Eve", "Gender": "Female"},{"Province": "Alberta", "Party": "Conservative", "Age": 32, "Name": "Rempel, Michelle", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 32, "Name": "Papillon, Annick", "Gender": "Female"},{"Province": "Ontario", "Party": "NDP", "Age": 31, "Name": "Sitsabaiesan, Rathika", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 30, "Name": "Quach, Anne Minh-Thu", "Gender": "Female"},{"Province": "Manitoba", "Party": "NDP", "Age": 30, "Name": "Ashton, Niki", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 29, "Name": "Moore, Christine", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Morin, Isabelle", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Blanchette-Lamothe, Lysane", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Brosseau, Ruth Ellen", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Latendresse, Alexandrine", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Dor\u008e Lefebvre, Rosane", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 27, "Name": "Morin, Marie-Claude", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 27, "Name": "Michaud, \u0083laine", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 24, "Name": "P\u008eclet, \u00e9ve", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 23, "Name": "Freeman, Myl\u008fne", "Gender": "Female"},{"Province": "Quebec", "Party": "NDP", "Age": 22, "Name": "Borg, Charmaine", "Gender": "Female"},{"Province": "Manitoba", "Party": "Conservative", "Age": "", "Name": "Bateman, Joyce", "Gender": "Female"},{"Province": "British Columbia", "Party": "Conservative", "Age": 43, "Name": "Hiebert, Russ", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 59, "Name": "Jacob, Pierre", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 57, "Name": "Vellacott, Maurice", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 75, "Name": "Boughen, Ray", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 73, "Name": "O'Connor, Gordon", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 72, "Name": "Cotler, Irwin", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 72, "Name": "Oliver, Joe", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 71, "Name": "Tilson, David Allan", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 70, "Name": "Fantino, Julian", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 69, "Name": "Kent, Peter", "Gender": "Male"},{"Province": "Quebec", "Party": "Bloc Quebecois", "Age": 69, "Name": "Plamondon, Louis", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 69, "Name": "Schellenberger, Gary", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 68, "Name": "Lauzon, Guy", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 68, "Name": "Harris, Richard M.", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 68, "Name": "Goldring, Peter", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 67, "Name": "Atamanenko, Alex", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 67, "Name": "Payne, LaVar", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 67, "Name": "Breitkreuz, Garry W.", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 66, "Name": "Genest, R\u008ejean", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 66, "Name": "MacKenzie, Dave", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 66, "Name": "Hyer, Bruce", "Gender": "Male"},{"Province": "Prince Edward Island", "Party": "Liberal", "Age": 66, "Name": "MacAulay, Lawrence", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 65, "Name": "Galipeau, Royal", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 65, "Name": "Marston, Wayne", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 65, "Name": "Hawn, Laurie", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 65, "Name": "Kramp, Daryl", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 65, "Name": "Shipley, Bev", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Conservative", "Age": 65, "Name": "Kerr, Greg", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 65, "Name": "Comartin, Joe", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 64, "Name": "Norlock, Rick", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 64, "Name": "McKay, John", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 64, "Name": "Mayes, Colin", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 64, "Name": "Rae, Bob", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "NDP", "Age": 64, "Name": "Harris, Jack", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 64, "Name": "Duncan, John", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 63, "Name": "Chisu, Corneliu", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 63, "Name": "Garneau, Marc", "Gender": "Male"},{"Province": "Prince Edward Island", "Party": "Liberal", "Age": 63, "Name": "Easter, Arnold Wayne", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 63, "Name": "Aspin, Jay", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Liberal", "Age": 63, "Name": "Goodale, Ralph", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 63, "Name": "Albrecht, Harold", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 63, "Name": "Gravelle, Claude", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 63, "Name": "Komarnicki, Ed", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 62, "Name": "Flaherty, James Michael (Jim)", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 62, "Name": "Rankin, Murray", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 62, "Name": "McCallum, John", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 62, "Name": "Warawa, Mark", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 62, "Name": "Obhrai, Deepak", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 62, "Name": "Benoit, Leon Earl", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 62, "Name": "Leung, Chungsen", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 61, "Name": "Morin, Marc-Andr\u008e", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 61, "Name": "Sopuck, Robert", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 61, "Name": "Ritz, Gerry", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 61, "Name": "Garrison, Randall", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 61, "Name": "Lunney, James", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 61, "Name": "Lukiwski, Tom", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 60, "Name": "Carmichael, John", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 60, "Name": "Menzies, Ted", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 60, "Name": "Valcourt, Bernard", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 60, "Name": "Ashfield, Keith", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 60, "Name": "Nicholson, Rob", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 60, "Name": "Young, Terence H.", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 60, "Name": "Toews, Vic", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 60, "Name": "Sullivan, Mike", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 59, "Name": "Patry, Claude", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Conservative", "Age": 59, "Name": "Keddy, Gerald", "Gender": "Male"},{"Province": "Territories", "Party": "NDP", "Age": 59, "Name": "Bevington, Dennis Fraser", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 59, "Name": "Allen, Malcolm", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 59, "Name": "Rafferty, John", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 59, "Name": "Dreeshen, Earl", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 59, "Name": "Kamp, Randy", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 59, "Name": "Merrifield, Rob", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "Woodworth, Stephen", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "McColeman, Phil", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 58, "Name": "Lebel, Denis", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "Lizon, Wladyslaw", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "Holder, Ed", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 58, "Name": "Valeriote, Frank", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 58, "Name": "Christopherson, David", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 58, "Name": "Mulcair, Thomas J.", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 58, "Name": "Daniel, Joe", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 57, "Name": "Karygiannis, Jim", "Gender": "Male"},{"Province": "New Brunswick", "Party": "NDP", "Age": 57, "Name": "Godin, Yvon", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 57, "Name": "Dionne Labelle, Pierre", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 57, "Name": "Preston, Joe", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 57, "Name": "B\u008elanger, Mauril", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 57, "Name": "Fast, Edward", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 57, "Name": "Tweed, Mervin C.", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 57, "Name": "Dion, St\u008ephane", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 57, "Name": "Van Kesteren, Dave", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Liberal", "Age": 57, "Name": "Cuzner, Rodger", "Gender": "Male"},{"Province": "Manitoba", "Party": "NDP", "Age": 57, "Name": "Martin, Pat", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "NDP", "Age": 56, "Name": "Stoffer, Peter", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 56, "Name": "Miller, Larry", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 56, "Name": "Blanchette, Denis", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 56, "Name": "Nunez-Melo, Jos\u008e", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 55, "Name": "Goguen, Robert", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 55, "Name": "Scarpaleggia, Francis", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 55, "Name": "Sweet, David", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 55, "Name": "Anderson, David", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "NDP", "Age": 55, "Name": "Chisholm, Robert", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 55, "Name": "Stanton, Bruce", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 54, "Name": "Goodyear, Gary", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 54, "Name": "Weston, John", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 54, "Name": "Dechert, Bob", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 54, "Name": "Shory, Devinder", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 54, "Name": "Pilon, Fran\u008dois", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 54, "Name": "Hayes, Bryan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 54, "Name": "Gigu\u008fre, Alain", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 54, "Name": "Sorenson, Kevin", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 53, "Name": "Benskin, Tyrone", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 53, "Name": "Menegakis, Costas", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 53, "Name": "Harper, Stephen", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 53, "Name": "Wilks, David", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Liberal", "Age": 53, "Name": "Regan, Geoff", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 52, "Name": "McGuinty, David", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 52, "Name": "Gosal, Bal", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 52, "Name": "Aubin, Robert", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Liberal", "Age": 52, "Name": "Eyking, Mark", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 52, "Name": "Brown, Gordon", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 52, "Name": "Allen, Mike", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 51, "Name": "Clement, Tony", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 51, "Name": "Cannan, Ronald", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 51, "Name": "Rousseau, Jean", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 51, "Name": "Opitz, Ted", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 50, "Name": "Toet, Lawrence", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 50, "Name": "Cash, Andrew", "Gender": "Male"},{"Province": "Manitoba", "Party": "Liberal", "Age": 50, "Name": "Lamoureux, Kevin", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 50, "Name": "Scott, Craig", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 50, "Name": "Adler, Mark", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 50, "Name": "Carrie, Colin", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 50, "Name": "Julian, Peter", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 50, "Name": "Pacetti, Massimo", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 50, "Name": "Saganash, Romeo", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 50, "Name": "Angus, Charlie", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 49, "Name": "Davies, Don", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 49, "Name": "Bernier, Maxime", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 49, "Name": "Dewar, Paul", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 49, "Name": "Jean, Brian", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 49, "Name": "Devolin, Barry", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 49, "Name": "Lemieux, Pierre", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 49, "Name": "Van Loan, Peter", "Gender": "Male"},{"Province": "Prince Edward Island", "Party": "Liberal", "Age": 49, "Name": "Casey, Sean", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 49, "Name": "Nantel, Pierre", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 49, "Name": "Coderre, Denis", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 49, "Name": "Wallace, Mike", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 48, "Name": "Braid, Peter", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 48, "Name": "Gourde, Jacques", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 48, "Name": "Reid, Scott", "Gender": "Male"},{"Province": "Ontario", "Party": "Liberal", "Age": 48, "Name": "Hsu, Ted", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 48, "Name": "Saxton, Andrew", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 48, "Name": "Weston, Rodney", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "Conservative", "Age": 48, "Name": "Penashue, Peter", "Gender": "Male"},{"Province": "Quebec", "Party": "Bloc Quebecois", "Age": 48, "Name": "Bellavance, Andr\u008e", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 48, "Name": "Rathgeber, Brent", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 48, "Name": "Kellway, Matthew", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 47, "Name": "Toone, Philip", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 47, "Name": "Allison, Dean", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 47, "Name": "Trottier, Bernard", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 47, "Name": "Blaney, Steven", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 47, "Name": "Bezan, James", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Conservative", "Age": 47, "Name": "MacKay, Peter Gordon", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 46, "Name": "Dykstra, Richard", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 46, "Name": "Sandhu, Jasbir", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 46, "Name": "Donnelly, Fin", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Conservative", "Age": 46, "Name": "Armstrong, Scott", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "Liberal", "Age": 46, "Name": "Byrne, Gerry", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 46, "Name": "Stewart, Kennedy", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "NDP", "Age": 46, "Name": "Cleary, Ryan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 45, "Name": "C\u0099t\u008e, Raymond", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 45, "Name": "Clarke, Rob", "Gender": "Male"},{"Province": "Nova Scotia", "Party": "Liberal", "Age": 45, "Name": "Brison, Scott", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 45, "Name": "Butt, Brad", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 45, "Name": "Rickford, Greg", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Liberal", "Age": 45, "Name": "LeBlanc, Dominic", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 45, "Name": "Hoback, Randy", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 44, "Name": "Caron, Guy", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 44, "Name": "Brahmi, Tarik", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 44, "Name": "Kenney, Jason", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 44, "Name": "Masse, Brian", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 44, "Name": "Alexander, Chris", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 44, "Name": "Zimmer, Bob", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 44, "Name": "Calkins, Blaine", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 43, "Name": "Baird, John", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 43, "Name": "Lake, Mike", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "Liberal", "Age": 43, "Name": "Simms, Scott", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 43, "Name": "Thibeault, Glenn", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 42, "Name": "Williamson, John", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 42, "Name": "Calandra, Paul", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 42, "Name": "Chicoine, Sylvain", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 42, "Name": "Del Mastro, Dean", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 42, "Name": "Rajotte, James", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 42, "Name": "Seeback, Kyle", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 41, "Name": "Watson, Jeff", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 41, "Name": "Lapointe, Fran\u008dois", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 41, "Name": "Nicholls, Jamie", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 41, "Name": "Chong, Michael D.", "Gender": "Male"},{"Province": "Quebec", "Party": "Liberal", "Age": 41, "Name": "Trudeau, Justin", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 40, "Name": "Larose, Jean-Fran\u008dois", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 40, "Name": "Anders, Rob", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 40, "Name": "Fletcher, Steven John", "Gender": "Male"},{"Province": "British Columbia", "Party": "NDP", "Age": 40, "Name": "Cullen, Nathan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 39, "Name": "Ravignat, Mathieu", "Gender": "Male"},{"Province": "Manitoba", "Party": "Conservative", "Age": 39, "Name": "Bruinooge, Rod", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 39, "Name": "Mai, Hoang", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 39, "Name": "Boulerice, Alexandre", "Gender": "Male"},{"Province": "Quebec", "Party": "Bloc Quebecois", "Age": 39, "Name": "Fortin, Jean-Fran\u008dois", "Gender": "Male"},{"Province": "Territories", "Party": "Conservative", "Age": 38, "Name": "Leef, Ryan", "Gender": "Male"},{"Province": "Quebec", "Party": "Conservative", "Age": 38, "Name": "Paradis, Christian", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 38, "Name": "Choquette, Fran\u008dois", "Gender": "Male"},{"Province": "New Brunswick", "Party": "Conservative", "Age": 38, "Name": "Moore, Rob", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 38, "Name": "Trost, Brad", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 38, "Name": "Gill, Parm", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 38, "Name": "Hillyer, Jim", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 38, "Name": "Richards, Blake", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 38, "Name": "Uppal, Tim", "Gender": "Male"},{"Province": "Newfoundland and Labrador", "Party": "Liberal", "Age": 37, "Name": "Andrews, Scott", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 36, "Name": "Moore, James", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 36, "Name": "Lobb, Ben", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 36, "Name": "Albas, Dan", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 34, "Name": "Storseth, Brian", "Gender": "Male"},{"Province": "British Columbia", "Party": "Conservative", "Age": 34, "Name": "Strahl, Mark", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 34, "Name": "Brown, Patrick W.", "Gender": "Male"},{"Province": "Alberta", "Party": "Conservative", "Age": 34, "Name": "Warkentin, Chris", "Gender": "Male"},{"Province": "Saskatchewan", "Party": "Conservative", "Age": 33, "Name": "Scheer, Andrew", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": 33, "Name": "Poilievre, Pierre", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 33, "Name": "Genest-Jourdain, Jonathan", "Gender": "Male"},{"Province": "Ontario", "Party": "NDP", "Age": 33, "Name": "Harris, Dan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 28, "Name": "Tremblay, Jonathan", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 27, "Name": "Morin, Dany", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 24, "Name": "Dub\u008e, Matthew", "Gender": "Male"},{"Province": "Quebec", "Party": "NDP", "Age": 21, "Name": "Dusseault, Pierre-Luc", "Gender": "Male"},{"Province": "Ontario", "Party": "Conservative", "Age": "", "Name": "O'Toole, Erin", "Gender": "Male"} ];

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
            $scope.columns.push(String(drag[0].innerText).trim());
            console.log($scope.columns);
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
                },
            }
        );




        //$scope.$apply();
    }

    $scope.sortableOptions = {
        stop: function(e, ui) {
            // this callback has the changed model
            $scope.refreshPivot();
            console.log('despues de ordenar');
        }
    };

});
