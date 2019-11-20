angular.module('app').service('htmlWidgets', function (gettextCatalog) {
    this.getJumbotronHTML = function () {
        return '<div page-block class="jumbotron" ndType="jumbotron">' +
                        '<h1 page-block  class="editable" ndType="header" contenteditable="false">' + gettextCatalog.getString('Hello, world!') + '</h1>' +
                        '<p page-block  class="editable" contenteditable="false" ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '</div>';
    };

    this.get4colsctaHTML = function () {
        return '<div page-block class="container-fluid ndContainer" ndType="container">' +
                    '<div  page-block class="col-md-3 ndContainer" ndtype="column" >' +
                        '<h3  page-block class="editable" ndType="header" >  ' + gettextCatalog.getString('A header text H3') + ' </h3>' +
                        '<p page-block class="editable" ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '<div page-block class="Block500" ndtype="column"></div>' +
                    '</div>' +
                    '<div class="col-md-3 ndContainer" ndtype="column">' +
                        '<h3 page-block  class="editable"  ndType="header" >  ' + gettextCatalog.getString('A header text H3') + ' </h3>' +
                        '<p page-block  class="editable" ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '<div page-block class="Block500" ndtype="column"></div>' +
                    '</div>' +
                    '<div class="col-md-3 ndContainer" ndtype="column" >' +
                        '<h3  page-block  class="editable" ndType="header" >  ' + gettextCatalog.getString('A header text H3') + ' </h3>' +
                        '<p page-block  class="editable"  ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '<div page-block class="Block500" ndtype="column"></div>' +
                    '</div>' +
                    '<div class="col-md-3 ndContainer" ndtype="column">' +
                        '<h3  page-block  class="editable" ndType="header" >  ' + gettextCatalog.getString('A header text H3') + ' </h3>' +
                        '<p page-block  class="editable"  ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '<div page-block class="Block500" ndtype="column"></div>' +
                    '</div>' +
                '</div>';
    };

    this.get3colsctaHTML = function () {
        return '<div page-block class="container-fluid ndContainer" ndType="container">' +
                    '<div  page-block class="col-md-4 ndContainer" ndtype="column" >' +
                        '<h3  page-block class="editable" ndType="header" >  ' + gettextCatalog.getString('A header text H3') + ' </h3>' +
                        '<p page-block class="editable" ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '<div page-block class="Block500" ndtype="column"></div>' +
                    '</div>' +
                    '<div class="col-md-4 ndContainer" ndtype="column">' +
                        '<h3 page-block  class="editable"  ndType="header" >  ' + gettextCatalog.getString('A header text H3') + ' </h3>' +
                        '<p page-block  class="editable" ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '<div page-block class="Block500" ndtype="column"></div>' +
                    '</div>' +
                    '<div class="col-md-4 ndContainer" ndtype="column">' +
                        '<h3  page-block  class="editable" ndType="header" >  ' + gettextCatalog.getString('A header text H3') + ' </h3>' +
                        '<p page-block  class="editable"  ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '<div page-block class="Block500" ndtype="column"></div>' +
                    '</div>' +
                '</div>';
    };

    this.get2colsctaHTML = function () {
        return '<div page-block class="container-fluid ndContainer" ndType="container">' +
                    '<div  page-block class="col-md-6 ndContainer" ndtype="column" >' +
                        '<h3  page-block class="editable" ndType="header" >  ' + gettextCatalog.getString('A header text H3') + ' </h3>' +
                        '<p page-block class="editable" ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '<div page-block class="Block500" ndtype="column"></div>' +
                    '</div>' +
                    '<div class="col-md-6 ndContainer" ndtype="column">' +
                        '<h3 page-block  class="editable"  ndType="header" >  ' + gettextCatalog.getString('A header text H3') + ' </h3>' +
                        '<p page-block  class="editable" ndType="paragraph">' + gettextCatalog.getString('This is a simple text paragraph select to edit content.') + '</p>' +
                        '<div page-block class="Block500" ndtype="column"></div>' +
                    '</div>' +
                '</div>';
    };

    this.getImageTextLargeHTML = function () {
        return '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >' +
                    '<div page-block class="col-md-7 col-md-push-5 ndContainer" ndtype="column"  ndType="col" >' +
                        '<h2 page-block class="editable featurette-heading"  ndType="header" contenteditable="false">' + gettextCatalog.getString('Oh yeah, it is that good.') + ' <span class="text-muted">See for yourself.</span></h2>' +
                        '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>' +
                    '</div>' +
                    '<div page-block class="col-md-5 col-md-pull-7 ndContainer" ndtype="column">' +
                        '<div page-block class="Block500" ndType="Block500"></div>' +
                    '</div>' +
                '</div>';
    };

    this.getTextImageLargeHTML = function () {
        return '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >' +
                    '<div page-block class="col-md-7 ndContainer" ndtype="column"  ndType="col" >' +
                        '<h2 page-block class="editable featurette-heading"  ndType="header" contenteditable="false">' + gettextCatalog.getString('Oh yeah, it is that good.') + ' <span class="text-muted">See for yourself.</span></h2>' +
                        '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>' +
                    '</div>' +
                    '<div page-block class="col-md-5 ndContainer" ndtype="column">' +
                        '<div page-block class="Block500" ndType="Block500"></div>' +
                    '</div>' +
                '</div>';
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

    this.getHeading = function () {
        return '<h2 page-block ndtype="heading" class="editable">Lorem Ipsum</h2>';
    };
});
