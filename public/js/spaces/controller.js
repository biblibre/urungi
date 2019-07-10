angular.module('app').controller('spacesCtrl', function ($scope, $location, connection, uuid, $timeout, gettextCatalog) {
    connection.get('/api/company/get-company-data').then(result => {
        $scope.data = result.items.sharedSpace;
    });

    if ($location.hash() === 'intro') {
        $timeout(function () { $scope.showIntro(); }, 1000);
    }

    $scope.IntroOptions = {
        nextLabel: gettextCatalog.getString('Next'),
        prevLabel: gettextCatalog.getString('Back'),
        skipLabel: gettextCatalog.getString('Skip'),
        doneLabel: gettextCatalog.getString('Done'),
        tooltipPosition: 'auto',
        showStepNumbers: false,
        steps: [
            {
                intro: '<h4>' +
                    gettextCatalog.getString('Shared space') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('The shared space is the place where you or your users will publish reports to be available for other users or the hole company.') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('Here you can define the structure in folders of the shared space.') +
                    '</p><p>' +
                    gettextCatalog.getString('Later using roles you can grant or deny access to the different folders of the shared space to users that have the appropriate role to execute or share reports along the shared space.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceArea',
                intro: '<h4>' +
                    gettextCatalog.getString('Shared space structure area') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('This is the area where you can define the structure for the shared space.') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('Create folders and drag and drop them across to structure it.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceNewFolderBtn',
                intro: '<h4>' +
                    gettextCatalog.getString('New folder') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Click here to create a new folder in the root of the shared space.') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('After creating the folder you can drag and drop it across the shared space.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceItem',
                intro: '<h4>' +
                    gettextCatalog.getString('Folder') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('This area represents a folder in the shared space') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('You can drag it down or up across the structure to move the folder at the same level.') +
                    '</p><p>' +
                    gettextCatalog.getString('Drag if from left to right to move it inside another existing folder.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceItemEdit',
                intro: '<h4>' +
                    gettextCatalog.getString('Edit folder') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Click here to change the folder&quot;s name.') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('After clicking here a text box with the name of the folder will appear, change then the name there and click on the small save button that will appear beside the edit box.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceItemRemove',
                intro: '<h4>' +
                    gettextCatalog.getString('Remove Folder') +
                    '</h4><p></strong>' +
                    gettextCatalog.getString('Click here to remove the folder.') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('This will remove all child nodes as well.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceItemAdd',
                intro: '<h4>' +
                    gettextCatalog.getString('Add subfolder') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Click here to create a new folder inside the actual folder.') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('After creating the folder you can drag and drop it across the shared space.') +
                    '</p>',
            },
            {
                element: '#sharedSpaceSaveBtn',
                intro: '<h4>' +
                    gettextCatalog.getString('Save shared space') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Once you get the structure you want save it to make it available for your users.') +
                    '</strong></p>',
            },
            {
                intro: '<h4>' +
                    gettextCatalog.getString('Next Step') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Creating a new data source') +
                    '</strong></p><a class="btn btn-info btn-xs" href="/#/data-sources/new">' +
                    gettextCatalog.getString('Continue tour') +
                    '</a>',
            }
        ]
    };

    $scope.newSubItem = function (scope) {
        var nodeData = scope.$modelValue;

        if (typeof nodeData === 'undefined') {
            $scope.data.push({
                id: uuid.v4(),
                title: gettextCatalog.getString('my folder'),
                nodes: []
            });
        } else {
            nodeData.nodes.push({
                id: uuid.v4(),
                title: nodeData.title + '.' + (nodeData.nodes.length + 1),
                nodes: []
            });
        }
    };

    $scope.save = function () {
        connection.post('/api/company/save-public-space', $scope.data);
    };

    $scope.remove = function (scope) {
        scope.remove();
    };

    $scope.toggle = function (scope) {
        scope.toggle();
    };
});
