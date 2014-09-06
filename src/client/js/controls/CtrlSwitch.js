/**
 * Created by Miha-ha on 06.09.14.
 */
var $ = require('../../../../libs/jquery-2.1.1.min');

var CtrlSwitch = module.exports = function (options) {
    this.$el = $(options.selector);
    this.$el.on('click', this.onClick.bind(this));
    this.$icon = this.$el.find('.df_icon');
    this.$text = this.$el.find('.df_text');
    this.onChange = options.onChange;


    this.firstIcon = options.firstIcon || String.fromCharCode(parseInt('f060', 16));//'&#xf060;';
    this.firstText = options.firstText || 'Put on';
    this.secondIcon = options.secondIcon || String.fromCharCode(parseInt('f061', 16));//&#xf061;
    this.secondText = options.secondText || 'Put off';

    this.setValue(options.value, true)
};

CtrlSwitch.prototype.setValue = function (value, notFireEvent) {
    this.value = value;
    if (this.value) {
        this.$icon.html(this.firstIcon);
        this.$text.text(this.firstText);
    }else {
        this.$icon.html(this.secondIcon);
        this.$text.text(this.secondText);
    }

    if (!notFireEvent) this.onChange(this.value);
};

CtrlSwitch.prototype.onClick = function (e) {
    this.setValue(!this.value);
};