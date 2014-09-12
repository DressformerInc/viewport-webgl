/**
 * Created by Miha-ha on 05.09.14.
 */

var Viewport = module.exports= function (events, webgl) {
    this.events = events;
    this.webgl = webgl;
    this.init();
};

Viewport.prototype.init = function () {
    var webgl = this.webgl;
    this.events.on('mousedown', '.dfwvc_up', 'rotateUp');
    this.events.on('mousedown', '.dfwvc_down', 'rotateDown');
    this.events.on('mousedown', '.dfwvc_left', 'rotateLeft');
    this.events.on('mousedown', '.dfwvc_right', 'rotateRight');
    this.events.on('click', '.dfwvc_default', 'resetRotation');
    this.events.on('mousedown', '.dfwvc_zoom_in', 'zoomIn');
    this.events.on('mousedown', '.dfwvc_zoom_out', 'zoomOut');

    this.events.$viewport.on('click','.dfwvc_d_silver', function () {
        webgl.setDummyMatcap('silver');
    });
    this.events.$viewport.on('click','.dfwvc_d_gold', function () {
        webgl.setDummyMatcap('gold');
    });
    this.events.$viewport.on('click','.dfwvc_d_carbon', function () {
        webgl.setDummyMatcap('carbon');
    });
    this.events.$viewport.on('click','.dfwvc_d_plastic', function () {
        webgl.setDummyMatcap('plastic');
    });
};
/*
 //        .on('click', '.dfwv_history_back', function () {
 //            console.log('dfwv_history_back');
 //        })
 //        .on('click', '.dfwv_history_forward', function () {
 //            console.log('dfwv_history_forward');
 //        })

 */