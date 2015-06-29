var mongoose = require('mongoose');

var configurationsSchema = new mongoose.Schema({
    name: String,
    value: String
}, { collection: config.app.collectionsPrefix+'configurations' })

// other virtual / static methods added to schema

configurationsSchema.statics.getConfigurations = function(done){
    this.find({},{},function(err, configurations){
        if(err) throw err;
        done({result: 1, configurations: configurations});
    });
}

configurationsSchema.statics.getConfiguration = function(name, done){
    if (typeof name == 'string') {
        this.findOne({"name": name},{},function(err, configuration){
            if(err) throw err;
            done((configuration) ? configuration : {value: 0});
        });
    }
    else {
        this.find({"name": {$in: name}},{},function(err, configuration){
            if(err) throw err;

            var configurations = [];

            for (var i in configuration)
                configurations[configuration[i]['name']] = configuration[i]['value'];

            done(configurations);
        });
    }
}

// admin methods

configurationsSchema.statics.adminFindUserFilters = function(done){
    this.findOne({"name": 'user-filters'},{},function(err, userFilters){
        if(err) throw err;
        if (!userFilters) userFilters = [];
        else userFilters = String(userFilters.value).split(',');
        done({result: 1, filters: userFilters});
    });
}

configurationsSchema.statics.adminAddFilters = function(filters){
    var Configurations = this, filtersString = '';
    this.findOne({"name": 'user-filters'},{},function(err, userFilters){
        if(err) throw err;
        if (userFilters) {
            filtersString = userFilters.value;
            for (var i in filters) {
                if(String(filtersString).indexOf(filters[i].name) == -1) {
                    filtersString += ','+filters[i].name;
                }
            }
        }
        else {
            for (var i in filters)
                filtersString += (filters.length == i-1) ? filters[i].name : filters[i].name+",";
        }

        Configurations.adminSaveConfiguration({name: 'user-filters', value: filtersString});
    });
}

configurationsSchema.statics.adminGetConfigurations = function(done){
    this.find({},{},function(err, configurations){
        if(err) throw err;
        done({result: 1, configurations: configurations});
    });
}

configurationsSchema.statics.adminSaveConfigurations = function(data, done){
    for (var i in data) {
        this.adminSaveConfiguration(data[i]);
    }

    done({result: 1, msg: "Configurations updated"});
}

configurationsSchema.statics.adminSaveConfiguration = function(data){
    var Configuration = this;

    this.findOne({"name" : data.name},{},function(err, configuration){
        if(err) throw err;
        if (configuration) {
            Configuration.update({
                "_id" : configuration._id
            }, {
                $set: {
                    "value" : data.value
                }
            }, function (err) {
                if(err) throw err;
            });
        }
        else if (data.value != '') {
            Configuration.create({
                name : data.name,
                value : data.value
            }, function(err){
                if(err) throw err;
            });
        }
    });

    return true;
}

var Configurations = connection.model('Configurations', configurationsSchema);
module.exports = Configurations;