/**
 * Created by Miha-ha on 05.09.14.
 */
var $ = require('../../../../libs/jquery-2.1.1.min');

var CtrlNumber = module.exports = function (selector, onChange) {
    this.$el = $(selector);
    this.$plus = this.$el.find('.dfpbm_plus');
    this.$minus = this.$el.find('.dfpbm_minus');
    this.$input = this.$el.find('.dfpbm_enter');
    this.value = +this.$input.text();

    this.$plus.on('click', this.onPlusClick.bind(this));
    this.$minus.on('click', this.onMinusClick.bind(this));

    this.onChange = onChange;
};

CtrlNumber.prototype.onPlusClick = function (e) {
    this.value += 0.5;
    this.$input.text(this.value);
    this.onChange(this.value);
};

CtrlNumber.prototype.onMinusClick = function (e) {
    this.value-=0.5;
    this.$input.text(this.value);
    this.onChange(this.value);
};