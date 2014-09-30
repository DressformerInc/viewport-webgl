/**
 * Created by Miha-ha on 29.09.14.
 */
var glslify = require('glslify');

var Dummy = module.exports = function (config) {
    this.merge(config);
    this.initMaterial();
};

require('./mix/merge')(Dummy);

Dummy.prototype.initMaterial = function () {
    this.matcapShader = glslify({
        vertex: '../shaders/matcap/vert.glsl',
        fragment: '../shaders/matcap/frag.glsl',
        sourceOnly: true
    });

    this.matcaps = {
        'silver': THREE.ImageUtils.loadTexture('/img/matcaps/droplet_01.png'),
        'gold': THREE.ImageUtils.loadTexture('/img/matcaps/test_gold.jpg'),
        'carbon': THREE.ImageUtils.loadTexture('/img/matcaps/mydarkgreymetal.jpg'),
        'plastic': THREE.ImageUtils.loadTexture('/img/matcaps/SketchToyPlastic.png'),
        'skin1': THREE.ImageUtils.loadTexture('/img/matcaps/skin_matcap1.png'),
        'skin2': THREE.ImageUtils.loadTexture('/img/matcaps/skin_matcap2.png'),
        'skin3': THREE.ImageUtils.loadTexture('/img/matcaps/skin_matcap3.png'),
        'skin4': THREE.ImageUtils.loadTexture('/img/matcaps/skin_matcap4.png'),
        'skin5': THREE.ImageUtils.loadTexture('/img/matcaps/skin_matcap5.png')
    };
    this.currentMatcap = this.matcaps['carbon'];

    this.material = new THREE.ShaderMaterial({
        uniforms: {
            tMatCap: {
                type: 't',
                value: this.currentMatcap
            }
        },
        vertexShader: this.matcapShader.vertex,
        fragmentShader: this.matcapShader.fragment,
        shading: THREE.SmoothShading
    });

    this.material.uniforms.tMatCap.value.wrapS = this.material.uniforms.tMatCap.value.wrapT = THREE.ClampToEdgeWrapping;

};

Dummy.prototype.setMatcap = function (matcap) {
    this.currentMatcap = this.matcaps[matcap];
    this.material.uniforms.tMatCap.value = this.currentMatcap;
};

Dummy.prototype.load = function (params, loadingManager, cb) {
    var me = this,
        loader = new THREE.OBJLoader(loadingManager),
        url = this.assets.geometry.url;

    if (params && params.length > 0) {
        url += '?' + params.join('&');
    }

    loader.load(url, function (model) {
        model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = me.material;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        me.model = model;
        cb.call(me, model)
    });
};