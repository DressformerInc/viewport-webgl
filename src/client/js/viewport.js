/**
 * Created by Miha-ha on 05.09.14.
 */

var DF = global.Dressformer,
    Api = require('./api'),
    Dummy = require('./dummy'),
    Garment = require('./garment'),
    Viewport = module.exports = function (events, webgl) {
        this.events = events;
        this.webgl = webgl;
//        this.init();
        this.dummy = new Dummy(DF.user.dummy);
        this.dummy.load([], loadingManager, onLoadDummy);
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

//    this.events.$viewport.on('click', '.dfwvc_d_silver', function () {
//        webgl.setDummyMatcap('silver');
//    });
//    this.events.$viewport.on('click', '.dfwvc_d_gold', function () {
//        webgl.setDummyMatcap('gold');
//    });
//    this.events.$viewport.on('click', '.dfwvc_d_carbon', function () {
//        webgl.setDummyMatcap('carbon');
//    });
//    this.events.$viewport.on('click', '.dfwvc_d_plastic', function () {
//        webgl.setDummyMatcap('plastic');
//    });

    this.events.$viewport.on('click', '.dfwv_screenshot', function () {
        console.log('screenshot: ', global.Dressformer.garment.id);
        var screenshot = webgl.getScreenshot();
        Api.saveGarmentPlaceholder(global.Dressformer.garment.id, screenshot);
    });
};

/*
 loadingManager = new THREE.LoadingManager();
 loadingManager.onProgress = function (item, loaded, total) {
 console.log('loading manager:', item, loaded, total);
 if (total > 1 && loaded === total) {
 //            controls.rotate = true;
 }
 startRender();
 };
 loadingManager.onLoad = function () {
 ee.emit('endload');
 //resolveCollision(models.garment.children[0], models.dummy.children[0]);
 };
 objLoader = new THREE.OBJLoader(loadingManager);
 objMtlLoader = new THREE.OBJMTLLoader(loadingManager);

 //loadDummy();
 dummy = new Dummy(global.Dressformer.user.dummy);
 dummy.load([], loadingManager, onLoadDummy);

 if (global.Dressformer.garment) {
 garment = new Garment(global.Dressformer.garment);
 garment.load([], loadingManager, onLoadGarment);
 }

 window.addEventListener("message", function (event) {
 me[event.data.method] && me[event.data.method].apply(me, event.data.params);
 }, false);

 setParams: function (params) {
 var df = global.Dressformer;

 //loadDummy(df.user.dummy.assets.geometry.url, params);
 dummy.load(params, loadingManager, onLoadDummy);
 if (df.garment) {
 //            this.load(df.garment.id, params);
 garment.load(params, loadingManager, onLoadGarment);
 }
 startRender();
 ee.emit('startload');
 },
 setDummyMatcap: function (value) {
 dummy.setMatcap(value);
 startRender();
 },
 showDummy: function () {
 this.hideDummy();
 scene.add(dummy.model);
 },
 hideDummy: function () {
 scene.remove(dummy.model);
 startRender();
 },
 load: function (id, params) {
 var garment = global.Dressformer.garment,
 cb = function (model) {
 startRender();
 models['garment'] = model;
 scene.add(model);
 };

 if (garment && garment.id === id) {
 loadGarment(garment, params, cb);
 } else {
 loadGarmentById(id, params, cb);
 }
 },
 remove: function (garmentId) {
 scene.remove(models['garment']);
 startRender();
 },
 getScreenshot: function () {
 return renderer.domElement.toDataURL()
 },
 saveGarmentPlaceholder: function (id) {
 Api.saveGarmentPlaceholder(id, this.getScreenshot());
 }
 */