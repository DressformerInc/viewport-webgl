/**
 * Created by Miha-ha on 19.08.14.
 */
var express = require('express'),
    app = express(),
    morgan = require('morgan'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    http = require('http'),
    path = require('path'),
    lusca = require('lusca'),
    engine = require('ejs-locals'),
    config = require('./config'),
    pkg = 'production' == config.ENVIRONMENT ? require('../package') : require('../../package'),
    request = require('request');

app.set('port', config.PORT || process.env.PORT);
app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//app.use(express.favicon());
app.use(lusca({
    csrf: false,
    csp: false,
//    xframe: 'SAMEORIGIN', //Разрешает просмотр сайта в фреймах только на страницах своего сайта
    p3p: 'CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT"', //http://stackoverflow.com/questions/389456/cookie-blocked-not-saved-in-iframe-in-internet-explorer
    hsts: {maxAge: 31536000, includeSubDomains: true},  //https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
    xssProtection: true //http://blog.sjinks.pro/security/884-http-headers-to-secure-website/
}));
console.log('static dir:', path.normalize(__dirname + '/../client'));
app.use('/', express.static(path.normalize(__dirname + '/../client')));
app.use(morgan('dev'));
app.use(bodyParser());
app.use(methodOverride());


if ('development' === config.ENVIRONMENT) {
    console.log('Development mode');
}

app.route('/ext/:id?')
    .get(function (req, res, next) {
        request('http://v2.dressformer.com/api/user', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data;
                try {
                    data = JSON.parse(body);
                }catch(e){}

                console.log('dummy:', data.dummy);

                res.render('ext', {
                    version: pkg.version,
                    title: "Dressformer widget ext",
                    id: req.params.id || 'ADS_201407_0005_0002',
                    dummy: data.dummy
                });
            }else {
                next(error);
            }
        });
    });


app.route('/')
    .get(function (req, res, next) {
        request('http://v2.dressformer.com/api/user', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data;
                try {
                    data = JSON.parse(body);
                }catch(e){}

                console.log('data:', data.dummy.assets);
                data.dummy.assets.geometry.url = 'http://v2.dressformer.com/assets/geometry/'+data.dummy.assets.geometry.id;

                res.render('index', {
                    version: pkg.version,
                    title: "Dressformer widget",
                    id: req.params.id || 'ADS_201407_0005_0002',
                    dummy: data.dummy
                });
            }else {
                next(error);
            }
        });
    });


http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + app.get('port'));
});