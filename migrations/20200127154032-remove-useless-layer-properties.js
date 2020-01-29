module.exports = {
    async up (db, client) {
        await db.collection('layers').updateMany({}, {
            $unset: {
                companyID: '',
                nd_trash_deleted: '',
                nd_trash_deleted_date: '',
                createdBy: '',
                createdOn: '',
            }
        });
    },

    async down (db, client) {
        await db.collection('layers').updateMany({}, {
            $set: {
                companyID: 'COMPID',
                nd_trash_deleted: false,
            }
        });
    }
};
