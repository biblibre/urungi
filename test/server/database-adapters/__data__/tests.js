module.exports = function (client) {
    const layer = require('./layer.js')(client);

    return [
        [
            '1 column',
            {
                layer: layer,
                columns: [
                    {
                        collectionID: 'artist_1',
                        elementID: 'artist_1_name',
                        elementName: 'name',
                        id: 'artist_1_name_raw'
                    },
                ],
                joinTree: {
                    collection: {
                        collectionID: 'artist_1',
                        collectionName: 'artist',
                    },
                    joins: [],
                },
                order: [],
                filters: [],
                groupKeys: [],
            },
            [
                { artist_1_name_raw: 'Pink Floyd' },
                { artist_1_name_raw: 'The Interrupters' },
            ],
        ],
        [
            '1 date column',
            {
                layer: layer,
                columns: [
                    {
                        collectionID: 'album_1',
                        elementID: 'album_1_release_date',
                        elementName: 'release_date',
                        id: 'album_1_release_date_raw',
                    },
                ],
                joinTree: {
                    collection: {
                        collectionID: 'album_1',
                        collectionName: 'album',
                    },
                    joins: [],
                },
                order: [],
                filters: [],
                groupKeys: [],
            },
            [
                { album_1_release_date_raw: new Date(1973, 2, 1) },
                { album_1_release_date_raw: new Date(1979, 10, 30) },
                { album_1_release_date_raw: new Date(2018, 5, 29) },
            ]
        ],
        [
            'join, filter and order',
            {
                layer: layer,
                columns: [
                    {
                        collectionID: 'song_1',
                        elementID: 'song_1_title',
                        elementName: 'title',
                        id: 'song_1_title_raw',
                    },
                ],
                joinTree: {
                    collection: {
                        collectionID: 'song_1',
                        collectionName: 'song',
                    },
                    joins: [
                        {
                            parentJoin: layer.params.joins[1],
                            collection: {
                                collectionID: 'album_1',
                                collectionName: 'album',
                            },
                            joins: [],
                        }
                    ],
                },
                order: [
                    {
                        collectionID: 'song_1',
                        elementID: 'song_1_title',
                        elementName: 'title',
                        id: 'song_1_title_raw',
                        sortDesc: true,
                    },
                ],
                filters: [
                    {
                        collectionID: 'album_1',
                        elementID: 'album_1_title',
                        elementName: 'title',
                        id: 'album_1_title_raw',
                        filterType: 'equal',
                        criterion: {
                            text1: 'The Wall',
                        },
                    }
                ],
                groupKeys: [],
            },
            [
                { song_1_title_raw: 'The Thin Ice' },
                { song_1_title_raw: 'In the Flesh?' },
                { song_1_title_raw: 'Another Brick in the Wall, Part I' },
            ],
        ],
        [
            'aggregation (count)',
            {
                layer: layer,
                columns: [
                    {
                        collectionID: 'album_1',
                        elementID: 'album_1_title',
                        elementName: 'title',
                        id: 'album_1_title_raw',
                    },
                    {
                        collectionID: 'song_1',
                        elementID: 'song_1_title',
                        elementName: 'title',
                        id: 'song_1_title_count',
                        aggregation: 'count',
                    },
                ],
                joinTree: {
                    collection: {
                        collectionID: 'album_1',
                        collectionName: 'album',
                    },
                    joins: [
                        {
                            parentJoin: layer.params.joins[1],
                            collection: {
                                collectionID: 'song_1',
                                collectionName: 'song',
                            },
                            joins: [],
                        }
                    ],
                },
                order: [
                    {
                        collectionID: 'album_1',
                        elementID: 'album_1_title',
                        elementName: 'title',
                        id: 'album_1_title_raw',
                    },
                ],
                filters: [],
                groupKeys: [
                    { elementID: 'album_1_title' },
                ],
            },
            [
                { album_1_title_raw: 'Dark Side of the Moon', song_1_title_count: 5 },
                { album_1_title_raw: 'Fight the Good Fight', song_1_title_count: 3 },
                { album_1_title_raw: 'The Wall', song_1_title_count: 3 },
            ],
        ],
        [
            'filter by date (!=)',
            {
                layer: layer,
                columns: [
                    {
                        collectionID: 'album_1',
                        elementID: 'album_1_title',
                        elementName: 'title',
                        id: 'album_1_title_raw',
                    },
                ],
                joinTree: {
                    collection: {
                        collectionID: 'album_1',
                        collectionName: 'album',
                    },
                    joins: [],
                },
                order: [
                    {
                        collectionID: 'album_1',
                        elementID: 'album_1_title',
                        elementName: 'title',
                        id: 'album_1_title_raw',
                    },
                ],
                filters: [
                    {
                        collectionID: 'album_1',
                        elementID: 'album_1_release_date',
                        elementName: 'release_date',
                        id: 'album_1_release_date_raw',
                        elementType: 'date',
                        filterType: 'diferentThan',
                        criterion: {
                            date1: new Date(1979, 10, 30),
                        },
                    }
                ],
                groupKeys: [],
            },
            [
                { album_1_title_raw: 'Dark Side of the Moon' },
                { album_1_title_raw: 'Fight the Good Fight' },
            ],
        ],
        [
            'recordLimit',
            {
                layer: layer,
                columns: [
                    {
                        collectionID: 'song_1',
                        elementID: 'song_1_title',
                        elementName: 'title',
                        id: 'song_1_title_raw',
                    },
                ],
                joinTree: {
                    collection: {
                        collectionID: 'song_1',
                        collectionName: 'song',
                    },
                    joins: [],
                },
                order: [
                    {
                        collectionID: 'song_1',
                        elementID: 'song_1_title',
                        elementName: 'title',
                        id: 'song_1_title_raw',
                    },
                ],
                filters: [],
                groupKeys: [],
                recordLimit: 3
            },
            [
                { song_1_title_raw: 'Another Brick in the Wall, Part I' },
                { song_1_title_raw: 'Breathe' },
                { song_1_title_raw: 'In the Flesh?' },
            ],
        ],
        [
            'sql collection',
            {
                layer: layer,
                columns: [
                    {
                        collectionID: 'artist_album_song_1',
                        elementID: 'artist_album_song_1_artist',
                        elementName: 'artist',
                        id: 'artist_album_song_1_artist_raw',
                    },
                    {
                        collectionID: 'artist_album_song_1',
                        elementID: 'artist_album_song_1_album',
                        elementName: 'album',
                        id: 'artist_album_song_1_album_raw',
                    },
                    {
                        collectionID: 'artist_album_song_1',
                        elementID: 'artist_album_song_1_song',
                        elementName: 'song',
                        id: 'artist_album_song_1_song_raw',
                    },
                ],
                joinTree: {
                    collection: layer.params.schema[3],
                    joins: [],
                },
                order: [
                    {
                        collectionID: 'artist_album_song_1',
                        elementID: 'artist_album_song_1_artist',
                        elementName: 'artist',
                        id: 'artist_album_song_1_artist_raw',
                    },
                    {
                        collectionID: 'artist_album_song_1',
                        elementID: 'artist_album_song_1_album',
                        elementName: 'album',
                        id: 'artist_album_song_1_album_raw',
                    },
                    {
                        collectionID: 'artist_album_song_1',
                        elementID: 'artist_album_song_1_song',
                        elementName: 'song',
                        id: 'artist_album_song_1_song_raw',
                    },
                ],
                filters: [],
                groupKeys: [],
            },
            [
                {
                    artist_album_song_1_artist_raw: 'Pink Floyd',
                    artist_album_song_1_album_raw: 'Dark Side of the Moon',
                    artist_album_song_1_song_raw: 'Breathe',
                },
                {
                    artist_album_song_1_artist_raw: 'Pink Floyd',
                    artist_album_song_1_album_raw: 'Dark Side of the Moon',
                    artist_album_song_1_song_raw: 'On the Run',
                },
                {
                    artist_album_song_1_artist_raw: 'Pink Floyd',
                    artist_album_song_1_album_raw: 'Dark Side of the Moon',
                    artist_album_song_1_song_raw: 'Speak to Me',
                },
                {
                    artist_album_song_1_artist_raw: 'Pink Floyd',
                    artist_album_song_1_album_raw: 'Dark Side of the Moon',
                    artist_album_song_1_song_raw: 'The Great Gig in the Sky',
                },
                {
                    artist_album_song_1_artist_raw: 'Pink Floyd',
                    artist_album_song_1_album_raw: 'Dark Side of the Moon',
                    artist_album_song_1_song_raw: 'Time',
                },
                {
                    artist_album_song_1_artist_raw: 'Pink Floyd',
                    artist_album_song_1_album_raw: 'The Wall',
                    artist_album_song_1_song_raw: 'Another Brick in the Wall, Part I',
                },
                {
                    artist_album_song_1_artist_raw: 'Pink Floyd',
                    artist_album_song_1_album_raw: 'The Wall',
                    artist_album_song_1_song_raw: 'In the Flesh?',
                },
                {
                    artist_album_song_1_artist_raw: 'Pink Floyd',
                    artist_album_song_1_album_raw: 'The Wall',
                    artist_album_song_1_song_raw: 'The Thin Ice',
                },
                {
                    artist_album_song_1_artist_raw: 'The Interrupters',
                    artist_album_song_1_album_raw: 'Fight the Good Fight',
                    artist_album_song_1_song_raw: "She's Kerosene",
                },
                {
                    artist_album_song_1_artist_raw: 'The Interrupters',
                    artist_album_song_1_album_raw: 'Fight the Good Fight',
                    artist_album_song_1_song_raw: 'So Wrong',
                },
                {
                    artist_album_song_1_artist_raw: 'The Interrupters',
                    artist_album_song_1_album_raw: 'Fight the Good Fight',
                    artist_album_song_1_song_raw: 'Title Holder',
                },
            ],
        ],
        [
            'custom element',
            {
                layer: layer,
                columns: [
                    Object.assign({}, layer.objects[8], {
                        id: 'custom_artist_album_raw',
                    }),
                ],
                joinTree: {
                    collection: layer.params.schema[3],
                    joins: [],
                },
                order: [
                    Object.assign({}, layer.objects[8], {
                        id: 'custom_artist_album_raw',
                        sortDesc: true,
                    }),
                ],
                filters: [],
                groupKeys: [
                    Object.assign({}, layer.objects[8], {
                        id: 'custom_artist_album_raw',
                    }),
                ],
            },
            [
                { custom_artist_album_raw: 'The InterruptersFight the Good Fight' },
                { custom_artist_album_raw: 'Pink FloydThe Wall' },
                { custom_artist_album_raw: 'Pink FloydDark Side of the Moon' },
            ],
        ],
    ];
};
