define(function (require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var Transitionable = require('samsara/core/Transitionable');
    var SequentialLayout = require('samsara/layouts/SequentialLayout');

    var JackieView = View.extend({
        defaults: {
        },
        initialize: function (options) {
            var surface = new Surface({
                 content : 'JackieView',
                 size : [],
                 properties : {background : '#E51919', color: 'white'}
             });

            this.add(surface);
            }
        });

    module.exports = JackieView;
});