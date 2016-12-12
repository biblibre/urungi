/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 27/10/13
 * Time: 19:42
 * To change this template use File | Settings | File Templates.
 */

app.controller('AdminUsersCtrl', function ($scope, connection, $q, $filter, $window,$routeParams,$rootScope,PagerService) {
    $scope.deleteModal = '/partial/private/deleteModal.html';
    $scope.changePasswordModal  = '/partials/users/changePassword.html';
    $scope.page = null;
    $scope.data = null;
    $scope.search = null;
    $scope.selectedRole = '';
    $scope.editUserModal = 'partials/users/edit.html';
    $scope.pager = {};


    $scope.breadcrumbs = [
        {label: 'Home', url: '#/home', icon: 'fa-home'},
        {label: 'Admin', url: '#/admin'},
        {label: 'Users'}
    ];

    init();

    function init()
    {
        if ($routeParams.newUser) {
            if ($routeParams.newUser == 'true') {
            }
        }
    };

    $scope.checkForNewUser = function()
    {
        var isOk = true;
        $scope.alertMessage = '';

        if (!$scope._User.userName)
        {
            $scope.alertMessage = 'You have to introduce the user nick for the new user';
            isOk = false;
            return;
        }

        if ($scope._User.sendPassword == false)
        {
            if (!$scope._User.pwd1)
            {
                    $scope.alertMessage = 'You have to introduce a password';
                    isOk = false;
                    return;
            } else {
                if ($scope._User.pwd1 != $scope._User.pwd2)
                {
                    $scope.alertMessage = 'Passwords do not match';
                    isOk = false;
                    return;
                }
            }
        } else {
            if (!$scope._User.email)
            {
                $scope.alertMessage = 'You have to introduce a valid email to send the generated password to the user';
                isOk = false;
                return;
            }
        }

        if (isOk == true)
        {
            $scope.save();
        }
    }

    $scope.checkForDuplicateUserNick = function()
    {
       //TODO:
    }

    $scope.checkForDuplicateUserEmail = function()
    {
       //TODO:
    }

    $scope.changeMyPassword = function()
    {


        $('#changePasswordModal').modal('show');
    }

    $scope.sendNewMyPassword = function()
    {

        var isOk = false;

        if ($scope._User.pwd1.length < 8)
        {
            $scope.passwordAlertMsg = "Your password must be at least 8 characters long";
        }

        if ($scope._User.pwd1 != $scope._User.pwd2)
        {
            $scope.passwordAlertMsg = "Enter the same password in both text areas";
        }

        if ($scope._User.pwd1.length >= 8 && $scope._User.pwd1 == $scope._User.pwd2)
          isOk = true;

        if (isOk == true)
        {
            connection.post('/api/change-my-password', {pwd1:$scope._User.pwd1,pwd2:$scope._User.pwd2}, function(data) {
                $('#changePasswordModal').modal('hide');
            });
        }

    }

    $scope.view = function() {
        if ($routeParams.userID)
        {
            if (!$scope.roles)
                loadRoles();

            connection.get('/api/admin/users/find-one', {id: $routeParams.userID}, function(data) {
                $scope._User = data.item;
                $scope.mode = 'edit';
            });

            connection.get('/api/get-user-counts/'+$routeParams.userID, {userID:$routeParams.userID}, function(data) {
                $scope.userCounts = data;

            });

            connection.get('/api/get-user-reports/'+$routeParams.userID, {userID:$routeParams.userID}, function(data) {
                $scope.userReports = data.items;

            });

            connection.get('/api/get-user-dashboards/'+$routeParams.userID, {userID:$routeParams.userID}, function(data) {
                $scope.userDashboards = data.items;

            });
        };
    };

    $scope.save = function()
    {
        if ($scope.mode == 'new')
        {
            connection.post('/api/admin/users/create', $scope._User, function(data) {
                    $('#editUserModal').modal('hide');
                    $scope.users.push($scope._User);
            });
        } else {
            connection.post('/api/admin/users/update/'+$scope._User._id, $scope._User, function(data) {
                    $('#editUserModal').modal('hide');
            });
        }
    }

    $scope.changeUserStatus = function(user)
    {
        if ($rootScope.isWSTADMIN)
        {

            if (user.status == 'active')
                var newStatus = 'Not active';
            if (user.status == 'Not active')
                var newStatus = 'active';

            var data = {userID: user._id, status: newStatus}

            connection.post('/api/admin/users/change-user-status', data, function(result) {
                user.status = newStatus;
            });
        }
    }

    $scope.getRoleName = function(roleID) {
         for (var r in $scope.roles)
         {
             if ($scope.roles[r]._id == roleID)
                return $scope.roles[r].name;
         }
    }

    $scope.getRolesNotInUser = function()
    {
        var theRoles = [];
        for (var r in $scope.roles)
        {
            if ($scope._User.roles.indexOf($scope.roles[r]._id) == -1)
                theRoles.push($scope.roles[r]);
        }

        return theRoles;
    }

    $scope.getUsers = function(page, search, fields) {
        var params = {};

        params.page = (page) ? page : 1;

        if (search) {
            $scope.search = search;
        }
        else if (page == 1) {
            $scope.search = '';
        }
        if ($scope.search) {
            params.search = $scope.search;
        }

        if (fields) params.fields = fields;



       connection.get('/api/admin/users/find-all', params, function(data) {
            $scope.users = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;
            $scope.pager = PagerService.GetPager($scope.users.length, data.page,10,data.pages);
        })
    };


    $scope.getUser = function() {
        loadStatuses();
        loadLanguages(loadRoles(loadFilters(getUser)));
    };

    function getUser() {
        connection.get('/api/admin/users/find-one', {id: $stateParams.user_id}, function(data) {
            $scope.data = data.user;

            //$scope.data.status = $filter('getByValue')($scope.statuses, $scope.data.status);
            //$scope.data.language = $filter('getByValue')($scope.languages, $scope.data.language);

            for (var i in $scope.data.filters) {
                var $clone = $('#filter-row-template').children().clone();

                $clone.children('.filter-value').children('input').val($scope.data.filters[i].value);

                $clone.children('.filter-name').children('select').val($scope.data.filters[i].name);

                $('#filters-table').append($clone);
            }

            addListeners();
        });
    }

    $scope.clearData = function() {
        $scope.data = null;

        loadStatuses();
        loadLanguages();
        loadRoles();
        loadFilters();
    };

    $scope.addUser = function(data) {
        if ($('#users-form').valid()) {
            data.filters = getFilters();

            connection.post('/api/admin/users/create', data, function(data) {
                if (data.result == 1) window.location.hash = '/admin/users';
            });
        }
    };
    /*
    $scope.editUser = function(data) {
        //if ($('#users-form').valid()) {
            data.filters = getFilters();

            connection.post('/api/admin/users/update/'+data._id, data, function(data) {
                if (data.result == 1) window.location.hash = '/admin/users';
            });
        //}
    };*/


    $scope.editUser = function () {
        $('#editUserModal').modal('show');
    }

    $scope.newUser = function() {
        $scope._User = {};
        $scope._User.roles = [];
        $scope._User.status = 'active';
        $scope._User.sendPassword = true;

        $scope.mode = 'new';
        $('#editUserModal').modal('show');
    }

    function getFilters() {
        var filters = [];
        $('#filters-table').children().each(function() {
            if ($(this).children('.filter-value').children('input').val()) {
                var filterValue = $(this).children('.filter-value').children('input').val(), filterName = false;

                if ($(this).children('.filter-name').hasClass('list-filter') && $(this).children('.filter-name').children('select').val())
                    filterName = $(this).children('.filter-name').children('select').val();
                else if ($(this).children('.filter-name').children('input').val())
                    filterName = $(this).children('.filter-name').children('input').val();

                if (filterName) filters.push({name: filterName, value: filterValue});
            }
        });
        return filters;
    }

    $scope.deleteUser = function(id) {
        $scope.delete_id = id;
        $('#deleteModal').modal('show');
    };
    $scope.confirmDelete = function(id) {
        $('#deleteModal').modal('hide');

        connection.post('/api/admin/users/delete/'+$scope.delete_id, {id: $scope.delete_id}, function(data) {
            $('#'+$scope.delete_id).remove();
        });
    };


    $scope.changeUser = function(data) {
        connection.post('/api/login?s=change-user', {userName: data.userName}, function(data) {
            $window.location.href="/home";
        });
    };

    function loadStatuses() {
        $scope.statuses = [
            {name: 'Active', value: 1},
            {name: 'Not Active', value: 0}
        ];
    }

    function loadLanguages(callLater) {
        connection.get('/api/admin/languages/find-all', {}, function(data) {
            $scope.languages = [];

            for (var i in data.items)
                $scope.languages.push({name: data.items[i].description, value: data.items[i].language});

            if (typeof callLater != 'undefined')
                callLater();
        });
    }

    function loadRoles(callLater) {
        connection.get('/api/roles/find-all', {}, function(data) {
            $scope.roles = data.items;

            var adminRole = {_id:'WSTADMIN',name:"Widestage Administrator"};
            $scope.roles.push(adminRole);

            if (typeof callLater != 'undefined')
                callLater();
        });
    }

    function loadFilters(callLater) {
        connection.get('/api/admin/configurations/find-user-filters', {}, function(data) {
            $scope.filters = data.filters;

            if (typeof callLater != 'undefined')
                callLater();
        });
    }

    function addListeners() {
        $('.filter-delete').click(function() {
            $(this).parent().parent().remove();
        });
        $('.enter-manually-btn').click(function() {
            $(this).parent().removeClass('list-filter');
            $(this).parent().addClass('manually-filter');
            $(this).parent().children('.list-filter').hide();
            $(this).parent().children('.manually-filter').show();
        });
        $('.choose-from-list-btn').click(function() {
            $(this).parent().removeClass('manually-filter');
            $(this).parent().addClass('list-filter');
            $(this).parent().children('.manually-filter').hide();
            $(this).parent().children('.list-filter').show();
        });
    }

    $scope.deleteRole = function (roleID) {

        if ($scope._User.userName == 'administrator' && roleID == 'WSTADMIN')
        {
            noty({text: "The role 'Widestage Administrator' can't be removed from the user administrator",  timeout: 6000, type: 'warning'});
        } else {
            var roleName = $scope.getRoleName(roleID);
            $scope.modalOptions = {};
            $scope.modalOptions.headerText = 'Confirm delete role'
            $scope.modalOptions.bodyText = 'Are you sure you want to remove this role from the user:'+' '+roleName;
            $scope.modalOptions.ID = roleID;
            $('#deleteModal').modal('show');
        }
    };

    $scope.deleteConfirmed = function (roleID) {

        $scope._User.roles.splice($scope._User.roles.indexOf(roleID),1);

        $scope.save();
        $('#deleteModal').modal('hide');


    };
});


