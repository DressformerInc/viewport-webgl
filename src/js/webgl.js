/**
 * Created by Miha-ha on 01.08.14.
 */
//WebGL
(function (Main, window, document) {
    //private
    var container, stats,
        camera, scene, renderer;

    function showStats(container) {
        // STATS
        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.bottom = '0px';
        stats.domElement.style.zIndex = 100;
        container.appendChild(stats.domElement);
    }

    function setupLight(scene) {
        var light1 = new THREE.AmbientLight(0x444444);
        light1.position.set(100, 130, 100);
//        light.castShadow = true;
        scene.add(light1);

        var inte = 0.3
        var light2 = new THREE.PointLight(0xffffff, inte);
        light2.position.set(100, 130, 100);
        light2.position.multiplyScalar(50);
//        light.castShadow = true;
        scene.add(light2);

        var light3 = new THREE.PointLight(0xffffff, inte);
        light3.position.set(-100, 130, 100);
        light3.position.multiplyScalar(50);
        scene.add(light3);

        var light4 = new THREE.PointLight(0xffffff, inte);
//        light.castShadow = true;
        light4.position.set(100, 0, 100);
        light4.position.multiplyScalar(50);
        scene.add(light4);

        var light5 = new THREE.PointLight(0xffffff, inte);
//        light.castShadow = true;
        light5.position.set(-100, 0, 100);
        light5.position.multiplyScalar(50);
        scene.add(light5);

        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.x = -100;
        directionalLight.position.y = 150;
        directionalLight.castShadow = true;
        directionalLight.shadowBias = 0.0001;
        directionalLight.shadowDarkness = 0.07;
        directionalLight.shadowMapWidth = 2048;
        directionalLight.shadowMapHeight = 2048;
        scene.add(directionalLight);

    }

    function setupEnvironment(scene) {
        // FLOOR
//        var floorTexture = new THREE.ImageUtils.loadTexture('textures/checkerboard.jpg');
//        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
//        floorTexture.repeat.set(10, 10);
        var floorMaterial = new THREE.MeshBasicMaterial({ /*map: floorTexture,*/
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.5 }),
            floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10),
            floor = new THREE.Mesh(floorGeometry, floorMaterial);

        floor.position.y = 0;
        floor.rotation.x = Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floor);

        // SKYBOX/FOG
        var skyBoxGeometry = new THREE.BoxGeometry(100000, 100000, 100000),
            skyBoxMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.BackSide }),
            skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
        scene.add(skyBox);
//        scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

    }

    function makeSMaterial(lambr) {

        // console.log(lambr);
        var ambient = new THREE.Color(0.7740, 0.3122, 0.5514),
            diffuse = new THREE.Color(0.8349, 0.3368, 0.5948),
            specular = new THREE.Color(0, 0, 0),
            shininess = 1,
            scale = 23;

        var shader = THREE.ShaderLib[ "normalmap" ];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);

        //uniforms[ "enableAO" ].value = false;
        //uniforms[ "enableReflection" ].value = false;
        uniforms[ "enableDisplacement" ].value = true;
        uniforms[ "enableDiffuse" ].value = true;
        uniforms[ "enableSpecular" ].value = true;


        uniforms[ "tNormal" ].value = THREE.ImageUtils.loadTexture("models/dress/normal.png");
        //uniforms[ "tAO" ].value = THREE.ImageUtils.loadTexture( "textures/normal/ninja/ao.jpg" );

        uniforms[ "tDisplacement" ].value = THREE.ImageUtils.loadTexture("models/dress/disp.png");
        uniforms[ "uDisplacementBias" ].value = -0.1; //- 0.428408;;
        uniforms[ "uDisplacementScale" ].value = 0.5;
        //uniforms[ "uDisplacementBias" ].value = - 0.428408;
        //uniforms[ "uDisplacementScale" ].value = 2.436143;

        uniforms[ 'tDiffuse'].value = THREE.ImageUtils.loadTexture("models/dress/diffuse.png");
        uniforms[ 'tSpecular'].value = THREE.ImageUtils.loadTexture("models/dress/spec.png");

        // uniforms[ "uNormalScale" ].value.y = 1;

        //uniforms[ "diffuse" ].value = diffuse ;
        //uniforms[ "specular" ].value = specular
        //uniforms[ "ambient" ].value = ambient ;

        uniforms[ "shininess" ].value = shininess;

        //uniforms[ "tCube" ].value = reflectionCube;
        //uniforms[ "reflectivity" ].value = 0.1;

        //uniforms[ "diffuse" ].value.convertGammaToLinear();
        //uniforms[ "specular" ].value.convertGammaToLinear();
        //uniforms[ "ambient" ].value.convertGammaToLinear();


        var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true, fog: false, side: THREE.DoubleSide, };
        var material1 = new THREE.ShaderMaterial(parameters);
        return material1

    }

    function loadModels(scene) {
        var jsonLoader = new THREE.JSONLoader()
        jsonLoader.load("models/dummy.js", function (geom, mats) {
            var mat = new THREE.MeshPhongMaterial({
                    color: 0x000000,
                    ambient: 0x000000, // should generally match color
                    specular: 0x050505,
                    shininess: 1000

                }),
                dummy = new THREE.Mesh(geom, mat);

            dummy.castShadow = true;
            dummy.receiveShadow = true;

            scene.add(dummy);
        });

        jsonLoader.load("models/dress.js", function (geom, mats) {
            var smat = makeSMaterial(mats[0]),
                dress = new THREE.Mesh(geom, smat);

            geom.computeTangents();

//            dress.position = mesh_pos;
            dress.castShadow = true;
            dress.receiveShadow = true;

            scene.add(dress);
        });
    }

    function init() {
        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100000);
        camera.position.y = 150;
        camera.position.x = 20;
        camera.position.z = 220;

        scene = new THREE.Scene();

        setupLight(scene);
        setupEnvironment(scene);
        loadModels(scene);

        //shadow
        renderer.shadowMapType = THREE.PCFSoftShadowMap;
        renderer.shadowMapEnabled = true;
        renderer.shadowMapSoft = true;

//        renderer.shadowCameraNear = 3;
//        renderer.shadowCameraFar = camera.far;
//        renderer.shadowCameraFov = 50;
//
//        renderer.shadowMapBias = 0.0001;
//        renderer.shadowMapDarkness = 0.01;
//        renderer.shadowMapWidth = 2048;
//        renderer.shadowMapHeight = 2048;


        onWindowResize();

        new THREE.OrbitControls(camera, renderer.domElement);

        container = document.getElementById('container');
        container.appendChild(renderer.domElement);

        showStats(container);
    }


    function animate() {

        requestAnimationFrame(animate);
        render();
        if (stats) stats.update();

    }

    function render() {

        var v = new THREE.Vector3(0, 100, 0);
        camera.lookAt(v);

        renderer.render(scene, camera);

    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();


        renderer.setSize(window.innerWidth, window.innerHeight);

    }


    //public
    return Main.modules.WebGL = {
        init: function () {
            console.log('webgl init');
            init();
            animate();
        }
    }
}(Main || {}, window, window.document));