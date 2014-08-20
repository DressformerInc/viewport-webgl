var utils = module.exports = {
    clamp: function (a, b, c) {
        return Math.max(b, Math.min(c, a));
    }
}