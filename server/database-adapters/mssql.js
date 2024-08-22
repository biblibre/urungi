const mssql = require('mssql');
const debug = require('debug')('urungi:sql');
const { BaseAdapter } = require('./base.js');
const MssqlQueryBuilder = require('../core/MssqlQueryBuilder.js');

class MssqlAdapter extends BaseAdapter {
    getPool () {
        const pool = new mssql.ConnectionPool({
            server: this.params.host,
            port: Number(this.params.port),
            database: this.params.database,
            user: this.params.user,
            password: this.params.password,
            options: {
                useUTC: false,
                enableArithAbort: true,
                trustServerCertificate: true, // FIXME Make this configurable
            },
        });

        return pool;
    }

    async testConnection () {
        const pool = this.getPool();

        await pool.connect();
        await pool.close();
    }

    async getCollectionNames () {
        const sql = 'SELECT table_name FROM information_schema.tables WHERE TABLE_TYPE = @table_type ORDER BY table_name';

        const res = await this.query(sql, { table_type: 'BASE TABLE' });

        return res.recordset.map(row => row.table_name);
    }

    async getCollectionSchema (collectionName) {
        const sql =
            'SELECT column_name, data_type ' +
            'FROM information_schema.columns ' +
            'WHERE table_catalog = @table_catalog AND table_name = @table_name';

        const res = await this.query(sql, { table_catalog: this.params.database, table_name: collectionName });

        const date_types = ['date', 'datetime', 'datetime2', 'datetimeoffset', 'smalldatetime', 'time'];
        const number_types = ['bigint', 'bit', 'decimal', 'int', 'money', 'numeric', 'smallint', 'smallmoney', 'tinyint'];

        const columns = res.recordset.map(row => {
            let type = 'string';
            if (date_types.includes(row.data_type)) {
                type = 'date';
            } else if (number_types.includes(row.data_type)) {
                type = 'number';
            }

            return {
                name: row.column_name,
                type,
            };
        });

        return { columns };
    }

    async getSqlQuerySchema (sql) {
        const res = await this.query(`WITH sub AS (${sql}) SELECT TOP(1) * FROM sub`);

        const columns = Object.entries(res.recordset[0]).map(function ([name, value]) {
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
        const qb = new MssqlQueryBuilder();
        const sql = qb.build(query);

        const start = Date.now();
        const res = await this.query(sql);
        const end = Date.now();

        return {
            data: res.recordset,
            sql,
            time: end - start,
        };
    }

    async query (sql, params) {
        const pool = this.getPool();
        await pool.connect();
        const request = pool.request();
        for (const name in params) {
            request.input(name, params[name]);
        }

        debug('Running query: %o', { sql, params });

        let res;
        try {
            res = await request.query(sql);
        } catch (err) {
            throw new Error(`Error: ${sql} : ${err.message}`);
        } finally {
            await pool.close();
        }

        return res;
    }
}

module.exports = { MssqlAdapter };
