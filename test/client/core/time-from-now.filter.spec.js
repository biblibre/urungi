require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/time-from-now.filter.js');

describe('timeFromNow', () => {
    beforeEach(angular.mock.module('app.core'));

    let $filter;

    beforeEach(inject((_$filter_) => {
        $filter = _$filter_;
    }));

    it('should format date with moment.timeFromNow', function () {
        const timeFromNow = $filter('timeFromNow');

        const aYearAgo = new Date().setFullYear(new Date().getFullYear() - 1);

        expect(timeFromNow(aYearAgo)).toBe('a year ago');
    });
});
