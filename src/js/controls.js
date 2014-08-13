/**
 * Created by Miha-ha on 02.08.14.
 */
//Controls
require("dat.gui/dat.gui.js");
var gui,
    controllers = {},
    controls = {
        garment: 'KPL_201407_0020_0005',
        //shadow
        shadow: true,
        bias: 0.0001,
        darkness: 0.07,
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
    gui = new global.dat.GUI();
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
    var shadowFolder = gui.addFolder("Shadow");
    controllers['shadow'] = shadowFolder.add(controls, 'shadow');
    controllers['bias'] = shadowFolder.add(controls, 'bias');
    controllers['darknss'] = shadowFolder.add(controls, 'darkness');
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
    }
};