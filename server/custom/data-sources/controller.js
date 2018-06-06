var DataSources = connection.model('DataSources');
const path = require('path');
const Controller = require('../../core/controller.js');

class DataSourcesController extends Controller {
    constructor () {
        super(DataSources);
        this.searchFields = ['actionCategory'];
    }
}

var controller = new DataSourcesController();

exports.DataSourcesCreate = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.body.companyID = 'COMPID';

    controller.create(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.DataSourcesUploadConfigFile = function (req, res) {
    var file = req.files[0];

    if (!file) {
        return serverResponse(req, res, 200, {result: 0, msg: 'file is undefined'});
    }
    var fs = require('fs');
    var companyID = 'COMPID';

    const dirPath = path.join(appRoot, 'server', 'keys', companyID);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath);
    }

    var filePath = path.join(dirPath, file.originalname);

    fs.readFile(file.path, function (err, data) {
        if (err) {
            return serverResponse(req, res, 200, {result: 0, msg: err.message});
        }

        fs.writeFile(filePath, data, function (err) {
            if (err) {
                return serverResponse(req, res, 200, {result: 0, msg: err.message});
            }

            serverResponse(req, res, 200, {result: 1, msg: 'File uploaded successfully'});
        });
    });
};

exports.DataSourcesUpdate = function (req, res) {
    controller.update(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.saveS3Configuration = function (req, res) {

};

exports.getS3Files = function (req, res) {
    var AWS = require('aws-sdk');

    AWS.config.update({
        accessKeyId: req.body.accessKey,
        secretAccessKey: req.body.secret,
        region: req.body.region
    });

    var s3 = new AWS.S3();

    var allKeys = [];

    s3.listObjects({Bucket: req.body.bucket, Marker: req.body.marker}, function (err, data) {
        if (err) { console.error(err); }

        for (let i = 0; i < data.Contents.length; i++) {
            var theFile = {};
            theFile.fileName = data.Contents[i].Key;
            theFile.LastModified = data.Contents[i].LastModified;

            allKeys.push(theFile);
        }

        serverResponse(req, res, 200, allKeys);
    });
};

exports.getEntities = function (req, res) {
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function (result) {
        if (result.result === 1) {
            if (result.item.type === 'MONGODB') {
                var mongodb = require('../../core/db/mongodb.js');
                const data = {};

                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.database = result.item.params[0].connection.database;
                data.userName = result.item.params[0].connection.userName;
                data.password = result.item.params[0].connection.password;
                data.datasourceID = result.item._id;
                mongodb.testConnection(req, data, function (result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type === 'MySQL' || result.item.type === 'POSTGRE' || result.item.type === 'ORACLE' || result.item.type === 'MSSQL' || result.item.type === 'BIGQUERY' || result.item.type === 'JDBC-ORACLE') {
                let db;
                switch (result.item.type) {
                case 'MySQL': db = require('../../core/db/mysql.js');
                    break;
                case 'POSTGRE': db = require('../../core/db/postgresql.js');
                    break;
                case 'ORACLE': db = require('../../core/db/oracle.js');
                    break;
                case 'MSSQL': db = require('../../core/db/mssql.js');
                    break;
                case 'BIGQUERY': db = require('../../core/db/bigQuery.js');
                    break;
                case 'JDBC-ORACLE': db = require('../../core/db/jdbc-oracle.js');
                }
                const data = {
                    datasourceID: result.item._id,
                    companyID: req.user.companyID,
                    host: result.item.params[0].connection.host,
                    port: result.item.params[0].connection.port,
                    userName: result.item.params[0].connection.userName,
                    password: result.item.params[0].connection.password,
                    database: result.item.params[0].connection.database
                };

                if (result.item.params[0].connection.file) data.file = result.item.params[0].connection.file;

                db.testConnection(req, data, function (result) {
                    serverResponse(req, res, 200, result);
                });
            }
        } else {
            serverResponse(req, res, 200, result);
        }
    });
};

exports.testConnection = function (req, res) {
    req.body.companyID = req.user.companyID;

    if (req.body.type === 'MONGODB') {
        var mongodb = require('../../core/db/mongodb.js');

        mongodb.testConnection(req, req.body, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type === 'MySQL') {
        var mysql = require('../../core/db/mysql.js');

        mysql.testConnection(req, req.body, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type === 'POSTGRE') {
        var postgre = require('../../core/db/postgresql.js');

        postgre.testConnection(req, req.body, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type === 'ORACLE') {
        var oracle = require('../../core/db/oracle.js');

        oracle.testConnection(req, req.body, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type === 'MSSQL') {
        var mssql = require('../../core/db/mssql.js');

        mssql.testConnection(req, req.body, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type === 'BIGQUERY') {
        var bigQuery = require('../../core/db/bigQuery.js');

        bigQuery.testConnection(req, req.body, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
    if (req.body.type === 'JDBC-ORACLE') {
        var jdbcOracle = require('../../core/db/jdbc-oracle.js');

        jdbcOracle.testConnection(req, req.body, function (result) {
            serverResponse(req, res, 200, result);
        });
    }
};

exports.getReverseEngineering = function (req, res) {
    var theDatasourceID = req.query.datasourceID;
    req.query = {};
    req.query.companyid = true;
    req.query.id = theDatasourceID;

    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function (result) {
        if (result.result === 1) {
            if (result.item.type === 'MONGODB') {
                var mongodb = require('../../core/db/mongodb.js');
                const data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.database = result.item.params[0].connection.database;
                data.userName = result.item.params[0].connection.userName;
                data.password = result.item.params[0].connection.password;
                mongodb.getReverseEngineering(data, function (result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type === 'POSTGRE' || result.item.type === 'MySQL' || result.item.type === 'ORACLE' || result.item.type === 'MSSQL' || result.item.type === 'JDBC-ORACLE' || result.item.type === 'BIGQUERY') {
                var sql = require('../../core/db/sql.js');
                const data = {
                    type: result.item.type,
                    host: result.item.params[0].connection.host,
                    port: result.item.params[0].connection.port,
                    userName: result.item.params[0].connection.userName,
                    password: result.item.params[0].connection.password,
                    database: result.item.params[0].connection.database,

                };
                sql.getReverseEngineering(result.item._id, data, function (result) {
                    serverResponse(req, res, 200, result);
                });
            }
        } else {
            serverResponse(req, res, 200, result);
        }
    });
};

exports.getEntitySchema = function (req, res) {
    var theDatasourceID = req.query.datasourceID;
    var theEntities = req.query.entities;
    req.query = {};
    req.query.companyid = true;
    req.query.id = theDatasourceID;

    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function (result) {
        if (result.result === 1) {
            if (result.item.type === 'MONGODB') {
                var mongodb = require('../../core/db/mongodb.js');
                const data = {};
                data.host = result.item.params[0].connection.host;
                data.port = result.item.params[0].connection.port;
                data.database = result.item.params[0].connection.database;
                data.userName = result.item.params[0].connection.userName;
                data.password = result.item.params[0].connection.password;
                data.entities = theEntities;
                mongodb.getSchemas(data, function (result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type === 'POSTGRE' || result.item.type === 'MySQL' || result.item.type === 'ORACLE' || result.item.type === 'MSSQL' ||
               result.item.type === 'JDBC-ORACLE') {
                var sql = require('../../core/db/sql.js');
                const data = {
                    type: result.item.type,
                    host: result.item.params[0].connection.host,
                    port: result.item.params[0].connection.port,
                    userName: result.item.params[0].connection.userName,
                    password: result.item.params[0].connection.password,
                    database: result.item.params[0].connection.database,
                    entities: theEntities
                };

                sql.getSchemas(data, function (result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type === 'BIGQUERY') {
                var bquery = require('../../core/db/bigQuery.js');
                const data = {
                    companyID: req.user.companyID,
                    type: result.item.type,
                    host: result.item.params[0].connection.host,
                    port: result.item.params[0].connection.port,
                    userName: result.item.params[0].connection.userName,
                    password: result.item.params[0].connection.password,
                    database: result.item.params[0].connection.database,
                    file: result.item.params[0].connection.file,
                    entities: theEntities
                };

                bquery.getSchemas(data, function (result) {
                    serverResponse(req, res, 200, result);
                });
            }
        } else {
            serverResponse(req, res, 200, result);
        }
    });
};

exports.getsqlQuerySchema = function (req, res) {
    var theDatasourceID = req.query.datasourceID;
    var theSqlQuery = req.query.sqlQuery;
    req.query = {};
    req.query.companyid = true;
    req.query.id = theDatasourceID;

    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function (result) {
        if (result.result === 1) {
            if (result.item.type === 'MONGODB') {
                serverResponse(req, res, 400, result);
            }
            if (result.item.type === 'POSTGRE' || result.item.type === 'MySQL' || result.item.type === 'ORACLE' || result.item.type === 'MSSQL' || result.item.type === 'JDBC-ORACLE') {
                var sql = require('../../core/db/sql.js');
                const data = {
                    type: result.item.type,
                    host: result.item.params[0].connection.host,
                    port: result.item.params[0].connection.port,
                    userName: result.item.params[0].connection.userName,
                    password: result.item.params[0].connection.password,
                    database: result.item.params[0].connection.database,
                    sqlQuery: theSqlQuery
                };

                sql.getSqlQuerySchema(data, function (result) {
                    serverResponse(req, res, 200, result);
                });
            }
            if (result.item.type === 'BIGQUERY') {
                var bquery = require('../../core/db/bigQuery.js');
                const data = {
                    type: result.item.type,
                    host: result.item.params[0].connection.host,
                    port: result.item.params[0].connection.port,
                    userName: result.item.params[0].connection.userName,
                    password: result.item.params[0].connection.password,
                    database: result.item.params[0].connection.database,
                    sqlquery: theSqlQuery
                };

                bquery.getSqlQuerySchema(data, function (result) {
                    serverResponse(req, res, 200, result);
                });
            }
        } else {
            serverResponse(req, res, 200, result);
        }
    });
};

exports.getMongoSchemas = function (req, res) {
    var mongodb = require('../../core/db/mongodb.js');

    mongodb.getSchemas(req.body, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.getElementDistinctValues = function (req, res) {
    var data = req.query;

    data.group = {};
    data.sort = {};

    data.fields = [data.elementName];

    data.group[data.elementName] = '$' + data.elementName;
    data.sort[data.elementName] = 1;

    var mongodb = require('../../core/db/mongodb.js');

    mongodb.execOperation('aggregate', data, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.DataSourcesFindAll = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findAll(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};

exports.DataSourcesFindOne = function (req, res) {
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';

    controller.findOne(req, function (result) {
        serverResponse(req, res, 200, result);
    });
};
