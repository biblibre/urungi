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





                theTemplate2 = $compile('<div id="ndDropped" class="row ndplaceholder" ></div>')(scope);

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
                angular.element(el).addClass('lvl-element');
                //angular.element(el.parent()).removeClass('lvl-element');

            });

            el.bind("mouseleave", function(e) {
                e.stopPropagation();
                angular.element(el).removeClass('lvl-element');

            });


            el.bind("click", function(e) {
                // if (scope.editMode != true)
                //{
                e.preventDefault();
                e.stopPropagation();

                angular.element(el).addClass('selected');
                selectedElement = angular.element(el);

                console.log('selected '+ selectedElement);

                scope.selectedBackgroundColor = selectedElement.css('background-color');

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
                // } else {
                // scope.editMode = false;
                console.log('edit mode =TRUE '+ selectedElement);
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
                if ((angular.element(dest).attr("id") == 'mainContainer') )

                {

                    theParent = el;
                    mode = 'append';
                    el.append(theTemplate2);
                    console.log('append');


                } else {
                    theParent = el;
                    mode = 'before';
                    el.before(theTemplate2);
                    console.log('before '+angular.element(dest).attr("id"));
                }


            });

            el.bind("dragleave", function(e) {
                angular.element(e.target).removeClass('lvl-over');  // this / e.target is previous target element.
                angular.element(e.target).removeClass('lvl-inside');
                //angular.element(el.parent()).removeClass('lvl-over');
                //var dest = document.getElementById('ndDropped');
                //var theIndex = dest.index();
                //var theParent = dest.parent();
                //dest.remove();
            });

            el.bind("drop", function(e) {


                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }

                e.stopPropagation(); // Necessary. Allows us to drop.

                var dest = document.getElementById('ndDropped');
                //var theIndex = dest.index();
                //var theParent = dest.parent();
                dest.remove();

                //theParent.children()[theIndex].append(theTemplate);

                //theTemplate2 = theTemplate;

                //e.originalEvent.stopPropagation();

                var data = e.originalEvent.dataTransfer.getData("text");
                var dest = document.getElementById(id);
                var src = document.getElementById(data);


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
                var colElement = '<div class="col-md-4" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="col" x-on-select="selected(selectedEl)">'+h3Element+pElement+'</div>';
                var colElementCTA = '<div class="col-md-4" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="col" x-on-select="selected(selectedEl)">'+h3Element+pElement+buttonElement+'</div>';

                var inputElement = '<div class="form-group" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="formgroup" x-on-select="selected(selectedEl)"> <label for="exampleInputEmail1">Email address</label> <input type="email" class="form-control" id="exampleInputEmail1" placeholder="Enter email"></div>';

                //console.log('the drop type: '+angular.element(src).attr("data-color"));
                var dropType = angular.element(src).attr("data-color");

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
                    theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="row" x-on-select="selected(selectedEl)">'+colElement+colElement+colElement+'</div>')(scope);
                }

                if (dropType == '3colscta')
                {
                    console.log('is a 3 cols with cta row');
                    theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="row" x-on-select="selected(selectedEl)">'+colElementCTA+colElementCTA+colElementCTA+'</div>')(scope);
                }

                if (dropType == 'buttongroup')
                {
                    console.log('is a button group');
                    theTemplate = $compile('<div class="btn-group" ndType="button group">'+buttonElement+buttonElement+buttonElement+'</div>')(scope);
                }

                if (dropType == 'panel')
                {
                    console.log('is a panel');
                    theTemplate = $compile('<div class="panel panel-default" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="panel" x-on-select="selected(selectedEl)"> <div class="panel-heading" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="panelHeading" x-on-select="selected(selectedEl)">'+h3Element+'</div> <div class="panel-body" x-lvl-drop-target="true">'+pElement+'</div></div>')(scope);
                }

                if (dropType == 'imageTextLarge')
                {
                    console.log('is a panel');
                    theTemplate =
                        $compile(' <div class="row featurette" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="panel" x-on-select="selected(selectedEl)"> '+
                            '<div class="col-md-7 col-md-push-5" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="col" x-on-select="selected(selectedEl)"> '+
                            featureteHeader+
                            plead+
                            '</div> '+
                            '<div class="col-md-5 col-md-pull-7"> '+
                            '<img class="featurette-image img-responsive center-block" data-src="holder.js/500x500/auto" alt="500x500" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjE5MC4zMTI1IiB5PSIyNTAiIHN0eWxlPSJmaWxsOiNBQUFBQUE7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LWZhbWlseTpBcmlhbCwgSGVsdmV0aWNhLCBPcGVuIFNhbnMsIHNhbnMtc2VyaWYsIG1vbm9zcGFjZTtmb250LXNpemU6MjNwdDtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj41MDB4NTAwPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true">'+
                            '</div> '+
                            '</div>')(scope);
                }

                if (dropType == 'textImageLarge')
                {
                    console.log('is a panel');
                    theTemplate =
                        $compile(' <div class="row featurette" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="panel" x-on-select="selected(selectedEl)"> '+
                            '<div class="col-md-7" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="col" x-on-select="selected(selectedEl)"> '+
                            featureteHeader+
                            plead+
                            '</div> '+
                            '<div class="col-md-5"> '+
                            '<img class="featurette-image img-responsive center-block" data-src="holder.js/500x500/auto" alt="500x500" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjE5MC4zMTI1IiB5PSIyNTAiIHN0eWxlPSJmaWxsOiNBQUFBQUE7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LWZhbWlseTpBcmlhbCwgSGVsdmV0aWNhLCBPcGVuIFNhbnMsIHNhbnMtc2VyaWYsIG1vbm9zcGFjZTtmb250LXNpemU6MjNwdDtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj41MDB4NTAwPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true">'+
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
                    theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="youtube" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9"><iframe   class="embed-responsive-item" src="https://www.youtube.com/embed/1cbAYSahg7g"  allowfullscreen></iframe></div></div>')(scope);
                }

                if (dropType == 'vimeo')
                {
                    console.log('vimeo');
                    theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="vimeo" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9"><iframe   class="embed-responsive-item" src="https://player.vimeo.com/video/120774659"  allowfullscreen></iframe></div></div>')(scope);
                }
                if (dropType == 'slideshare')
                {
                    console.log('slideshare');
                    theTemplate = $compile('<div class="container-fluid" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="vimeo" x-on-select="selected(selectedEl)" style="padding:5px"> <div class="embed-responsive embed-responsive-16by9"><iframe   class="embed-responsive-item" src="//www.slideshare.net/slideshow/embed_code/44600700"  allowfullscreen></iframe></div></div>')(scope);
                }

                if (dropType == undefined)
                {
                    console.log('is undefined');
                    theTemplate = src;


                }

                if (mode == 'append')
                {


                    theParent.append(theTemplate);
                    console.log('final append');


                } else {
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

