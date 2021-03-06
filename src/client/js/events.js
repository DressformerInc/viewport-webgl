/**
 * Created by Miha-ha on 05.09.14.
 */

var $ = require('../../../libs/jquery-2.1.1.min');

module.exports = function (webgl) {
    return new Events(webgl);
};

var Events = function (webgl) {
    this.webgl = webgl;
    this.control = null;
    this.isMouseUp = true;
    this.end = Date.now();
    this.$viewport = $('body');
    this.$loader = this.$viewport.find('.df_preloader');

    this.init();
};

Events.prototype.init = function () {
    var me = this;

    this.webgl.ee.on('update', function () {

        if (me.control) {
            me.control();
        }

        if (me.isMouseUp && (Date.now() - me.end > 100)) {
            me.control = null;
        }

    });
    this.webgl.ee.on('startload', this.onStartLoad.bind(this));
    this.webgl.ee.on('endload', this.onEndLoad.bind(this));

    this.$viewport
        .on('mousedown', function () {
            me.isMouseUp = false;
        })
        .on('mouseup', function () {
            me.end = Date.now();
            me.isMouseUp = true;
        });
};

Events.prototype.on = function (event, selector, method) {
    this.$viewport.on(event, selector, function () {
        this.control = this.webgl[method];
    }.bind(this));
};

Events.prototype.onStartLoad = function () {
    console.log('start loading');
    this.$loader.show();
};

Events.prototype.onEndLoad = function () {
    console.log('end loading');
    this.$loader.hide();
};

