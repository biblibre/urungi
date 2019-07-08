const restrict = require('../../middlewares/restrict');
const restrictAdmin = require('../../middlewares/restrict-admin');

module.exports = function (app) {
    var Layers = require('./controller.js');

    /* layers */
    app.get('/api/layers/find-all', restrictAdmin, Layers.LayersFindAll);
    app.get('/api/layers/find-one', restrict, Layers.LayersFindOne);
    app.post('/api/layers/create', restrictAdmin, Layers.LayersCreate);
    app.post('/api/layers/delete/:id', restrict, Layers.LayersDelete);
    app.post('/api/layers/update/:id', restrictAdmin, Layers.LayersUpdate);
    app.post('/api/layers/change-layer-status', restrictAdmin, Layers.changeLayerStatus);
    app.get('/api/layers/get-layers', restrict, Layers.GetLayers);
};
