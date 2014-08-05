/**
 * Created by Miha-ha on 01.08.14.
 */
//WebGL
(function (M, window, document) {
    //private
    var container, stats, loadingManager,
        camera, scene, renderer,
        lights = {},
        models = {},
        loader,
        controls,
        orbitControl,
        floorModel,
        dummyModel;

    function showStats(container) {
        // STATS
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

        var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.x = -100;
        directionalLight.position.y = 150;
        directionalLight.castShadow = true;
        directionalLight.shadowBias = 0.0001;
        directionalLight.shadowDarkness = 0.07;
        directionalLight.shadowMapWidth = 2048;
        directionalLight.shadowMapHeight = 2048;
        scene.add(lights['directionalLight'] = directionalLight);

    }

    function setupEnvironment(scene) {
        // FLOOR
//        var floorTexture = new THREE.ImageUtils.loadTexture('textures/checkerboard.jpg');
//        floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
//        floorTexture.repeat.set(10, 10);
        var floorMaterial = new THREE.MeshBasicMaterial({ /*map: floorTexture,*/
                color: 0xFFFFFF,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.2
            }),
            floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10),
            floor = new THREE.Mesh(floorGeometry, floorMaterial);

        floor.position.y = 0;
        floor.rotation.x = Math.PI / 2;
        floor.receiveShadow = true;
        scene.add(floorModel = floor);

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

//        uniforms[ "tDisplacement" ].value = THREE.ImageUtils.loadTexture("models/dress/disp.png");
//        uniforms[ "uDisplacementBias" ].value = -0.1; //- 0.428408;;
//        uniforms[ "uDisplacementScale" ].value = 0.5;
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


        var parameters = {
            fragmentShader: shader.fragmentShader,
            vertexShader: shader.vertexShader,
            uniforms: uniforms,
            lights: true,
            fog: false,
            side: THREE.DoubleSide
        };
        var material1 = new THREE.ShaderMaterial(parameters);
        return material1

    }

    function loadDummyModel() {
        var loader = new THREE.OBJLoader(loadingManager),
            cubemap = THREE.ImageUtils.loadTextureCube([
                'src/assets/cubemap/pos-x.png',
                'src/assets/cubemap/neg-x.png',
                'src/assets/cubemap/pos-y.png',
                'src/assets/cubemap/neg-y.png',
                'src/assets/cubemap/pos-z.png',
                'src/assets/cubemap/neg-z.png'
            ]),
            matWithCubeMap = new THREE.MeshPhongMaterial({
                color: 0x000000,
                shininess: 200,
                envMap: cubemap
            });

        loader.load('models/obj/dummy/DummyLP.obj', function (dummy) {

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

    function loadSweaterModel() {
        function makeSweaterMaterial() {
            var shininess = 1,
                shader = THREE.ShaderLib[ "normalmap" ],
                uniforms = THREE.UniformsUtils.clone(shader.uniforms);

            uniforms[ "enableDisplacement" ].value = false;
            uniforms[ "enableDiffuse" ].value = true;
            uniforms[ "enableSpecular" ].value = true;

            uniforms[ "tNormal" ].value = THREE.ImageUtils.loadTexture("models/obj/sweater/BDM_201404_0006_0005_NORMAL.png");

//        uniforms[ "tDisplacement" ].value = THREE.ImageUtils.loadTexture("models/dress/disp.png");
//        uniforms[ "uDisplacementBias" ].value = -0.1; //- 0.428408;;
//        uniforms[ "uDisplacementScale" ].value = 0.5;
            //uniforms[ "uDisplacementBias" ].value = - 0.428408;
            //uniforms[ "uDisplacementScale" ].value = 2.436143;

            uniforms[ 'tDiffuse'].value = THREE.ImageUtils.loadTexture("models/obj/sweater/BDM_201404_0006_0005_diffuse.png");
            uniforms[ 'tSpecular'].value = THREE.ImageUtils.loadTexture("models/obj/sweater/BDM_201404_0006_0005_SPECULAR.png");

            uniforms[ "shininess" ].value = shininess;

            return  new THREE.ShaderMaterial({
                fragmentShader: shader.fragmentShader,
                vertexShader: shader.vertexShader,
                uniforms: uniforms,
                lights: true,
                fog: false,
                side: THREE.DoubleSide
            });
        }

        var shaderMaterial = makeSweaterMaterial();

        loader.load('models/obj/sweater/BDM_201404_0006_0005.obj', function (sweater) {

            sweater.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material = shaderMaterial;
                    child.castShadow = true;
                    child.receiveShadow = true;

                }
            });

            scene.add(models['sweater'] = sweater);

        });
    }

    function loadModels(scene) {
        /*
         // material parameters

         var ambient = 0x111111, diffuse = 0xbbbbbb, specular = 0x060606, shininess = 35;

         var shader = THREE.ShaderLib[ "normalmap" ];
         var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

         uniforms[ "tNormal" ].value = THREE.ImageUtils.loadTexture( "obj/leeperrysmith/Infinite-Level_02_Tangent_SmoothUV.jpg" );
         uniforms[ "uNormalScale" ].value.set( 0.8, 0.8 );

         uniforms[ "tDiffuse" ].value = THREE.ImageUtils.loadTexture( "obj/leeperrysmith/Map-COL.jpg" );
         uniforms[ "tSpecular" ].value = THREE.ImageUtils.loadTexture( "obj/leeperrysmith/Map-SPEC.jpg" );

         uniforms[ "enableAO" ].value = false;
         uniforms[ "enableDiffuse" ].value = true;
         uniforms[ "enableSpecular" ].value = true;

         uniforms[ "diffuse" ].value.setHex( diffuse );
         uniforms[ "specular" ].value.setHex( specular );
         uniforms[ "ambient" ].value.setHex( ambient );

         uniforms[ "shininess" ].value = shininess;

         uniforms[ "wrapRGB" ].value.set( 0.575, 0.5, 0.5 );

         var parameters = { fragmentShader: shader.fragmentShader, vertexShader: shader.vertexShader, uniforms: uniforms, lights: true };
         var material = new THREE.ShaderMaterial( parameters );

         material.wrapAround = true;

         */
        var jsonLoader = new THREE.JSONLoader(),
            cubemap = THREE.ImageUtils.loadTextureCube([
                'src/assets/cubemap/pos-x.png',
                'src/assets/cubemap/neg-x.png',
                'src/assets/cubemap/pos-y.png',
                'src/assets/cubemap/neg-y.png',
                'src/assets/cubemap/pos-z.png',
                'src/assets/cubemap/neg-z.png'
            ]);

        cubemap.format = THREE.RGBFormat;

        jsonLoader.load("models/json/dummy.js", function (geom, mats) {
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

            scene.add(dummyModel = dummy);
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

    function initControls() {
        controls = M.modules.Controls.controls;
        M.modules.Controls.onChange('shadow', function (value) {
            console.log('shadow change from event:', value);
            if (value) {
                renderer.shadowMapAutoUpdate = true;
            } else {
                renderer.shadowMapAutoUpdate = false;
                renderer.clearTarget(lights['directionalLight'].shadowMap);
            }
        });

    }

    function updateControls() {

        lights['directionalLight'].shadowBias = controls.bias;
        lights['directionalLight'].shadowDarkness = controls.darkness;

    }

    function init() {
        initControls();

        loadingManager = new THREE.LoadingManager();
        loadingManager.onProgress = function (item, loaded, total) {
            console.log('loading manager:', item, loaded, total);
        };

        loader = new THREE.OBJLoader(loadingManager);

        renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.shadowMapEnabled = true;

        camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 100000);
        camera.position.y = 100;
        camera.position.z = 320;

        scene = new THREE.Scene();

        setupLight(scene);
        setupEnvironment(scene);
//        loadModels(scene);
        loadDummyModel();
        loadSweaterModel();

        orbitControl = new THREE.OrbitControls(camera, renderer.domElement);
        orbitControl.target.y = 100;

        container = document.getElementById('container');
        container.appendChild(renderer.domElement);

        showStats(container);

        window.addEventListener('resize', onWindowResize, false);
        onWindowResize();
    }

    function update() {
        requestAnimationFrame(update);
        render();
        if (stats) stats.update();
    }

    function render() {

        //controls
        updateControls();

        //rotate models
        scene.traverse(function (e) {
            if (e instanceof THREE.Mesh && e != floorModel) {
                e.rotation.y += 0.02;
            }
        });

        renderer.render(scene, camera);
    }

    function onWindowResize() {

        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();


        renderer.setSize(window.innerWidth, window.innerHeight);

    }

    //public
    return M.modules.WebGL = {
        init: function () {
            init();
            update();
        }
    }
}(Main || {}, window, window.document));