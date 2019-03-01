angular.module('myApp.services', [])
    .value('version', '0.1');

app.service('Constants', function () {
    var constants = {
        DEBUGMODE: false,
    };

    return constants;
})
    .service('connection', function ($http, Constants) {
        this.get = function (url, params, done, options) {
            options = {
                showLoader: (options && typeof options.showLoader !== 'undefined') ? options.showLoader : true,
                showMsg: (options && typeof options.showMsg !== 'undefined') ? options.showMsg : true
            };

            if (options.showLoader) $('#loader-overlay').show();

            const p = $http.get(url, {params: params})
                .then(response => {
                    const data = response.data;

                    if (typeof data === 'string') window.location.href = '/';

                    if (data.result === 1 && data.msg && options.showMsg) {
                        noty({text: data.msg, timeout: 5000, type: 'success'});
                    } else if (data.result === 0 && data.msg && options.showMsg) {
                        noty({text: data.msg, timeout: 5000, type: 'error'});
                    }

                    return data;
                }, response => {
                    noty({text: 'Error', timeout: 5000, type: 'error'});

                    throw new Error(response.statusText);
                })
                .finally(() => {
                    if (options.showLoader) $('#loader-overlay').hide();
                });

            if (typeof done !== 'undefined') {
                p.then(data => done(data));
            } else {
                return p;
            }
        };

        this.post = function (url, data, done) {
            if (typeof data._id !== 'undefined') data.id = data._id;

            $('#loader-overlay').show();

            const p = $http.post(url, data)
                .then(response => {
                    const data = response.data;

                    if (typeof data === 'string') window.location.href = '/';

                    if (data.result === 1 && data.msg) {
                        noty({text: data.msg, timeout: 5000, type: 'success'});
                    } else if (data.result === 0 && data.msg) {
                        noty({text: data.msg, timeout: 5000, type: 'error'});
                    }

                    return data;
                }, response => {
                    noty({text: 'Error', timeout: 5000, type: 'error'});
                    console.log(response);

                    throw new Error(response.statusText);
                })
                .finally(() => {
                    $('#loader-overlay').hide();
                });

            if (typeof done !== 'undefined') {
                p.then(data => done(data));
            } else {
                return p;
            }
        };

        return this;
    });
