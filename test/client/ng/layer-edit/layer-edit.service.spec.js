require('angular-ui-sortable');
require('angular-ui-tree');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/layer-edit/layer-edit.module.js');
require('../../../../public/js/ng/layer-edit/layer-edit.service.js');

describe('layerEditService', function () {
    beforeEach(angular.mock.module('app.layer-edit'));

    let layerEditService;

    beforeEach(inject(function (_layerEditService_) {
        layerEditService = _layerEditService_;
    }));

    describe('newID', function () {
        it('should return a random id of 4 alphabetic characters', function () {
            const layer = {};
            const id = layerEditService.newID(layer);

            expect(id).toMatch(/^[a-z]{4}$/);
        });
    });
});
