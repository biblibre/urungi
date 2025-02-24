angular.module('app.inspector', ['colorpicker.module']);

angular.module('app.inspector').factory('textStyles', textStyles);

function textStyles () {
    return {
        fontSizes: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
        fontWeights: [100, 200, 300, 400, 500, 600, 700, 800, 900, 'bold', 'bolder', 'light', 'lighter', 'normal'],
        baseFonts: [
            { name: 'Impact', css: 'Impact, Charcoal, sans-serif' },
            { name: 'Comic Sans', css: '"Comic Sans MS", cursive, sans-serif' },
            { name: 'Arial Black', css: '"Arial Black", Gadget, sans-serif' },
            { name: 'Century Gothic', css: 'Century Gothic, sans-serif' },
            { name: 'Courier New', css: '"Courier New", Courier, monospace' },
            { name: 'Lucida Sans', css: '"Lucida Sans Unicode", "Lucida Grande", sans-serif' },
            { name: 'Times New Roman', css: '"Times New Roman", Times, serif' },
            { name: 'Lucida Console', css: '"Lucida Console", Monaco, monospace' },
            { name: 'Andele Mono', css: '"Andele Mono", monospace, sans-serif' },
            { name: 'Verdana', css: 'Verdana, Geneva, sans-serif' },
            { name: 'Helvetica Neue', css: '"Helvetica Neue", Helvetica, Arial, sans-serif' },
            { name: 'Open Sans', css: '"Open Sans", Helvetica, Arial, sans-serif' }
        ]
    };
}

angular.module('app.inspector').directive('blPrettyScrollbar', blPrettyScrollbar);

function blPrettyScrollbar () {
    return {
        restrict: 'A',
        compile: function (el) {
            el.mCustomScrollbar({
                theme: 'light-thin',
                scrollInertia: 300,
                autoExpandScrollbar: false,
                autoHideScrollbar: true
            });
        }
    };
}

angular.module('app.inspector').directive('appInspector', appInspector);

appInspector.$inject = ['$compile', '$timeout', '$uibModal', 'c3Charts', 'textStyles', '$window'];

function appInspector ($compile, $timeout, $uibModal, c3Charts, textStyles, $window) {
    return {
        transclude: true,
        scope: {
            onChange: '=',
            element: '=',
            dashboard: '=',
        },

        templateUrl: 'partials/inspector/inspector.directive.html',

        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function ($scope, element, attrs) {
            $scope.textStyles = textStyles;

            $scope.textures = new Array(28);

            $scope.gradients = [
                'linear-gradient(to right, #959595 0%, #0D0D0D 46%, #010101 50%, #0A0A0A 53%, #4E4E4E 76%, #383838 87%, #1b1b1b 100%)',
                'linear-gradient(to right, #FF0000 0%, #FFFF00 50%, #ff0000 100%)',
                'linear-gradient(to right, #f6f8f9 0%, #E5EBEE 50%, #D7DEE3 51%, #f5f7f9 100%)',
                'linear-gradient(to right, #008080 0%, #FFFFFF 25%, #05C1FF 50%, #FFFFFF 75%, #005757 100%)',
                'linear-gradient(to right, #ff0000 0%, #000000 100%)',
                'linear-gradient(to bottom, #93cede 0%,#75bdd1 41%, #49a5bf 100%)',
                'linear-gradient(to right, #f8ffe8 0%, #E3F5AB 33%, #b7df2d 100%)',
                'linear-gradient(to right, #b8e1fc 0%, #A9D2F3 10%, #90BAE4 25%, #90BCEA 37%, #90BFF0 50%, #6BA8E5 51%, #A2DAF5 83%, #bdf3fd 100%)',
                'linear-gradient(to right, #f0b7a1 0%, #8C3310 50%, #752201 51%, #bf6e4e 100%)',
                'linear-gradient(to right, #ff0000 0%, #FFFF00 25%, #05C1FF 50%, #FFFF00 75%, #ff0000 100%)',
                'linear-gradient(to right, #ffb76b 0%, #FFA73D 50%, #FF7C00 51%, #ff7f04 100%)',
                'linear-gradient(to right, #ffff00 0%, #05C1FF 50%, #ffff00 100%)',
                'linear-gradient(to bottom, #febf01 0%,#febf01 100%)',
                'linear-gradient(to bottom, #fcfff4 0%,#e9e9ce 100%)',
                'linear-gradient(to bottom, #49c0f0 0%,#2cafe3 100%)',
                'linear-gradient(to bottom, #cc0000 0%,#cc0000 100%)',
                'linear-gradient(to bottom, #73880a 0%,#73880a 100%)',
                'linear-gradient(to bottom, #627d4d 0%,#1f3b08 100%)',
                'linear-gradient(to bottom, #b8c6df 0%,#6d88b7 100%)',
                'linear-gradient(to bottom, #9dd53a 0%,#a1d54f 50%,#80c217 51%,#7cbc0a 100%)',
                'linear-gradient(to bottom, #b8c6df 0%,#6d88b7 100%)',
                'linear-gradient(to bottom, #ff3019 0%,#cf0404 100%)',
                'linear-gradient(to bottom, #e570e7 0%,#c85ec7 47%,#a849a3 100%)',
                'linear-gradient(to bottom, #ffffff 0%,#f3f3f3 50%,#ededed 51%,#ffffff 100%)',
            ];

            $scope.canEdit = function (block) {
                const result = true;
                return result;
            };

            $scope.inspector = {
                styles: {
                    height: 100,
                    source: '',
                    headingType: '',
                    padding: {},
                    margin: {},
                    border: {},
                    color: {},
                    attributes: {
                        class: [],
                        id: '',
                        float: '',
                    },
                    text: {},
                }
            };

            $scope.previews = {
                image: $('#image'),
                gradient: $('#gradient'),
                color: $('#fill-color'),
            };

            $scope.properties = {
                image: false,
                position: 'center center',
                repeat: 'repeat',
                color: false,
            };

            $scope.openImageGallery = function (target) {
                const modal = $uibModal.open({
                    component: 'appDashboardImageModal',
                });
                modal.result.then(function (file) {
                    let url = file.url;
                    if (file.source1400) {
                        url = file.source1400;
                    } else if (file.source700) {
                        url = file.source700;
                    }
                    $scope.setBackgroundImage(url);
                }, function () {});
            };

            $scope.setBackgroundImage = function (url) {
                if ($scope.selectedElement) {
                    const theElement = $scope.selectedElement;

                    if (url) {
                        theElement.css({ 'background-image': "url('" + url + "')" });
                        theElement.css({ '-webkit-background-size': 'cover' });
                        theElement.css({ '-moz-background-size': 'cover' });
                        theElement.css({ '-o-background-size': 'cover' });
                        theElement.css({ 'background-size': 'cover' });
                    } else {
                        theElement.css({ 'background-image': 'none' });
                    }
                }
            };

            $scope.$on('element.reselected', function (e, node) {
                if ($scope.selectedElement) {
                    $scope.selectedElement[0].classList.remove('selected');
                }

                $scope.selecting = true;
                $scope.selectedElement = node;
                $scope.selectedElement[0].classList.add('selected');

                $scope.properties.image = node.css('background-image');
                $('#image').css('background-image', $scope.properties.image);
                $('#gradient').css('background-image', 'none');
                $scope.properties.color = node.css('background-color');
                $('#fill-color').css('background-color', $scope.properties.color);
                $scope.inspector.styles.text.color = node.css('color');
                $scope.inspector.styles.text.fontSize = node.css('font-size');
                $scope.inspector.styles.text.textAlign = node.css('text-align');
                $scope.inspector.styles.text.fontStyle = node.css('font-style');
                $scope.inspector.styles.text.fontFamily = node.css('font-family');
                $scope.inspector.styles.text.lineHeight = node.css('line-height');
                $scope.inspector.styles.text.fontWeight = node.css('font-weight');
                $scope.inspector.styles.text.textDecoration = node.css('text-decoration');
                $scope.inspector.styles.border.border = node.css('text-decoration');
                $scope.inspector.styles.height = node.css('height');
                $scope.inspector.styles.padding.top = node.css('padding-top');
                $scope.inspector.styles.padding.left = node.css('padding-left');
                $scope.inspector.styles.padding.right = node.css('padding-right');
                $scope.inspector.styles.padding.bottom = node.css('padding-bottom');
                if ($scope.inspector.styles.padding.top === $scope.inspector.styles.padding.left && $scope.inspector.styles.padding.top === $scope.inspector.styles.padding.right && $scope.inspector.styles.padding.top === $scope.inspector.styles.padding.bottom) { $scope.paddingAll = $scope.inspector.styles.padding.top; } else {
                    $scope.paddingAll = '';
                }
                $scope.inspector.styles.margin.top = node.css('margin-top');
                $scope.inspector.styles.margin.left = node.css('margin-left');
                $scope.inspector.styles.margin.right = node.css('margin-right');
                $scope.inspector.styles.margin.bottom = node.css('margin-bottom');
                if ($scope.inspector.styles.margin.top === $scope.inspector.styles.margin.left && $scope.inspector.styles.margin.top === $scope.inspector.styles.margin.right && $scope.inspector.styles.margin.top === $scope.inspector.styles.margin.bottom) { $scope.marginAll = $scope.inspector.styles.margin.top; } else {
                    $scope.marginAll = '';
                }
                $scope.inspector.styles.border.top = node.css('border-top-width');
                $scope.inspector.styles.border.left = node.css('border-left-width');
                $scope.inspector.styles.border.right = node.css('border-right-width');
                $scope.inspector.styles.border.bottom = node.css('border-bottom-width');
                if ($scope.inspector.styles.border.top === $scope.inspector.styles.border.left && $scope.inspector.styles.border.top === $scope.inspector.styles.border.right && $scope.inspector.styles.border.top === $scope.inspector.styles.border.bottom) { $scope.borderAll = $scope.inspector.styles.border.top; } else {
                    $scope.borderAll = '';
                }
                $scope.inspector.styles.border.color = node.css('border-color');
                $('#border-color').css('border-color', $scope.inspector.styles.border.color);
                $scope.inspector.styles.border.style = node.css('border-style');

                $scope.inspector.styles.border.radiusTopLeft = node.css('border-top-left-radius');
                $scope.inspector.styles.border.radiusTopRight = node.css('border-top-right-radius');
                $scope.inspector.styles.border.radiusBottomLeft = node.css('border-bottom-left-radius');
                $scope.inspector.styles.border.radiusBottomRight = node.css('border-bottom-right-radius');
                if ($scope.inspector.styles.border.radiusTopLeft === $scope.inspector.styles.border.radiusTopRight && $scope.inspector.styles.border.radiusTopLeft === $scope.inspector.styles.border.radiusBottomLeft && $scope.inspector.styles.border.radiusTopLeft === $scope.inspector.styles.border.radiusBottomRight) { $scope.inspector.styles.border.radius = $scope.inspector.styles.border.radiusTopLeft; } else {
                    $scope.inspector.styles.border.radius = '';
                }

                $scope.elementType = node.attr('ndType');

                if ($scope.elementType === 'image' || $scope.elementType === 'video') {
                    // .setAttribute("ng-click", "function_name()");
                    $scope.inspector.styles.source = node.attr('src');
                }
                if ($scope.elementType === 'heading') {
                    if (node.is('h1')) { $scope.inspector.styles.headingType = 'h1'; }
                    if (node.is('h2')) { $scope.inspector.styles.headingType = 'h2'; }
                    if (node.is('h3')) { $scope.inspector.styles.headingType = 'h3'; }
                    if (node.is('h4')) { $scope.inspector.styles.headingType = 'h4'; }
                    if (node.is('h5')) { $scope.inspector.styles.headingType = 'h5'; }
                    if (node.is('h6')) { $scope.inspector.styles.headingType = 'h6'; }
                }

                $scope.$apply();

                setTimeout(function () {
                    $scope.selecting = false;
                }, 500);
            });

            $scope.applyBigInputBoxValue = function (name, value, append) {
                const val = value.replace(/[A-Za-z]/g, '') + 'px';
                $scope.inspector.styles[name] = { top: val, left: val, right: val, bottom: val };
            };

            $scope.selectPreset = function (e) {
                if (e) {
                    $scope.properties.image = e.target.style.getPropertyValue('background-image');
                }
            };

            $scope.$watchCollection('inspector.styles.source', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    $scope.selectedElement.attr('src', newProps);
                }
            });
            $scope.$watchCollection('inspector.styles.headingType', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    const html = '<' + newProps + ' page-block ndtype="heading" class="editable">' + $scope.selectedElement[0].innerHTML + '</' + newProps + '>';
                    const $div = $(html);

                    $compile($div)($scope);

                    $scope.selectedElement.replaceWith($div);
                    $timeout(function () {
                        $scope.$broadcast('element.reselected', $div);
                    }, 0);
                }
            });

            $scope.moveElementUp = function () {
                const theElement = $scope.selectedElement;

                const selected = $(theElement).index();

                const parent = $(theElement).parent();

                $(parent).children().eq(selected - 1).before($(parent).children().eq(selected));
            };

            $scope.moveElementDown = function () {
                const theElement = $scope.selectedElement;

                const selected = $(theElement).index();

                const parent = $(theElement).parent();

                $(parent).children().eq(selected + 1).after($(parent).children().eq(selected));
            };

            $scope.$watchCollection('properties', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    for (const prop in newProps) {
                        if (newProps[prop] && newProps[prop] !== oldProps[prop]) {
                            // handle previews in inspector - image
                            if (newProps[prop].indexOf('url') > -1) {
                                $scope.previews.image.css('background-image', newProps[prop]);
                                // gradient
                            } else if (newProps[prop].indexOf('gradient') > -1) {
                                $scope.previews.gradient.css('background-image', newProps[prop]);
                                // fill color
                            } else {
                                if (newProps[prop] && newProps[prop] !== 'transparent' && newProps[prop] !== 'rgba(0, 0, 0, 0)') {
                                    $scope.previews.color.css('background', newProps[prop]);
                                } else {
                                    $scope.previews.color.css('background', 'url("' + $scope.baseUrl + 'images/transparent.png")');
                                }
                            }

                            // use background instead of background-color so background image will get overwritten
                            const style = prop === 'color' ? 'background' : 'background-' + prop;
                            $scope.selectedElement.css(style, newProps[prop]);
                            // MENE inspector.applyCss(style, newProps[prop], oldProps[prop]);
                        }
                    }
                }
            });

            $scope.$watchCollection('inspector.styles.text', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    for (const prop in newProps) {
                        if (newProps[prop] && newProps[prop] !== oldProps[prop]) {
                            $scope.selectedElement.css(prop, newProps[prop]);
                        }
                    }
                }
            });

            $scope.$watchCollection('inspector.styles.height', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    $scope.selectedElement.css('height', newProps);
                }
            });

            $scope.$watchCollection('inspector.styles.padding', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    let top = '0px';
                    let right = '0px';
                    let bottom = '0px';
                    let left = '0px';
                    for (const prop in newProps) {
                        if (newProps[prop]) {
                            if (prop === 'top') { top = newProps[prop]; }
                            if (prop === 'right') { right = newProps[prop]; }
                            if (prop === 'bottom') { bottom = newProps[prop]; }
                            if (prop === 'left') { left = newProps[prop]; }
                        }
                    }

                    const styleVal = top + ' ' + right + ' ' + bottom + ' ' + left;
                    $scope.selectedElement.css('padding', styleVal);
                }
            });

            $scope.$watchCollection('inspector.styles.margin', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    let top = '0px';
                    let right = '0px';
                    let bottom = '0px';
                    let left = '0px';
                    for (const prop in newProps) {
                        if (newProps[prop]) {
                            if (prop === 'top') { top = newProps[prop]; }
                            if (prop === 'right') { right = newProps[prop]; }
                            if (prop === 'bottom') { bottom = newProps[prop]; }
                            if (prop === 'left') { left = newProps[prop]; }
                        }
                    }

                    //  top right  bottom  left
                    const styleVal = top + ' ' + right + ' ' + bottom + ' ' + left;
                    $scope.selectedElement.css('margin', styleVal);
                }
            });

            $scope.$watchCollection('inspector.styles.border', function (newProps, oldProps) {
                if ($scope.selectedElement) {
                    let top = '0px';
                    let right = '0px';
                    let bottom = '0px';
                    let left = '0px';

                    if (!$scope.selecting && !$scope.dragging) {
                        for (const prop in newProps) {
                            if (newProps[prop]) {
                                if (prop === 'top') { top = newProps[prop]; }
                                if (prop === 'right') { right = newProps[prop]; }
                                if (prop === 'bottom') { bottom = newProps[prop]; }
                                if (prop === 'left') { left = newProps[prop]; }
                                if (prop === 'color') { $scope.selectedElement.css('border-color', newProps[prop]); }
                                if (prop === 'style') { $scope.selectedElement.css('border-style', newProps[prop]); }
                            }
                        }
                    }

                    const styleVal = top + ' ' + right + ' ' + bottom + ' ' + left;
                    $scope.selectedElement.css('border-width', styleVal);
                }
            });

            $scope.$watchCollection('inspector.styles.border.radius', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    $scope.selectedElement.css('border-radius', newProps);
                    $scope.selectedElement.css('border-top-left-radius', newProps);
                    $scope.selectedElement.css('border-top-right-radius', newProps);
                    $scope.selectedElement.css('border-bottom-left-radius', newProps);
                    $scope.selectedElement.css('border-bottom-right-radius', newProps);
                    $scope.inspector.styles.border.radiusTopLeft = $scope.inspector.styles.border.radius;
                    $scope.inspector.styles.border.radiusTopRight = $scope.inspector.styles.border.radius;
                    $scope.inspector.styles.border.radiusBottomLeft = $scope.inspector.styles.border.radius;
                    $scope.inspector.styles.border.radiusBottomRight = $scope.inspector.styles.border.radius;
                }
            });

            $scope.$watchCollection('inspector.styles.border.radiusTopLeft', function (newProps, oldProps) {
                if (!$scope.selectedElement && $scope.selecting && !$scope.dragging) {
                    $scope.selectedElement.css('border-top-left-radius', newProps);
                }
            });

            $scope.$watchCollection('inspector.styles.border.radiusTopRight', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    $scope.selectedElement.css('border-top-right-radius', newProps);
                }
            });

            $scope.$watchCollection('inspector.styles.border.radiusBottomLeft', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    $scope.selectedElement.css('border-bottom-left-radius', newProps);
                }
            });

            $scope.$watchCollection('inspector.styles.border.radiusBottomRight', function (newProps, oldProps) {
                if ($scope.selectedElement && !$scope.selecting && !$scope.dragging) {
                    $scope.selectedElement.css('border-bottom-right-radius', newProps);
                }
            });

            $scope.deleteSelected = function () {
                $scope.selectedElement.remove();
            };

            function clearInlineStyle (element) {
                const cssProperties = [
                    'background',
                    'background-image',
                    'background-repeat',
                    'border',
                    'border-radius',
                    'color',
                    'font-family',
                    'font-size',
                    'font-style',
                    'font-weight',
                    'height',
                    'margin',
                    'padding',
                    'text-align',
                    'text-decoration',
                ];

                for (const cssProperty of cssProperties) {
                    element.css(cssProperty, '');
                }
            }

            $scope.clearElementInlineStyle = function () {
                const element = $scope.selectedElement;

                clearInlineStyle(element);

                $timeout(function () {
                    $scope.$broadcast('element.reselected', element);
                }, 0);
            };

            $scope.clearTreeInlineStyle = function () {
                const element = $scope.selectedElement;

                clearInlineStyle(element);
                element.find('[page-block]').each(function () {
                    clearInlineStyle($(this));
                });

                $timeout(function () {
                    $scope.$broadcast('element.reselected', element);
                }, 0);
            };
        }

    };
}

angular.module('app.inspector').directive('blPanelsAccordion', blPanelsAccordion);

function blPanelsAccordion () {
    return {
        restrict: 'A',
        link: function ($scope, el) {
            el.on('click', '.accordion-heading', function (e) {
                const item = $(e.target).closest('.accordion-item');

                if (item.hasClass('open')) {
                    el.find('.accordion-item').removeClass('open');
                } else {
                    el.find('.accordion-item').removeClass('open');
                    $scope.$apply(function () {
                        item.addClass('open');
                    });
                }
            });
        }
    };
}

angular.module('app.inspector').directive('blInputBoxes', blInputBoxes);

blInputBoxes.$inject = ['$compile', '$timeout'];

function blInputBoxes ($compile, $timeout) {
    return {
        restrict: 'A',
        link: function ($scope, el, attrs) {
            const p = attrs.blInputBoxes;

            const html = '<div class="big-box col-sm-6">' +
            '<input ng-model="' + p + 'All" ng-model-options="{ debounce: 300 }" ng-change="applyBigInputBoxValue(\'' + p + '\', ' + p + 'All)">' +
        '</div>' +
        '<div class="small-boxes col-sm-6">' +
            '<div class="row">' +
                '<input ng-model="inspector.styles.' + p + '.top" ng-model-options="{ debounce: 300 }">' +
            '</div>' +
            '<div class="row">' +
                '<div class="col-sm-6">' +
                    '<input ng-model="inspector.styles.' + p + '.left" ng-model-options="{ debounce: 300 }">' +
                '</div>' +
                '<div class="col-sm-6">' +
                    '<input ng-model="inspector.styles.' + p + '.right" ng-model-options="{ debounce: 300 }">' +
                '</div>' +
            '</div>' +
            '<div class="row">' +
                '<input ng-model="inspector.styles.' + p + '.bottom" ng-model-options="{ debounce: 300 }">' +
            '</div>' +
        '</div>';

            el.html($compile(html)($scope));

            $scope.$on('element.reselected', function (e) {
                $timeout(function () {
                    el.find('input').blur();
                }, 0, false);
            });
        }
    };
}

angular.module('app.inspector').directive('blToggleTextDecoration', blToggleTextDecoration);

function blToggleTextDecoration () {
    return {
        restrict: 'A',
        link: function ($scope, el, attrs) {
            el.on('click', function (e) {
                const deco = attrs.blToggleTextDecoration;
                const scopeDeco = $scope.inspector.styles.text.textDecoration.trim();

                $scope.$apply(function () {
                // element has no text decoration currently so we'll just apply it now
                    if (!scopeDeco || scopeDeco.match(/^.*(none|initial).*$/)) {
                        $scope.inspector.styles.text.textDecoration = deco;

                        // element has given text decoration already so we'll remove it
                    } else if (deco === scopeDeco) {
                        $scope.inspector.styles.text.textDecoration = 'none';

                        // element has given text decoration as well as other decorations
                        // (underline overline) so we'll just remove given one and leave others intact
                    } else if (scopeDeco.match(deco)) {
                        $scope.inspector.styles.text.textDecoration = scopeDeco.replace(deco, '').trim();

                        // element has other text decorations but not this one so we'll append it to existing ones
                    } else {
                        $scope.inspector.styles.text.textDecoration += ' ' + deco;
                    }
                });
            });
        }
    };
}

angular.module('app.inspector').directive('blToggleTextStyle', blToggleTextStyle);

function blToggleTextStyle () {
    return {
        restrict: 'A',
        link: function ($scope, el, attrs) {
            el.on('click', function (e) {
                const split = attrs.blToggleTextStyle.split('|');

                $scope.$apply(function () {
                    if (el.hasClass('active')) {
                        el.removeClass('active');
                        $scope.inspector.styles.text[split[0]] = 'initial';
                    } else {
                        $scope.inspector.styles.text[split[0]] = split[1];
                        el.addClass('active');

                        if (split[1] !== 'italic') {
                            el.siblings().removeClass('active');
                        }
                    }
                });
            });
        }
    };
}
