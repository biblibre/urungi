angular.module('app').controller('spacesCtrl', function ($scope, $rootScope, connection, uuid2, $routeParams, $timeout, gettextCatalog) {
    connection.get('/api/company/get-company-data').then(result => {
        $scope.data = result.items.publicSpace;
    });

    if ($routeParams.extra === 'intro') {
        $timeout(function () { $scope.showIntro(); }, 1000);
    }

    $scope.IntroOptions = {
        // IF width > 300 then you will face problems with mobile devices in responsive mode
        steps: [
            {
                element: '#parentIntro',
                html: '<div><h3>' +
                    gettextCatalog.getString('Public space') +
                    '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                    gettextCatalog.getString('The public space is the place where you or your users will publish reports to be available for other users or the hole company.') +
                    '</span><br/><span>' +
                    gettextCatalog.getString('Here you can define the structure in folders of the public space.') +
                    '</span><br/><span>' +
                    gettextCatalog.getString('Later using roles you can grant or deny access to the different folders of the public space to users that have the appropiate role to execute or publish reports along the public space.') +
                    '</span></div>',
                width: '500px',
                objectArea: false,
                verticalAlign: 'top',
                height: '300px'
            },
            {
                element: '#publicSpaceArea',
                html: '<div><h3>' +
                    gettextCatalog.getString('Public space structure area') +
                    '</h3><span style="font-weight:bold;">' +
                    gettextCatalog.getString('This is the area where you can define the structure for the public space.') +
                    '</span><br/><br/><span>' +
                    gettextCatalog.getString('Create folders and drag and drop them across to structure it.') +
                    '</span></div>',
                width: '300px',
                height: '250px',
                areaColor: 'transparent',
                areaLineColor: '#fff'
            },
            {
                element: '#publicSpaceNewFolderBtn',
                html: '<div><h3>' +
                    gettextCatalog.getString('New folder') +
                    '</h3><span style="font-weight:bold;">' +
                    gettextCatalog.getString('Click here to create a new folder in the root of the public space.') +
                    '</span><br/><span>' +
                    gettextCatalog.getString('After creating the folder you can drag and drop it across the public space.') +
                    '</span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                height: '180px'

            },
            {
                element: '#publicSpaceItem',
                html: '<div><h3>' +
                    gettextCatalog.getString('Folder') +
                    '</h3><span style="font-weight:bold;">' +
                    gettextCatalog.getString('This area represents a folder in the public space') +
                    '</span><br/><br/><span>' +
                    gettextCatalog.getString('You can drag it down or up across the structure to move the folder at the same level.') +
                    '<br/>' +
                    gettextCatalog.getString('Drag if from left to right to move it inside another existing folder.') +
                    '</span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                height: '220px'

            },
            {
                element: '#publicSpaceItemEdit',
                html: '<div><h3>' +
                    gettextCatalog.getString('Edit folder') +
                    '</h3><span style="font-weight:bold;">' +
                    gettextCatalog.getString('Click here to change the folder&quot;s name.') +
                    '</span><br/><br/><span>' +
                    gettextCatalog.getString('After clicking here a text box with the name of the folder will appear, change then the name there and click on the small save button that will appear beside the edit box.') +
                    '</span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                horizontalAlign: 'right',
                height: '200px'

            },
            {
                element: '#publicSpaceItemRemove',
                html: '<div><h3>' +
                    gettextCatalog.getString('Remove Folder') +
                    '</h3><span style="font-weight:bold;">' +
                    gettextCatalog.getString('Click here to remove the folder.') +
                    '</span><br/><br/><span>' +
                    gettextCatalog.getString('This will remove all child nodes as well.') +
                    '</span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                horizontalAlign: 'right',
                height: '180px'

            },
            {
                element: '#publicSpaceItemAdd',
                html: '<div><h3>' +
                    gettextCatalog.getString('Add subfolder') +
                    '</h3><span style="font-weight:bold;">' +
                    gettextCatalog.getString('Click here to create a new folder inside the actual folder.') +
                    '</span><br/><br/><span>' +
                    gettextCatalog.getString('After creating the folder you can drag and drop it across the public space.') +
                    '</span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                horizontalAlign: 'right',
                height: '200px'

            },
            {
                element: '#publicSpaceSaveBtn',
                html: '<div><h3>' +
                    gettextCatalog.getString('Save public space') +
                    '</h3><span style="font-weight:bold;">' +
                    gettextCatalog.getString('Once you get the structure you want save it to make it available for your users.') +
                    '</span><br/><span></span></div>',
                width: '300px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                horizontalAlign: 'right',
                height: '180px'
            },
            {
                element: '#parentIntro',
                html: '<div><h3>' +
                    gettextCatalog.getString('Next Step') +
                    '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                    gettextCatalog.getString('Creating a new data source') +
                    '</span><br/><br/><br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/data-sources/new">' +
                    gettextCatalog.getString('Continue tour') +
                    '</a></span></div>',
                width: '500px',
                objectArea: false,
                verticalAlign: 'top',
                height: '250px'
            }
        ]
    };

    $scope.newSubItem = function (scope) {
        var nodeData = scope.$modelValue;

        if (typeof nodeData === 'undefined') {
            $scope.data.push({
                id: uuid2.newguid(),
                title: 'my folder',
                nodes: []
            });
        } else {
            nodeData.nodes.push({
                id: uuid2.newguid(),
                title: nodeData.title + '.' + (nodeData.nodes.length + 1),
                nodes: []
            });
        }
    };

    $scope.save = function () {
        connection.post('/api/company/save-public-space', $scope.data).then(data => {
            if (data.result === 1) {
                $rootScope.userObjects = $scope.data;
            }
        });
    };

    $scope.remove = function (scope) {
        scope.remove();
    };

    $scope.toggle = function (scope) {
        scope.toggle();
    };
});
