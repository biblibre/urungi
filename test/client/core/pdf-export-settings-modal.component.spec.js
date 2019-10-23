require('../../../public/js/core/core.module.js');
require('../../../public/js/core/pdf-export-settings-modal.component.js');

describe('appPdfExportSettingsModal', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.templates'));

    let $componentController;

    beforeEach(inject(function (_$componentController_, _$compile_, _$rootScope_) {
        $componentController = _$componentController_;
    }));

    describe('PdfExportSettingsModalController', function () {
        let closeSpy;
        let dismissSpy;
        let vm;

        beforeEach(function () {
            closeSpy = jest.fn();
            dismissSpy = jest.fn();

            const bindings = {
                resolve: {},
                close: closeSpy,
                dismiss: dismissSpy,
            };
            vm = $componentController('appPdfExportSettingsModal', null, bindings);
        });

        describe('$onInit', function () {
            it('should set sane defaults', function () {
                vm.$onInit();

                expect(vm.settings.displayHeaderFooter).toBe(false);
                expect(vm.settings.headerTemplate).toBeTruthy();
                expect(vm.settings.footerTemplate).toBeTruthy();
            });
        });

        describe('submit', function () {
            it('should replace date in templates', function () {
                vm.settings.headerTemplate = '<div>header <span class="foo date bar"></span></div>';
                vm.settings.footerTemplate = '<div>footer <span class="foo date bar"></span></div>';
                vm.submit();

                const dateString = new Date().toLocaleDateString();
                expect(vm.settings.headerTemplate).toBe('<div>header <span class="foo bar">' + dateString + '</span></div>');
                expect(vm.settings.footerTemplate).toBe('<div>footer <span class="foo bar">' + dateString + '</span></div>');
            });

            it('should call close', function () {
                vm.settings.displayHeaderFooter = true;
                vm.settings.headerTemplate = 'foo';
                vm.settings.footerTemplate = 'bar';
                vm.submit();
                expect(closeSpy).toHaveBeenCalledWith({ $value: { displayHeaderFooter: true, headerTemplate: 'foo', footerTemplate: 'bar' } });
            });
        });
    });
});
