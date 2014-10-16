/**
 * Created by Miha-ha on 28.09.14.
 */


var Garment = module.exports = function (config) {
    this.merge(config);
    this.model = null;
};

require('./mix/merge')(Garment);

Garment.prototype.loadTexture = function (url, mapping, onLoad, onError) {

    var texture = new THREE.Texture(),
        loader = new THREE.ImageLoader();

    loader.crossOrigin = '*';// this.crossOrigin;
    loader.load(url, function (image) {

        texture.image = THREE.MTLLoader.ensurePowerOfTwo_(image);
        texture.needsUpdate = true;

        if (onLoad) onLoad(texture);

    });

    texture.mapping = mapping;

    return texture;
};

Garment.prototype.createMaterial = function (name) {
    var material,
        space = /\s+/,
        params = {
            side: global.THREE.DoubleSide
        },
    //TODO: change to this.prefix_url
        url = '//v2.dressformer.com/assets/v2/';

    //find material source
    for(var i= 0, l=this.materials.length; i<l; ++i){
        if(this.materials[i].name === name){
            material = this.materials[i];
            break;
        }
    }

    for(var prop in material){
        if(material.hasOwnProperty(prop)){
            var value = material[prop];

            switch (prop.toLowerCase()) {

                // Ns is material specular exponent
                case 'kd':
                    // Diffuse color (color under white light) using RGB values
                    params['diffuse'] = new THREE.Color().fromArray(value.split(space));
                    break;

                case 'ka':
                    // Ambient color (color under shadow) using RGB values
                    params['ambient'] = new THREE.Color().fromArray(value.split(space));
                    break;

                case 'ks':
                    // Specular color (color when light is reflected from shiny surface) using RGB values
                    params['specular'] = new THREE.Color().fromArray(value.split(space));
                    break;

                case 'map_kd':
                    // Diffuse texture map

                    params['map'] = this.loadTexture(url+value.id);
                    params['map'].wrapS = this.wrap;
                    params['map'].wrapT = this.wrap;

                    break;

                case 'map_bump':
                case 'bump':

                    params['normalMap'] = this.loadTexture(url+value.id);
                    params['normalMap'].wrapS = this.wrap;
                    params['normalMap'].wrapT = this.wrap;
//                    params['normalScale'] = params['-bm'];

                    break;

                case 'map_Ns':
                    params['specularMap'] = this.loadTexture(url+value.id);
                    params['specularMap'].wrapS = this.wrap;
                    params['specularMap'].wrapT = this.wrap;
                    break;

                case 'ns':

                    // The specular exponent (defines the focus of the specular highlight)
                    // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

                    params['shininess'] = +value;

                    break;

                case 'd':

                    // According to MTL format (http://paulbourke.net/dataformats/mtl/):
                    //   d is dissolve for current material
                    //   factor of 1.0 is fully opaque, a factor of 0 is fully dissolved (completely transparent)

                    if (value < 1) {

                        params['transparent'] = true;
                        params['opacity'] = value;

                    }

                    break;

                default:
                    break;

            }
        }
    }

    return new THREE.MeshPhongMaterial(params);
};

Garment.prototype.load = function (params, loadingManager, cb) {
    var me = this,
//        objUrl = this.url_prefix+this.assets.geometry.id,
        objUrl = '//v2.dressformer.com/assets/v2/'+this.assets.geometry.id,
        objLoader = new global.THREE.OBJLoader(loadingManager);

    params = params || [];

    //параметры для библиотеки морфирования
    for (var param in global.Dressformer.params) {
        if (global.Dressformer.params.hasOwnProperty(param)) {
            params.push(param + '=' + global.Dressformer.params[param]);
        }
    }

    if (params && params.length > 0) {
        objUrl += '?' + params.join('&');
    }

    objLoader.load(objUrl, function (model) {
        model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.computeVertexNormals(true);
                child.geometry.computeTangents();
                child.material = me.createMaterial(child.material.name);
                child.material.needsUpdate = true;
//                console.log('mtl material:', child.material, 'update:' + child.material.needsUpdate);

                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        model.name = this.name;
        model.position.set(0, 0, 0);
        model.castShadow = true;
        model.reciveShadow = true;

        cb(me, model);
    });


};