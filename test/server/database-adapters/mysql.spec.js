const { MysqlAdapter } = require('../../../server/database-adapters/mysql.js');

describe('MySQL database adapter', function () {
    describe('when connection is not ok', function () {
        const adapter = new MysqlAdapter({ host: 'invalid-host' });

        describe('testConnection', function () {
            it('should throw', function () {
                return expect(adapter.testConnection()).rejects.toThrow();
            });
        });

        describe('getCollectionNames', function () {
            it('should throw', function () {
                return expect(adapter.getCollectionNames()).rejects.toThrow();
            });
        });

        describe('getCollectionSchema', function () {
            it('should throw', function () {
                return expect(adapter.getCollectionSchema('foo')).rejects.toThrow();
            });
        });

        describe('getSqlQuerySchema', function () {
            it('should throw', function () {
                return expect(adapter.getSqlQuerySchema('SELECT * FROM foo')).rejects.toThrow();
            });
        });
    });

    if (process.env.URUNGI_TEST_MYSQL) {
        describe('when connection is ok', function () {
            const params = JSON.parse(process.env.URUNGI_TEST_MYSQL);
            const adapter = new MysqlAdapter(params);
            const tableData = require('./__data__/table-data.js');

            beforeAll(function () {
                const connection = adapter.getConnection();

                // DROP all tables
                connection.query('SET FOREIGN_KEY_CHECKS = 0;');
                connection.query('SET GROUP_CONCAT_MAX_LEN=32768;');
                connection.query('SET @tables = NULL;');
                connection.query("SELECT GROUP_CONCAT('`', table_name, '`') INTO @tables FROM information_schema.tables WHERE table_schema = (SELECT DATABASE());");
                connection.query("SELECT IFNULL(@tables,'dummy') INTO @tables;");
                connection.query("SET @tables = CONCAT('DROP TABLE IF EXISTS ', @tables);");
                connection.query('PREPARE stmt FROM @tables;');
                connection.query('EXECUTE stmt;');
                connection.query('DEALLOCATE PREPARE stmt;');
                connection.query('SET FOREIGN_KEY_CHECKS = 1;');

                connection.query('CREATE TABLE artist (artist_id SERIAL, name TEXT)');
                connection.query('CREATE TABLE album (album_id SERIAL, artist_id BIGINT UNSIGNED, title TEXT, release_date DATE, price DECIMAL(10, 2))');
                connection.query('CREATE TABLE song (song_id SERIAL, album_id BIGINT UNSIGNED, title TEXT)');

                for (const artist of tableData.artist) {
                    connection.query('INSERT INTO artist (artist_id, name) VALUES (?, ?)', artist);
                }
                for (const album of tableData.album) {
                    connection.query('INSERT INTO album (album_id, artist_id, title, release_date, price) VALUES (?, ?, ?, DATE(?), ?)', album);
                }
                for (const song of tableData.song) {
                    connection.query('INSERT INTO song (song_id, album_id, title) VALUES (?, ?, ?)', song);
                }

                return new Promise((resolve, reject) => {
                    connection.end(resolve);
                });
            });

            describe('testConnection', function () {
                it('should resolve', function () {
                    return expect(adapter.testConnection()).resolves.toBeUndefined();
                });
            });

            describe('getCollectionNames', function () {
                it('should resolve to a list of collection names', function () {
                    const expected = ['album', 'artist', 'song'];

                    return expect(adapter.getCollectionNames()).resolves.toEqual(expected);
                });
            });

            describe('getCollectionSchema', function () {
                it('should return the list of columns of album', function () {
                    return expect(adapter.getCollectionSchema('album')).resolves.toEqual({
                        columns: [
                            { name: 'album_id', type: 'number' },
                            { name: 'artist_id', type: 'number' },
                            { name: 'title', type: 'string' },
                            { name: 'release_date', type: 'date' },
                            { name: 'price', type: 'number' },
                        ],
                    });
                });

                it('should return the list of columns of song', function () {
                    return expect(adapter.getCollectionSchema('song')).resolves.toEqual({
                        columns: [
                            { name: 'song_id', type: 'number' },
                            { name: 'album_id', type: 'number' },
                            { name: 'title', type: 'string' },
                        ],
                    });
                });
            });

            describe('getSqlQuerySchema', function () {
                it('should return the list of columns', function () {
                    const sql = 'SELECT song.song_id, song.title, album.title AS album_title, album.release_date ' +
                        'FROM song JOIN album ON (song.album_id = album.album_id)';

                    return expect(adapter.getSqlQuerySchema(sql)).resolves.toEqual({
                        columns: [
                            { name: 'song_id', type: 'number' },
                            { name: 'title', type: 'string' },
                            { name: 'album_title', type: 'string' },
                            { name: 'release_date', type: 'date' },
                        ],
                    });
                });

                it('should throw the error message returned by mysql', function () {
                    const sql = 'a';

                    return expect(adapter.getSqlQuerySchema(sql)).rejects.toThrow('You have an error in your SQL syntax');
                });
            });

            describe('getQueryResults', function () {
                const tests = require('./__data__/tests.js')('mysql');
                it.each(tests)('%s', async function (name, query, expected) {
                    const results = await adapter.getQueryResults(query);

                    expect(results.data).toEqual(expected);
                });
            });
        });
    }
});
