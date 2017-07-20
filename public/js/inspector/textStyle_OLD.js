angular.module('dbteam.builder', [])


.factory('textStyles', function(){
	return {
		fontSizes: [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72],
		fontWeights: [100, 200, 300, 400, 500, 600, 700, 800, 900, 'bold', 'bolder', 'light', 'lighter', 'normal'],
		fontAwesomeIconList: fontAwesomeIconsList,
		baseFonts: [
			{name: 'Impact', css: 'Impact, Charcoal, sans-serif'},
			{name: 'Comic Sans', css: '"Comic Sans MS", cursive, sans-serif'},
			{name: 'Arial Black', css: '"Arial Black", Gadget, sans-serif'},
			{name: 'Century Gothic', css: 'Century Gothic, sans-serif'},
			{name: 'Courier New', css: '"Courier New", Courier, monospace'},
			{name: 'Lucida Sans', css: '"Lucida Sans Unicode", "Lucida Grande", sans-serif'},
			{name: 'Times New Roman', css: '"Times New Roman", Times, serif'},
			{name: 'Lucida Console', css: '"Lucida Console", Monaco, monospace'},
			{name: 'Andele Mono', css: '"Andele Mono", monospace, sans-serif'},
			{name: 'Verdana', css: 'Verdana, Geneva, sans-serif'},
			{name: 'Helvetica Neue', css: '"Helvetica Neue", Helvetica, Arial, sans-serif'}
		]
	};
})


.factory('inspector', ['$rootScope', function($rootScope) {

    var inspector = {

        styles: {
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
    }

    return inspector;
}])

.directive('blPrettySelect', ['$parse', '$rootScope', function($parse, $rootScope) {

    //extend jquery ui widget so we can use different
    //styles for every select option
    $.widget('builder.prettyselect', $.ui.selectmenu, {
        _renderItem: function(ul, item) {
            var li = $('<li>', {text: item.label});

            //grab any styles stored on options and apply them
            $.each(item.element.data(), function(i,v) {
                li.css(i, v);
            });

            return li.appendTo(ul);
        }
    });

    return {
        restrict: 'A',
        link: function($scope, el, attrs) {

            //initiate select plugin on element
            el.prettyselect({
                width: attrs.width ? attrs.width : 100,
                appendTo: attrs.appendTo ? attrs.appendTo : $rootScope.inspectorCont
            });

            //hide select menu on inspector scroll
            $scope.inspectorCont.on('scroll', function() {
                el.prettyselect('close');
            });

            //get object reference to bind select value to
            var model = $parse(attrs.blPrettySelect);

            //assign new value to object on the scope we got above
            el.on('prettyselectchange', function(e, ui) {
                $scope.$apply(function() {
                    model.assign($scope, ui.item.value);
                });
            });

            //set up two way binding between select and model we got above
            $scope.$watch(attrs.blPrettySelect, function(elVal) {
                if ( ! elVal) { return true; };

                for (var i = el.get(0).options.length - 1; i >= 0; i--) {
                    var selVal = el.get(0).options[i].value.removeQoutes();

                    if (selVal == elVal || selVal.match(new RegExp('^.*?'+elVal+'.*?$'))) {
                        return el.val(selVal).prettyselect('refresh');
                    }
                }
            });
        }
    }
}])

.directive('blToggleTextDecoration', function() {
    return {
        restrict: 'A',
        link: function($scope, el, attrs) {
            el.on('click', function(e) {
            	var deco = attrs.blToggleTextDecoration,
            		scopeDeco = $scope.inspector.styles.text.textDecoration.trim();

            	$scope.$apply(function() {
            		//element has no text decoration currently so we'll just apply it now
            		if ( ! scopeDeco || scopeDeco.match(/^.*(none|initial).*$/)) {
            			$scope.inspector.styles.text.textDecoration = deco;

            		//element has given text decoration already so we'll remove it
            		} else if (deco == scopeDeco) {
            			$scope.inspector.styles.text.textDecoration = 'none';

            		//element has given text decoration as well as other decorations
            		//(underline overline) so we'll just remove given one and leave others intact
            		} else if (scopeDeco.match(deco)) {
            			$scope.inspector.styles.text.textDecoration = scopeDeco.replace(deco, '').trim();

            		//element has other text decorations but not this one so we'll append it to existing ones
            		} else {
            			$scope.inspector.styles.text.textDecoration += ' ' + deco;
            		}
            	});
            });
        }
    }
})

.directive('blToggleTextStyle', function() {
    return {
        restrict: 'A',
        link: function($scope, el, attrs) {
            el.on('click', function(e) {
            	var split = attrs.blToggleTextStyle.split('|');

            	$scope.$apply(function() {
            		if (el.hasClass('active')) {
	            		el.removeClass('active');
	            		$scope.inspector.styles.text[split[0]] = 'initial';
	            	} else {
	            		$scope.inspector.styles.text[split[0]] = split[1];
	            		el.addClass('active');

	            		if (split[1] != 'italic') {
	            			el.siblings().removeClass('active');
	            		}
	            	}
            	});
            });
        }
    }
})

.directive('textStyle', function($compile,textStyles,inspector) {
return {
    transclude: true,
    scope: {
        onChange: '=',
        ngModel: '='
    },

   templateUrl: "partials/inspector/textStyle.html",

    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {

     $scope.inspector = inspector;
     $scope.textStyles = textStyles;
     $scope.fontSelect = $('#el-font-family');

     //grab current text/font styles for active element
	 $scope.$on('element.reselected', function(e) {
		inspector.styles.text = {
			color: $scope.selected.getStyle('color'),
			fontSize: $scope.selected.getStyle('font-size'),
			textAlign: $scope.selected.getStyle('text-align'),
			fontStyle: $scope.selected.getStyle('font-style'),
			fontFamily: $scope.selected.getStyle('font-family'),
			lineHeight: $scope.selected.getStyle('line-height'),
			fontWeight: $scope.selected.getStyle('font-weight'),
			textDecoration: $scope.selected.getStyle('text-decoration')
		}
	});

    $scope.$watchCollection('inspector.styles.text', function(newValue, oldValue) {
		if (! $scope.selecting && ! $scope.dragging) {
			//loop trough both objects and only act if there's a difference in their values
			for (var prop in newValue) {
				if (newValue[prop] && oldValue[prop] && newValue[prop].removeQoutes() !== oldValue[prop].removeQoutes()) {
					console.log('changed vlaue')
                    return inspector.applyCss(prop.toDashedCase(), newValue[prop], oldValue[prop]);

				}
			}
		}
	});



    }

}
})
