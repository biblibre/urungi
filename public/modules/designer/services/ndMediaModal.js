/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 05/05/15
 * Time: 11:53
 * To change this template use File | Settings | File Templates.
 */

app.service('ndMediaModal', ['$modal', function($modal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'modules/designer/views/media.html',
        windowClass: "in media_modal_window"
    };


    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    console.log('loading designer Media service');

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $modalInstance) {
                $scope.mediaModalOptions = tempModalOptions;
                $scope.mediaModalOptions.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.mediaModalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            }
        }

        return $modal.open(tempModalDefaults).result;
    };


}]);

