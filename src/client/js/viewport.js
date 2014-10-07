/**
 * Created by Miha-ha on 05.09.14.
 */

var DF = global.Dressformer,
    $ = require('../../../libs/jquery-2.1.1.min'),
    Dummy = require('./dummy'),
    Garment = require('./garment'),
    Viewport = module.exports = function (mediator) {
        this.mediator = mediator;
        this.$viewport = $('body'); //TODO: выбрать контейнер
        this.$loader = this.$viewport.find('.df_preloader');
        this.garments = {};
        //for controls
        this.isMouseUp = true;
        this.end = Date.now();

        this.loadingManager = new THREE.LoadingManager(
            this._onStartLoading.bind(this),
            this._onProgressLoading.bind(this),
            this._onEndLoading.bind(this),
            this._onErrorLoading.bind(this)
        );

        this.dummy = new Dummy(DF.user.dummy);

        if (DF.garment) {
//            this.garments[DF.garment.slot] = {};
//            this.garments[DF.garment.slot][DF.garment.layer] =
            this.garments[DF.garment.id] = new Garment(DF.garment);
        }

        this.loadModels([]);

        window.addEventListener("message", function (event) {
//            this.webgl[event.data.method] &&
//            this.webgl[event.data.method].apply(this, event.data.params);
            this.mediator.emit.apply(this.mediator, event.data.params.unshift(event.data.method));
        }.bind(this), false);

        this.init();
    };

Viewport.prototype.init = function () {
    var me = this;

    this.mediator.on('update', function () {

        if (me.control) {
            me.mediator.emit(me.control);
        }

        if (me.isMouseUp && (Date.now() - me.end > 100)) {
            me.control = null;
        }

    });

    this.$viewport
        .on('mousedown', '.dfwvc_up', function () {
            me.control = 'RotateUp';
        })
        .on('mousedown', '.dfwvc_down', function () {
            me.control = 'RotateDown';
            console.log('rotate down');
        })
        .on('mousedown', '.dfwvc_left', function () {
            me.control = 'RotateLeft';
        })
        .on('mousedown', '.dfwvc_right', function () {
            me.control = 'RotateRight';
        })
        .on('mousedown', '.dfwvc_zoom_in', function () {
            me.control = 'ZoomIn';
        })
        .on('mousedown', '.dfwvc_zoom_out', function () {
            me.control = 'ZoomOut';
        })
        .on('click', '.dfwvc_default', function () {
            me.mediator.emit('ResetRotation');
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

Viewport.prototype._onStartLoading = function (item, loaded, total) {
    this.$loader.show();
};

Viewport.prototype._onProgressLoading = function (item, loaded, total) {
    console.log('on progress loading:', arguments);
};

Viewport.prototype._onEndLoading = function (item, loaded, total) {
    this.$loader.hide();
};

Viewport.prototype._onErrorLoading = function (item, loaded, total) {
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
    this.mediator.emit('Remove', self.model);
    this.mediator.emit('Add', model);
    self.model = model;
};

Viewport.prototype.onLoadGarment = function (self, model) {
    this.mediator.emit('Remove', self.model);
    this.mediator.emit('Add', model);
    self.model = model;
};