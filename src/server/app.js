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
                    id: req.params.id,
                    dummy: data.dummy,
                    history: [
                        {
                            id: '75df08e3-a053-4cfe-97f9-d8c7f1af1393',
                            placeholder: ''
                        },
                        {
                            id: '5a411326-5a77-43ae-b580-b45a292a2d5d',
                            placeholder: ''
                        },
                        {
                            id: 'd6b9ebc3-d96d-423d-aa7f-d1ff4e1c7e30',
                            placeholder: ''
                        },
                        {
                            id: '0af3a3fb-309b-4682-a745-cbd4e32f8e41',
                            placeholder: ''
                        }
                    ]
                });
            } else {
                next(error);
            }
        });
    });


app.route('/:id?')
    .get(function (req, res, next) {
        request('http://v2.dressformer.com/api/user', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var data;

                try {
                    data = JSON.parse(body);
                } catch (e) {
                }

                //data.dummy.assets.geometry.url = 'http://v2.dressformer.com/assets/geometry/' + data.dummy.assets.geometry.id;

                res.render('index', {
                    version: pkg.version,
                    title: "Dressformer widget",
                    id: req.params.id,
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