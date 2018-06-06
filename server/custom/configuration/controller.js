var Configuration = connection.model('Configuration');

const Controller = require('../../core/controller.js');

class ConfigurationController extends Controller {
    constructor () {
        super(Configuration);
        this.searchFields = [];
    }
}
