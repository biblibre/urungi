var module = angular.module("lvl.directives.dragdrop", ['lvl.services']);

var theTemplate;
var theTemplate2;
var theParent;
var mode;
var selectedElement;



module.directive('lvlDraggable', ['$rootScope', 'uuid', '$compile','$parse', function($rootScope, uuid, $compile, $parse) {
	    return {
	        restrict: 'A',
            /*scope: {
                onSelect: '&'
            },*/
	        link: function(scope, el, attrs, controller) {
	        	//console.log("linking draggable element");

	            angular.element(el).attr("draggable", "true");
	            var id = angular.element(el).attr("id");
	            if (!id) {
	                id = uuid.new()
	                angular.element(el).attr("id", id);
	            }



	            el.bind("dragstart", function(e) {
                    e.stopPropagation();
                    e.originalEvent.dataTransfer.setData('text', id);





                    theTemplate2 = $compile('<div id="ndDropped" class="container-fluid ndplaceholder" ></div>')(scope);

                    /*
                    //var jumbotronTemplate = '<node-dream-jumbotron> </node-dream-jumbotron>';
                    if (dropType == 'jumbotron')
                    {
                        console.log('is a jumbotron');
                        theTemplate = $compile('<div class="jumbotron" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" x-on-drop="dropped(dragEl, dropEl)">  <h1 x-lvl-draggable="true" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)">YES, Hello, world!</h1>     <p x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>     <p><a class="btn btn-primary btn-lg" role="button">Learn more</a></p>   </div>')(scope);
                        //theTemplate2 = $compile('<div id="ndDropped" class="jumbotron" x-lvl-draggable="true">  <h1 x-lvl-draggable="true">Hello, world!</h1>     <p x-lvl-draggable="true">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>     <p><a class="btn btn-primary btn-lg" role="button">Learn more</a></p>   </div>')(scope)
                    }
                    if (dropType == 'well')
                    {
                        console.log('is a well');
                        theTemplate = $compile('<div class="well" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="well"><p x-lvl-draggable="false" x-lvl-drop-target="true">this is a Paragraph inside a well panel</p></div>')(scope);
                        //theTemplate2 = $compile('<div class="well" x-lvl-draggable="false" ndType="well"><p x-lvl-draggable="false" contenteditable="true">this is a Paragraph inside a well panel</p></div>')(scope);

                    }

                    if (dropType == 'p')
                    {
                        console.log('is a paragraph');
                        theTemplate = $compile('<p x-lvl-draggable="false" x-lvl-drop-target="true">this is a Paragraph...</p>')(scope);
                        //theTemplate2 = $compile('<p id="ndDropped" x-lvl-draggable="false" >this is a Paragraph...</p>')(scope);
                    }

                    if (dropType == 'black')
                    {
                        console.log('is a black');
                        theTemplate = $compile('<p x-lvl-draggable="false" x-lvl-drop-target="true">this is a Paragraph...</p>')(scope);
                        //theTemplate2 = $compile('<div class="row" style="width:100%;height: 25px;background-color: #000000"></div>')(scope);
                    }

                    if (dropType == undefined)
                    {
                        console.log('is undefined');

                        //if (src != el)
                        //  el.append(src);

                        theTemplate = src;


                    }  */


	                $rootScope.$emit("LVL-DRAG-START");
	            });
	            
	            el.bind("dragend", function(e) {
                    e.stopPropagation();
                    var dest = document.getElementById('ndDropped');
                    //var theIndex = dest.index();
                    //var theParent = dest.parent();
                    if (dest != null)
                        dest.remove();
	                $rootScope.$emit("LVL-DRAG-END");
	            });

                el.bind("mouseover", function(e) {
                    e.stopPropagation();
                    scope.cleanAllLvlElement(angular.element(el));
                    angular.element(el).addClass('lvl-element');

                    //angular.element(el.parent()).removeClass('lvl-element');

                });

                el.bind("mouseleave", function(e) {
                    e.stopPropagation();
                    angular.element(el).removeClass('lvl-element');
                    angular.element(el).removeClass('selectedImage');

                });


                el.bind("click", function(e) {
                   // if (scope.editMode != true)
                    //{
                        e.preventDefault();
                        e.stopPropagation();

                    if (scope.selectedElement != null)
                    {
                        //console.log('quitando selected bind click');
                        scope.selectedElement.removeClass('selected');
                        scope.selectedElement.attr("contenteditable", "false");
                    }

                        angular.element(el).addClass('selected');
                        scope.selectedElement = angular.element(el);

                        console.log('selected bind click'+ scope.selectedElement);

                        scope.selectedBackgroundColor = scope.selectedElement.css('background-color');

                        var invoker = $parse(attrs.onSelect);

                        invoker(scope, {selectedEl: angular.element(el)} );
                        $rootScope.$emit("SELECTED");
                        if (angular.element(el).hasClass("editable"))
                        {
                            scope.editMode = true;
                            angular.element(el).attr("contenteditable", "true");
                        } else {
                            scope.editMode = false;
                            angular.element(el).attr("contenteditable", "false");
                        }

                        scope.$apply();

                        scope.isSelected = true;
                        scope.showTab(1);
                        //console.log('element selected bc '+selectedElement.attr('id'));
                        scope.getElementProperties();
                   // } else {
                       // scope.editMode = false;
                        console.log('edit mode =TRUE '+ scope.selectedElement);
                   // }
                });


                /*
                el.bind("dblclick", function(e) {
                    e.stopPropagation();
                /*
                    /*
                    scope.editMode = true;
                    angular.element(el).attr("contenteditable", "true");
                    scope.$apply();*/
                    //scope.colorpickersliders.show;
                /*}); */



                el.bind("blur", function(e) {
                    //e.stopPropagation();
                    e.stopImmediatePropagation();
                    if (scope.editMode == true && scope.editCommand == true)
                    {
                        //var self = this;
                        setTimeout(function() { el.click(); el.focus(); }, 10);
                        scope.editCommand = false;
                        console.log('estoy aqui');


                    //jQuery('p').hallo();
                        //editMode = false;
                        //angular.element(el).removeClass('editable');
                    }  else {

                        if (scope.editMode == true)
                        {
                            console.log('blur ing');
                            scope.editMode = false;
                            angular.element(el).attr("contenteditable", "false");

                        }
                    }
                    scope.$apply();
                });

	        }
    	}
	}]);

module.directive('lvlDropTarget', ['$rootScope', 'uuid', '$compile', function($rootScope, uuid, $compile) {
        return {
	        restrict: 'A',
	        /*scope: {
	            onDrop: '&'
	        },*/
	        link: function(scope, el, attrs, controller) {
	            var id = angular.element(el).attr("id");
	            if (!id) {
	                id = uuid.new()
	                angular.element(el).attr("id", id);
	            }
	                       
	            el.bind("dragover", function(e) {
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    e.stopPropagation();

                    //console.log('index in parent: '+ (el.parent).index(el));

                    //console.log('index: '+ el.index());

	              e.originalEvent.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
	              return false;
	            });
	            
	            el.bind("dragenter", function(e) {
	              // this / e.target is the current hover target.
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }

                    e.stopPropagation();


                    console.log('estoy aqui....');
                   /*
                    var dest = document.getElementById(id);
                    if ((angular.element(dest).attr("id") == 'mainContainer') || (angular.element(dest).attr("ndType") == 'well'))
                    {
                        angular.element(e.target).addClass('lvl-inside');
                        console.log('inside');
                    }  else {
	                    angular.element(e.target).addClass('lvl-over');
                    }
                  //angular.element(el.parent()).addClass('lvl-over');
                     */
                    var data = e.originalEvent.dataTransfer.getData("text");
                    var dest = document.getElementById(id);
                    var src = document.getElementById(data);
                    //if ((angular.element(dest).attr("id") == 'mainContainer') || (angular.element(dest).attr("ndType") == 'well') || (angular.element(dest).attr("ndType") == 'jumbotron'))
                    //if ((angular.element(dest).attr("id") == 'mainContainer') )









                    if ((angular.element(dest).attr("ndType") == 'mainContainer') )
                    {

                        theParent = el;
                        mode = 'append';
                        el.append(theTemplate2);
                        console.log('append');


                    } else {

                        var dropType = angular.element(src).attr("data-color");

                        console.log('dragenter este es un dropType: '+dropType);

                        //if (dropType == 'image')
                        //{
                            if ((angular.element(dest).attr("ndType") == 'photoHeader') )
                            {
                                console.log('This is a photo header...')
                                angular.element(el).addClass("selectedImage");
                                mode = 'photoHeader';

                            } else {

                                if ((angular.element(dest).attr("ndType") == 'image') )
                                {
                                    console.log('dragenter This is a image...');
                                    angular.element(el).addClass("selectedImage");
                                    mode = 'image';


                                } else  {

                                            if ((angular.element(dest).attr("ndType") == 'column') || (angular.element(dest).attr("ndType") == 'container') )
                                            {
                                                theParent = el;
                                                console.log('dragenter This is a column...');
                                                angular.element(el).addClass("selectedImage");
                                                mode = 'column';


                                            }    else   {
                                                        theParent = el;
                                                        mode = 'before';
                                                        el.before(theTemplate2);
                                                        console.log('before '+angular.element(dest).attr("id"));
                                                        }

                                         }



                                /*

                                else {
                                 theParent = el;
                                 mode = 'before';
                                 el.before(theTemplate2);
                                 console.log('before '+angular.element(dest).attr("id"));
                                 }   //AQUI
                                } else {

                                }
                                } */
                          /*  } else {
                                    console.log('dragenter before...');
                                    theParent = el;
                                    mode = 'before';
                                    el.before(theTemplate2);
                                    console.log('before '+angular.element(dest).attr("id"));
                                }
                            */
                    }

                    }
	            });
	            
	            el.bind("dragleave", function(e) {
	              angular.element(e.target).removeClass('lvl-over');  // this / e.target is previous target element.
                    angular.element(e.target).removeClass('lvl-inside');
                    angular.element(e.target).removeClass('selectedImage');
                    //angular.element(el.parent()).removeClass('lvl-over');
                    //var dest = document.getElementById('ndDropped');
                    //var theIndex = dest.index();
                    //var theParent = dest.parent();
                    //dest.remove();
                });
	            
	            el.bind("drop", function(e) {

                  angular.element(e.target).removeClass('selectedImage');

                      if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                      }

	                    e.stopPropagation(); // Necessary. Allows us to drop.

                        var dest = document.getElementById('ndDropped');
                    //var theIndex = dest.index();
                    //var theParent = dest.parent();
                    if (dest)
                        dest.remove();

                    //theParent.children()[theIndex].append(theTemplate);

                    //theTemplate2 = theTemplate;

                    //e.originalEvent.stopPropagation();

	            	var data = e.originalEvent.dataTransfer.getData("text");
	                var dest = document.getElementById(id);
	                var src = document.getElementById(data);

                    angular.element(dest).removeClass('selectedImage');

                    /*

                    var h1Element = '<h1  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H1 </h1>';
                    var h2Element = '<h2  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H2 </h2>';
                    var h3Element = '<h3  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H3 </h3>';
                    var h4Element = '<h4  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H4 </h4>';
                    var h5Element = '<h5  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H5 </h5>';
                    var h6Element = '<h6  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H5 </h6>';

                    var featureteHeader = '<h2 class="editable featurette-heading" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">Oh yeah, it is that good. <span class="text-muted">See for yourself.</span></h2>  '
                    var pElement = '<p class="editable" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">This is a simple text paragraph select to edit content.</p>';
                    var leadElement = '<p class="lead editable" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">This is a lead paragraph select to edit content.</p>';

                    //var pElement = '<textarea froala ng-model="myHtml"><h3>Powerful</h3><p class="text-light text-small">Loved by users and friendly with developers, our WYSIWYG editor comes with a powerful API and a strong documentation. Moreover it is very easy to integrate, customize and extend, so any developer will love playing around with it.</p></textarea>';

                    //var pElement = '<div class="froala-box" data-chars="8"><div class="froala-wrapper"><div contenteditable="true" class="froala-view froala-element not-msie f-inline" spellcheck="false" style="outline: 0px;"><h1><em><u><span style="color: #FBA026;" data-fr-verified="true">sdfgsdfg</span></u></em></h1></div><span class="fr-placeholder" unselectable="on">Enter Text Here</span></div><button tabindex="-1" type="button" class="fr-bttn html-switch" title="Hide HTML" data-cmd="html"><i class="fa fa-code"></i></button></div>';

                    var plead = '<p class="editable lead" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p> ';
                    var buttonElement = '<a class="editable btn btn-default" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="button"  role="button">My button</a>';
                    var colElement = '<div class="col-md-4 ndContainer" ndtype="column" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)">'+h3Element+pElement+'</div>';
                    var colElementCTA = '<div class="col-md-4 ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndtype="column" x-on-select="selected(selectedEl)">'+h3Element+pElement+buttonElement+'</div>';
                    var colImageCircle = '<div class="col-lg-4 ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndtype="column" x-on-select="selected(selectedEl)"> <img class="img-circle" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140"> '+h2Element+pElement+buttonElement+'</div>';


                    var inputElement = '<div class="form-group" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="formgroup" x-on-select="selected(selectedEl)"> <label for="exampleInputEmail1">Email address</label> <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Enter email"></div>';

                    var svgStarElement = '<svg version="1.1" id="pik_obj_86_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0.8 32 30.4" enable-background="new 0 0 32 32" xml:space="preserve" preserveAspectRatio="none"><path d="M32,12.408l-11.056-1.607L16,0.784l-4.944,10.018L0,12.408l8,7.799l-1.889,11.01L16,26.018l9.889,5.199L24,20.207L32,12.408z" fill="#000"></path></svg>';

                    var svgLineElement = '<svg version="1.0" id="pik_obj_88_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0.1 0.1 31.8 31.8" style="enable-background:new 0 0 32 32;" xml:space="preserve" preserveAspectRatio="none"><path d="M16,0.111C7.216,0.111,0.1,7.227,0.1,16.003C0.1,24.781,7.216,31.889,16,31.889c8.778,0,15.901-7.107,15.901-15.885C31.9,7.227,24.777,0.111,16,0.111z" fill="#000"></path></svg>';

                    var svgCircleElement = '<svg version="1.0" id="pik_obj_88_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0.1 0.1 31.8 31.8" style="enable-background:new 0 0 32 32;" xml:space="preserve" preserveAspectRatio="none"><path d="M16,0.111C7.216,0.111,0.1,7.227,0.1,16.003C0.1,24.781,7.216,31.889,16,31.889c8.778,0,15.901-7.107,15.901-15.885C31.9,7.227,24.777,0.111,16,0.111z" fill="#000"></path></svg>';

                    var svgSquareDotedLineElement = '<svg version="1.1" id="pik_obj_89_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 31.9 32" enable-background="new 0 0 32 32" xml:space="preserve" preserveAspectRatio="none"><path d="M0.037,0.066v5.155h2.538V2.52H5.29V0.066H0.037z M8.048,0v2.553h6.614V0H8.048z M17.438,0v2.553h6.554V0H17.438zM26.836,0.066V2.52h2.715v2.66h2.389V0.066H26.836z M29.534,7.996v6.526h2.429V7.996H29.534z M29.534,17.365v6.527h2.429v-6.527H29.534z M29.577,26.734v2.775h-2.686v2.346h5.048v-5.121H29.577z M17.493,29.447V32h6.563v-2.553H17.493z M8.048,29.447V32h6.614v-2.553H8.048z M2.63,29.51v-2.775H0.037v5.258H5.29v-2.481L2.63,29.51L2.63,29.51z M0.08,17.365v6.527h2.542v-6.527H0.08zM0.08,7.996v6.526h2.542V7.996H0.08z" fill="#000"></path></svg>';
                    //console.log('the drop type: '+angular.element(src).attr("data-color"));
                    var dropType = angular.element(src).attr("data-color");

                    if (dropType == 'image')
                    {
                        var dropID = angular.element(src).attr("data-id");
                        var destType = angular.element(dest).attr("ndType");
                        console.log('source is an image');

                        if (destType == 'photoHeader')
                        {
                            console.log('destiny is a photoHeader '+ angular.element(src).attr("data-id"));
                            angular.element(dest).children()[0].style.backgroundImage = "url('"+ angular.element(src).attr("data-id") +"')";

                        } else {
                            if (destType == 'homeFull')
                            {
                                console.log('destiny is a homeFull '+ angular.element(src).attr("data-id"));
                                dest.style.backgroundImage = "url('"+ angular.element(src).attr("data-id") +"')";
                            } else {
                                if (destType == 'image')
                                {
                                    console.log('destiny is a image '+ angular.element(src).attr("data-id"));
                                    angular.element(dest).attr("src", angular.element(src).attr("data-id"));
                                } else {

                                    theTemplate = $compile('<div class="container-fluid image ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)" > <div class="embed-responsive embed-responsive-16by9 ndContainer" ndType="none" ><img  x-lvl-draggable="false" x-lvl-drop-target="true" ndType="image" x-on-select="selected(selectedEl)" src="'+dropID+'"  allowfullscreen></img></div></div>')(scope);

                                }
                            }
                        }
                    }



                    if (dropType == 'jumbotron')
                    {
                        console.log('is a jumbotron');
                        theTemplate = $compile('<div class="jumbotron" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="jumbotron">  '+h1Element+pElement+buttonElement+'</div>')(scope);
                    }
                    if (dropType == 'well')
                    {
                        console.log('is a well');
                        theTemplate = $compile('<div class="well" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="well" x-on-select="selected(selectedEl)">'+pElement+'</div>')(scope);
                    }

                    if (dropType == 'p')
                    {
                        console.log('is a paragraph');
                        theTemplate = $compile(pElement)(scope);
                    }

                    if (dropType == 'lead')
                    {
                        console.log('is a lead');
                        theTemplate = $compile(leadElement)(scope);
                    }

                    if (dropType == 'h1')
                    {
                        console.log('h1 row');
                        theTemplate = $compile(h1Element)(scope);
                    }
                    if (dropType == 'h2')
                    {
                        console.log('h2 row');
                        theTemplate = $compile(h2Element)(scope);
                    }
                    if (dropType == 'h3')
                    {
                        console.log('h3 row');
                        theTemplate = $compile(h3Element)(scope);
                    }
                    if (dropType == 'h4')
                    {
                        console.log('h4 row');
                        theTemplate = $compile(h4Element)(scope);
                    }
                    if (dropType == 'h5')
                    {
                        console.log('h5 row');
                        theTemplate = $compile(h5Element)(scope);
                    }
                    if (dropType == 'h6')
                    {
                        console.log('h6 row');
                        theTemplate = $compile(h6Element)(scope);
                    }

                    if (dropType == 'button')
                    {
                        console.log('is a button');
                        theTemplate = $compile(buttonElement)(scope);
                    }

                    if (dropType == 'gridrow')
                    {
                        console.log('is a grid row');
                        theTemplate = $compile('<div class="container-fluid ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)">'+colElement+colElement+colElement+'</div>')(scope);
                    }


                    if (dropType == '3colscta')
                    {
                        console.log('is a 3 cols with cta row');
                        theTemplate = $compile('<div class="container-fluid ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)">'+colElementCTA+colElementCTA+colElementCTA+'</div>')(scope);
                    }

                    if (dropType == '3colsImageCircle')
                    {
                        console.log('is a 3 images cols with cta row');
                        theTemplate = $compile('<div class="container-fluid ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)">'+colImageCircle+colImageCircle+colImageCircle+'</div>')(scope);
                    }


                    if (dropType == 'buttongroup')
                    {
                        console.log('is a button group');
                        theTemplate = $compile('<div class="btn-group" ndType="button group">'+buttonElement+buttonElement+buttonElement+'</div>')(scope);
                    }

                    if (dropType == 'panel')
                    {
                        console.log('is a panel');
                        theTemplate = $compile('<div class="panel panel-default" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="panel" x-on-select="selected(selectedEl)"> <div class="panel-heading" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="panelHeading" x-on-select="selected(selectedEl)">'+h3Element+'</div> <div class="panel-body" ndType="none" x-lvl-drop-target="true">'+pElement+'</div></div>')(scope);
                    }

                    if (dropType == 'imageTextLarge')
                    {
                        console.log('is a imageTextLarge');
                        theTemplate =
                        $compile(' <div class="container-fluid featurette ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)"> '+
                                        '<div class="col-md-7 col-md-push-5 ndContainer" ndtype="column" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="col" x-on-select="selected(selectedEl)"> '+
                                            featureteHeader+
                                            plead+
                                        '</div> '+
                                        '<div class="col-md-5 col-md-pull-7 ndContainer" ndtype="column"> '+
                                            '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" class="featurette-image img-responsive center-block" data-src="holder.js/500x500/auto" alt="500x500" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjE5MC4zMTI1IiB5PSIyNTAiIHN0eWxlPSJmaWxsOiNBQUFBQUE7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LWZhbWlseTpBcmlhbCwgSGVsdmV0aWNhLCBPcGVuIFNhbnMsIHNhbnMtc2VyaWYsIG1vbm9zcGFjZTtmb250LXNpemU6MjNwdDtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj41MDB4NTAwPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true">'+
                                        '</div> '+
                                    '</div>')(scope);
                    }

                    if (dropType == 'textImageLarge')
                    {
                        console.log('is a textImageLarge');
                        theTemplate =
                            $compile(' <div class="container-fluid featurette ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)"> '+
                                '<div class="col-md-7 ndContainer" ndtype="column" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="col" x-on-select="selected(selectedEl)"> '+
                                featureteHeader+
                                plead+
                                '</div> '+
                                '<div class="col-md-5 ndContainer" ndtype="column"> '+
                                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" class="featurette-image img-responsive center-block" data-src="holder.js/500x500/auto" alt="500x500" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjE5MC4zMTI1IiB5PSIyNTAiIHN0eWxlPSJmaWxsOiNBQUFBQUE7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LWZhbWlseTpBcmlhbCwgSGVsdmV0aWNhLCBPcGVuIFNhbnMsIHNhbnMtc2VyaWYsIG1vbm9zcGFjZTtmb250LXNpemU6MjNwdDtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj41MDB4NTAwPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true">'+
                                '</div> '+
                                '</div>')(scope);

                    }

                    if (dropType == 'featureteDivider')
                    {
                        console.log('is a featurete divider');
                        theTemplate = $compile('<hr class="featurette-divider"  x-lvl-draggable="false" x-lvl-drop-target="true" ndType="featureteDivider" x-on-select="selected(selectedEl)">')(scope);
                        }

                    if (dropType == 'form')
                    {
                        console.log('is a form');
                        theTemplate = $compile('<form role="form" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="form" style="border:2px dashed #8a3104;padding: 10px;" x-on-select="selected(selectedEl)">'+inputElement+'</form>')(scope);
                    }

                    if (dropType == 'input')
                    {
                        console.log('is a input');
                        theTemplate = $compile(inputElement)(scope);
                    }

                    if (dropType == 'youtube')
                    {
                        console.log('youtube');
                        theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="youtube" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9" ndType="none"><iframe  ndType="none" class="embed-responsive-item" src="https://www.youtube.com/embed/1cbAYSahg7g"  allowfullscreen></iframe></div></div>')(scope);
                    }

                    if (dropType == 'vimeo')
                    {
                        console.log('vimeo');

                            theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="vimeo" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9" ndType="none"><iframe  ndType="none" class="embed-responsive-item" src="https://player.vimeo.com/video/120774659"  allowfullscreen></iframe></div></div>')(scope);

                        // }
                    }
                    if (dropType == 'slidesharedd')
                    {
                        console.log('slideshare');
                        theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="vimeo" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9" ndType="none"><iframe  ndType="none" class="embed-responsive-item" src="//www.slideshare.net/slideshow/embed_code/44600700"  allowfullscreen></iframe></div></div>')(scope);
                    }

                    if (dropType == 'svgStar')
                    {
                        console.log('svgStar');
                        theTemplate = $compile(svgStarElement)(scope);
                    }

                    if (dropType == 'accordion')
                    {
                        console.log('accordion');
                        theTemplate = $compile('<div class="panel-group" id="accordion" >'+

                         '   <!-- Accordion item start -->  '+
                            '<div class="panel panel-default">  '+
                        '<div class="panel-heading">    '+
                        '<h4 class="panel-title font-alt">  '+
                        '<a ndType="accordionTitle" data-toggle="collapse" data-parent="#accordion" href="#support1" aria-expanded="false" class="collapsed">'+
                        'Support Question 1 '+
                        '</a> '+
                        '</h4> '+
                        '</div>  '+
                        '<div id="support1" class="panel-collapse collapse in" aria-expanded="true" > '+
                        '<div class="panel-body">  '+
                            pElement+
                        '</div>  '+
                        '</div> '+
                        '</div>  '+
                        '<!-- Accordion item end --> '+

                        '<!-- Accordion item start --> '+
                        '<div class="panel panel-default">  '+
                        '<div class="panel-heading">  '+
                        '<h4 class="panel-title font-alt">  '+
                        '<a ndType="accordionTitle" data-toggle="collapse" data-parent="#accordion" href="#support2" class="" aria-expanded="true">  '+
                        'Support Question 2 '+
                        '</a>  '+
                        '</h4> '+
                        '</div> '+
                        '<div id="support2" class="panel-collapse collapse in" aria-expanded="true"> '+
                        '<div class="panel-body"> '+
                            pElement+
                        '</div> '+
                        '</div> '+
                        '</div> '+
                        '<!-- Accordion item end --> '+

                        '</div>')(scope);
                    }

                    if (dropType == 'photoHeader')
                    {
                        console.log('creating photoHeader')
                        theTemplate = $compile(
                    '<section class="module"  x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="photoHeader" style="position:relative">    '+
                        '<div class="container-fluid module" ndType="none"  data-background="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-4.jpg" style="height: 100%;width: 100%;top:0px;left:0px;z-index: 10;position:absolute;background-image: url(http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-4.jpg);"> '+
                        '</div>' +
                            //'<section  x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="photoHeader" class="module bg-dark bg-dark-60" data-background="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-4.jpg" style="background-image: url(http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-4.jpg);"> '+
                            '<div class="container-fluid" ndType="none" style="height: 100%; width:100%;top:0px;left:0px;z-index: 10;position:absolute;padding-top:100px;"> '+

                                '<div class="row" ndType="none"> '+

                                    '<div class="col-sm-6 col-sm-offset-3 ndContainer" ndType="column"> '+
                                        '<div class="module-title font-alt ndContainer" ndType="column"> '+
                                            h1Element+
                                        '</div>'+
                                        '<div class="module-subtitle font-serif mb-0" ndType="none"> '+
                                            pElement+
                                        '</div> '+

                                    '</div> '+

                                '</div><!-- .row -->  '+

                            '</div> '+
                        //'</section>' +
                    '</section>')(scope);
                    }

                    if (dropType == 'blogPost')
                    {
                        console.log('blogPost');
                        theTemplate = $compile(
                            '<div class="col-md-6 col-lg-6 ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="column">'+

                        '<div class="post" ndType="none">'+

                        '<div class="post-thumbnail" ndType="none"> '+
                        '<a href="blog-single-right.html"><img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/post-1.jpg" alt=""></a> '+
                        '</div> '+

                        '<div class="post-header font-alt">'+
                        '<h2 class="post-title"><a href="blog-single-right.html">Our trip to the Alps</a></h2> '+
                        '<div class="post-meta">  '+
                        'By <a href="#">Mark Stone</a> | 23 November | 3 Comments '+
                        '            </div> '+
                        '        </div>  '+

                        '        <div class="post-entry"> '+
                        '            <p>A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.</p> '+
                        '        </div> '+

                        '       <div class="post-more">  '+
                        '            <a href="blog-single-right.html" class="more-link">Read more</a>  '+
                        '       </div> '+

                        '   </div> '+

                        '</div> ')(scope);
                    }
                    if (dropType == 'team')
                    {
                        console.log('team');
                        theTemplate = $compile(
                            '<div class="container-fluid ndContainer" ndType="container" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)">'+

                        '<!-- Team item star --> '+
                        '<div ndType="column" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" class="col-sm-6 col-md-3 mb-sm-20 wow fadeInUp animated ndContainer" style="visibility: visible;"> '+

                        '<div class="team-item"> '+
                        '<div class="team-image"> '+
                        '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/team-1.jpg" alt="">  '+
                        '<div class="team-detail">   '+
                        '<h5 class="font-alt">Hi all</h5>  '+
                        '<p class="font-serif">Lorem ipsum dolor sit amet, consectetur adipiscing elit lacus, a&nbsp;iaculis diam.</p> '+
                        '<div class="team-social"> '+
                        '<a href="#"><i class="fa fa-facebook"></i></a> '+
                        '<a href="#"><i class="fa fa-twitter"></i></a>  '+
                        '<a href="#"><i class="fa fa-dribbble"></i></a> '+
                        '<a href="#"><i class="fa fa-skype"></i></a>  '+
                        '</div> '+
                        '</div>  '+
                        '</div>  '+
                        '<div class="team-descr font-alt">   '+
                        '<div class="team-name">Jim Stone</div>  '+
                        '<div class="team-role">Art Director</div>  '+
                        '</div> '+
                        '</div>  '+

                        '</div> '+
                        '<!-- Team item end --> '+

                        '<!-- Team item star --> '+
                        '<div ndType="column" x-lvl-draggable="false" x-lvl-drop-target="true"  x-on-select="selected(selectedEl)" class="col-sm-6 col-md-3 mb-sm-20 wow fadeInUp animated ndContainer" style="visibility: visible;"> '+

                        '<div class="team-item">'+
                        '<div class="team-image">'+
                        '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/team-2.jpg" alt="">'+
                        '<div class="team-detail">  '+
                        '<h5 class="font-alt">Good day</h5> '+
                        '<p class="font-serif">Lorem ipsum dolor sit amet, consectetur adipiscing elit lacus, a&nbsp;iaculis diam.</p>  '+
                        '<div class="team-social">  '+
                        '<a href="#"><i class="fa fa-facebook"></i></a> '+
                        '<a href="#"><i class="fa fa-twitter"></i></a> '+
                        '<a href="#"><i class="fa fa-dribbble"></i></a>  '+
                        '<a href="#"><i class="fa fa-skype"></i></a> '+
                        '</div> '+
                        '</div> '+
                        '</div> '+
                        '<div class="team-descr font-alt"> '+
                        '<div class="team-name">Andy River</div> '+
                        '<div class="team-role">Creative director</div>  '+
                        '</div>  '+
                        '</div>  '+

                        '</div>  '+
                        '<!-- Team item end -->  '+

                        '<!-- Team item star -->  '+
                        '<div ndType="column" x-lvl-draggable="false" x-lvl-drop-target="true"  x-on-select="selected(selectedEl)" class="col-sm-6 col-md-3 mb-sm-20 wow fadeInUp animated ndContainer" style="visibility: visible;">  '+

                        '<div class="team-item"> '+
                        '<div class="team-image"> '+
                        '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/team-3.jpg" alt="">  '+
                        '<div class="team-detail">  '+
                        '<h5 class="font-alt">Hello</h5>  '+
                        '<p class="font-serif">Lorem ipsum dolor sit amet, consectetur adipiscing elit lacus, a&nbsp;iaculis diam.</p> '+
                        '<div class="team-social">  '+
                        '<a href="#"><i class="fa fa-facebook"></i></a> '+
                        '<a href="#"><i class="fa fa-twitter"></i></a> '+
                        '<a href="#"><i class="fa fa-dribbble"></i></a>  '+
                        '<a href="#"><i class="fa fa-skype"></i></a> '+
                        '</div>  '+
                        '</div>  '+
                        '</div>   '+
                        '<div class="team-descr font-alt">   '+
                        '<div class="team-name">Adele Snow</div>  '+
                        '<div class="team-role">Account manager</div> '+
                        '</div>  '+
                        '</div>  '+

                        '</div>  '+
                        '<!-- Team item end -->  '+

                        '<!-- Team item star -->  '+
                        '<div ndType="column" x-lvl-draggable="false" x-lvl-drop-target="true"  x-on-select="selected(selectedEl)" class="col-sm-6 col-md-3 mb-sm-20 wow fadeInUp animated ndContainer" style="visibility: visible;"> '+

                        '<div class="team-item">  '+
                        '<div class="team-image"> '+
                        '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/team-4.jpg" alt="">  '+
                        '<div class="team-detail"> '+
                        '<h5 class="font-alt">Yes, its me</h5> '+
                        '<p class="font-serif">Lorem ipsum dolor sit amet, consectetur adipiscing elit lacus, a&nbsp;iaculis diam.</p> '+
                        '<div class="team-social">'+
                        '<a href="#"><i class="fa fa-facebook"></i></a> '+
                        '<a href="#"><i class="fa fa-twitter"></i></a> '+
                        '<a href="#"><i class="fa fa-dribbble"></i></a> '+
                        '<a href="#"><i class="fa fa-skype"></i></a> '+
                        '</div> '+
                        '</div>  '+
                        '</div>  '+
                        '<div class="team-descr font-alt">  '+
                        '<div class="team-name">Dylan Woods</div>  '+
                        '<div class="team-role">Developer</div> '+
                        '</div> '+
                        '</div>  '+

                        '</div>  '+
                        '<!-- Team item end --> '+

                        '</div>')(scope);
                    }

                    if (dropType == 'worksGrid')
                    {
                        console.log('worksGrid');
                        theTemplate = $compile(
                    '<ul id="works-grid" class="works-grid works-grid-4 works-hover-w" style="position: relative;"> '+

                    '<!-- Portfolio item start -->   '+
                    '<li class="work-item illustration webdesign" >  '+
                    //'<a href="portfolio-single-1.html">  '+
                    '<div class="work-image">   '+
                    '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-1.jpg" alt="">  '+
                    '</div> '+
                    '<div class="work-caption font-alt"> '+
                    '<h3 class="work-title">Corporate Identity MENE</h3> '+
                    '<div class="work-descr">  '+
                    'Illustration  '+
                    '</div> '+
                    '</div> '+
                    //'</a>  '+
                    '</li> '+
                    '<!-- Portfolio item end --> '+

                    '<!-- Portfolio item start -->  '+
                    '<li class="work-item marketing photography" > '+
                    '<a href="portfolio-single-1.html"> '+
                    '<div class="work-image"> '+
                    '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-2.jpg" alt=""> '+
                    '</div> '+
                    '<div class="work-caption font-alt"> '+
                    '<h3 class="work-title">Bag MockUp</h3> '+
                    '<div class="work-descr"> '+
                    'Marketing '+
                    '</div>'+
                    '</div> '+
                    '</a> '+
                    '</li> '+
                    '<!-- Portfolio item end --> '+

                    '<!-- Portfolio item start --> '+
                    '<li class="work-item illustration photography" > '+
                    '<a href="portfolio-single-1.html"> '+
                    '<div class="work-image"> '+
                    '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-3.jpg" alt=""> '+
                    '</div> '+
                    '<div class="work-caption font-alt"> '+
                    '<h3 class="work-title">Disk Cover</h3> '+
                    '<div class="work-descr"> '+
                    'Illustration  '+
                    '</div> '+
                    '</div> '+
                    '</a> '+
                    '</li>  '+
                    '<!-- Portfolio item end --> '+

                    '<!-- Portfolio item start --> '+
                    '<li class="work-item marketing photography" > '+
                    '<a href="portfolio-single-1.html"> '+
                    '<div class="work-image"> '+
                    '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-4.jpg" alt=""> '+
                    '</div> '+
                    '<div class="work-caption font-alt"> '+
                    '<h3 class="work-title">Business Card</h3> '+
                    '<div class="work-descr"> '+
                    'Photography '+
                    '</div> '+
                    '</div> '+
                    '</a> '+
                    '</li> '+
                    '<!-- Portfolio item end --> '+

                    '<!-- Portfolio item start --> '+
                    '<li class="work-item illustration webdesign" > '+
                    '<a href="portfolio-single-1.html"> '+
                    '<div class="work-image"> '+
                    '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-5.jpg" alt=""> '+
                    '</div> '+
                    '<div class="work-caption font-alt"> '+
                    '<h3 class="work-title">Business Cards</h3> '+
                    '<div class="work-descr"> '+
                    'Webdesign '+
                    '</div> '+
                    '</div> '+
                    '</a> '+
                    '</li> '+
                    '<!-- Portfolio item end --> '+

                    '<!-- Portfolio item start --> '+
                    '<li class="work-item marketing webdesign" > '+
                    '<a href="portfolio-single-1.html"> '+
                    '<div class="work-image"> '+
                    '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-6.jpg" alt=""> '+
                    '</div> '+
                    '<div class="work-caption font-alt"> '+
                    '<h3 class="work-title">Business Cards in paper clip</h3> '+
                    '<div class="work-descr"> '+
                    'Marketing '+
                    '</div> '+
                    '</div> '+
                    '</a>'+
                    '</li> '+
                    '<!-- Portfolio item end --> '+

                    '<!-- Portfolio item start --> '+
                    '<li class="work-item marketing webdesign" > '+
                    '<a href="portfolio-single-1.html"> '+
                    '<div class="work-image"> '+
                    '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-7.jpg" alt=""> '+
                    '</div> '+
                    '<div class="work-caption font-alt"> '+
                    '<h3 class="work-title">Business Cards in paper clip</h3> '+
                    '<div class="work-descr"> '+
                    'Marketing '+
                    '</div> '+
                    '</div>'+
                    '</a> '+
                    '</li>  '+
                    '<!-- Portfolio item end --> '+

                    '<!-- Portfolio item start -->  '+
                    '<li class="work-item illustration webdesign" > '+
                    '<a href="portfolio-single-1.html"> '+
                    '<div class="work-image"> '+
                    '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-1.jpg" alt=""> '+
                    '</div> '+
                    '<div class="work-caption font-alt"> '+
                    '<h3 class="work-title">Corporate Identity</h3> '+
                    '<div class="work-descr"> '+
                    'Illustration '+
                    '</div> '+
                    '</div> '+
                    '</a> '+
                    '</li> '+
                    '<!-- Portfolio item end --> '+



                    '</ul>')(scope);
                }
                    if (dropType == 'carousell')
                    {
                        console.log('carousell');
                        theTemplate = $compile(
                            '<div id="carousel-example-generic" class="carousel slide" data-ride="carousel"> '+
                        '<!-- Indicators --> '+
                        ' <ol class="carousel-indicators">  '+
                        '<li data-target="#carousel-example-generic" data-slide-to="0" class="active"></li> '+
                        '<li data-target="#carousel-example-generic" data-slide-to="1"></li> '+
                        '<li data-target="#carousel-example-generic" data-slide-to="2"></li> '+
                        '</ol> '+

                        '<!-- Wrapper for slides --> '+
                        '<div class="carousel-inner" role="listbox">'+
                        '<div class="item active left">'+
                        '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" data-src="holder.js/900x500/auto/#777:#555/text:First slide" alt="First slide [900x500]" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDkwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzc3NyIvPjxnPjx0ZXh0IHg9IjMxNy43MzQzNzUiIHk9IjI1MCIgc3R5bGU9ImZpbGw6IzU1NTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZTo0MnB0O2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPkZpcnN0IHNsaWRlPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true"> '+
                        '</div> '+
                        '<div class="item next left"> '+
                        '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" data-src="holder.js/900x500/auto/#666:#444/text:Second slide" alt="Second slide [900x500]" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDkwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzY2NiIvPjxnPjx0ZXh0IHg9IjI3Ny4yODEyNSIgeT0iMjUwIiBzdHlsZT0iZmlsbDojNDQ0O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWwsIEhlbHZldGljYSwgT3BlbiBTYW5zLCBzYW5zLXNlcmlmLCBtb25vc3BhY2U7Zm9udC1zaXplOjQycHQ7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+U2Vjb25kIHNsaWRlPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true"> '+
                        '</div> '+
                        '<div class="item"> '+
                        '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" data-src="holder.js/900x500/auto/#555:#333/text:Third slide" alt="Third slide [900x500]" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDkwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzU1NSIvPjxnPjx0ZXh0IHg9IjMwOC40MjE4NzUiIHk9IjI1MCIgc3R5bGU9ImZpbGw6IzMzMztmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZTo0MnB0O2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPlRoaXJkIHNsaWRlPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true"> '+
                        '</div> '+
                        '</div>'+

                        '<!-- Controls -->'+
                        '<a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">'+
                        '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>'+
                        '<span class="sr-only">Previous</span> '+
                        '</a> '+
                        '<a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next"> '+
                        '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>'+
                        '<span class="sr-only">Next</span> '+
                        '</a> '+
                        '</div>')(scope);
                    }


                    if (dropType == 'slideshare')
                    {
                        console.log('homeFull');
                        theTemplate = $compile(
                        '<section x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="homeFull" class="home-section home-parallax home-fade home-full-height bg-dark-30" style="height: 500px;background-image: url(http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-2.jpg);"> '+
                        '<div class="hs-caption"> '+
                        '<div class="caption-content" style="opacity: 1;"> '+
                        '<div class="hs-title-size-1 font-alt mb-30"> '+
                        '<p class="editable" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">Hello &amp; welcome </p>'+
                        '</div> '+
                        '<div class="hs-title-size-4 font-alt mb-40"> '+
                        '<p class="editable" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">We are Rival </p>'+
                        '</div> '+
                        '<a x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="button"  role="button" href="#about" class="editable section-scroll btn btn-border-w btn-round">Learn More</a> '+
                        '</div> '+
                        '</div> '+
                        '</section>')(scope);
                    }
                           */
        //http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/portfolio-wide-col4.html

                    var dropType = angular.element(src).attr("data-color");

                    theTemplate = getTemplate(src,dest,$compile, scope, dropType);

                    if (dropType == undefined)
                    {
                        console.log('is undefined');
                        theTemplate = src;
                    }

                    if (mode == 'append')
                    {
                        theParent.append(theTemplate);
                        console.log('final append');
                    }

                    if (mode == 'column')
                    {
                        console.log('mode column ...');
                        //theParent.append(src);

                        var links = theTemplate;
                        //Remove the links from the .links div
                        //$(this).children(".links").html("");
                        //Append the links to the .submitted div
                        //$(this).children(".submitted").append(links);

                        //theTemplate.appendTo(theParent);
                        //var src = document.getElementById(data);

                        //theTemplate = $compile('<div id="ndDropped" class="container-fluid ndplaceholder" ></div>')(scope);

                        theParent.append(theTemplate);

                        theTemplate.attr("id",'deleteME');


                        //theTemplate = $compile('<div id="ndDropped" class="container-fluid ndplaceholder" ></div>')(scope);





                        //theTemplate.appendTo(data);

                        //theTemplate.parent.remove(theTemplate);


                    }

                    if (mode == 'before')
                    {
                        theParent.before(theTemplate);
                    }
                    scope.getAllElements();


                   /*

                    var dropType = angular.element(src).attr("data-color");


                    var theTemplate;


                    //var jumbotronTemplate = '<node-dream-jumbotron> </node-dream-jumbotron>';
                    if (dropType == 'jumbotron')
                    {
                        console.log('is a jumbotron');
                        theTemplate = $compile('<div class="jumbotron" x-lvl-draggable="true" x-lvl-drop-target="true">  <h1 x-lvl-draggable="true" x-lvl-drop-target="true" >Hello, world!</h1>     <p x-lvl-draggable="false" x-lvl-drop-target="true" >This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>     <p><a class="btn btn-primary btn-lg" role="button">Learn more</a></p>   </div>')(scope);
                    }
                    if (dropType == 'well')
                    {
                        console.log('is a well');
                        theTemplate = $compile('<div class="well" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="well"><p x-lvl-draggable="false" x-lvl-drop-target="true">this is a Paragraph inside a well panel</p></div>')(scope);
                    }

                    if (dropType == 'p')
                    {
                        console.log('is a paragraph');
                        theTemplate = $compile('<p x-lvl-draggable="false" x-lvl-drop-target="true">this is a Paragraph...</p>')(scope);
                    }

                    if (dropType == undefined)
                    {
                        console.log('is undefined');

                        //if (src != el)
                          //  el.append(src);

                        theTemplate = src;


                    }



                    if ((angular.element(dest).attr("id") == 'mainContainer') || (angular.element(dest).attr("ndType") == 'well'))
                    {
                        el.append(theTemplate);
                        console.log('append');
                    } else {
                        el.before(theTemplate);
                        console.log('before '+angular.element(dest).attr("id"));
                    }
                    */
	               // scope.onDrop({dragEl: src, dropEl: dest});
	            });

	            $rootScope.$on("LVL-DRAG-START", function() {
                    //TODO: error cuando se suelta el drag
                    //if (!e.isUndefined)
                      //  e.stopPropagation();
                    var el = document.getElementById(id);
	                angular.element(el).addClass("lvl-target");

	            });
	            
	            $rootScope.$on("LVL-DRAG-END", function() {
                    //if (!e.isUndefined)
                      //  e.stopPropagation();
	                var el = document.getElementById(id);
	                angular.element(el).removeClass("lvl-target");
	                angular.element(el).removeClass("lvl-over");
	            });
	        }
    	}
	}]);


function getTemplate(src,dest, $compile, scope, dropType)
{

   var theTemplate = '';

    var h1Element = '<h1  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H1 </h1>';
    var h2Element = '<h2  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H2 </h2>';
    var h3Element = '<h3  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H3 </h3>';
    var h4Element = '<h4  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H4 </h4>';
    var h5Element = '<h5  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H5 </h5>';
    var h6Element = '<h6  class="editable" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H5 </h6>';

    var featureteHeader = '<h2 class="editable featurette-heading" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">Oh yeah, it is that good. <span class="text-muted">See for yourself.</span></h2>  '
    var pElement = '<p class="editable" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">This is a simple text paragraph select to edit content.</p>';
    var leadElement = '<p class="lead editable" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">This is a lead paragraph select to edit content.</p>';

    //var pElement = '<textarea froala ng-model="myHtml"><h3>Powerful</h3><p class="text-light text-small">Loved by users and friendly with developers, our WYSIWYG editor comes with a powerful API and a strong documentation. Moreover it is very easy to integrate, customize and extend, so any developer will love playing around with it.</p></textarea>';

    //var pElement = '<div class="froala-box" data-chars="8"><div class="froala-wrapper"><div contenteditable="true" class="froala-view froala-element not-msie f-inline" spellcheck="false" style="outline: 0px;"><h1><em><u><span style="color: #FBA026;" data-fr-verified="true">sdfgsdfg</span></u></em></h1></div><span class="fr-placeholder" unselectable="on">Enter Text Here</span></div><button tabindex="-1" type="button" class="fr-bttn html-switch" title="Hide HTML" data-cmd="html"><i class="fa fa-code"></i></button></div>';

    var plead = '<p class="editable lead" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p> ';
    var buttonElement = '<a class="editable btn btn-default" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="button"  role="button">My button</a>';
    var colElement = '<div class="col-md-4 ndContainer" ndtype="column" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)">'+h3Element+pElement+'</div>';
    var colElementCTA = '<div class="col-md-4 ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndtype="column" x-on-select="selected(selectedEl)">'+h3Element+pElement+buttonElement+'</div>';
    var colImageCircle = '<div class="col-lg-4 ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndtype="column" x-on-select="selected(selectedEl)"> <img class="img-circle" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="data:image/gif;base64,R0lGODlhAQABAIAAAHd3dwAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" alt="Generic placeholder image" width="140" height="140"> '+h2Element+pElement+buttonElement+'</div>';


    var inputElement = '<div class="form-group" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="formgroup" x-on-select="selected(selectedEl)"> <label for="exampleInputEmail1">Email address</label> <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Enter email"></div>';

    var svgStarElement = '<svg version="1.1" id="pik_obj_86_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0.8 32 30.4" enable-background="new 0 0 32 32" xml:space="preserve" preserveAspectRatio="none"><path d="M32,12.408l-11.056-1.607L16,0.784l-4.944,10.018L0,12.408l8,7.799l-1.889,11.01L16,26.018l9.889,5.199L24,20.207L32,12.408z" fill="#000"></path></svg>';

    var svgLineElement = '<svg version="1.0" id="pik_obj_88_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0.1 0.1 31.8 31.8" style="enable-background:new 0 0 32 32;" xml:space="preserve" preserveAspectRatio="none"><path d="M16,0.111C7.216,0.111,0.1,7.227,0.1,16.003C0.1,24.781,7.216,31.889,16,31.889c8.778,0,15.901-7.107,15.901-15.885C31.9,7.227,24.777,0.111,16,0.111z" fill="#000"></path></svg>';

    var svgCircleElement = '<svg version="1.0" id="pik_obj_88_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0.1 0.1 31.8 31.8" style="enable-background:new 0 0 32 32;" xml:space="preserve" preserveAspectRatio="none"><path d="M16,0.111C7.216,0.111,0.1,7.227,0.1,16.003C0.1,24.781,7.216,31.889,16,31.889c8.778,0,15.901-7.107,15.901-15.885C31.9,7.227,24.777,0.111,16,0.111z" fill="#000"></path></svg>';

    var svgSquareDotedLineElement = '<svg version="1.1" id="pik_obj_89_svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="100%" height="100%" viewBox="0 0 31.9 32" enable-background="new 0 0 32 32" xml:space="preserve" preserveAspectRatio="none"><path d="M0.037,0.066v5.155h2.538V2.52H5.29V0.066H0.037z M8.048,0v2.553h6.614V0H8.048z M17.438,0v2.553h6.554V0H17.438zM26.836,0.066V2.52h2.715v2.66h2.389V0.066H26.836z M29.534,7.996v6.526h2.429V7.996H29.534z M29.534,17.365v6.527h2.429v-6.527H29.534z M29.577,26.734v2.775h-2.686v2.346h5.048v-5.121H29.577z M17.493,29.447V32h6.563v-2.553H17.493z M8.048,29.447V32h6.614v-2.553H8.048z M2.63,29.51v-2.775H0.037v5.258H5.29v-2.481L2.63,29.51L2.63,29.51z M0.08,17.365v6.527h2.542v-6.527H0.08zM0.08,7.996v6.526h2.542V7.996H0.08z" fill="#000"></path></svg>';
    //console.log('the drop type: '+angular.element(src).attr("data-color"));


    if (dropType == 'image')
    {
        var dropID = angular.element(src).attr("data-id");
        var destType = angular.element(dest).attr("ndType");
        console.log('source is an image');

        if (destType == 'photoHeader')
        {
            console.log('destiny is a photoHeader '+ angular.element(src).attr("data-id"));
            angular.element(dest).children()[0].style.backgroundImage = "url('"+ angular.element(src).attr("data-id") +"')";

        } else {
            if (destType == 'homeFull')
            {
                console.log('destiny is a homeFull '+ angular.element(src).attr("data-id"));
                dest.style.backgroundImage = "url('"+ angular.element(src).attr("data-id") +"')";
            } else {
                if (destType == 'image')
                {
                    console.log('destiny is a image '+ angular.element(src).attr("data-id"));
                    angular.element(dest).attr("src", angular.element(src).attr("data-id"));
                } else {

                    theTemplate = $compile('<div class="container-fluid image ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)" > <div class="embed-responsive embed-responsive-16by9 ndContainer" ndType="none" ><img  x-lvl-draggable="false" x-lvl-drop-target="true" ndType="image" x-on-select="selected(selectedEl)" src="'+dropID+'"  allowfullscreen></img></div></div>')(scope);

                }
            }
        }
    }



    if (dropType == 'jumbotron')
    {
        console.log('is a jumbotron');
        theTemplate = $compile('<div class="jumbotron" x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="jumbotron">  '+h1Element+pElement+buttonElement+'</div>')(scope);
    }
    if (dropType == 'well')
    {
        console.log('is a well');
        theTemplate = $compile('<div class="well" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="well" x-on-select="selected(selectedEl)">'+pElement+'</div>')(scope);
    }

    if (dropType == 'p')
    {
        console.log('is a paragraph');
        theTemplate = $compile(pElement)(scope);
    }

    if (dropType == 'lead')
    {
        console.log('is a lead');
        theTemplate = $compile(leadElement)(scope);
    }

    if (dropType == 'h1')
    {
        console.log('h1 row');
        theTemplate = $compile(h1Element)(scope);
    }
    if (dropType == 'h2')
    {
        console.log('h2 row');
        theTemplate = $compile(h2Element)(scope);
    }
    if (dropType == 'h3')
    {
        console.log('h3 row');
        theTemplate = $compile(h3Element)(scope);
    }
    if (dropType == 'h4')
    {
        console.log('h4 row');
        theTemplate = $compile(h4Element)(scope);
    }
    if (dropType == 'h5')
    {
        console.log('h5 row');
        theTemplate = $compile(h5Element)(scope);
    }
    if (dropType == 'h6')
    {
        console.log('h6 row');
        theTemplate = $compile(h6Element)(scope);
    }

    if (dropType == 'button')
    {
        console.log('is a button');
        theTemplate = $compile(buttonElement)(scope);
    }

    if (dropType == 'gridrow')
    {
        console.log('is a grid row');
        theTemplate = $compile('<div class="container-fluid ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)">'+colElement+colElement+colElement+'</div>')(scope);
    }


    if (dropType == '3colscta')
    {
        console.log('is a 3 cols with cta row');
        theTemplate = $compile('<div class="container-fluid ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)">'+colElementCTA+colElementCTA+colElementCTA+'</div>')(scope);
    }

    if (dropType == '3colsImageCircle')
    {
        console.log('is a 3 images cols with cta row');
        theTemplate = $compile('<div class="container-fluid ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)">'+colImageCircle+colImageCircle+colImageCircle+'</div>')(scope);
    }


    if (dropType == 'buttongroup')
    {
        console.log('is a button group');
        theTemplate = $compile('<div class="btn-group" ndType="button group">'+buttonElement+buttonElement+buttonElement+'</div>')(scope);
    }

    if (dropType == 'panel')
    {
        console.log('is a panel');
        theTemplate = $compile('<div class="panel panel-default" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="panel" x-on-select="selected(selectedEl)"> <div class="panel-heading" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="panelHeading" x-on-select="selected(selectedEl)">'+h3Element+'</div> <div class="panel-body" ndType="none" x-lvl-drop-target="true">'+pElement+'</div></div>')(scope);
    }

    if (dropType == 'imageTextLarge')
    {
        console.log('is a imageTextLarge');
        theTemplate =
            $compile(' <div class="container-fluid featurette ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)"> '+
                '<div class="col-md-7 col-md-push-5 ndContainer" ndtype="column" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="col" x-on-select="selected(selectedEl)"> '+
                featureteHeader+
                plead+
                '</div> '+
                '<div class="col-md-5 col-md-pull-7 ndContainer" ndtype="column"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" class="featurette-image img-responsive center-block" data-src="holder.js/500x500/auto" alt="500x500" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjE5MC4zMTI1IiB5PSIyNTAiIHN0eWxlPSJmaWxsOiNBQUFBQUE7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LWZhbWlseTpBcmlhbCwgSGVsdmV0aWNhLCBPcGVuIFNhbnMsIHNhbnMtc2VyaWYsIG1vbm9zcGFjZTtmb250LXNpemU6MjNwdDtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj41MDB4NTAwPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true">'+
                '</div> '+
                '</div>')(scope);
    }

    if (dropType == 'textImageLarge')
    {
        console.log('is a textImageLarge');
        theTemplate =
            $compile(' <div class="container-fluid featurette ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)"> '+
                '<div class="col-md-7 ndContainer" ndtype="column" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="col" x-on-select="selected(selectedEl)"> '+
                featureteHeader+
                plead+
                '</div> '+
                '<div class="col-md-5 ndContainer" ndtype="column"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" class="featurette-image img-responsive center-block" data-src="holder.js/500x500/auto" alt="500x500" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjE5MC4zMTI1IiB5PSIyNTAiIHN0eWxlPSJmaWxsOiNBQUFBQUE7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LWZhbWlseTpBcmlhbCwgSGVsdmV0aWNhLCBPcGVuIFNhbnMsIHNhbnMtc2VyaWYsIG1vbm9zcGFjZTtmb250LXNpemU6MjNwdDtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj41MDB4NTAwPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true">'+
                '</div> '+
                '</div>')(scope);

    }

    if (dropType == 'featureteDivider')
    {
        console.log('is a featurete divider');
        theTemplate = $compile('<hr class="featurette-divider"  x-lvl-draggable="false" x-lvl-drop-target="true" ndType="featureteDivider" x-on-select="selected(selectedEl)">')(scope);
    }

    if (dropType == 'form')
    {
        console.log('is a form');
        theTemplate = $compile('<form role="form" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="form" style="border:2px dashed #8a3104;padding: 10px;" x-on-select="selected(selectedEl)">'+inputElement+'</form>')(scope);
    }

    if (dropType == 'input')
    {
        console.log('is a input');
        theTemplate = $compile(inputElement)(scope);
    }

    if (dropType == 'youtube')
    {
        console.log('youtube');
        theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="youtube" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9" ndType="none"><iframe  ndType="none" class="embed-responsive-item" src="https://www.youtube.com/embed/1cbAYSahg7g"  allowfullscreen></iframe></div></div>')(scope);
    }

    if (dropType == 'vimeo')
    {
        console.log('vimeo');
        /*
         var mediaModalOptions    = {
         closeButtonText: 'Cancel',
         actionButtonText: 'Save',
         headerText: 'Source Link',
         type : mediaType
         }

         //no dejar meter en el trackname nada que sea incompatible con el HTML...si no meter el trackobject... y simplemente el id del track_object



         ndMediaModal.showModal({}, mediaModalOptions).then(function (result) {
         //theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="vimeo" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9" ndType="none"><iframe  ndType="none" class="embed-responsive-item" src="https://player.vimeo.com/video/120774659"  allowfullscreen></iframe></div></div>')(scope);
         */
        theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="vimeo" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9" ndType="none"><iframe  ndType="none" class="embed-responsive-item" src="https://player.vimeo.com/video/120774659"  allowfullscreen></iframe></div></div>')(scope);

        // }
    }
    if (dropType == 'slidesharedd')
    {
        console.log('slideshare');
        theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="vimeo" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9" ndType="none"><iframe  ndType="none" class="embed-responsive-item" src="//www.slideshare.net/slideshow/embed_code/44600700"  allowfullscreen></iframe></div></div>')(scope);
    }

    if (dropType == 'svgStar')
    {
        console.log('svgStar');
        theTemplate = $compile(svgStarElement)(scope);
    }

    if (dropType == 'accordion')
    {
        console.log('accordion');
        theTemplate = $compile('<div class="panel-group" id="accordion" >'+

            '   <!-- Accordion item start -->  '+
            '<div class="panel panel-default">  '+
            '<div class="panel-heading">    '+
            '<h4 class="panel-title font-alt">  '+
            '<a ndType="accordionTitle" data-toggle="collapse" data-parent="#accordion" href="#support1" aria-expanded="false" class="collapsed">'+
            'Support Question 1 '+
            '</a> '+
            '</h4> '+
            '</div>  '+
            '<div id="support1" class="panel-collapse collapse in" aria-expanded="true" > '+
            '<div class="panel-body">  '+
            pElement+
            '</div>  '+
            '</div> '+
            '</div>  '+
            '<!-- Accordion item end --> '+

            '<!-- Accordion item start --> '+
            '<div class="panel panel-default">  '+
            '<div class="panel-heading">  '+
            '<h4 class="panel-title font-alt">  '+
            '<a ndType="accordionTitle" data-toggle="collapse" data-parent="#accordion" href="#support2" class="" aria-expanded="true">  '+
            'Support Question 2 '+
            '</a>  '+
            '</h4> '+
            '</div> '+
            '<div id="support2" class="panel-collapse collapse in" aria-expanded="true"> '+
            '<div class="panel-body"> '+
            pElement+
            '</div> '+
            '</div> '+
            '</div> '+
            '<!-- Accordion item end --> '+

            '</div>')(scope);
    }

    if (dropType == 'photoHeader')
    {
        console.log('creating photoHeader')
        theTemplate = $compile(
            '<section class="module"  x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="photoHeader" style="position:relative">    '+
                '<div class="container-fluid module" ndType="none"  data-background="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-4.jpg" style="height: 100%;width: 100%;top:0px;left:0px;z-index: 10;position:absolute;background-image: url(http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-4.jpg);"> '+
                '</div>' +
                //'<section  x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="photoHeader" class="module bg-dark bg-dark-60" data-background="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-4.jpg" style="background-image: url(http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-4.jpg);"> '+
                '<div class="container-fluid" ndType="none" style="height: 100%; width:100%;top:0px;left:0px;z-index: 10;position:absolute;padding-top:100px;"> '+

                '<div class="row" ndType="none"> '+

                '<div class="col-sm-6 col-sm-offset-3 ndContainer" ndType="column"> '+
                '<div class="module-title font-alt ndContainer" ndType="column"> '+
                h1Element+
                '</div>'+
                '<div class="module-subtitle font-serif mb-0" ndType="none"> '+
                pElement+
                '</div> '+

                '</div> '+

                '</div><!-- .row -->  '+

                '</div> '+
                //'</section>' +
                '</section>')(scope);
    }

    if (dropType == 'blogPost')
    {
        console.log('blogPost');
        theTemplate = $compile(
            '<div class="col-md-6 col-lg-6 ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="column">'+

                '<div class="post" ndType="none">'+

                '<div class="post-thumbnail" ndType="none"> '+
                '<a href="blog-single-right.html"><img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/post-1.jpg" alt=""></a> '+
                '</div> '+

                '<div class="post-header font-alt">'+
                '<h2 class="post-title"><a href="blog-single-right.html">Our trip to the Alps</a></h2> '+
                '<div class="post-meta">  '+
                'By <a href="#">Mark Stone</a> | 23 November | 3 Comments '+
                '            </div> '+
                '        </div>  '+

                '        <div class="post-entry"> '+
                '            <p>A wonderful serenity has taken possession of my entire soul, like these sweet mornings of spring which I enjoy with my whole heart.</p> '+
                '        </div> '+

                '       <div class="post-more">  '+
                '            <a href="blog-single-right.html" class="more-link">Read more</a>  '+
                '       </div> '+

                '   </div> '+

                '</div> ')(scope);
    }
    if (dropType == 'team')
    {
        console.log('team');
        theTemplate = $compile(
            '<div class="container-fluid ndContainer" ndType="container" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)">'+

                '<!-- Team item star --> '+
                '<div ndType="column" x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" class="col-sm-6 col-md-3 mb-sm-20 wow fadeInUp animated ndContainer" style="visibility: visible;"> '+

                '<div class="team-item"> '+
                '<div class="team-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/team-1.jpg" alt="">  '+
                '<div class="team-detail">   '+
                '<h5 class="font-alt">Hi all</h5>  '+
                '<p class="font-serif">Lorem ipsum dolor sit amet, consectetur adipiscing elit lacus, a&nbsp;iaculis diam.</p> '+
                '<div class="team-social"> '+
                '<a href="#"><i class="fa fa-facebook"></i></a> '+
                '<a href="#"><i class="fa fa-twitter"></i></a>  '+
                '<a href="#"><i class="fa fa-dribbble"></i></a> '+
                '<a href="#"><i class="fa fa-skype"></i></a>  '+
                '</div> '+
                '</div>  '+
                '</div>  '+
                '<div class="team-descr font-alt">   '+
                '<div class="team-name">Jim Stone</div>  '+
                '<div class="team-role">Art Director</div>  '+
                '</div> '+
                '</div>  '+

                '</div> '+
                '<!-- Team item end --> '+

                '<!-- Team item star --> '+
                '<div ndType="column" x-lvl-draggable="false" x-lvl-drop-target="true"  x-on-select="selected(selectedEl)" class="col-sm-6 col-md-3 mb-sm-20 wow fadeInUp animated ndContainer" style="visibility: visible;"> '+

                '<div class="team-item">'+
                '<div class="team-image">'+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/team-2.jpg" alt="">'+
                '<div class="team-detail">  '+
                '<h5 class="font-alt">Good day</h5> '+
                '<p class="font-serif">Lorem ipsum dolor sit amet, consectetur adipiscing elit lacus, a&nbsp;iaculis diam.</p>  '+
                '<div class="team-social">  '+
                '<a href="#"><i class="fa fa-facebook"></i></a> '+
                '<a href="#"><i class="fa fa-twitter"></i></a> '+
                '<a href="#"><i class="fa fa-dribbble"></i></a>  '+
                '<a href="#"><i class="fa fa-skype"></i></a> '+
                '</div> '+
                '</div> '+
                '</div> '+
                '<div class="team-descr font-alt"> '+
                '<div class="team-name">Andy River</div> '+
                '<div class="team-role">Creative director</div>  '+
                '</div>  '+
                '</div>  '+

                '</div>  '+
                '<!-- Team item end -->  '+

                '<!-- Team item star -->  '+
                '<div ndType="column" x-lvl-draggable="false" x-lvl-drop-target="true"  x-on-select="selected(selectedEl)" class="col-sm-6 col-md-3 mb-sm-20 wow fadeInUp animated ndContainer" style="visibility: visible;">  '+

                '<div class="team-item"> '+
                '<div class="team-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/team-3.jpg" alt="">  '+
                '<div class="team-detail">  '+
                '<h5 class="font-alt">Hello</h5>  '+
                '<p class="font-serif">Lorem ipsum dolor sit amet, consectetur adipiscing elit lacus, a&nbsp;iaculis diam.</p> '+
                '<div class="team-social">  '+
                '<a href="#"><i class="fa fa-facebook"></i></a> '+
                '<a href="#"><i class="fa fa-twitter"></i></a> '+
                '<a href="#"><i class="fa fa-dribbble"></i></a>  '+
                '<a href="#"><i class="fa fa-skype"></i></a> '+
                '</div>  '+
                '</div>  '+
                '</div>   '+
                '<div class="team-descr font-alt">   '+
                '<div class="team-name">Adele Snow</div>  '+
                '<div class="team-role">Account manager</div> '+
                '</div>  '+
                '</div>  '+

                '</div>  '+
                '<!-- Team item end -->  '+

                '<!-- Team item star -->  '+
                '<div ndType="column" x-lvl-draggable="false" x-lvl-drop-target="true"  x-on-select="selected(selectedEl)" class="col-sm-6 col-md-3 mb-sm-20 wow fadeInUp animated ndContainer" style="visibility: visible;"> '+

                '<div class="team-item">  '+
                '<div class="team-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/team-4.jpg" alt="">  '+
                '<div class="team-detail"> '+
                '<h5 class="font-alt">Yes, its me</h5> '+
                '<p class="font-serif">Lorem ipsum dolor sit amet, consectetur adipiscing elit lacus, a&nbsp;iaculis diam.</p> '+
                '<div class="team-social">'+
                '<a href="#"><i class="fa fa-facebook"></i></a> '+
                '<a href="#"><i class="fa fa-twitter"></i></a> '+
                '<a href="#"><i class="fa fa-dribbble"></i></a> '+
                '<a href="#"><i class="fa fa-skype"></i></a> '+
                '</div> '+
                '</div>  '+
                '</div>  '+
                '<div class="team-descr font-alt">  '+
                '<div class="team-name">Dylan Woods</div>  '+
                '<div class="team-role">Developer</div> '+
                '</div> '+
                '</div>  '+

                '</div>  '+
                '<!-- Team item end --> '+

                '</div>')(scope);
    }

    if (dropType == 'worksGrid')
    {
        console.log('worksGrid');
        theTemplate = $compile(
            '<ul id="works-grid" class="works-grid works-grid-4 works-hover-w" style="position: relative;"> '+

                '<!-- Portfolio item start -->   '+
                '<li class="work-item illustration webdesign" >  '+
                //'<a href="portfolio-single-1.html">  '+
                '<div class="work-image">   '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-1.jpg" alt="">  '+
                '</div> '+
                '<div class="work-caption font-alt"> '+
                '<h3 class="work-title">Corporate Identity MENE</h3> '+
                '<div class="work-descr">  '+
                'Illustration  '+
                '</div> '+
                '</div> '+
                //'</a>  '+
                '</li> '+
                '<!-- Portfolio item end --> '+

                '<!-- Portfolio item start -->  '+
                '<li class="work-item marketing photography" > '+
                '<a href="portfolio-single-1.html"> '+
                '<div class="work-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-2.jpg" alt=""> '+
                '</div> '+
                '<div class="work-caption font-alt"> '+
                '<h3 class="work-title">Bag MockUp</h3> '+
                '<div class="work-descr"> '+
                'Marketing '+
                '</div>'+
                '</div> '+
                '</a> '+
                '</li> '+
                '<!-- Portfolio item end --> '+

                '<!-- Portfolio item start --> '+
                '<li class="work-item illustration photography" > '+
                '<a href="portfolio-single-1.html"> '+
                '<div class="work-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-3.jpg" alt=""> '+
                '</div> '+
                '<div class="work-caption font-alt"> '+
                '<h3 class="work-title">Disk Cover</h3> '+
                '<div class="work-descr"> '+
                'Illustration  '+
                '</div> '+
                '</div> '+
                '</a> '+
                '</li>  '+
                '<!-- Portfolio item end --> '+

                '<!-- Portfolio item start --> '+
                '<li class="work-item marketing photography" > '+
                '<a href="portfolio-single-1.html"> '+
                '<div class="work-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-4.jpg" alt=""> '+
                '</div> '+
                '<div class="work-caption font-alt"> '+
                '<h3 class="work-title">Business Card</h3> '+
                '<div class="work-descr"> '+
                'Photography '+
                '</div> '+
                '</div> '+
                '</a> '+
                '</li> '+
                '<!-- Portfolio item end --> '+

                '<!-- Portfolio item start --> '+
                '<li class="work-item illustration webdesign" > '+
                '<a href="portfolio-single-1.html"> '+
                '<div class="work-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-5.jpg" alt=""> '+
                '</div> '+
                '<div class="work-caption font-alt"> '+
                '<h3 class="work-title">Business Cards</h3> '+
                '<div class="work-descr"> '+
                'Webdesign '+
                '</div> '+
                '</div> '+
                '</a> '+
                '</li> '+
                '<!-- Portfolio item end --> '+

                '<!-- Portfolio item start --> '+
                '<li class="work-item marketing webdesign" > '+
                '<a href="portfolio-single-1.html"> '+
                '<div class="work-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-6.jpg" alt=""> '+
                '</div> '+
                '<div class="work-caption font-alt"> '+
                '<h3 class="work-title">Business Cards in paper clip</h3> '+
                '<div class="work-descr"> '+
                'Marketing '+
                '</div> '+
                '</div> '+
                '</a>'+
                '</li> '+
                '<!-- Portfolio item end --> '+

                '<!-- Portfolio item start --> '+
                '<li class="work-item marketing webdesign" > '+
                '<a href="portfolio-single-1.html"> '+
                '<div class="work-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-7.jpg" alt=""> '+
                '</div> '+
                '<div class="work-caption font-alt"> '+
                '<h3 class="work-title">Business Cards in paper clip</h3> '+
                '<div class="work-descr"> '+
                'Marketing '+
                '</div> '+
                '</div>'+
                '</a> '+
                '</li>  '+
                '<!-- Portfolio item end --> '+

                '<!-- Portfolio item start -->  '+
                '<li class="work-item illustration webdesign" > '+
                '<a href="portfolio-single-1.html"> '+
                '<div class="work-image"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" src="http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/work-1.jpg" alt=""> '+
                '</div> '+
                '<div class="work-caption font-alt"> '+
                '<h3 class="work-title">Corporate Identity</h3> '+
                '<div class="work-descr"> '+
                'Illustration '+
                '</div> '+
                '</div> '+
                '</a> '+
                '</li> '+
                '<!-- Portfolio item end --> '+



                '</ul>')(scope);
    }
    if (dropType == 'carousell')
    {
        console.log('carousell');
        theTemplate = $compile(
            '<div id="carousel-example-generic" class="carousel slide" data-ride="carousel"> '+
                '<!-- Indicators --> '+
                ' <ol class="carousel-indicators">  '+
                '<li data-target="#carousel-example-generic" data-slide-to="0" class="active"></li> '+
                '<li data-target="#carousel-example-generic" data-slide-to="1"></li> '+
                '<li data-target="#carousel-example-generic" data-slide-to="2"></li> '+
                '</ol> '+

                '<!-- Wrapper for slides --> '+
                '<div class="carousel-inner" role="listbox">'+
                '<div class="item active left">'+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" data-src="holder.js/900x500/auto/#777:#555/text:First slide" alt="First slide [900x500]" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDkwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzc3NyIvPjxnPjx0ZXh0IHg9IjMxNy43MzQzNzUiIHk9IjI1MCIgc3R5bGU9ImZpbGw6IzU1NTtmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZTo0MnB0O2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPkZpcnN0IHNsaWRlPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true"> '+
                '</div> '+
                '<div class="item next left"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" data-src="holder.js/900x500/auto/#666:#444/text:Second slide" alt="Second slide [900x500]" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDkwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzY2NiIvPjxnPjx0ZXh0IHg9IjI3Ny4yODEyNSIgeT0iMjUwIiBzdHlsZT0iZmlsbDojNDQ0O2ZvbnQtd2VpZ2h0OmJvbGQ7Zm9udC1mYW1pbHk6QXJpYWwsIEhlbHZldGljYSwgT3BlbiBTYW5zLCBzYW5zLXNlcmlmLCBtb25vc3BhY2U7Zm9udC1zaXplOjQycHQ7ZG9taW5hbnQtYmFzZWxpbmU6Y2VudHJhbCI+U2Vjb25kIHNsaWRlPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true"> '+
                '</div> '+
                '<div class="item"> '+
                '<img x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="image" data-src="holder.js/900x500/auto/#555:#333/text:Third slide" alt="Third slide [900x500]" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDkwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iOTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iIzU1NSIvPjxnPjx0ZXh0IHg9IjMwOC40MjE4NzUiIHk9IjI1MCIgc3R5bGU9ImZpbGw6IzMzMztmb250LXdlaWdodDpib2xkO2ZvbnQtZmFtaWx5OkFyaWFsLCBIZWx2ZXRpY2EsIE9wZW4gU2Fucywgc2Fucy1zZXJpZiwgbW9ub3NwYWNlO2ZvbnQtc2l6ZTo0MnB0O2RvbWluYW50LWJhc2VsaW5lOmNlbnRyYWwiPlRoaXJkIHNsaWRlPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true"> '+
                '</div> '+
                '</div>'+

                '<!-- Controls -->'+
                '<a class="left carousel-control" href="#carousel-example-generic" role="button" data-slide="prev">'+
                '<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>'+
                '<span class="sr-only">Previous</span> '+
                '</a> '+
                '<a class="right carousel-control" href="#carousel-example-generic" role="button" data-slide="next"> '+
                '<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>'+
                '<span class="sr-only">Next</span> '+
                '</a> '+
                '</div>')(scope);
    }


    if (dropType == 'slideshare')
    {
        console.log('homeFull');
        theTemplate = $compile(
            '<section x-lvl-draggable="false" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="homeFull" class="home-section home-parallax home-fade home-full-height bg-dark-30" style="height: 500px;background-image: url(http://www.mycookroom.ru/mywork/Rival/Rival-v1.4.1/Site/assets/images/section-2.jpg);"> '+
                '<div class="hs-caption"> '+
                '<div class="caption-content" style="opacity: 1;"> '+
                '<div class="hs-title-size-1 font-alt mb-30"> '+
                '<p class="editable" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">Hello &amp; welcome </p>'+
                '</div> '+
                '<div class="hs-title-size-4 font-alt mb-40"> '+
                '<p class="editable" x-lvl-draggable="false" x-lvl-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">We are Rival </p>'+
                '</div> '+
                '<a x-lvl-draggable="true" x-lvl-drop-target="true" x-on-select="selected(selectedEl)" ndType="button"  role="button" href="#about" class="editable section-scroll btn btn-border-w btn-round">Learn More</a> '+
                '</div> '+
                '</div> '+
                '</section>')(scope);
    }



    return theTemplate;
}

