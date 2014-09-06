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
        webgl.setDummyColor('cccccc');
    });
    this.events.$viewport.on('click','.dfwvc_d_gold', function () {
        webgl.setDummyColor('cccc00');
    });
    this.events.$viewport.on('click','.dfwvc_d_carbon', function () {
        webgl.setDummyColor('444444');
    });
    this.events.$viewport.on('click','.dfwvc_d_plastic', function () {
        webgl.setDummyColor('999999');
    });
};
/*
 //        .on('click', '.dfwvc_d_silver', function () {
 //            console.log('set color: silver');
 //        })
 //        .on('click', '.dfwvc_d_gold', function () {
 //            console.log('set color: gold');
 //        })
 //        .on('click', '.dfwvc_d_carbon', function () {
 //            console.log('set color: carbon');
 //        })
 //        .on('click', '.dfwvc_d_plastic', function () {
 //            console.log('set color: plastic');
 //        })
 //        .on('click', '.dfwv_history_back', function () {
 //            console.log('dfwv_history_back');
 //        })
 //        .on('click', '.dfwv_history_forward', function () {
 //            console.log('dfwv_history_forward');
 //        })

 */