/**
 * Created by Miha-ha on 05.09.14.
 */

var $ = require('../../../libs/jquery-2.1.1.min'),
    inherits = require('util').inherits,
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


    this.baseParams = this.getBaseParams();
    /*
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
     */
    this.selectedGarment = {};

    this.$profile = $viewport.find('#profile');
    this.$share = $viewport.find('#share');
    this.$leftSidebar = $viewport.find('.df_left_sidebar');
    this.$rightSidebar = $viewport.find('.df_widget_right_panel');
    this.$garmentInfo = $viewport.find('.df_garment_set');

    //left controls
    $viewport.on('click', '#sb_btn_profile', this.showProfile.bind(this));
    $viewport.on('click', '#sb_btn_share', this.showShare.bind(this));
    $viewport.on('click', '#btnProfileSave', this.saveProfile.bind(this));
    $viewport.on('click', '#btnProfileCancel', this.cancelProfile.bind(this));

    //right controls
    $viewport.on('click', '.dfrp_garment', this.selectGarment.bind(this));

    this.radioGender = new CtrlRadio('#radioGender', this.genderChanged.bind(this));
    this.radioUnits = new CtrlRadio('#radioUnits', this.unitsChanged.bind(this));
    this.params = {
        height: new CtrlNumber({
            selector: '#numberHeight',
            onChange: this.heightChanged.bind(this),
            value: this.baseParams.height,
            min: 145,
            max: 180
        }),
        chest: new CtrlNumber({
            selector: '#numberChest',
            onChange: this.chestChanged.bind(this),
            value: this.baseParams.chest,
            min: 79,
            max: 105
        }),
        underbust: new CtrlNumber({
            selector: '#numberUnderbust',
            onChange: this.underbustChanged.bind(this),
            value: this.baseParams.underbust,
            min: 65,
            max: 86
        }),
        waist: new CtrlNumber({
            selector: '#numberWaist',
            onChange: this.waistChanged.bind(this),
            value: this.baseParams.waist,
            min: 58,
            max: 96
        }),
        hips: new CtrlNumber({
            selector: '#numberHips',
            onChange: this.hipsChanged.bind(this),
            value: this.baseParams.hips,
            min: 84,
            max: 124
        })
    };

};

ViewportExt.prototype.getBaseParams = function () {
    var params = global.Dressformer.dummy.body;
    for (var param in params) {
        if (params.hasOwnProperty(param)) {
            params[param] = +params[param].toFixed(0);
        }
    }
    console.log('base params:', params);
    return params;
};

ViewportExt.prototype.getParams = function (onlyChanged) {
    var params = [];

    for (var param in this.params) {
        if (this.params.hasOwnProperty(param)) {
            var value = this.params[param].value;
            if (onlyChanged && value == this.baseParams[param]) {
                continue;
            }

            params.push(param + '=' + value);

        }
    }

    return params;
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
//    this.paramsChanged.height = value;
};

ViewportExt.prototype.chestChanged = function (value) {
    console.log('chest changed:', value);
//    this.paramsChanged.chest = value;
};

ViewportExt.prototype.underbustChanged = function (value) {
    console.log('underbust changed:', value);
//    this.paramsChanged.underbust = value;
};

ViewportExt.prototype.waistChanged = function (value) {
    console.log('waist changed:', value);
//    this.paramsChanged.waist = value;
};

ViewportExt.prototype.hipsChanged = function (value) {
    console.log('hips changed:', value);
//    this.paramsChanged.hips = value;
};

ViewportExt.prototype.saveProfile = function () {
    this.webgl.setParams(this.getParams(true));
};

ViewportExt.prototype.cancelProfile = function () {
    console.log('cancel profile');

    for (var param in this.params) {
        if (this.params.hasOwnProperty(param)) {
            this.params[param].setValue(this.baseParams[param]);
        }
    }

};

ViewportExt.prototype.selectGarment = function (e) {
    var $target = $(e.target),
        garmentId = $target.data('garment');

    this.$garmentInfo.css('right', '200px');
    console.log('garment id:', garmentId);
    this.webgl.load(garmentId, this.getParams(true));
};






