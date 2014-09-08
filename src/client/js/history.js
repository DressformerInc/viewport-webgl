/**
 * Created by Miha-ha on 08.09.14.
 */
var History = module.exports = {
    history: [],
    index: -1,
    back: function () {
        if (this.index - 1 >= 0) {
            return this.history[--this.index];
        }
        return null;
    },
    forward: function () {
        if (this.index + 1 < this.history.length) {
            return this.history[++this.index];
        }

        return null;
    },
    push: function (state) {
        if (this.index >= 0 && this.index < this.history.length - 1) {
            this.history = this.history.slice(0, this.index);
        }

        this.history.push(state);
        this.index = this.history.length - 1;
    }
};