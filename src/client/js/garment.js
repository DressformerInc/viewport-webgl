/**
 * Created by Miha-ha on 28.09.14.
 */


var Garment = module.exports = function (config, mediator) {
    this.merge(config);
    this.mediator = mediator;
    this.model = null;
    this.wrap = global.THREE.RepeatWrapping;
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
    var material = {},
        materials = this.materials || [],
        space = /\s+/,
        params = {
            name: name,
            side: global.THREE.DoubleSide
        },
        url = this.url_prefix;

    function parseOptions(str) {
        if (!str) return;
        var options = null,
            isParam = false,
            param = '',
            value = '',
            values = [];

        //нормализую пробелы и добавляю два заключающих шага
        str = str.replace(/\s+/g, ' ') + ' -';

        for (var i = 0, l = str.length; i < l; ++i) {
            var ch = str[i];
            //debugger;
            switch (ch) {
                case ' ':
                    if (!isParam && value) {
                        values.push(+value);
                        value = '';
                    }

                    isParam = false;

                    break;
                case '-':
                    if (param) {
                        options = options || {};
                        options[param] = values;
                        isParam = false;
                        values = [];
                    }

                    isParam = true;
                    param = '';
                    break;
                default :
                    if (isParam) {
                        param += ch;
                    } else {
                        value += ch;
                    }
                    break;
            }
        }

        return options;
    }

    function applyOptions(texture, options) {
        if (!options) return;

        for (var o in options) {
            if (options.hasOwnProperty(o)){
                var value = options[o];
                switch(o){
                    /*
                     The -s option scales the size of the texture pattern on the textured
                     surface by expanding or shrinking the pattern.  The default is 1, 1, 1.
                     */
                    case 's':
                        value.length >1 && texture.repeat.set(1/value[0], 1/value[1]);
                        break;
                }
            }
        }

        console.log('texture:', texture,'options:', options);
    }

    //find material source
    for (var i = 0, l = materials.length; i < l; ++i) {
        if (materials[i].name === name) {
            material = materials[i];
            break;
        }
    }

    for (var prop in material) {
        if (material.hasOwnProperty(prop)) {
            var value = material[prop],
                c,
                options;

            console.log('material:', material.name, 'property:', prop, 'value:', value);

            switch (prop.toLowerCase()) {

                // Ns is material specular exponent
                case 'kd':
                    c = value.split(space);
                    // Diffuse color (color under white light) using RGB values
                    params['color'] = new THREE.Color(+c[0], +c[1], +c[2]);
                    break;

                case 'ka':
                    c = value.split(space);
                    // Ambient color (color under shadow) using RGB values
                    params['ambient'] = new THREE.Color(+c[0], +c[1], +c[2]);
                    break;

                case 'ks':
                    c = value.split(space);
                    // Specular color (color when light is reflected from shiny surface) using RGB values
                    params['specular'] = new THREE.Color(+c[0], +c[1], +c[2]);
                    break;

                case 'map_kd':
                    // Diffuse texture map

                    params['map'] = this.loadTexture(url + value.id);
                    params['map'].wrapS = this.wrap;
                    params['map'].wrapT = this.wrap;
                    //options
                    applyOptions(params['map'], parseOptions(value.options));

                    break;

                case 'map_bump':
                case 'bump':

                    params['normalMap'] = this.loadTexture(url + value.id);
                    params['normalMap'].wrapS = this.wrap;
                    params['normalMap'].wrapT = this.wrap;
//                    params['normalScale'] = params['-bm'];
                    //options
                    applyOptions(params['normalMap'], parseOptions(value.options));

                    break;

                case 'map_Ns':
                    params['specularMap'] = this.loadTexture(url + value.id);
                    params['specularMap'].wrapS = this.wrap;
                    params['specularMap'].wrapT = this.wrap;
                    //options
                    applyOptions(params['specularMap'], parseOptions(value.options));

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
        objUrl = this.url_prefix + this.assets.geometry.id,
//        objUrl = '//v2.dressformer.com/assets/v2/'+this.assets.geometry.id,
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
        var materials = [];
        model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.computeVertexNormals(true);
//                child.geometry.computeTangents();
                child.material = me.createMaterial(child.material.name);
                child.material.needsUpdate = true;
                console.log('mtl material:', child.material, 'name:' + child.material.name);

                child.castShadow = true;
                child.receiveShadow = true;

                materials.push(child.material);
            }
        });
        model.name = this.name;
        model.position.set(0, 0, 0);
        model.castShadow = true;
        model.reciveShadow = true;

        //hack
        window.parent && window.parent.postMessage({method: 'Materials', params: materials}, '*');

        cb(me, model);
    });


};