const jQuery = require('jquery');
Object.defineProperty(window, 'jQuery', { value: jQuery });
Object.defineProperty(window, '$', { value: jQuery });

const PNotify = require('@pnotify/core');
Object.defineProperty(window, 'PNotify', { value: PNotify });
const PNotifyBootstrap3 = require('@pnotify/bootstrap3');
Object.defineProperty(window, 'PNotifyBootstrap3', { value: PNotifyBootstrap3 });
const PNotifyFontAwesome4 = require('@pnotify/font-awesome4');
Object.defineProperty(window, 'PNotifyFontAwesome4', { value: PNotifyFontAwesome4 });

const moment = require('moment');
Object.defineProperty(window, 'moment', { value: moment });

const numeral = require('numeral');
Object.defineProperty(window, 'numeral', { value: numeral });

const L = require('leaflet');
Object.defineProperty(window, 'L', { value: L });

const angular = require('angular');
Object.defineProperty(window, 'angular', { value: angular });

require('angular-route');
require('angular-gettext');
require('angular-mocks');
require('angular-ui-bootstrap');

require('../../dist/templates/templates.js');
