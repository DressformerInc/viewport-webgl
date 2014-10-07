/**
 * Created by Miha-ha on 05.09.14.
 */

var DF = global.Dressformer,
    $ = require('../../../libs/jquery-2.1.1.min'),
    Dummy = require('./dummy'),
    Garment = require('./garment'),
    Viewport = module.exports = function (ee, webgl) {
        this.ee = ee;
        this.webgl = webgl;
        this.$viewport = $('body'); //TODO: выбрать контейнер
        this.$loader = this.$viewport.find('.df_preloader');
        this.garments = {};
        //for controls
        this.isMouseUp = true;
        this.end = Date.now();

        this.loadingManager = new THREE.LoadingManager(
            this.onStartLoading.bind(this),
            this.onProgressLoading.bind(this),
            this.onEndLoading.bind(this),
            this.onErrorLoading.bind(this)
        );

        this.dummy = new Dummy(DF.user.dummy);

        if (DF.garment) {
//            this.garments[DF.garment.slot] = {};
//            this.garments[DF.garment.slot][DF.garment.layer] =
            this.garments[DF.garment.id] = new Garment(DF.garment);
        }

        this.loadModels([]);

        window.addEventListener("message", function (event) {
            this.webgl[event.data.method] &&
            this.webgl[event.data.method].apply(this, event.data.params);

        }.bind(this), false);

        this.init();
    };

Viewport.prototype.init = function () {
    var me = this,
        webgl = this.webgl;

    this.ee.on('update', function () {

        if (me.control) {
            me.control();
        }

        if (me.isMouseUp && (Date.now() - me.end > 100)) {
            me.control = null;
        }

    });

    this.$viewport
        .on('mousedown', '.dfwvc_up', function () {
            me.control = webgl.rotateUp;
        })
        .on('mousedown', '.dfwvc_down', function () {
            me.control = webgl.rotateDown;
            console.log('rotate down');
        })
        .on('mousedown', '.dfwvc_left', function () {
            me.control = webgl.rotateLeft;
        })
        .on('mousedown', '.dfwvc_right', function () {
            me.control = webgl.rotateRight;
        })
        .on('mousedown', '.dfwvc_zoom_in', function () {
            me.control = webgl.zoomIn;
        })
        .on('mousedown', '.dfwvc_zoom_out', function () {
            me.control = webgl.zoomOut;
        })
        .on('click', '.dfwvc_default', function () {
            webgl.resetRotation();
        })
        .on('mousedown', function () {
            me.isMouseUp = false;
        })
        .on('mouseup', function () {
            me.end = Date.now();
            me.isMouseUp = true;
        });

//    this.events.$viewport.on('click', '.dfwv_screenshot', function () {
//        console.log('screenshot: ', global.Dressformer.garment.id);
//        var screenshot = webgl.getScreenshot();
//        Api.saveGarmentPlaceholder(global.Dressformer.garment.id, screenshot);
//    });
};

//Viewport.prototype.loadGarment = function (params) {
//
//}

Viewport.prototype.onStartLoading = function (item, loaded, total) {
    this.$loader.show();
};

Viewport.prototype.onProgressLoading = function (item, loaded, total) {
    console.log('on progress loading:', arguments);
};

Viewport.prototype.onEndLoading = function (item, loaded, total) {
    this.$loader.hide();
};

Viewport.prototype.onErrorLoading = function (item, loaded, total) {
    console.error('on error loading:', arguments);
};

Viewport.prototype.loadModels = function (params) {
    this.dummy.load(params, this.loadingManager, this.onLoadDummy.bind(this));

    for(var id in this.garments){
        if(this.garments.hasOwnProperty(id)){
            var garment = this.garments[id];
            garment.load(params, this.loadingManager, this.onLoadGarment.bind(this));
        }
    }
};

//TODO: merge loaders
Viewport.prototype.onLoadDummy = function (self, model) {
    this.webgl.remove(self.model);
    this.webgl.add(model);
    self.model = model;
};

Viewport.prototype.onLoadGarment = function (self, model) {
    console.log('on load garment:', arguments);
    this.webgl.remove(self.model);
    this.webgl.add(model);
    self.model = model;
};