/**
 * Created by Miha-ha on 01.08.14.
 */
//WebGL
var THREE = global.THREE = require('threejs/build/three.min'),
    glslify = require('glslify');

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
    screenWidthDPR = screenWidth*DPR,
    screenHeightDPR = screenHeight*DPR,
    container, stats, loadingManager, objLoader,
    camera, scene, renderer,
    postprocessing = {},
    lights = {},
    models = {},
    controls,
    orbitControl,
    renderStart,
    cubemap = THREE.ImageUtils.loadTextureCube([
        'assets/cubemap/pos-x.png',
        'assets/cubemap/neg-x.png',
        'assets/cubemap/pos-y.png',
        'assets/cubemap/neg-y.png',
        'assets/cubemap/pos-z.png',
        'assets/cubemap/neg-z.png'
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


    var dirLight1 = new THREE.DirectionalLight(0xffffff, 1);
//    directionalLight.onlyShadow = true;
    dirLight1.position.x = controls.light1.x;
    dirLight1.position.z = controls.light1.z;
    dirLight1.position.y = controls.light1.y;
    dirLight1.castShadow = true;
    dirLight1.shadowBias = 0.0001;
    dirLight1.shadowDarkness = 0.1;
    dirLight1.shadowMapWidth = 2048;
    dirLight1.shadowMapHeight = 2048;
    scene.add(lights['directionalLight'] = dirLight1);

    var directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
//    directionalLight.onlyShadow = true;
    directionalLight2.position.x = -500;
    directionalLight2.position.z = 300;
    directionalLight2.position.y = 800;
    directionalLight2.castShadow = true;
    directionalLight2.shadowBias = 0.0001;
    directionalLight2.shadowDarkness = 0.01;
    directionalLight2.shadowMapWidth = 2048;
    directionalLight2.shadowMapHeight = 2048;
    scene.add(lights['directionalLight2'] = directionalLight2);

//        var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
//        dirLight.color.setHSL( 0.1, 1, 0.95 );
//        dirLight.position.set( -1, 1.75, 1 );
//        dirLight.position.multiplyScalar( 50 );
//        scene.add(lights['directionalLight'] = dirLight );
//
//        dirLight.castShadow = true;
//
//        dirLight.shadowMapWidth = 2048;
//        dirLight.shadowMapHeight = 2048;
//
//        var d = 300;
//
////        dirLight.shadowCameraLeft = -d;
////        dirLight.shadowCameraRight = d;
////        dirLight.shadowCameraTop = d;
////        dirLight.shadowCameraBottom = -d;
//
////        dirLight.shadowCameraFar = 3500;
//        dirLight.shadowBias = -0.0001;
//        dirLight.shadowDarkness = 0.35;
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
            reflectivity: 0.7,
            envMap: cubemap,
            shading: THREE.SmoothShading
        });

    loader.load('assets/models/obj/dummy/DummyLP.OBJ', function (dummy) {

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

function loadModelFromWeb(name, cb) {
//        assets/df-models/garment/APT_201307_0045_0001
    //http://test.webgl.dressformer.com/assets/df-models/garment/APT_201307_0045_0001_diffuse_01.png

    var basePath = "http://test.webgl.dressformer.com/assets/df-models/garment/",
//            objPath = basePath + name + ".obj",
        objPath = basePath + "KPL_201307_0125_0005_M_v1401430780137.obj",
//            mtlPath = basePath + name + ".mtl",
//            normalPath = basePath  + name +"_normal.jpg",
//            diffusePath = basePath + name + "_diffuse_01.jpg",
        diffusePath = basePath + "KPL_201307_0125_0005_M_diffuse_0_v1401430780137.png",
        loader = new THREE.OBJLoader(loadingManager),
        shaderMaterial = makeShaderMaterial(
            null,
            diffusePath
        );

    loader.load(objPath, function (model) {

        model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.computeVertexNormals(true);
                child.geometry.computeTangents();
                child.material = shaderMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
//            var scale = 0.1023;
//            model.scale.set(scale, scale, scale);
        model.position.set(0, 0, 0);
        cb(model);
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

function loadSweaterModel(scene) {
    var loader = new THREE.OBJMTLLoader(loadingManager),
        shaderMaterial = makeShaderMaterial(
            "assets/models/obj/sweater/BDM_201404_0006_0005_NORMAL.png",
            "assets/models/obj/sweater/BDM_201404_0006_0005_diffuse.png",
            "assets/models/obj/sweater/BDM_201404_0006_0005_SPECULAR.png"
        );

    loader.load('assets/models/obj/sweater/BDM_201404_0006_0005.obj', 'assets/models/obj/sweater/BDM_201404_0006_0005.mtl', function (sweater) {

        sweater.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.computeTangents();
                child.material = shaderMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        scene.add(models['sweater'] = sweater);
    });
}

function loadPantsModel(scene) {

    var loader = new THREE.OBJLoader(loadingManager),
        shaderMaterial = makeShaderMaterial(
            "assets/models/obj/pants/KPL_201407_0010_0008_normal.jpg",
            "assets/models/obj/pants/KPL_201407_0010_0008_diffuse.jpg"
        );

    loader.load('assets/models/obj/pants/KPL_201407_0010_0008.obj', function (pants) {
        console.log('pants:', pants);

        pants.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
//                    child.geometry.computeTangents();
//                    child.material = shaderMaterial;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        var scale = 0.04;
        pants.scale.set(scale, scale, scale);
//            pants.position.set(0,0,0);
        scene.add(models['pants'] = pants);

    });
}

function loadModels(scene) {
    var jsonLoader = new THREE.JSONLoader(),
        cubemap = THREE.ImageUtils.loadTextureCube([
            'assets/cubemap/pos-x.png',
            'assets/cubemap/neg-x.png',
            'assets/cubemap/pos-y.png',
            'assets/cubemap/neg-y.png',
            'assets/cubemap/pos-z.png',
            'assets/cubemap/neg-z.png'
        ]),
        sweaterMat = makeShaderMaterial(
            "assets/models/json/dress/normal.png",
            "assets/models/json/dress/diffuse.png",
            "assets/models/json/dress/spec.png"
        );
    cubemap.format = THREE.RGBFormat;

    jsonLoader.load("assets/models/json/dummy.js", function (geom, mats) {
        var matWithCubeMap = new THREE.MeshPhongMaterial({
                color: 0x000000,
                shininess: 200,
                envMap: cubemap
            }),
            mat = new THREE.MeshPhongMaterial({
                color: 0x000000,
                ambient: 0x000000, // should generally match color
                specular: 0x050505,
                shininess: 200

            }),
            dummy = new THREE.Mesh(geom, matWithCubeMap);

        dummy.castShadow = true;
        dummy.receiveShadow = true;

        scene.add(models['dummy'] = dummy);
    });

    jsonLoader.load("assets/models/json/dress/dress.js", function (geom, mats) {
        var dress = new THREE.Mesh(geom, sweaterMat);

        geom.computeTangents();

//            dress.position = mesh_pos;
        dress.castShadow = true;
        dress.receiveShadow = true;

        scene.add(dress);
    });
}

function initControls() {
    var Ctrl = require("./controls").init();
    controls = Ctrl.controls;

    function shadowEnable(light, flag) {
        console.log('shadow enable:', flag);
        if (flag) {
            renderer.shadowMapAutoUpdate = true;
        } else {
            renderer.shadowMapAutoUpdate = false;
            renderer.clearTarget(light.shadowMap);
        }
    }

    function light1Changed() {
        var light1 = lights['directionalLight'];
        light1.visible = controls.light1.enable;
        light1.position.x = controls.light1.x;
        light1.position.y = controls.light1.y;
        light1.position.z = controls.light1.z;
        light1.shadowBias = controls.light1.bias;
        light1.shadowDarkness = controls.light1.darkness;

        if (!light1.visible){
            shadowEnable(light1, false);
        }else {
            shadowEnable(light1, controls.light1.shadow);
        }

    }

    Ctrl.onChange('light1.enable', light1Changed);
    Ctrl.onChange('light1.x', light1Changed);
    Ctrl.onChange('light1.y', light1Changed);
    Ctrl.onChange('light1.z', light1Changed);
    Ctrl.onChange('light1.shadow', light1Changed);
    Ctrl.onChange('light1.bias', light1Changed);
    Ctrl.onChange('light1.darkness', light1Changed);


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

    function dofChanged(){
        postprocessing.bokeh.enabled = controls.dof;
        renderer.autoClear = !controls.dof;
        postprocessing.bokeh.uniforms[ "focus" ].value = controls.focus;
        postprocessing.bokeh.uniforms[ "aperture" ].value = controls.aperture;
        postprocessing.bokeh.uniforms[ "maxblur" ].value = controls.maxblur;
        startRender();
    }

    Ctrl.onChange('dof', dofChanged);
    Ctrl.onChange('focus', dofChanged);
    Ctrl.onChange('aperture', dofChanged);
    Ctrl.onChange('maxblur', dofChanged);

    Ctrl.onChangeAll(function(){
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
        FXAA = new THREE.ShaderPass( THREE.FXAAShader),
        composer = new THREE.EffectComposer(renderer);

    // FXAA
    FXAA.uniforms[ 'resolution' ].value.set( 1 / screenHeightDPR, 1 / screenHeightDPR );
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
        antialias: false,
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
    renderer.autoClear = false;

    setupLight(scene);
    setupEnvironment(scene);
    loadDummyModel(scene);
    loadModel(controls.garment, function (model) {
        models['garment'] = model;
        scene.add(model);
        render();
    });


    orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControl.target.y = 100;
//    orbitControl.autoRotate = true;
    orbitControl.minPolarAngle = Math.PI / 6; // radians
    orbitControl.maxPolarAngle = Math.PI / 1.6; // radians
    orbitControl.addEventListener('change', function () {
        renderStart = Date.now();
    });
    orbitControl.update();

    container = global.document.getElementById('container');
    container.appendChild(renderer.domElement);

    showStats(container);

    global.addEventListener('resize', onWindowResize, false);
    onWindowResize();
    update();
}

function update() {
    if (Date.now() - renderStart < 700) {
        render();
    }

    //rotate models
    if (controls && controls.rotate) {
        models['dummy'].rotation.y += controls.speed;
        models['garment'].rotation.y += controls.speed;
        renderStart = Date.now();
    }

//    orbitControl.update();
    if (stats) stats.update();

    requestAnimationFrame(update);
}

function render() {
    postprocessing.composer.render(0.1);
    renderer.render(scene, camera);
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
    postprocessing.composer.setSize( screenWidthDPR, screenHeightDPR);
    startRender();
}


module.exports = {
    init: function () {
        init();
//            update();
        render();
        return this;
    }
};