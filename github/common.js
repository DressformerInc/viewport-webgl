var Q = require('q'),
    req = require('request'),
    common = module.exports = {};

common.request  = function (params) {
    var deferred = Q.defer();
    req(params, function (error, res, body) {
        if (error ) {
            deferred.reject(error);
        } else if(-1 === [200, 201].indexOf(+res.statusCode) ){
            deferred.reject(body);
        } else {
            deferred.resolve(body);
        }
    });
    return deferred.promise;
};

common.helpers = {
    /**
     * Получить значение по пути 'b.c.d' объекта a
     * @param path
     * @param obj
     * @returns {*|global|Object}
     * @param def
     */
    getValue: function getValue(path, obj, def){
        var parts = path.split('.');
        obj = obj || global;
        def = def || '';

        while(obj && parts.length>0) obj = obj[parts.shift()];

        if('undefined' === typeof obj) return def;

        return obj;
    }
};

