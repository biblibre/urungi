app.service('reportHtmlWidgets' , function () {


this.generateIndicator = function(parentElementID, report)
{
    return generateIndicator(parentElementID, report);
}

function generateIndicator(report)
    {
        var htmlCode = '';

        var theData = report.query.data;
            if (theData)
            {
                if (!report.properties.style)
                    report.properties.style = 'style1';

                //var theYKey = report.properties.ykeys[0].collectionID.toLowerCase()+'_'+report.properties.ykeys[0].elementName;
                var theYKey = 'wst'+report.properties.ykeys[0].elementID.toLowerCase();

                theYKey = theYKey.replace(/[^a-zA-Z ]/g,'');

                if (report.properties.ykeys[0].aggregation)
                    theYKey += report.properties.ykeys[0].aggregation;

                var theValue = '{{'+theData[0][theYKey] +'| number}}';

                if (report.properties.valueType == 'percentage')
                {
                    theValue = '{{'+theData[0].value +'| number}} %';
                }

                if (report.properties.valueType == 'currency' && report.properties.currencySymbol)
                {
                    theValue = '{{'+theData[0].value +'| number}}'+ ' '+report.properties.currencySymbol;

                }

                var theValueText = '';

                if (report.properties.valueText != undefined)
                    theValueText = report.properties.valueText;

                var theEvolution = theData[0].evolution + ' %';

                var trend = 'same';
                var trendLabel = 'same';

                if (theData[0].evolution > 0)
                    {
                      trend = 'up';
                      trendLabel = 'increase';
                    }
                if (theData[0].evolution < 0)
                    {
                    trend = 'down';
                    trendLabel = 'decrement';
                    }

                var theBackgroundColor = '#68b828';
                if (report.properties.backgroundColor)
                    theBackgroundColor = report.properties.backgroundColor;
                var theFontColor = '#fff';
                if (report.properties.fontColor)
                    theFontColor = report.properties.fontColor;

                var theAuxFontColor = '#fff'
                if (report.properties.auxFontColor)
                    theAuxFontColor = report.properties.auxFontColor;

                if (report.properties.style == 'style1')
                {


                    htmlCode += '<div class="xe-widget xe-counter xe-counter-info" data-count=".num" data-from="1000" data-to="2470" data-duration="4" data-easing="true">';
                    htmlCode += '   <div class="xe-icon" >';
                    htmlCode += '       <i class="fa '+report.properties.reportIcon+'" style="background-color: '+theBackgroundColor+'"></i>';
                    htmlCode += '   </div>';
                    htmlCode += '   <div class="xe-label">';
                    htmlCode += '       <strong class="num" style="color:'+report.properties.mainFontColor+'">'+theValue+'</strong>';
                    htmlCode += '       <span style="color:'+report.properties.descFontColor+'">'+theValueText+'</span>';
                    htmlCode += '   </div>';
                    htmlCode += '</div>';
                }

                if (report.properties.style == 'style2')
                {
                    htmlCode += '<div class="xe-widget xe-counter-block" xe-counter="" data-count=".num" data-from="0" data-to="99.9" data-suffix="%" data-duration="2" style="background-color: '+theBackgroundColor+';height:100%;margin-bottom:0px;">';
                    htmlCode += '   <div class="xe-upper"  style="background-color: '+theBackgroundColor+'">';
                    htmlCode += '       <div class="xe-icon">';
                    htmlCode += '           <i class="fa '+report.properties.reportIcon+'"></i> ';
                    htmlCode += '       </div>';
                    htmlCode += '       <div class="xe-label">';
                    htmlCode += '           <strong class="num" style="color:'+report.properties.mainFontColor+'">'+theValue+'</strong>';
                    htmlCode += '           <span style="color:'+report.properties.descFontColor+'">'+report.properties.valueText+'</span> ';
                    htmlCode += '       </div> ';
                    htmlCode += '   </div>';
                    htmlCode += '   <div class="xe-lower"> ';
                    htmlCode += '       <div class="border"></div> ';
                    htmlCode += '       </div> ';
                    htmlCode += '   </div> ';
                    htmlCode += '</div> ';
                }

                if (report.properties.style == 'style3')
                {
                    htmlCode += '<div class="chart-item-bg-2" style="background-color: '+theBackgroundColor+';color:'+theFontColor+';height:100%;">';
                    htmlCode += '   <div class="chart-item-num" xe-counter="" data-count="this" data-from="0" data-to="98" data-suffix="%" data-duration="2" style="padding: 10px; color:'+report.properties.mainFontColor+'">'+theValue+'</div>';
                    htmlCode += '       <div class="chart-item-desc" > ';
                    htmlCode += '           <p style="color:'+report.properties.descFontColor+'">'+report.properties.valueText+'</p> ';
                    htmlCode += '       </div> ';
                    htmlCode += '   </div>';
                    htmlCode += '</div>';
                }
                return htmlCode;
            }

    }

});
