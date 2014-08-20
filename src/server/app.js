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
    pkg = require('../../package'),
    config = require('./config');

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
app.use('/client', express.static(__dirname + '/../client'));
app.use(morgan('dev'));
app.use(bodyParser());
app.use(methodOverride());


if ('development' === config.ENVIRONMENT) {
    console.log('Development mode');
}

app.route('/:id?')
    .get(function (req, res, next) {
        res.render('index', {
            version: pkg.version,
            title: "Dressformer widget",
            id: req.params.id || 'KPL_201407_0020_0005'
        });
    });

http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + app.get('port'));
});