define(function (require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var Transitionable = require('samsara/core/Transitionable');
    var SequentialLayout = require('samsara/layouts/SequentialLayout');

    var PhilView = View.extend({
        defaults: {
        },
        initialize: function (options) {
            var surface = new Surface({
                 content : 'PhilView',
                 size : [],
                 properties : {background : '#3651FE', color: 'white'}
             });

            this.add(surface);
            }
        });

    module.exports = PhilView;
});