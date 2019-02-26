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

            if (report.properties.style === 'style1') {
                htmlCode += '<div class="xe-widget xe-counter xe-counter-info" data-count=".num" data-from="1000" data-to="2470" data-duration="4" data-easing="true">';
                htmlCode += '   <div class="xe-label">';
                htmlCode += '       <strong class="num" style="color:' + report.properties.mainFontColor + '">' + theValue + '</strong>';
                htmlCode += '       <span style="color:' + report.properties.descFontColor + '">' + theValueText + '</span>';
                htmlCode += '   </div>';
                htmlCode += '</div>';
            }

            return htmlCode;
        }
    }
});
