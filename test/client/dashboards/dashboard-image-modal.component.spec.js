require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/notify.service.js');
require('../../../public/js/core/api.js');
require('../../../public/js/dashboards/dashboards.module.js');
require('../../../public/js/dashboards/dashboard-image-modal.component.js');

describe('appDashboardImageModal', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.dashboards'));
    beforeEach(angular.mock.module('app.templates'));

    let $componentController, $httpBackend;

    beforeEach(inject(function (_$componentController_, _$httpBackend_) {
        $componentController = _$componentController_;
        $httpBackend = _$httpBackend_;
    }));

    describe('DashboardImageModalController', function () {
        let closeSpy;
        let dismissSpy;
        let notifyErrorSpy;
        let vm;

        beforeEach(function () {
            notifyErrorSpy = jest.fn(function () { this.error = notifyErrorSpy; });
            const locals = {
                notify: {
                    error: notifyErrorSpy,
                }
            };

            closeSpy = jest.fn();
            dismissSpy = jest.fn();
            const bindings = {
                resolve: {},
                close: closeSpy,
                dismiss: dismissSpy,
            };
            vm = $componentController('appDashboardImageModal', locals, bindings);
        });

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('$onInit', function () {
            it('should initialize all files', function () {
                const response = {
                    result: 1,
                    files: [
                        {
                            description: 'Foo',
                            name: 'foo',
                        },
                    ],
                };
                $httpBackend.expect('GET', '/api/files').respond(response);
                vm.$onInit();
                $httpBackend.flush();

                expect(vm.files).toEqual(response.files);

                expect(vm.catalogImages).toHaveLength(99);
                expect(vm.catalogImages[0]).toEqual({
                    url: 'resources/images/tumbnails100/JPEG/photo-01_1.jpg',
                    source1400: 'resources/images/width1400/JPEG/photo-01_1.jpg',
                    source700: 'resources/images/width700/JPEG/photo-01_1.jpg',
                });

                expect(vm.catalogIcons).toHaveLength(54);
                expect(vm.catalogIcons[0]).toEqual({
                    url: 'resources/images/icons/icon-01.png',
                });
            });
        });

        describe('onFileSelected', function () {
            it('should call close', function () {
                const file = new File([], 'foo');
                vm.onFileSelected(file);
                expect(closeSpy).toHaveBeenCalledWith({ $value: file });
            });
        });

        describe('upload', function () {
            it('should do nothing if no parameters', function () {
                expect(vm.upload()).toBeUndefined();
            });

            it('should call notificationService if file is not an image', function () {
                const file = new File([], 'foo', { type: 'text/plain' });
                vm.upload(file);
                expect(notifyErrorSpy).toHaveBeenCalledWith('You may only upload images');
            });

            it('should call POST /api/files', function () {
                const response = {
                    upload_user_id: 1,
                    companyID: 'COMPID',
                    filename: 'foo',
                    name: 'foo',
                    type: 'image/png',
                    url: 'uploads/foo',
                    size: 1,
                    nd_trash_deleted: false,
                    createdOn: new Date()
                };
                $httpBackend.expect('POST', '/api/files').respond(response);
                const file = new File([], 'foo', { type: 'image/png' });
                vm.upload(file);

                expect(vm.files[0]).toEqual({ loading: true });
                $httpBackend.flush();
                expect(vm.files[0]).toEqual(Object.assign({ loading: false }, response));
            });
        });
    });
});
