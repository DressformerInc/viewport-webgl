var util = require('util'),
    path = require('path'),
    fs = require('fs'),
    request = require('./common').request,
    github = require('./github.json'),
    url = util.format('%s/%s/%s/releases', github.api, github.owner, github.repo),
    releaseName = 'release.zip',
    releasePath = path.normalize(__dirname + '/../' + releaseName);

exports.create = function () {
    var version = require('../package.json').version,
        options = {
        tag_name: 'v' + version,
        name: 'Release v' + version
    };

    return request({
        method: 'post',
        url: url,
        headers: {
            "Accept": "application/vnd.github.manifold-preview",
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
        },
        json: true,
        body: JSON.stringify(options),
        auth: { 'user': github.user, 'password': github.key }
    });
};

exports.createAndUpload = function () {
    return exports.create()
        .then(function (res) {
            return exports.upload(res.upload_url.replace(/{(\S+)}/gi, '$1=' + releaseName))
        });
};

exports.list = function () {
    return request({
        url: url,
        method: "GET",
        headers: {
            "Accept": "application/vnd.github.manifold-preview",
            'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
        },
        json: true,
        auth: { 'user': github.user, 'password': github.key }
    });
};

exports.upload = function (uploadUrl) {
    var req = require('request'),
        deferred = require('q').defer();

    if (!uploadUrl) deferred.reject('Bad upload url!');

    fs.stat(releasePath, function (err, stats) {
        fs.createReadStream(releasePath).pipe(
            req.post(uploadUrl, {
                auth: { 'user': github.user, 'password': github.key },
                headers: {
                    "Accept": "application/vnd.github.manifold-preview",
                    "Content-Type": "application/zip",
                    "Content-Length": stats.size
                }
            }, function (error, res, body) {
                if (error) {
                    deferred.reject(error);
                } else if (201 !== res.statusCode) { //Status: 201 Created
                    deferred.reject(body);
                } else {
                    deferred.resolve(body);
                }
            })
        );
    });

    return deferred.promise;
};

