/**
 * Created by Miha-ha on 05.09.14.
 */

var inherits = require('util').inherits,
    Viewport = require('./viewport'),
    CtrlRadio = require('./controls/CtrlRadio'),
    CtrlNumber = require('./controls/CtrlNumber');

var ViewportExt = module.exports = function (events) {
    Viewport.call(this, events);
};

inherits(ViewportExt, Viewport);

ViewportExt.prototype.init = function () {
    Viewport.prototype.init.call(this);

    var $viewport = this.events.$viewport;

    this.$profile = $viewport.find('#profile');
    this.$share = $viewport.find('#share');
    this.$leftSidebar = $viewport.find('.df_left_sidebar');

    $viewport.on('click', '#sb_btn_profile', this.showProfile.bind(this));
    $viewport.on('click', '#sb_btn_share', this.showShare.bind(this));

    this.radioGender = new CtrlRadio('#radioGender', this.genderChanged.bind(this));
    this.radioUnits = new CtrlRadio('#radioUnits', this.unitsChanged.bind(this));

    this.numberHeight = new CtrlNumber('#numberHeight', this.heightChanged.bind(this));
    this.numberChest = new CtrlNumber('#numberChest', this.chestChanged.bind(this));
    this.numberUnderbust = new CtrlNumber('#numberUnderbust', this.underbustChanged.bind(this));
    this.numberWaist = new CtrlNumber('#numberWaist', this.waistChanged.bind(this));
    this.numberHips = new CtrlNumber('#numberHips', this.hipsChanged.bind(this));

};

ViewportExt.prototype.showProfile = function () {
    this.$leftSidebar.css('left', '0');
    this.$profile.css('left', '200px');
};

ViewportExt.prototype.showShare = function () {
    this.$leftSidebar.css('left', '0');
    this.$share.css('left', '200px');
};

ViewportExt.prototype.genderChanged = function (value) {
    console.log('gender changed:', value);
};

ViewportExt.prototype.unitsChanged = function (value) {
    console.log('units changed:', value);
};

ViewportExt.prototype.heightChanged = function (value) {
    console.log('heihgt changed:', value);
};

ViewportExt.prototype.chestChanged = function (value) {
    console.log('chest changed:', value);
};

ViewportExt.prototype.underbustChanged = function (value) {
    console.log('underbust changed:', value);
};

ViewportExt.prototype.waistChanged = function (value) {
    console.log('waist changed:', value);
};

ViewportExt.prototype.hipsChanged = function (value) {
    console.log('hips changed:', value);
};






