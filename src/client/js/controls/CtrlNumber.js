/**
 * Created by Miha-ha on 05.09.14.
 */
var $ = require('../../../../libs/jquery-2.1.1.min');

var CtrlNumber = module.exports = function (selector, onChange) {
    this.$el = $(selector);
    this.$plus = this.$el.find('.dfpbm_plus');
    this.$minus = this.$el.find('.dfpbm_minus');
    this.$input = this.$el.find('.dfpbm_enter');
    this.$input
        .on('blur keyup paste', function (e) {
            var $target = $(e.target),
                value = +$target.text();
            if (this.value !== value) {
                this.value = value;
                $target.trigger('change');
            }
            return $target;
        }.bind(this))
        .on("keypress", function (e) {
            if (e.which == 13) {
                return false;
            }
        });
    this.value = +this.$input.text();

    this.$plus.on('click', this.onPlusClick.bind(this));
    this.$minus.on('click', this.onMinusClick.bind(this));
    this.$input.on('change', this.onInputChange.bind(this));

    this.onChange = onChange;

    return this;
};

CtrlNumber.prototype.setValue = function (value) {
    this.value = value;
    this.$input.text(this.value);
    this.onChange(this.value);
    return this;
};

CtrlNumber.prototype.onInputChange = function () {
    this.onChange(this.value);
};


CtrlNumber.prototype.onPlusClick = function (e) {
    this.setValue(this.value += 0.5);
};

CtrlNumber.prototype.onMinusClick = function (e) {
    this.setValue(this.value -= 0.5);
};