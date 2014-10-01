/**
 * Created by Miha-ha on 01.08.14.
 */
//WebGL
var THREE = global.THREE = require('threejs/build/three'),
    TWEEN = require('tween.js'),
    glslify = require('glslify'),
    utils = require('./utils'),
    EventEmitter = require('events').EventEmitter,
    ee = new EventEmitter(),
    Garment = require('./garment'),
    Dummy = require('./dummy'),
    Api = require('./api');

require('threejs/examples/js/loaders/OBJLoader');
require('./loaders/MTLLoader');
require('./loaders/OBJMTLLoader');
require('threejs/examples/js/controls/OrbitControls');

//require('threejs/examples/js/shaders/CopyShader');
//require('threejs/examples/js/shaders/BokehShader');
//require('threejs/examples/js/shaders/FXAAShader');
//
//
//require('threejs/examples/js/postprocessing/EffectComposer');
//require('threejs/examples/js/postprocessing/RenderPass');
//require('threejs/examples/js/postprocessing/ShaderPass');
//require('threejs/examples/js/postprocessing/MaskPass');
//require('threejs/examples/js/postprocessing/BokehPass');

//private
var screenWidth = global.innerWidth,
    screenHeight = global.innerHeight,
    DPR = global.devicePixelRatio || 1,
    screenWidthDPR = screenWidth * DPR,
    screenHeightDPR = screenHeight * DPR,
    container, stats, loadingManager, objLoader, objMtlLoader,
    isFullscreen = false,
    camera, scene, renderer,
    postprocessing = {},
    lights = {},
    models = {},
    garments = {},
    events = {},
    controls,
    orbitControl,
    targetSpeed = 1,
    targetMin = 100,
    targetMax = 200,
    renderStart,
    dummy,
    garment;

function showStats(container) {
    // STATS
    var Stats = require('threejs-stats/build/stats.min');
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.bottom = '0px';
    stats.domElement.style.zIndex = 100;
    container.appendChild(stats.domElement);
}

function setupLight(scene) {
    var ambientLight = new THREE.AmbientLight(0xffffff);
    scene.add(lights['ambientLight'] = ambientLight);

/*
    var directionalLight = new THREE.DirectionalLight( 0xffeedd);
    directionalLight.position.set( 0, 0, 1).normalize();
    scene.add( directionalLight );


    var directionalLight2 = new THREE.DirectionalLight( 0xffeedd, 0.7);
    directionalLight2.position.set( 0, 0, -300 ).normalize();
    scene.add( directionalLight2 );

*/
    var light1 = new THREE.SpotLight(0xdddddd, 0.5);
    light1.onlyShadow = true;
    light1.position.x = controls.light1.x;
    light1.position.z = controls.light1.z;
    light1.position.y = controls.light1.y;
    light1.castShadow = true;
    light1.shadowBias = -0.0001;
    light1.shadowDarkness = 0.2;
    light1.shadowMapWidth = 2048;
    light1.shadowMapHeight = 2048;
//    light1.shadowCameraVisible = true;
    scene.add(lights['light1'] = light1);
/*
    var light2 = new THREE.SpotLight(0xffffff, 0.7);
//    light2.onlyShadow = true;
    light2.position.x = -500;
    light2.position.z = 300;
    light2.position.y = 800;
    light2.castShadow = true;
    light2.shadowBias = -0.0001;
    light2.shadowDarkness = 0.01;
    light2.shadowMapWidth = 2048;
    light2.shadowMapHeight = 2048;
//    light2.shadowCameraVisible = true;
    scene.add(lights['light2'] = light2);

    var light3 = new THREE.SpotLight(0xffffff, 1);
//    directionalLight.onlyShadow = true;
    light3.position.x = 0;
    light3.position.z = -300;
    light3.position.y = 600;
    light3.castShadow = false;
//    light3.shadowBias = 0.0001;
//    light3.shadowDarkness = 0.01;
//    light3.shadowMapWidth = 2048;
//    light3.shadowMapHeight = 2048;
    scene.add(lights['light3'] = light3);
*/
}

function setupEnvironment(scene) {
    // FLOOR
    var floorMaterial = new THREE.MeshBasicMaterial({
            /*map: floorTexture,*/
            color: 0xFFFFFF,
            side: THREE.BackSide
        }),
        floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10),
        floor = new THREE.Mesh(floorGeometry, floorMaterial);

    floor.position.y = 0;
    floor.rotation.x = Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(models['floor'] = floor);
}

function initControls() {
    var Ctrl = require("./controls").init();
    controls = Ctrl.controls;

//    controls.sizes.apply = reloadDummy;

    function shadowEnable(light, flag) {
        if (flag) {
            renderer.shadowMapAutoUpdate = true;
        } else {
            renderer.shadowMapAutoUpdate = false;
            renderer.clearTarget(light.shadowMap);
        }
    }

    function lightChanged(name) {
        return function () {
            var ctrl = controls[name],
                light = lights[name];

            light.visible = ctrl.enable;
            light.intensity = ctrl.intensity;
            light.position.x = ctrl.x;
            light.position.y = ctrl.y;
            light.position.z = ctrl.z;
            light.shadowBias = ctrl.bias;
            light.shadowDarkness = ctrl.darkness;

            if (!light.visible) {
                shadowEnable(light, false);
            } else {
                shadowEnable(light, ctrl.shadow);
            }

        }
    }

    function dofChanged() {
        postprocessing.bokeh.enabled = controls.dof;
        renderer.autoClear = !controls.dof;
        renderer.antialias = !controls.dof;
        postprocessing.bokeh.uniforms["focus"].value = controls.focus;
        postprocessing.bokeh.uniforms["aperture"].value = controls.aperture;
        postprocessing.bokeh.uniforms["maxblur"].value = controls.maxblur;
        startRender();
    }

    Ctrl.onChange('dummy.color', function (value) {
        var newColor = '0x' + value.substring(1, value.length);
        console.log('dummy.color changed:', value, newColor, models['dummy']);
        models['dummy'].children[0].material.color.setHex(newColor);
    });

    Ctrl.onChange('dummy.matcap', function (value) {
        dummyMaterial.uniforms.tMatCap.value = THREE.ImageUtils.loadTexture('img/matcaps/' + value);
//        dummyMaterial.uniforms.tMatCap.value.needsUpdate = true;
    });

    Ctrl.onChange('light1.enable', lightChanged('light1'));
    Ctrl.onChange('light1.intensity', lightChanged('light1'));
    Ctrl.onChange('light1.x', lightChanged('light1'));
    Ctrl.onChange('light1.y', lightChanged('light1'));
    Ctrl.onChange('light1.z', lightChanged('light1'));
    Ctrl.onChange('light1.shadow', lightChanged('light1'));
    Ctrl.onChange('light1.bias', lightChanged('light1'));
    Ctrl.onChange('light1.darkness', lightChanged('light1'));

    Ctrl.onChange('light2.enable', lightChanged('light2'));
    Ctrl.onChange('light2.intensity', lightChanged('light2'));
    Ctrl.onChange('light2.x', lightChanged('light2'));
    Ctrl.onChange('light2.y', lightChanged('light2'));
    Ctrl.onChange('light2.z', lightChanged('light2'));
    Ctrl.onChange('light2.shadow', lightChanged('light2'));
    Ctrl.onChange('light2.bias', lightChanged('light2'));
    Ctrl.onChange('light2.darkness', lightChanged('light2'));

    Ctrl.onChange('garment', function (value) {
        scene.remove(models['garment']);
        controls.rotate = false;
        var dummyRotation = models['dummy'].rotation;
        loadModel(value, function (model) {
            model.rotation.set(dummyRotation.x, dummyRotation.y, dummyRotation.z, 'XYZ');
            models['garment'] = model;
            scene.add(model);
        })
    });

    Ctrl.onChange('dof', dofChanged);
    Ctrl.onChange('focus', dofChanged);
    Ctrl.onChange('aperture', dofChanged);
    Ctrl.onChange('maxblur', dofChanged);

    Ctrl.onChangeAll(function () {
        console.log('on change all', arguments);
        startRender();
    });
}

function onLoadDummy(model) {
//    console.log('this == dummy ?', this == dummy);
    scene.remove(models['dummy']);
    scene.add(models['dummy'] = model);
}

function onLoadGarment(model) {
    scene.remove(models['garment']);
    scene.add(models['garment'] = model);
}

function init() {
    THREE.ImageUtils.crossOrigin = "*";
    initControls();

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

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true
    });
    renderer.setClearColor(0xffffff);
    renderer.autoClear = true;
//    renderer.gammaInput = true;
//    renderer.gammaOutput = true;
    renderer.sortObjects = false;
    renderer.shadowMapEnabled = true;
    renderer.shadowMapAutoUpdate = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;
    renderer.shadowMapCullFace = THREE.CullFaceBack;


    camera = new THREE.PerspectiveCamera(40, screenWidth / screenHeight, 1, 100000);
    camera.position.y = 100;
    camera.position.z = 320;

    scene = new THREE.Scene();

    scene.matrixAutoUpdate = false;
//    initPostprocessing();
//    renderer.autoClear = false;

    setupLight(scene);
    setupEnvironment(scene);
    //loadDummy();
    dummy = new Dummy(global.Dressformer.user.dummy);
    dummy.load([], loadingManager, onLoadDummy);

    if (global.Dressformer.garment) {
        garment = new Garment(global.Dressformer.garment);
        garment.load([], loadingManager, onLoadGarment);
    }


    container = global.document.getElementById('viewport');
    container.appendChild(renderer.domElement);

    orbitControl = new THREE.OrbitControls(camera, container);
//    orbitControl.noPan = false;
//    orbitControl.noKeys = false;
    orbitControl.target.y = 100;
    orbitControl.target0.y = 100;
    orbitControl.minPolarAngle = Math.PI / 6; // radians
    orbitControl.maxPolarAngle = Math.PI / 1.6; // radians
    orbitControl.minDistance = 100;
    orbitControl.maxDistance = 500;

    orbitControl.addEventListener('change', startRender);
    orbitControl.update();

//    showStats(container);

    global.addEventListener('resize', onWindowResize, false);
    onWindowResize();
    update();
}

function rotateTo(angle) {
    for (var model in models) {
        if (models.hasOwnProperty(model) && 'floor' !== model) {
            var curModel = models[model];
            curModel.rotation.y = angle;
        }
    }

    startRender();
}

function rotate(speed, horisontal) {
    var curModel;
    speed = speed || 0.02;
    for (var model in models) {
        if (models.hasOwnProperty(model) && 'floor' !== model) {
            curModel = models[model];
            if (horisontal) {
                curModel.rotation.y += speed;
            } else {
                orbitControl.rotateUp(speed);
            }
        }
    }

    startRender();
}

function targetOffset(speed) {
    var pos = orbitControl.target.y += speed;
    if (pos < targetMin) pos = targetMin;
    else if (pos > targetMax) pos = targetMax;

    orbitControl.target.y = pos;
}

function update(dt) {
    if (Date.now() - renderStart < 700) {
        render();
    }

    //rotate models
    if (controls && controls.rotate && controls.rotate.auto) {
        rotate(controls.rotate.speed, true);
    }
//
//    if (stats) stats.update();
//
    orbitControl.update();

    TWEEN.update();

    ee.emit('update');

    requestAnimationFrame(update);
}

function render() {
    renderer.render(scene, camera);
//    postprocessing.composer.render(0.1);
}

function startRender() {
    renderStart = Date.now();
}

function onWindowResize() {
    screenWidth = viewport.clientWidth;//global.innerWidth;
    screenHeight = viewport.clientHeight;//global.innerHeight;
    camera.aspect = screenWidth / screenHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(screenWidth, screenHeight, true);
    startRender();
}


module.exports = {
    ee: ee,
    init: function () {
        var me = this;

        init();
        render();

        window.addEventListener("message", function (event) {
            me[event.data.method] && me[event.data.method].apply(me, event.data.params);
        }, false);

        return this;
    },
    //controls
    rotateLeft: function () {
        rotate(-0.09, true);
    },
    rotateRight: function () {
        rotate(0.09, true);
    },
    rotateUp: function () {
        rotate(-controls.rotate.speed, false);
        targetOffset(-targetSpeed);
    },
    rotateDown: function () {
        rotate(controls.rotate.speed, false);
        targetOffset(targetSpeed);
    },
    resetRotation: function () {
        var speed = 300,
            fn = TWEEN.Easing.Cubic.InOut,
            dummyRotation = models['dummy'].rotation.y % (Math.PI * 2);

        new TWEEN.Tween({angle: dummyRotation, target: orbitControl.target.y})
            .to({angle: 0, target: orbitControl.target0.y}, speed)
            .easing(fn)
            .onUpdate(function () {
                rotateTo(this.angle);
                orbitControl.target.y = this.target;
            })
            .start();
        new TWEEN.Tween(orbitControl.object.position)
            .to(orbitControl.position0, speed)
            .easing(fn)
            .onUpdate(function () {
                orbitControl.object.position = this;
                orbitControl.object.lookAt(orbitControl.target0);
            })
            .start();
    },
    zoomIn: function () {
        orbitControl.dollyOut();
    },
    zoomOut: function () {
        orbitControl.dollyIn();
    },
    toggleFullscreen: function () {
        if (!document.fullscreenElement &&    // alternative standard method
            !document.mozFullScreenElement && !document.webkitFullscreenElement) {  // current working methods
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        } else {
            if (document.cancelFullScreen) {
                document.cancelFullScreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitCancelFullScreen) {
                document.webkitCancelFullScreen();
            }
        }
    },
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
};