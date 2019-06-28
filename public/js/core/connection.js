(function () {
    'use strict';

    angular.module('app.core').factory('connection', connection);

    connection.$inject = ['$http', 'Noty'];

    function connection ($http, Noty) {
        const service = {
            get: get,
            post: post,
        };

        return service;

        function get (url, params, options) {
            options = {
                showMsg: (options && typeof options.showMsg !== 'undefined') ? options.showMsg : true
            };

            return $http.get(url, { params: params })
                .then(response => {
                    const data = response.data;

                    if (typeof data === 'string') window.location.href = '/';

                    if (data.result === 1 && data.msg && options.showMsg) {
                        new Noty({ text: data.msg, type: 'success' }).show();
                    } else if (data.result === 0 && data.msg && options.showMsg) {
                        new Noty({ text: data.msg, type: 'error' }).show();
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
                        new Noty({ text: data.msg, type: 'success' }).show();
                    } else if (data.result === 0 && data.msg) {
                        new Noty({ text: data.msg, type: 'error' }).show();
                    }

                    return data;
                });
        }
    }
})();
