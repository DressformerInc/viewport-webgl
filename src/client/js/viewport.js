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
        this.garmentsHistory = {};
        //for controls
        this.isMouseUp = true;
        this.end = Date.now();

        global.THREE.DefaultLoadingManager = new global.THREE.LoadingManager(
            this.onStartLoading.bind(this),
            this._onProgressLoading.bind(this),
            this.onEndLoading.bind(this),
            this._onErrorLoading.bind(this)
        );

        this.dummy = new Dummy(DF.user.dummy);

        if (DF.garments) {
//            this.garments[DF.garment.slot] = {};
//            this.garments[DF.garment.slot][DF.garment.layer] =
            for(var i= 0, l=DF.garments.length; i<l; ++i) {
                this.garments[DF.garments[i].id] = new Garment(DF.garments[i], this.mediator);
            }

        }

        if (DF.user && DF.user.history) {
            var gh = DF.user.history;
            for(var i= 0, l=gh.length; i<l; ++i){
                var garment = gh[i];
                this.garmentsHistory[garment.id] = new Garment(garment, this.mediator);
            }
        }

        this.loadModels([]);

        global.addEventListener("message", function (event) {
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
            //me.control = 'RotateUp';
            me.mediator.emit('RotateUp');
        })
        .on('mousedown', '.dfwvc_down', function () {
            //me.control = 'RotateDown';
            me.mediator.emit('RotateDown');
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
        .on('keydown', function (e) {
            var codes = [37, 39, 38, 40];

            codes[0] === e.which && (me.control = 'RotateLeft');
            codes[1] === e.which && (me.control = 'RotateRight');
            codes[2] === e.which && me.mediator.emit('RotateUp');
            codes[3] === e.which && me.mediator.emit('RotateDown');

            ~codes.indexOf(e.which) && e.preventDefault();

            me.isMouseUp = false;
        })
        .on('mousedown', function () {
            me.isMouseUp = false;
        })
        .on('mouseup keyup', function () {
            me.end = Date.now();
            me.isMouseUp = true;
        });

};

//Viewport.prototype.loadGarment = function (params) {
//
//}

Viewport.prototype.onStartLoading = function (item, loaded, total) {
    this.$loader.show();
};

Viewport.prototype._onProgressLoading = function (item, loaded, total) {
    //console.log('on progress loading:', arguments);
};

Viewport.prototype.onEndLoading = function (item, loaded, total) {
    this.$loader.hide();
};

Viewport.prototype._onErrorLoading = function (item, loaded, total) {
    console.error('on error loading:', arguments);
};

Viewport.prototype.loadModels = function (params, noDummy) {
    var me = this,
        map = {}; //geometry.id => garment.id

    if (!noDummy) this.dummy.load(params, this.onLoadDummy.bind(this));

    var ids = [];
    for (var id in this.garments) {
        if (this.garments.hasOwnProperty(id)) {
            var garment = this.garments[id];
            //garment.load(params, this.loadingManager, this.onLoadGarment.bind(this));
            map[garment.assets.geometry.id] = id;
            ids.push(garment.assets.geometry.id);
        }
    }

    Api.getGeometries(ids, params, function (err, data) {
        for(var geometryId in data){
            //console.log('id:', geometryId, 'data:', data[geometryId].substring(0,100), 'last chars:', data[geometryId].substring(data[geometryId].length-100,data[geometryId].length));
            var garmentId = map[geometryId],
                garment = me.garments[garmentId].parse(data[geometryId]);
            me.onLoadGarment(garment, garment.model);
        }

    });

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
    this.mediator.emit('GarmentAdded', self);
};

Viewport.prototype.onGarmentMaterialUpdate = function (garmentId, materialName, materialProperty, materialValue) {
    console.log('garment material update arguments:', arguments);
    var me = this,
        garment = this.garments[garmentId];

    garment.model && garment.model.traverse(function (child) {
        if (child instanceof THREE.Mesh && child.material.name === materialName) {
            child.material[materialProperty] = materialValue;
            child.material.needsUpdate = true;
            me.mediator.emit('StartRender');
        }
    });
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

