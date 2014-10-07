/**
 * Created by Miha-ha on 07.10.14.
 */
var Mediator = require('mediator-js').Mediator;

module.exports = {
    mediator: new Mediator(),
    add: function (m) {
        m.init(this.mediator);
        for (var prop in m) {
            if (m.hasOwnProperty(prop)
                && typeof m[prop] === 'function'
                && prop.substring(0, 2) === 'on') {
                var event = prop.substring(2);
                this.mediator.on(event, m[prop], {}, m);
            }
        }
    }
};
