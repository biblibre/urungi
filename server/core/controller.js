class Controller {
    constructor (model) {
        this.model = model;
    }

    findAll (req, done) {
        var Model = this.model;
        var perPage = config.get('pagination.itemsPerPage');
        var page = (req.query.page) ? req.query.page : 1;

        var component = this.findAllParams(req);

        var find = component.find;
        var fields = component.fields;
        var params = component.params;

        const p = Model.find(find, fields, params).exec().then(function (items) {
            return Model.count(find).exec().then(function (count) {
                return { result: 1, page: page, pages: ((req.query.page) ? Math.ceil(count / perPage) : 1), items: items };
            });
        }).catch(function (err) {
            return { result: 0, msg: 'A database error has occurred : ' + String(err), error: err };
        });

        if (done) {
            console.warn('Using a callback with findAll is deprecated. Use the returned promise instead');
            return p.then(done);
        }

        return p;
    }

    findAllParams (req) {
        var perPage = config.get('pagination.itemsPerPage');
        var page = (req.query.page) ? req.query.page : 1;
        var find = {};
        var searchText = (req.query.search) ? req.query.search : false;
        var filters = (req.query.filters) ? JSON.parse(req.query.filters) : false;
        var fields = {};
        var fieldsToGet = (req.query.fields) ? req.query.fields : false;
        var params = {};
        if (req.query.page > 0) { params = (req.query.page) ? { skip: (page - 1) * perPage, limit: perPage } : {}; }

        if (req.query.sort) {
            var sortField = {};

            sortField[req.query.sort] = (req.query.sortType) ? req.query.sortType : 1;

            sortField[req.query.sort] = Number(sortField[req.query.sort]);

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
            let find = req.query.find;
            if (typeof find === 'string') {
                find = JSON.parse(find);
            }

            for (var f of find) {
                mandatoryFilters.push(f);
            }
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
            searchFind = (findFields.length > 0) ? { $or: findFields } : {};
        }

        if (filters) {
            var filterObject = {};
            for (const f in filters) {
                filterObject[f] = new RegExp(filters[f], 'i');
            }
            mandatoryFilters.push(filterObject);
        }

        if (Object.keys(searchFind).length > 0) { mandatoryFilters.push(searchFind); }

        if (mandatoryFilters.length > 0) { find = { $and: mandatoryFilters }; }

        return { find: find, fields: fields, params: params };
    }

    findOne (req, done) {
        if (!req.query.id) {
            const p = Promise.resolve({ result: 0, msg: "'id' is required." });

            if (done) {
                console.warn('Using a callback with findOne is deprecated. Use the returned promise instead');
                return p.then(done);
            }

            return p;
        }

        var find = generateFindFields(req, req.query.id);

        const p = this.model.findOne(find, {}).exec().then(function (item) {
            if (!item) {
                return { result: 0, msg: 'Item not found.' };
            }

            return { result: 1, item: item.toObject() };
        }).catch(function (err) {
            return { result: 0, msg: 'A database error has occurred : ' + String(err), error: err };
        });

        if (done) {
            console.warn('Using a callback with findOne is deprecated. Use the returned promise instead');
            return p.then(done);
        }

        return p;
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

        data.nd_history.push({ text: 'Created on ' + new Date() + ' by ' + user,
            user_id: (req.isAuthenticated()) ? req.user._id : null,
            user_name: (req.isAuthenticated()) ? req.user.username : null,
            user_companyID: (req.isAuthenticated()) ? req.user.companyID : null,
            user_companyName: (req.isAuthenticated()) ? req.user.companyName : null
        });

        const Model = this.model;

        const p = Model.find({ _id: data._id }).exec().then(function (item) {
            if (item.length > 0) {
                if (!item[0].nd_trash_deleted) {
                    throw new Error('Item already exists');
                } else {
                    return Model.deleteOne({ _id: data._id }).exec();
                }
            }
        }).then(function () {
            return Model.create(data).then(function (item) {
                return { result: 1, msg: 'Item created', item: item.toObject() };
            });
        }).catch(function (err) {
            return { result: 0, msg: 'A database error has occurred : ' + String(err), error: err };
        });

        if (done) {
            console.warn('Using a callback with create is deprecated. Use the returned promise instead');
            return p.then(done);
        }

        return p;
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

        const p = this.model.update(find, { $set: data }).exec().then(function (result) {
            var numAffected = (typeof result.n === 'undefined') ? result.nModified : result.n; // MongoDB 2.X return n, 3.X return nModified?

            if (numAffected > 0) {
                return { result: 1, msg: numAffected + ' record updated.' };
            } else {
                return { result: 0, msg: 'Error updating record, no record have been updated' };
            }
        }).catch(function (err) {
            return { result: 0, msg: 'A database error has occurred : ' + String(err), error: err };
        });

        if (done) {
            console.warn('Using a callback with update is deprecated. Use the returned promise instead');
            return p.then(done);
        }

        return p;
    }

    remove (req, done) {
        if (!req.params.id) {
            const p = Promise.resolve({ result: 0, msg: "'id' is required." });

            if (done) {
                console.warn('Using a callback with remove is deprecated. Use the returned promise instead');
                return p.then(done);
            }

            return p;
        }

        var find = generateFindFields(req, req.params.id);
        const p = this.model.remove(find).exec().then(function (result) {
            result = result.result;
            var numAffected = (typeof result.n === 'undefined') ? result.nModified : result.n; // MongoDB 2.X return n, 3.X return nModified?

            if (numAffected > 0) {
                return { result: 1, msg: numAffected + ' items deleted.' };
            } else {
                return { result: 0, msg: 'Error deleting items, no item have been deleted' };
            }
        }).catch(function (err) {
            return { result: 0, msg: 'A database error has occurred : ' + String(err), error: err };
        });

        if (done) {
            console.warn('Using a callback with remove is deprecated. Use the returned promise instead');
            return p.then(done);
        }

        return p;
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

    return { '$and': mandatoryFilters };
}

module.exports = Controller;
