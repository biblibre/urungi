describe('pager', function () {
    beforeEach(module('app.core'));

    let pager;

    beforeEach(inject(function (_pager_) {
        pager = _pager_;
    }));

    describe('getPager', function () {
        it('should return a list of pages', function () {
            let p = pager.getPager(1, 3);
            expect(p.pages).toEqual([1, 2, 3]);

            p = pager.getPager(1, 13);
            expect(p.pages).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

            p = pager.getPager(11, 13);
            expect(p.pages).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
        });
    });
});
