module.exports = {
    async up (db) {
        await db.collection('dashboards').deleteMany({ nd_trash_deleted: true });
        await db.collection('dashboards').updateMany({}, {
            $unset: {
                nd_trash_deleted: '',
                nd_trash_deleted_date: '',
            }
        });
    },

    async down (db) {
        await db.collection('dashboards').updateMany({}, {
            $set: {
                nd_trash_deleted: false,
            }
        });
    }
};
