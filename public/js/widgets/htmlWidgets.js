angular.module('app').service('htmlWidgets', function () {
    this.getJumbotronHTML = function () {
        return '<div page-block class="jumbotron" ndType="jumbotron">' +
                        '<h1 page-block  class="editable" ndType="header" contenteditable="false">  Hello, world! </h1>' +
                        '<p page-block  class="editable" contenteditable="false" ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        /* '<a page-block  class="editable btn btn-default" ndType="button"  role="button">My button</a>'+ */
                        '</div>';
    };

    this.get4colsctaHTML = function () {
        return '<div page-block class="container-fluid ndContainer" ndType="container">' +
                    '<div  page-block class="col-md-3 ndContainer" ndtype="column" >' +
                        '<h3  page-block class="editable" ndType="header" >  A header text H3 </h3>' +
                        '<p page-block class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        '<div page-block class="Block500" ndtype="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                    '<div class="col-md-3 ndContainer" ndtype="column">' +
                        '<h3 page-block  class="editable"  ndType="header" >  A header text H3 </h3>' +
                        '<p page-block  class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        '<div page-block class="Block500" ndtype="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                    '<div class="col-md-3 ndContainer" ndtype="column" >' +
                        '<h3  page-block  class="editable" ndType="header" >  A header text H3 </h3>' +
                        '<p page-block  class="editable"  ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        '<div page-block class="Block500" ndtype="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                    '<div class="col-md-3 ndContainer" ndtype="column">' +
                        '<h3  page-block  class="editable" ndType="header" >  A header text H3 </h3>' +
                        '<p page-block  class="editable"  ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        '<div page-block class="Block500" ndtype="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                '</div>';
    };

    this.get3colsctaHTML = function () {
        return '<div page-block class="container-fluid ndContainer" ndType="container">' +
                    '<div  page-block class="col-md-4 ndContainer" ndtype="column" >' +
                        '<h3  page-block class="editable" ndType="header" >  A header text H3 </h3>' +
                        '<p page-block class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        '<div page-block class="Block500" ndtype="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                    '<div class="col-md-4 ndContainer" ndtype="column">' +
                        '<h3 page-block  class="editable"  ndType="header" >  A header text H3 </h3>' +
                        '<p page-block  class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        '<div page-block class="Block500" ndtype="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                    '<div class="col-md-4 ndContainer" ndtype="column">' +
                        '<h3  page-block  class="editable" ndType="header" >  A header text H3 </h3>' +
                        '<p page-block  class="editable"  ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        '<div page-block class="Block500" ndtype="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                '</div>';
    };

    this.get2colsctaHTML = function () {
        return '<div page-block class="container-fluid ndContainer" ndType="container">' +
                    '<div  page-block class="col-md-6 ndContainer" ndtype="column" >' +
                        '<h3  page-block class="editable" ndType="header" >  A header text H3 </h3>' +
                        '<p page-block class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        '<div page-block class="Block500" ndtype="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                    '<div class="col-md-6 ndContainer" ndtype="column">' +
                        '<h3 page-block  class="editable"  ndType="header" >  A header text H3 </h3>' +
                        '<p page-block  class="editable" ndType="paragraph">This is a simple text paragraph select to edit content.</p>' +
                        '<div page-block class="Block500" ndtype="column" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                '</div>';
    };

    this.getImageTextLargeHTML = function () {
        return '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >' +
                    '<div page-block class="col-md-7 col-md-push-5 ndContainer" ndtype="column"  ndType="col" >' +
                        '<h2 page-block class="editable featurette-heading"  ndType="header" contenteditable="false">Oh yeah, it is that good. <span class="text-muted">See for yourself.</span></h2>' +
                        '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>' +
                    '</div>' +
                    '<div page-block class="col-md-5 col-md-pull-7 ndContainer" ndtype="column">' +
                        '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                '</div>';
    };

    this.getTextImageLargeHTML = function () {
        return '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >' +
                    '<div page-block class="col-md-7 ndContainer" ndtype="column"  ndType="col" >' +
                        '<h2 page-block class="editable featurette-heading"  ndType="header" contenteditable="false">Oh yeah, it is that good. <span class="text-muted">See for yourself.</span></h2>' +
                        '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>' +
                    '</div>' +
                    '<div page-block class="col-md-5 ndContainer" ndtype="column">' +
                        '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '</div>' +
                '</div>';
    };

    this.getTextLargeHTML = function () {
        return '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >' +
                    '<h2 page-block class="editable featurette-heading"  ndType="header" contenteditable="false">Oh yeah, it is that good. <span class="text-muted">See for yourself.</span></h2>' +
                    '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>' +
                    '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>' +
                    '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>' +
                '</div>';
    };

    this.getTabsHTML = function (id, tabs) {
        var theHTML = '<div page-block id="' + id + '" class="container-fluid ndContainer"  ndType="tabsContainer" >' +
                            '<div class="nav-tabs-justified ng-isolate-scope">' +
                                '<ul id="' + id + '_HEADER" class="nav nav-tabs" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}">';
        for (const t in tabs) {
            theHTML += '<li id="' + tabs[t].id + '_HEADER" heading="Home" class="ng-isolate-scope" >' +
                                        '<a id="' + tabs[t].id + '_LABEL" ng-click="selectThisTab(\'' + id + '\',\'' + tabs[t].id + '\')"  class="ng-binding">' + tabs[t].label + '</a>' +
                                    '</li>';
        }

        theHTML += '</ul>' +
                              '<div id="' + id + '_BODY" class="tab-content">';

        for (const t in tabs) {
            theHTML += '<div id="' + tabs[t].id + '_BODY" class="tab-pane Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="min-Height:150px;padding:5px;"></div>';
        }

        theHTML += '</div>' +
                                '</div>' +
                        '</div>';

        return theHTML;
    };

    this.getDivider = function () {
        return '<hr page-block class="featurette-divider" ndType="featureteDivider">';
    };

    this.getImage = function (imageURL) {
        return '<img page-block ndtype="image" class="img-responsive" src="' + imageURL + '" class="">';
    };

    this.getVideo = function () {
        var url = 'https://www.youtube.com/embed/OTsmsIeybQo';

        return '<div page-block ndtype="container" class="embed-responsive embed-responsive-16by9" >' +
            '<iframe page-block ndtype="video" class="embed-responsive-item" src="' + url + '" style="padding: 5px;"></iframe>' +
            '</div>';
    };

    this.getParagraph = function () {
        return '<p page-block ndtype="paragraph" class="editable" >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>';
    };

    this.getPageHeader = function () {
        return '<div page-block ndtype="page-header" class="page-header"><h1 page-block ndtype="heading" class="editable">Lorem Ipsum</h1><p page-block ndtype="paragraph" class="editable">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p></div>';
    };

    this.getDefinitionList = function () {
        return '<dl page-block style="padding:5px;" ndType="dl"><dt page-block class="editable" ndType="dt">Lorem ipsum</dt><dd page-block ndType="dd" class="editable">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor... </dd><dt page-block ndType="dt" class="editable">Lorem ipsum</dt><dd page-block class="editable" ndType="dd">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor...</dd></dl>';
    };

    this.getBlockQuote = function () {

    };

    this.getUnOrderedList = function () {

    };

    this.getHeading = function () {
        return '<h2 page-block ndtype="heading" class="editable">Lorem Ipsum</h2>';
    };
});
