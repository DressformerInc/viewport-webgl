/**
 * Created by Miha-ha on 05.09.14.
 */
var $ = require('../../../../libs/jquery-2.1.1.min');

var CtrlRadioMatcap = module.exports = function (selector, onChange) {
    this.$el = $(selector);
    this.$el.on('click', '.dfp_mat', this.onClick.bind(this));
    this.$buttons = this.$el.find('.dfp_mat');
    this.onChange = onChange;
};

CtrlRadioMatcap.prototype.onClick = function (e) {
    var $target = $(e.target);

    if ($target.hasClass('df_icon')) $target = $target.parent();

    if (!$target.hasClass('active')){
        this.$buttons.removeClass('active');
        $target.addClass('active');
        this.onChange($target.data('value'));
    }

};