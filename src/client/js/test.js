/**
 * Created by Miha-ha on 07.10.14.
 */
module.exports = {
    init: function (mediator) {
        this.mediator = mediator;
    },
    onTest: function (data) {
        console.log('test:', data);
    }
};