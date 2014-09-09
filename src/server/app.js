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
                } catch (e) {
                }

                data.dummy.assets.geometry.url = 'http://v2.dressformer.com/assets/geometry/' + data.dummy.assets.geometry.id;

                res.render('ext', {
                    version: pkg.version,
                    title: "Dressformer widget ext",
                    id: req.params.id || 'ADS_201407_0005_0002',
                    dummy: data.dummy,
                    history: [
                        {
                            id: '75df08e3-a053-4cfe-97f9-d8c7f1af1393',
                            placeholder: ''
                        },
                        {
                            id: 'de8b4da5-da7e-4547-9a47-9027e0bd85c2',
                            placeholder: 'img/g1.png'
                        },
                        {
                            id: '165e5bcb-ee7e-4c43-b8bf-1c4d077236ed',
                            placeholder: 'img/g2.png'
                        },
                        {
                            id: '61de8f81-b764-4550-814f-baea86574d11',
                            placeholder: 'img/g3.png'
                        }
                    ]
                });
            } else {
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
                } catch (e) {
                }

                console.log('data:', data.dummy.assets);
                data.dummy.assets.geometry.url = 'http://v2.dressformer.com/assets/geometry/' + data.dummy.assets.geometry.id;

                res.render('index', {
                    version: pkg.version,
                    title: "Dressformer widget",
                    id: req.params.id || 'ADS_201407_0005_0002',
                    dummy: data.dummy
                });
            } else {
                next(error);
            }
        });
    });


http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + app.get('port'));
});