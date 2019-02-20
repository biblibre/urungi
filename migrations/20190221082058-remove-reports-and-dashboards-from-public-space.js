module.exports = {
    async up (db) {
        const Companies = db.collection('wst_Companies');
        const companies = await Companies.find().toArray();
        for (const company of companies) {
            company.publicSpace = company.publicSpace.filter(function isNotReportOrDashboard (node) {
                if (node.nodes) {
                    node.nodes = node.nodes.filter(isNotReportOrDashboard);
                }

                return !(node.nodeType === 'dashboard' || node.nodeType === 'report');
            });
            await Companies.replaceOne({ _id: company._id }, company);
        }
    },

    down (db) {
    }
};
