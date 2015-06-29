/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 07/03/15
 * Time: 08:18
 * To change this template use File | Settings | File Templates.
 */

app.directive('sizeelement', function ($window) {
    return{
        scope:true,
        priority: 0,
        link: function (scope, element) {
            scope.$watch(function(){return $(element).height(); }, function(newValue, oldValue) {
                scope.height=$(element).height();
            });
        }}
})
