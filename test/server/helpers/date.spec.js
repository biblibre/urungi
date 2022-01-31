const dateHelper = require('../../../server/helpers/date.js');

describe('dateHelper', function () {
    describe('getDatePatternBounds', function () {
        test('#WST-TODAY#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-TODAY#');
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(yesterday);
            expect(bounds[0]).toBeBeforeOrEqual(today);

            expect(bounds[1]).toBeAfter(today);
            expect(bounds[1]).toBeBeforeOrEqual(tomorrow);
        });

        test('#WST-YESTERDAY#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-YESTERDAY#');
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(twoDaysAgo);
            expect(bounds[0]).toBeBeforeOrEqual(yesterday);

            expect(bounds[1]).toBeAfter(yesterday);
            expect(bounds[1]).toBeBeforeOrEqual(today);
        });

        test('#WST-THISWEEK#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-THISWEEK#');
            const today = new Date();
            const sameDayLastWeek = new Date();
            sameDayLastWeek.setDate(today.getDate() - 7);
            const sameDayNextWeek = new Date();
            sameDayNextWeek.setDate(today.getDate() + 7);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(sameDayLastWeek);
            expect(bounds[0]).toBeBeforeOrEqual(today);
            expect(bounds[0].getDay()).toBe(0);

            expect(bounds[1]).toBeAfter(today);
            expect(bounds[1]).toBeBeforeOrEqual(sameDayNextWeek);
            expect(bounds[1].getDay()).toBe(0);
        });

        test('#WST-LASTWEEK#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-LASTWEEK#');
            const today = new Date();
            const sameDayLastWeek = new Date();
            sameDayLastWeek.setDate(today.getDate() - 7);
            const sameDayTwoWeeksAgo = new Date();
            sameDayTwoWeeksAgo.setDate(today.getDate() - 14);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(sameDayTwoWeeksAgo);
            expect(bounds[0]).toBeBeforeOrEqual(sameDayLastWeek);
            expect(bounds[0].getDay()).toBe(0);

            expect(bounds[1]).toBeAfter(sameDayLastWeek);
            expect(bounds[1]).toBeBeforeOrEqual(today);
            expect(bounds[1].getDay()).toBe(0);
        });

        test('#WST-THISMONTH#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-THISMONTH#');
            const today = new Date();
            const oneMonthInTheFuture = new Date();
            oneMonthInTheFuture.setMonth(today.getDate() + 31);
            const oneMonthAgo = new Date();
            oneMonthAgo.setDate(today.getDate() - 31);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeBeforeOrEqual(today);
            expect(bounds[0]).toBeAfter(oneMonthAgo);
            expect(bounds[0].getDate()).toBe(1);

            expect(bounds[1]).toBeAfter(today);
            expect(bounds[1]).toBeBefore(oneMonthInTheFuture);
            expect(bounds[1].getDate()).toBe(1);
        });

        test('#WST-LASTMONTH#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-LASTMONTH#');
            const today = new Date();

            // 28 is the minimum number of days in a month
            const oneMonthAgo = new Date();
            oneMonthAgo.setDate(today.getDate() - 28);

            // 62 is the maximum number of days in two consecutive months
            const twoMonthsAgo = new Date();
            twoMonthsAgo.setDate(today.getDate() - 62);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(twoMonthsAgo);
            expect(bounds[0]).toBeBeforeOrEqual(oneMonthAgo);
            expect(bounds[0].getDate()).toBe(1);

            expect(bounds[1]).toBeBeforeOrEqual(today);
            expect(bounds[1]).toBeAfter(oneMonthAgo);
            expect(bounds[1].getDate()).toBe(1);
        });

        test('#WST-THISYEAR#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-THISYEAR#');
            const today = new Date();
            const sameDayNextYear = new Date();
            sameDayNextYear.setFullYear(today.getFullYear() + 1);
            const sameDayLastYear = new Date();
            sameDayLastYear.setFullYear(today.getFullYear() - 1);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(sameDayLastYear);
            expect(bounds[0]).toBeBeforeOrEqual(today);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(0);

            expect(bounds[1]).toBeAfter(today);
            expect(bounds[1]).toBeBeforeOrEqual(sameDayNextYear);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(0);
        });

        test('#WST-LASTYEAR#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-LASTYEAR#');
            const today = new Date();
            const sameDayLastYear = new Date();
            sameDayLastYear.setFullYear(today.getFullYear() - 1);
            const sameDayTwoYearsAgo = new Date();
            sameDayTwoYearsAgo.setFullYear(today.getFullYear() - 2);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(sameDayTwoYearsAgo);
            expect(bounds[0]).toBeBeforeOrEqual(sameDayLastYear);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(0);

            expect(bounds[1]).toBeAfter(sameDayLastYear);
            expect(bounds[1]).toBeBeforeOrEqual(today);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(0);
        });

        test('#WST-FIRSTQUARTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-FIRSTQUARTER#');
            const today = new Date();
            const dayInQuarter = new Date(today.getFullYear(), 1, 15);
            const dayThreeMonthsBefore = new Date(dayInQuarter.getTime());
            dayThreeMonthsBefore.setMonth(dayThreeMonthsBefore.getMonth() - 3);
            const dayThreeMonthsAfter = new Date(dayInQuarter.getTime());
            dayThreeMonthsAfter.setMonth(dayThreeMonthsAfter.getMonth() + 3);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(dayThreeMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInQuarter);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(0);

            expect(bounds[1]).toBeAfter(dayInQuarter);
            expect(bounds[1]).toBeBeforeOrEqual(dayThreeMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(3);
        });

        test('#WST-SECONDQUARTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-SECONDQUARTER#');
            const today = new Date();
            const dayInQuarter = new Date(today.getFullYear(), 4, 15);
            const dayThreeMonthsBefore = new Date(dayInQuarter.getTime());
            dayThreeMonthsBefore.setMonth(dayThreeMonthsBefore.getMonth() - 3);
            const dayThreeMonthsAfter = new Date(dayInQuarter.getTime());
            dayThreeMonthsAfter.setMonth(dayThreeMonthsAfter.getMonth() + 3);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(dayThreeMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInQuarter);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(3);

            expect(bounds[1]).toBeAfter(dayInQuarter);
            expect(bounds[1]).toBeBeforeOrEqual(dayThreeMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(6);
        });

        test('#WST-THIRDQUARTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-THIRDQUARTER#');
            const today = new Date();
            const dayInQuarter = new Date(today.getFullYear(), 7, 15);
            const dayThreeMonthsBefore = new Date(dayInQuarter.getTime());
            dayThreeMonthsBefore.setMonth(dayThreeMonthsBefore.getMonth() - 3);
            const dayThreeMonthsAfter = new Date(dayInQuarter.getTime());
            dayThreeMonthsAfter.setMonth(dayThreeMonthsAfter.getMonth() + 3);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(dayThreeMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInQuarter);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(6);

            expect(bounds[1]).toBeAfter(dayInQuarter);
            expect(bounds[1]).toBeBeforeOrEqual(dayThreeMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(9);
        });

        test('#WST-FOURTHQUARTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-FOURTHQUARTER#');
            const today = new Date();
            const dayInQuarter = new Date(today.getFullYear(), 10, 15);
            const dayThreeMonthsBefore = new Date(dayInQuarter.getTime());
            dayThreeMonthsBefore.setMonth(dayThreeMonthsBefore.getMonth() - 3);
            const dayThreeMonthsAfter = new Date(dayInQuarter.getTime());
            dayThreeMonthsAfter.setMonth(dayThreeMonthsAfter.getMonth() + 3);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(dayThreeMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInQuarter);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(9);

            expect(bounds[1]).toBeAfter(dayInQuarter);
            expect(bounds[1]).toBeBeforeOrEqual(dayThreeMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(0);
        });

        test('#WST-FIRSTSEMESTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-FIRSTSEMESTER#');
            const today = new Date();
            const dayInSemester = new Date(today.getFullYear(), 1, 15);
            const daySixMonthsBefore = new Date(dayInSemester.getTime());
            daySixMonthsBefore.setMonth(daySixMonthsBefore.getMonth() - 6);
            const daySixMonthsAfter = new Date(dayInSemester.getTime());
            daySixMonthsAfter.setMonth(daySixMonthsAfter.getMonth() + 6);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(daySixMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInSemester);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(0);

            expect(bounds[1]).toBeAfter(dayInSemester);
            expect(bounds[1]).toBeBeforeOrEqual(daySixMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(6);
        });

        test('#WST-SECONDSEMESTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-SECONDSEMESTER#');
            const today = new Date();
            const dayInSemester = new Date(today.getFullYear(), 7, 15);
            const daySixMonthsBefore = new Date(dayInSemester.getTime());
            daySixMonthsBefore.setMonth(daySixMonthsBefore.getMonth() - 6);
            const daySixMonthsAfter = new Date(dayInSemester.getTime());
            daySixMonthsAfter.setMonth(daySixMonthsAfter.getMonth() + 6);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(daySixMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInSemester);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(6);

            expect(bounds[1]).toBeAfter(dayInSemester);
            expect(bounds[1]).toBeBeforeOrEqual(daySixMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(0);
        });

        test('#WST-LYFIRSTQUARTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-LYFIRSTQUARTER#');
            const today = new Date();
            const dayInQuarter = new Date(today.getFullYear() - 1, 1, 15);
            const dayThreeMonthsBefore = new Date(dayInQuarter.getTime());
            dayThreeMonthsBefore.setMonth(dayThreeMonthsBefore.getMonth() - 3);
            const dayThreeMonthsAfter = new Date(dayInQuarter.getTime());
            dayThreeMonthsAfter.setMonth(dayThreeMonthsAfter.getMonth() + 3);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(dayThreeMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInQuarter);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(0);

            expect(bounds[1]).toBeAfter(dayInQuarter);
            expect(bounds[1]).toBeBeforeOrEqual(dayThreeMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(3);
        });

        test('#WST-LYSECONDQUARTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-LYSECONDQUARTER#');
            const today = new Date();
            const dayInQuarter = new Date(today.getFullYear() - 1, 4, 15);
            const dayThreeMonthsBefore = new Date(dayInQuarter.getTime());
            dayThreeMonthsBefore.setMonth(dayThreeMonthsBefore.getMonth() - 3);
            const dayThreeMonthsAfter = new Date(dayInQuarter.getTime());
            dayThreeMonthsAfter.setMonth(dayThreeMonthsAfter.getMonth() + 3);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(dayThreeMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInQuarter);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(3);

            expect(bounds[1]).toBeAfter(dayInQuarter);
            expect(bounds[1]).toBeBeforeOrEqual(dayThreeMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(6);
        });

        test('#WST-LYTHIRDQUARTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-LYTHIRDQUARTER#');
            const today = new Date();
            const dayInQuarter = new Date(today.getFullYear() - 1, 7, 15);
            const dayThreeMonthsBefore = new Date(dayInQuarter.getTime());
            dayThreeMonthsBefore.setMonth(dayThreeMonthsBefore.getMonth() - 3);
            const dayThreeMonthsAfter = new Date(dayInQuarter.getTime());
            dayThreeMonthsAfter.setMonth(dayThreeMonthsAfter.getMonth() + 3);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(dayThreeMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInQuarter);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(6);

            expect(bounds[1]).toBeAfter(dayInQuarter);
            expect(bounds[1]).toBeBeforeOrEqual(dayThreeMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(9);
        });

        test('#WST-LYFOURTHQUARTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-LYFOURTHQUARTER#');
            const today = new Date();
            const dayInQuarter = new Date(today.getFullYear() - 1, 10, 15);
            const dayThreeMonthsBefore = new Date(dayInQuarter.getTime());
            dayThreeMonthsBefore.setMonth(dayThreeMonthsBefore.getMonth() - 3);
            const dayThreeMonthsAfter = new Date(dayInQuarter.getTime());
            dayThreeMonthsAfter.setMonth(dayThreeMonthsAfter.getMonth() + 3);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(dayThreeMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInQuarter);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(9);

            expect(bounds[1]).toBeAfter(dayInQuarter);
            expect(bounds[1]).toBeBeforeOrEqual(dayThreeMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(0);
        });

        test('#WST-LYFIRSTSEMESTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-LYFIRSTSEMESTER#');
            const today = new Date();
            const dayInSemester = new Date(today.getFullYear() - 1, 1, 15);
            const daySixMonthsBefore = new Date(dayInSemester.getTime());
            daySixMonthsBefore.setMonth(daySixMonthsBefore.getMonth() - 6);
            const daySixMonthsAfter = new Date(dayInSemester.getTime());
            daySixMonthsAfter.setMonth(daySixMonthsAfter.getMonth() + 6);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(daySixMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInSemester);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(0);

            expect(bounds[1]).toBeAfter(dayInSemester);
            expect(bounds[1]).toBeBeforeOrEqual(daySixMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(6);
        });

        test('#WST-LYSECONDSEMESTER#', function () {
            const bounds = dateHelper.getDatePatternBounds('#WST-LYSECONDSEMESTER#');
            const today = new Date();
            const dayInSemester = new Date(today.getFullYear() - 1, 7, 15);
            const daySixMonthsBefore = new Date(dayInSemester.getTime());
            daySixMonthsBefore.setMonth(daySixMonthsBefore.getMonth() - 6);
            const daySixMonthsAfter = new Date(dayInSemester.getTime());
            daySixMonthsAfter.setMonth(daySixMonthsAfter.getMonth() + 6);

            expect(Array.isArray(bounds)).toBe(true);
            expect(bounds).toHaveLength(2);

            expect(bounds[0]).toBeAfter(daySixMonthsBefore);
            expect(bounds[0]).toBeBeforeOrEqual(dayInSemester);
            expect(bounds[0].getDate()).toBe(1);
            expect(bounds[0].getMonth()).toBe(6);

            expect(bounds[1]).toBeAfter(dayInSemester);
            expect(bounds[1]).toBeBeforeOrEqual(daySixMonthsAfter);
            expect(bounds[1].getDate()).toBe(1);
            expect(bounds[1].getMonth()).toBe(0);
        });

        test('unknown pattern should throw', function () {
            expect(() => {
                dateHelper.getDatePatternBounds('unknown pattern');
            }).toThrow('unknown pattern');
        });
    });
});
