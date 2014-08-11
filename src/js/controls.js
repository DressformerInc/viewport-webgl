/**
 * Created by Miha-ha on 02.08.14.
 */
//Controls
var d = require("dat.gui/dat.gui.js"),
    gui,
    controllers = {},
    controls = {
        garment: [],
        //shadow
        shadow: true,
        bias: 0.0001,
        darkness: 0.07,
        //rotate
        rotate: false,
        speed: 0.02
    };

//    function controls() {
//        this.shadow = true;
//    }

function initGUI(controls) {
    gui = new d.GUI();
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