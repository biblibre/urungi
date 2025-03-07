import '../../custom-element/report-view.js';

angular.module('app.report').directive('reportView', reportView);

function reportView () {
    return {
        scope: {
            report: '=',
        },
        link: function ($scope, element, attrs) {
            function repaint () {
                const reportView = element[0].querySelector('app-reportview');
                reportView.setReport($scope.report);
                reportView.repaint({ fetchData: true });
            }

            $scope.$watch('report', repaint)
        },
        template: '<app-reportview></app-reportview>',
    };
}
