/**
 * Created by Miha-ha on 01.08.14.
 */
//Main
var EventEmitter = require('events').EventEmitter,
    ee = new EventEmitter(),
    webgl = require('./webgl').init(ee),
    events = require('./events')(webgl),
//    Viewport = require('./viewport'),
    ViewportExt = require('./viewport-ext');

new ViewportExt(events, webgl);
