/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 04/06/15
 * Time: 15:28
 * To change this template use File | Settings | File Templates.
 */
angular.module('myApp.services', []).
    value('version', '0.1');

app.service('Constants' , function () {

    var constants = {
        DEBUGMODE : false,
        CRYPTO: true,
        SECRET: "SecretPassphrase"
    };

    return constants;
})

.service('connection' , function ($http, Constants) {

    this.get = function(url, params, done, options) {
options = {
    showLoader: (options && typeof options.showLoader != 'undefined') ? options.showLoader : true,
    showMsg: (options && typeof options.showMsg != 'undefined') ? options.showMsg : true
};

if (options.showLoader) $('#loader-overlay').show();

if (Constants.CRYPTO) {
    var encrypted = CryptoJS.AES.encrypt(JSON.stringify(params), Constants.SECRET);
    params = {data: String(encrypted)};
}

$http({method: 'GET', url: url, params: params})
    .success(angular.bind(this, function (data, status, headers, config) {
        if (typeof data == 'string') window.location.href = '/';

        if (Constants.CRYPTO) {
            var decrypted = CryptoJS.AES.decrypt(data.data, Constants.SECRET);
            data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        }

        if (typeof done != 'undefined')
            done(data);

        if (options.showLoader) $('#loader-overlay').hide();

        if (data.result == 1 && data.msg && options.showMsg) {
            noty({text: data.msg,  timeout: 2000, type: 'success'});
        }
        else if (data.result === 0 && data.msg && options.showMsg) {
            noty({text: data.msg,  timeout: 2000, type: 'error'});
        }
    }))
    .error(angular.bind(this, function (data, status, headers, config) {
        if (options.showLoader) $('#loader-overlay').hide();

        noty({text: 'Error',  timeout: 2000, type: 'error'});
    }));

};

this.post = function(url, data, done) {
    if (typeof data._id != 'undefined') data.id = data._id;

    $('#loader-overlay').show();

    if (Constants.CRYPTO) {
        var encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), Constants.SECRET);
        data = {data: String(encrypted)};
    }

    $http.post(url, data)
        .success(angular.bind(this, function (data, status, headers, config) {
            if (typeof data == 'string') window.location.href = '/';

            if (Constants.CRYPTO) {
                var decrypted = CryptoJS.AES.decrypt(data.data, Constants.SECRET);
                data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
            }

            if (typeof done != 'undefined')
                done(data);

            $('#loader-overlay').hide();

            if (data.result == 1 && data.msg) {
                noty({text: data.msg,  timeout: 2000, type: 'success'});
            }
            else if (data.result === 0 && data.msg) {
                noty({text: data.msg,  timeout: 2000, type: 'error'});
            }
        }))
        .error(angular.bind(this, function (data, status, headers, config) {
            $('#loader-overlay').hide();

            noty({text: 'Error',  timeout: 2000, type: 'error'});
        }));
};

return this;
});


