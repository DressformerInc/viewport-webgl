/**
 * Created by Miha-ha on 01.08.14.
 */
//Utils
var THREE = require('threejs/build/three');


function initObjLoader() {
    /**
     * @author mrdoob / http://mrdoob.com/
     */

    THREE.OBJLoader = function (manager) {

        this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

    };

    THREE.OBJLoader.prototype = {

        constructor: THREE.OBJLoader,

        load: function (url, onLoad, onProgress, onError) {

            var scope = this;

            var loader = new THREE.XHRLoader(scope.manager);
            loader.setCrossOrigin(this.crossOrigin);
            loader.load(url, function (text) {

                onLoad(scope.parse(text));

            });

        },

        parse: function (text) {

            function vector(x, y, z) {

                return new THREE.Vector3(parseFloat(x), parseFloat(y), parseFloat(z));

            }

            function uv(u, v) {

                return new THREE.Vector2(parseFloat(u), parseFloat(v));

            }

            function face3(a, b, c, normals) {

                return new THREE.Face3(a, b, c, normals);

            }

            var object = new THREE.Object3D();
            var geometry, material, mesh;

            function parseVertexIndex(index) {

                index = parseInt(index);

                return index >= 0 ? index - 1 : index + vertices.length;

            }

            function parseNormalIndex(index) {

                index = parseInt(index);

                return index >= 0 ? index - 1 : index + normals.length;

            }

            function parseUVIndex(index) {

                index = parseInt(index);

                return index >= 0 ? index - 1 : index + uvs.length;

            }

            function add_face(a, b, c, normals_inds) {

                if (normals_inds === undefined) {

                    geometry.faces.push(face3(
                            vertices[ parseVertexIndex(a) ] - 1,
                            vertices[ parseVertexIndex(b) ] - 1,
                            vertices[ parseVertexIndex(c) ] - 1
                    ));

                } else {

                    geometry.faces.push(face3(
                            vertices[ parseVertexIndex(a) ] - 1,
                            vertices[ parseVertexIndex(b) ] - 1,
                            vertices[ parseVertexIndex(c) ] - 1,
                        [
                            normals[ parseNormalIndex(normals_inds[ 0 ]) ].clone(),
                            normals[ parseNormalIndex(normals_inds[ 1 ]) ].clone(),
                            normals[ parseNormalIndex(normals_inds[ 2 ]) ].clone()
                        ]
                    ));

                }

            }

            function add_uvs(a, b, c) {

                geometry.faceVertexUvs[ 0 ].push([
                    uvs[ parseUVIndex(a) ].clone(),
                    uvs[ parseUVIndex(b) ].clone(),
                    uvs[ parseUVIndex(c) ].clone()
                ]);

            }

            function handle_face_line(faces, uvs, normals_inds) {

                if (faces[ 3 ] === undefined) {

                    add_face(faces[ 0 ], faces[ 1 ], faces[ 2 ], normals_inds);

                    if (uvs !== undefined && uvs.length > 0) {

                        add_uvs(uvs[ 0 ], uvs[ 1 ], uvs[ 2 ]);

                    }

                } else {

                    if (normals_inds !== undefined && normals_inds.length > 0) {

                        add_face(faces[ 0 ], faces[ 1 ], faces[ 3 ], [ normals_inds[ 0 ], normals_inds[ 1 ], normals_inds[ 3 ] ]);
                        add_face(faces[ 1 ], faces[ 2 ], faces[ 3 ], [ normals_inds[ 1 ], normals_inds[ 2 ], normals_inds[ 3 ] ]);

                    } else {

                        add_face(faces[ 0 ], faces[ 1 ], faces[ 3 ]);
                        add_face(faces[ 1 ], faces[ 2 ], faces[ 3 ]);

                    }

                    if (uvs !== undefined && uvs.length > 0) {

                        add_uvs(uvs[ 0 ], uvs[ 1 ], uvs[ 3 ]);
                        add_uvs(uvs[ 1 ], uvs[ 2 ], uvs[ 3 ]);

                    }

                }

            }

            // create mesh if no objects in text

            if (/^o /gm.test(text) === false) {

                geometry = new THREE.Geometry();
                material = new THREE.MeshLambertMaterial();
                mesh = new THREE.Mesh(geometry, material);
                object.add(mesh);

            }

            var vertices = [];
            var normals = [];
            var uvs = [];

            // v float float float

            var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

            // vn float float float

            var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

            // vt float float

            var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

            // f vertex vertex vertex ...

            var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

            // f vertex/uv vertex/uv vertex/uv ...

            var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

            // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

            var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

            // f vertex//normal vertex//normal vertex//normal ...

            var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/

            // fixes

            text = text.replace(/\\\r\n/g, ''); // handles line continuations \

            var lines = text.split('\n');

            for (var i = 0; i < lines.length; i++) {

                var line = lines[ i ];
                line = line.trim();

                var result;

                if (line.length === 0 || line.charAt(0) === '#') {

                    continue;

                } else if (( result = vertex_pattern.exec(line) ) !== null) {

                    // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    vertices.push(
                        geometry.vertices.push(
                            vector(
                                result[ 1 ], result[ 2 ], result[ 3 ]
                            )
                        )
                    );

                } else if (( result = normal_pattern.exec(line) ) !== null) {

                    // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    normals.push(
                        vector(
                            result[ 1 ], result[ 2 ], result[ 3 ]
                        )
                    );

                } else if (( result = uv_pattern.exec(line) ) !== null) {

                    // ["vt 0.1 0.2", "0.1", "0.2"]

                    uvs.push(
                        uv(
                            result[ 1 ], result[ 2 ]
                        )
                    );

                } else if (( result = face_pattern1.exec(line) ) !== null) {

                    // ["f 1 2 3", "1", "2", "3", undefined]

                    handle_face_line(
                        [ result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ] ]
                    );

                } else if (( result = face_pattern2.exec(line) ) !== null) {

                    // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

                    handle_face_line(
                        [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
                        [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //uv
                    );

                } else if (( result = face_pattern3.exec(line) ) !== null) {

                    // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

                    handle_face_line(
                        [ result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ] ], //faces
                        [ result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ] ], //uv
                        [ result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ] ] //normal
                    );

                } else if (( result = face_pattern4.exec(line) ) !== null) {

                    // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

                    handle_face_line(
                        [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
                        [ ], //uv
                        [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //normal
                    );

                } else if (/^o /.test(line)) {

                    geometry = new THREE.Geometry();
                    material = new THREE.MeshLambertMaterial();

                    mesh = new THREE.Mesh(geometry, material);
                    mesh.name = line.substring(2).trim();
                    object.add(mesh);

                } else if (/^g /.test(line)) {

                    // group

                } else if (/^usemtl /.test(line)) {

                    // material

                    material.name = line.substring(7).trim();

                } else if (/^mtllib /.test(line)) {

                    // mtl file

                } else if (/^s /.test(line)) {

                    // smooth shading

                } else {

                    // console.log( "THREE.OBJLoader: Unhandled line " + line );

                }

            }

            var children = object.children;

            for (var i = 0, l = children.length; i < l; i++) {

                var geometry = children[ i ].geometry;

                geometry.computeFaceNormals();
                geometry.computeBoundingSphere();

            }

            return object;

        }

    };
}

function initMtlLoader() {
    /**
     * Loads a Wavefront .mtl file specifying materials
     *
     * @author angelxuanchang
     */

    THREE.MTLLoader = function (baseUrl, options, crossOrigin) {

        this.baseUrl = baseUrl;
        this.options = options;
        this.crossOrigin = crossOrigin;

    };

    THREE.MTLLoader.prototype = {

        constructor: THREE.MTLLoader,

        load: function (url, onLoad, onProgress, onError) {

            var scope = this;

            var loader = new THREE.XHRLoader();
            loader.setCrossOrigin(this.crossOrigin);
            loader.load(url, function (text) {

                onLoad(scope.parse(text));

            });

        },

        /**
         * Parses loaded MTL file
         * @param text - Content of MTL file
         * @return {THREE.MTLLoader.MaterialCreator}
         */
        parse: function (text) {

            var lines = text.split("\n");
            var info = {};
            var delimiter_pattern = /\s+/;
            var materialsInfo = {};

            for (var i = 0; i < lines.length; i++) {

                var line = lines[ i ];
                line = line.trim();

                if (line.length === 0 || line.charAt(0) === '#') {

                    // Blank line or comment ignore
                    continue;

                }

                var pos = line.indexOf(' ');

                var key = ( pos >= 0 ) ? line.substring(0, pos) : line;
                key = key.toLowerCase();

                var value = ( pos >= 0 ) ? line.substring(pos + 1) : "";
                value = value.trim();

                if (key === "newmtl") {

                    // New material

                    info = { name: value };
                    materialsInfo[ value ] = info;

                } else if (info) {

                    if (key === "ka" || key === "kd" || key === "ks") {

                        var ss = value.split(delimiter_pattern, 3);
                        info[ key ] = [ parseFloat(ss[0]), parseFloat(ss[1]), parseFloat(ss[2]) ];

                    } else {

                        info[ key ] = value;

                    }

                }

            }

            var materialCreator = new THREE.MTLLoader.MaterialCreator(this.baseUrl, this.options);
            materialCreator.setMaterials(materialsInfo);
            return materialCreator;

        }

    };

    /**
     * Create a new THREE-MTLLoader.MaterialCreator
     * @param baseUrl - Url relative to which textures are loaded
     * @param options - Set of options on how to construct the materials
     *                  side: Which side to apply the material
     *                        THREE.FrontSide (default), THREE.BackSide, THREE.DoubleSide
     *                  wrap: What type of wrapping to apply for textures
     *                        THREE.RepeatWrapping (default), THREE.ClampToEdgeWrapping, THREE.MirroredRepeatWrapping
     *                  normalizeRGB: RGBs need to be normalized to 0-1 from 0-255
     *                                Default: false, assumed to be already normalized
     *                  ignoreZeroRGBs: Ignore values of RGBs (Ka,Kd,Ks) that are all 0's
     *                                  Default: false
     *                  invertTransparency: If transparency need to be inverted (inversion is needed if d = 0 is fully opaque)
     *                                      Default: false (d = 1 is fully opaque)
     * @constructor
     */

    THREE.MTLLoader.MaterialCreator = function (baseUrl, options) {

        this.baseUrl = baseUrl;
        this.options = options;
        this.materialsInfo = {};
        this.materials = {};
        this.materialsArray = [];
        this.nameLookup = {};

        this.side = ( this.options && this.options.side ) ? this.options.side : THREE.FrontSide;
        this.wrap = ( this.options && this.options.wrap ) ? this.options.wrap : THREE.RepeatWrapping;

    };

    THREE.MTLLoader.MaterialCreator.prototype = {

        constructor: THREE.MTLLoader.MaterialCreator,

        setMaterials: function (materialsInfo) {

            this.materialsInfo = this.convert(materialsInfo);
            this.materials = {};
            this.materialsArray = [];
            this.nameLookup = {};

        },

        convert: function (materialsInfo) {

            if (!this.options) return materialsInfo;

            var converted = {};

            for (var mn in materialsInfo) {

                // Convert materials info into normalized form based on options

                var mat = materialsInfo[ mn ];

                var covmat = {};

                converted[ mn ] = covmat;

                for (var prop in mat) {

                    var save = true;
                    var value = mat[ prop ];
                    var lprop = prop.toLowerCase();

                    switch (lprop) {

                        case 'kd':
                        case 'ka':
                        case 'ks':

                            // Diffuse color (color under white light) using RGB values

                            if (this.options && this.options.normalizeRGB) {

                                value = [ value[ 0 ] / 255, value[ 1 ] / 255, value[ 2 ] / 255 ];

                            }

                            if (this.options && this.options.ignoreZeroRGBs) {

                                if (value[ 0 ] === 0 && value[ 1 ] === 0 && value[ 1 ] === 0) {

                                    // ignore

                                    save = false;

                                }
                            }

                            break;

                        case 'd':

                            // According to MTL format (http://paulbourke.net/dataformats/mtl/):
                            //   d is dissolve for current material
                            //   factor of 1.0 is fully opaque, a factor of 0 is fully dissolved (completely transparent)

                            if (this.options && this.options.invertTransparency) {

                                value = 1 - value;

                            }

                            break;

                        default:

                            break;
                    }

                    if (save) {

                        covmat[ lprop ] = value;

                    }

                }

            }

            return converted;

        },

        preload: function () {

            for (var mn in this.materialsInfo) {

                this.create(mn);

            }

        },

        getIndex: function (materialName) {

            return this.nameLookup[ materialName ];

        },

        getAsArray: function () {

            var index = 0;

            for (var mn in this.materialsInfo) {

                this.materialsArray[ index ] = this.create(mn);
                this.nameLookup[ mn ] = index;
                index++;

            }

            return this.materialsArray;

        },

        create: function (materialName) {

            if (this.materials[ materialName ] === undefined) {

                this.createMaterial_(materialName);

            }

            return this.materials[ materialName ];

        },

        createMaterial_: function (materialName) {

            // Create material

            var mat = this.materialsInfo[ materialName ];
            var params = {

                name: materialName,
                side: this.side

            };

            for (var prop in mat) {

                var value = mat[ prop ];

                switch (prop.toLowerCase()) {

                    // Ns is material specular exponent

                    case 'kd':

                        // Diffuse color (color under white light) using RGB values

                        params[ 'diffuse' ] = new THREE.Color().fromArray(value);

                        break;

                    case 'ka':

                        // Ambient color (color under shadow) using RGB values

                        params[ 'ambient' ] = new THREE.Color().fromArray(value);

                        break;

                    case 'ks':

                        // Specular color (color when light is reflected from shiny surface) using RGB values
                        params[ 'specular' ] = new THREE.Color().fromArray(value);

                        break;

                    case 'map_kd':

                        // Diffuse texture map

                        params[ 'map' ] = this.loadTexture(this.baseUrl + value);
                        params[ 'map' ].wrapS = this.wrap;
                        params[ 'map' ].wrapT = this.wrap;

                        break;

                    case 'ns':

                        // The specular exponent (defines the focus of the specular highlight)
                        // A high exponent results in a tight, concentrated highlight. Ns values normally range from 0 to 1000.

                        params['shininess'] = value;

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

            if (params[ 'diffuse' ]) {

                if (!params[ 'ambient' ]) params[ 'ambient' ] = params[ 'diffuse' ];
                params[ 'color' ] = params[ 'diffuse' ];

            }

            this.materials[ materialName ] = new THREE.MeshPhongMaterial(params);
            return this.materials[ materialName ];

        },


        loadTexture: function (url, mapping, onLoad, onError) {

            var texture;
            var loader = THREE.Loader.Handlers.get(url);

            if (loader !== null) {

                texture = loader.load(url, onLoad);

            } else {

                texture = new THREE.Texture();

                loader = new THREE.ImageLoader();
                loader.crossOrigin = this.crossOrigin;
                loader.load(url, function (image) {

                    texture.image = THREE.MTLLoader.ensurePowerOfTwo_(image);
                    texture.needsUpdate = true;

                    if (onLoad) onLoad(texture);

                });

            }

            texture.mapping = mapping;

            return texture;

        }

    };

    THREE.MTLLoader.ensurePowerOfTwo_ = function (image) {

        if (!THREE.Math.isPowerOfTwo(image.width) || !THREE.Math.isPowerOfTwo(image.height)) {

            var canvas = document.createElement("canvas");
            canvas.width = THREE.MTLLoader.nextHighestPowerOfTwo_(image.width);
            canvas.height = THREE.MTLLoader.nextHighestPowerOfTwo_(image.height);

            var ctx = canvas.getContext("2d");
            ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
            return canvas;

        }

        return image;

    };

    THREE.MTLLoader.nextHighestPowerOfTwo_ = function (x) {

        --x;

        for (var i = 1; i < 32; i <<= 1) {

            x = x | x >> i;

        }

        return x + 1;

    };

    THREE.EventDispatcher.prototype.apply(THREE.MTLLoader.prototype);
}

function initObjMtlLoader() {
    /**
     * Loads a Wavefront .obj file with materials
     *
     * @author mrdoob / http://mrdoob.com/
     * @author angelxuanchang
     */

    THREE.OBJMTLLoader = function (manager) {
        this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
    };

    THREE.OBJMTLLoader.prototype = {

        constructor: THREE.OBJMTLLoader,

        load: function (url, mtlurl, onLoad, onProgress, onError) {

            var scope = this;

            var mtlLoader = new THREE.MTLLoader(url.substr(0, url.lastIndexOf("/") + 1));
            mtlLoader.load(mtlurl, function (materials) {

                var materialsCreator = materials;
                materialsCreator.preload();

                var loader = new THREE.XHRLoader(scope.manager);
//                    loader.setCrossOrigin( this.crossOrigin );
                loader.load(url, function (text) {

                    var object = scope.parse(text);

                    object.traverse(function (object) {

                        if (object instanceof THREE.Mesh) {

                            if (object.material.name) {

                                var material = materialsCreator.create(object.material.name);

                                if (material) object.material = material;

                            }

                        }

                    });

                    onLoad(object);

                });

            });

        },

        /**
         * Parses loaded .obj file
         * @param data - content of .obj file
         * @param mtllibCallback - callback to handle mtllib declaration (optional)
         * @return {THREE.Object3D} - Object3D (with default material)
         */

        parse: function (data, mtllibCallback) {

            function vector(x, y, z) {

                return new THREE.Vector3(x, y, z);

            }

            function uv(u, v) {

                return new THREE.Vector2(u, v);

            }

            function face3(a, b, c, normals) {

                return new THREE.Face3(a, b, c, normals);

            }

            var face_offset = 0;

            function meshN(meshName, materialName) {

                if (vertices.length > 0) {

                    geometry.vertices = vertices;

                    geometry.mergeVertices();
                    geometry.computeFaceNormals();
                    geometry.computeBoundingSphere();

                    object.add(mesh);

                    geometry = new THREE.Geometry();
                    mesh = new THREE.Mesh(geometry, material);

                }

                if (meshName !== undefined) mesh.name = meshName;

                if (materialName !== undefined) {

                    material = new THREE.MeshLambertMaterial();
                    material.name = materialName;

                    mesh.material = material;

                }

            }

            var group = new THREE.Object3D();
            var object = group;

            var geometry = new THREE.Geometry();
            var material = new THREE.MeshLambertMaterial();
            var mesh = new THREE.Mesh(geometry, material);

            var vertices = [];
            var normals = [];
            var uvs = [];

            function add_face(a, b, c, normals_inds) {

                if (normals_inds === undefined) {

                    geometry.faces.push(face3(
                            parseInt(a) - (face_offset + 1),
                            parseInt(b) - (face_offset + 1),
                            parseInt(c) - (face_offset + 1)
                    ));

                } else {

                    geometry.faces.push(face3(
                            parseInt(a) - (face_offset + 1),
                            parseInt(b) - (face_offset + 1),
                            parseInt(c) - (face_offset + 1),
                        [
                            normals[ parseInt(normals_inds[ 0 ]) - 1 ].clone(),
                            normals[ parseInt(normals_inds[ 1 ]) - 1 ].clone(),
                            normals[ parseInt(normals_inds[ 2 ]) - 1 ].clone()
                        ]
                    ));

                }

            }

            function add_uvs(a, b, c) {

                geometry.faceVertexUvs[ 0 ].push([
                    uvs[ parseInt(a) - 1 ].clone(),
                    uvs[ parseInt(b) - 1 ].clone(),
                    uvs[ parseInt(c) - 1 ].clone()
                ]);

            }

            function handle_face_line(faces, uvs, normals_inds) {

                if (faces[ 3 ] === undefined) {

                    add_face(faces[ 0 ], faces[ 1 ], faces[ 2 ], normals_inds);

                    if (!(uvs === undefined) && uvs.length > 0) {
                        add_uvs(uvs[ 0 ], uvs[ 1 ], uvs[ 2 ]);
                    }

                } else {

                    if (!(normals_inds === undefined) && normals_inds.length > 0) {

                        add_face(faces[ 0 ], faces[ 1 ], faces[ 3 ], [ normals_inds[ 0 ], normals_inds[ 1 ], normals_inds[ 3 ] ]);
                        add_face(faces[ 1 ], faces[ 2 ], faces[ 3 ], [ normals_inds[ 1 ], normals_inds[ 2 ], normals_inds[ 3 ] ]);

                    } else {

                        add_face(faces[ 0 ], faces[ 1 ], faces[ 3 ]);
                        add_face(faces[ 1 ], faces[ 2 ], faces[ 3 ]);

                    }

                    if (!(uvs === undefined) && uvs.length > 0) {

                        add_uvs(uvs[ 0 ], uvs[ 1 ], uvs[ 3 ]);
                        add_uvs(uvs[ 1 ], uvs[ 2 ], uvs[ 3 ]);

                    }

                }

            }


            // v float float float

            var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

            // vn float float float

            var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

            // vt float float

            var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

            // f vertex vertex vertex ...

            var face_pattern1 = /f( +\d+)( +\d+)( +\d+)( +\d+)?/;

            // f vertex/uv vertex/uv vertex/uv ...

            var face_pattern2 = /f( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))?/;

            // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

            var face_pattern3 = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/;

            // f vertex//normal vertex//normal vertex//normal ...

            var face_pattern4 = /f( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))?/

            //

            var lines = data.split("\n");

            for (var i = 0; i < lines.length; i++) {

                var line = lines[ i ];
                line = line.trim();

                var result;

                if (line.length === 0 || line.charAt(0) === '#') {

                    continue;

                } else if (( result = vertex_pattern.exec(line) ) !== null) {

                    // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    vertices.push(vector(
                        parseFloat(result[ 1 ]),
                        parseFloat(result[ 2 ]),
                        parseFloat(result[ 3 ])
                    ));

                } else if (( result = normal_pattern.exec(line) ) !== null) {

                    // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

                    normals.push(vector(
                        parseFloat(result[ 1 ]),
                        parseFloat(result[ 2 ]),
                        parseFloat(result[ 3 ])
                    ));

                } else if (( result = uv_pattern.exec(line) ) !== null) {

                    // ["vt 0.1 0.2", "0.1", "0.2"]

                    uvs.push(uv(
                        parseFloat(result[ 1 ]),
                        parseFloat(result[ 2 ])
                    ));

                } else if (( result = face_pattern1.exec(line) ) !== null) {

                    // ["f 1 2 3", "1", "2", "3", undefined]

                    handle_face_line([ result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ] ]);

                } else if (( result = face_pattern2.exec(line) ) !== null) {

                    // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]

                    handle_face_line(
                        [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
                        [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //uv
                    );

                } else if (( result = face_pattern3.exec(line) ) !== null) {

                    // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

                    handle_face_line(
                        [ result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ] ], //faces
                        [ result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ] ], //uv
                        [ result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ] ] //normal
                    );

                } else if (( result = face_pattern4.exec(line) ) !== null) {

                    // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

                    handle_face_line(
                        [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
                        [ ], //uv
                        [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //normal
                    );

                } else if (/^o /.test(line)) {

                    // object

                    meshN();
                    face_offset = face_offset + vertices.length;
                    vertices = [];
                    object = new THREE.Object3D();
                    object.name = line.substring(2).trim();
                    group.add(object);

                } else if (/^g /.test(line)) {

                    // group

                    meshN(line.substring(2).trim(), undefined);

                } else if (/^usemtl /.test(line)) {

                    // material

                    meshN(undefined, line.substring(7).trim());

                } else if (/^mtllib /.test(line)) {

                    // mtl file

                    if (mtllibCallback) {

                        var mtlfile = line.substring(7);
                        mtlfile = mtlfile.trim();
                        mtllibCallback(mtlfile);

                    }

                } else if (/^s /.test(line)) {

                    // Smooth shading

                } else {

                    console.log("THREE.OBJMTLLoader: Unhandled line " + line);

                }

            }

            //Add last object
            meshN(undefined, undefined);

            return group;

        }

    };

    THREE.EventDispatcher.prototype.apply(THREE.OBJMTLLoader.prototype);
}

function initOrbitControls() {
    THREE.OrbitControls = function ( object, domElement ) {

        this.object = object;
        this.domElement = ( domElement !== undefined ) ? domElement : document;

        // API

        // Set to false to disable this control
        this.enabled = true;

        // "target" sets the location of focus, where the control orbits around
        // and where it pans with respect to.
        this.target = new THREE.Vector3();

        // center is old, deprecated; use "target" instead
        this.center = this.target;

        // This option actually enables dollying in and out; left as "zoom" for
        // backwards compatibility
        this.noZoom = false;
        this.zoomSpeed = 1.0;

        // Limits to how far you can dolly in and out
        this.minDistance = 0;
        this.maxDistance = Infinity;

        // Set to true to disable this control
        this.noRotate = false;
        this.rotateSpeed = 1.0;

        // Set to true to disable this control
        this.noPan = false;
        this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // Set to true to disable use of the keys
        this.noKeys = false;

        // The four arrow keys
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        ////////////
        // internals

        var scope = this;

        var EPS = 0.000001;

        var rotateStart = new THREE.Vector2();
        var rotateEnd = new THREE.Vector2();
        var rotateDelta = new THREE.Vector2();

        var panStart = new THREE.Vector2();
        var panEnd = new THREE.Vector2();
        var panDelta = new THREE.Vector2();
        var panOffset = new THREE.Vector3();

        var offset = new THREE.Vector3();

        var dollyStart = new THREE.Vector2();
        var dollyEnd = new THREE.Vector2();
        var dollyDelta = new THREE.Vector2();

        var phiDelta = 0;
        var thetaDelta = 0;
        var scale = 1;
        var pan = new THREE.Vector3();

        var lastPosition = new THREE.Vector3();

        var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

        var state = STATE.NONE;

        // for reset

        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();

        // events

        var changeEvent = { type: 'change' };
        var startEvent = { type: 'start'};
        var endEvent = { type: 'end'};

        this.rotateLeft = function ( angle ) {

            if ( angle === undefined ) {

                angle = getAutoRotationAngle();

            }

            thetaDelta -= angle;

        };

        this.rotateUp = function ( angle ) {

            if ( angle === undefined ) {

                angle = getAutoRotationAngle();

            }

            phiDelta -= angle;

        };

        // pass in distance in world space to move left
        this.panLeft = function ( distance ) {

            var te = this.object.matrix.elements;

            // get X column of matrix
            panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
            panOffset.multiplyScalar( - distance );

            pan.add( panOffset );

        };

        // pass in distance in world space to move up
        this.panUp = function ( distance ) {

            var te = this.object.matrix.elements;

            // get Y column of matrix
            panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
            panOffset.multiplyScalar( distance );

            pan.add( panOffset );

        };

        // pass in x,y of change desired in pixel space,
        // right and down are positive
        this.pan = function ( deltaX, deltaY ) {

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if ( scope.object.fov !== undefined ) {

                // perspective
                var position = scope.object.position;
                var offset = position.clone().sub( scope.target );
                var targetDistance = offset.length();

                // half of the fov is center to top of screen
                targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

                // we actually don't use screenWidth, since perspective camera is fixed to screen height
                scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
                scope.panUp( 2 * deltaY * targetDistance / element.clientHeight );

            } else if ( scope.object.top !== undefined ) {

                // orthographic
                scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth );
                scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight );

            } else {

                // camera neither orthographic or perspective
                console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

            }

        };

        this.dollyIn = function ( dollyScale ) {

            if ( dollyScale === undefined ) {

                dollyScale = getZoomScale();

            }

            scale /= dollyScale;

        };

        this.dollyOut = function ( dollyScale ) {

            if ( dollyScale === undefined ) {

                dollyScale = getZoomScale();

            }

            scale *= dollyScale;

        };

        this.update = function () {

            var position = this.object.position;

            offset.copy( position ).sub( this.target );

            // angle from z-axis around y-axis

            var theta = Math.atan2( offset.x, offset.z );

            // angle from y-axis

            var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

            if ( this.autoRotate ) {

                this.rotateLeft( getAutoRotationAngle() );

            }

            theta += thetaDelta;
            phi += phiDelta;

            // restrict phi to be between desired limits
            phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

            // restrict phi to be betwee EPS and PI-EPS
            phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

            var radius = offset.length() * scale;

            // restrict radius to be between desired limits
            radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

            // move target to panned location
            this.target.add( pan );

            offset.x = radius * Math.sin( phi ) * Math.sin( theta );
            offset.y = radius * Math.cos( phi );
            offset.z = radius * Math.sin( phi ) * Math.cos( theta );

            position.copy( this.target ).add( offset );

            this.object.lookAt( this.target );

            thetaDelta = 0;
            phiDelta = 0;
            scale = 1;
            pan.set( 0, 0, 0 );

            if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

                this.dispatchEvent( changeEvent );

                lastPosition.copy( this.object.position );

            }

        };


        this.reset = function () {

            state = STATE.NONE;

            this.target.copy( this.target0 );
            this.object.position.copy( this.position0 );

            this.update();

        };

        function getAutoRotationAngle() {

            return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

        }

        function getZoomScale() {

            return Math.pow( 0.95, scope.zoomSpeed );

        }

        function onMouseDown( event ) {

            if ( scope.enabled === false ) return;
            event.preventDefault();

            if ( event.button === 0 ) {
                if ( scope.noRotate === true ) return;

                state = STATE.ROTATE;

                rotateStart.set( event.clientX, event.clientY );

            } else if ( event.button === 1 ) {
                if ( scope.noZoom === true ) return;

                state = STATE.DOLLY;

                dollyStart.set( event.clientX, event.clientY );

            } else if ( event.button === 2 ) {
                if ( scope.noPan === true ) return;

                state = STATE.PAN;

                panStart.set( event.clientX, event.clientY );

            }

            scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
            scope.domElement.addEventListener( 'mouseup', onMouseUp, false );
            scope.dispatchEvent( startEvent );

        }

        function onMouseMove( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            if ( state === STATE.ROTATE ) {

                if ( scope.noRotate === true ) return;

                rotateEnd.set( event.clientX, event.clientY );
                rotateDelta.subVectors( rotateEnd, rotateStart );

                // rotating across whole screen goes 360 degrees around
                scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

                // rotating up and down along whole screen attempts to go 360, but limited to 180
                scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                rotateStart.copy( rotateEnd );

            } else if ( state === STATE.DOLLY ) {

                if ( scope.noZoom === true ) return;

                dollyEnd.set( event.clientX, event.clientY );
                dollyDelta.subVectors( dollyEnd, dollyStart );

                if ( dollyDelta.y > 0 ) {

                    scope.dollyIn();

                } else {

                    scope.dollyOut();

                }

                dollyStart.copy( dollyEnd );

            } else if ( state === STATE.PAN ) {

                if ( scope.noPan === true ) return;

                panEnd.set( event.clientX, event.clientY );
                panDelta.subVectors( panEnd, panStart );

                scope.pan( panDelta.x, panDelta.y );

                panStart.copy( panEnd );

            }

            scope.update();

        }

        function onMouseUp( /* event */ ) {

            if ( scope.enabled === false ) return;

            scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
            scope.domElement.removeEventListener( 'mouseup', onMouseUp, false );
            scope.dispatchEvent( endEvent );
            state = STATE.NONE;

        }

        function onMouseWheel( event ) {

            if ( scope.enabled === false || scope.noZoom === true ) return;

            event.preventDefault();

            var delta = 0;

            if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

                delta = event.wheelDelta;

            } else if ( event.detail !== undefined ) { // Firefox

                delta = - event.detail;

            }

            if ( delta > 0 ) {

                scope.dollyOut();

            } else {

                scope.dollyIn();

            }

            scope.update();
            scope.dispatchEvent( startEvent );
            scope.dispatchEvent( endEvent );

        }

        function onKeyDown( event ) {

            if ( scope.enabled === false || scope.noKeys === true || scope.noPan === true ) return;

            switch ( event.keyCode ) {

                case scope.keys.UP:
                    scope.pan( 0, scope.keyPanSpeed );
                    scope.update();
                    break;

                case scope.keys.BOTTOM:
                    scope.pan( 0, - scope.keyPanSpeed );
                    scope.update();
                    break;

                case scope.keys.LEFT:
                    scope.pan( scope.keyPanSpeed, 0 );
                    scope.update();
                    break;

                case scope.keys.RIGHT:
                    scope.pan( - scope.keyPanSpeed, 0 );
                    scope.update();
                    break;

            }

        }

        function touchstart( event ) {

            if ( scope.enabled === false ) return;

            switch ( event.touches.length ) {

                case 1:	// one-fingered touch: rotate

                    if ( scope.noRotate === true ) return;

                    state = STATE.TOUCH_ROTATE;

                    rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    break;

                case 2:	// two-fingered touch: dolly

                    if ( scope.noZoom === true ) return;

                    state = STATE.TOUCH_DOLLY;

                    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                    var distance = Math.sqrt( dx * dx + dy * dy );
                    dollyStart.set( 0, distance );
                    break;

                case 3: // three-fingered touch: pan

                    if ( scope.noPan === true ) return;

                    state = STATE.TOUCH_PAN;

                    panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    break;

                default:

                    state = STATE.NONE;

            }

            scope.dispatchEvent( startEvent );

        }

        function touchmove( event ) {

            if ( scope.enabled === false ) return;

            event.preventDefault();
            event.stopPropagation();

            var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

            switch ( event.touches.length ) {

                case 1: // one-fingered touch: rotate

                    if ( scope.noRotate === true ) return;
                    if ( state !== STATE.TOUCH_ROTATE ) return;

                    rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    rotateDelta.subVectors( rotateEnd, rotateStart );

                    // rotating across whole screen goes 360 degrees around
                    scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
                    // rotating up and down along whole screen attempts to go 360, but limited to 180
                    scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

                    rotateStart.copy( rotateEnd );

                    scope.update();
                    break;

                case 2: // two-fingered touch: dolly

                    if ( scope.noZoom === true ) return;
                    if ( state !== STATE.TOUCH_DOLLY ) return;

                    var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
                    var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
                    var distance = Math.sqrt( dx * dx + dy * dy );

                    dollyEnd.set( 0, distance );
                    dollyDelta.subVectors( dollyEnd, dollyStart );

                    if ( dollyDelta.y > 0 ) {

                        scope.dollyOut();

                    } else {

                        scope.dollyIn();

                    }

                    dollyStart.copy( dollyEnd );

                    scope.update();
                    break;

                case 3: // three-fingered touch: pan

                    if ( scope.noPan === true ) return;
                    if ( state !== STATE.TOUCH_PAN ) return;

                    panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
                    panDelta.subVectors( panEnd, panStart );

                    scope.pan( panDelta.x, panDelta.y );

                    panStart.copy( panEnd );

                    scope.update();
                    break;

                default:

                    state = STATE.NONE;

            }

        }

        function touchend( /* event */ ) {

            if ( scope.enabled === false ) return;

            scope.dispatchEvent( endEvent );
            state = STATE.NONE;

        }

        this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
        this.domElement.addEventListener( 'mousedown', onMouseDown, false );
        this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
        this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

        this.domElement.addEventListener( 'touchstart', touchstart, false );
        this.domElement.addEventListener( 'touchend', touchend, false );
        this.domElement.addEventListener( 'touchmove', touchmove, false );

        window.addEventListener( 'keydown', onKeyDown, false );

    };

    THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
}

module.exports = {
    init: function () {
        initObjLoader();
        initMtlLoader();
        initObjMtlLoader();
        initOrbitControls();
        return this;
    }
};
