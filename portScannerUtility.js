const portscanner = require('portscanner');

/**
 * Finds the first available port between two port numbers
 * @param {number} minPortNumber 
 * @param {number} maxPortNumber 
 * @returns 
 */
function getAvailablePortForUse(minPortNumber, maxPortNumber){
    if (minPortNumber > maxPortNumber) {
        maxPortNumber = minPortNumber + 1;
    }
    return function (callback) {
        portscanner.findAPortNotInUse(minPortNumber, maxPortNumber, callback);
    };
}

module.exports = {
    getAvailablePortForUse
};