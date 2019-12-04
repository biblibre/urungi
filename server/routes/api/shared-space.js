const express = require('express');
const mongoose = require('mongoose');
const restrict = require('../../middlewares/restrict');
const restrictAdmin = require('../../middlewares/restrict-admin');

const router = express.Router();
const Company = mongoose.model('Company');

router.get('/', restrict, getSharedSpace);
router.put('/', restrictAdmin, setSharedSpace);

function getSharedSpace (req, res) {
    Company.findOne({ companyID: 'COMPID' }).then(company => {
        res.json({ items: company.sharedSpace });
    });
}

function setSharedSpace (req, res) {
    const update = { $set: { sharedSpace: req.body } };
    Company.findOneAndUpdate({ companyID: 'COMPID' }, update, { new: true }).then(company => {
        res.json({ items: company.sharedSpace });
    });
}

module.exports = router;
