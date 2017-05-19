/*
NodeDream Client Lib
Version: 0.1
*/

var NodeDream = {
    makeID: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 10; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },
    refreshComments: function() {
        //reserved for ndComments directive
    }
};

app.directive('ndDropZone', function($rootScope) {
    function link(scope, element, attrs) {
        var url = scope.url;
        var success = scope.success;

        element.children('.dropzone').dropzone({
            url: url,
            maxFilesize: 5,
            paramName: "file",
            maxThumbnailFilesize: 2,
            dictDefaultMessage: $rootScope.getTranslation("<b>Drop files</b> or click here to upload"),
            init: function() {
                //scope.files.push({file: 'added'}); // here works
                this.on('success', function(file, res) {
                    if (success) success(file, res);
                });

                this.on('addedfile', function(file) {
                });

                this.on('drop', function(file) {

                });
            }
        });

        //$('div.dz-default.dz-message > span').css({'display': 'block', 'font-size': '28px'});
        //$('div.dz-default.dz-message').css({'opacity':1, 'background-image': 'none'});
    }

    return {
        restrict: 'E',
        scope: {
            url: "@",
            success: "="
        },
        templateUrl: "/nodedream/templates/ndDropzone.html",
        link: link
    };

});

app.directive('ndChosen', function($rootScope) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            data: "=",
            ngModel: '=',
            labelField: "@",
            valueField: "@"
        },
        templateUrl: "/nodedream/templates/ndChosen.html",
        require: 'ngModel',
        compile: function (element, attrs) {
            var elementID = NodeDream.makeID();

            element.children('select').attr('id', elementID);

            return function (scope, element, attrs, controller) {
                var data = scope.data;
                var ngModel = scope.ngModel;
                var labelField = scope.labelField;
                var valueField = scope.valueField;

                for (var i in data) {

                    var selected = '';

                    for (var j in ngModel) {
                        if (ngModel[j] == data[i][valueField]) {
                            selected = ' selected';
                        }
                    }

                    $("#"+elementID).append('<option value="'+data[i][valueField]+'"'+selected+'>'+data[i][labelField]+'</option>');
                }

                $("#"+elementID).chosen({placeholder_text: $rootScope.getTranslation('Select Some')});
            };
        }
    };
});

app.directive('ndPagination', function() {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            pages: "=",
            page: '=',
            find: "="
        },
        templateUrl: "/nodedream/templates/ndPagination.html",
        compile: function (element, attrs) {

            return function (scope, element, attrs, controller) {

            };
        }
    };
});

app.directive('ndFunnel', function($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            categories: "=",
            onUpdate: "="
        },
        templateUrl: "/nodedream/templates/ndFunnel.html",
        compile: function (element, attrs) {

            return function (scope, element, attrs, controller) {
                var draggedItem, draggedFrom, draggedTo;

                for (var i in scope.categories) {
                    scope.categories[i].index = i;
                    scope.categories[i].showLeftArrow = (i > 0);
                    scope.categories[i].showRightArrow = (i < scope.categories.length-1);
                }

                scope.setFunnelColors = function() {
                    $('.nd-funnel').find('ul').children('li').each(function() {
                        $(this).css("border-left", "3px solid "+$(this).attr('color'));
                    });
                };

                scope.startCallback = function(event, ui, categoryFrom, item) {
                    draggedFrom = categoryFrom;
                    draggedItem = item;
                };

                scope.dropCallback = function(event, ui, categoryTo) {
                    draggedTo = categoryTo;

                    $timeout(function () {
                        scope.setFunnelColors();
                    });

                    if (scope.onUpdate) scope.onUpdate(draggedItem, draggedFrom, draggedTo);
                };

                scope.moveItem = function(direction, category, item) {
                    var operator = (direction == 'left') ? -1 : 1;

                    var movedItem = item, movedFrom = category.value, movedTo;

                    for (var i in scope.categories) {
                        if (scope.categories[i].value == movedFrom) {
                            movedTo = scope.categories[Number(i)+operator].value;

                            for (var j in scope.categories[i].items) {
                                if (scope.categories[i].items[j] == item) {
                                    scope.categories[i].items.splice(j, 1);
                                    break;
                                }
                            }

                            scope.categories[Number(i)+operator].items.push(item);
                            break;
                        }
                    }

                    if (scope.onUpdate) scope.onUpdate(movedItem, movedFrom, movedTo);
                };

                $timeout(function () { //If the second parameter is not provided, execute the function after the DOM has completed rendering
                    scope.setFunnelColors();
                });

            };

        }
    };
});

app.directive('ndRating', function($rootScope) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            ratingValue: "@",
            ratingColor: "@"
        },
        templateUrl: "/nodedream/templates/ndRating.html",
        compile: function (element, attrs) {

            return function (scope, element, attrs, controller) {
                var width = (Number(scope.ratingValue)*230)/10;

                element.find('.jRatingColor').css("width", width+"px");
                element.find('.jRatingColor').css("background-color", scope.ratingColor);
            };
        }
    };
});

app.directive('ndEmployeeImage', function(connection, $timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            employeeId: "=",
            userId: "=",
            width: "=",
            height: "=",
            rounded: "="
        },
        templateUrl: "/nodedream/templates/ndEmployeeImage.html",
        compile: function (element, attrs) {

            return function (scope, element, attrs, controller) {
                scope.imageWidth = (scope.width) ? scope.width : 50;
                scope.imageHeight = (scope.height) ? scope.height : 50;
                scope.imageBorderRadius = (scope.rounded) ? 100 : 0;

                scope.imagePadding = (scope.imageWidth/4)+'px '+(scope.imageWidth/2)+'px';
                scope.imageMargin = '1px -'+(scope.imageWidth/2.5)+'px'; //(scope.imageWidth/4);
                scope.imageFontSize = scope.imageWidth/3; //13

                function getEmployeeImage() {
                    var params = {};

                    if (scope.employeeId) {
                        params = {employeeID: scope.employeeId};
                    }
                    else {
                        params = {userID: scope.userId};
                    }

                    connection.get('/api/custom/Employees/get-employee-image', params, function(data) {
                        if (data.result == 1) {
                            scope.employeeImage = data.employeeImage;

                            var employeeName = '', employeeNameSplit = String(data.employeeName).split(' ');

                            for (var i in employeeNameSplit) {
                                employeeName += String(String(employeeNameSplit[i]).substr(0,1)).toUpperCase();
                            }

                            scope.employeeName = employeeName;
                        }
                        else {
                            scope.employeeImage = '/nodedream/assets/profile-placeholder.png';
                        }
                    }, {showMsg: false, showLoader: false});
                };

                var refreshIntervalId = setInterval(function() {
                    if (scope.employeeId || scope.userId) {
                        clearInterval(refreshIntervalId);
                        getEmployeeImage();
                    }
                }, 60);

                scope.$watch('employeeId', function(){
                    getEmployeeImage();
                });
                scope.$watch('userId', function(){
                    getEmployeeImage();
                });

            };
        }
    };
});

app.directive('ndComments', function($rootScope, connection, $timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            relationId: "=",
            relationCollection: "@",
            participants: "=",
            participantsType:"@",
            url: "@"
        },
        templateUrl: "/nodedream/templates/ndComments.html",
        compile: function (element, attrs) {

            return function (scope, element, attrs, controller) {

                function getComments() {
                    connection.get('/api/comments/get-comments', {relationID: scope.relationId, relationCollection: scope.relationCollection}, function(data) {
                        scope.comments = (data.items) ? data.items : [];
                    }, {showMsg: false, showLoader: false});
                }

                scope.getTranslation = $rootScope.getTranslation;

                var refreshIntervalId = setInterval(function() {
                    if (scope.relationId) {
                        clearInterval(refreshIntervalId);
                        getComments();
                    }
                }, 60);


                NodeDream.refreshComments = function() {
                    $timeout(function () { //If the second parameter is not provided, execute the function after the DOM has completed rendering
                        getComments();
                    });
                };

                scope.addComment = function() {
                    var data = {
                        relationID: scope.relationId,
                        relationCollection: scope.relationCollection,
                        participants: scope.participants,
                        participantsType: scope.participantsType,
                        url: scope.url,
                        comment: scope.inputComment
                    };

                    connection.post('/api/comments/add-comment', data, function(data) {
                        if (!scope.comments) scope.comments = [];

                        scope.inputComment = '';

                        data.item.commentFromImage = ($rootScope.myEmployee && $rootScope.myEmployee.employeeImage) ? $rootScope.myEmployee.employeeImage : '/nodedream/assets/profile-placeholder.png';
                        data.item.self = true;

                        scope.comments.push(data.item);
                    }, {showMsg: false});
                };

            };
        }
    };
});

/* chartData: type Array, for each field:
 * label: label of the line
 * color: color of the line
 * values: values of the line
 * */
app.directive('ndLineChart', function($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            chartData: "="
        },
        templateUrl: "/nodedream/templates/ndLineChart.html",
        compile: function (element, attributes) {
            var elementID = NodeDream.makeID();

            element.children('.chart').attr('id', elementID);

            return function (scope, element, attrs, controller) {

                function createChart() {
                    var chartData = scope.chartData;
                    var ykeys = [], labels = [], colors = true, lineColors = [], columns = [], data = [];

                    for (var i in chartData) {
                        ykeys.push(i);
                        labels.push(chartData[i].label);

                        if (chartData[i].color) {
                            lineColors.push(chartData[i].color);
                        }
                        else {
                            colors = false;
                        }

                        for (var j in chartData[i].values) {
                            if (!columns[j]) columns[j] = {};

                            columns[j].column = Number(j)+1;
                            columns[j][i] = chartData[i].values[j];
                        }
                    }

                    for (var i in columns) {
                        data.push(columns[i]);
                    }

                    $timeout(function () { //If the second parameter is not provided, execute the function after the DOM has completed rendering
                        if (data.length > 0) {
                            var chartParams = {
                                element: elementID,
                                data: data,
                                xkey: 'column',
                                ykeys: ykeys,
                                ymax: 10,
                                labels: labels,
                                hideHover: true,
                                resize: true,
                                dateFormat: function (x) { return ''; }
                            };

                            if (colors) {
                                chartParams.lineColors = lineColors;
                            }

                            new Morris.Line(chartParams);
                        }
                    });
                }

                var refreshIntervalId = setInterval(function() {
                    if (scope.chartData) {
                        clearInterval(refreshIntervalId);
                        createChart();
                    }
                }, 60);

            };
        }
    };
});

/* chartData: type Array, for each field:
 * label: label of the area
 * value: value of the area
 * */
app.directive('ndDonutChart', function($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            chartData: "=",
            height: "@",
            strokeColor: "@"
        },
        templateUrl: "/nodedream/templates/ndDonutChart.html",
        compile: function (element, attributes) {
            var elementID = NodeDream.makeID();

            element.children('.chart').attr('id', elementID);

            Morris.Donut.prototype.resizeHandler = function() {
                if(document.getElementById(this.el[0].id)){
                    this.timeoutId = null;
                    this.raphael.setSize(this.el.width(), this.el.height());
                    return this.redraw();
                }
            };

            return function (scope, element, attrs, controller) {

                function createChart() {
                    var data = scope.chartData;
                    var height = scope.height;
                    var strokeColor = scope.strokeColor;

                    if (height) $('#'+elementID).css({'height': height});

                    $timeout(function () { //If the second parameter is not provided, execute the function after the DOM has completed rendering
                        if (data.length > 0) {
                            new Morris.Donut({
                                element: elementID,
                                data: data,
                                resize: true,
                                backgroundColor: (strokeColor) ? strokeColor : '#FFFFFF'
                            });
                        }
                    });
                }

                var refreshIntervalId = setInterval(function() {
                    if (scope.chartData) {
                        clearInterval(refreshIntervalId);
                        createChart();
                    }
                }, 60);

            };
        }
    };
});

/* chartData: type Array, for each field:
 * label: label of the area
 * value: value of the area
 * */
app.directive('ndBarChart', function($timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            chartData: "=",
            height: "@"
        },
        templateUrl: "/nodedream/templates/ndBarChart.html",
        compile: function (element, attributes) {
            var elementID = NodeDream.makeID();

            element.children('.chart').attr('id', elementID);

            Morris.Bar.prototype.resizeHandler = function() {
                if(document.getElementById(this.el[0].id)){
                    this.timeoutId = null;
                    this.raphael.setSize(this.el.width(), this.el.height());
                    return this.redraw();
                }
            };

            return function (scope, element, attrs, controller) {

                function createChart() {
                    var data = scope.chartData;
                    var height = scope.height;

                    if (height) $('#'+elementID).css({'height': height});

                    $timeout(function () { //If the second parameter is not provided, execute the function after the DOM has completed rendering
                        if (data.length > 0) {
                            var labels = [];

                            for (var i in data) {
                                labels.push('');
                            }

                            new Morris.Bar({
                                element: elementID,
                                data: data,
                                xkey: 'label',
                                ykeys: ['value'],
                                labels: labels,
                                hideHover: true,
                                resize: true
                            });
                        }
                    });
                }

                var refreshIntervalId = setInterval(function() {
                    if (scope.chartData) {
                        clearInterval(refreshIntervalId);
                        createChart();
                    }
                }, 60);

            };
        }
    };
});

app.directive('ndModal', function(connection, $timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            id: "@"
        },
        templateUrl: "/nodedream/templates/ndModal.html",
        compile: function (element, attrs) {
            element.children('.modal').attr('id', element.attr('id'));
            element.removeAttr('id');

            return function (scope, element, attrs, controller) {

            };
        }
    };
});

$.getScript('/nodedream/libs/dropzone.js');
$.getScript('/nodedream/libs/chosen.js');
