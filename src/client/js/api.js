/**
 * Created by Miha-ha on 18.08.14.
 */
var $ = require('../../../libs/jquery-2.1.1.min'),
    baseUrl = 'http://v2.dressformer.com/',
    urls = {
        base: baseUrl,
        garments: baseUrl + 'api/garments/',
        user: baseUrl + 'api/user/',
        assets: baseUrl + 'assets/'
    };

var Api = module.exports = {
    urls: urls,
    getGarment: function (id, cb) {
        $.getJSON(urls.garments + id, cb)
    },
    getGeometries: function (ids, cb) {
        var url = urls.assets + '?geom_ids=' + ids.join(',')+'&'+Date.now();
        $.ajax({
            url: url,
            type: 'GET',
            processData: false,
            crossDomain: true,
            success: function(data, status, xhr) {
                var sizes = xhr.getResponseHeader('Df-Sizes').split(','),
                    result = {},
                    start = 0;

                for(var i= 0, l=ids.length; i<l; ++i){
                    var id = ids[i],
                        size = +sizes[i];

                    result[id] = data.substring(start, start+size);
                    start = size;
                }

                cb(null, result);
            }
        });

    },
    updateGarment: function (garment, cb) {
        $.ajax({
            type: "PUT",
            url: urls.garments + garment.id,
            data: JSON.stringify(garment),
            success: cb,
            processData: false,
            contentType: 'application/json',
            dataType: 'json'
        });
    },
    getUser: function (cb) {
        $.getJSON(urls.user, cb)
    },
    saveGarmentPlaceholder: function (id, screenshot) {
        var data = atob(screenshot.substring("data:image/png;base64,".length)),
            asArray = new Uint8Array(data.length),
            blob,
            formData = new FormData();


        for (var i = 0, len = data.length; i < len; ++i) {
            asArray[i] = data.charCodeAt(i);
        }

        blob = new Blob([asArray.buffer], {type: "image/png"});
        formData.append('file', blob, 'screenshot.png');

        $.ajax({
            url: urls.assets,
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            type: 'POST',
            success: function (response) {
                console.log('success response:', response);
                if (response.length > 0 && response[0].id) {
                    var garment = {
                        id: id,
                        assets: {
                            placeholder: {
                                id: response[0].id
                            }
                        }
                    };

                    Api.updateGarment(garment, function (response) {
                        console.log('update garment response:', response);
                    });
                } else {
                    console.error('create asset error:', response);
                }

            }
        });
    }
};
