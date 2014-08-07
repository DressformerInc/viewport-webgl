/**
 * Created by Miha-ha on 02.08.14.
 */
//Controls
(function (M, d) {
    var gui,
        controllers = {},
        controls = {
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
        var shadowFolder = gui.addFolder("Shadow");
        controllers['shadow'] = shadowFolder.add(controls, 'shadow');
        controllers['bias'] = shadowFolder.add(controls, 'bias');
        controllers['darknss'] = shadowFolder.add(controls, 'darkness');
        var rotateFolder = gui.addFolder("Rotate");
        controllers['rotate'] = rotateFolder.add(controls, 'rotate').listen();
        controllers['speed'] = rotateFolder.add(controls, 'speed');

    }

    return M.modules.Controls = {
        init: function () {
            this.controls = controls;//new controls();
            initGUI(this.controls);
        },
        onChange: function (control, callback) {
            controllers[control].onChange(callback);
        }
    }
}(Main || {}, dat));