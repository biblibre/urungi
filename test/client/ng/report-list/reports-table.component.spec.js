require('angular-ui-tree');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/table/table.module.js');
require('../../../../public/js/ng/share/share.module.js');
require('../../../../public/js/ng/report/report.module.js');
require('../../../../public/js/ng/report-list/report-list.module.js');
require('../../../../public/js/ng/report-list/report-list.reports-table.component.js');

describe('appReportsTable', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.report'));
    beforeEach(angular.mock.module('app.report-list'));

    let $componentController, $httpBackend;

    beforeEach(inject(function (_$componentController_, _$httpBackend_) {
        $componentController = _$componentController_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('ReportsTableController', function () {
        let vm;
        let selectSpy;

        beforeEach(function () {
            const response = reportsFindAllResponse();
            $httpBackend.expect('GET', '/api/reports/find-all?fields=reportName&fields=isPublic&fields=isShared&fields=layerName&fields=parentFolder&fields=owner&fields=author&fields=createdOn&filters=%7B%7D&page=1&populate=layer&sort=reportName&sortType=1')
                .respond(response);

            selectSpy = jest.fn();
            const bindings = {
                onSelect: selectSpy,
            };
            vm = $componentController('appReportsTable', null, bindings);
            $httpBackend.flush();
        });

        describe('goToPage', function () {
            it('should fetch another page', function () {
                const response = reportsFindAllResponse();
                $httpBackend.expect('GET', '/api/reports/find-all?fields=reportName&fields=isPublic&fields=isShared&fields=layerName&fields=parentFolder&fields=owner&fields=author&fields=createdOn&filters=%7B%7D&page=2&populate=layer&sort=reportName&sortType=1')
                    .respond(response);

                vm.goToPage(2);
                $httpBackend.flush();

                expect(vm.reports).toEqual(response.items);
                expect(vm.page).toBe(2);
                expect(vm.currentPage).toBe(response.page);
                expect(vm.pages).toBe(response.pages);
            });
        });

        describe('onFilter', function () {
            it('should pass filters in url', function () {
                const response = reportsFindAllResponse();
                $httpBackend.expect('GET', '/api/reports/find-all?fields=reportName&fields=isPublic&fields=isShared&fields=layerName&fields=parentFolder&fields=owner&fields=author&fields=createdOn&filters=%7B%22reportName%22:%22foo%22%7D&page=1&populate=layer&sort=reportName&sortType=1')
                    .respond(response);

                vm.onFilter('reportName', 'foo');
                $httpBackend.flush();

                expect(vm.reports).toEqual(response.items);
            });
        });

        describe('onSort', function () {
            it('should pass sort in url', function () {
                const response = reportsFindAllResponse();
                $httpBackend.expect('GET', '/api/reports/find-all?fields=reportName&fields=isPublic&fields=isShared&fields=layerName&fields=parentFolder&fields=owner&fields=author&fields=createdOn&filters=%7B%7D&page=1&populate=layer&sort=createdOn&sortType=-1')
                    .respond(response);

                vm.onSort('createdOn', -1);
                $httpBackend.flush();

                expect(vm.reports).toEqual(response.items);
            });
        });

        describe('refresh', function () {
            it('should fetch reports', function () {
                const response = reportsFindAllResponse();
                $httpBackend.expect('GET', '/api/reports/find-all?fields=reportName&fields=isPublic&fields=isShared&fields=layerName&fields=parentFolder&fields=owner&fields=author&fields=createdOn&filters=%7B%7D&page=1&populate=layer&sort=reportName&sortType=1')
                    .respond(response);

                vm.refresh();
                $httpBackend.flush();

                expect(vm.reports).toEqual(response.items);
                expect(vm.page).toBe(response.page);
                expect(vm.pages).toBe(response.pages);
            });
        });

        describe('select', function () {
            it('should call onSelect', function () {
                const clickEvent = new MouseEvent('click');
                const report = {};
                vm.select(clickEvent, report);

                expect(selectSpy).toHaveBeenCalledWith({ $report: report });
            });
        });
    });

    function reportsFindAllResponse () {
        return {
            page: 1,
            pages: 2,
            items: [
                { reportName: 'foo' },
            ],
        };
    }
});
