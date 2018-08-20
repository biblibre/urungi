/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 11/07/16
 * Time: 11:36
 * To change this template use File | Settings | File Templates.
 */

var bq = require('bigquery');
const path = require('path');

var db = function () {
    /* this.host = data.host;
     this.user = data.userName;
     this.password = data.password;
     this.database = data.database; */
    this.connection = null;
};

exports.Db = db;

db.prototype.connect = function (data, done) {
    var DB = this;

    DB.connection = bq;

    var jsonFile = path.join(appRoot, 'server', 'keys', data.companyID, data.file);

    bq.init({
        json_file: jsonFile
    });
};

exports.testConnection = function (req, data, setresult) {
    var jsonFile = path.join(appRoot, 'server', 'keys', data.companyID, data.file);

    bq.init({
        json_file: jsonFile
    });

    bq.dataset.list(data.database, function (e, r, d) {
        if (e) {
            console.log(e);
            setresult({result: 0, msg: 'Connection Error: ' + e});
        }

        var jsonObj = JSON.parse(d);

        if (jsonObj.error) {
            console.log(jsonObj.error);
            return setresult({result: 0, msg: 'Connection Error: ' + jsonObj.error.message});
        }

        var rows = [];
        if (d) {
            getBigqueryDataset(bq, data.database, jsonObj, 0, rows, function () {
                setresult({result: 1, items: rows});
            });
        }
    });
};

function getBigqueryDataset (bq, database, jsonObj, index, rows, done) {
    if (typeof jsonObj.datasets[index] === 'undefined') {
        done();
    } else {
        bq.table.list(database, jsonObj.datasets[index].datasetReference.datasetId, function (e, r, d) {
            if (e) console.log(e);
            var jsonObj2 = JSON.parse(d);

            for (var z in jsonObj2.tables) {
                rows.push({name: jsonObj2.tables[z].id});
            }

            getBigqueryDataset(bq, database, jsonObj, index + 1, rows, done);
        });
    }
}

exports.getSchemas = function (data, setresult) {
    var collections = data.entities;

    // get schemas
    var projects = [];
    var datasets = [];
    var tables = [];
    var schemasTables = [];

    for (var i in collections) {
        var res0 = String(collections[i].name).split(':');
        var project = res0[0];
        var res1 = String(res0[1]).split('.');
        var dataset = res1[0];
        var table = res1[1];

        if (projects.indexOf(project) === -1) { projects.push(project); }
        if (datasets.indexOf(dataset) === -1) { datasets.push(dataset); }
        if (tables.indexOf(table) === -1) { tables.push(table); }

        if (schemasTables.indexOf({name: collections[i].name, project: project, dataset: dataset, table: table}) === -1) {
            var stable = {name: collections[i].name, project: project, dataset: dataset, table: table};
            schemasTables.push(stable);
        }
    }

    var jsonFile = path.join(appRoot, 'server', 'keys', data.companyID, data.file);

    getTableFields(jsonFile, schemasTables, 0, [], function (fields) {
        setresult({result: 1, items: fields});
    });
};

function generateShortUID () {
    return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
}

function getTableFields (jsonFile, tables, index, fields, done) {
    if (!tables[index]) {
        done(fields);
    } else {
        var collectionID = 'WST' + generateShortUID();
        var collectionName = tables[index].dataset + '.' + tables[index].table;
        var theCollection = {collectionID: collectionID, collectionName: collectionName, visible: true, collectionLabel: tables[index].table};
        theCollection.elements = [];

        bq.init({
            json_file: jsonFile
        });

        bq.table.get(tables[index].project, tables[index].dataset, tables[index].table, function (e, r, d) {
            if (e) console.log(e);
            var jsonObj = JSON.parse(d);

            for (var i in jsonObj.schema.fields) {
                var elementID = generateShortUID();
                var isVisible = true;
                var type = 'string';
                if (jsonObj.schema.fields[i].type === 'INTEGER' || jsonObj.schema.fields[i].type === 'FLOAT') { type = 'number'; }
                if (jsonObj.schema.fields[i].type === 'TIMESTAMP') { type = 'date'; }
                if (jsonObj.schema.fields[i].type === 'BOOLEAN') { type = 'boolean'; }

                theCollection.elements.push({elementID: elementID, elementName: jsonObj.schema.fields[i].name, elementType: type, visible: isVisible, elementLabel: jsonObj.schema.fields[i].name});
                // table_schema, c.table_name, c.column_name, c.data_type
            }

            fields.push(theCollection);

            getTableFields(jsonFile, tables, index + 1, fields, done);
        });
    }
}

db.prototype.getLimitString = function (limit, offset) {
    return 'LIMIT ' + limit + ' OFFSET ' + offset;
};

db.prototype.setLimitToSQL = function (sql, limit, offset) {
    if (limit === -1) { return sql; } else { return sql + ' LIMIT ' + limit + ' OFFSET ' + offset; }
};

db.prototype.executeSQLQuery = function (connection, sql, done) {
    var jsonFile = path.join(appRoot, 'server', 'keys', connection.companyID, connection.file);

    bq.init({
        json_file: jsonFile
    });

    bq.job.query(connection.database, sql, function (e, r, d) {
        if (e) {
            console.log(e);
        }

        if (d.jobComplete) {
            var jsonObj = JSON.parse(JSON.stringify(d));

            var results = [];

            for (const r in jsonObj.rows) {
                var theRow = {};
                for (var field in jsonObj.schema.fields) {
                    theRow[jsonObj.schema.fields[field].name] = jsonObj.rows[r].f[field].v;
                }
                results.push(theRow);
            }
            done(results);
        } else {
            getQueryResults(connection, d.jobReference.jobId, function () {
                done(results);
            });
        }
    });
};

function getQueryResults (connection, jobId, done) {
    var jsonFile = path.join(appRoot, 'server', 'keys', connection.companyID, connection.file);

    bq.init({
        json_file: jsonFile
    });

    bq.job.getQueryResults(connection.database, jobId, function (e, r, d) {
        var jsonObj = JSON.parse(JSON.stringify(d));

        var results = [];

        for (const r in jsonObj.rows) {
            var theRow = {};
            for (var field in jsonObj.schema.fields) {
                theRow[jsonObj.schema.fields[field].name] = jsonObj.rows[r].f[field].v;
            }
            results.push(theRow);
        }
        done(results);
    });
}

// TODO : find a better way to escape arguments
exports.escape = function (param) {
    return param.replace(/['"\\]/g, '');
};
