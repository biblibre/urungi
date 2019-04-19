angular.module('app').service('fileService', function (connection) {
    this.getFiles = function () {
        const params = {};

        return connection.get('/api/files/get-files', params).then(function (result) {
            if (result.result === 1) {
                return result.files;
            }
        });
    };

    this.uploadFile = function (file) {
        return new Promise((resolve, reject) => {
            var XHR = new XMLHttpRequest();
            var formData = new FormData();

            formData.append('content', file);

            XHR.addEventListener('load', function (event) {
                try {
                    const data = JSON.parse(XHR.responseText);

                    if (data.result !== 1 && data.msg) {
                        noty({ text: data.msg, timeout: 2000, type: 'error' });
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
                noty({ text: 'Unexpected server error', timeout: 2000, type: 'error' });
                console.log('Unexpected server error :');
                console.log(event);
                resolve();
            });

            XHR.open('POST', '/api/files/upload');
            XHR.send(formData);
        });
    };
});
