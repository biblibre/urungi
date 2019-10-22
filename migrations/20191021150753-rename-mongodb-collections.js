module.exports = {
    async up (db) {
        const collections = await db.collections();
        const collectionsSet = new Set(collections.map(c => c.collectionName));
        const renames = {
            wst_Companies: 'companies',
            wst_Dashboardsv2: 'dashboards',
            wst_DataSources: 'datasources',
            wst_Files: 'files',
            wst_Layers: 'layers',
            wst_Logs: 'logs',
            wst_Reports: 'reports',
            wst_Roles: 'roles',
            wst_Sessions: 'sessions',
            wst_Statistics: 'statistics',
            wst_Users: 'users',
        };

        for (const [fromCollection, toCollection] of Object.entries(renames)) {
            if (collectionsSet.has(fromCollection)) {
                await db.renameCollection(fromCollection, toCollection);
            }
        }
    },

    async down (db) {
        const collections = await db.collections();
        const collectionsSet = new Set(collections.map(c => c.collectionName));
        const renames = {
            companies: 'wst_Companies',
            dashboards: 'wst_Dashboardsv2',
            datasources: 'wst_DataSources',
            files: 'wst_Files',
            layers: 'wst_Layers',
            logs: 'wst_Logs',
            reports: 'wst_Reports',
            roles: 'wst_Roles',
            sessions: 'wst_Sessions',
            statistics: 'wst_Statistics',
            users: 'wst_Users',
        };

        for (const [fromCollection, toCollection] of Object.entries(renames)) {
            if (collectionsSet.has(fromCollection)) {
                await db.renameCollection(fromCollection, toCollection);
            }
        }
    }
};
