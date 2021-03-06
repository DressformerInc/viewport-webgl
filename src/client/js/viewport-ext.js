/**
 * Created by Miha-ha on 05.09.14.
 */

var $ = require('../../../libs/jquery-2.1.1.min'),
    inherits = require('util').inherits,
    Viewport = require('./viewport'),
    CtrlRadio = require('./controls/CtrlRadio'),
    CtrlRadioMatcap = require('./controls/CtrlRadioMatcap'),
    CtrlSwitch = require('./controls/CtrlSwitch'),
    CtrlNumber = require('./controls/CtrlNumber'),
    history = require('./history'),
    DF = global.Dressformer;

var ViewportExt = module.exports = function (mediator) {
    Viewport.call(this, mediator);
};

inherits(ViewportExt, Viewport);

ViewportExt.prototype.init = function () {
    Viewport.prototype.init.call(this);

    var $viewport = this.$viewport;

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
    this.old = {};
    this.selected = {};
    this.historyIndex = -1;
    this.history = [];

    this.$profile = $viewport.find('#profile');
    this.$share = $viewport.find('#share');
    this.$dummy = $viewport.find('#dummy');

    this.$leftSidebar = $viewport.find('.df_left_sidebar');
    this.$rightSidebar = $viewport.find('.df_widget_right_panel');
    this.$garmentInfo = $viewport.find('#df_garment_set');

    //left controls
    $viewport.on('click', '#sb_btn_profile', this.showProfile.bind(this));
    $viewport.on('click', '#sb_btn_share', this.showShare.bind(this));
    $viewport.on('click', '#sb_btn_dummy', this.showDummy.bind(this));
    $viewport.on('click', '#btnProfileSave', this.saveProfile.bind(this));
    $viewport.on('click', '#btnProfileCancel', this.cancelProfile.bind(this));

    this.radioGender = new CtrlRadio('#radioGender', this.genderChanged.bind(this));
    this.radioMatcaps = new CtrlRadioMatcap('#radioMatcap', this.matcapChanged.bind(this));
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

    //right controls
    $viewport.on('click', '.dfrp_garment', this.selectGarment.bind(this));
    $viewport.on('click', '#buttonRemoveFromList', this.removeFromList.bind(this));
    this.switchPut = new CtrlSwitch({
        selector: '#switchPut',
        value: true,
        onChange: this.putChanged.bind(this)
    });
    this.$preview = $viewport.find('.df_garment_preview');
    $viewport.on('click', '.dfw_close', function () {
        global.parent && global.parent.postMessage({method: 'closeWidget', params: []}, '*');
    });

    //history controls
    $viewport.on('click', '.dfwv_history_back', this.historyBack.bind(this));
    $viewport.on('click', '.dfwv_history_forward', this.historyForward.bind(this));

    //this.webgl.ee.on('garmentloaded', function () {
    //    setTimeout(function () {
    //        console.log('garment loaded');
    //        if (this.selected && this.selected.button && !this.selected.button.data('screenshot')) {
    //            var screenshot = this.webgl.getScreenshot();
    //            this.selected.button.css('background-image', 'url("' + screenshot + '")');
    //            this.$preview.css('background-image', 'url("' + screenshot + '")');
    //            this.selected.button.data('screenshot', true)
    //        }
    //    }.bind(this), 50);
    //
    //}.bind(this));

    //ui init
    this.showProfile();
    if (DF.garment && DF.garment.id) {
        var $button = $('.dfrp_garment[data-garment="' + DF.garment.id + '"]').first();
        $button.data('selected', true);
        $button.find('.dfrpg_select').show();
        this._selectGarment(DF.garment.id, $button, true);
    }
};

ViewportExt.prototype.getBaseParams = function () {
    var params = global.Dressformer.user.dummy.body;
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

ViewportExt.prototype.showDummy = function () {
    this.$leftSidebar.css('left', '0');
    this.$dummy.css('left', '200px');
};

ViewportExt.prototype.genderChanged = function (value) {
    console.log('gender changed:', value);
};

ViewportExt.prototype.matcapChanged = function (value) {
    console.log('mapcap changed:', value);
    this.dummy.setMatcap(value);
    this.mediator.emit('StartRender');
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
    this.removeGarments();
    var params = this.getParams(true);
    this.loadModels(params);
};

ViewportExt.prototype.cancelProfile = function () {

    for (var param in this.params) {
        if (this.params.hasOwnProperty(param)) {
            this.params[param].setValue(this.baseParams[param]);
        }
    }

//    this.webgl.setParams(this.getParams());
};

ViewportExt.prototype.unSelectAll = function () {
    $('.dfrp_garment').each(function () {
        $this = $(this);
        $this.data('selected', false);
        $this.find('.dfrpg_select').hide();
    });

};

ViewportExt.prototype._selectGarment = function (id, $button, animate) {
    var me = this,
        duration = 100,
        right = parseInt(this.$garmentInfo.css('right'));

//    if (me.old && me.old.id && me.old.id === me.selected.id) return;

    me.old = me.selected;
    me.selected = {
        id: id,
        button: $button
    };

    function updateInfo() {
        me.$preview.css('background-image', $button.css('background-image'));
        var switchValue = !$button.data('selected');
        me.switchPut.setValue(switchValue, true);
        animate && me.$garmentInfo.css('right', '200px');
    }

    if (right < 200) {
        updateInfo();
    } else {
        animate && this.$garmentInfo.css('right', 0);
        setTimeout(updateInfo, duration)
    }

};

ViewportExt.prototype.selectGarment = function (e) {
    var $target = $(e.target);

    e.preventDefault();

    this._selectGarment($target.data('garment'), $target, true);

};

ViewportExt.prototype.putChanged = function (value, noHistory) {
    if (!value) {   //put on garment

        this.mediator.emit('GarmentAdd', this.garmentsHistory[this.selected.id]);


        if (!noHistory) {
            history.push({
                mode: value,
                selected: this.selected
            });
        }

    } else {    //put off garment
        this.mediator.emit('GarmentRemove', this.garmentsHistory[this.selected.id]);

        if (!noHistory) {
            history.push({
                mode: value,
                selected: this.selected
            });
        }

    }

};

ViewportExt.prototype.removeFromList = function (e) {
    this.selected.button.remove();
    this.$garmentInfo.css('right', '0');
};


ViewportExt.prototype.historyBack = function () {
    var state = history.back();
    if (state) {

        state.selected.button.data('selected', true);
        this._selectGarment(state.selected.id, state.selected.button, false);
        this.putChanged(state.mode, true);
    }
};

ViewportExt.prototype.historyForward = function () {
    var state = history.forward();
    if (state) {
        state.selected.button.data('selected', true);
        this._selectGarment(state.selected.id, state.selected.button, false);
        this.putChanged(state.mode, true);
    }
};

ViewportExt.prototype.onGarmentAdded = function (garment) {
    var $button = $('.dfrp_garment[data-garment="' + garment.id + '"]');
    if ($button) {
        $button
            .first()
            .data('selected', true)
            .find('.dfrpg_select')
            .show();
    }
};

ViewportExt.prototype.onGarmentRemoved = function (garment) {
    var $button = $('.dfrp_garment[data-garment="' + garment.id + '"]');
    if ($button) {
        $button
            .first()
            .data('selected', false)
            .find('.dfrpg_select')
            .hide();
    }

    //TODO: update location.href
    //var url = global.location.href.replace();
    //global.history.pushState("garment removed", "Dressformer", url);
};

ViewportExt.prototype.removeGarments = function () {
    for(var id in this.garments){
        this.mediator.emit('Remove', this.garments[id].model);
    }
};

ViewportExt.prototype.onGarmentAdd = function (garment) {
    //put off all garments
    this.removeGarments();

    this.garments[garment.id] = garment;
    this.loadModels(this.getParams(true), true);
};

ViewportExt.prototype.onGarmentRemove = function (garment) {
    //put off all garments
    this.removeGarments();

    this.mediator.emit('GarmentRemoved', garment);

    delete this.garments[garment.id];
    this.loadModels(this.getParams(true), true);
};
