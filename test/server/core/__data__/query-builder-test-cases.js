function toISO (d) {
    return d.getFullYear() +
        '-' + (d.getMonth() + 1).toString().padStart(2, '0') +
        '-' + d.getDate().toString().padStart(2, '0');
}
function toOracle (d) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return d.getDate().toString().padStart(2, '0') +
        '-' + months[d.getMonth()] +
        '-' + d.getFullYear();
}
const today = new Date();
const todayISO = toISO(today);
const todayOracle = toOracle(today);
const nextDay = new Date();
nextDay.setDate(nextDay.getDate() + 1);
const nextDayISO = toISO(nextDay);
const nextDayOracle = toOracle(nextDay);

const songCollection = { collectionID: 'song_0', collectionName: 'song' };
const albumCollection = { collectionID: 'album_0', collectionName: 'album' };
const artistCollection = { collectionID: 'artist_0', collectionName: 'artist' };
const sqlQueryCollection = { collectionID: 'sql_query_0', isSQL: true, sqlQuery: 'SELECT 1 AS value' };
const songTitleColumn = {
    id: 'title_0_raw',
    elementID: 'title_0',
    elementName: 'title',
    collectionID: songCollection.collectionID,
};
const songDurationColumn = {
    id: 'duration_0_raw',
    elementID: 'duration_0',
    elementName: 'duration',
    collectionID: songCollection.collectionID,
    elementType: 'number',
};
const songAlbumIdColumn = {
    id: 'album_id_0_raw',
    elementID: 'album_id_0',
    elementName: 'album_id',
    collectionID: songCollection.collectionID,
    elementType: 'number',
};
const songDurationTitleCustomColumn = {
    id: 'custom_0_raw',
    elementID: 'custom_0',
    collectionID: songCollection.collectionID,
    isCustom: true,
    viewExpression: "CONCAT(#duration_0, ' ? ', #title_0)",
    elementType: 'string',
};
const sqlQueryValueColumn = {
    id: 'value_0_raw',
    elementID: 'value_0',
    elementName: 'value',
    collectionID: sqlQueryCollection.collectionID,
    elementType: 'number',
};

const queryBuilderTestCases = [
    {
        name: 'simplest query possible',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'aggregation (sum)',
        query: {
            joinTree: { collection: songCollection },
            columns: [
                Object.assign({}, songTitleColumn, {
                    aggregation: 'sum',
                }),
            ],
        },
        expectedSql: {
            mysql: 'SELECT SUM(`title_0`) AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT SUM("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT SUM("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT SUM("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'aggregation (avg)',
        query: {
            joinTree: { collection: songCollection },
            columns: [
                Object.assign({}, songTitleColumn, {
                    aggregation: 'avg',
                }),
            ],
        },
        expectedSql: {
            mysql: 'SELECT AVG(`title_0`) AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT AVG("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT AVG("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT AVG("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'aggregation (min)',
        query: {
            joinTree: { collection: songCollection },
            columns: [
                Object.assign({}, songTitleColumn, {
                    aggregation: 'min',
                }),
            ],
        },
        expectedSql: {
            mysql: 'SELECT MIN(`title_0`) AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT MIN("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT MIN("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT MIN("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'aggregation (max)',
        query: {
            joinTree: { collection: songCollection },
            columns: [
                Object.assign({}, songTitleColumn, {
                    aggregation: 'max',
                }),
            ],
        },
        expectedSql: {
            mysql: 'SELECT MAX(`title_0`) AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT MAX("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT MAX("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT MAX("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'aggregation (count)',
        query: {
            joinTree: { collection: songCollection },
            columns: [
                Object.assign({}, songTitleColumn, {
                    aggregation: 'count',
                }),
            ],
        },
        expectedSql: {
            mysql: 'SELECT COUNT(`title_0`) AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT COUNT("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT COUNT("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT COUNT("title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'aggregation (countDistinct)',
        query: {
            joinTree: { collection: songCollection },
            columns: [
                Object.assign({}, songTitleColumn, {
                    aggregation: 'countDistinct',
                }),
            ],
        },
        expectedSql: {
            mysql: 'SELECT COUNT(DISTINCT `title_0`) AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT COUNT(DISTINCT "title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT COUNT(DISTINCT "title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT COUNT(DISTINCT "title_0") AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'invalid aggregation',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'filter (text, equal)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'equal',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` = \'A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" = \'A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" = \'A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" = \'A title\') "sub"',
        },
    },
    {
        name: 'filter (text, diferentThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'diferentThan',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` != \'A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" != \'A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" != \'A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" != \'A title\') "sub"',
        },
    },
    {
        name: 'filter (text, biggerThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'biggerThan',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` > \'A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > \'A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > \'A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > \'A title\') "sub"',
        },
    },
    {
        name: 'filter (text, biggerOrEqualThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'biggerOrEqualThan',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` >= \'A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= \'A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= \'A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= \'A title\') "sub"',
        },
    },
    {
        name: 'filter (text, lessThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'lessThan',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` < \'A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < \'A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < \'A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < \'A title\') "sub"',
        },
    },
    {
        name: 'filter (text, lessOrEqualThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'lessOrEqualThan',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` <= \'A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= \'A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= \'A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= \'A title\') "sub"',
        },
    },
    {
        name: 'filter (text, between)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'between',
                    criterion: { text1: 'A title', text2: 'Another title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` BETWEEN \'A title\' AND \'Another title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" BETWEEN \'A title\' AND \'Another title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" BETWEEN \'A title\' AND \'Another title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" BETWEEN \'A title\' AND \'Another title\') "sub"',
        },
    },
    {
        name: 'filter (text, notBetween)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'notBetween',
                    criterion: { text1: 'A title', text2: 'Another title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` NOT BETWEEN \'A title\' AND \'Another title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT BETWEEN \'A title\' AND \'Another title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT BETWEEN \'A title\' AND \'Another title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT BETWEEN \'A title\' AND \'Another title\') "sub"',
        },
    },
    {
        name: 'filter (text, contains)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'contains',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` LIKE \'%A title%\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'%A title%\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'%A title%\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'%A title%\') "sub"',
        },
    },
    {
        name: 'filter (text, notContains)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'notContains',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` NOT LIKE \'%A title%\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'%A title%\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'%A title%\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'%A title%\') "sub"',
        },
    },
    {
        name: 'filter (text, startWith)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'startWith',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` LIKE \'A title%\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'A title%\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'A title%\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'A title%\') "sub"',
        },
    },
    {
        name: 'filter (text, notStartWith)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'notStartWith',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` NOT LIKE \'A title%\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'A title%\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'A title%\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'A title%\') "sub"',
        },
    },
    {
        name: 'filter (text, endsWith)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'endsWith',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` LIKE \'%A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'%A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'%A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'%A title\') "sub"',
        },
    },
    {
        name: 'filter (text, notEndsWith)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'notEndsWith',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` NOT LIKE \'%A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'%A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'%A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'%A title\') "sub"',
        },
    },
    {
        name: 'filter (text, like)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'like',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` LIKE \'A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" LIKE \'A title\') "sub"',
        },
    },
    {
        name: 'filter (text, notLike)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'notLike',
                    criterion: { text1: 'A title' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` NOT LIKE \'A title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'A title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'A title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT LIKE \'A title\') "sub"',
        },
    },
    {
        name: 'filter (text, null)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'null',
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` IS NULL) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NULL) "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NULL) "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NULL) "sub"',
        },
    },
    {
        name: 'filter (text, notNull)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'notNull',
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` IS NOT NULL) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NOT NULL) "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NOT NULL) "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NOT NULL) "sub"',
        },
    },
    {
        name: 'filter (text, empty)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'empty',
                },
            ],
        },
        expectedSql: {
            mysql: "SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE TRIM(`song_0`.`title`) = '') `sub`",
            pg: "SELECT \"title_0\" AS \"title_0_raw\" FROM (SELECT \"song_0\".\"title\" AS \"title_0\" FROM \"song\" \"song_0\" WHERE TRIM(\"song_0\".\"title\") = '') \"sub\"",
            mssql: "SELECT \"title_0\" AS \"title_0_raw\" FROM (SELECT \"song_0\".\"title\" AS \"title_0\" FROM \"song\" \"song_0\" WHERE TRIM(\"song_0\".\"title\") = '') \"sub\"",
            oracle: "SELECT \"title_0\" AS \"title_0_raw\" FROM (SELECT \"song_0\".\"title\" AS \"title_0\" FROM \"song\" \"song_0\" WHERE TRIM(\"song_0\".\"title\") = '') \"sub\"",
        },
    },
    {
        name: 'filter (text, notEmpty)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'notEmpty',
                },
            ],
        },
        expectedSql: {
            mysql: "SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE TRIM(`song_0`.`title`) != '') `sub`",
            pg: "SELECT \"title_0\" AS \"title_0_raw\" FROM (SELECT \"song_0\".\"title\" AS \"title_0\" FROM \"song\" \"song_0\" WHERE TRIM(\"song_0\".\"title\") != '') \"sub\"",
            mssql: "SELECT \"title_0\" AS \"title_0_raw\" FROM (SELECT \"song_0\".\"title\" AS \"title_0\" FROM \"song\" \"song_0\" WHERE TRIM(\"song_0\".\"title\") != '') \"sub\"",
            oracle: "SELECT \"title_0\" AS \"title_0_raw\" FROM (SELECT \"song_0\".\"title\" AS \"title_0\" FROM \"song\" \"song_0\" WHERE TRIM(\"song_0\".\"title\") != '') \"sub\"",
        },
    },
    {
        name: 'filter (text, in)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'in',
                    criterion: { textList: ['A', 'list', 'of', 'titles'] },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` IN (\'A\',\'list\',\'of\',\'titles\')) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IN (\'A\',\'list\',\'of\',\'titles\')) "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IN (\'A\',\'list\',\'of\',\'titles\')) "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IN (\'A\',\'list\',\'of\',\'titles\')) "sub"',
        },
    },
    {
        name: 'filter (text, notIn)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'string',
                    filterType: 'notIn',
                    criterion: { textList: ['A', 'list', 'of', 'titles'] },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` NOT IN (\'A\',\'list\',\'of\',\'titles\')) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT IN (\'A\',\'list\',\'of\',\'titles\')) "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT IN (\'A\',\'list\',\'of\',\'titles\')) "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT IN (\'A\',\'list\',\'of\',\'titles\')) "sub"',
        },
    },
    {
        name: 'filter (date, equal-pattern)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'equal-pattern',
                    criterion: { datePattern: '#WST-TODAY#' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE (`song_0`.`title` >= \'' + todayISO + '\' AND `song_0`.`title` < \'' + nextDayISO + '\')) `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" >= '${todayISO}' AND "song_0"."title" < '${nextDayISO}')) "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" >= '${todayISO}' AND "song_0"."title" < '${nextDayISO}')) "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" >= '${todayOracle}' AND "song_0"."title" < '${nextDayOracle}')) "sub"`,
        },
    },
    {
        name: 'filter (date, diferentThan-pattern)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'diferentThan-pattern',
                    criterion: { datePattern: '#WST-TODAY#' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE (`song_0`.`title` < \'' + todayISO + '\' OR `song_0`.`title` >= \'' + nextDayISO + '\')) `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" < '${todayISO}' OR "song_0"."title" >= '${nextDayISO}')) "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" < '${todayISO}' OR "song_0"."title" >= '${nextDayISO}')) "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" < '${todayOracle}' OR "song_0"."title" >= '${nextDayOracle}')) "sub"`,
        },
    },
    {
        name: 'filter (date, biggerThan-pattern)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'biggerThan-pattern',
                    criterion: { datePattern: '#WST-TODAY#' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` > \'' + nextDayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > '${nextDayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > '${nextDayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > '${nextDayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, biggerOrEqualThan-pattern)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'biggerOrEqualThan-pattern',
                    criterion: { datePattern: '#WST-TODAY#' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` >= \'' + todayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= '${todayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= '${todayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= '${todayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, lessThan-pattern)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'lessThan-pattern',
                    criterion: { datePattern: '#WST-TODAY#' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` < \'' + todayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < '${todayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < '${todayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < '${todayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, lessOrEqualThan-pattern)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'lessOrEqualThan-pattern',
                    criterion: { datePattern: '#WST-TODAY#' },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` <= \'' + nextDayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= '${nextDayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= '${nextDayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= '${nextDayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, null)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'null',
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` IS NULL) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NULL) "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NULL) "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NULL) "sub"',
        },
    },
    {
        name: 'filter (date, notNull)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'notNull',
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` IS NOT NULL) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NOT NULL) "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NOT NULL) "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" IS NOT NULL) "sub"',
        },
    },
    {
        name: 'filter (date, between, no dates)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'between',
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'filter (date, between, first date)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'between',
                    criterion: { date1: todayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` >= \'' + todayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= '${todayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= '${todayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= '${todayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, between, second date)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'between',
                    criterion: { date2: nextDayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` <= \'' + nextDayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= '${nextDayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= '${nextDayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= '${nextDayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, between, both dates)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'between',
                    criterion: { date1: todayISO, date2: nextDayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` BETWEEN \'' + todayISO + '\' AND \'' + nextDayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" BETWEEN '${todayISO}' AND '${nextDayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" BETWEEN '${todayISO}' AND '${nextDayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" BETWEEN '${todayOracle}' AND '${nextDayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, notBetween, no dates)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'notBetween',
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'filter (date, notBetween, first date)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'notBetween',
                    criterion: { date1: todayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` < \'' + todayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < '${todayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < '${todayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < '${todayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, notBetween, second date)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'notBetween',
                    criterion: { date2: nextDayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` > \'' + nextDayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > '${nextDayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > '${nextDayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > '${nextDayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, notBetween, both dates)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'notBetween',
                    criterion: { date1: todayISO, date2: nextDayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` NOT BETWEEN \'' + todayISO + '\' AND \'' + nextDayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT BETWEEN '${todayISO}' AND '${nextDayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT BETWEEN '${todayISO}' AND '${nextDayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" NOT BETWEEN '${todayOracle}' AND '${nextDayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, equal, no dates)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'equal',
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'filter (date, equal)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'equal',
                    criterion: { date1: todayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE (`song_0`.`title` >= \'' + todayISO + '\' AND `song_0`.`title` < \'' + nextDayISO + '\')) `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" >= '${todayISO}' AND "song_0"."title" < '${nextDayISO}')) "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" >= '${todayISO}' AND "song_0"."title" < '${nextDayISO}')) "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" >= '${todayOracle}' AND "song_0"."title" < '${nextDayOracle}')) "sub"`,
        },
    },
    {
        name: 'filter (date, diferentThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'diferentThan',
                    criterion: { date1: todayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE (`song_0`.`title` < \'' + todayISO + '\' OR `song_0`.`title` >= \'' + nextDayISO + '\')) `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" < '${todayISO}' OR "song_0"."title" >= '${nextDayISO}')) "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" < '${todayISO}' OR "song_0"."title" >= '${nextDayISO}')) "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE ("song_0"."title" < '${todayOracle}' OR "song_0"."title" >= '${nextDayOracle}')) "sub"`,
        },
    },
    {
        name: 'filter (date, biggerThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'biggerThan',
                    criterion: { date1: todayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` > \'' + todayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > '${todayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > '${todayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" > '${todayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, biggerOrEqualThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'biggerOrEqualThan',
                    criterion: { date1: todayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` >= \'' + todayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= '${todayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= '${todayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" >= '${todayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, lessThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'lessThan',
                    criterion: { date1: todayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` < \'' + todayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < '${todayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < '${todayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" < '${todayOracle}') "sub"`,
        },
    },
    {
        name: 'filter (date, lessOrEqualThan)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'lessOrEqualThan',
                    criterion: { date1: todayISO },
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` <= \'' + todayISO + '\') `sub`',
            pg: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= '${todayISO}') "sub"`,
            mssql: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= '${todayISO}') "sub"`,
            oracle: `SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" <= '${todayOracle}') "sub"`,
        },
    },
    {
        name: 'filters without criterion',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'equal',
                },
                {
                    id: 'title_0_raw',
                    elementID: 'title_0',
                    elementName: 'title',
                    collectionID: 'song_0',
                    elementType: 'date',
                    filterType: 'equal',
                },
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub"',
        },
    },
    {
        name: 'quick results limit',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            quickResultLimit: 100,
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` LIMIT 100) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" FETCH FIRST 100 ROWS ONLY) "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" ORDER BY (SELECT NULL) OFFSET 0 ROWS FETCH FIRST 100 ROWS ONLY) "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" FETCH FIRST 100 ROWS ONLY) "sub"',
        },
    },
    {
        name: 'record limit',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            recordLimit: 100,
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub` LIMIT 100',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub" FETCH FIRST 100 ROWS ONLY',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub" ORDER BY (SELECT NULL) OFFSET 0 ROWS FETCH FIRST 100 ROWS ONLY',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub" FETCH FIRST 100 ROWS ONLY',
        },
    },
    {
        name: 'order by, quick results limit',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            order: [songTitleColumn],
            quickResultLimit: 100,
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` LIMIT 100) `sub` ORDER BY `title_0` ASC',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" FETCH FIRST 100 ROWS ONLY) "sub" ORDER BY "title_0" ASC',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" ORDER BY (SELECT NULL) OFFSET 0 ROWS FETCH FIRST 100 ROWS ONLY) "sub" ORDER BY "title_0" ASC',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" FETCH FIRST 100 ROWS ONLY) "sub" ORDER BY "title_0" ASC',
        },
    },
    {
        name: 'order by, record limit',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            order: [songTitleColumn],
            recordLimit: 100,
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0`) `sub` ORDER BY `title_0` ASC LIMIT 100',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub" ORDER BY "title_0" ASC FETCH FIRST 100 ROWS ONLY',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub" ORDER BY "title_0" ASC OFFSET 0 ROWS FETCH FIRST 100 ROWS ONLY',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0") "sub" ORDER BY "title_0" ASC FETCH FIRST 100 ROWS ONLY',
        },
    },
    {
        name: 'joins',
        query: {
            joinTree: {
                collection: songCollection,
                joins: [
                    {
                        collection: albumCollection,
                        parentJoin: {
                            joinType: 'right',
                            targetCollectionID: albumCollection.collectionID,
                            targetElementName: 'album_id',
                            sourceCollectionID: songCollection.collectionID,
                            sourceElementName: 'song_id',
                        }
                    },
                    {
                        collection: artistCollection,
                        parentJoin: {
                            joinType: 'left',
                            targetCollectionID: artistCollection.collectionID,
                            targetElementName: 'artist_id',
                            sourceCollectionID: songCollection.collectionID,
                            sourceElementName: 'song_id',
                        }
                    },
                ]
            },
            columns: [songTitleColumn],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` RIGHT JOIN `album` `album_0` ON (`song_0`.`song_id` = `album_0`.`album_id`) LEFT JOIN `artist` `artist_0` ON (`song_0`.`song_id` = `artist_0`.`artist_id`)) `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" RIGHT JOIN "album" "album_0" ON ("song_0"."song_id" = "album_0"."album_id") LEFT JOIN "artist" "artist_0" ON ("song_0"."song_id" = "artist_0"."artist_id")) "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" RIGHT JOIN "album" "album_0" ON ("song_0"."song_id" = "album_0"."album_id") LEFT JOIN "artist" "artist_0" ON ("song_0"."song_id" = "artist_0"."artist_id")) "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" RIGHT JOIN "album" "album_0" ON ("song_0"."song_id" = "album_0"."album_id") LEFT JOIN "artist" "artist_0" ON ("song_0"."song_id" = "artist_0"."artist_id")) "sub"',
        },
    },
    {
        name: 'group by',
        query: {
            joinTree: { collection: songCollection },
            columns: [
                songAlbumIdColumn,
                Object.assign({}, songDurationColumn, {
                    id: 'duration_0_sum',
                    aggregation: 'sum',
                }),
            ],
            groupKeys: [
                songAlbumIdColumn,
            ],
        },
        expectedSql: {
            mysql: 'SELECT `album_id_0` AS `album_id_0_raw`, SUM(`duration_0`) AS `duration_0_sum` FROM (SELECT `song_0`.`album_id` AS `album_id_0`, `song_0`.`duration` AS `duration_0` FROM `song` `song_0`) `sub` GROUP BY `album_id_0`',
            pg: 'SELECT "album_id_0" AS "album_id_0_raw", SUM("duration_0") AS "duration_0_sum" FROM (SELECT "song_0"."album_id" AS "album_id_0", "song_0"."duration" AS "duration_0" FROM "song" "song_0") "sub" GROUP BY "album_id_0"',
            mssql: 'SELECT "album_id_0" AS "album_id_0_raw", SUM("duration_0") AS "duration_0_sum" FROM (SELECT "song_0"."album_id" AS "album_id_0", "song_0"."duration" AS "duration_0" FROM "song" "song_0") "sub" GROUP BY "album_id_0"',
            oracle: 'SELECT "album_id_0" AS "album_id_0_raw", SUM("duration_0") AS "duration_0_sum" FROM (SELECT "song_0"."album_id" AS "album_id_0", "song_0"."duration" AS "duration_0" FROM "song" "song_0") "sub" GROUP BY "album_id_0"',
        },
    },
    {
        name: 'group by and order',
        query: {
            joinTree: { collection: songCollection },
            columns: [
                songAlbumIdColumn,
                Object.assign({}, songDurationColumn, {
                    id: 'duration_0_sum',
                    aggregation: 'sum',
                }),
            ],
            order: [songDurationColumn],
            groupKeys: [
                songAlbumIdColumn,
            ],
        },
        expectedSql: {
            mysql: 'SELECT `album_id_0` AS `album_id_0_raw`, SUM(`duration_0`) AS `duration_0_sum` FROM (SELECT `song_0`.`album_id` AS `album_id_0`, `song_0`.`duration` AS `duration_0` FROM `song` `song_0`) `sub` GROUP BY `album_id_0`, `duration_0` ORDER BY `duration_0` ASC',
            pg: 'SELECT "album_id_0" AS "album_id_0_raw", SUM("duration_0") AS "duration_0_sum" FROM (SELECT "song_0"."album_id" AS "album_id_0", "song_0"."duration" AS "duration_0" FROM "song" "song_0") "sub" GROUP BY "album_id_0", "duration_0" ORDER BY "duration_0" ASC',
            mssql: 'SELECT "album_id_0" AS "album_id_0_raw", SUM("duration_0") AS "duration_0_sum" FROM (SELECT "song_0"."album_id" AS "album_id_0", "song_0"."duration" AS "duration_0" FROM "song" "song_0") "sub" GROUP BY "album_id_0", "duration_0" ORDER BY "duration_0" ASC',
            oracle: 'SELECT "album_id_0" AS "album_id_0_raw", SUM("duration_0") AS "duration_0_sum" FROM (SELECT "song_0"."album_id" AS "album_id_0", "song_0"."duration" AS "duration_0" FROM "song" "song_0") "sub" GROUP BY "album_id_0", "duration_0" ORDER BY "duration_0" ASC',
        },
    },
    {
        name: 'quoted identifier',
        query: {
            joinTree: { collection: { collectionID: '"`song"`_0', collectionName: '"`song"`' } },
            columns: [{ id: 'title"`0"`raw', elementID: 'title"`0"`', elementName: '"`title"`', collectionID: '"`song"`_0' }],
        },
        expectedSql: {
            mysql: 'SELECT `title"``0"``` AS `title"``0"``raw` FROM (SELECT `"``song"``_0`.`"``title"``` AS `title"``0"``` FROM `"``song"``` `"``song"``_0`) `sub`',
            pg: 'SELECT "title""`0""`" AS "title""`0""`raw" FROM (SELECT """`song""`_0"."""`title""`" AS "title""`0""`" FROM """`song""`" """`song""`_0") "sub"',
            mssql: 'SELECT "title""`0""`" AS "title""`0""`raw" FROM (SELECT """`song""`_0"."""`title""`" AS "title""`0""`" FROM """`song""`" """`song""`_0") "sub"',
            oracle: 'SELECT "title""`0""`" AS "title""`0""`raw" FROM (SELECT """`song""`_0"."""`title""`" AS "title""`0""`" FROM """`song""`" """`song""`_0") "sub"',
        },
    },
    {
        name: 'escaped value (string)',
        query: {
            joinTree: { collection: songCollection },
            columns: [songTitleColumn],
            filters: [
                Object.assign({}, songTitleColumn, {
                    elementType: 'string',
                    filterType: 'equal',
                    criterion: { text1: "A 'quoted' title" },
                }),
            ],
        },
        expectedSql: {
            mysql: 'SELECT `title_0` AS `title_0_raw` FROM (SELECT `song_0`.`title` AS `title_0` FROM `song` `song_0` WHERE `song_0`.`title` = \'A \'\'quoted\'\' title\') `sub`',
            pg: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" = \'A \'\'quoted\'\' title\') "sub"',
            mssql: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" = \'A \'\'quoted\'\' title\') "sub"',
            oracle: 'SELECT "title_0" AS "title_0_raw" FROM (SELECT "song_0"."title" AS "title_0" FROM "song" "song_0" WHERE "song_0"."title" = \'A \'\'quoted\'\' title\') "sub"',
        },
    },
    {
        name: 'custom element with a question mark',
        query: {
            joinTree: { collection: songCollection },
            columns: [songDurationTitleCustomColumn],
            order: [songDurationTitleCustomColumn],
            groupKeys: [songDurationTitleCustomColumn],
            filters: [
                Object.assign({}, songDurationTitleCustomColumn, {
                    filterType: 'equal',
                    criterion: { text1: '1:23 ? A title' },
                }),
            ],
            layer: {
                params: {
                    schema: [
                        {
                            elements: [
                                songTitleColumn,
                                songDurationColumn,
                            ],
                        }
                    ],
                },
            },
        },
        expectedSql: {
            mysql: 'SELECT `custom_0` AS `custom_0_raw` FROM (SELECT CONCAT(`song_0`.`duration`, \' ? \', `song_0`.`title`) AS `custom_0` FROM `song` `song_0` WHERE CONCAT(`song_0`.`duration`, \' ? \', `song_0`.`title`) = \'1:23 ? A title\') `sub` GROUP BY `custom_0` ORDER BY `custom_0` ASC',
            pg: 'SELECT "custom_0" AS "custom_0_raw" FROM (SELECT CONCAT("song_0"."duration", \' ? \', "song_0"."title") AS "custom_0" FROM "song" "song_0" WHERE CONCAT("song_0"."duration", \' ? \', "song_0"."title") = \'1:23 ? A title\') "sub" GROUP BY "custom_0" ORDER BY "custom_0" ASC',
            mssql: 'SELECT "custom_0" AS "custom_0_raw" FROM (SELECT CONCAT("song_0"."duration", \' ? \', "song_0"."title") AS "custom_0" FROM "song" "song_0" WHERE CONCAT("song_0"."duration", \' ? \', "song_0"."title") = \'1:23 ? A title\') "sub" GROUP BY "custom_0" ORDER BY "custom_0" ASC',
            oracle: 'SELECT "custom_0" AS "custom_0_raw" FROM (SELECT CONCAT("song_0"."duration", \' ? \', "song_0"."title") AS "custom_0" FROM "song" "song_0" WHERE CONCAT("song_0"."duration", \' ? \', "song_0"."title") = \'1:23 ? A title\') "sub" GROUP BY "custom_0" ORDER BY "custom_0" ASC',
        },
    },
    {
        name: 'sql query collection',
        query: {
            joinTree: { collection: sqlQueryCollection },
            columns: [sqlQueryValueColumn],
        },
        expectedSql: {
            mysql: 'SELECT `value_0` AS `value_0_raw` FROM (SELECT `sql_query_0`.`value` AS `value_0` FROM (SELECT 1 AS value) `sql_query_0`) `sub`',
            pg: 'SELECT "value_0" AS "value_0_raw" FROM (SELECT "sql_query_0"."value" AS "value_0" FROM (SELECT 1 AS value) "sql_query_0") "sub"',
            mssql: 'SELECT "value_0" AS "value_0_raw" FROM (SELECT "sql_query_0"."value" AS "value_0" FROM (SELECT 1 AS value) "sql_query_0") "sub"',
            oracle: 'SELECT "value_0" AS "value_0_raw" FROM (SELECT "sql_query_0"."value" AS "value_0" FROM (SELECT 1 AS value) "sql_query_0") "sub"',
        },
    },
];

module.exports = queryBuilderTestCases;
