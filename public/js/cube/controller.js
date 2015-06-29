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

app.controller('cubeCtrl', function ($scope, connection, $routeParams ) {

    $scope.cubeID = $routeParams.cubeID;
    $scope.metrics = ['Count'];
    $scope.rows = [];
    $scope.columns = [];
    $scope.loaded = false;
    $scope.filters = [];
    $scope.dataSources = [];


    init();


   function init()
    {

    if ($routeParams.newCube) {
        if ($routeParams.newCube == 'true') {
            $scope._ = {};
            $scope._.draft = true;
            $scope._.badgeStatus = 0;
            $scope._.exportable = true;
            $scope._.badgeMode = 1;

            $scope.mode = 'add';

            console.log('entering in add mode for cubes') ;

            var params = {};

            connection.get('/api/data-sources/find-all', params, function(data) {
                $scope.errorMsg = (data.result === 0) ? data.msg : false;
                $scope.page = data.page;
                $scope.pages = data.pages;
                $scope.data = data;

                for (var i in $scope.data.items) {
                    console.log($scope.data.items[i]);
                    for (var z in $scope.data.items[i].params[0].schema) {
                        $scope.dataSources.push($scope.data.items[i].params[0].schema[z]);
                    };
                }
            });
        }
    }
    };



    $scope.cubeName = function () {


        var modalOptions    = {
            container: 'cubeName',
            containerID: '12345',//$scope._Cube._id,
            tracking: true,
            cube: $scope._Cube
        }



        //$scope.sendHTMLtoEditor(dataset[field])

        cubeNameModal.showModal({}, modalOptions).then(function (result) {
            $scope.save($scope._Cube);
            /*
            var container = angular.element(document.getElementById(source));
            container.children().remove();
            //var theHTML = ndDesignerService.getOutputHTML();
            theTemplate = $compile(theHTML)($scope);
            container.append(theTemplate);


            dataset[field] = theHTML;

            if ($scope._posts.postURL && $scope._posts.title && $scope._posts.status)
            {
                //console.log('saving post');
                $scope.save($scope._posts, false);
            }
            //console.log(theHTML);
           */
        });


    }


    $scope.add = function() {

            $scope._Cube = {};
            $scope._Cube.draft = true;
            $scope._Cube.badgeStatus = 0;
            $scope._Cube.exportable = true;
            $scope._Cube.badgeMode = 1;

            $scope.mode = 'add';
            $scope.subPage= '/partial/custom/Badges/form.html';

    };

    $scope.save = function(data) {


        console.log('saving cube '+data.cubeName);



        if ($scope.mode == 'add') {
            connection.post('/api/cubes/create', data, function(data) {
                $scope.items.push(data.item);

                $scope.cancel();
            });
        }
        else {
            $scope.edit_id = data._id;

            connection.post('/api/cubes/update/'+data._id, data, function(result) {
                if (result.result == 1) {
                    for (i = 0; i < $scope.items.length; i++) {
                        if ($scope.items[i]._id == data._id) {
                            $scope.items[i] = data;
                        }
                    }
                    $scope.cancel();
                }
            });
        }
    };

    /*
    var graph = new joint.dia.Graph;

    var paper = new joint.dia.Paper({
        el: $('#myholder'),
        width: 600,
        height: 200,
        model: graph,
        gridSize: 1
    });

    var rect = new joint.shapes.basic.Rect({
        position: { x: 100, y: 30 },
        size: { width: 100, height: 30 },
        attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
    });

    var rect2 = rect.clone();
    rect2.translate(300);

    var link = new joint.dia.Link({
        source: { id: rect.id },
        target: { id: rect2.id }
    });

    graph.addCells([rect, rect2, link]);
    */



});
