module.exports = {
    up (db) {
        return db.collection('wst_Users').updateMany(
            { roles: 'WSTADMIN' },
            { $set: { 'roles.$': 'ADMIN' } },
        );
    },

    down (db) {
        return db.collection('wst_Users').updateMany(
            { roles: 'ADMIN' },
            { $set: { 'roles.$': 'WSTADMIN' } },
        );
    }
};
