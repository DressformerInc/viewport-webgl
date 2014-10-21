/**
 * Created by Miha-ha on 07.10.14.
 */
var Mediator = require('mediator-js').Mediator;

module.exports = {
    mediator: new Mediator(),
    add: function (m) {
        var comp = m;

        if( typeof m === 'function'){
            comp = new m(this.mediator);
        }else{
            comp.init(this.mediator);
        }

        for (var prop in comp) {
            if (/*comp.hasOwnProperty(prop)
                &&*/ typeof comp[prop] === 'function'
                && prop.substring(0, 2) === 'on') {
                var event = prop.substring(2);
                console.log('bind event:', event, 'on', prop);
                this.mediator.on(event, comp[prop], {}, comp);
            }
        }
    }
};
