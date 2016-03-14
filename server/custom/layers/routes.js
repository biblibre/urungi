module.exports = function (app) {
    var Layers = require('./controller.js');

    /* layers */
    app.get('/api/layers/find-all', restrictRole(['WSTADMIN']), Layers.LayersFindAll);
    app.get('/api/layers/find-one', restrict, Layers.LayersFindOne);
    app.post('/api/layers/create', restrictRole(['WSTADMIN']), Layers.LayersCreate);
    app.post('/api/layers/update/:id', restrictRole(['WSTADMIN']), Layers.LayersUpdate);
    app.post('/api/layers/delete/:id', restrictRole(['WSTADMIN']), Layers.LayersDelete);
    app.post('/api/layers/change-layer-status', restrictRole(['WSTADMIN']), Layers.changeLayerStatus);
    app.get('/api/layers/get-layers', restrict, Layers.GetLayers);
};
