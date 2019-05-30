angular.module('app').directive('fileModal', function ($http, fileService) {
    return {

        templateUrl: '/partials/files/galleryModal.html',

        link: function ($scope) {
            $scope.init = function () {
                $scope.catalogImages = [];
                $scope.catalogIcons = [];

                for (var i = 1; i < 100; ++i) {
                    var image = {};
                    var imgnbr = '';
                    if (i < 10) { imgnbr = '0' + i; } else { imgnbr = i; }

                    image.url = '/resources/images/tumbnails100/JPEG/photo-' + imgnbr + '_1.jpg';
                    image.source1400 = '/resources/images/width1400/JPEG/photo-' + imgnbr + '_1.jpg';
                    image.source700 = '/resources/images/width700/JPEG/photo-' + imgnbr + '_1.jpg';

                    $scope.catalogImages.push(image);
                }

                for (i = 1; i < 55; ++i) {
                    var icons = {};
                    var iconsnbr = '';
                    if (i < 10) { iconsnbr = '0' + i; } else { iconsnbr = i; }

                    icons.url = '/resources/images/icons/icon-' + iconsnbr + '.png';
                    $scope.catalogIcons.push(icons);
                }

                return fileService.getFiles().then(function (files) {
                    $scope.files = files;
                });
            };

            $scope.$on('showFileModal', function (event, args) {
                $scope.addFile = args.addFile;

                fileService.getFiles().then(res => {
                    $scope.files = res;
                });

                $('#fileGalleryModal').modal('show');
            });

            $scope.modalOptions = {
                ok: function (result) {
                    $('#fileGalleryModal').modal('hide');
                },
                close: function (result) {
                    $('#fileGalleryModal').modal('hide');
                }
            };

            $scope.onFileSelected = function (file) {
                $scope.addFile(file);

                $('#fileGalleryModal').modal('hide');
            };

            $scope.upload = function (file) {
                if (!file) {
                    return;
                }

                const type = file.type.split('/')[0];
                if (type !== 'image') {
                    noty({ text: 'You may only upload images', timeout: 4000, type: 'error' });
                    return;
                }

                var uploadPromise = fileService.uploadFile(file);

                var newFile = {
                    loading: true
                };
                $scope.files.push(newFile);

                uploadPromise.then(file => {
                    $.extend(newFile, file);
                    newFile.loading = false;
                    $scope.$digest();
                });
            };

            $scope.searchOnline = function (search) {
                $http({
                    method: 'GET',
                    url: 'https://api.unsplash.com/search/photos/',
                    params: {
                        client_id: '65d94c5d3440b6da10c6cd390059fd709a1f33ffc8f46f46ed44d6b6c6759559',
                        query: search
                    },
                }).then(angular.bind(this, function (data, status, headers, config) {
                    $scope.onlineImages = [];

                    for (var i in data.results) {
                        $scope.onlineImages.push({
                            url: data.results[i].urls.full,
                            thumb: data.results[i].urls.thumb
                        });
                    }
                }))
                    .catch(angular.bind(this, function (data, status, headers, config) {
                        console.log(data);
                    }));
            };

            // https://api.unsplash.com/search/photos/?client_id=65d94c5d3440b6da10c6cd390059fd709a1f33ffc8f46f46ed44d6b6c6759559&query=office
        }
    };
});
