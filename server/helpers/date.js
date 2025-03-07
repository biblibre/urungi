module.exports = {
    getDatePatternBounds,
};

function getDatePatternBounds (pattern) {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    const dates = [];

    switch (pattern) {
    case '#WST-TODAY#':
        dates[0] = new Date(year, month, day);
        dates[1] = new Date(year, month, day + 1);
        break;

    case '#WST-YESTERDAY#':
        dates[0] = new Date(year, month, day - 1);
        dates[1] = new Date(year, month, day);
        break;

    case '#WST-THISWEEK#': // TODO: first day monday instead sunday
        dates[0] = new Date(year, month, day - today.getDay());
        dates[1] = new Date(year, month, day - today.getDay() + 7);
        break;

    case '#WST-LASTWEEK#': // TODO: first day monday instead sunday
        dates[0] = new Date(year, month, day - 7 - today.getDay());
        dates[1] = new Date(year, month, day - today.getDay());
        break;

    case '#WST-THISMONTH#':
        dates[0] = new Date(year, month, 1);
        dates[1] = new Date(year, month + 1, 1);
        break;

    case '#WST-LASTMONTH#':
        dates[0] = new Date(year, month - 1, 1);
        dates[1] = new Date(year, month, 1);
        break;

    case '#WST-THISYEAR#':
        dates[0] = new Date(year, 0, 1);
        dates[1] = new Date(year + 1, 0, 1);
        break;

    case '#WST-LASTYEAR#':
        dates[0] = new Date(year - 1, 0, 1);
        dates[1] = new Date(year, 0, 1);
        break;

    case '#WST-FIRSTQUARTER#':
        dates[0] = new Date(year, 0, 1);
        dates[1] = new Date(year, 3, 1);
        break;

    case '#WST-SECONDQUARTER#':
        dates[0] = new Date(year, 3, 1);
        dates[1] = new Date(year, 6, 1);
        break;

    case '#WST-THIRDQUARTER#':
        dates[0] = new Date(year, 6, 1);
        dates[1] = new Date(year, 9, 1);
        break;

    case '#WST-FOURTHQUARTER#':
        dates[0] = new Date(year, 9, 1);
        dates[1] = new Date(year + 1, 0, 1);
        break;

    case '#WST-FIRSTSEMESTER#':
        dates[0] = new Date(year, 0, 1);
        dates[1] = new Date(year, 6, 1);
        break;

    case '#WST-SECONDSEMESTER#':
        dates[0] = new Date(year, 6, 1);
        dates[1] = new Date(year + 1, 0, 1);
        break;

    case '#WST-LYFIRSTQUARTER#':
        dates[0] = new Date(year - 1, 0, 1);
        dates[1] = new Date(year - 1, 3, 1);
        break;

    case '#WST-LYSECONDQUARTER#':
        dates[0] = new Date(year - 1, 3, 1);
        dates[1] = new Date(year - 1, 6, 1);
        break;

    case '#WST-LYTHIRDQUARTER#':
        dates[0] = new Date(year - 1, 6, 1);
        dates[1] = new Date(year - 1, 9, 1);
        break;

    case '#WST-LYFOURTHQUARTER#':
        dates[0] = new Date(year - 1, 9, 1);
        dates[1] = new Date(year, 0, 1);
        break;

    case '#WST-LYFIRSTSEMESTER#':
        dates[0] = new Date(year - 1, 0, 1);
        dates[1] = new Date(year - 1, 6, 1);
        break;

    case '#WST-LYSECONDSEMESTER#':
        dates[0] = new Date(year - 1, 6, 1);
        dates[1] = new Date(year, 0, 1);
        break;

    default:
        throw new Error('unknown pattern: ' + pattern);
    }

    return dates;
}
