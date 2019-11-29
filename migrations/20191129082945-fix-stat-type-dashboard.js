module.exports = {
    up (db) {
        return db.collection('statistics').updateMany({ type: 'Dashboard' }, { $set: { type: 'dashboard' } });
    },

    down (db) {
        return db.collection('statistics').updateMany({ type: 'dashboard' }, { $set: { type: 'Dashboard' } });
    }
};
