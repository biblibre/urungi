const oracledb = require('oracledb');
const debug = require('debug')('urungi:sql');
const { BaseAdapter } = require('./base.js');
const SqlQueryBuilder = require('../core/sqlQueryBuilder.js');

class OracleAdapter extends BaseAdapter {
    async getConnection () {
        oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
        oracledb.fetchAsString = [oracledb.CLOB];

        let connectString = this.params.host;
        if (this.params.port) {
            connectString += ':' + this.params.port;
        }
        connectString += '/' + this.params.database;

        return oracledb.getConnection({
            connectString: connectString,
            user: this.params.user,
            password: this.params.password,
        });
    }

    async testConnection () {
        const connection = await this.getConnection();

        return connection.close();
    }

    async getCollectionNames () {
        const sql = 'SELECT TABLE_NAME AS name FROM USER_TABLES UNION SELECT VIEW_NAME AS name FROM USER_VIEWS ORDER BY name';
        const res = await this.query(sql);

        return res.rows.map(row => row.NAME);
    }

    async getCollectionSchema (collectionName) {
        const sql = 'SELECT COLUMN_NAME, DATA_TYPE FROM USER_TAB_COLUMNS WHERE TABLE_NAME = :table_name';
        const res = await this.query(sql, [collectionName]);

        const columns = res.rows.map(row => {
            const dataType = row.DATA_TYPE;
            let type = 'string';
            if (dataType.startsWith('TIMESTAMP') || dataType === 'DATE') {
                type = 'date';
            } else if (dataType === 'NUMBER') {
                type = 'number';
            }

            return {
                name: row.COLUMN_NAME,
                type: type,
            };
        });

        return { columns };
    }

    async getSqlQuerySchema (sql) {
        const res = await this.query(`WITH sub AS (${sql}) SELECT * FROM sub WHERE ROWNUM <= 1`);

        const columns = Object.entries(res.rows[0]).map(function ([name, value]) {
            let type = 'string';

            if (typeof value === 'number' && !isNaN(value)) {
                type = 'number';
            } else if (typeof value === 'boolean') {
                type = 'boolean';
            } else if (value instanceof Date || value.constructor.name === 'Date') {
                type = 'date';
            }

            return { name, type };
        });

        return { columns };
    }

    async getQueryResults (query) {
        const knex = require('knex')({
            client: 'oracledb',
        });
        const sqlQueryBuilder = new SqlQueryBuilder(knex);
        const q = sqlQueryBuilder.build(query);
        const { sql, bindings } = q.toSQL().toNative();

        const start = Date.now();
        const res = await this.query(sql, bindings);
        const end = Date.now();

        return {
            data: res.rows,
            sql: sql,
            bindings: bindings,
            time: end - start,
        };
    }

    async query (sql, params = []) {
        const connection = await this.getConnection();

        debug('Running query: %o', { sql: sql, params: params });
        const res = await connection.execute(sql, params);

        await connection.close();

        return res;
    }
}

module.exports = { OracleAdapter };
