/**
 * Created by Miha-ha on 19.08.14.
 */
var express = require('express'),
    app = express(),
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
app.use(express.favicon());
app.use(lusca({
    csrf: false,
    csp: false,
    xframe: 'SAMEORIGIN', //Разрешает просмотр сайта в фреймах только на страницах своего сайта
    p3p: 'CP="IDC DSP COR ADM DEVi TAIi PSA PSD IVAi IVDi CONi HIS OUR IND CNT"', //http://stackoverflow.com/questions/389456/cookie-blocked-not-saved-in-iframe-in-internet-explorer
    hsts: {maxAge: 31536000, includeSubDomains: true},  //https://www.owasp.org/index.php/HTTP_Strict_Transport_Security
    xssProtection: true //http://blog.sjinks.pro/security/884-http-headers-to-secure-website/
}));
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
if ('development' === config.ENVIRONMENT){
    console.log('dev env', __dirname + '/../client');
    app.use('/client', express.static(__dirname + '/../client'));
}

app.get('/', function(req, res){
    res.render('index', {
        version: pkg.version,
        title: "EJS example"
    });
});

http.createServer(app).listen(app.get('port'), '0.0.0.0', function () {
    console.log('Express server listening on port ' + app.get('port'));
});