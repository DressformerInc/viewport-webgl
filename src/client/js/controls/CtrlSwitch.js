/**
 * Created by Miha-ha on 06.09.14.
 */
var $ = require('../../../../libs/jquery-2.1.1.min');

var CtrlSwitch = module.exports = function (options) {
    this.$el = $(options.selector);
    this.$el.on('click', this.onClick.bind(this));
    this.$icon = this.$el.find('.df_icon');
    this.onChange = options.onChange;


    this.firstIcon = options.firstIcon || '&#xf060;';
    this.firstText = options.firstText || 'Put on';
    this.secondIcon = options.secondIcon || '&#xf061;';
    this.secondText = options.secondText || 'Put off';

    this.setValue(options.value)
};

CtrlSwitch.prototype.setValue = function (value) {
    this.value = value;
    if (this.value) {
        this.$icon.text(this.firstIcon);
        this.$el.text(this.firstText);
    }else {
        this.$icon.text(this.secondIcon);
        this.$el.text(this.secondText);
    }
};

CtrlSwitch.prototype.onClick = function (e) {
    this.setValue(!this.value);
};