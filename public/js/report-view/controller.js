app.controller('report_viewCtrl', function ($scope, promptModel,$routeParams,report_v2Model,queryModel,connection,bsLoadingOverlayService) {

$scope.searchModal = 'partials/report/searchModal.html';
$scope.promptsBlock = 'partials/report/promptsBlock.html';
$scope.dateModal = 'partials/report/dateModal.html';
$scope.linkModal = 'partials/report/linkModal.html';
$scope.repeaterTemplate = 'partials/report/repeater.html';
$scope.publishModal  = 'partials/report/publishModal.html';
$scope.columnFormatModal = 'partials/report/columnFormatModal.html';
$scope.columnSignalsModal = 'partials/report/columnSignalsModal.html';

$scope.selectedReport = {};

$scope.showOverlay = function (referenceId) {
        bsLoadingOverlayService.start({
            referenceId: referenceId
        });
    };

$scope.hideOverlay = function (referenceId) {
        bsLoadingOverlayService.stop({
            referenceId: referenceId
        });
    };

$scope.getReportDiv = function() {
        if ($routeParams.reportID)
            {
               $scope.showOverlay('OVERLAY_reportLayout');
               report_v2Model.getReportDefinition($routeParams.reportID,false, function(report) {
                    if (report)
                        {
                            $scope.selectedReport = report;
                            report_v2Model.getReport(report,'reportLayout',function() {
                                //Done
                                $scope.hideOverlay('OVERLAY_reportLayout');
                            });
                        } else {
                            //TODO:No report found message
                        }
                });

            }


    };

$scope.getQuery = function(queryID)
    {
        return queryModel.query();
    }

/********PUBLISH******/
$scope.publishReport = function()
    {
        $scope.objectToPublish = $scope.selectedReport;
        $('#publishModal').modal('show');
    }

$scope.unPublish = function()
    {
        connection.post('/api/reports/unpublish', {_id:$scope.selectedReport._id}, function(data) {
            $scope.selectedReport.isPublic = false;
            $('#publishModal').modal('hide');
        });
    }

$scope.selectThisFolder = function(folderID)
    {
        connection.post('/api/reports/publish-report', {_id:$scope.selectedReport._id,parentFolder:folderID}, function(data) {
            $scope.selectedReport.parentFolder = folderID;
            $scope.selectedReport.isPublic = true;
            $('#publishModal').modal('hide');
        });
    }

/********END PUBLISH******/


});
