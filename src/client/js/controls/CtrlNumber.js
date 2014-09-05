/**
 * Created by Miha-ha on 05.09.14.
 */
var $ = require('../../../../libs/jquery-2.1.1.min'),
    utils = require('../utils');

var CtrlNumber = module.exports = function (options) {
    this.$el = $(options.selector);
    this.onChange = options.onChange;
    this.min = options.min || 0;
    this.max = options.max || 100;

    this.$plus = this.$el.find('.dfpbm_plus');
    this.$minus = this.$el.find('.dfpbm_minus');
    this.$input = this.$el.find('.dfpbm_enter');

    if (options.value) {
        this.setValue(options.value);
    }

    this.dirtyValue = '';
    this.$input
        .on('keyup paste', function (e) {
            var $target = $(e.target),
                value = +$target.text() || this.min;
            if (this.value !== value) {
                this.dirtyValue = value;
            }
            return $target;
        }.bind(this))
        .on('keypress', function (e) {
            if (e.which == 13) {
                this.setValue(this.dirtyValue);
                return false;
            }
        }.bind(this))
        .on('blur', function (e) {
            this.setValue(this.dirtyValue);
        }.bind(this));

    this.$plus.on('click', this.onPlusClick.bind(this));
    this.$minus.on('click', this.onMinusClick.bind(this));
//    this.$input.on('change', this.onInputChange.bind(this));


    return this;
};

CtrlNumber.prototype.setValue = function (value) {
    this.value = utils.clamp(+value, this.min, this.max);
    this.$input.text(this.value);
    this.onChange(this.value);
    return this;
};

//CtrlNumber.prototype.onInputChange = function () {
//    this.onChange(this.value);
//};


CtrlNumber.prototype.onPlusClick = function (e) {
    this.setValue(this.value += 0.5);
};

CtrlNumber.prototype.onMinusClick = function (e) {
    this.setValue(this.value -= 0.5);
};