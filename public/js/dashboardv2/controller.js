angular.module('app').controller('dashBoardv2Ctrl', function ($scope, $location, $q,
    reportsService, connection, $routeParams, reportModel, c3Charts, uuid2,
    htmlWidgets, dashboardv2Model, grid, $timeout,
    gettextCatalog, $uibModal, userService, api
) {
    $scope.reportModal = 'partials/report/edit.html';
    $scope.settingsHtml = 'partials/pages/settings.html';
    $scope.queriesHtml = 'partials/pages/queries.html';
    $scope.settingsTemplate = 'partials/widgets/inspector.html';
    $scope.filterWidget = 'partials/report/filterWidget.html';
    $scope.promptModal = 'partials/widgets/promptModal.html';

    $scope.selectedDashboard = { reports: [], containers: [], prompts: [] };
    $scope.lastElementID = 0;
    $scope.selectedDashboardLimit = { value: 0 };
    $scope.dataPool = [];

    $scope.hiddenXS = false;
    $scope.hiddenSM = false;
    $scope.hiddenMD = false;
    $scope.hiddenLG = false;
    $scope.hiddenPrint = false;
    $scope.canMoveSelectedElement = false;
    // $scope.imageFilters = [];
    // $scope.imageFilters.opacity = 10;
    $scope.theData = [];
    $scope.mode = 'preview';

    $scope.textAlign = [
        { name: 'left', value: 'left' },
        { name: 'right', value: 'right' },
        { name: 'center', value: 'center' }
    ];

    $scope.fontSizes = [
        { name: '8px', value: '8px' },
        { name: '9px', value: '9px' },
        { name: '10px', value: '10px' },
        { name: '11px', value: '11px' },
        { name: '12px', value: '12px' },
        { name: '13px', value: '13px' },
        { name: '14px', value: '14px' },
        { name: '15px', value: '15px' },
        { name: '16px', value: '16px' },
        { name: '17px', value: '17px' },
        { name: '18px', value: '18px' },
        { name: '19px', value: '19px' },
        { name: '20px', value: '20px' }
    ];

    $scope.fontWeights = [
        { name: 'normal', value: 'normal' },
        { name: 'bold', value: 'bold' },
        { name: 'bolder', value: 'bolder' },
        { name: 'lighter', value: 'lighter' }
    ];

    $scope.fontStyles = [
        { name: 'normal', value: 'normal' },
        { name: 'italic', value: 'italic' },
        { name: 'oblique', value: 'oblique' }
    ];

    $scope.newReport = function () {
        $scope.reportInterface = true;
        $scope.editingReport = null;
        $scope.$broadcast('newReportForDash', {});
    };

    $scope.Redraw = function () {
        repaintReports();
    };

    $scope.importReport = function () {
        const modal = $uibModal.open({
            component: 'appReportsImportModal',
        });
        modal.result.then(reportID => {
            reportModel.getReportDefinition(reportID).then(function (report) {
                if (report) {
                    report.id = report._id;
                    $scope.selectedDashboard.reports.push(report);
                } else {
                    noty({ text: 'Error : failed to import report', type: 'error', timeout: 3000 });
                }
            });
        });
    };

    $scope.$on('cancelReport', function (event, args) {
        $scope.reportInterface = false;
    });

    $scope.initForm = function () {
        if (/new/.test($location.path())) {
            $scope.mode = 'add';
        }

        if (/edit/.test($location.path())) {
            $scope.dashboardID = $routeParams.dashboardID;
            $scope.mode = 'edit';
        }

        if (/push/.test($location.path())) {
            $scope.dashboardID = $routeParams.dashboardID;
            if ($scope.dashboardID === 'new') {
                $scope.mode = 'add';
            } else {
                $scope.mode = 'edit';
            }
        }

        if ($scope.mode === 'add') {
            $scope.dashboardID = uuid2.newguid();
            $scope.selectedDashboard = {
                dashboardName: 'New Dashboard',
                backgroundColor: '#999999',
                reports: [],
                items: [],
                properties: {},
                dashboardType: 'DEFAULT'
            };

            if (/push/.test($location.path())) {
                const pushedReport = reportsService.getStoredReport();
                pushedReport.reportName = 'report_' + ($scope.selectedDashboard.reports.length + 1);
                pushedReport.id = uuid2.newguid();
                $scope.selectedDashboard.reports.push(pushedReport);
            }
        };

        if ($scope.mode === 'edit') {
            $scope.selectedDashboardLimit = { value: 500 };

            if (!$scope.dashboardID) {
                noty({ text: 'Could not load dashboard : missing id', type: 'error', timeout: 4000 });
            }

            return connection.get('/api/dashboardsv2/get/' + $scope.dashboardID, { id: $scope.dashboardID }).then(function (data) {
                $scope.selectedDashboard = data.item;

                if (/push/.test($location.path())) {
                    const pushedReport = reportsService.getStoredReport();
                    pushedReport.reportName = 'report_' + ($scope.selectedDashboard.reports.length + 1);
                    pushedReport.id = uuid2.newguid();
                    $scope.selectedDashboard.reports.push(pushedReport);
                }

                // getAllPageColumns();

                var $div = $($scope.selectedDashboard.properties.designerHTML);
                var el = angular.element(document.getElementById('designArea'));
                el.append($div);
                if ($scope.selectedDashboard.properties.rootStyle) {
                    el.attr('style', $scope.selectedDashboard.properties.rootStyle);
                }

                angular.element(document).injector().invoke(function ($compile) {
                    $compile($div)($scope);
                });

                cleanAllSelected();

                $scope.initPrompts();

                repaintReports();
            });
        }
    };

    $scope.cancelReport = function (report) {
        $scope.reportInterface = false;
    };

    $scope.saveReport4Dashboard = function (isMode) {
        // first clean the results area for not to create a conflict with other elements with same ID
        var el = document.getElementById('reportLayout');
        angular.element(el).empty();

        var qstructure = reportsService.getStoredReport();

        if ($scope.editingReport == null) {
            qstructure.reportName = 'report_' + ($scope.selectedDashboard.reports.length + 1);
            qstructure.id = uuid2.newguid();
            $scope.selectedDashboard.reports.push(qstructure);
        } else {
            var updatedReport = angular.copy(qstructure);
            $scope.selectedDashboard.reports.splice($scope.editingReportIndex, 1, updatedReport);
            // reportModel.getReport(updatedReport, 'REPORT_' + qstructure.id, $scope.mode, function (sql) {});
        }
        $scope.reportInterface = false;
        // getAllPageColumns();
        $scope.initPrompts();
    };

    $scope.getQuery = function (queryID) {
        for (var r in $scope.selectedDashboard.reports) {
            if ($scope.selectedDashboard.reports[r].query.id === queryID) {
                return $scope.selectedDashboard.reports[r].query;
            }
        }
    };

    $scope.getQueryForFilter = function (filter) {
        const query = {
            layerID: filter.layerID,
            columns: [
                {
                    id: 'f',
                    collectionID: filter.collectionID,
                    datasourceID: filter.datasourceID,
                    elementID: filter.elementID,
                    elementName: filter.elementName,
                    elementType: filter.elementType,
                    layerID: filter.layerID,
                }
            ],
            order: [],
            filters: [],
        };

        return query;
    };

    var reportBackup;
    $scope.loadReport = function (report) {
        $scope.reportInterface = true;
        $scope.editingReport = report.id;
        // reportBackup = clone(report);
        reportBackup = angular.copy(report);
        for (var i in $scope.selectedDashboard.reports) {
            if ($scope.selectedDashboard.reports[i].id === report.id) {
                // $scope.selectedDashboard.reports.splice(i,1);
                $scope.editingReportIndex = i;
            }
        }
        $scope.$broadcast('loadReportStrucutureForDash', { report: reportBackup });
    };

    function getDroppableObjectHtml (data, context) {
        return $q.resolve(0).then(function () {
            switch (data.objectType) {
            case 'jumbotron':
                return htmlWidgets.getJumbotronHTML();

            case '4colscta':
                return htmlWidgets.get4colsctaHTML();

            case '3colscta':
                return htmlWidgets.get3colsctaHTML();

            case '2colscta':
                return htmlWidgets.get2colsctaHTML();

            case 'divider':
                return htmlWidgets.getDivider();

            case 'imageTextLarge':
                return htmlWidgets.getImageTextLargeHTML();

            case 'textImageLarge':
                return htmlWidgets.getTextImageLargeHTML();

            case 'report':
                const report = $scope.selectedDashboard.reports.find(r => r.id === data.reportID);
                if (!report) {
                    noty({ text: 'Could not find report', timeout: 6000, type: 'error' });
                    return;
                }
                if (angular.element('#REPORT_' + report.id).length) {
                    noty({ text: 'Sorry, that report is already on the dash', timeout: 6000, type: 'error' });
                    return;
                }
                return reportModel.getReportContainerHTML(data.reportID);

            case 'queryFilter':
                if (angular.element('#PROMPT_' + data.promptID).length) {
                    noty({ text: 'Sorry, that filter is already on the dash', timeout: 6000, type: 'error' });
                    return;
                }
                return getPromptHTML(data);

            case 'tabs':
                var theid = 'TABS_' + uuid2.newguid();
                var theTabs = [{ label: 'tab1', active: true, id: uuid2.newguid() }, { label: 'tab2', active: false, id: uuid2.newguid() }, { label: 'tab3', active: false, id: uuid2.newguid() }, { label: 'tab4', active: false, id: uuid2.newguid() }];
                var tabsElement = { id: theid, type: 'tabs', properties: { tabs: theTabs } };
                if (!$scope.selectedDashboard.containers) { $scope.selectedDashboard.containers = []; }
                $scope.selectedDashboard.containers.push(tabsElement);

                return htmlWidgets.getTabsHTML(theid, theTabs);

            case 'image':
                const deferred = $q.defer();
                $scope.$broadcast('showFileModal', {
                    addFile: function (file) {
                        var url = file.url;
                        if (context) {
                            if (context.preferedSize === '700' && file.source700) {
                                url = file.source700;
                            }
                            if (context.preferedSize === '1400' && file.source1400) {
                                url = file.source1400;
                            }
                        }
                        deferred.resolve(htmlWidgets.getImage(url));
                    }
                });
                return deferred.promise;

            case 'video':
                return htmlWidgets.getVideo();

            case 'paragraph':
                return htmlWidgets.getParagraph();

            case 'heading':
                return htmlWidgets.getHeading();

            case 'pageHeader':
                return htmlWidgets.getPageHeader();

            case 'definitionList':
                return htmlWidgets.getDefinitionList();
            }
        });
    }

    $scope.onDrop = function (data, event, type, group) {
        // DROP OVER THE DASHBOARD PARENT DIV

        event.stopPropagation();
        var customObjectData = data['json/custom-object'];

        return getDroppableObjectHtml(customObjectData, { preferedSize: '1400' }).then(function (html) {
            var $div = $(html);
            $('#designArea').append($div);
            angular.element(document).injector().invoke(function ($compile) {
                var scope = angular.element($div).scope();
                $compile($div)(scope);
            });

            if (customObjectData.objectType === 'report') {
                repaintReports();
            }
        });
    };

    $scope.onDropObject = function (data, event, type, group) {
        // DROP OVER AN HTML CONTAINER

        event.stopPropagation();
        var customObjectData = data['json/custom-object'];

        const authorisedObjects = ['imageTextLarge', 'textImageLarge', 'report', 'queryFilter', 'image', 'video', 'paragraph', 'heading', 'pageHeader'];

        if (authorisedObjects.indexOf(customObjectData.objectType) === -1) {
            noty({ text: 'You are not allowed to put this object inside a component', timeout: 6000, type: 'warning' });
            return;
        }

        return getDroppableObjectHtml(customObjectData, { preferedSize: '700' }).then(function (html) {
            if (html) {
                var $div = $(html);
                var el = angular.element(event.target);
                el.append($div);
                angular.element(document).injector().invoke(function ($compile) {
                    var scope = angular.element($div).scope();
                    $compile($div)(scope);

                    if (customObjectData.objectType === 'report') {
                        repaintReports();
                    }
                });
            }
        });
    };

    $scope.promptChanged = function (elementID, values) {
        repaintReports();
    };

    function repaintReports () {
        var filterCriteria = {};
        for (const i in $scope.prompts) {
            filterCriteria[i] = $scope.prompts[i].criterion;
        }

        $scope.$broadcast('repaint', {
            fetchData: true,
            filterCriteria: filterCriteria,
            selectedRecordLimit: $scope.selectedDashboardLimit.value
        });
    }

    $scope.getElementProperties = function (element, elementID) {
        if (elementID) {
            if (elementID.substr(0, 7) === 'REPORT_') {
                var reportID = elementID.substr(7, elementID.length);
                for (var i in $scope.selectedDashboard.reports) {
                    if ($scope.selectedDashboard.reports[i].id === reportID) {
                        $scope.selectedReport = $scope.selectedDashboard.reports[i];
                    }
                }
            }
        }

        $scope.selectedElement = element;
        $scope.tabs.selected = 'settings';
    };

    $scope.onChangeElementProperties = function () {

    };

    $scope.changeChartColumnType = function (chart, column) {
        c3Charts.changeChartColumnType(chart, column);
    };

    $scope.overChartDragging = function () {

    };

    $scope.getTabs = function (id) {
        for (var c in $scope.selectedDashboard.containers) {
            if ($scope.selectedDashboard.containers[c].id === id) {
                return $scope.selectedDashboard.containers[c].properties.tabs;
            }
        }
    };
    /* TABS Component
    $scope.selectThisTab = function(tabsID,id)
    {

      for (var t in $scope.selectedDashboard.containers)
      {
        if ($scope.selectedDashboard.containers[t].id === tabsID)
            {
            var actualSelectedTab = $scope.selectedDashboard.containers[t].actualSelectedTab;
            var actualHeaderID = '#'+actualSelectedTab+'_HEADER';
            var actualBodyID = '#'+actualSelectedTab+'_BODY';
            $(actualHeaderID).removeClass('active');
            $(actualBodyID).removeClass('active');

            $scope.selectedDashboard.containers[t].actualSelectedTab = id;

            setTimeout(function () {
                //jQuery(window).trigger('resize');
                $(actualBodyID).trigger('resize');
                }, 5);
            }
      }

      var headerID = '#'+id+'_HEADER';
      var bodyID = '#'+id+'_BODY';
        $(headerID).removeClass('disabled');
        $(headerID).addClass('active');

        $(bodyID).addClass('active');

    }

    $scope.deleteTab = function(id)
    {
        var headerID = '#'+id+'_HEADER';
        var bodyID = '#'+id+'_BODY';
        $(headerID).remove();
        $(bodyID).remove();
    }

    $scope.addNewTab = function()
    {
        var id = $scope.selectedTabContainer.id;
        var tabID = uuid2.newguid();
        $scope.selectedTabContainer.properties.tabs.push({label:'new tab',active:false,id:tabID})
        var headerID = '#'+id+'_HEADER';
        var bodyID = '#'+id+'_BODY';
                    var theHeaderHTML = '<li id="'+tabID+'_HEADER" heading="Home" class="ng-isolate-scope" >'+
                                        '<a id="'+tabID+'_LABEL" ng-click="selectThisTab(\''+id+'\',\''+tabID+'\')"  class="ng-binding">new tab</a>'+
                                    '</li>';

                    var theBodyHTML = '<div id="'+tabID+'_BODY" class="tab-pane Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="min-Height:150px;padding:5px;"></div>';

                    var $div = $(theHeaderHTML);
                    $(headerID).append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

                    var $div = $(theBodyHTML);
                    $(bodyID).append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

    }

    $scope.changeTabLabel = function(id,newLabel)
    {
        var labelID = '#'+id+'_LABEL';
        $(labelID).text(newLabel);
    } */

    $scope.getRuntimeReport = function (reportID) {
        if ($scope.mode !== 'preview') {
            // for (var i in $scope.selectedDashboard.reports) {
            //     if ($scope.selectedDashboard.reports[i].id === reportID) {
            //         reportModel.getReport($scope.selectedDashboard.reports[i], 'REPORT_CONTAINER_' + reportID, $scope.mode, function (sql) {
            //         });
            //     }
            // }
            repaintReports();
        }
    };

    $scope.elementDblClick = function (theElement) {
    };

    $scope.dashboardName = function () {
        if ($scope.mode === 'add') {
            $('#dashboardNameModal').modal('show');
        } else {
            saveDashboard();
        }
    };

    $scope.dashboardNameSave = function () {
        $('#dashboardNameModal').modal('hide');
        $('.modal-backdrop').hide();
        saveDashboard();
        // $scope.mode = 'edit';
        $scope.goBack();
    };

    function cleanAll (theContainer) {
        var root = document.getElementById(theContainer);

        if (typeof root !== 'undefined') {
            cleanElement(root);
        }
    }

    function cleanElement (theElement) {
        for (var i = 0, len = theElement.childNodes.length; i < len; ++i) {
            $(theElement.childNodes[i]).removeAttr('page-block');
            $(theElement.childNodes[i]).removeAttr('contenteditable');
            $(theElement.childNodes[i]).removeAttr('drop');
            $(theElement.childNodes[i]).removeAttr('drop-effect');
            $(theElement.childNodes[i]).removeAttr('drop-accept');
            $(theElement.childNodes[i]).removeClass('editable');
            $(theElement.childNodes[i]).removeClass('selected');
            $(theElement.childNodes[i]).removeClass('Block500');
            $(theElement.childNodes[i]).removeAttr('vs-repeat');

            // var elementType = $(theElement.childNodes[i]).attr('ndType');

            // if (elementType === 'ndPrompt') {
            //     $(theElement.childNodes[i]).children().remove();
            // }

            if (theElement.childNodes[i].hasChildNodes()) { cleanElement(theElement.childNodes[i]); }
        }
    }

    function cleanAllSelected () {
        var root = document.getElementById('designArea');

        if (typeof root !== 'undefined') {
            cleanSelectedElement(root);
        }
    }

    function cleanSelectedElement (theElement) {
        for (var i = 0, len = theElement.childNodes.length; i < len; ++i) {
            $(theElement.childNodes[i]).removeClass('selected');
            if (theElement.childNodes[i].hasChildNodes()) { cleanSelectedElement(theElement.childNodes[i]); }
        }
    }

    function saveDashboard () {
        // Put all reports in loading mode...

        cleanAllSelected();

        var dashboard = $scope.selectedDashboard;

        for (var i in $scope.selectedDashboard.reports) {
            if (typeof $scope.selectedDashboard.reports[i].properties !== 'undefined') {
                if (typeof $scope.selectedDashboard.reports[i].properties.chart !== 'undefined') {
                    var theChart = clone($scope.selectedDashboard.reports[i].properties.chart);
                    theChart.chartCanvas = undefined;
                    theChart.data = undefined;
                    theChart.query = undefined;

                    // var targetChart = document.getElementById(theChart.chartID);

                    // if (targetChart != undefined)
                    $scope.selectedDashboard.reports[i].properties.chart = theChart;
                }
            }
        }

        var container = $('#designArea');

        clearPrompts();

        var theHTML = container.html();

        theHTML = theHTML.replace('vs-repeat', ' ');

        $scope.selectedDashboard.properties.designerHTML = theHTML;
        $scope.selectedDashboard.properties.rootStyle = container.attr('style');

        var previewContainer = $('#previewContainer');

        $('#previewContainer').children().remove();

        var $div = $(theHTML);
        previewContainer.append($div);
        angular.element(document).injector().invoke(function ($compile) {
            $compile($div)($scope);
        });

        cleanAll('previewContainer');

        $scope.selectedDashboard.html = previewContainer.html();

        if ($scope.mode === 'add') {
            connection.post('/api/dashboardsv2/create', dashboard).then(function (data) {
                if (data.result === 1) {

                }
            });
        } else {
            connection.post('/api/dashboardsv2/update/' + dashboard._id, dashboard).then(function (result) {
                if (result.result === 1) {

                }
            });
        }
    }

    $scope.getReport = function (reportID) {
        return $scope.selectedDashboard.reports.find(r => (r.id === reportID));
    };

    function clone (obj) {
        if (obj == null || typeof obj !== 'object') return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    $scope.deleteReport = function (reportID, reportName) {
        for (var i in $scope.selectedDashboard.reports) {
            if ($scope.selectedDashboard.reports[i].id === reportID) {
                $scope.selectedDashboard.reports.splice(i, 1);

                $('#REPORT_' + reportID).remove();
            }
        }
    };

    $scope.editReport = function (reportID, reportName) {

    };

    $scope.initPrompts = function () {
        $scope.prompts = {};

        for (var report of $scope.selectedDashboard.reports) {
            for (var filter of report.properties.filters) {
                if (filter.filterPrompt) {
                    var prompt = {};
                    for (const i in filter) {
                        prompt[i] = filter[i];
                    }
                    prompt.criterion = {};
                    $scope.prompts[prompt.id + prompt.filterType] = prompt;
                }
            }
        }

        getPromptsWidget();
    };

    function clearPrompts () {
        for (var i in $scope.prompts) {
            for (var c in $scope.prompts[i].criterion) {
                $scope.prompts[i].criterion[c] = undefined;
            }
        }
    }

    $scope.getPrompts = function () {
        return $scope.prompts && Object.values($scope.prompts);
    };

    function getPromptsWidget () {
        for (var p in $scope.prompts) {
            var thePrompt = $scope.prompts[p];

            thePrompt.promptID = p;
            var targetPrompt = document.getElementById('PROMPT_' + thePrompt.promptID);

            if (targetPrompt) {
                var html = getPromptHTML(thePrompt);
                $(targetPrompt).replaceWith(html);
                targetPrompt = document.getElementById('PROMPT_' + thePrompt.promptID);
                if ($scope.mode === 'preview') {
                    targetPrompt.removeAttribute('page-block');
                }

                angular.element(document).injector().invoke(function ($compile) {
                    const el = angular.element(targetPrompt);
                    const scope = el.scope();
                    $compile(el)(scope);
                });
            }
        }
    }

    $scope.getReportColumnDefs = function (reportID) {
        for (var i in $scope.selectedDashboard.reports) {
            if ($scope.selectedDashboard.reports[i].id === reportID) {
                return $scope.selectedDashboard.reports[i].properties.columnDefs;
            }
        }
    };

    $scope.gridGetMoreData = function (reportID) {
        for (var i in $scope.selectedDashboard.reports) {
            if ($scope.selectedDashboard.reports[i].id === reportID) {
                if (!$scope.selectedDashboard.reports[i].lastLoadedPage) { $scope.selectedDashboard.reports[i].lastLoadedPage = 2; } else { $scope.selectedDashboard.reports[i].lastLoadedPage += 1; }

                reportModel.getReportDataNextPage($scope.selectedDashboard.reports[i], $scope.selectedDashboard.reports[i].lastLoadedPage);
            }
        }
    };

    $scope.$on('element.reselected', function (e, node) {
        $scope.tabs.selected = 'settings';
    });

    function getPromptHTML (prompt) {
        var html = '<div id="PROMPT_' + prompt.promptID + '" page-block class="ndContainer" ndType="ndPrompt"><app-filter-prompt is-prompt="true" filter="prompts[\'' + prompt.promptID + '\']" on-change="promptChanged()" get-query="getQueryForFilter" ></app-filter-prompt></div>';

        return html;
    }
});
