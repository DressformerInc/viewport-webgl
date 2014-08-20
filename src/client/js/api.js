/**
 * Created by Miha-ha on 18.08.14.
 */
var api = module.exports = {},
    $ = require('../../../libs/jquery-2.1.1.min');

api.url = '//api.dressformer.com/v2/';
api.assetsUrl = '//assets.dressformer.com';

api.getGarments = function (ids, cb) {
    $.getJSON(api.url+'garments?ids='+ids.join(','), cb)
};

api.getUser = function (cb) {
    $.getJSON(api.url+'user', cb)
};