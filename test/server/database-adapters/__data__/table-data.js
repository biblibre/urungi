module.exports = {
    artist: [
        // [artist_id, name]
        [1, 'Pink Floyd'],
        [2, 'The Interrupters'],
    ],
    album: [
        // [album_id, artist_id, title, release_date, price]
        [1, 1, 'Dark Side of the Moon', new Date(1973, 2, 1), '12.99'],
        [2, 1, 'The Wall', new Date(1979, 10, 30), '15.99'],
        [3, 2, 'Fight the Good Fight', new Date(2018, 5, 29), '11.90'],
    ],
    song: [
        // [song_id, album_id, title]
        [1, 1, 'Speak to Me'],
        [2, 1, 'Breathe'],
        [3, 1, 'On the Run'],
        [4, 1, 'Time'],
        [5, 1, 'The Great Gig in the Sky'],
        [6, 2, 'In the Flesh?'],
        [7, 2, 'The Thin Ice'],
        [8, 2, 'Another Brick in the Wall, Part I'],
        [9, 3, 'Title Holder'],
        [10, 3, 'So Wrong'],
        [11, 3, "She's Kerosene"],
    ],
};
