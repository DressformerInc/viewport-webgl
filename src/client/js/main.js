/**
 * Created by Miha-ha on 01.08.14.
 */
//Main
var webgl = require("./webgl").init(),
    $ = require('../../../libs/jquery-2.1.1.min'),
    control,
    isMouseUp = true,
    end = Date.now();

webgl.ee.on('update', function () {

    if(control){
        control();
    }

    if (isMouseUp && (Date.now() - end > 100)) {
        control = null;
    }

});

initEvents();

function initEvents() {
    var $viewport = $('body');

    $viewport
        .on('mousedown', '.dfwvc_up', function () {
            control = webgl.rotateUp;
        })
        .on('mousedown', '.dfwvc_down', function () {
            control = webgl.rotateDown;
        })
        .on('mousedown', '.dfwvc_left', function () {
            control = webgl.rotateLeft;
        })
        .on('mousedown', '.dfwvc_right', function () {
            control = webgl.rotateRight;
        })
        .on('click', '.dfwvc_default', function () {
            webgl.resetRotation();
        })
        .on('mousedown', '.dfwvc_zoom_in', function () {
            control = webgl.zoomIn;
        })
        .on('mousedown', '.dfwvc_zoom_out', function () {
            control = webgl.zoomOut;
        })
        .on('click', '#vprt_full', function () {
            webgl.toggleFullscreen();
        })
        .on('mousedown', function () {
//            console.log('mouse down', null);
            isMouseUp = false;
        })
        .on('mouseup', function () {
//            control = null;
//            console.log('mouse up', null);
            end = Date.now();
            isMouseUp = true;
        });
}