/**
 * Created by Miha-ha on 05.09.14.
 */

var DF = global.Dressformer,
    $ = require('../../../libs/jquery-2.1.1.min'),
    Api = require('./api'),
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
//            this.garments[DF.garment.id] = new Garment({
//                "id": "004d745f-d0cb-4e82-a1c3-fa617acc6548",
//                "gid": "5feb7208-e5d2-4978-814d-8a902d32bbae",
//                "name": "test obj",
//                "size_name": "M",
//                "dummy_id": "f0990c98-b437-47af-a506-4bd23879c6b1",
//                "slot": "1",
//                "layer": 1,
//                "url_prefix": "//v2.dressformer.com/assets/v2/",
//                "assets": {
//                    "geometry": {
//                        "id": "b88f040e-5b30-46a8-b835-392f0d026f78"
//                    },
//                    "placeholder": {},
//                    "mtl_src": {
//                        "id": "543fd0530000000000000029"
//                    }
//                },
//                "materials": [
//                    {
//                        "id": "cb68a7bb-2cba-430b-9dba-84b6fd7609af",
//                        "name": "white",
//                        "ka": "0 0 0",
//                        "kd": "1 1 1",
//                        "ks": "0 0 0"
//                    },
//                    {
//                        "id": "472327b0-ec25-489a-981c-11feffb62cac",
//                        "name": "red",
//                        "ka": "0 0 0",
//                        "kd": "1 0 0",
//                        "ks": "0 0 0"
//                    },
//                    {
//                        "id": "80362fa6-3882-4024-995e-c5e9f58b97b6",
//                        "name": "green",
//                        "ka": "0 0 0",
//                        "kd": "0 1 0",
//                        "ks": "0 0 0"
//                    },
//                    {
//                        "id": "a034ad32-5c75-4e99-8a7b-3b9946dac8e3",
//                        "name": "blue",
//                        "ka": "0 0 0",
//                        "kd": "0 0 1",
//                        "ks": "0 0 0"
//                    },
//                    {
//                        "id": "b337d711-f382-481e-bbaf-682e3ecf0e5a",
//                        "name": "light",
//                        "ka": "20 20 20",
//                        "kd": "1 1 1",
//                        "ks": "0 0 0"
//                    }
//                ]
//            });
        }

        this.loadModels([]);

        window.addEventListener("message", function (event) {
//            this.webgl[event.data.method] &&
//            this.webgl[event.data.method].apply(this, event.data.params);
            console.log('mediator:', this.mediator, 'event:', event);
            event.data.params.unshift(event.data.method);
            this.mediator.emit.apply(this.mediator, event.data.params);
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

    for (var id in this.garments) {
        if (this.garments.hasOwnProperty(id)) {
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

Viewport.prototype.onShowDummy = function () {
    console.log('show dummy:', this.dummy.model);
    this.mediator.emit('Add', this.dummy.model);
};

Viewport.prototype.onHideDummy = function () {
    console.log('hide dummy:', this.dummy.model);
    this.mediator.emit('Remove', this.dummy.model);
};

Viewport.prototype.onScreenshot = function (params) {
    console.log('garment params:', params);
    Api.saveGarmentPlaceholder(params.garmentId, params.screenshot);
};

