(function () {
    'use strict';

    angular.module('app.report').service('reportHtmlWidgets', reportHtmlWidgets);

    function reportHtmlWidgets () {
        this.generateIndicator = generateIndicator;

        function generateIndicator (report, data) {
            let htmlCode = '';

            const theData = data;
            if (theData) {
                let theYKey = report.properties.ykeys[0].id;

                theYKey = theYKey.replace(/[^a-zA-Z ]/g, '');

                let theValue = theData[0][theYKey];

                if (report.properties.valueType === 'percentage') {
                    theValue = theData[0].value;
                }

                if (report.properties.valueType === 'currency' && report.properties.currencySymbol) {
                    theValue = theData[0].value + ' ' + report.properties.currencySymbol;
                }

                let theValueText = '';

                if (typeof report.properties.valueText !== 'undefined') {
                    theValueText = report.properties.valueText;
                }

                htmlCode += '<div class="xe-widget xe-counter xe-counter-info" data-count=".num" data-from="1000" data-to="2470" data-duration="4" data-easing="true">';
                htmlCode += '   <div class="xe-label">';
                htmlCode += '       <div class="num">' + theValue + '</div>';
                htmlCode += '       <span style="color: #ccc;">' + theValueText + '</span>';
                htmlCode += '   </div>';
                htmlCode += '</div>';

                return htmlCode;
            }
        }
    }
})();
