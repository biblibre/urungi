app.directive('reportView', function ( reportModel, $compile, c3Charts, reportHtmlWidgets, grid, 
    verticalGrid, pivot) {
    return {

        scope : {
            report : '=',
            mode : '='
        },

        link : function ($scope, element){

            $scope.loading = false;
            $scope.loadingMessage = '';

            $scope.changeContent = function (newHtml){

                var html = '<div ng-hide="loading" style="height:100%">';
                html += newHtml;
                html += '</div><div ng-show="loading" class="container-fluid" >';
                html += '<h3><img src="/images/loader.gif" width="32px" height="32px"/>{{loadingMessage}}</h3>';
                html += '</div>';

                element.html(html);
                $compile(element.contents())($scope);
                $scope.$digest();

            }

            $scope.$on('repaint', async function(event, args){

                $scope.loading = true;

                if(!args){
                    args = {};
                }

                if(args.fetchData){
                    $scope.loadingMessage = 'Fetching data ...';
                    await reportModel.fetchData($scope.report.query);
                }

                $scope.loadingMessage = 'Repainting report ...';

                switch($scope.report.reportType){
                    case 'grid':
                        $scope.changeContent(grid.extendedGridV2($scope.report, $scope.mode));
                    break;
                    case 'vertical-grid':
                        $scope.changeContent(verticalGrid.getVerticalGrid($scope.report, $scope.mode));
                    break;
                    case 'pivot':
                        var result = pivot.getPivotTableSetup($scope.report);
                        $scope.changeContent(result.html);
                        await new Promise( resolve => {
                            setTimeout( function () {
                                $(result.jquerySelector).cypivot(result.params);
                                resolve();
                            }, 100);
                        });
                    break;
                    case 'chart-line':
                    case 'chart-donut':
                    case 'chart-pie':
                    case 'gauge':
                        $scope.changeContent(c3Charts.getChartHTML($scope.report, '$scope.mode'));
                        await new Promise( resolve => {
                            setTimeout( function () {
                                c3Charts.rebuildChart($scope.report);
                                resolve();
                            }, 100);
                        });
                    break;
                    case 'indicator':
                        $scope.changeContent(reportHtmlWidgets.generateIndicator($scope.report));
                        c3Charts.rebuildChart($scope.report);
                    break;
                    default:
                        $scope.changeContent('<span style="font-size: small;color: darkgrey;padding: 5px;">' + report.reportName + '</span><div style="width: 100%;height: 100%;display: flex;align-items: center;"><span style="color: darkgray; font-size: initial; width:100%;text-align: center";><img src="/images/empty.png">No data for this report</span></div>');
                }

                $scope.loading = false;
                
                $scope.$digest();

            });

            $scope.$on('clearReport', function () {
                $scope.changeContent('<div class="container-fluid"  ng-show="loading" ><h3><img src="/images/loader.gif" width="32px" height="32px"/>{{loadingMessage}}</h3></div>');
                $scope.loading = false;
            });

            $scope.$on('showLoadingMessage', function (event, loadingMessage){
                $scope.loading = true;
                $scope.loadingMessage = loadingMessage;
            });
        },

        template : '<div class="container-fluid"  ng-show="loading" ><h3><img src="/images/loader.gif" width="32px" height="32px"/>{{loadingMessage}}</h3></div>'

    }
});