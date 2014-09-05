/**
 * Created by Miha-ha on 05.09.14.
 */

var inherits = require('util').inherits,
    Viewport = require('./viewport'),
    CtrlRadio = require('./controls/CtrlRadio'),
    CtrlNumber = require('./controls/CtrlNumber');

var ViewportExt = module.exports = function (events, webgl) {
    Viewport.call(this, events, webgl);
};

inherits(ViewportExt, Viewport);

ViewportExt.prototype.init = function () {
    Viewport.prototype.init.call(this);

    var $viewport = this.events.$viewport;

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
    };

    this.$profile = $viewport.find('#profile');
    this.$share = $viewport.find('#share');
    this.$leftSidebar = $viewport.find('.df_left_sidebar');

    $viewport.on('click', '#sb_btn_profile', this.showProfile.bind(this));
    $viewport.on('click', '#sb_btn_share', this.showShare.bind(this));
    $viewport.on('click', '#btnProfileSave', this.saveProfile.bind(this));
    $viewport.on('click', '#btnProfileCancel', this.cancelProfile.bind(this));

    this.radioGender = new CtrlRadio('#radioGender', this.genderChanged.bind(this));
    this.radioUnits = new CtrlRadio('#radioUnits', this.unitsChanged.bind(this));

    var body = global.Dressformer.dummy.body;
    this.numberHeight = new CtrlNumber({
        selector: '#numberHeight',
        onChange: this.heightChanged.bind(this),
        value: body.height.toFixed(0),
        min: 145,
        max: 180
    });
    this.numberChest = new CtrlNumber({
        selector: '#numberChest',
        onChange: this.chestChanged.bind(this),
        value: body.chest.toFixed(0),
        min: 79,
        max: 105
    });
    this.numberUnderbust = new CtrlNumber({
        selector: '#numberUnderbust',
        onChange: this.underbustChanged.bind(this),
        value: body.underbust.toFixed(0),
        min: 65,
        max: 86
    });
    this.numberWaist = new CtrlNumber({
        selector: '#numberWaist',
        onChange: this.waistChanged.bind(this),
        value: body.waist.toFixed(0),
        min: 58,
        max: 96
    });
    this.numberHips = new CtrlNumber({
        selector: '#numberHips',
        onChange: this.hipsChanged.bind(this),
        value: body.hips.toFixed(0),
        min: 84,
        max: 124
    });

    this.paramsChanged = {}; //reset после установки начальных значений
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

    this.webgl.setParams(params);
};

ViewportExt.prototype.cancelProfile = function () {
    console.log('cancel profile');
    var body = global.Dressformer.dummy.body;
    this.numberHeight.setValue(body.height.toFixed(0));
    this.numberChest.setValue(body.chest.toFixed(0));
    this.numberUnderbust.setValue(body.underbust.toFixed(0));
    this.numberWaist.setValue(body.waist.toFixed(0));
    this.numberHips.setValue(body.hips.toFixed(0));

    this.paramsChanged = {};
};






