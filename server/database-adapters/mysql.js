const mysql = require('mysql');
const debug = require('debug')('urungi:sql');
const { BaseAdapter } = require('./base.js');
const MysqlQueryBuilder = require('../core/MysqlQueryBuilder.js');

class MysqlAdapter extends BaseAdapter {
    getConnection () {
        return mysql.createConnection({
            host: this.params.host,
            port: this.params.port,
            user: this.params.user,
            password: this.params.password,
            database: this.params.database,
        });
    }

    async testConnection () {
        const connection = this.getConnection();

        return new Promise(function (resolve, reject) {
            connection.connect(function (err) {
                if (err) {
                    return reject(err);
                }

                connection.end(resolve);
            });
        });
    }

    async getCollectionNames () {
        const sql = 'SELECT table_name FROM information_schema.tables WHERE table_schema = ? ORDER BY table_name';
        const res = await this.query(sql, [this.params.database]);

        return res.map(row => row.table_name);
    }

    async getCollectionSchema (collectionName) {
        const sql =
            'SELECT column_name, data_type ' +
            'FROM information_schema.columns ' +
            'WHERE table_schema = ? AND table_name = ?';

        const res = await this.query(sql, [this.params.database, collectionName]);

        const date_types = ['date', 'datetime', 'timestamp'];
        const number_types = ['bit', 'tinyint', 'smallint', 'mediumint', 'int', 'bigint', 'decimal', 'float', 'double'];

        const columns = res.map(row => {
            let type = 'string';
            if (date_types.includes(row.data_type)) {
                type = 'date';
            } else if (number_types.includes(row.data_type)) {
                type = 'number';
            } else if (row.data_type === 'boolean') {
                type = 'boolean';
            }

            return {
                name: row.column_name,
                type,
            };
        });

        return { columns };
    }

    async getSqlQuerySchema (sql) {
        // CTE cannot be used because they are not supported on all versions of
        // MySQL/MariaDB. Their support were added in MySQL 8.0 and MariaDB 10.2
        const res = await this.query(`SELECT * FROM (${sql}) sub LIMIT 1`);

        if (res.length === 0) {
            throw new Error('The query returned no result');
        }

        const columns = Object.entries(res[0]).map(function ([name, value]) {
            let type = 'string';

            if (typeof value === 'number' && !isNaN(value)) {
                type = 'number';
            } else if (typeof value === 'boolean') {
                type = 'boolean';
            } else if (value instanceof Date) {
                type = 'date';
            }

            return { name, type };
        });

        return { columns };
    }

    async getQueryResults (query) {
        const qb = new MysqlQueryBuilder();
        const sql = qb.build(query);

        const start = Date.now();
        let res;
        try {
            res = await this.query(sql);
        } catch (err) {
            throw new Error(`Error: ${sql} : ${err.message}`);
        }
        const end = Date.now();

        return {
            data: res,
            sql,
            time: end - start,
        };
    }

    async query (sql, params = []) {
        const connection = this.getConnection();

        return new Promise(function (resolve, reject) {
            debug('Running query: %o', { sql, params });

            connection.query(sql, params, function (err, results) {
                if (err) {
                    if (err.sqlMessage) {
                        err = new Error(err.sqlMessage);
                    }

                    return connection.end(function () {
                        reject(new Error(`Error: ${sql} : ${err.message}`));
                    });
                }

                connection.end(function () {
                    resolve(results);
                });
            });
        });
    }
}

module.exports = { MysqlAdapter };
