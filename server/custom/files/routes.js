module.exports = function (app) {
	var Files = require('./controller.js');

	app.get('/api/files/get-files', restrict, Files.getFiles);
    app.post('/api/files/upload', restrict, Files.upload);
};