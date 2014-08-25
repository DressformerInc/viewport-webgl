/**
 * Created by Miha-ha on 01.08.14.
 */
//WebGL
var THREE = global.THREE = require('threejs/build/three.min'),
    TWEEN = require('tween.js'),
    glslify = require('glslify'),
    utils = require('./utils'),
    EventEmitter = require('events').EventEmitter,
    ee = new EventEmitter();

require('threejs/examples/js/loaders/OBJLoader');
require('threejs/examples/js/controls/OrbitControls');

require('threejs/examples/js/shaders/CopyShader');
require('threejs/examples/js/shaders/BokehShader');
require('threejs/examples/js/shaders/FXAAShader');


require('threejs/examples/js/postprocessing/EffectComposer');
require('threejs/examples/js/postprocessing/RenderPass');
require('threejs/examples/js/postprocessing/ShaderPass');
require('threejs/examples/js/postprocessing/MaskPass');
require('threejs/examples/js/postprocessing/BokehPass');

//private
var screenWidth = global.innerWidth,
    screenHeight = global.innerHeight,
    DPR = global.devicePixelRatio || 1,
    screenWidthDPR = screenWidth * DPR,
    screenHeightDPR = screenHeight * DPR,
    container, stats, loadingManager, objLoader,
    isFullscreen = false,
    camera, scene, renderer,
    postprocessing = {},
    lights = {},
    models = {},
    events = {},
    controls,
    orbitControl,
    targetSpeed = 1,
    targetMin = 100,
    targetMax = 200,
    renderStart,
    envMap = THREE.ImageUtils.loadTextureCube([
        'assets/envMap/pos-x.png',
        'assets/envMap/neg-x.png',
        'assets/envMap/pos-y.png',
        'assets/envMap/neg-y.png',
        'assets/envMap/pos-z.png',
        'assets/envMap/neg-z.png'
    ]);

//var shader = glslify({
//    vertex: '../shaders/clipdepth/vert.glsl',
//    fragment: '../shaders/clipdepth/frag.glsl',
//    sourceOnly: true
//});
//
//console.log('shader:', shader);

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


    var ambientLight = new THREE.AmbientLight(0x444444);
    ambientLight.position.set(100, 130, 100);
    scene.add(lights['ambientLight'] = ambientLight);

    /*
     var inte = 0.3,
     pointLight1 = new THREE.PointLight(0xffffff, inte);
     pointLight1.position.set(100, 130, 100);
     pointLight1.position.multiplyScalar(50);
     scene.add(lights['pointLight1'] = pointLight1);

     var pointLight2 = new THREE.PointLight(0xffffff, inte);
     pointLight2.position.set(-100, 130, 100);
     pointLight2.position.multiplyScalar(50);
     scene.add(lights['pointLight2'] = pointLight2);

     var pointLight3 = new THREE.PointLight(0xffffff, inte);
     pointLight3.position.set(100, 0, 100);
     pointLight3.position.multiplyScalar(50);
     scene.add(lights['pointLight3'] = pointLight3);

     var pointLight5 = new THREE.PointLight(0xffffff, inte);
     pointLight5.position.set(-100, 0, 100);
     pointLight5.position.multiplyScalar(50);
     scene.add(lights['pointLight5'] = pointLight5);

     */


//    var light1 = new THREE.DirectionalLight(0xffffff, 1);
    var light1 = new THREE.SpotLight(0xffffff, 1);
//    directionalLight.onlyShadow = true;
    light1.position.x = controls.light1.x;
    light1.position.z = controls.light1.z;
    light1.position.y = controls.light1.y;
    light1.castShadow = true;
    light1.shadowBias = 0.0001;
    light1.shadowDarkness = 0.1;
    light1.shadowMapWidth = 2048;
    light1.shadowMapHeight = 2048;
    scene.add(lights['light1'] = light1);

    var light2 = new THREE.SpotLight(0xffffff, 0.5);
//    directionalLight.onlyShadow = true;
    light2.position.x = -500;
    light2.position.z = 300;
    light2.position.y = 800;
    light2.castShadow = true;
    light2.shadowBias = 0.0001;
    light2.shadowDarkness = 0.01;
    light2.shadowMapWidth = 2048;
    light2.shadowMapHeight = 2048;
    scene.add(lights['light2'] = light2);

}

function setupEnvironment(scene) {
    // FLOOR
    var floorMaterial = new THREE.MeshBasicMaterial({ /*map: floorTexture,*/
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

function makeShaderMaterial(normal, diffuse, specular) {
    var shininess = 0.5,
        shader = THREE.ShaderLib[ "normalmap" ],
        uniforms = THREE.UniformsUtils.clone(shader.uniforms);

    uniforms[ "enableDisplacement" ].value = false;
    uniforms[ "shininess" ].value = shininess;
//        uniforms[ "uNormalScale" ].value.y = -1;

    if (normal) uniforms[ "tNormal" ].value = THREE.ImageUtils.loadTexture(normal, null, render);

    if (diffuse) {
        uniforms[ "enableDiffuse" ].value = true;
        uniforms[ 'tDiffuse'].value = THREE.ImageUtils.loadTexture(diffuse, null, render);
    }

    if (specular) {
        uniforms[ "enableSpecular" ].value = true;
        uniforms[ 'tSpecular'].value = THREE.ImageUtils.loadTexture(specular, null, render);
    }


//            uniforms[ "tDisplacement" ].value = THREE.ImageUtils.loadTexture("models/obj/sweater/BDM_201404_0006_0005_DISP.png");
////            uniforms[ "uDisplacementBias" ].value = -0.1; //- 0.428408;;
////            uniforms[ "uDisplacementScale" ].value = 0.5;
//            uniforms[ "uDisplacementBias" ].value = - 0.428408;
//            uniforms[ "uDisplacementScale" ].value = 2.436143;

    return  new THREE.ShaderMaterial({
        fragmentShader: shader.fragmentShader,
        vertexShader: shader.vertexShader,
        uniforms: uniforms,
        lights: true,
        fog: false,
        side: THREE.DoubleSide
    });
}

function loadDummyModel(scene) {
    var loader = new THREE.OBJLoader(loadingManager),
        matWithCubeMap = new THREE.MeshPhongMaterial({
            color: 0x000000,
            shininess: 100,
            reflectivity: 0.6,
            envMap: envMap,
            shading: THREE.SmoothShading
        });

    loader.load('assets/models/obj/dummy/DummyLP.OBJ', function (dummy) {
//    loader.load('assets/models/obj/lenin/lenin.obj', function (dummy) {

        dummy.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = matWithCubeMap;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(models['dummy'] = dummy);

    });
}

function loadModel(name, cb) {
    var basePath = "assets/models/obj/" + name + "/",
        objPath = basePath + name + ".obj",
        normalPath = basePath + name + "_normal.jpg",
        diffusePath = basePath + name + "_diffuse.jpg",
        shaderMaterial = makeShaderMaterial(
            normalPath,
            diffusePath
        );

    objLoader.load(objPath, function (model) {

        model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
//                    child.geometry.computeVertexNormals(true);
//                    child.geometry.computeFaceNormals(true);
                child.geometry.computeVertexNormals(true);
                child.geometry.computeTangents();
                child.material = shaderMaterial;
                child.material.needsUpdate = true;
//                    child.material.needsUpdate = true;
//                    child.geometry.buffersNeedUpdate = true;
//                    child.geometry.uvsNeedUpdate = true;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        model.name = name;
        model.position.set(0, 0, 0);
        cb(model);
    });
}

function loadModelWithMTL(name, cb) {
    var basePath = "assets/models/obj/" + name + "/",
        objPath = basePath + name + ".obj",
        mtlPath = basePath + name + ".mtl",
        normalPath = basePath + name + "_normal.jpg",
        diffusePath = basePath + name + "_diffuse.jpg",
        loader = new THREE.OBJMTLLoader(loadingManager),
        shaderMaterial = makeShaderMaterial(
            normalPath,
            diffusePath
        );

    loader.load(objPath, mtlPath, function (model) {

        model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.computeTangents();
                child.material = shaderMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        var scale = 0.1023;
        model.scale.set(scale, scale, scale);
        model.position.set(0, 0, 0);
        cb(model);
    });
}

function initControls() {
    var Ctrl = require("./controls").init();
    controls = Ctrl.controls;

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
        postprocessing.bokeh.uniforms[ "focus" ].value = controls.focus;
        postprocessing.bokeh.uniforms[ "aperture" ].value = controls.aperture;
        postprocessing.bokeh.uniforms[ "maxblur" ].value = controls.maxblur;
        startRender();
    }

    Ctrl.onChange('dummy.color', function (value) {
        var newColor = '0x' + value.substring(1, value.length);
        console.log('dummy.color changed:', value, newColor, models['dummy']);
        models['dummy'].children[0].material.color.setHex(newColor);
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

function initPostprocessing() {
    var renderPass = new THREE.RenderPass(scene, camera),
        bokehPass = new THREE.BokehPass(scene, camera, {
            focus: 1.0,
            aperture: 0.025,
            maxblur: 1.0,

            width: screenWidthDPR,
            height: screenHeightDPR
        }),
        FXAA = new THREE.ShaderPass(THREE.FXAAShader),
        composer = new THREE.EffectComposer(renderer);

    // FXAA
    FXAA.uniforms[ 'resolution' ].value.set(1 / screenHeightDPR, 1 / screenHeightDPR);
    FXAA.renderToScreen = true;

    bokehPass.renderToScreen = true;

    composer.addPass(renderPass);
    composer.addPass(bokehPass);
//    composer.addPass(FXAA);

    postprocessing.composer = composer;
    postprocessing.bokeh = bokehPass;
    postprocessing.fxaa = FXAA;

}

function init() {
    THREE.ImageUtils.crossOrigin = "anonymous";
    initControls();

    loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = function (item, loaded, total) {
        console.log('loading manager:', item, loaded, total);
        if (total > 1 && loaded === total) {
//            controls.rotate = true;
        }
        renderStart = Date.now();
    };
    objLoader = new THREE.OBJLoader(loadingManager);

    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false
    });
    renderer.setClearColor(0xffffff);
    renderer.autoClear = true;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
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
    initPostprocessing();
//    renderer.autoClear = false;

    setupLight(scene);
    setupEnvironment(scene);
    loadDummyModel(scene);
    loadModel(controls.garment = global.Dressformer.garment.id, function (model) {
        models['garment'] = model;
        scene.add(model);
        render();
    });

    container = global.document.getElementById('viewport');
    container.appendChild(renderer.domElement);

    orbitControl = new THREE.OrbitControls(camera, container);
    orbitControl.noPan = true;
    orbitControl.noKeys = true;
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

    if (stats) stats.update();

    orbitControl.update();

    TWEEN.update(dt);

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
    screenWidth = global.innerWidth;
    screenHeight = global.innerHeight;
    camera.aspect = screenWidth / screenHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(screenWidth, screenHeight, true);
    postprocessing.composer.setSize(screenWidthDPR, screenHeightDPR);
    startRender();
}


module.exports = {
    ee: ee,
    init: function () {
        init();
        render();
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
            fn = TWEEN.Easing.Cubic.InOut;
        var tween = new TWEEN.Tween({angle: models['dummy'].rotation.y, target: orbitControl.target.y})
            .to({angle: 0, target: orbitControl.target0.y}, speed)
            .easing(fn)
            .onUpdate(function () {
                rotateTo(this.angle);
                orbitControl.target.y = this.target;
            })
            .start();
        var tween2 = new TWEEN.Tween(orbitControl.object.position)
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