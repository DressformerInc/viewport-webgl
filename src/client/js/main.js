/**
 * Created by Miha-ha on 01.08.14.
 */
//Main
var webgl = require("./webgl").init(),
    $ = require('../../../libs/jquery-2.1.1.min'),
    control;

webgl.ee.on('update', function () {
    if(control) control();
});

initEvents();

function initEvents() {
    var $viewport = $('#viewport');

    $viewport
        .on('mousedown', '#cc_up', function () {
            control = webgl.rotateUp;
        })
        .on('mousedown', '#cc_down', function () {
            control = webgl.rotateDown;
        })
        .on('mousedown', '#cc_left', function () {
            control = webgl.rotateLeft;
        })
        .on('mousedown', '#cc_right', function () {
            control = webgl.rotateRight;
        })
        .on('mousedown', '#cc_default', function () {
            control = webgl.resetRotation;
        })
        .on('mousedown', '#zc_in', function () {
            control = webgl.zoomIn;
        })
        .on('mousedown', '#zc_out', function () {
            control = webgl.zoomOut;
        })
        .on('mousedown', '#vprt_full', function () {
            webgl.toggleFullscreen();
        })
        .on('mouseup', function () {
            control = null;
        });
}