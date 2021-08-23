require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/notification.service.js');

describe('notify', function () {
    beforeEach(angular.mock.module('app.core'));

    let notify;
    let PNotify;
    let PNotifySuccessSpy;

    beforeEach(inject(function (_notify_, _PNotify_) {
        notify = _notify_;
        PNotify = _PNotify_;
    }));

    beforeEach(function () {
        PNotifySuccessSpy = jest.spyOn(PNotify, 'success');
    });

    it('should be defined', function () {
        expect(notify).toBeDefined();
        expect(notify.success).toBeDefined();
        expect(notify.error).toBeDefined();
        expect(notify.notice).toBeDefined();
    });
    it('should be an object', function () {
        expect(typeof (notify)).toBe('object');
    });
    it('PNotify must be call with correct args', function () {
        notify.success('Hello World');
        expect(PNotifySuccessSpy).toHaveBeenCalledWith(expect.objectContaining({
            text: 'Hello World',
        }));
    });
});
