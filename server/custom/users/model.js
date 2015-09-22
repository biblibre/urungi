var mongoose = require('mongoose');
var hash = require('../../util/hash');



var usersSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: String,
    password: String,
    companyID: String,
    status: String,
    email: String,
    language: String,
    salt: String,
    hash: String,
    hash_verify_account: String,
    hash_change_password: String,
    change_password: Boolean,
    roles: [],
    filters: [],
    accessToken: String,
    startDate: {type: Date, default: Date.now },
    endDate: {type: Date},
    history: String,
    title: String,
    companyName: String,
    department: String,
    businessUnit: String,
    brand: String,
    unit: String,
    customFilter1: String,
    customFilter2: String,
    customFilter3: String,
    customFilter4: String,
    customFilter5: String,
    customFilter6: String,
    customFilter7: String,
    customFilter8: String,
    customFilter9: String,
    customFilter10: String,
    facebook: {
        id: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        name: String
    },
    google: {
        email: String,
        name: String
    },
    last_login_date: {type: Date},
    last_login_ip: {type: String},
    privateSpace: [],
    defaultDocument: {type: String},
    defaultDocumentType: {type: String},
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    createdBy: {type: String},
    createdOn: {type: Date}
}, { collection: 'wst_Users' })

if (!usersSchema.options.toObject) usersSchema.options.toObject = {};
usersSchema.options.toObject.transform = function (doc, user, options) {
    delete user.salt;
    delete user.hash;
    delete user.hash_verify_account;
    delete user.hash_change_password;
}



usersSchema.statics.createUser = function(req, done){
    var data = req.body;
    createTheUser(data,function(result){
        done(result);
    })
}

usersSchema.statics.createTheUser = function (userData,done)
{
    var User = this;
    console.log('creating the user',userData.userName);
    if (!userData.userName) {
        done({result: 0, msg: "'Username' is required."});
        return;
    }

    User.findOne({"userName" : userData.userName },{},function(err, user){
        if(err) throw err;
        if (user) {
            done({result: 0, msg: "userName already in use."});
        }
        else {

            if (userData.password) {

                hash(userData.password, function(err, salt, hash){
                    if(err) throw err;
                    userData.password = undefined;
                    userData.salt = salt;
                    userData.hash = hash;

                    User.create(userData, function(err, user){
                        if(err) throw err;

                        done({result: 1, msg: "User created.", user: user});
                    });
                });
            }


        }
    });

}

usersSchema.statics.setStatus = function(req, done){
    var data = req.body;
    if (!data.id || typeof data.status == 'undefined') {
        done({result: 0, msg: "'id' and 'status' is required."});
        return;
    }
    this.update({
        "_id" : data.id
    }, {
        $set: {
            "status" : data.status
        }
    }, function (err, numAffected) {
        if(err) throw err;

        done({result: 1, msg: "Status updated.", id: data.id, status: data.status});
    });
}

usersSchema.statics.isValidUserPassword = function(username, password, done) {
    //console.log('entering is valid',password);
    this.findOne({$or:[ {'userName': username}, {'email': username} ],status:'active'}, function(err, user){
        if(err) return done(err);
        if(!user) return done(null, false, { message : 'User'+' '+username+' '+'does not exists or is inactive' });
        if(user.status == 0) return done(null, false, { message : 'User not verified '+username });

        //if (user)
          //  console.log('user found',JSON.stringify(user));
        hash(password, user.salt, function(err, hash){
            if(err) return done(err);
            //console.log('checking hash');
            if(hash == user.hash || password == user.hash+user.salt) {
               // console.log('password match');
                return done(null, user);

            }
            else {
                //console.log('password not match');
                done(null, false, { message : 'Password do not match' });

            }
        });
    });
};

usersSchema.statics.rememberPassword = function(email, url, done){
    var crypto = require('crypto');
    var hash_change_password = crypto.createHash('md5').update(email).digest('hex');

    var postData = {
        id: "52d66ea2c6b91ae01f00000a",
        email: email,
        tags: '{"CHANGEPWDURL": "'+url+'login/#/change-password/'+hash_change_password+'"}'
    };

    this.update({
        "email" : email
    }, {
        $set: {
            "hash_change_password" : hash_change_password
        }
    }, function (err) {
        if(err) throw err;

        sendCommunication(postData);

        done({result: 1, msg: "Check your email for instructions"});
    });
}

usersSchema.statics.changePassword = function(req, done){
    var User = this, data = req.body;
    if (!data.hash || !data.password) {
        done({result: 0, msg: "'hash' and 'password' is required."});
        return;
    }
    this.findOne({"hash_change_password" : data.hash},{},function(err, user){
        if(err) throw err;
        if (user) {
            hash(data.password, function(err, salt, hash){
                if(err) throw err;

                User.update({
                    "_id" : user._id
                }, {
                    $set: {
                        "salt" : salt,
                        "hash" : hash,
                        "hash_change_password" : null
                    }
                }, function (err) {
                    if(err) throw err;

                    var Configurations = connection.model('Configurations');

                    Configurations.getConfiguration('log-user-pwd-change', function(configuration){
                        if (configuration.value == 1) {
                            saveToLog(req, 'User password changed: '+user.email, 103);
                        }
                        done({result: 1, msg: "Password updated"});
                    });
                });
            });
        }
        else {
            done({result: 0, msg: "Invalid hash."});
        }
    });
}





var Users = connection.model('Users', usersSchema);
module.exports = Users;