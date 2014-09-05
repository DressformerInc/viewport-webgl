
var utils = module.exports = {

    clamp: function (value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};