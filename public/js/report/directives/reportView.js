app.directive('reportView', function ($q, $timeout, reportModel, $compile, c3Charts, reportHtmlWidgets, grid, verticalGrid, pivot, uuid2) {
    return {

        scope: {
            report: '=',
            mode: '='
        },

        link: function ($scope, element) {
            $scope.loading = false;
            $scope.loadingMessage = '';

            $scope.changeContent = function (newHtml) {
                var html = '<div class="report-view" ng-hide="loading" style="height:100%">';
                html += newHtml;
                html += '</div><div ng-show="loading" class="container-fluid" >';
                html += '<h3><img src="/images/loader.gif" width="32px" height="32px"/>{{loadingMessage}}</h3>';
                html += '</div>';

                element.html(html);
                $compile(element.contents())($scope);
            };

            $scope.$on('repaint', function (event, args) {
                $scope.loading = true;

                if (!args) {
                    args = {};
                }

                let promise = $q.resolve(0);

                if (args.fetchData && $scope.report.query) {
                    $scope.loadingMessage = 'Fetching data ...';
                    promise = reportModel.fetchData($scope.report.query, args).then(function (result) {
                        if (result.errorToken) {
                            $scope.errorToken = result.errorToken;
                        }
                    });
                }

                return promise.then(function () {
                    $scope.loadingMessage = 'Repainting report ...';

                    switch ($scope.report.reportType) {
                    case 'grid':
                        $scope.changeContent(grid.extendedGridV2($scope.report, $scope.mode));
                        break;
                    case 'vertical-grid':
                        $scope.changeContent(verticalGrid.getVerticalGrid($scope.report, $scope.mode));
                        break;
                    case 'pivot':
                        var result = pivot.getPivotTableSetup($scope.report);
                        $scope.changeContent(result.html);
                        $(result.jquerySelector).cypivot(result.params);
                        break;
                    case 'chart-line':
                    case 'chart-donut':
                    case 'chart-pie':
                    case 'gauge':
                        const id = 'CHART_' + $scope.report.id + '-' + uuid2.newuuid();
                        const html = c3Charts.getChartHTML($scope.report, $scope.mode, id);
                        $scope.changeContent(html);

                        // FIXME $timeout should not be necessary here, but
                        // without it the chart is shown and automatically
                        // replaced by an empty chart
                        return $timeout(function () {}, 0).then(function () {
                            reportModel.initChart($scope.report);
                            c3Charts.rebuildChart($scope.report, id);
                            $scope.loading = false;
                        });
                    case 'indicator':
                        $scope.changeContent(reportHtmlWidgets.generateIndicator($scope.report));
                        break;

                    default:
                        $scope.changeContent('<div style="width: 100%;height: 100%;display: flex;align-items: center;"><span style="color: darkgray; font-size: initial; width:100%;text-align: center";><img src="/images/empty.png">No data for this report</span></div>');
                    }

                    $scope.loading = false;
                });
            });

            $scope.$on('clearReport', function () {
                $scope.changeContent('<div class="container-fluid"  ng-show="loading" ><h3><img src="/images/loader.gif" width="32px" height="32px"/>{{loadingMessage}}</h3></div>');
                $scope.loading = false;
            });

            $scope.$on('showLoadingMessage', function (event, loadingMessage) {
                $scope.loading = true;
                $scope.loadingMessage = loadingMessage;
            });
        },

        template: '<div class="container-fluid"  ng-show="loading" ><h3><img src="/images/loader.gif" width="32px" height="32px"/>{{loadingMessage}}</h3></div>'

    };
});
