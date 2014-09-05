/**
 * Created by Miha-ha on 05.09.14.
 */

var inherits = require('util').inherits,
    Viewport = require('./viewport'),
    CtrlRadio = require('./controls/CtrlRadio'),
    CtrlNumber = require('./controls/CtrlNumber');

var ViewportExt = module.exports = function (events, webgl) {
    Viewport.call(this, events);
    this.webgl = webgl;
    this.paramsChanged = {};
    this.params = {
        height: {
            min:145,
            max:180
        },
        chest: {
            min: 78.68,
            max: 105.037
        },
        underbust: {
            min: 64.598,
            max: 86.109
        },
        waist: {
            min: 57.462,
            max: 96.18
        },
        hips: {
            min: 83.394,
            max: 124.027
        }
    }
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
    $viewport.on('click', '#btnProfileSave', this.saveProfile.bind(this));
    $viewport.on('click', '#btnProfileCancel', this.cancelProfile.bind(this));

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
    this.paramsChanged.height = value;
};

ViewportExt.prototype.chestChanged = function (value) {
    console.log('chest changed:', value);
    this.paramsChanged.chest = value;
};

ViewportExt.prototype.underbustChanged = function (value) {
    console.log('underbust changed:', value);
    this.paramsChanged.underbust = value;
};

ViewportExt.prototype.waistChanged = function (value) {
    console.log('waist changed:', value);
    this.paramsChanged.waist = value;
};

ViewportExt.prototype.hipsChanged = function (value) {
    console.log('hips changed:', value);
    this.paramsChanged.hips = value;
};

ViewportExt.prototype.saveProfile = function () {
    var params = [];
    for (var param in this.paramsChanged) {
        if (this.paramsChanged.hasOwnProperty(param)){
            params.push(param+'='+this.paramsChanged[param].toFixed(0))
        }
    }

    this.paramsChanged = {};

    this.webgl.setParams(params);
};

ViewportExt.prototype.cancelProfile = function () {
    console.log('cancel profile');
};






