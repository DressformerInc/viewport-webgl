/**
 * Created by Miha-ha on 01.08.14.
 */
//Main
var Main = (function (M, window, document) {
    console.log('module main was loaded');
    //private
    function init() {
        //инициализация модулей
        for (var moduleName in M.modules) {
            if (M.modules.hasOwnProperty(moduleName)) {
                var curModule = M.modules[moduleName];
                if (typeof curModule.init === 'function') {
                    curModule.init();
                }
            }
        }
    }

    //public
    M.modules = M.modules || {};
    M.init = init;

    return M;

}(Main || {}, this, this.document));