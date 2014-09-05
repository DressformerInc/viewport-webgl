/**
 * Created by Miha-ha on 02.08.14.
 */
//Controls
var dat = require('../../../libs/dat.gui.js'),
    webgl = require('./webgl'),
    gui,
    controllers = {},
    body = global.Dressformer.dummy.body,
    controls = {
        garment: 'ADS_201407_0005_0002',
        //sizes
        sizes: {
            height: body.height,
            chest: body.chest,
            underbust: body.underbust,
            waist: body.waist,
            hips: body.hips,
            apply: function () {
                console.log('apply sizes', null);
            }
        },
        //dummy
        dummy: {
            color: '#000000'
        },
        //light1
        light1: {
            enable: true,
            intensity: 1,
            x:300,
            y:500,
            z:100,
            shadow: true,
            bias: 0.0001,
            darkness: 0.1
        },
        //light2
        light2: {
            enable: true,
            intensity: 1,
            x:-500,
            y:800,
            z:300,
            shadow: true,
            bias: 0.0001,
            darkness: 0.01
        },
        //rotate
        rotate: {
            auto: false,
            speed: 0.02,
            left: webgl.rotateLeft,
            right: webgl.rotateRight,
            up: webgl.rotateUp,
            down: webgl.rotateDown,
            reset: webgl.resetRotation,
            zoomIn: webgl.zoomIn,
            zoomOut: webgl.zoomOut,
            fullscreen: webgl.toggleFullscreen
        },
        //dof
        dof: true,
        focus: 1.0,
        aperture: 0.025,
        maxblur: 1.0
    };

//    function controls() {
//        this.shadow = true;
//    }

function initGUI(controls) {
    gui = new dat.GUI();
    gui.closed = true;
    controllers['garment'] = gui.add(controls, 'garment', [
//        'ADS_201407_0005_0001',
        'ADS_201407_0005_0002',
        'ADS_201407_0005_0003',
        'ADS_201407_0005_0004',
//        'ADS_201407_0005_0005',
        'KPL_201407_0020_0001',
        'KPL_201407_0020_0002',
        'KPL_201407_0020_0003',
        'KPL_201407_0020_0004',
        'KPL_201407_0020_0005',
        'KPL_201407_0020_0006',
        'KPL_201407_0020_0007',
        'KPL_201407_0020_0008',
        'KPL_201407_0020_0009',
        'KPL_201407_0020_0010'
    ]).listen();
    var sizesFolder = gui.addFolder('sizes'), step = 0.5;
    controllers['sizes.height'] = sizesFolder.add(controls.sizes, 'height', 130, 230, step);
    controllers['sizes.chest'] = sizesFolder.add(controls.sizes, 'chest', 50, 150, step);
    controllers['sizes.underbust'] = sizesFolder.add(controls.sizes, 'underbust', 50, 150, step);
    controllers['sizes.waist'] = sizesFolder.add(controls.sizes, 'waist', 50, 150, step);
    controllers['sizes.hips'] = sizesFolder.add(controls.sizes, 'hips', 70, 150, step);
    controllers['sizes.apply'] = sizesFolder.add(controls.sizes, 'apply');
    sizesFolder.closed = false;

    var dummyFolder = gui.addFolder('dummy');
    controllers['dummy.color'] = dummyFolder.add(controls.dummy, 'color');

    var light1Folder = gui.addFolder('Light1');
    controllers['light1.enable'] = light1Folder.add(controls.light1, 'enable');
    controllers['light1.intensity'] = light1Folder.add(controls.light1, 'intensity', 0, 1, 0.01);
    controllers['light1.x'] = light1Folder.add(controls.light1, 'x', -1000, 1000, 10);
    controllers['light1.y'] = light1Folder.add(controls.light1, 'y', -1000, 1000, 10);
    controllers['light1.z'] = light1Folder.add(controls.light1, 'z', -1000, 1000, 10);
    controllers['light1.shadow'] = light1Folder.add(controls.light1, 'shadow');
    controllers['light1.bias'] = light1Folder.add(controls.light1, 'bias');
    controllers['light1.darkness'] = light1Folder.add(controls.light1, 'darkness', 0, 1, 0.01);

    var light2Folder = gui.addFolder('Light2');
    controllers['light2.enable'] = light2Folder.add(controls.light2, 'enable');
    controllers['light2.intensity'] = light2Folder.add(controls.light2, 'intensity', 0, 1, 0.01);
    controllers['light2.x'] = light2Folder.add(controls.light2, 'x', -1000, 1000, 10);
    controllers['light2.y'] = light2Folder.add(controls.light2, 'y', -1000, 1000, 10);
    controllers['light2.z'] = light2Folder.add(controls.light2, 'z', -1000, 1000, 10);
    controllers['light2.shadow'] = light2Folder.add(controls.light2, 'shadow');
    controllers['light2.bias'] = light2Folder.add(controls.light2, 'bias');
    controllers['light2.darkness'] = light2Folder.add(controls.light2, 'darkness', 0, 1, 0.01);


    var rotateFolder = gui.addFolder("Rotate");
    controllers['rotate.auto'] = rotateFolder.add(controls.rotate, 'auto').listen();
    controllers['rotate.speed'] = rotateFolder.add(controls.rotate, 'speed');
    controllers['rotate.left'] = rotateFolder.add(controls.rotate, 'left');
    controllers['rotate.right'] = rotateFolder.add(controls.rotate, 'right');
    controllers['rotate.up'] = rotateFolder.add(controls.rotate, 'up');
    controllers['rotate.down'] = rotateFolder.add(controls.rotate, 'down');
    controllers['rotate.reset'] = rotateFolder.add(controls.rotate, 'reset');
    controllers['rotate.zoomIn'] = rotateFolder.add(controls.rotate, 'zoomIn');
    controllers['rotate.zoomOut'] = rotateFolder.add(controls.rotate, 'zoomOut');
    controllers['rotate.fullscreen'] = rotateFolder.add(controls.rotate, 'fullscreen');

    var dof = gui.addFolder("DOF");
    controllers['dof'] = dof.add(controls, 'dof');
    controllers['focus'] = dof.add(controls, 'focus', 0.0, 3.0, 0.025);
    controllers['aperture'] = dof.add(controls, 'aperture', 0.001, 0.2, 0.001 );
    controllers['maxblur'] = dof.add(controls, 'maxblur', 0.0, 3.0, 0.025);

}


module.exports = {
    init: function () {
        this.controls = controls;//new controls();
        initGUI(this.controls);
        return this;
    },
    onChange: function (control, callback) {
        controllers[control].onChange(callback);
    },
    onChangeAll: function(callback){
        for(var ctrl in controllers){
            if (controllers.hasOwnProperty(ctrl)){
                controllers[ctrl].onFinishChange(callback);
            }
        }
    }
};