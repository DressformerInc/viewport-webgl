/**
 * Created by Miha-ha on 05.09.14.
 */
var $ = require('../../../../libs/jquery-2.1.1.min');

var CtrlRadio = module.exports = function (selector, onChange) {
    this.$el = $(selector);
    this.$el.on('click', this.onClick.bind(this));
    this.$buttons = this.$el.find('.dfpb_radio');
    this.onChange = onChange;
};

CtrlRadio.prototype.onClick = function (e) {
    var $target = $(e.target);

    if ($target.hasClass('dfpb_radio') && !$target.hasClass('dfpb_radio_on')){
        this.$buttons.removeClass('dfpb_radio_on');
        $target.addClass('dfpb_radio_on');
        this.onChange($target.data('value'));
    }

};