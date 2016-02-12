var ndDesignerModule = angular.module("ndDesigner",[])


.service('ndDesignerService', function() {
    var inputHTML = '';
    var outputHTML = '';

    var setInputHTML = function(newObj) {
        inputHTML = newObj;
    }

    var getInputHTML = function(){
        return inputHTML;
    }

    var setOutputHTML = function(newObj) {
        outputHTML = newObj;
    }

    var getOutputHTML = function(){
        return outputHTML;
    }


    return {
        setInputHTML: setInputHTML,
        getInputHTML: getInputHTML,
        setOutputHTML: setOutputHTML,
        getOutputHTML: getOutputHTML,
        parameters: {},
        links: []
    };

})

.service('ndDesignerModal', ['$modal', function($modal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: "modules/designer/views/index.html",
        windowClass: "in designer_modal_window"
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    console.log('loading nddesirgner servide');

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            }
        }

        return $modal.open(tempModalDefaults).result;
    };


}])

.service('ndMediaModal', ['$modal', function($modal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'modules/designer/views/media.html',
        windowClass: "in media_modal_window"
    };


    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    console.log('loading designer Media service');

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $modalInstance) {
                $scope.mediaModalOptions = tempModalOptions;
                $scope.mediaModalOptions.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.mediaModalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            }
        }

        return $modal.open(tempModalDefaults).result;
    };


}]).service('ndURLModal', ['$modal', function($modal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'modules/designer/views/url.html',
        windowClass: "in url_modal_window"
    };


    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    console.log('loading designer URL service');

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = function ($scope, $modalInstance) {
                $scope.urlModalOptions = tempModalOptions;
                $scope.urlModalOptions.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.urlModalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            }
        }
        return $modal.open(tempModalDefaults).result;
    };


}])

.directive('ndDesigner', function($rootScope, ndDesignerService, ndDesignerModal) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            ngModel: '=',
            parameters: '=',
            links: '='
        },
        templateUrl: "modules/designer/views/ndDesigner.html",
        require: 'ngModel',
        compile: function (element, attrs) {

            return function (scope, element, attrs, controller) {
                ndDesignerService.parameters = (scope.parameters) ? scope.parameters : {
                    design: true,
                    themes: true,
                    pages: true,
                    layouts: true,
                    text: false,
                    buttons: true,
                    links: true,
                    video: true,
                    backgroundImages: false
                };
                ndDesignerService.links = (scope.links) ? scope.links : [];

                scope.$watch('ngModel', function(){
                    $(element).find('.nd-designer-content').html(scope.ngModel);
                });

                scope.sendHTMLtoEditor = function (theHTML) {
                    ndDesignerService.setInputHTML(theHTML);
                };

                scope.showDesigner = function () {
                    scope.sendHTMLtoEditor(scope.ngModel);

                    ndDesignerModal.showModal({}, {}).then(function (result) {
                        var theHTML = ndDesignerService.getOutputHTML();

                        $(element).find('.nd-designer-content').html(theHTML);

                        //scope.ngModel = theHTML;
                        controller.$modelValue = theHTML;
                        scope.ngModel = theHTML;
                    });
                }
            };
        }
    };
}).controller('nodeDreamDesignerCtrl', function ($scope,$rootScope, ndDesignerService, $compile, connection, ndURLModal, ndMediaModal) {

console.log('designer controller loaded...')
    $scope.selectedElement = null;
    $scope.editMode = false;
    $scope.editCommand = false;
    $scope.previewMode = false;

    $scope.service = ndDesignerService;

    $scope.designerSections = [
        {id: 'build', name: 'Build', template: 'modules/designer/views/sections/build.html', show: true},
        {id: 'design', name: 'Design', template: 'modules/designer/views/sections/design.html', show: $scope.service.parameters.design},
        {id: 'pages', name: 'Pages', template: 'modules/designer/views/sections/pages.html', show: $scope.service.parameters.pages}
    ];
    $scope.selectedSection = $scope.designerSections[0];
    $scope.changeSection = function(section) {
        if ($scope.selectedSection.id == 'build') ndDesignerService.setInputHTML($('#mainContainer').html());

        $scope.selectedSection = section;
    };

    $scope.checkNavbar = function(apply) {
        var navbar = false;

        if ($('#mainContainer').find('.navbar').length) {
            navbar = true;
            //console.log('navbar found');

            $('#mainContainer').find('.navbar').find('.navbar-nav').empty();

            for (var i in $scope.pages.items) {
                console.log($scope.pages.items[i]);
                $('#mainContainer').find('.navbar').find('.navbar-nav').append($('<li><a href="#">'+$scope.pages.items[i].name+'</a></li>'));
            }
        }

        for (var i in $scope.designerSections) {
            if ($scope.designerSections[i].id == 'pages') {
                if (apply) {
                    $scope.$apply(function () {
                        $scope.designerSections[i].show = ($scope.service.parameters.pages && navbar);
                    });
                }
                else {
                    $scope.designerSections[i].show = ($scope.service.parameters.pages && navbar);
                }

            }
        }
    };

    $scope.tabs = {};
    $scope.pages = {name: '', items: [], loaded: false};

    $scope.visibleXS = false;
    $scope.visibleSM = false;
    $scope.visibleMD = false;
    $scope.visibleLG = false;
    $scope.hiddenXS = false;
    $scope.hiddenSM = false;
    $scope.hiddenMD = false;
    $scope.hiddenLG = false;
    $scope.visiblePrint = false;
    $scope.hiddenPrint = false;
    $scope.isParagraph = false;
    $scope.isHeader = false;
    $scope.isButton = false;
    $scope.isRow = false;
    $scope.isColumn = false;
    $scope.isImage = false;
    $scope.isBGImage = false;
    $scope.elementsList = [];
    $scope.previewMode = false;
    $scope.viewTree = false;
    $scope.viewWidgets = true;
    $scope.viewController = false;
    $scope.isVimeo = false;
    $scope.isPhotoHeader = false;
    $scope.isCarousell = true;

    /*$scope.$watch('service.getInputHTML()', function(newVal) {

        //console.log('cargando HTML');
        loadHTMLtoEditor();
    });*/

    $scope.getHTML = function()
    {
        $scope.setPreviewMode();
       // var theHTML =  $scope.getContentHTML();
        console.log('the pages .............');
        var pagesDataValue = ($scope.pages.items.length > 0) ? JSON.stringify($scope.pages.items).replace(/"/g, '#nd-dquote#') : '';
        if ($('#previewContainer').find('#pages-data').length > 0) {
            console.log('pages found');
            $('#previewContainer').find('#pages-data').attr('value', pagesDataValue);
        }
        else {
            console.log('pages NOT found');
            var pagesElement = $('<data id="pages-data" value="'+pagesDataValue+'" />');
            $('#previewContainer').prepend(pagesElement);
        }
        var container = $('#previewContainer');
        //console.log(container.html());
        var theHTML = container.html();
        console.log('el html .............');
        //console.log(theHTML);

        ndDesignerService.setOutputHTML(theHTML);
        return theHTML;
    };


    $scope.setCanvasSlideMode = function()
    {
        //pone al mainContainer con el overload = hidden y con el tamaño por defecto por ejemplo para slides...
        //slide 1024X768
        //mobile slide...

    }


    $scope.setLink = function () {



        var linkModalOptions    = {
            closeButtonText: 'Cancel',
            actionButtonText: 'Save',
            headerText: 'Source Link',
            tracking : $scope.modalOptions.tracking,
            trackname : '['+$scope.modalOptions.container+'] '+ +$scope.modalOptions.containerName + '['+$scope.modalOptions.containerField +']['+''+']'
        }

        //no dejar meter en el trackname nada que sea incompatible con el HTML...si no meter el trackobject... y simplemente el id del track_object



        ndURLModal.showModal({}, linkModalOptions).then(function (result) {

            console.log(result);

            if ($scope.selectedElement.attr("ndType") == 'button')
            {
                $scope.selectedElement.attr("href",result);

                //si es tracked primero añadir el track_object después traer el ID del track object
                $scope.selectedElement.attr("onclick","WEELIA.trackClick('idtrackobject','idcontainer','containerType','containerField','trackname','campaignID')");

            }



        });


    };




        $scope.setMedia = function (mediaType) {



            var mediaModalOptions    = {
                closeButtonText: 'Cancel',
                actionButtonText: 'Save',
                headerText: 'Source Link',
                type : mediaType
            }

            //no dejar meter en el trackname nada que sea incompatible con el HTML...si no meter el trackobject... y simplemente el id del track_object



            ndMediaModal.showModal({}, mediaModalOptions).then(function (result) {

                //console.log(result);

                $($scope.selectedElement.children()[0].children()[0]).attr('src',result);
                //$($scope.selectedElement).append($compile('<div class="embed-responsive embed-responsive-16by9" ndType="none"> '+result+'</div>'));
                /*
                if ($scope.selectedElement.attr("ndType") == 'button')
                {
                    $scope.selectedElement.attr("href",result);

                    //si es tracked primero añadir el track_object después traer el ID del track object
                    $scope.selectedElement.attr("onclick","WEELIA.trackClick('idtrackobject','idcontainer','containerType','containerField','trackname','campaignID')");

                }
                */


            });


        }



    $scope.getCatalogImages = function()
    {
        $scope.catalogImages = [];
        for (var i = 1; i <= 100; ++i) {
            var image = {};
            var imgnbr = '';
            if (i < 10)
                imgnbr = '0'+i;
            else
                imgnbr = i;

            image.url = 'https://d28pzkwbso7p1u.cloudfront.net/catalog/images/tumbnails100/photo-'+imgnbr+'.jpg';
            image.source1400 = 'https://d28pzkwbso7p1u.cloudfront.net/catalog/images/width1400/photo-'+imgnbr+'.jpg';
            image.source700 = 'https://d28pzkwbso7p1u.cloudfront.net/catalog/images/width700/photo-'+imgnbr+'.jpg';
            $scope.catalogImages.push(image);
        }
    }

    $scope.clear = function()
    {
        //    var container = $(document.getElementById('mainContainer'));
        var container = document.getElementById('mainContainer');
        console.log('intentando borrar todo');
            //$scope.deleteAll(container);
        if (container.childNodes)
            for (var i = 0, len = container.childNodes.length; i < len; ++i) {
                $(container.childNodes[i]).remove();
            }
    }

    /*
    document.queryCommandState();
    document.queryCommandValue(); ver el valor de un elemento HTML */

    //Obtener una lista de todas las clases disponibles de los css cargados....

   /*
    var allRules = [];
    var sSheetList = document.styleSheets;
    for (var sSheet = 0; sSheet < sSheetList.length; sSheet++)
    {
        var ruleList = document.styleSheets[sSheet].cssRules;
        for (var rule = 0; rule < ruleList.length; rule ++)
        {
            allRules.push( ruleList[rule].selectorText );
        }
    }
     */


    /* float properties
     pull-left
     pull-right
     center-block

     */
    $scope.float = 'None';
    $scope.hidden = false;

    $scope.subPage='partial/nodeDreamDesigner';
    $scope.isSelected = false;

    $('input').each(function(){ $(this).blur(); });
    /*
    $("input#full-popover").ColorPickerSliders({
        placement: 'right',
        trigger: 'focus',
        hsvpanel: true,
        previewformat: 'hex',
        onchange: function(container, color) {

                if ($scope.selectedElement != null)
                {
                    console.log('estoy aqui...'+color.tiny.toHex());
                    $scope.selectedElement.css({ 'background-color': "'#"+color.tiny.toHex()+"'" }) ;
                }
        }
    });



    $("#hsvflat-fontColor").ColorPickerSliders({
        color: 'white',
        flat: true,
        sliders: true,
        swatches: true,
        hsvpanel: true,
        previewontriggerelement: false,
        title: 'Font color',
        order: {
            hsl: 1,
            cie: 2,
            preview: 3
        },
        onchange: function(container, color) {
                $scope.editCommand = true;
                document.execCommand('ForeColor', false, color.tiny.toRgbString());
                return false;

        }
    });
    */

    var hexDigits = new Array
    ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

//Function to convert hex format to a rgb color
    function rgb2hex(rgb) {
        if (rgb)
        {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }

    }

    function hex(x) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    }

    $scope.getContentHTML = function() {
        var container = $(document.getElementById('mainContainer')),$scope;
        //console.log(container.html());
        return container.html();
    }

    $scope.selected = function(selectedEl) {
     /*
        if ($scope.selectedElement != null)
        {
            console.log('quitando selected');
            $scope.selectedElement.removeClass('selected');
            $scope.selectedElement.attr("contenteditable", "false");
        }


       // var pos = $(selectedEl).position();
        var width = $(selectedEl).outerWidth();
        $scope.selectedElement = $(selectedEl);

        console.log('now is selected '+$scope.selectedElement.prop('tagName'));

        $(selectedEl).addClass('selected');

        $scope.toolbar

        $scope.isSelected = true;
        $scope.showTab(1);
        //console.log('element selected bc '+selectedElement.attr('id'));
        $scope.getElementProperties();
        //$scope.$apply(); */
    }

    $scope.getElementProperties = function(element) {
        if (element) $scope.selectedElement = element;

        $scope.selectedID = $scope.selectedElement.attr('id');
        $scope.elementType = $scope.selectedElement.attr('ndType');

        console.log('getting element properties ... type :' + $scope.elementType ); //+ JSON.stringify($scope.selectedElement));

        $scope.$apply(function () {
//Background-color
            if ($scope.selectedElement.css('background-color') != 'rgba(0, 0, 0, 0)') {
                $scope.BackgroundColor = rgb2hex($scope.selectedElement.css('background-color'));
            } else {
                $scope.BackgroundColor = 'Transparent';
            }

            if ($scope.elementType == 'image')
            {
                $scope.isImage = true;
                $scope.imageFilters = {};
                $scope.imageFilters.blur = 0;
                $scope.imageFilters.grayscale = 0;
                $scope.imageFilters.sepia = 0;
                $scope.imageFilters.brightness = 100;
                $scope.imageFilters.contrast = 100;
                $scope.imageFilters.opacity = 100;


            } else {
                $scope.isImage = false;
            }

            if ($scope.elementType == 'photoHeader')
            {
                $scope.isBGImage = true;
                $scope.imageFilters = {};
                $scope.imageFilters.blur = 0;
                $scope.imageFilters.grayscale = 0;
                $scope.imageFilters.sepia = 0;
                $scope.imageFilters.brightness = 100;
                $scope.imageFilters.contrast = 100;
                $scope.imageFilters.opacity = 100;


            } else {
                $scope.isBGImage = false;
            }

            if ($scope.elementType == 'carousell')
            {
                $scope.isCarousell = true;
                $scope.carousellSelectedSlide = 0;


            } else {
                $scope.isCarousell = false;
            }


            if ($scope.elementType == 'column')
            {
                $scope.isColumn = true;

                if  ($scope.selectedElement.hasClass('col-xs-1'))
                    $scope.xsmallColumnSize =  1
                if  ($scope.selectedElement.hasClass('col-xs-2'))
                    $scope.xsmallColumnSize =  2
                if  ($scope.selectedElement.hasClass('col-xs-3'))
                    $scope.xsmallColumnSize =  3
                if  ($scope.selectedElement.hasClass('col-xs-4'))
                    $scope.xsmallColumnSize =  4
                if  ($scope.selectedElement.hasClass('col-xs-5'))
                    $scope.xsmallColumnSize =  5
                if  ($scope.selectedElement.hasClass('col-xs-6'))
                    $scope.xsmallColumnSize =  6
                if  ($scope.selectedElement.hasClass('col-xs-7'))
                    $scope.xsmallColumnSize =  7
                if  ($scope.selectedElement.hasClass('col-xs-8'))
                    $scope.xsmallColumnSize =  8
                if  ($scope.selectedElement.hasClass('col-xs-9'))
                    $scope.xsmallColumnSize =  9
                if  ($scope.selectedElement.hasClass('col-xs-10'))
                    $scope.xsmallColumnSize =  10
                if  ($scope.selectedElement.hasClass('col-xs-11'))
                    $scope.xsmallColumnSize =  11
                if  ($scope.selectedElement.hasClass('col-xs-12'))
                    $scope.xsmallColumnSize =  12

                if  ($scope.selectedElement.hasClass('col-sm-1'))
                    $scope.smallColumnSize =  1
                if  ($scope.selectedElement.hasClass('col-sm-2'))
                    $scope.smallColumnSize =  2
                if  ($scope.selectedElement.hasClass('col-sm-3'))
                    $scope.smallColumnSize =  3
                if  ($scope.selectedElement.hasClass('col-sm-4'))
                    $scope.smallColumnSize =  4
                if  ($scope.selectedElement.hasClass('col-sm-5'))
                    $scope.smallColumnSize =  5
                if  ($scope.selectedElement.hasClass('col-sm-6'))
                    $scope.smallColumnSize =  6
                if  ($scope.selectedElement.hasClass('col-sm-7'))
                    $scope.smallColumnSize =  7
                if  ($scope.selectedElement.hasClass('col-sm-8'))
                    $scope.smallColumnSize =  8
                if  ($scope.selectedElement.hasClass('col-sm-9'))
                    $scope.smallColumnSize =  9
                if  ($scope.selectedElement.hasClass('col-sm-10'))
                    $scope.smallColumnSize =  10
                if  ($scope.selectedElement.hasClass('col-sm-11'))
                    $scope.smallColumnSize =  11
                if  ($scope.selectedElement.hasClass('col-sm-12'))
                    $scope.smallColumnSize =  12

                if  ($scope.selectedElement.hasClass('col-md-1'))
                    $scope.mediumColumnSize =  1
                if  ($scope.selectedElement.hasClass('col-md-2'))
                    $scope.mediumColumnSize =  2
                if  ($scope.selectedElement.hasClass('col-md-3'))
                    $scope.mediumColumnSize =  3
                if  ($scope.selectedElement.hasClass('col-md-4'))
                    $scope.mediumColumnSize =  4
                if  ($scope.selectedElement.hasClass('col-md-5'))
                    $scope.mediumColumnSize =  5
                if  ($scope.selectedElement.hasClass('col-md-6'))
                    $scope.mediumColumnSize =  6
                if  ($scope.selectedElement.hasClass('col-md-7'))
                    $scope.mediumColumnSize =  7
                if  ($scope.selectedElement.hasClass('col-md-8'))
                    $scope.mediumColumnSize =  8
                if  ($scope.selectedElement.hasClass('col-md-9'))
                    $scope.mediumColumnSize =  9
                if  ($scope.selectedElement.hasClass('col-md-10'))
                    $scope.mediumColumnSize =  10
                if  ($scope.selectedElement.hasClass('col-md-11'))
                    $scope.mediumColumnSize =  11
                if  ($scope.selectedElement.hasClass('col-md-12'))
                    $scope.mediumColumnSize =  12

                if  ($scope.selectedElement.hasClass('col-lg-1'))
                    $scope.largeColumnSize =  1
                if  ($scope.selectedElement.hasClass('col-lg-2'))
                    $scope.largeColumnSize =  2
                if  ($scope.selectedElement.hasClass('col-lg-3'))
                    $scope.largeColumnSize =  3
                if  ($scope.selectedElement.hasClass('col-lg-4'))
                    $scope.largeColumnSize =  4
                if  ($scope.selectedElement.hasClass('col-lg-5'))
                    $scope.largeColumnSize =  5
                if  ($scope.selectedElement.hasClass('col-lg-6'))
                    $scope.largeColumnSize =  6
                if  ($scope.selectedElement.hasClass('col-lg-7'))
                    $scope.largeColumnSize =  7
                if  ($scope.selectedElement.hasClass('col-lg-8'))
                    $scope.largeColumnSize =  8
                if  ($scope.selectedElement.hasClass('col-lg-9'))
                    $scope.largeColumnSize =  9
                if  ($scope.selectedElement.hasClass('col-lg-10'))
                    $scope.largeColumnSize =  10
                if  ($scope.selectedElement.hasClass('col-lg-11'))
                    $scope.largeColumnSize =  11
                if  ($scope.selectedElement.hasClass('col-lg-12'))
                    $scope.largeColumnSize =  12

                /* OFFSET  */
                if  ($scope.selectedElement.hasClass('col-xs-offset-1'))
                    $scope.xsmallColumnSizeOffset =  1
                if  ($scope.selectedElement.hasClass('col-xs-offset-2'))
                    $scope.xsmallColumnSizeOffset =  2
                if  ($scope.selectedElement.hasClass('col-xs-offset-3'))
                    $scope.xsmallColumnSizeOffset =  3
                if  ($scope.selectedElement.hasClass('col-xs-offset-4'))
                    $scope.xsmallColumnSizeOffset =  4
                if  ($scope.selectedElement.hasClass('col-xs-offset-5'))
                    $scope.xsmallColumnSizeOffset =  5
                if  ($scope.selectedElement.hasClass('col-xs-offset-6'))
                    $scope.xsmallColumnSizeOffset =  6
                if  ($scope.selectedElement.hasClass('col-xs-offset-7'))
                    $scope.xsmallColumnSizeOffset =  7
                if  ($scope.selectedElement.hasClass('col-xs-offset-8'))
                    $scope.xsmallColumnSizeOffset =  8
                if  ($scope.selectedElement.hasClass('col-xs-offset-9'))
                    $scope.xsmallColumnSizeOffset =  9
                if  ($scope.selectedElement.hasClass('col-xs-offset-10'))
                    $scope.xsmallColumnSizeOffset =  10
                if  ($scope.selectedElement.hasClass('col-xs-offset-11'))
                    $scope.xsmallColumnSizeOffset =  11
                if  ($scope.selectedElement.hasClass('col-xs-offset-12'))
                    $scope.xsmallColumnSizeOffset =  12

                if  ($scope.selectedElement.hasClass('col-sm-offset-1'))
                    $scope.smallColumnSizeOffset =  1
                if  ($scope.selectedElement.hasClass('col-sm-offset-2'))
                    $scope.smallColumnSizeOffset =  2
                if  ($scope.selectedElement.hasClass('col-sm-offset-3'))
                    $scope.smallColumnSizeOffset =  3
                if  ($scope.selectedElement.hasClass('col-sm-offset-4'))
                    $scope.smallColumnSizeOffset =  4
                if  ($scope.selectedElement.hasClass('col-sm-offset-5'))
                    $scope.smallColumnSizeOffset =  5
                if  ($scope.selectedElement.hasClass('col-sm-offset-6'))
                    $scope.smallColumnSizeOffset =  6
                if  ($scope.selectedElement.hasClass('col-sm-offset-7'))
                    $scope.smallColumnSizeOffset =  7
                if  ($scope.selectedElement.hasClass('col-sm-offset-8'))
                    $scope.smallColumnSizeOffset =  8
                if  ($scope.selectedElement.hasClass('col-sm-offset-9'))
                    $scope.smallColumnSizeOffset =  9
                if  ($scope.selectedElement.hasClass('col-sm-offset-10'))
                    $scope.smallColumnSizeOffset =  10
                if  ($scope.selectedElement.hasClass('col-sm-offset-11'))
                    $scope.smallColumnSizeOffset =  11
                if  ($scope.selectedElement.hasClass('col-sm-offset-12'))
                    $scope.smallColumnSizeOffset =  12

                if  ($scope.selectedElement.hasClass('col-md-offset-1'))
                    $scope.mediumColumnSizeOffset =  1
                if  ($scope.selectedElement.hasClass('col-md-offset-2'))
                    $scope.mediumColumnSizeOffset =  2
                if  ($scope.selectedElement.hasClass('col-md-offset-3'))
                    $scope.mediumColumnSizeOffset =  3
                if  ($scope.selectedElement.hasClass('col-md-offset-4'))
                    $scope.mediumColumnSizeOffset =  4
                if  ($scope.selectedElement.hasClass('col-md-offset-5'))
                    $scope.mediumColumnSizeOffset =  5
                if  ($scope.selectedElement.hasClass('col-md-offset-6'))
                    $scope.mediumColumnSizeOffset =  6
                if  ($scope.selectedElement.hasClass('col-md-offset-7'))
                    $scope.mediumColumnSizeOffset =  7
                if  ($scope.selectedElement.hasClass('col-md-offset-8'))
                    $scope.mediumColumnSizeOffset =  8
                if  ($scope.selectedElement.hasClass('col-md-offset-9'))
                    $scope.mediumColumnSizeOffset =  9
                if  ($scope.selectedElement.hasClass('col-md-offset-10'))
                    $scope.mediumColumnSizeOffset =  10
                if  ($scope.selectedElement.hasClass('col-md-offset-11'))
                    $scope.mediumColumnSizeOffset =  11
                if  ($scope.selectedElement.hasClass('col-md-offset-12'))
                    $scope.mediumColumnSizeOffset =  12

                if  ($scope.selectedElement.hasClass('col-lg-offset-1'))
                    $scope.largeColumnSizeOffset =  1
                if  ($scope.selectedElement.hasClass('col-lg-offset-2'))
                    $scope.largeColumnSizeOffset =  2
                if  ($scope.selectedElement.hasClass('col-lg-offset-3'))
                    $scope.largeColumnSizeOffset =  3
                if  ($scope.selectedElement.hasClass('col-lg-offset-4'))
                    $scope.largeColumnSizeOffset =  4
                if  ($scope.selectedElement.hasClass('col-lg-offset-5'))
                    $scope.largeColumnSizeOffset =  5
                if  ($scope.selectedElement.hasClass('col-lg-offset-6'))
                    $scope.largeColumnSizeOffset =  6
                if  ($scope.selectedElement.hasClass('col-lg-offset-7'))
                    $scope.largeColumnSizeOffset =  7
                if  ($scope.selectedElement.hasClass('col-lg-offset-8'))
                    $scope.largeColumnSizeOffset =  8
                if  ($scope.selectedElement.hasClass('col-lg-offset-9'))
                    $scope.largeColumnSizeOffset =  9
                if  ($scope.selectedElement.hasClass('col-lg-offset-10'))
                    $scope.largeColumnSizeOffset =  10
                if  ($scope.selectedElement.hasClass('col-lg-offset-11'))
                    $scope.largeColumnSizeOffset =  11
                if  ($scope.selectedElement.hasClass('col-lg-offset-12'))
                    $scope.largeColumnSizeOffset =  12


            }   else
                $scope.isColumn = false;

            if ($scope.elementType == 'row')
                $scope.isRow = true;
            else
                $scope.isRow = false;

            if ($scope.elementType == 'header')
                $scope.isHeader = true;
            else
                $scope.isHeader = false;

            if ($scope.elementType == 'button')
                $scope.isButton = true;
            else
                $scope.isButton = false;

            if ($scope.elementType == 'image')
            {
                $scope.isImage = true;
                $scope.imageSource = $scope.selectedElement.attr('src');

            } else
                $scope.isImage = false;

            if ($scope.elementType == 'vimeo')
            {
                $scope.isVimeo = true;

            } else
                $scope.isVimeo = false;

            if ($scope.elementType == 'paragraph')
            {
                $scope.isParagraph = true;
            } else
                $scope.isParagraph = false;


            if ($scope.elementType == 'photoHeader')
            {
                $scope.isPhotoHeader = true;
            } else
                $scope.isPhotoHeader = false;


            //visibility Properties
            if ($scope.selectedElement.hasClass('hidden-lg') == true )
            {
                $scope.hiddenLG = true;
            } else {
                $scope.hiddenLG = false;
            }
            if ($scope.selectedElement.hasClass('hidden-md') == true )
            {
                $scope.hiddenMD = true;
            } else {
                $scope.hiddenMD = false;
            }
            if ($scope.selectedElement.hasClass('hidden-sm') == true )
            {
                $scope.hiddenSM = true;
            } else {
                $scope.hiddenSM = false;
            }
            if ($scope.selectedElement.hasClass('hidden-xs') == true )
            {
                $scope.hiddenXS = true;
            } else {
                $scope.hiddenXS = false;
            }
            if ($scope.selectedElement.hasClass('hidden-print') == true )
            {
                $scope.hiddenPrint = true;
            } else {
                $scope.hiddenPrint = false;
            }
            //Float properties
            if ($scope.selectedElement.hasClass('pull-left') == true )
            {
                $scope.float = "Left";
            }
            if ($scope.selectedElement.hasClass('pull-right') == true )
            {
                $scope.float = "Right";
            }
            if ($scope.selectedElement.hasClass('center-block') == true )
            {
                $scope.float = "Center";
            }
            if (($scope.selectedElement.hasClass('pull-left') == false ) && ($scope.selectedElement.hasClass('pull-right') == false ) && ($scope.selectedElement.hasClass('center-block') == false ))
            {
                $scope.float = "None";
            }
        });


    }

    $scope.changeColumnSize = function(columnSize, forSize)
    {

        if (forSize == 'large')
        {
            //remove previous
            if  ($scope.selectedElement.hasClass('col-lg-1'))
                $scope.selectedElement.removeClass('col-lg-1');
            if  ($scope.selectedElement.hasClass('col-lg-2'))
                $scope.selectedElement.removeClass('col-lg-2');
            if  ($scope.selectedElement.hasClass('col-lg-3'))
                $scope.selectedElement.removeClass('col-lg-3');
            if  ($scope.selectedElement.hasClass('col-lg-4'))
                $scope.selectedElement.removeClass('col-lg-4');
            if  ($scope.selectedElement.hasClass('col-lg-5'))
                $scope.selectedElement.removeClass('col-lg-5');
            if  ($scope.selectedElement.hasClass('col-lg-6'))
                $scope.selectedElement.removeClass('col-lg-6');
            if  ($scope.selectedElement.hasClass('col-lg-7'))
                $scope.selectedElement.removeClass('col-lg-7');
            if  ($scope.selectedElement.hasClass('col-lg-8'))
                $scope.selectedElement.removeClass('col-lg-8');
            if  ($scope.selectedElement.hasClass('col-lg-9'))
                $scope.selectedElement.removeClass('col-lg-9');
            if  ($scope.selectedElement.hasClass('col-lg-10'))
                $scope.selectedElement.removeClass('col-lg-10');
            if  ($scope.selectedElement.hasClass('col-lg-11'))
                $scope.selectedElement.removeClass('col-lg-11');
            if  ($scope.selectedElement.hasClass('col-lg-12'))
                $scope.selectedElement.removeClass('col-lg-12');

            console.log('modifing col size '+ 'col-lg-'+columnSize);
            $scope.selectedElement.addClass('col-lg-'+columnSize) ;
        }


        if (forSize == 'medium')
        {
            //remove previous
            if  ($scope.selectedElement.hasClass('col-md-1'))
                $scope.selectedElement.removeClass('col-md-1');
            if  ($scope.selectedElement.hasClass('col-md-2'))
                $scope.selectedElement.removeClass('col-md-2');
            if  ($scope.selectedElement.hasClass('col-md-3'))
                $scope.selectedElement.removeClass('col-md-3');
            if  ($scope.selectedElement.hasClass('col-md-4'))
                $scope.selectedElement.removeClass('col-md-4');
            if  ($scope.selectedElement.hasClass('col-md-5'))
                $scope.selectedElement.removeClass('col-md-5');
            if  ($scope.selectedElement.hasClass('col-md-6'))
                $scope.selectedElement.removeClass('col-md-6');
            if  ($scope.selectedElement.hasClass('col-md-7'))
                $scope.selectedElement.removeClass('col-md-7');
            if  ($scope.selectedElement.hasClass('col-md-8'))
                $scope.selectedElement.removeClass('col-md-8');
            if  ($scope.selectedElement.hasClass('col-md-9'))
                $scope.selectedElement.removeClass('col-md-9');
            if  ($scope.selectedElement.hasClass('col-md-10'))
                $scope.selectedElement.removeClass('col-md-10');
            if  ($scope.selectedElement.hasClass('col-md-11'))
                $scope.selectedElement.removeClass('col-md-11');
            if  ($scope.selectedElement.hasClass('col-md-12'))
                $scope.selectedElement.removeClass('col-md-12');

            console.log('modifing col size '+ 'col-md-'+columnSize);
            $scope.selectedElement.addClass('col-md-'+columnSize) ;
        }

        if (forSize == 'small')
        {
            if  ($scope.selectedElement.hasClass('col-sm-1'))
                $scope.selectedElement.removeClass('col-sm-1');
            if  ($scope.selectedElement.hasClass('col-sm-2'))
                $scope.selectedElement.removeClass('col-sm-2');
            if  ($scope.selectedElement.hasClass('col-sm-3'))
                $scope.selectedElement.removeClass('col-sm-3');
            if  ($scope.selectedElement.hasClass('col-sm-4'))
                $scope.selectedElement.removeClass('col-sm-4');
            if  ($scope.selectedElement.hasClass('col-sm-5'))
                $scope.selectedElement.removeClass('col-sm-5');
            if  ($scope.selectedElement.hasClass('col-sm-6'))
                $scope.selectedElement.removeClass('col-sm-6');
            if  ($scope.selectedElement.hasClass('col-sm-7'))
                $scope.selectedElement.removeClass('col-sm-7');
            if  ($scope.selectedElement.hasClass('col-sm-8'))
                $scope.selectedElement.removeClass('col-sm-8');
            if  ($scope.selectedElement.hasClass('col-sm-9'))
                $scope.selectedElement.removeClass('col-sm-9');
            if  ($scope.selectedElement.hasClass('col-sm-10'))
                $scope.selectedElement.removeClass('col-sm-10');
            if  ($scope.selectedElement.hasClass('col-sm-11'))
                $scope.selectedElement.removeClass('col-sm-11');
            if  ($scope.selectedElement.hasClass('col-sm-12'))
                $scope.selectedElement.removeClass('col-sm-12');

            console.log('modifing col size '+ 'col-sm-'+columnSize);
            $scope.selectedElement.addClass('col-sm-'+columnSize) ;
        }

        if (forSize == 'xsmall')
        {
            if  ($scope.selectedElement.hasClass('col-xs-1'))
                $scope.selectedElement.removeClass('col-xs-1');
            if  ($scope.selectedElement.hasClass('col-xs-2'))
                $scope.selectedElement.removeClass('col-xs-2');
            if  ($scope.selectedElement.hasClass('col-xs-3'))
                $scope.selectedElement.removeClass('col-xs-3');
            if  ($scope.selectedElement.hasClass('col-xs-4'))
                $scope.selectedElement.removeClass('col-xs-4');
            if  ($scope.selectedElement.hasClass('col-xs-5'))
                $scope.selectedElement.removeClass('col-xs-5');
            if  ($scope.selectedElement.hasClass('col-xs-6'))
                $scope.selectedElement.removeClass('col-xs-6');
            if  ($scope.selectedElement.hasClass('col-xs-7'))
                $scope.selectedElement.removeClass('col-xs-7');
            if  ($scope.selectedElement.hasClass('col-xs-8'))
                $scope.selectedElement.removeClass('col-xs-8');
            if  ($scope.selectedElement.hasClass('col-xs-9'))
                $scope.selectedElement.removeClass('col-xs-9');
            if  ($scope.selectedElement.hasClass('col-xs-10'))
                $scope.selectedElement.removeClass('col-xs-10');
            if  ($scope.selectedElement.hasClass('col-xs-11'))
                $scope.selectedElement.removeClass('col-xs-11');
            if  ($scope.selectedElement.hasClass('col-xs-12'))
                $scope.selectedElement.removeClass('col-xs-12');

            console.log('modifing col size '+ 'col-xs-'+columnSize);
            $scope.selectedElement.addClass('col-xs-'+columnSize) ;
        }

    }

        /* OFFSET */
    $scope.changeOffsetSize = function(offsetSize, forSize)
    {
        if (forSize == 'large')
        {
            //remove previous
            if  ($scope.selectedElement.hasClass('col-lg-offset-1'))
                $scope.selectedElement.removeClass('col-lg-offset-1');
            if  ($scope.selectedElement.hasClass('col-lg-offset-2'))
                $scope.selectedElement.removeClass('col-lg-offset-2');
            if  ($scope.selectedElement.hasClass('col-lg-offset-3'))
                $scope.selectedElement.removeClass('col-lg-offset-3');
            if  ($scope.selectedElement.hasClass('col-lg-offset-4'))
                $scope.selectedElement.removeClass('col-lg-offset-4');
            if  ($scope.selectedElement.hasClass('col-lg-offset-5'))
                $scope.selectedElement.removeClass('col-lg-offset-5');
            if  ($scope.selectedElement.hasClass('col-lg-offset-6'))
                $scope.selectedElement.removeClass('col-lg-offset-6');
            if  ($scope.selectedElement.hasClass('col-lg-offset-7'))
                $scope.selectedElement.removeClass('col-lg-offset-7');
            if  ($scope.selectedElement.hasClass('col-lg-offset-8'))
                $scope.selectedElement.removeClass('col-lg-offset-8');
            if  ($scope.selectedElement.hasClass('col-lg-offset-9'))
                $scope.selectedElement.removeClass('col-lg-offset-9');
            if  ($scope.selectedElement.hasClass('col-lg-offset-10'))
                $scope.selectedElement.removeClass('col-lg-offset-10');
            if  ($scope.selectedElement.hasClass('col-lg-offset-11'))
                $scope.selectedElement.removeClass('col-lg-offset-11');
            if  ($scope.selectedElement.hasClass('col-lg-offset-12'))
                $scope.selectedElement.removeClass('col-lg-offset-12');

            console.log('modifing col size '+ 'col-lg-offset-'+offsetSize);
            $scope.selectedElement.addClass('col-lg-offset-'+offsetSize) ;
        }


        if (forSize == 'medium')
        {
            //remove previous
            if  ($scope.selectedElement.hasClass('col-md-offset-1'))
                $scope.selectedElement.removeClass('col-md-offset-1');
            if  ($scope.selectedElement.hasClass('col-md-offset-2'))
                $scope.selectedElement.removeClass('col-md-offset-2');
            if  ($scope.selectedElement.hasClass('col-md-offset-3'))
                $scope.selectedElement.removeClass('col-md-offset-3');
            if  ($scope.selectedElement.hasClass('col-md-offset-4'))
                $scope.selectedElement.removeClass('col-md-offset-4');
            if  ($scope.selectedElement.hasClass('col-md-offset-5'))
                $scope.selectedElement.removeClass('col-md-offset-5');
            if  ($scope.selectedElement.hasClass('col-md-offset-6'))
                $scope.selectedElement.removeClass('col-md-offset-6');
            if  ($scope.selectedElement.hasClass('col-md-offset-7'))
                $scope.selectedElement.removeClass('col-md-offset-7');
            if  ($scope.selectedElement.hasClass('col-md-offset-8'))
                $scope.selectedElement.removeClass('col-md-offset-8');
            if  ($scope.selectedElement.hasClass('col-md-offset-9'))
                $scope.selectedElement.removeClass('col-md-offset-9');
            if  ($scope.selectedElement.hasClass('col-md-offset-10'))
                $scope.selectedElement.removeClass('col-md-offset-10');
            if  ($scope.selectedElement.hasClass('col-md-offset-11'))
                $scope.selectedElement.removeClass('col-md-offset-11');
            if  ($scope.selectedElement.hasClass('col-md-offset-12'))
                $scope.selectedElement.removeClass('col-md-offset-12');

            console.log('modifing col size '+ 'col-md-offset-'+offsetSize);
            $scope.selectedElement.addClass('col-md-offset-'+offsetSize) ;
        }

        if (forSize == 'small')
        {
            if  ($scope.selectedElement.hasClass('col-sm-offset-1'))
                $scope.selectedElement.removeClass('col-sm-offset-1');
            if  ($scope.selectedElement.hasClass('col-sm-offset-2'))
                $scope.selectedElement.removeClass('col-sm-offset-2');
            if  ($scope.selectedElement.hasClass('col-sm-offset-3'))
                $scope.selectedElement.removeClass('col-sm-offset-3');
            if  ($scope.selectedElement.hasClass('col-sm-offset-4'))
                $scope.selectedElement.removeClass('col-sm-offset-4');
            if  ($scope.selectedElement.hasClass('col-sm-offset-5'))
                $scope.selectedElement.removeClass('col-sm-offset-5');
            if  ($scope.selectedElement.hasClass('col-sm-offset-6'))
                $scope.selectedElement.removeClass('col-sm-offset-6');
            if  ($scope.selectedElement.hasClass('col-sm-offset-7'))
                $scope.selectedElement.removeClass('col-sm-offset-7');
            if  ($scope.selectedElement.hasClass('col-sm-offset-8'))
                $scope.selectedElement.removeClass('col-sm-offset-8');
            if  ($scope.selectedElement.hasClass('col-sm-offset-9'))
                $scope.selectedElement.removeClass('col-sm-offset-9');
            if  ($scope.selectedElement.hasClass('col-sm-offset-10'))
                $scope.selectedElement.removeClass('col-sm-offset-10');
            if  ($scope.selectedElement.hasClass('col-sm-offset-11'))
                $scope.selectedElement.removeClass('col-sm-offset-11');
            if  ($scope.selectedElement.hasClass('col-sm-offset-12'))
                $scope.selectedElement.removeClass('col-sm-offset-12');

            console.log('modifing col size '+ 'col-sm-offset-'+offsetSize);
            $scope.selectedElement.addClass('col-sm-offset-'+offsetSize) ;
        }

        if (forSize == 'xsmall')
        {
            if  ($scope.selectedElement.hasClass('col-xs-offset-1'))
                $scope.selectedElement.removeClass('col-xs-offset-1');
            if  ($scope.selectedElement.hasClass('col-xs-offset-2'))
                $scope.selectedElement.removeClass('col-xs-offset-2');
            if  ($scope.selectedElement.hasClass('col-xs-offset-3'))
                $scope.selectedElement.removeClass('col-xs-offset-3');
            if  ($scope.selectedElement.hasClass('col-xs-offset-4'))
                $scope.selectedElement.removeClass('col-xs-offset-4');
            if  ($scope.selectedElement.hasClass('col-xs-offset-5'))
                $scope.selectedElement.removeClass('col-xs-offset-5');
            if  ($scope.selectedElement.hasClass('col-xs-offset-6'))
                $scope.selectedElement.removeClass('col-xs-offset-6');
            if  ($scope.selectedElement.hasClass('col-xs-offset-7'))
                $scope.selectedElement.removeClass('col-xs-offset-7');
            if  ($scope.selectedElement.hasClass('col-xs-offset-8'))
                $scope.selectedElement.removeClass('col-xs-offset-8');
            if  ($scope.selectedElement.hasClass('col-xs-offset-9'))
                $scope.selectedElement.removeClass('col-xs-offset-9');
            if  ($scope.selectedElement.hasClass('col-xs-offset-10'))
                $scope.selectedElement.removeClass('col-xs-offset-10');
            if  ($scope.selectedElement.hasClass('col-xs-offset-11'))
                $scope.selectedElement.removeClass('col-xs-offset-11');
            if  ($scope.selectedElement.hasClass('col-xs-offset-12'))
                $scope.selectedElement.removeClass('col-xs-offset-12');

            console.log('modifing col size '+ 'col-xs-offset-'+offsetSize);
            $scope.selectedElement.addClass('col-xs-offset-'+offsetSize) ;
        }


    }

    $scope.setSidebarView = function(view) {

        if (view == '1')
        {
            $scope.viewTree = false;
            $scope.viewWidgets = true;
            $scope.viewController = false;

        }

        if (view == '2')
        {
            $scope.viewTree = false;
            $scope.viewWidgets = false;
            $scope.viewController = true;

        }

        if (view == '3')
        {
            $scope.viewTree = true;
            $scope.viewWidgets = false;
            $scope.viewController = false;

        }


    }

    $scope.deleteSelected = function() {
        $scope.selectedElement.remove();
        $scope.isSelected = false;
        $scope.getAllElements();
    }

    $scope.changeHidden = function() {
        if ($scope.hidden == true)
        {
            $scope.selectedElement.addClass('hidden');
        } else {
            $scope.selectedElement.removeClass('hidden');
        }
    }

    $scope.changeFloat = function() {
        console.log('Change Float');
        if ($scope.float == 'None')
        {
            $scope.selectedElement.removeClass('pull-left');
            $scope.selectedElement.removeClass('pull-right');
            $scope.selectedElement.removeClass('center-block');
        }
        if ($scope.float == 'Left')
        {
            $scope.selectedElement.addClass('pull-left');
        } else {
            $scope.selectedElement.removeClass('pull-left');
        }
        if ($scope.float == 'Right')
        {
            $scope.selectedElement.addClass('pull-right');
        } else {
            $scope.selectedElement.removeClass('pull-right');
        }
        if ($scope.float == 'Center')
        {
            $scope.selectedElement.addClass('center-block');
        } else {
            $scope.selectedElement.removeClass('center-block');
        }
    }

    $scope.changeVisibility = function() {


    console.log('Change visibility')
    //visibility properties
    if ($scope.visibleXS == true)
        {
            $scope.selectedElement.addClass('visible-xs');
        } else {
        $scope.selectedElement.removeClass('visible-xs');
        }

    if ($scope.visibleSM == true)
        {
            $scope.selectedElement.addClass('visible-sm');
        } else {
        $scope.selectedElement.removeClass('visible-sm');
        }
    if ($scope.visibleMD == true)
        {
            $scope.selectedElement.addClass('visible-md');
        } else {
        $scope.selectedElement.removeClass('visible-md');
        }
    if ($scope.visibleLG == true)
        {
            $scope.selectedElement.addClass('visible-lg');
        } else {
        $scope.selectedElement.removeClass('visible-lg');
        }
    if ($scope.visiblePrint == true)
        {
            $scope.selectedElement.addClass('visible-print');
        } else {
        $scope.selectedElement.removeClass('visible-print');
        }

        if ($scope.hiddenXS == true)
        {
            $scope.selectedElement.addClass('hidden-xs');
        } else {
            $scope.selectedElement.removeClass('hidden-xs');
        }

        if ($scope.hiddenSM == true)
        {
            $scope.selectedElement.addClass('hidden-sm');
        } else {
            $scope.selectedElement.removeClass('hidden-sm');
        }
        if ($scope.hiddenMD == true)
        {
            $scope.selectedElement.addClass('hidden-md');
        } else {
            $scope.selectedElement.removeClass('hidden-md');
        }
        if ($scope.hiddenLG == true)
        {
            $scope.selectedElement.addClass('hidden-lg');
        } else {
            $scope.selectedElement.removeClass('hidden-lg');
        }
        if ($scope.hiddenPrint == true)
        {
            $scope.selectedElement.addClass('hidden-print');
        } else {
            $scope.selectedElement.removeClass('hidden-print');
        }
    }


    /*$scope.testOnDrop = function (data, event, page) {
        var questionType = data['json/custom-object'];

        console.log(questionType);

        var element = $('<div class="jumbotron" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-drop="dropped(dragEl, dropEl)">  <h1 x-lvl-draggable="true" x-lvl-drop-target="true" x-on-drop="dropped(dragEl, dropEl)">Hello, world!</h1>     <p x-lvl-draggable="true" x-lvl-drop-target="true" x-on-drop="dropped(dragEl, dropEl)">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>     <p><a class="btn btn-primary btn-lg" role="button">Learn more</a></p>   </div>');

        $('#mainContainer').append(element);

    };*/
    $scope.dropped = function(dragEl, dropEl) {
        //this is application logic, for the demo we just want to color the grid squares
        //the directive provides a native dom object, wrap with jqlite

        console.log('entering');
        var drop = $(dropEl);
        var drag = $(dragEl);



        /*var dropType = drag.attr("data-color");
        console.log(dropType);


        //var jumbotronTemplate = '<node-dream-jumbotron> </node-dream-jumbotron>';
        if (dropType == 'jumbotron')
        {
            console.log('is a jumbotron');
            var jumbotronTemplate = $compile('<div class="jumbotron" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-drop="dropped(dragEl, dropEl)">  <h1 x-lvl-draggable="true" x-lvl-drop-target="true" x-on-drop="dropped(dragEl, dropEl)">Hello, world!</h1>     <p x-lvl-draggable="true" x-lvl-drop-target="true" x-on-drop="dropped(dragEl, dropEl)">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>     <p><a class="btn btn-primary btn-lg" role="button">Learn more</a></p>   </div>')($scope);

            drop.before(jumbotronTemplate);
        }
        if (dropType == 'well')
        {
            console.log('is a well');
            var wellTemplate = $compile('<div class="well" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-drop="dropped(dragEl, dropEl)">...</div>')($scope);
            drop.before(wellTemplate);
        }
        if (dropType == undefined)
        {
            console.log('is a p');
            drop.before(drag);
        }*/



        /*
        //clear the previously applied color, if it exists
        var bgClass = drop.attr('data-color');
        if (bgClass) {
            drop.removeClass(bgClass);
        }

        //add the dragged color
        bgClass = drag.attr("data-color");
        drop.addClass(bgClass);
        drop.attr('data-color', bgClass);

        //if element has been dragged from the grid, clear dragged color
        if (drag.attr("x-lvl-drop-target")) {
            drag.removeClass(bgClass);
        }

        console.log('dropper object');
        */
    }

    $scope.setBoldSelection = function() {
        $scope.editCommand = true;
        //console.log(window.getSelection());
        document.execCommand('bold', false, null);
        return false;
    }

    $scope.setItalicSelection = function() {
        $scope.editCommand = true;
        document.execCommand('italic', false, null);
        return false;
    }

    $scope.setCommandLink = function() {
        $scope.editCommand = true;
        document.execCommand("CreateLink", false, "mailto:someone@example.com");
        return false;
    }



   /*
    $scope.setJustifyLeftSelection = function() {
        $scope.editCommand = true;
        document.execCommand('justifyLeft', false, null);
        return false;
    }

    $scope.setJustifyRightSelection = function() {
        $scope.editCommand = true;
        document.execCommand('justifyRight', false, null);
        return false;
    }

    $scope.setStyleRemoveFormatSelection = function() {
        $scope.editCommand = true;
        document.execCommand('justifyCenter', false, null);
        return false;
    }*/

    $scope.setStyleJustifyCenterSelection = function() {
            $scope.selectedElement.css("text-align","center");
    }
    $scope.setStyleJustifyRightSelection = function() {
            $scope.selectedElement.css("text-align","right");
    }
    $scope.setStyleJustifyLeftSelection = function() {
            $scope.selectedElement.css("text-align","left");
    }
    $scope.setStyleRemoveFormatSelection = function() {
            $scope.selectedElement.css("text-align","");
    }

    $scope.changeImageFilter = function() {


        if ($scope.isImage == true)
           var theElement = $scope.selectedElement;
        if ($scope.isBGImage == true)
           var theElement = $($scope.selectedElement.children()[0]);

        var styleValue = '';

        if ($scope.imageFilters.blur != 0)
            styleValue =  " blur("+$scope.imageFilters.blur+"px) ";
        if ($scope.imageFilters.grayscale != 0)
            styleValue = styleValue + " grayscale("+$scope.imageFilters.grayscale+"%) ";
        if ($scope.imageFilters.sepia != 0)
            styleValue = styleValue + " sepia("+$scope.imageFilters.sepia+"%) ";
        if ($scope.imageFilters.brightness != 0)
            styleValue = styleValue + " brightness("+$scope.imageFilters.brightness+"%) ";
        if ($scope.imageFilters.contrast != 0)
            styleValue = styleValue + " contrast("+$scope.imageFilters.contrast+"%) ";
        if ($scope.imageFilters.opacity != 0)
            styleValue = styleValue + " opacity("+$scope.imageFilters.opacity+"%) ";


        theElement.css("filter",styleValue);
        theElement.css("webkitFilter",styleValue);
        theElement.css("mozFilter",styleValue);
        theElement.css("oFilter",styleValue);
        theElement.css("msFilter",styleValue);

    }
      /*
        -webkit-filter: blur(5px);
        -moz-filter: blur(5px);
        -o-filter: blur(5px);
        -ms-filter: blur(5px);
        filter: blur(5px);"
        */


    $scope.setUnderlineSelection = function() {
        $scope.editCommand = true;
        document.execCommand('underline', false, null);
        return false;
    }

    $scope.setRemoveFormatSelection = function() {
        $scope.editCommand = true;
        document.execCommand('removeFormat', false, null);
        return false;
    }

    $scope.setInsertOrderedListSelection = function() {
        $scope.editCommand = true;
        document.execCommand('insertOrderedList', false, null);
        return false;
    }

    $scope.setInsertUnorderedListSelection = function() {
        $scope.editCommand = true;
        document.execCommand('insertUnorderedList', false, null);
        return false;
    }

    $scope.setFonColorSelection = function() {
        $scope.editCommand = true;
        document.execCommand('ForeColor', false, $scope.fontColor);
        return false;
    }

    $scope.changeHeaderSize0 = function(headerSize) {

        if (headerSize == 1)
            newType = 'h1';
        if (headerSize == 2)
            newType = 'h2';
        if (headerSize == 3)
            newType = 'h3';
        if (headerSize == 4)
            newType = 'h4';
        if (headerSize == 5)
            newType = 'h5';
        contents = $scope.selectedElement.contents();
        //attributes = $scope.selectedElement.attributes();
        console.log('change headerr size '+contents);

        var myElement = $('<'+newType+' id="'+$scope.selectedElement.attr("id")+'" class="editable lvlelement selected" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="true"></'+newType+'>').append(contents);

        //var myElement = $("<"+newType+"></"+newType+">").append(contents);
        var attrs = {};
        /*
        for (var i = 0, len = $scope.selectedElement.attr.length; i < len; ++i) {

            attrs[$scope.selectedElement.attr[i].nodeName] = $scope.selectedElement.attr[i].nodeValue;
        };*/
       /*
        angular.forEach($scope.selectedElement[0].attributes, function(idx, attr) {
            console.log('otro' + attr.nodeName);
            attrs[attr.nodeName] = attr.nodeValue;
        });

        $scope.selectedElement.replaceWith(function() {
            return $("<" + newType + "/>", attrs).append(contents);
        });
        */


         var original =  $scope.selectedElement.replaceWith(function(){return myElement});

        myElement
            .click(function()
            {
                myElement.replaceWith(original);
                original.click(replace);
            });

        binding( $scope.selectedElement);


        //$scope.selectedElement.append(contents);

       /*
        $scope.selectedElement.each($scope.selectedElement[0].attributes, function(idx, attr) {
            attrs[attr.nodeName] = attr.nodeValue;
        });

        $scope.selectedElement.replaceWith(function() {
            return $("<" + newType + "/>", attrs).append($($scope.selectedElement).contents());
        });
        */
    }

    $scope.setHSelection = function(headerSize)
    {
        if (headerSize == 1)
            newType = 'h1';
        if (headerSize == 2)
            newType = 'h2';
        if (headerSize == 3)
            newType = 'h3';
        if (headerSize == 4)
            newType = 'h4';
        if (headerSize == 5)
            newType = 'h5';
        document.execCommand('formatBlock', false, '<'+newType+'>');
        return false;
    }

    $scope.setView = function (type) {
        console.log('set view');
           if (type == 1) //mobile
            $("#mainContainer").width("25%");
        if (type == 2) //tablet
            $("#mainContainer").width("50%");
        if (type == 3) //laptop
            $("#mainContainer").css('width', 'auto');
        if (type == 4) //desktop
            $("#mainContainer").css('width', 'auto');
    }



    $scope.changeButtonSize = function (buttonSize) {
        $scope.selectedElement.removeClass('btn-lg');
        $scope.selectedElement.removeClass('btn-sm');
        $scope.selectedElement.removeClass('btn-xs');
            if (buttonSize == 'Large')
                {
               $scope.selectedElement.addClass('btn-lg');
                }
            if (buttonSize == 'Small')
                {
                $scope.selectedElement.addClass('btn-sm');
                }
            if (buttonSize == 'Xtra small')
                {
                $scope.selectedElement.addClass('btn-xs');
                }
    }

    $scope.changeButtonType = function (buttonType) {
        $scope.selectedElement.removeClass('btn-default');
        $scope.selectedElement.removeClass('btn-primary');
        $scope.selectedElement.removeClass('btn-info');
        $scope.selectedElement.removeClass('btn-success');
        $scope.selectedElement.removeClass('btn-warning');
        $scope.selectedElement.removeClass('btn-danger');
        $scope.selectedElement.removeClass('btn-link');
        if (buttonType == 'Default')
        {
            $scope.selectedElement.addClass('btn-default');
        }
        if (buttonType == 'Primary')
        {
            $scope.selectedElement.addClass('btn-primary');
        }
        if (buttonType == 'Info')
        {
            $scope.selectedElement.addClass('btn-info');
        }
        if (buttonType == 'Success')
        {
            $scope.selectedElement.addClass('btn-success');
        }
        if (buttonType == 'Warning')
        {
            $scope.selectedElement.addClass('btn-warning');
        }
        if (buttonType == 'Danger')
        {
            $scope.selectedElement.addClass('btn-danger');
        }
        if (buttonType == 'Link')
        {
            $scope.selectedElement.addClass('btn-link');
        }
    }




    $scope.saveSelection = function () {
        if (window.getSelection) {
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                var ranges = [];
                for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                    ranges.push(sel.getRangeAt(i));
                }
                return ranges;
            }
        } else if (document.selection && document.selection.createRange) {
            return document.selection.createRange();
        }
        return null;
    }

    $scope.restoreSelection = function (savedSel) {
        if (savedSel) {
            if (window.getSelection) {
                sel = window.getSelection();
                sel.removeAllRanges();
                for (var i = 0, len = savedSel.length; i < len; ++i) {
                    sel.addRange(savedSel[i]);
                }
            } else if (document.selection && savedSel.select) {
                savedSel.select();
            }
        }
    }

    $scope.getElement = function (theElement) {

        var theElementList = [];

        for (var i = 0, len = theElement.childNodes.length; i < len; ++i) {

            var type = $(theElement.childNodes[i]).attr('ndType');

            var element = {} ;

            element.type = $(theElement.childNodes[i]).attr('ndType');
            element.id = $(theElement.childNodes[i]).attr('id');
            element.parentId = $(theElement).attr('id');

            if (theElement.childNodes[i].hasChildNodes() == true)
                    element.children = $scope.getElement(theElement.childNodes[i]);

            if (type != undefined)
            {
                theElementList.push(element);
                //console.log('Find: '+element.type);
            }
        }
        return theElementList;
    }



    $scope.getAllElements = function () {
        $scope.checkNavbar(true);
        //var root = $('mainContainer');
        var root = document.getElementById('mainContainer');
        //console.log($(root).attr('id'));
        if (root != undefined)
        {
            $scope.elementsList = $scope.getElement(root);
            //console.log(JSON.stringify($scope.elementsList));
            //$scope.$apply();

            return $scope.elementsList;
        }
    };



    $scope.$watch( 'mytree.currentNode', function( newObj, oldObj ) {
        if( $scope.mytree && angular.isObject($scope.mytree.currentNode) ) {
            //console.log( 'Node Selected!!' );
            //console.log( $scope.mytree.currentNode );
            var element = document.getElementById($scope.mytree.currentNode.id);
            $(element).click();
        }
    }, false);

    $scope.setPreviewMode = function() {

        if ($scope.previewMode == true)
        {
            $scope.previewMode = false;
        } else {
            $scope.previewMode = true;
        }

        if ($scope.htmlMode) {
            $scope.viewHTML();
        }

        if ($scope.previewMode == true)
        {

            //clean up the preview
            var root = document.getElementById('previewContainer');
            var source = document.getElementById('mainContainer');
            if (root != undefined)
                {
                    $scope.deleteAll(root);
                    $(root).children().remove();
                    //console.log('remove all');
                }


            for (var i = 0, len = source.childNodes.length; i < len; ++i) {
                $(source.childNodes[i]).clone().appendTo(root );


            }

            $scope.cleanAll();
        }

    }


    $scope.cleanAll = function () {
        //var root = $('mainContainer');
        var root = document.getElementById('previewContainer');

        if (root != undefined)
        {
            $scope.cleanElement(root);

        }
    }

    $scope.cleanElement = function (theElement) {

        for (var i = 0, len = theElement.childNodes.length; i < len; ++i) {
            //$(theElement.childNodes[i]).removeAttr('ndType');
            $(theElement.childNodes[i]).removeAttr('x-lvl-draggable');
            $(theElement.childNodes[i]).removeAttr('x-lvl-drop-target');
            $(theElement.childNodes[i]).removeAttr('x-on-select');
            $(theElement.childNodes[i]).removeAttr('contenteditable');
            $(theElement.childNodes[i]).removeAttr('draggable');
            $(theElement.childNodes[i]).removeAttr('lvldraggable');
            $(theElement.childNodes[i]).removeAttr('lvldroptarget');
            $(theElement.childNodes[i]).removeClass('selected');
            $(theElement.childNodes[i]).removeClass('lvl-element');
            $(theElement.childNodes[i]).removeClass('ng-scope');
            $(theElement.childNodes[i]).removeClass('ndContainer');
            $(theElement.childNodes[i]).removeClass('selectedImage');
            $(theElement.childNodes[i]).removeClass('lvl-target');
            $(theElement.childNodes[i]).removeClass('draggingOver');

            if (theElement.childNodes[i].hasChildNodes() == true)
                   $scope.cleanElement(theElement.childNodes[i]);
        }
    }

        $scope.cleanAllLvlElement = function (actualElement) {

            var root = document.getElementById('mainContainer');

            if (root != undefined)
            {
                $scope.cleanLvlElement(root,actualElement);

            }
        }

        $scope.cleanLvlElement = function (theElement,actualElement) {

            for (var i = 0, len = theElement.childNodes.length; i < len; ++i) {
                    $(theElement.childNodes[i]).removeClass('lvl-element');

                if (theElement.childNodes[i].hasChildNodes() == true)
                    $scope.cleanLvlElement(theElement.childNodes[i]);
            }
        }



    $scope.deleteAll = function(parentElement) {
        for (var i = 0, len = parentElement.childNodes.length; i < len; ++i) {
            $(parentElement.childNodes[i]).remove();
        }
    }

    /*$scope.showTab = function(tab) {


        if (tab == 1)
        {
            //console.log('the tab 1');
            $scope.showResultsSearch = true;
            $scope.showResultsLayout = false;
            $scope.showResultsText = false;
            $scope.showResultsBackground = false;
            $scope.showResultsUpload = false;
            var theElement = document.getElementById('searchTabButton');
            $(theElement).addClass('on');
            var theElement = document.getElementById('layoutTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('textTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('backgroundsTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('uploadsTabButton');
            $(theElement).removeClass('on');

            var theElement = document.getElementById('objectPanel');
            $(theElement).removeClass('stage1');
            $(theElement).removeClass('stage2');
            $(theElement).removeClass('stage3');
            $(theElement).removeClass('stage4');
            $(theElement).removeClass('stage5');
            $(theElement).addClass('stage1');
        }
        if (tab == 2)
        {
            $scope.showResultsSearch = false;
            $scope.showResultsLayout = true;
            $scope.showResultsText = false;
            $scope.showResultsBackground = false;
            $scope.showResultsUpload = false;
            var theElement = document.getElementById('searchTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('layoutTabButton');
            $(theElement).addClass('on');
            var theElement = document.getElementById('textTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('backgroundsTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('uploadsTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('objectPanel');
            $(theElement).removeClass('stage1');
            $(theElement).removeClass('stage2');
            $(theElement).removeClass('stage3');
            $(theElement).removeClass('stage4');
            $(theElement).removeClass('stage5');
            $(theElement).addClass('stage2');
        }
        if (tab == 3)
        {
            $scope.showResultsSearch = false;
            $scope.showResultsLayout = false;
            $scope.showResultsText = true;
            $scope.showResultsBackground = false;
            $scope.showResultsUpload = false;
            var theElement = document.getElementById('searchTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('layoutTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('textTabButton');
            $(theElement).addClass('on');
            var theElement = document.getElementById('backgroundsTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('uploadsTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('objectPanel');
            $(theElement).removeClass('stage1');
            $(theElement).removeClass('stage2');
            $(theElement).removeClass('stage3');
            $(theElement).removeClass('stage4');
            $(theElement).removeClass('stage5');
            $(theElement).addClass('stage3');
        }
        if (tab == 4)
        {
            $scope.showResultsSearch = false;
            $scope.showResultsLayout = false;
            $scope.showResultsText = false;
            $scope.showResultsBackground = true;
            $scope.showResultsUpload = false;
            var theElement = document.getElementById('searchTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('layoutTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('textTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('backgroundsTabButton');
            $(theElement).addClass('on');
            var theElement = document.getElementById('uploadsTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('objectPanel');
            $(theElement).removeClass('stage1');
            $(theElement).removeClass('stage2');
            $(theElement).removeClass('stage3');
            $(theElement).removeClass('stage4');
            $(theElement).removeClass('stage5');
            $(theElement).addClass('stage4');
        }
        if (tab == 5)
        {
            $scope.showResultsSearch = false;
            $scope.showResultsLayout = false;
            $scope.showResultsText = false;
            $scope.showResultsBackground = false;
            $scope.showResultsUpload = true;
            var theElement = document.getElementById('searchTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('layoutTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('textTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('backgroundsTabButton');
            $(theElement).removeClass('on');
            var theElement = document.getElementById('uploadsTabButton');
            $(theElement).addClass('on');
            var theElement = document.getElementById('objectPanel');
            $(theElement).removeClass('stage1');
            $(theElement).removeClass('stage2');
            $(theElement).removeClass('stage3');
            $(theElement).removeClass('stage4');
            $(theElement).removeClass('stage5');
            $(theElement).addClass('stage5');
        }

    }*/

    $scope.loadHTML = function (theHTML)
    {
        console.log('loading HTML');
        theTemplate = $compile(theHTML)(scope);
        var el = $('mainContainer');
        el.append(theTemplate);
    }

    $scope.prepareHTML = function ()
    {
    var theElement = $(document.getElementById('mainContainer')),$scope;


    for (var i = 0, len = theElement.childNodes.length; i < len; ++i) {
        $(theElement.childNodes[i]).addAttribute("contenteditable", "false");
        $(theElement.childNodes[i]).addClass('selected');
        /*$(theElement.childNodes[i]).removeAttr('x-lvl-draggable');
         $(theElement.childNodes[i]).removeAttr('x-lvl-drop-target');
         $(theElement.childNodes[i]).removeAttr('x-on-select');
         $(theElement.childNodes[i]).removeAttr('contenteditable');
         $(theElement.childNodes[i]).removeAttr('draggable');
         $(theElement.childNodes[i]).removeAttr('ndType');

         if (theElement.childNodes[i].hasChildNodes() == true)
         $scope.cleanElement(theElement.childNodes[i]); */
    }
    }

        $scope.loadHTMLtoEditor = function() {
            loadHTMLtoEditor();
        };


    function loadHTMLtoEditor() {
        var theHTML = ndDesignerService.getInputHTML();

        console.log('cargando HTML');
        //$('#mainContainer').html(theHTML);
        /*var theElement = $(document.getElementById('mainContainer'));


        theTemplate = $compile(theHTML)($scope);


        //$(theTemplate).clone().appendTo(theElement );

        theElement.append(theTemplate);*/

        //console.log(theElement);

        $('#mainContainer').html(theHTML);

        setEditorAttributes($('#mainContainer'));

        console.log('loading pages...');

        if ($('#mainContainer').find('#pages-data').length > 0 && !$scope.pages.loaded) {
            console.log('pages found');
            var pagesData = $('#pages-data').attr('value');
            //console.log(pagesData);
            if (pagesData.length > 0) $scope.pages.items = JSON.parse($('#pages-data').attr('value').replace(/#nd-dquote#/g, '"'));
            //console.log($scope.pages);
            $scope.pages.loaded = true;
        }

        $scope.checkNavbar();
    }

    function setEditorAttributes(theElement)
    {

        for (var i = 0, len = theElement.children().length; i < len; ++i) {

            var thisElement =  $(theElement.children()[i]);
            var thisType = thisElement.prop('tagName');

            console.log(thisType);

            if (thisType == 'P')
            {
                thisElement.attr("contenteditable", "false");
                thisElement.attr("ndType", "paragraph");
                thisElement.addClass('editable');

            }
            if (thisType == 'H1' || thisType == 'H2' || thisType == 'H3' || thisType == 'H4' || thisType == 'H5' || thisType == 'H6')
            {
                thisElement.attr("contenteditable", "false");
                thisElement.attr("ndType", "header");
                thisElement.addClass('editable');
            }

            if (thisType == 'a')
            {
                thisElement.attr("ndType", "button");
                thisElement.addClass('editable');
                thisElement.attr("contenteditable", "false");
            }

            if (thisType = 'DIV')
            {
                setColumnType(thisElement);
            }

            //thisElement.addClass('selected');

            if (thisElement.attr("ndType") != 'none')
                if (thisType == 'a' || thisType == 'P' || thisType == 'DIV' || thisType == 'H1' || thisType == 'H2' || thisType == 'H3' || thisType == 'H4' || thisType == 'H5' || thisType == 'H6' || thisType == 'HR' || thisType == 'SECTION')
                {
                    thisElement.attr('x-lvl-draggable','false');
                    thisElement.attr('x-lvl-drop-target','true');
                    //thisElement.attr('x-on-select', 'selected(selectedEL)');
                    //thisElement.attr('draggable', 'true');
                    //thisElement.attr('lvlDraggable','lvlDraggable');
                    //thisElement.attr('lvlDropTarget','lvlDropTarget');
                    //thisElement.addClass('ng-scope');
                }

            thisElement = $compile(thisElement)($scope);



            /*
             var id = thisElement.attr("id");
             if (!id) {
             id = uuid.new()
             thisElement.attr("id", id);
             }


             thisElement.bind("dragover", function(e) {
             if (e.preventDefault) {
             e.preventDefault(); // Necessary. Allows us to drop.
             }

             e.stopPropagation();

             e.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
             return false;
             });

             thisElement.bind("mouseover", function(e) {
             e.stopPropagation();
             thisElement.addClass('lvl-element');
             //$(el.parent()).removeClass('lvl-element');

             });

             thisElement.bind("mouseleave", function(e) {
             e.stopPropagation();
             thisElement.removeClass('lvl-element');

             });

             thisElement.bind("dragstart", function(e) {
             e.stopPropagation();
             e.originalEvent.dataTransfer.setData('text', id);
             theTemplate2 = $compile('<div id="ndDropped" class="row ndplaceholder" ></div>')(scope);
             $rootScope.$emit("LVL-DRAG-START");
             });

             thisElement.bind("dragend", function(e) {
             e.stopPropagation();
             var dest = document.getElementById('ndDropped');
             if (dest != null)
             dest.remove();
             $rootScope.$emit("LVL-DRAG-END");
             });

             thisElement.bind("click", function(e) {

             e.preventDefault();
             e.stopPropagation();

             thisElement.addClass('selected');
             selectedElement = thisElement;

             console.log('selected '+ selectedElement);

             $scope.selectedBackgroundColor = selectedElement.css('background-color');

             var invoker = $parse(attrs.onSelect);

             invoker($scope, {selectedEl: thisElement} );
             $rootScope.$emit("SELECTED");
             if (thisElement.hasClass("editable"))
             {
             $scope.editMode = true;
             thisElement.attr("contenteditable", "true");
             } else {
             $scope.editMode = false;
             thisElement.attr("contenteditable", "false");
             }

             $scope.$apply();

             console.log('edit mode =TRUE '+ selectedElement);
             });

             thisElement.bind("blur", function(e) {
             e.stopImmediatePropagation();
             if ($scope.editMode == true && $scope.editCommand == true)
             {
             setTimeout(function() { thisElement.click(); thisElement.focus(); }, 10);
             $scope.editCommand = false;
             }  else {

             if ($scope.editMode == true)
             {
             console.log('blur ing');
             $scope.editMode = false;
             thisElement.attr("contenteditable", "false");

             }
             }
             scope.$apply();
             });

             */

            if (thisElement.children().length > 0 )
                setEditorAttributes(thisElement);
        }
    }



        function setColumnType(element)
        {


                //remove previous
                if  (element.hasClass('col-lg-1') || element.hasClass('col-lg-2') ||  element.hasClass('col-lg-3') || element.hasClass('col-lg-4') || element.hasClass('col-lg-5') || element.hasClass('col-lg-6')
                    || element.hasClass('col-lg-7') || element.hasClass('col-lg-8') || element.hasClass('col-lg-9') || element.hasClass('col-lg-10') || element.hasClass('col-lg-11') || element.hasClass('col-lg-12'))
                {
                    element.attr("ndType", "column");
                    element.addClass('ndContainer');
                }

            if  (element.hasClass('col-md-1') || element.hasClass('col-md-2') ||  element.hasClass('col-md-3') || element.hasClass('col-md-4') || element.hasClass('col-md-5') || element.hasClass('col-md-6')
                || element.hasClass('col-md-7') || element.hasClass('col-md-8') || element.hasClass('col-md-9') || element.hasClass('col-md-10') || element.hasClass('col-md-11') || element.hasClass('col-md-12'))
                {
                    element.attr("ndType", "column");
                    element.addClass('ndContainer');
                }

            if  (element.hasClass('col-sm-1') || element.hasClass('col-sm-2') ||  element.hasClass('col-sm-3') || element.hasClass('col-sm-4') || element.hasClass('col-sm-5') || element.hasClass('col-sm-6')
                || element.hasClass('col-sm-7') || element.hasClass('col-sm-8') || element.hasClass('col-sm-9') || element.hasClass('col-sm-10') || element.hasClass('col-sm-11') || element.hasClass('col-sm-12'))
                {
                    element.attr("ndType", "column");
                    element.addClass('ndContainer');
                }

            if  (element.hasClass('col-xs-1') || element.hasClass('col-xs-2') ||  element.hasClass('col-xs-3') || element.hasClass('col-xs-4') || element.hasClass('col-xs-5') || element.hasClass('col-xs-6')
                || element.hasClass('col-xs-7') || element.hasClass('col-xs-8') || element.hasClass('col-xs-9') || element.hasClass('col-xs-10') || element.hasClass('col-xs-11') || element.hasClass('col-xs-12'))
                {
                    element.attr("ndType", "column");
                    element.addClass('ndContainer');
                }



        }

    /* DROPZONE */
    $scope.uploads = {
        uploadingFile: false,
        showDropZone: false,
        files: []
    };


        /*var dragTimer;
        $(document).on('dragenter', function(e) {
            var dt = e.originalEvent.dataTransfer;
            if(dt.types != null && (dt.types.indexOf ? dt.types.indexOf('Files') != -1 : dt.types.contains('application/x-moz-file'))) {
                $("#dropzone").show();
                console.log('show');
                window.clearTimeout(dragTimer);
            }
        });
        $(document).on('dragleave', function(e) {
            dragTimer = window.setTimeout(function() {
                console.log('hide');
                $("#dropzone").hide();
            }, 25);
        });*/
        $("#dropzone").hide();
    $scope.getUploads = function(page) {
        var params = {};
        console.log('getting files for website: '+$scope.modalOptions.websiteID)
        if ($scope.modalOptions.websiteID)
            params.webSiteID =  $scope.modalOptions.websiteID;

        params.page = (page) ? page : 1;

        connection.get('/api/custom/Designer/find-all-uploads', params, function(data) {
            for (var i in data.items) {
                data.items[i]['previewURL'] = (data.items[i].thumbnails && data.items[i].length > 0) ? data.items[i].thumbnails[0].url : data.items[i].url;

                //console.log('the preview URL: ' + JSON.stringify(data.items[i]));
                $scope.uploads.files.push(data.items[i]);
            }
        }, {showLoader: false});
    };

    $scope.initDropzone = function() {
        $('#dropzone').dropzone({
            url: "/api/custom/Designer/upload",
            maxFilesize: 2,
            paramName: "file",
            maxThumbnailFilesize: 2,
            thumbnailWidth: 150,
            thumbnailHeight: 150,
            dictDefaultMessage: "Drop files here",
            acceptedFiles: "image/*",
            init: function() {
                var _this = this;

                var selectFile = document.querySelector("#SelectFile");
                selectFile.addEventListener("click", function () {
                    _this.hiddenFileInput.click();
                });

                this.on("addedfile", function(file) {
                    $scope.$apply(function () {
                        $scope.uploads.uploadingFile = true;
                    });

                    $(file.previewElement).hide();

                    $("#dropzone").hide();
                });
            },
            sending: function(file, xhr, formData){

                console.log('uploading file for website: '+$scope.modalOptions.websiteID)
                if ($scope.modalOptions.websiteID)
                    formData.append('webSiteID', $scope.modalOptions.websiteID);
            },
            success: function(file, res) {
                console.log('success');
                console.log(file);
                console.log(res);

                $scope.$apply(function () {
                    $scope.uploads.uploadingFile = false;

                    res.file['previewURL'] = (res.file.thumbnails && res.file.thumbnails.length > 0) ? res.file.thumbnails[0].url : res.file.url;

                    $scope.uploads.files.unshift(res.file);
                });
            },
            dragleave: function(event) {
                $("#dropzone").hide();
                console.log('leave dropzone');
            }
        });

        $('#objectPanel').on('dragenter', function(e) {
            $("#dropzone").show();
        });
    };

    var editor = null;
    $scope.viewHTML = function()
    {

        if ($scope.htmlMode) {
            $scope.htmlMode = false;
            console.log(editor.getValue());


                ndDesignerService.setInputHTML(editor.getValue());
                loadHTMLtoEditor();
            return;
        }
        if (editor) {
            editor.destroy();
            //editor.container.remove();
        }
        $scope.setPreviewMode();
        // var theHTML =  $scope.getContentHTML();

        var container = $(document.getElementById('previewContainer'));
        console.log(container.html());
        container.find('#pages-data').remove();
        var theHTML = container.html();

        $scope.previewMode = false;
        $scope.htmlCode = theHTML;
        $scope.htmlMode = true;

        $('#htmlContainer').text(theHTML);
        editor = ace.edit("htmlContainer");

        ace.config.set('basePath', 'modules/designer/libs/ace');
        editor.getSession().setMode("ace/mode/html");
        editor.getSession().setUseWorker(false);

    }

    $scope.changeParagraphFontSize = function(newSize)
    {
        if (newSize == '')
            $scope.selectedElement.css("font-size","");
        else
            $scope.selectedElement.css("font-size",newSize);
    }

        $scope.changeParagraphFontColor = function(newColor)
        {
            if (newColor == '')
                $scope.selectedElement.css("color","");
            else
                $scope.selectedElement.css("color",newColor);
        }

        $scope.changeHeight = function(newHeight)
        {
            if (newHeight == '')
                $scope.selectedElement.css("height","");
            else
                $scope.selectedElement.css("height",newHeight);
        }

    $scope.carouselNext = function()
    {
        $scope.selectedElement.carousel('next')
    }

        $scope.carouselPrev = function()
        {
            $scope.selectedElement.carousel('prev')
        }
        $scope.carouselPause = function()
        {
            $scope.selectedElement.carousel('pause')
        }


    //DESIGN
    $scope.initDesignSection = function() {
        connection.get('/api/Companies/find-one', {}, function(data) {
            $scope.selectedCompany = data.item;
            console.log($scope.selectedCompany);

            $scope.selectedCompany.companyURL = 'http://'+String(window.location.hostname).replace('admin', String($scope.selectedCompany.companyCode).toLowerCase())+':'+window.location.port+'/';

            connection.get('/api/cms/themes/find-all', {}, function(data) {
                $scope.themes = data.items;
                console.log(data);

                //set iframe src
                console.log(window.location.hostname);
                console.log(window.location.origin);
                console.log(window.location.port);


console.log($scope.selectedCompany.companyURL);
                $('#themePreviewFrame').attr('src', $scope.selectedCompany.companyURL);
                //admin.localhost.com
            });
        });
    };

    $scope.changeTheme = function(theme) {
        $scope.selectedCompany.themeID = theme._id;

        connection.post('/api/Companies/update', $scope.selectedCompany, function(data) {
            $('#themePreviewFrame').attr('src', $scope.selectedCompany.companyURL);
        });
    };

    //PAGES
    $scope.pageTypes = [
        {label: 'Page', value: 'page'},
        {label: 'Link', value: 'link'},
        {label: 'URL', value: 'url'}
    ];

    /*$scope.addPageTo = function(page, parentID, pages) {
        var pages = (pages) ? pages : $scope.pages;

        for (var i in pages) {
            if (String(pages[i]._id) == String(parentID)) {
                pages[i].items.push(page);
            }
            else {
                $scope.addPageTo(page, parentID, pages[i].items);
            }
        }
    };*/

    $scope.addPage = function(type) {
        $scope.selectedPage = {name: 'New Page', type: type, showInMenu: true};

        $scope.pages.items.push($scope.selectedPage);
    };

    $scope.selectPage = function(page) {
        $scope.selectedPage = page;
    };

    $scope.savePage = function() {
        /*if ($scope.selectedPage._id) {
            connection.post('/api/cms/pages/update/'+$scope.selectedPage._id, $scope.selectedPage, function(data) {

            });
        }
        else {
            connection.post('/api/cms/pages/create', $scope.selectedPage, function(data) {
                $scope.selectedPage._id = data.item._id;
                $scope.savePages();
            });
        }*/
    };

    $scope.deletePage = function(page, pages) {
        console.log($scope.pages);
        return;
        var pages = (pages) ? pages : $scope.pages.items;

        for (var i in pages) {
            if (pages[i] == page) {
                pages.splice(i, 1);
                $scope.selectedPage = null;
                return;
            }
            else if (pages[i].items) {
                $scope.deletePage(page, pages[i].items);
            }
        }
    };

    /*$scope.savingPages = false;
    $scope.savePages = function() {
        if ($scope.savingPages) return;

        $scope.savingPages = true;

        setTimeout(function() {
            connection.post('/api/cms/pages/save-pages', $scope.pages, function(data) {
                $scope.savingPages = false;
            }, {showLoader: false, showMsg: false});
        }, 500);
    };*/

    $scope.getView = function (item) {
        if (item) {
            return 'nestable_item.html';
        }
        return null;
    };
    $scope.onDrag = false;
    $scope.sortableOptions = {
        connectWith: ".pages-container",
        update: function(e, ui) {
            //$scope.savePages();
        },
        start: function(e, ui) {
            $scope.$apply(function () {
                $scope.onDrag = true;
            });
        },
        stop: function(e, ui) {
            $scope.$apply(function () {
                $scope.onDrag = false;
            });
        }
    };


});




//$.getScript('modules/designer/controllers/designer.js');
$.getScript('modules/designer/directives/lvl-uuid.js');
$.getScript('modules/designer/directives/lvl-drag-drop.js');
//$.getScript('modules/designer/libs/ace/ace.js');
//$.getScript('modules/designer/libs/ace/mode-html.js');