import i18n from '../../i18n.js';
import * as uuid from '../../uuid.js';

angular.module('app.report').directive('reportView', reportView);

reportView.$inject = ['$q', '$timeout', 'reportModel', '$compile', 'c3Charts', 'reportHtmlWidgets', 'grid', 'pivot', 'api'];
function reportView ($q, $timeout, reportModel, $compile, c3Charts, reportHtmlWidgets, grid, pivot, api) {
    return {

        scope: {
            report: '=',
            mode: '='
        },

        link: function ($scope, element) {
            $scope.loading = false;
            $scope.loadingMessage = '';

            let childScope;
            $scope.changeContent = function (newHtml) {
                let html = '<div class="report-view" ng-hide="loading">';
                html += newHtml;
                html += '</div><div ng-show="loading" class="container-fluid" >';
                html += '<h3><img src="images/loader.gif" width="32px" height="32px"/>{{loadingMessage}}</h3>';
                html += '</div>';

                element.html(html);

                if (childScope) {
                    childScope.$destroy();
                }
                childScope = $scope.$new();
                $compile(element.contents())(childScope);
            };

            $scope.$on('repaint', function (event, args) {
                $scope.loading = true;

                if (!args) {
                    args = {};
                }

                let promise = $q.resolve(0);

                if (args.fetchData && $scope.report) {
                    $scope.loadingMessage = i18n.gettext('Fetching data ...');
                    promise = api.getReportData($scope.report, args).then(function (result) {
                        $scope.data = result.data;
                    });
                } else {
                    $scope.data = args.data;
                }

                return promise.then(function () {
                    $scope.loadingMessage = i18n.gettext('Repainting report ...');

                    if ($scope.data && $scope.data.length > 0) {
                        switch ($scope.report.reportType) {
                        case 'grid':
                            $scope.changeContent('');
                            return grid.createGrid(element.find('.report-view'), $scope.report, $scope.data);

                        case 'vertical-grid':
                            $scope.changeContent('');
                            return grid.createGrid(element.find('.report-view'), $scope.report, $scope.data, { vertical: true });

                        case 'pivot':
                            $scope.changeContent('');
                            return pivot.createPivotTable(element.find('.report-view'), $scope.report, $scope.data);

                        case 'chart-line':
                        case 'chart-donut':
                        case 'chart-pie':
                        case 'gauge':
                        case 'pyramid': {
                            const id = 'CHART_' + $scope.report._id + '-' + uuid.v4();
                            const html = c3Charts.getChartHTML($scope.report, $scope.mode, id);
                            $scope.changeContent(html);

                            // FIXME $timeout should not be necessary here, but
                            // without it the chart is shown and automatically
                            // replaced by an empty chart
                            return $timeout(function () {}, 0).then(function () {
                                const chart = reportModel.initChart($scope.report);
                                c3Charts.rebuildChart($scope.report, id, $scope.data, chart);
                                $scope.loading = false;
                            });
                        }

                        case 'indicator':
                            $scope.changeContent(reportHtmlWidgets.generateIndicator($scope.report, $scope.data));
                            break;
                        }
                    } else {
                        $scope.changeContent('<div style="width: 100%; height: 100%; display: flex; align-items: center;"><span style="color: darkgray; font-size: initial; width:100%; text-align: center;"><img src="images/empty.png">' + i18n.gettext('No data for this report') + '</span></div>');
                    }
                }).then(function () {
                    $scope.loading = false;
                });
            });

            $scope.$on('clearReport', function () {
                $scope.changeContent('<div class="container-fluid"  ng-show="loading" ><h3><img src="images/loader.gif" width="32px" height="32px"/>{{loadingMessage}}</h3></div>');
                $scope.loading = false;
            });

            $scope.$on('showLoadingMessage', function (event, loadingMessage) {
                $scope.loading = true;
                $scope.loadingMessage = loadingMessage;
            });

            $scope.$on('stopLoading', function () {
                $scope.loading = false;
            });
        },

        template: '<div class="container-fluid"  ng-show="loading" ><h3><img src="images/loader.gif" width="32px" height="32px"/>{{loadingMessage}}</h3></div>'

    };
}
