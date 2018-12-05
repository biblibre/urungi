app.service('reportHtmlWidgets', function () {
    this.generateIndicator = function (report) {
        return generateIndicator(report);
    };

    function generateIndicator (report) {
        var htmlCode = '';

        var theData = report.query.data;
        if (theData) {
            if (!report.properties.style) { report.properties.style = 'style1'; }

            var theYKey = report.properties.ykeys[0].id;

            theYKey = theYKey.replace(/[^a-zA-Z ]/g, '');

            var theValue = '{{' + theData[0][theYKey] + '| number}}';

            if (report.properties.valueType === 'percentage') {
                theValue = '{{' + theData[0].value + '| number}} %';
            }

            if (report.properties.valueType === 'currency' && report.properties.currencySymbol) {
                theValue = '{{' + theData[0].value + '| number}}' + ' ' + report.properties.currencySymbol;
            }

            var theValueText = '';

            if (typeof report.properties.valueText !== 'undefined') {
                theValueText = report.properties.valueText;
            }

            var theBackgroundColor = '#68b828';
            if (report.properties.backgroundColor) { theBackgroundColor = report.properties.backgroundColor; }
            var theFontColor = '#fff';
            if (report.properties.fontColor) { theFontColor = report.properties.fontColor; }

            if (report.properties.style === 'style1') {
                htmlCode += '<div class="xe-widget xe-counter xe-counter-info" data-count=".num" data-from="1000" data-to="2470" data-duration="4" data-easing="true">';
                htmlCode += '   <div class="xe-icon" >';
                htmlCode += '       <i class="fa ' + report.properties.reportIcon + '" style="background-color: ' + theBackgroundColor + '"></i>';
                htmlCode += '   </div>';
                htmlCode += '   <div class="xe-label">';
                htmlCode += '       <strong class="num" style="color:' + report.properties.mainFontColor + '">' + theValue + '</strong>';
                htmlCode += '       <span style="color:' + report.properties.descFontColor + '">' + theValueText + '</span>';
                htmlCode += '   </div>';
                htmlCode += '</div>';
            }

            if (report.properties.style === 'style2') {
                htmlCode += '<div class="xe-widget xe-counter-block" xe-counter="" data-count=".num" data-from="0" data-to="99.9" data-suffix="%" data-duration="2" style="background-color: ' + theBackgroundColor + ';height:100%;margin-bottom:0px;">';
                htmlCode += '   <div class="xe-upper"  style="background-color: ' + theBackgroundColor + '">';
                htmlCode += '       <div class="xe-icon">';
                htmlCode += '           <i class="fa ' + report.properties.reportIcon + '"></i> ';
                htmlCode += '       </div>';
                htmlCode += '       <div class="xe-label">';
                htmlCode += '           <strong class="num" style="color:' + report.properties.mainFontColor + '">' + theValue + '</strong>';
                htmlCode += '           <span style="color:' + report.properties.descFontColor + '">' + report.properties.valueText + '</span> ';
                htmlCode += '       </div> ';
                htmlCode += '   </div>';
                htmlCode += '   <div class="xe-lower"> ';
                htmlCode += '       <div class="border"></div> ';
                htmlCode += '       </div> ';
                htmlCode += '   </div> ';
                htmlCode += '</div> ';
            }

            if (report.properties.style === 'style3') {
                htmlCode += '<div class="chart-item-bg-2" style="background-color: ' + theBackgroundColor + ';color:' + theFontColor + ';height:100%;">';
                htmlCode += '   <div class="chart-item-num" xe-counter="" data-count="this" data-from="0" data-to="98" data-suffix="%" data-duration="2" style="padding: 10px; color:' + report.properties.mainFontColor + '">' + theValue + '</div>';
                htmlCode += '       <div class="chart-item-desc" > ';
                htmlCode += '           <p style="color:' + report.properties.descFontColor + '">' + report.properties.valueText + '</p> ';
                htmlCode += '       </div> ';
                htmlCode += '   </div>';
                htmlCode += '</div>';
            }
            return htmlCode;
        }
    }
});
