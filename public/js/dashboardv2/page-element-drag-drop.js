var module = angular.module("page.element.dragdrop", []);

var theTemplate;
var theTemplate2;
var theParent;
var mode;
var selectedElement;



module.directive('elementDraggable', ['$rootScope', 'uuid', '$compile','$parse', function($rootScope, uuid, $compile, $parse) {
	    return {
	        restrict: 'A',
            /*scope: {
                onSelect: '&'
            },*/
	        link: function(scope, el, attrs, controller) {
	        	//console.log("linking draggable element");

	            $(el).attr("draggable", "true");
	            var id = $(el).attr("id");
	            if (!id) {
	                id = uuid.new()
	                $(el).attr("id", id);
	            }



	            el.bind("dragstart", function(e) {
                    e.stopPropagation();
                    e.originalEvent.dataTransfer.setData('text', id);
                    //console.log('starting drag...');

                    theTemplate2 = $compile('<div id="ndDropped" class="container-fluid ndplaceholder" ></div>')(scope);


	                $rootScope.$emit("ELEMENT-DRAG-START");
	            });

	            el.bind("dragend", function(e) {
                    e.stopPropagation();
                    var dest = document.getElementById('ndDropped');
                    //var theIndex = dest.index();
                    //var theParent = dest.parent();
                    if (dest != null)
                        dest.remove();
	                $rootScope.$emit("ELEMENT-DRAG-END");
	            });

                el.bind("mouseover", function(e) {
                    e.stopPropagation();
                    scope.cleanAllLvlElement($(el));
                    $(el).addClass('lvl-element');
                    console.log('I am over a '+$(el).attr("ndType"));

                });

                el.bind("mouseleave", function(e) {
                    e.stopPropagation();
                    $(el).removeClass('lvl-element');
                    $(el).removeClass('selectedImage');

                });


                el.bind("click", function(e) {
                   // if (scope.editMode != true)
                    //{

                    if ($(el).attr("ndType") != 'carouselControl')
                    {
                        e.preventDefault();
                        e.stopPropagation();

                    if (scope.selectedElement != null)
                    {
                        //console.log('quitando selected bind click');
                        scope.selectedElement.removeClass('selected');
                        scope.selectedElement.attr("contenteditable", "false");
                    }

                        $(el).addClass('selected');
                        scope.selectedElement = $(el);

                        console.log('selected bind click'+ scope.selectedElement);

                        scope.selectedBackgroundColor = scope.selectedElement.css('background-color');


                        if ($(el).hasClass("editable"))
                        {
                            scope.$apply(function () {
                                scope.editMode = true;
                                $(el).attr("contenteditable", "true");
                                $(el).focus();
                            });
                        } else {
                            scope.editMode = false;
                            $(el).attr("contenteditable", "false");
                        }
                        $rootScope.$emit("SELECTED");

                        scope.$apply();

                        scope.isSelected = true;
                        //scope.showTab(1);
                        scope.$apply(function () {
                            scope.tabs.selected = 'settings';
                        });
                        //console.log('element selected bc '+selectedElement.attr('id'));
                        scope.getElementProperties($(el));
                   // } else {
                       // scope.editMode = false;
                        console.log('edit mode =TRUE '+ scope.selectedElement);
                   // }
                    }
                });




                el.bind("blur", function(e) {
                    //e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (scope.editMode == true && scope.editCommand == true)
                    {
                        //var self = this;
                        setTimeout(function() { el.click(); el.focus(); }, 10);
                        scope.editCommand = false;
                        console.log('estoy aqui en blur');

                    }  else {

                        if (scope.editMode == true)
                        {
                            console.log('blur ing');
                            scope.editMode = false;
                            $(el).attr("contenteditable", "false");

                        }
                    }
                    scope.$apply();
                });

	        }
    	}
	}]);

module.directive('elementDropTarget', ['$rootScope', 'uuid', '$compile', function($rootScope, uuid, $compile) {
        return {
	        restrict: 'A',
	        /*scope: {
	            onDrop: '&'
	        },*/
	        link: function(scope, el, attrs, controller) {
	            var id = $(el).attr("id");


	            if (!id) {
	                id = uuid.new()
	                $(el).attr("id", id);
	            }

	            el.bind("dragover", function(e) {
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    e.stopPropagation();


	              e.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
	              return false;
	            });

                el.bind("dragover", function(e){

                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    e.stopPropagation();

                    var data = e.originalEvent.dataTransfer.getData("text");
                    var dest = document.getElementById(id);
                    var src = document.getElementById(data);

                    console.log(' el data '+data);

                    var x, y,
                        mar = {};
                    mar.elm = $(el);
                    mar.height = mar.elm.outerHeight();// +parseInt(mar.elm.css('margin-bottom'), 10)+parseInt(mar.elm.css('margin-top'), 10)+parseInt(mar.elm.css('padding-top'), 10)+parseInt(mar.elm.css('pdding-bottom'), 10);

                        x = e.originalEvent.offsetX;
                        y = e.originalEvent.offsetY;

                    if (y <= 10)
                    {
                        console.log('estoy en el margen superior');
                        theParent = el;
                        mode = 'before';
                        el.before(theTemplate2);
                        console.log('before '+$(dest).attr("id"));
                        $(el).removeClass("selectedImage");
                    }

                    if (y > mar.height -10)
                    {
                        console.log('estoy en el margen inferior');
                        theParent = el;
                        mode = 'after';
                        el.after(theTemplate2);
                        console.log('after '+$(dest).attr("id"));
                        $(el).removeClass("selectedImage");

                    }

                    if (y < mar.height -10 && y > 10)
                    {
                        console.log('estoy en el centro');
                        var dropType = $(src).attr("data-color");

                        var theNDType =  $(dest).attr("ndType");

                        console.log('el dropType: '+ dropType);

                            if (($(dest).attr("ndType") == 'photoHeader') )
                            {
                                console.log('This is a photo header...')
                                $(el).addClass("selectedImage");
                                mode = 'photoHeader';

                            }

                            if (($(dest).attr("ndType") == 'image') )
                            {
                                console.log('dragenter This is a image...');
                                $(el).addClass("selectedImage");
                                mode = 'image';


                            }

                            console.log('el ndtyp es '+$(dest).attr("ndType")) ;

                            if (($(dest).attr("ndType") == 'carousell') )
                            {
                                console.log('dragenter This is a carousell...');
                                $(el).addClass("selectedImage");
                                mode = 'image';


                            }
                        //}

                        if (($(dest).attr("ndType") == 'column') || ($(dest).attr("ndType") == 'container') )
                        {
                            theParent = el;
                            console.log('dragenter This is a column...');
                            $(el).addClass("selectedImage");
                            mode = 'column';

                        }

                        if (theNDType == 'mainContainer')
                            $(el).removeClass("selectedImage");

                    }
                    console.log('estoy '+x+'  '+y + ' '+ mar.height);

                });

	            el.bind("dragenter", function(e) {
	              // this / e.target is the current hover target.
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    e.stopPropagation();

                    console.log('estoy aqui....en dragenter');

                    var data = e.originalEvent.dataTransfer.getData("text");
                    var dest = document.getElementById(id);
                    var src = document.getElementById(data);


                    var dropType = $(src).attr("data-color");


                    console.log('el dropType de dragenter: '+ dropType);

                    if (($(dest).attr("ndType") == 'mainContainer') )
                    {

                        theParent = el;
                        mode = 'append';
                        el.append(theTemplate2);
                        console.log('append');


                    } else {

                        $(el).addClass("draggingOver");

                    }
	            });

	            el.bind("dragleave", function(e) {
	                $(e.target).removeClass('lvl-over');  // this / e.target is previous target element.
                    $(e.target).removeClass('lvl-inside');
                    $(e.target).removeClass('selectedImage');
                    $(e.target).removeClass("draggingOver");
                    $(el).removeClass("selectedImage");
                });

	            el.bind("drop", function(e) {

                    $(e.target).removeClass('selectedImage');
                    $(e.target).removeClass("draggingOver");
                    //draggingHere = false;

                      if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                      }

	                    e.stopPropagation(); // Necessary. Allows us to drop.

                        var dest = document.getElementById('ndDropped');

                    if (dest)
                        dest.remove();
                        else
                        dest = document.getElementById(id);


	            	var data = e.originalEvent.dataTransfer.getData("text");
	                dest = document.getElementById(id);
	                var src = document.getElementById(data);

                    $(dest).removeClass('selectedImage');

                    var dropType = $(src).attr("data-color");

                    theTemplate = null;

                    getTemplate($compile, scope, dropType, function(template){
                        theTemplate = template;

                        if (!dropType)
                        {
                            console.log('is undefined');
                            theTemplate = src;
                        } else {
                            console.log('is not undefined: '+dropType +' and mode: '+mode);

                            if (dropType == 'image')
                            {
                                theTemplate = dropImage(src,el,dropType,$compile,scope);

                            }

                            $rootScope.$apply();
                        }


                        if (mode == 'image')
                        {
                            $compile(theParent)(scope);
                        }

                        if (mode == 'append')
                        {
                            theParent.append(theTemplate);
                            console.log('final append el html:' + theTemplate.html());
                        }

                        if (mode == 'column')
                        {
                            console.log('... mode column ...');


                            var newID = uuid.new()

                            $(theTemplate).attr('id',newID);

                            theParent.append(theTemplate);

                            $compile(theParent)(scope);

                            var src2 = document.getElementById(data);


                            $(src2).remove();

                            scope.$apply();


                        }

                        if (mode == 'before')
                        {
                            console.log('the before');

                            if (!theTemplate)
                                console.log('no existo');

                            var newID = uuid.new()

                            $(theTemplate).attr('id',newID);
                            theTemplate = $compile(theTemplate)(scope);

                            theParent.before(theTemplate);
                            $(theTemplate).removeClass("lvl-over");

                            var src2 = document.getElementById(data);
                            if (src2 && dropType == undefined) {
                                $(src2).remove();
                                console.log('removed');

                            }
                        }

                        if (mode == 'after')
                        {
                            console.log('the after');

                            if (!theTemplate)
                                console.log('no existo');

                            var newID = uuid.new()

                            $(theTemplate).attr('id',newID);
                            theTemplate = $compile(theTemplate)(scope);

                            theParent.after(theTemplate);
                            //binding(theTemplate);
                            $(theTemplate).removeClass("lvl-over");

                            $(theTemplate).carousel('cycle');

                            var src2 = document.getElementById(data);
                            if (src2 && dropType == undefined) {
                                $(src2).remove();
                                console.log('removed');

                            }
                        }
                        scope.getAllElements();
                    });

	            });

	            $rootScope.$on("LVL-DRAG-START", function() {
                    //TODO: error cuando se suelta el drag
                    //if (!e.isUndefined)
                      //  e.stopPropagation();
                    var el = document.getElementById(id);
	                $(el).addClass("lvl-target");
                   //scope.draggingHere = true;

	            });

	            $rootScope.$on("LVL-DRAG-END", function() {
                    console.log("LVL-DRAG-END");
	                var el = document.getElementById(id);
	                $(el).removeClass("lvl-target");

	            });
	        }
    	}
	}]);


function dropImage(src,dest,dropType,$compile,scope)
{

    var theTemplate = '';


    if (($(dest).attr("ndType") == 'photoHeader') )
    {
        console.log('This is a photo header...')
        mode = 'photoHeader';

    }

    if (($(dest).attr("ndType") == 'image') )
    {
        console.log('dragenter This is a image...');
        mode = 'image';


    }

    console.log('el ndtyp es '+$(dest).attr("ndType")) ;

    if (($(dest).attr("ndType") == 'carousell') )
    {
        console.log('dragenter This is a carousell...');
        mode = 'photoHeader';


    }


    if (dropType == 'image')
    {
        var dropID = $(src).attr("data-id");
        var destType = $(dest).attr("ndType");
        console.log('source is an image and destiny is ' +destType);

        if (destType == 'photoHeader')
        {
            var destiny =  $(dest)[0];

            var theElement = $($(dest).children()[0]);
            theElement.css("background-image","url('"+ $(src).attr("data-id") +"')");

        } else {
            if (destType == 'homeFull')
            {
                console.log('destiny is a homeFull '+ $(src).attr("data-id"));
                dest.style.backgroundImage = "url('"+ $(src).attr("data-id") +"')";

            } else {
                if (destType == 'image')
                {
                    console.log('destiny is a image '+ $(src).attr("data-id"));
                    theTemplate = $compile($(dest).attr("src", $(src).attr("data-id")))(scope);

                } else {
                    if (destType == 'carousell')
                    {
                         console.log('voy al carousell ....bien!!')
                    } else


                    theTemplate = $compile('<div class="container-fluid image ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)" > <div class="embed-responsive embed-responsive-16by9 ndContainer" ndType="none" ><img  x-lvl-draggable="false" x-lvl-drop-target="true" ndType="image" x-on-select="selected(selectedEl)" src="'+dropID+'"  allowfullscreen></img></div></div>')(scope);

                }
            }
        }
    }

    return theTemplate;
}

function getTemplate($compile, scope, dropType, done) {
    if (dropType && dropType != 'image') {
        $.get('modules/designer/templates/'+dropType+'.html', function(data) {
            done($compile(data)(scope));
        });
    }
    else {
        done(null);
    }
}
