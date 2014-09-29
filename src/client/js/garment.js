/**
 * Created by Miha-ha on 28.09.14.
 */


var Garment = module.exports = function (config) {
    this.merge(config);
    this.model = null;
};

require('./mix/merge')(Garment);

Garment.prototype.load = function (params, cb) {
    var me = this,
        objUrl = this.assets.geometry.url,
        objMtlLoader = new global.THREE.OBJMTLLoader();

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

    var callback = function (model) {
        model.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.geometry.computeVertexNormals(true);
                child.geometry.computeTangents();
                //child.material = material;
                child.material.needsUpdate = true;
                console.log('mtl material:', child.material, 'update:' + child.material.needsUpdate);

                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        model.name = this.name;
        model.position.set(0, 0, 0);

        me.model = model;
        cb.call(me, model);
    };


    objMtlLoader.load({
        objUrl: objUrl,
        mtlUrl: this.assets.mtl.url,
        assets: this.assets,
        side: THREE.DoubleSide
    }, callback);


};