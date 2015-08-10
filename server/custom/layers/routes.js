module.exports = function (app) {
    var Layers = require('./controller.js');

    /* layers */
    app.get('/api/layers/find-all', restrict, Layers.LayersFindAll);
    app.get('/api/layers/find-one', restrict, Layers.LayersFindOne);
    app.post('/api/layers/create', restrict, Layers.LayersCreate);
    app.post('/api/layers/update/:id', restrict, Layers.LayersUpdate);
    app.post('/api/layers/delete/:id', restrict, Layers.LayersDelete);
};
