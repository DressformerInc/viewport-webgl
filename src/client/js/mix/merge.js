/**
 * Created by Miha-ha on 28.09.14.
 */

function merge(obj) {
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            this[p] = obj[p];
        }
    }
}

module.exports = function (obj) {
     obj.prototype.merge = merge;
};