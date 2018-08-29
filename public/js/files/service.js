/* global CryptoJS: false */

app.service('fileService', function (connection, Constants) {
    this.getFiles = async function () {
        const params = {};

        var result = await connection.get('/api/files/get-files', params);

        if (result.result === 1) {
            return result.files;
        }
    };

    this.uploadFile = function (file) {
        return new Promise((resolve, reject) => {
            var XHR = new XMLHttpRequest();
            var formData = new FormData();

            formData.append('content', file);

            XHR.addEventListener('load', function (event) {
                try {
                    const response = JSON.parse(XHR.responseText.split(',')[1]);
                    var data = response.data;

                    if (Constants.CRYPTO) {
                        var decrypted = CryptoJS.AES.decrypt(data, Constants.SECRET);
                        data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
                    }

                    if (data.result !== 1 && data.msg) {
                        noty({text: data.msg, timeout: 2000, type: 'error'});
                    }

                    if (data.result === 1) {
                        resolve(data.item);
                    } else {
                        resolve();
                    }
                } catch (err) {
                    console.log('unable to process response');
                    console.error(err);
                    resolve();
                }
            });

            XHR.addEventListener('error', function (event) {
                noty({text: 'Unexpected server error', timeout: 2000, type: 'error'});
                console.log('Unexpected server error :');
                console.log(event);
                resolve();
            });

            XHR.open('POST', '/api/files/upload');
            XHR.send(formData);
        });
    };
});
