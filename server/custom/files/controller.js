var Files = connection.model('Files');

exports.getFiles = function(req,res){
    var find = {"type" : new RegExp('image', "i"), "upload_user_id" : req.user._id};

    if (req.query.format) {
        find['extension'] = req.query.format;
    }

    Files.find(find, {}, {sort: {created: -1}}, function(err, files){
        if(err) throw err;

        serverResponse(req, res, 200, {result: 1, files: files});
    });
};


exports.upload = function(req, res) {
    uploadFile(req.files.file, {userID: req.user._id, companyID: req.user.companyID}, function(data) {
        debug(data);

        res.status(200).send(data);
    });
};

function uploadFile(file, params, done) {
    var fs = require('fs');

    fs.readFile(file.path, function(err, data) {
        if(err) throw err;

        upload(data, file, params, done);
    });
}

function upload(data, file, params, done) {
    var fs = require('fs'), mongoose = require('mongoose');

    var File = {
        _id: mongoose.Types.ObjectId(),
        name: (file.originalname) ? file.originalname : file.name,
        type: (file.type) ? file.type : file.mimetype,
        size: file.size
    };

    if (params.data) {
        File['data'] = params.data;
    }

    var extension = File.name.split(".");

    File['extension'] = String(extension[1]).toLowerCase();
    File['source'] = 1;

    if (params.userID) {
        File['upload_user_id'] = params.userID;
    }
    if (params.companyID) {
        File['companyID'] = params.companyID;
    }

    var files = [{name: extension[0]+'.'+File._id+'.'+File.extension, data: data, type: File.type}];

    if (File.source == 0) { //Local
        var newPath = __dirname+"/../../public/uploads/"+File._id+"."+File.extension;

        fs.writeFile(newPath, data, function (err) {
            if(err) throw err;

            File['url'] = config.url+"uploads/"+File._id+"."+File.extension;

            Files.create(File, function(err, file){
                if(err) throw err;

                done({result: 1, msg: "File uploaded", file: file.toObject()});
            });
        });
    }
    else if (File.source == 1) { //Amazon http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/frames.html#!AWS/S3.html
        uploadToS3(files, params, function(filesURLs) {
            File['url'] = filesURLs[0];

            Files.create(File, function(err, file){
                if(err) throw err;

                done({result: 1, msg: "File uploaded", file: file.toObject()});
            });
        });
    }
}

// files -> {name: ..., data: ..., type: ...}
function uploadToS3(files, params, done, index, filesURLs) {
    var index = (index) ? index : 0;
    var filesURLs = (filesURLs) ? filesURLs : [];
    var file = (files[index]) ? files[index] : false;

    if (!file) {
        done(filesURLs);
        return;
    }

    var AWS = require('aws-sdk');

    AWS.config.update({
        accessKeyId: config.amazon.clientID,
        secretAccessKey: config.amazon.clientSecret,
        region: config.amazon.region
    });

    var s3 = new AWS.S3(), bucket = config.amazon.bucket, folder = config.amazon.folder;

    if (params.companyID) {
        folder += '/'+params.companyID;
    }
    if (params.path) {
        folder += '/'+params.path;
    }

    console.log('Bucket: '+bucket);
    console.log('Folder: '+folder);

    s3.createBucket({Bucket: bucket}, function() {
        var key = folder+'/'+file.name;

        var S3Params = {
            Bucket: bucket,
            Key: key,
            Body: file.data,
            ACL: "public-read",
            ContentType: file.type
        };

        filesURLs.push('https://s3.amazonaws.com/'+bucket+'/'+key);

        s3.putObject(S3Params, function(err) {
            if(err) throw err;

            uploadToS3(files, params, done, index+1, filesURLs);
        });
    });
}