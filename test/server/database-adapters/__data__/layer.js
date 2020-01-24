module.exports = function (client) {
    return {
        name: 'Test layer',
        status: 'active',
        params: {
            joins: [
                {
                    sourceCollectionID: 'artist_1',
                    sourceCollectionName: 'artist',
                    sourceElementID: 'artist_1_artist_id',
                    sourceElementName: 'artist_id',
                    targetCollectionID: 'album_1',
                    targetCollectionName: 'album',
                    targetElementID: 'album_1_artist_id',
                    targetElementName: 'artist_id',
                },
                {
                    sourceCollectionID: 'album_1',
                    sourceCollectionName: 'album',
                    sourceElementID: 'album_1_album_id',
                    sourceElementName: 'album_id',
                    targetCollectionID: 'song_1',
                    targetCollectionName: 'song',
                    targetElementID: 'song_1_album_id',
                    targetElementName: 'album_id',
                },
            ],
            schema: [
                {
                    collectionID: 'artist_1',
                    collectionName: 'artist',
                    elements: [
                        {
                            collectionID: 'artist_1',
                            collectionName: 'artist',
                            elementID: 'artist_1_artist_id',
                            elementName: 'artist_id',
                        },
                        {
                            collectionID: 'artist_1',
                            collectionName: 'artist',
                            elementID: 'artist_1_name',
                            elementName: 'name',
                        },
                    ],
                },
                {
                    collectionID: 'album_1',
                    collectionName: 'album',
                    elements: [
                        {
                            collectionID: 'album_1',
                            collectionName: 'album',
                            elementID: 'album_1_album_id',
                            elementName: 'album_id',
                        },
                        {
                            collectionID: 'album_1',
                            collectionName: 'album',
                            elementID: 'album_1_artist_id',
                            elementName: 'artist_id',
                        },
                        {
                            collectionID: 'album_1',
                            collectionName: 'album',
                            elementID: 'album_1_title',
                            elementName: 'title',
                        },
                        {
                            collectionID: 'album_1',
                            collectionName: 'album',
                            elementID: 'album_1_release_date',
                            elementName: 'release_date',
                        },
                        {
                            collectionID: 'album_1',
                            collectionName: 'album',
                            elementID: 'album_1_price',
                            elementName: 'price',
                        },
                    ],
                },
                {
                    collectionID: 'song_1',
                    collectionName: 'song',
                    elements: [
                        {
                            collectionID: 'song_1',
                            collectionName: 'song',
                            elementID: 'song_1_song_id',
                            elementName: 'song_id',
                        },
                        {
                            collectionID: 'song_1',
                            collectionName: 'song',
                            elementID: 'song_1_album_id',
                            elementName: 'album_id',
                        },
                        {
                            collectionID: 'song_1',
                            collectionName: 'song',
                            elementID: 'song_1_title',
                            elementName: 'title',
                        },
                    ],
                },
                {
                    collectionID: 'artist_album_song_1',
                    isSQL: true,
                    sqlQuery: (client === 'oracle')
                        ? 'SELECT "artist"."name" AS "artist", "album"."title" AS "album", "song"."title" AS "song" FROM "artist" JOIN "album" ON ("artist"."artist_id" = "album"."artist_id") JOIN "song" ON ("album"."album_id" = "song"."album_id")'
                        : 'SELECT artist.name AS artist, album.title AS album, song.title AS song FROM artist JOIN album ON (artist.artist_id = album.artist_id) JOIN song ON (album.album_id = song.album_id)',
                    elements: [
                        {
                            collectionID: 'artist_album_song_1',
                            elementID: 'artist_album_song_1_artist',
                            elementName: 'artist',
                        },
                        {
                            collectionID: 'artist_album_song_1',
                            elementID: 'artist_album_song_1_album',
                            elementName: 'album',
                        },
                        {
                            collectionID: 'artist_album_song_1',
                            elementID: 'artist_album_song_1_song',
                            elementName: 'song',
                        },
                    ],
                },
            ],
        },
        objects: [
            {
                collectionID: 'artist_1',
                collectionName: 'artist',
                elementID: 'artist_1_name',
                elementName: 'name',
            },
            {
                collectionID: 'album_1',
                collectionName: 'album',
                elementID: 'album_1_title',
                elementName: 'title',
            },
            {
                collectionID: 'album_1',
                collectionName: 'album',
                elementID: 'album_1_release_date',
                elementName: 'release_date',
            },
            {
                collectionID: 'album_1',
                collectionName: 'album',
                elementID: 'album_1_price',
                elementName: 'price',
            },
            {
                collectionID: 'song_1',
                collectionName: 'song',
                elementID: 'song_1_title',
                elementName: 'title',
            },
            {
                collectionID: 'artist_album_song_1',
                elementID: 'artist_album_song_1_artist',
                elementName: 'artist',
            },
            {
                collectionID: 'artist_album_song_1',
                elementID: 'artist_album_song_1_album',
                elementName: 'album',
            },
            {
                collectionID: 'artist_album_song_1',
                elementID: 'artist_album_song_1_song',
                elementName: 'song',
            },
            {
                isCustom: true,
                viewExpression: 'CONCAT(#artist_album_song_1_artist, #artist_album_song_1_album)',
                elementID: 'custom_artist_album',
            },
        ],
    };
};
