angular.module('app').factory('usersModel', ['connection', function (connection) {
    function getUserObjects () {
        return connection.get('/api/get-user-objects').then(data => {
            return data.items;
        });
    }

    return {
        getUserObjects: getUserObjects,
    };
}]);
