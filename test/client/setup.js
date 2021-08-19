const jQuery = require('jquery');
Object.defineProperty(window, 'jQuery', { value: jQuery });
Object.defineProperty(window, '$', { value: jQuery });

const PNotify = require('@pnotify/core');
const PNotifyBootstrap4 = require('@pnotify/bootstrap4');
Object.defineProperty(window, 'PNotify', { value: PNotify });
Object.defineProperty(window, 'PNotifyBootstrap4', { value: PNotifyBootstrap4 });

const moment = require('moment');
Object.defineProperty(window, 'moment', { value: moment });

const numeral = require('numeral');
Object.defineProperty(window, 'numeral', { value: numeral });

const angular = require('angular');
Object.defineProperty(window, 'angular', { value: angular });

require('angular-route');
require('angular-gettext');
require('angular-mocks');
require('angular-ui-bootstrap');

require('../../dist/templates/templates.js');
