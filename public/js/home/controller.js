app.controller('homeCtrl', ['$scope' ,function ($scope ) {

    $scope.dashboardsNbr = 3;
    $scope.reportsNbr = 10;
    $scope.notificationsNbr = 0;
    $scope.alertsNbr = 0;
    $scope.subPage = 'js/report/list.html';

    $scope.reportsList = [
                            {_id:"11111",reportName:"Informe 11111", reportDescription:"Esta es la descripción del informe 11111", createdBy:"usuario", createdOn:01/10/2014},
                            {_id:"22222",reportName:"Informe 22222", reportDescription:"Esta es la descripción del informe 22222", createdBy:"usuario", createdOn:01/10/2014},
                            {_id:"33333",reportName:"Informe 33333", reportDescription:"Esta es la descripción del informe 33333", createdBy:"usuario", createdOn:01/10/2014},
                            {_id:"44444",reportName:"Informe 44444", reportDescription:"Esta es la descripción del informe 44444", createdBy:"usuario", createdOn:01/10/2014}
                         ];

    $scope.dashboardsList = [
        {_id:"aaaaa",dashboardName:"Informe 11111", dashboardDescription:"Esta es la descripción del cuadro de mando 11111", createdBy:"usuario", createdOn:01/10/2014},
        {_id:"bbbbb",dashboardName:"Informe 22222", dashboardDescription:"Esta es la descripción del cuadro de mando 22222", createdBy:"usuario", createdOn:01/10/2014}
    ];

    $scope.reportsList = [
        {_id:"11111",reportName:"Informe 11111", reportDescription:"Esta es la descripción del informe 11111", createdBy:"usuario", createdOn:01/10/2014},
        {_id:"11111",reportName:"Informe 22222", reportDescription:"Esta es la descripción del informe 22222", createdBy:"usuario", createdOn:01/10/2014},
        {_id:"11111",reportName:"Informe 33333", reportDescription:"Esta es la descripción del informe 33333", createdBy:"usuario", createdOn:01/10/2014},
        {_id:"11111",reportName:"Informe 44444", reportDescription:"Esta es la descripción del informe 44444", createdBy:"usuario", createdOn:01/10/2014}
    ];

    $scope.reportsList = [
        {_id:"11111",reportName:"Informe 11111", reportDescription:"Esta es la descripción del informe 11111", createdBy:"usuario", createdOn:01/10/2014},
        {_id:"11111",reportName:"Informe 22222", reportDescription:"Esta es la descripción del informe 22222", createdBy:"usuario", createdOn:01/10/2014},
        {_id:"11111",reportName:"Informe 33333", reportDescription:"Esta es la descripción del informe 33333", createdBy:"usuario", createdOn:01/10/2014},
        {_id:"11111",reportName:"Informe 44444", reportDescription:"Esta es la descripción del informe 44444", createdBy:"usuario", createdOn:01/10/2014}
    ];

}]);
