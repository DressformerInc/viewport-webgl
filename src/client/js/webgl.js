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

require('./loaders/MTLLoader');
require('./loaders/OBJMTLLoader');
require('threejs/examples/js/controls/OrbitControls');


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
    light1.shadowDarkness = 0.1;
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

function init() {
    THREE.ImageUtils.crossOrigin = "*";



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

    setupLight(scene);
    setupEnvironment(scene);



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



        return this;
    },
    add: function (model) {
        scene.add(model);
    },
    remove: function (model) {
        scene.remove(model);
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
    }
};