define(function (require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var Transitionable = require('samsara/core/Transitionable');
    var SequentialLayout = require('samsara/layouts/SequentialLayout');

    var NicoletteView = View.extend({
        defaults: {
        },
        initialize: function (options) {
            var surface = new Surface({
                 content : 'NicoletteView',
                 size : [],
                 properties : {background : '#E900E9', color: 'white'}
             });

            this.add(surface);
            }
        });

    module.exports = NicoletteView;
});