module.exports = function (app) {
    var Pages = require('./controller.js');

    /* Reports */
    app.get('/api/pages/find-all', restrict, Pages.PagesFindAll);
    app.get('/api/pages/find-one', restrict, Pages.PagesFindOne);
    app.post('/api/pages/create', restrict, Pages.PagesCreate);
    app.post('/api/pages/duplicate', restrict, Pages.PagesDuplicate);
    app.post('/api/pages/update/:id', restrict, Pages.PagesUpdate);
    app.post('/api/pages/delete/:id', restrict, Pages.PagesDelete);
    app.get('/api/pages/get/:id', restrict, Pages.getPage);
    app.post('/api/pages/publish-page', restrict, Pages.PublishPage);
    app.post('/api/pages/unpublish', restrict, Pages.UnpublishPage);
};
