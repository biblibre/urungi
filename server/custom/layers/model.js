var mongoose = require('mongoose');


var LayersSchema = new mongoose.Schema({
    companyID: {type: String, required: false},
    name: {type: String, required: true},
    description: {type: String},
    status: {type: String, required: true},
    params:  {type: Object},
    objects: [],
    nd_trash_deleted:{type: Boolean},
    nd_trash_deleted_date: {type: Date},
    createdBy: {type: String},
    createdOn: {type: Date}
}, { collection: 'wst_Layers' });

LayersSchema.statics.setStatus = function(req, done){

    if (req.session.isWSTADMIN)
    {

        var layerID = req.body.layerID;
        var layerStatus = req.body.status;

        if (!layerID || typeof layerID == 'undefined') {
            done({result: 0, msg: "'id' and 'status' are required."});
            return;
        }
        this.findOne({"_id" : layerID,"companyID": req.user.companyID}, function (err, findLayer) {

                if (findLayer)
                {
                    Layers.update({
                        "_id" : layerID
                    }, {
                        $set: {
                            "status" : layerStatus
                        }
                    }, function (err, numAffected) {
                        if(err) throw err;

                        done({result: 1, msg: "Status updated."});
                    });
                } else {
                    done({result: 0, msg: "No layer found for this company, can´t update the layer status"});
                }


        });

    }
}

var Layers = connection.model('Layers', LayersSchema);
module.exports = Layers;


