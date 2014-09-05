/**
 * Created by Miha-ha on 01.08.14.
 */
//Main
var webgl = require('./webgl').init(),
    events = require('./events')(webgl),
//    Viewport = require('./viewport'),
    ViewportExt = require('./viewport-ext');


new ViewportExt(events, webgl);
