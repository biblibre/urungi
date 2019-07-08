const debug = require('debug')('urungi:sql');
var knex = require('knex');
const SqlQueryBuilder = require('./sqlQueryBuilder');

var Db = function (datasource, warnings) {
    if (warnings) {
        this.warnings = warnings;
    } else {
        this.warnings = [];
    }

    this.type = datasource.type;

    const co = datasource.connection;

    if (!co) {
        throw new Error('Invalid datasource argument in attempted connection');
    }

    var client;
    switch (this.type) {
    case 'MySQL':
        client = 'mysql';
        break;
    case 'POSTGRE':
        client = 'pg';
        break;
    case 'ORACLE':
        client = 'oracledb';
        break;
    case 'MSSQL':
        client = 'mssql';
        break;
    default:
        throw new Error('Invalid Database type : ' + String(this.type));
    }

    const connection = {
        database: co.database,
        host: co.host,
        user: co.userName,
        password: co.password
    };

    this.connection = connection;

    this.knex = knex({
        client: client,
        connection: connection,
    });
};

Db.prototype.getCollections = async function () {
    // Returns the list of all collections

    var query;

    switch (this.type) {
    case 'MySQL':
        query = (knex) =>
            knex.select('table_schema', knex.ref('table_name').as('name'))
                .from('information_schema.tables').as('tables_info')
                .where('table_schema', '=', this.connection.database)
                .orderBy('name');
        break;
    case 'POSTGRE':
        query = (knex) =>
            knex.select('table_catalog', knex.ref('table_name').as('name'))
                .from('information_schema.tables').as('tables_info')
                .where('table_catalog', '=', this.connection.database)
                .andWhere('table_schema', '=', 'public')
                .orderBy('name');
        break;
    case 'ORACLE':
        query = (knex) =>
            knex.select({
                'table_schema': knex.raw('user'),
                'name': 'TABLE_NAME'
            }).from('USER_TABLES').unionAll(function () {
                this.select({
                    'table_schema': knex.raw('user'),
                    'name': 'VIEW_NAME'
                }).from('USER_VIEWS');
            }).orderBy('name');

        break;
    case 'MSSQL':
        query = (knex) =>
            knex.select('table_schema', knex.ref('TABLE_NAME').as('name'))
                .from('INFORMATION_SCHEMA.TABLES')
                .where('TABLE_TYPE', '=', 'BASE TABLE')
                .orderBy('name');
        break;
    }

    try {
        const data = await query(this.knex);
        return { result: 1, items: data };
    } catch (err) {
        return { result: 0, msg: String(err) };
    }
};

Db.prototype.getSchema = async function (collection) {
    // Returns the column schema of a collection

    var query;

    switch (this.type) {
    case 'MySQL':
        query = (knex) =>
            knex.select('table_schema', 'table_name', 'column_name', 'data_type')
                .from('information_schema.columns')
                .where('table_schema', this.connection.database)
                .where('table_name', collection.name);
        break;
    case 'POSTGRE':
        query = (knex) =>
            knex.select('table_schema', 'table_name', 'column_name', 'data_type')
                .from('information_schema.columns')
                .where('table_catalog', this.connection.database)
                .andWhere('table_name', collection.name);
        break;
    case 'MSSQL':
        query = (knex) =>
            knex.select('table_schema', 'table_name', 'column_name', 'data_type')
                .from('information_schema.columns')
                .where('table_catalog', this.connection.database)
                .andWhere('table_name', collection.name);
        break;
    case 'ORACLE':
        query = (knex) =>
            knex.select({ table_schema: knex.raw('user') }, { table_name: 'TABLE_NAME' }, { column_name: 'COLUMN_NAME' }, { data_type: knex.raw('LOWER(data_type)') })
                .from('USER_TAB_COLUMNS')
                .where('TABLE_NAME', collection.name)
                .orderBy('COLUMN_NAME');
        break;
    }

    try {
        const data = await query(this.knex);
        return { result: 1, items: data };
    } catch (err) {
        return { result: 0, msg: String(err) };
    }
};

Db.prototype.runQuery = async function (query) {
    const start = Date.now();

    var result;
    var runData;

    try {
        const sqlQueryBuilder = new SqlQueryBuilder(this.knex);
        const q = sqlQueryBuilder.build(query);
        result = await q.on('query', (data) => {
            debug('Running query: %o', { sql: data.sql, bindings: data.bindings });
            runData = data;
        });
    } catch (err) {
        return {
            result: 0,
            msg: String(err)
        };
    }

    const time = Date.now() - start;

    return {
        result: 1,
        data: result,
        sql: runData.sql,
        time: time
    };
};

Db.prototype.executeRawQuery = function (sqlQuery) {
    return this.knex.select().from(this.knex.raw('(' + sqlQuery + ') Wstmain'));
};

Db.prototype.close = async function () {
    await this.knex.destroy();
};

exports.testConnection = async function (params) {
    var testQueries;

    // For now, the test queries are just simplified versions of the schema queries
    // It might be useful to find a couple of test queries which verify that all is good with the connection

    switch (params.type) {
    case 'MySQL': case 'POSTGRE': case 'MSSQL':
        testQueries = [
            (qb) => qb.select('table_schema', 'table_name').from('information_schema.tables')
        ];
        break;
    case 'ORACLE':
        testQueries = [
            (qb) => qb.select('TABLE_NAME', 'COLUMN_NAME', 'DATA_TYPE')
                .from('USER_TAB_COLUMNS')
                .orderBy('COLUMN_NAME')
        ];
        break;
    }

    try {
        const dts = {
            type: params.type,
            connection: params
        };
        var testDb = new Db(dts);

        for (const query of testQueries) {
            await query(testDb.knex);
        }

        testDb.close();
    } catch (err) {
        return { result: 0, msg: 'Error executing test connection SQL : ' + err, code: 'MY-002', actionCode: 'MESSAGEWST' };
    }

    return { result: 1 };
};

exports.Db = Db;
