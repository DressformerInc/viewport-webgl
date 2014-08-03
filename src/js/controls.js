/**
 * Created by Miha-ha on 02.08.14.
 */
//Controls
(function (M, d) {
    var gui,
        controllers = {},
        controls = {
            shadow: true
        };

//    function controls() {
//        this.shadow = true;
//    }

    function initGUI(controls) {
        gui = new d.GUI();
        controllers['shadow'] = gui.add(controls, 'shadow');
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