const SqlQueryBuilder = require('./SqlQueryBuilder.js');

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

class OracleQueryBuilder extends SqlQueryBuilder {
    formatDate (date) {
        const year = date.getFullYear().toString().padStart(4, '0');
        const month = months[date.getMonth()];
        const day = date.getDate().toString().padStart(2, '0');

        return `${day}-${month}-${year}`;
    }
}

module.exports = OracleQueryBuilder;
