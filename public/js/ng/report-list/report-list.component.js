(function () {
    'use strict';

    angular.module('app.report-list')
        .controller('ReportListController', ReportListController)
        .component('appReportList', {
            templateUrl: 'partials/report-list/report-list.component.html',
            controller: 'ReportListController',
            controllerAs: 'vm',
        });

    ReportListController.$inject = ['$window', '$timeout', 'i18n', 'userService'];

    function ReportListController ($window, $timeout, i18n, userService) {
        const vm = this;

        vm.introOptions = {};
        vm.creationAuthorised = false;
        vm.showIntro = showIntro;

        activate();

        function activate () {
            vm.introOptions = getIntroOptions();

            userService.getCurrentUser().then(user => {
                vm.creationAuthorised = user.reportsCreate;
            });

            if ($window.location.hash === '#intro') {
                $timeout(function () { vm.showIntro(); }, 1000);
            }
        }

        function getIntroOptions () {
            const introOptions = {
                nextLabel: i18n.gettext('Next'),
                prevLabel: i18n.gettext('Back'),
                doneLabel: i18n.gettext('Done'),
                steps: [
                    {
                        title: i18n.gettext('Reports'),
                        intro: i18n.gettext('Here you can create and execute reports.'),
                    },
                    {
                        title: i18n.gettext('Reports'),
                        intro: '<p>' +
                            i18n.gettext('Choose a report type and drag and drop elements from the selected layer to compose your report.') +
                            '</p><p>' +
                            i18n.gettext('You can also add runtime filters to split your data in real time.') +
                            '</p>',
                    },
                    {
                        element: '#newReportButton',
                        title: i18n.gettext('New Report'),
                        intro: i18n.gettext('Click here to create a new report.'),
                    },
                    {
                        element: 'app-reports-table',
                        title: i18n.gettext('Reports list'),
                        intro: '<p><strong>' +
                            i18n.gettext('Here all your reports are listed.') +
                            '</strong></p><p>' +
                            i18n.gettext('Click over a report\'s name to execute it.') +
                            '</p><p>' +
                            i18n.gettext('You can also modify or drop the report, clicking into the modify or delete buttons.') +
                            '</p>',
                    },
                    {
                        element: '.btn-edit',
                        title: i18n.gettext('Edit report'),
                        intro: i18n.gettext('Click here to modify the report.'),
                    },
                    {
                        element: '.btn-delete',
                        title: i18n.gettext('Delete report'),
                        intro:
                            '<p><strong>' +
                            i18n.gettext('Click here to delete the report.') +
                            '</strong></p><p>' +
                            i18n.gettext('Once deleted the report will not be recoverable again.') +
                            '</p><p>' +
                            i18n.gettext('Requires 2 step confirmation.') +
                            '</p>',
                    },
                    {
                        element: '.btn-duplicate',
                        title: i18n.gettext('Duplicate report'),
                        intro: i18n.gettext('Click here to duplicate the report.'),
                    },
                    {
                        element: '.published-tag',
                        title: i18n.gettext('Report published'),
                        intro: '<p><strong>' +
                            i18n.gettext('This label indicates that this report is public.') +
                            '</strong></p><p>' +
                            i18n.gettext('If you drop or modify a published report, it will have and impact on other users, think about it before making any updates on the report.') +
                            '</p>',
                    }
                ]
            };

            return introOptions;
        }

        function showIntro () {
            $window.introJs().setOptions(vm.introOptions).start();
        }
    }
})();
