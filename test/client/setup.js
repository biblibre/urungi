const jQuery = require('jquery');
Object.defineProperty(window, 'jQuery', { value: jQuery });
Object.defineProperty(window, '$', { value: jQuery });

const Noty = require('noty');
Object.defineProperty(window, 'Noty', { value: Noty });

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
