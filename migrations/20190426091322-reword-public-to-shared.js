module.exports = {
    async up (db) {
        await db.collection('wst_Dashboardsv2').updateMany({}, {
            $rename: { isPublic: 'isShared' },
        });
        await db.collection('wst_Reports').updateMany({}, {
            $rename: { isPublic: 'isShared' },
        });

        const Roles = db.collection('wst_Roles');
        const roles = await Roles.find().toArray();
        for (const role of roles) {
            if ('reportsPublish' in role) {
                role.reportsShare = role.reportsPublish;
                delete role.reportsPublish;
            }

            if ('dashboardsPublish' in role) {
                role.dashboardsShare = role.dashboardsPublish;
                delete role.dashboardsPublish;
            }

            for (const grant of role.grants) {
                if ('publishReports' in grant) {
                    grant.shareReports = grant.publishReports;
                    delete grant.publishReports;
                }
            }

            await Roles.replaceOne({ _id: role._id }, role);
        }

        const Companies = db.collection('wst_Companies');
        const companies = await Companies.find().toArray();
        for (const company of companies) {
            if ('publicSpace' in company) {
                renameGrantPublishReports(company.publicSpace);

                company.sharedSpace = company.publicSpace;
                delete company.publicSpace;
            }

            await Companies.replaceOne({ _id: company._id }, company);
        }

        function renameGrantPublishReports (nodes) {
            for (const node of nodes) {
                if (node.grants && 'publishReports' in node.grants) {
                    node.grants.shareReports = node.grants.publishReports;
                    delete node.grants.publishReports;
                }

                renameGrantPublishReports(node.nodes);
            }
        }
    },

    async down (db) {
        await db.collection('wst_Dashboardsv2').updateMany({}, {
            $rename: { isShared: 'isPublic' },
        });
        await db.collection('wst_Reports').updateMany({}, {
            $rename: { isShared: 'isPublic' },
        });

        const Roles = db.collection('wst_Roles');
        const roles = await Roles.find().toArray();
        for (const role of roles) {
            if ('reportsShare' in role) {
                role.reportsPublish = role.reportsShare;
                delete role.reportsShare;
            }

            if ('dashboardsShare' in role) {
                role.dashboardsPublish = role.dashboardsShare;
                delete role.dashboardsShare;
            }

            for (const grant of role.grants) {
                if ('shareReports' in grant) {
                    grant.publishReports = grant.shareReports;
                    delete grant.shareReports;
                }
            }

            await Roles.replaceOne({ _id: role._id }, role);
        }

        const Companies = db.collection('wst_Companies');
        const companies = await Companies.find().toArray();
        for (const company of companies) {
            if ('sharedSpace' in company) {
                renameGrantShareReports(company.sharedSpace);

                company.publicSpace = company.sharedSpace;
                delete company.sharedSpace;
            }

            await Companies.replaceOne({ _id: company._id }, company);
        }

        function renameGrantShareReports (nodes) {
            for (const node of nodes) {
                if (node.grants && 'shareReports' in node.grants) {
                    node.grants.publishReports = node.grants.shareReports;
                    delete node.grants.shareReports;
                }

                renameGrantShareReports(node.nodes);
            }
        }
    }
};
