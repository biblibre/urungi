const mssql = require('mssql');
const debug = require('debug')('urungi:sql');
const { BaseAdapter } = require('./base.js');
const SqlQueryBuilder = require('../core/sqlQueryBuilder.js');

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
                type: type,
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
        const knex = require('knex')({
            client: 'mssql',
        });
        const sqlQueryBuilder = new SqlQueryBuilder(knex);
        const q = sqlQueryBuilder.build(query);
        const { sql, bindings } = q.toSQL().toNative();
        const params = {};
        for (const [i, value] of bindings.entries()) {
            params[`p${i}`] = value;
        }

        const start = Date.now();
        const res = await this.query(sql, params);
        const end = Date.now();

        return {
            data: res.recordset,
            sql: sql,
            bindings: bindings,
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

        debug('Running query: %o', { sql: sql, params: params });
        try {
            const res = await request.query(sql);
            return res;
        } finally {
            await pool.close();
        }
    }
}

module.exports = { MssqlAdapter };
