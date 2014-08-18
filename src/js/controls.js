/**
 * Created by Miha-ha on 02.08.14.
 */
//Controls
var dat = require("../../libs/dat.gui.js"),
    gui,
    controllers = {},
    controls = {
        garment: 'KPL_201407_0020_0005',
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
            intensity: 0.5,
            x:-500,
            y:800,
            z:300,
            shadow: true,
            bias: 0.0001,
            darkness: 0.01
        },
        //rotate
        rotate: false,
        speed: 0.02,
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
    controllers['garment'] = gui.add(controls, 'garment', [
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
    ]);
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
    controllers['rotate'] = rotateFolder.add(controls, 'rotate').listen();
    controllers['speed'] = rotateFolder.add(controls, 'speed');

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