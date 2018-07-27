class Controller {
    constructor (model) {
        this.model = model;
    }

    findAll (req, done) {
        var Model = this.model;
        var perPage = config.get('pagination.itemsPerPage');
        var page = (req.query.page) ? req.query.page : 1;
        var find = {};
        var searchText = (req.query.search) ? req.query.search : false;
        var fields = {};
        var fieldsToGet = (req.query.fields) ? req.query.fields : false;
        if (req.query.page > 0) { var params = (req.query.page) ? {skip: (page - 1) * perPage, limit: perPage} : {}; }

        if (req.query.sort) {
            var sortField = {};

            sortField[req.query.sort] = (req.query.sortType) ? req.query.sortType : 1;

            params['sort'] = sortField;
        }

        if (fieldsToGet) {
            if (typeof fieldsToGet === 'string') {
                fields = JSON.parse(fieldsToGet);
            } else {
                for (const i in fieldsToGet) {
                    fields[fieldsToGet[i]] = 1;
                }
            }
        }

        var mandatoryFilters = [];

        if (req.query.trash) {
            var trashField = {};
            trashField['nd_trash_deleted'] = false;

            mandatoryFilters.push(trashField);
        }

        if (req.query.userid) {
            var userField = {};
            userField['user_id'] = req.user._id;

            mandatoryFilters.push(userField);
        }

        if (req.query.companyid) {
            var companyField = {};
            companyField['companyID'] = req.user.companyID;

            mandatoryFilters.push(companyField);
        }

        if (req.query.find) {
            for (var i in req.query.find) { mandatoryFilters.push(req.query.find[i]); }
        }

        var searchFind = {};

        if (searchText) {
            var findFields = [];
            var searchFields = this.searchFields;

            for (const i in searchFields) {
                var thisField = {};

                // thisField[searchFields[i]] = {$regex : searchText};
                thisField[searchFields[i]] = new RegExp(searchText, 'i'); // "i" is for case-insensitive

                findFields.push(thisField);
            }
            searchFind = (findFields.length > 0) ? {$or: findFields} : {};
        }

        if (Object.keys(searchFind).length > 0) { mandatoryFilters.push(searchFind); }

        if (mandatoryFilters.length > 0) { find = {$and: mandatoryFilters}; }

        Model.find(find, fields, params, function (err, items) {
            if (err) {
                done({result: 0, msg: 'A database error has occured : ' + String(err), error: err});
            } else {
                Model.count(find, function (err, count) {
                    if (err) {
                        done({result: 0, msg: 'A database error has occured : ' + String(err), error: err});
                    } else {
                        if (req.query.page > 0) {
                            done({result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count / perPage) : 1), items: items});
                        } else {
                            done({result: 1, page: 1, pages: 1, items: items});
                        }
                    }
                });
            }
        });
    }

    findOne (req, done) {
        if (!req.query.id) {
            done({result: 0, msg: "'id' is required."});
            return;
        }

        var find = generateFindFields(req, req.query.id);

        this.model.findOne(find, {}, function (err, item) {
            if (err) {
                done({result: 0, msg: 'A database error has occured : ' + String(err), error: err});
            } else if (!item) {
                done({result: 0, msg: 'Item not found.'});
            } else {
                done({result: 1, item: item.toObject()});
            }
        });
    }

    findOneForServer (req, done) {
        if (!req.query.id) {
            done({result: 0, msg: "'id' is required."});
            return;
        }

        var find = generateFindFields(req, req.query.id);

        this.model.findOne(find, {}, function (err, item) {
            if (err) {
                done({result: 0, msg: 'A database error has occured : ' + String(err), error: err});
            } else if (!item) {
                done({result: 0, msg: 'Item not found.'});
            } else {
                done({result: 1, item: item});
            }
        });
    }

    create (req, done) {
        var data = req.body;

        if (req.query.userid) {
            data.createdBy = (req.isAuthenticated()) ? req.user._id : null;
            data.createdOn = new Date();
        }

        if (req.query.companyid) {
            data.companyID = (req.isAuthenticated()) ? req.user.companyID : null;
        }

        if (req.query.trash) {
            data.nd_trash_deleted = false;
        }

        var user = (req.isAuthenticated()) ? req.user.username : 'unsigned user';
        if (!data.nd_history) data.nd_history = [];

        data.nd_history.push({text: 'Created on ' + new Date() + ' by ' + user,
            user_id: (req.isAuthenticated()) ? req.user._id : null,
            user_name: (req.isAuthenticated()) ? req.user.username : null,
            user_companyID: (req.isAuthenticated()) ? req.user.companyID : null,
            user_companyName: (req.isAuthenticated()) ? req.user.companyName : null
        });

        this.model.create(data, function (err, item) {
            if (err) {
                done({result: 0, msg: 'A database error has occured : ' + String(err), error: err});
            } else {
                done({result: 1, msg: 'Item created', item: item.toObject()});
            }
        });
    }

    update (req, done) {
        var data = req.body;
        var id = data._id;

        var find = generateFindFields(req, id);

        delete (data.id);
        delete (data._id);

        if (req.query.userid) {
            data.user_id = (req.isAuthenticated()) ? req.user._id : null;
        }
        if (req.query.companyid) {
            data.companyID = (req.isAuthenticated()) ? req.user.companyID : null;
        }

        var user = (req.isAuthenticated()) ? req.user.username : 'unsigned user';
        if (!data.nd_history) data.nd_history = [];

        data.nd_history.push({text: 'Updated on ' + new Date() + ' by ' + user,
            user_id: (req.isAuthenticated()) ? req.user._id : null,
            user_name: (req.isAuthenticated()) ? req.user.username : null,
            user_companyID: (req.isAuthenticated()) ? req.user.companyID : null,
            user_companyName: (req.isAuthenticated()) ? req.user.companyName : null
        });

        this.model.update(find, { $set: data }, function (err, result) {
            if (err) {
                done({result: 0, msg: 'A database error has occured : ' + String(err), error: err});
            } else {
                var numAffected = (typeof result.n === 'undefined') ? result.nModified : result.n; // MongoDB 2.X return n, 3.X return nModified?

                if (numAffected > 0) {
                    done({result: 1, msg: numAffected + ' record updated.'});
                } else {
                    done({result: 0, msg: 'Error updating record, no record have been updated'});
                }
            }
        });
    }

    remove (req, done) {
        if (!req.params.id) {
            done({result: 0, msg: "'id' is required."});
            return;
        }

        var find = generateFindFields(req, req.params.id);
        this.model.remove(find, function (err, result) {
            if (err) {
                done({result: 0, msg: 'A database error has occured : ' + String(err), error: err});
            } else {
                result = result.result;
                var numAffected = (typeof result.n === 'undefined') ? result.nModified : result.n; // MongoDB 2.X return n, 3.X return nModified?

                if (numAffected > 0) {
                    done({result: 1, msg: numAffected + ' items deleted.'});
                } else {
                    done({result: 0, msg: 'Error deleting items, no item have been deleted'});
                }
            }
        });
    }
}

function generateFindFields (req, id) {
    var mandatoryFilters = [];
    var idField = {};
    idField['_id'] = id;

    mandatoryFilters.push(idField);

    if (req.query.trash) {
        var trashField = {};
        trashField['nd_trash_deleted'] = false;

        mandatoryFilters.push(trashField);
    }

    if (req.query.userid) {
        var userField = {};
        userField['user_id'] = req.user._id;

        mandatoryFilters.push(userField);
    }

    if (req.query.companyid) {
        var companyField = {};
        companyField['companyID'] = req.user.companyID;

        mandatoryFilters.push(companyField);
    }

    return {'$and': mandatoryFilters};
}

module.exports = Controller;
