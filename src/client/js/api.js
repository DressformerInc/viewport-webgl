/**
 * Created by Miha-ha on 18.08.14.
 */
var $ = require('../../../libs/jquery-2.1.1.min'),
    baseUrl = 'http://v2.dressformer.com/api/',
    urls = {
        base: baseUrl,
        garments: baseUrl + 'garments/',
        user: baseUrl + 'user/'
    };

var Api = module.exports = {
    getGarment: function (id, cb) {
        $.getJSON(urls.garments + id, cb)
    },
    getUser: function (cb) {
        $.getJSON(urls.user, cb)
    }
};
