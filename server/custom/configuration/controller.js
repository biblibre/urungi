var Configuration = connection.model('Configuration');

require('../../core/controller.js');

function ConfigurationController(model) {
    this.model = model;
    this.searchFields = [];
}

ConfigurationController.inherits(Controller);

var controller = new ConfigurationController(Configuration);



