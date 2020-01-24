const { MssqlAdapter } = require('../../../server/database-adapters/mssql.js');

describe('MS SQL Server database adapter', function () {
    describe('when connection is not ok', function () {
        const adapter = new MssqlAdapter({ host: 'invalid-host' });

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

    if (process.env.URUNGI_TEST_MSSQL) {
        describe('when connection is ok', function () {
            const params = JSON.parse(process.env.URUNGI_TEST_MSSQL);
            const adapter = new MssqlAdapter(params);
            const tableData = require('./__data__/table-data.js');

            beforeAll(async function () {
                const pool = adapter.getPool();
                await pool.connect();

                // DROP all tables
                const res = await pool.request().query("SELECT 'DROP TABLE IF EXISTS ' + ISNULL(string_agg(t.NAME, ','), 'dummy') AS query FROM   sys.tables t WHERE  t.type = 'U'");
                await pool.request().query(res.recordset[0].query);

                await pool.request().query('CREATE TABLE artist (artist_id INT, name NVARCHAR(1000))');
                await pool.request().query('CREATE TABLE album (album_id INT, artist_id INT, title NVARCHAR(1000), release_date DATE, price NUMERIC(10,2))');
                await pool.request().query('CREATE TABLE song (song_id INT, album_id INT, title NVARCHAR(1000))');

                for (const artist of tableData.artist) {
                    await pool.request().query`INSERT INTO artist (artist_id, name) VALUES (${artist[0]}, ${artist[1]})`;
                }
                for (const album of tableData.album) {
                    await pool.request().query`INSERT INTO album (album_id, artist_id, title, release_date, price) VALUES (${album[0]}, ${album[1]}, ${album[2]}, ${album[3]}, ${album[4]})`;
                }
                for (const song of tableData.song) {
                    await pool.request().query`INSERT INTO song (song_id, album_id, title) VALUES (${song[0]}, ${song[1]}, ${song[2]})`;
                }

                await pool.close();
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

                    return expect(adapter.getSqlQuerySchema(sql)).rejects.toThrow('Incorrect syntax');
                });
            });

            describe('getQueryResults', function () {
                const tests = require('./__data__/tests.js')('mssql');
                it.each(tests)('%s', async function (name, query, expected) {
                    const results = await adapter.getQueryResults(query);

                    expect(results.data).toEqual(expected);
                });
            });
        });
    }
});
