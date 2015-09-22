function attrDefault($el, data_var, default_val)
{
    if(typeof $el.data(data_var) != 'undefined')
    {
        return $el.data(data_var);
    }

    return default_val;
}


angular.module('widestage.directives', []).
/*directive('xeCounter', function(){

    return {
        restrict: 'EAC',
        link: function(scope, el, attrs)
        {
            var $el = angular.element(el),
                sm = scrollMonitor.create(el);

            sm.fullyEnterViewport(function()
            {
                var opts = {
                        useEasing: 		attrDefault($el, 'easing', true),
                        useGrouping:	attrDefault($el, 'grouping', true),
                        separator: 		attrDefault($el, 'separator', ','),
                        decimal: 		attrDefault($el, 'decimal', '.'),
                        prefix: 		attrDefault($el, 'prefix', ''),
                        suffix:			attrDefault($el, 'suffix', ''),
                    },
                    $count		= attrDefault($el, 'count', 'this') == 'this' ? $el : $el.find($el.data('count')),
                    from        = attrDefault($el, 'from', 0),
                    to          = attrDefault($el, 'to', 100),
                    duration    = attrDefault($el, 'duration', 2.5),
                    delay       = attrDefault($el, 'delay', 0),
                    decimals	= new String(to).match(/\.([0-9]+)/) ? new String(to).match(/\.([0-9]+)$/)[1].length : 0,
                    counter 	= new countUp($count.get(0), from, to, decimals, duration, opts);

                setTimeout(function(){ counter.start(); }, delay * 1000);

                sm.destroy();
            });
        }
    };
}).
directive('xeFillCounter', function(){

    return {
        restrict: 'EAC',
        link: function(scope, el, attrs)
        {
            var $el = angular.element(el),
                sm = scrollMonitor.create(el);

            sm.fullyEnterViewport(function()
            {
                var fill = {
                        current: 	null,
                        from: 		attrDefault($el, 'fill-from', 0),
                        to: 		attrDefault($el, 'fill-to', 100),
                        property: 	attrDefault($el, 'fill-property', 'width'),
                        unit: 		attrDefault($el, 'fill-unit', '%'),
                    },
                    opts 		= {
                        current: fill.to, onUpdate: function(){
                            $el.css(fill.property, fill.current + fill.unit);
                        },
                        delay: attrDefault($el, 'delay', 0),
                    },
                    easing 		= attrDefault($el, 'fill-easing', true),
                    duration 	= attrDefault($el, 'fill-duration', 2.5);

                if(easing)
                {
                    opts.ease = Sine.easeOut;
                }

                // Set starting point
                fill.current = fill.from;

                TweenMax.to(fill, duration, opts);

                sm.destroy();
            });
        }
    };
}) */
    directive('spinner', function(){
        return {
            restrict: 'AC',
            link: function(scope, el, attr)
            {
                var $ig = angular.element(el),
                    $dec = $ig.find('[data-type="decrement"]'),
                    $inc = $ig.find('[data-type="increment"]'),
                    $inp = $ig.find('.form-control'),

                    step = attrDefault($ig, 'step', 1),
                    min = attrDefault($ig, 'min', 0),
                    max = attrDefault($ig, 'max', 0),
                    umm = min < max;


                $dec.on('click', function(ev)
                {
                    ev.preventDefault();

                    var num = new Number($inp.val()) - step;

                    if(umm && num <= min)
                    {
                        num = min;
                    }

                    $inp.val(num);
                });

                $inc.on('click', function(ev)
                {
                    ev.preventDefault();

                    var num = new Number($inp.val()) + step;

                    if(umm && num >= max)
                    {
                        num = max;
                    }

                    $inp.val(num);
                });
            }


        }
    }).directive('erDraggable', function() {
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
            elem.draggable({
                containment: elem.parent().parent()
            },{
                stop: function( event, ui ) {
                    //jqSimpleConnect.repaintAll();

                }
            });
        }
    };
}).directive('datepicker', function(){
    return {
        restrict: 'AC',
        link: function(scope, el, attr)
        {
            if( ! jQuery.isFunction(jQuery.fn.datepicker))
                return false;

            var $this = angular.element(el),
                opts = {
                    format: attrDefault($this, 'format', 'mm/dd/yyyy'),
                    startDate: attrDefault($this, 'startDate', ''),
                    endDate: attrDefault($this, 'endDate', ''),
                    daysOfWeekDisabled: attrDefault($this, 'disabledDays', ''),
                    startView: attrDefault($this, 'startView', 0)
                },
                $n = $this.next(),
                $p = $this.prev();

            $this.datepicker(opts);

            if($n.is('.input-group-addon') && $n.has('a'))
            {
                $n.on('click', function(ev)
                {
                    ev.preventDefault();

                    $this.datepicker('show');
                });
            }

            if($p.is('.input-group-addon') && $p.has('a'))
            {
                $p.on('click', function(ev)
                {
                    ev.preventDefault();

                    $this.datepicker('show');
                });
            }
        }
    }
});