(function () {
    'use strict';

    angular.module('app.core').factory('connection', connection);

    connection.$inject = ['$http', 'notify'];

    function connection ($http, notify) {
        const service = {
            get,
            post,
        };

        return service;

        function get (url, params, options) {
            options = {
                showMsg: (options && typeof options.showMsg !== 'undefined') ? options.showMsg : true
            };

            return $http.get(url, { params })
                .then(response => {
                    const data = response.data;

                    if (typeof data === 'string') window.location.href = '/';

                    if (data.result === 1 && data.msg && options.showMsg) {
                        notify.success(data.msg);
                    } else if (data.result === 0 && data.msg && options.showMsg) {
                        notify.error(data.msg);
                    }

                    return data;
                });
        }

        function post (url, data) {
            if (typeof data._id !== 'undefined') data.id = data._id;

            return $http.post(url, data)
                .then(response => {
                    const data = response.data;

                    if (typeof data === 'string') window.location.href = '/';

                    if (data.result === 1 && data.msg) {
                        notify.success(data.msg);
                    } else if (data.result === 0 && data.msg) {
                        notify.error(data.msg);
                    }

                    return data;
                });
        }
    }
})();
