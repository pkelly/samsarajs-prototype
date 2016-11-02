define(function (require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var Transitionable = require('samsara/core/Transitionable');
    var SequentialLayout = require('samsara/layouts/SequentialLayout');
    var PhotoStack = require('../PhotoStack');


    var PeterView = View.extend({
        defaults: {
        },
        initialize: function (options) {
            var urls = [
                './assets/wedding1.jpg',
                './assets/wedding2.jpg',
                './assets/wedding3.jpg',
                './assets/wedding4.jpg',
                './assets/wedding5.jpg',
                './assets/wedding6.jpg',
                './assets/wedding7.jpg'
            ];

            var photoStack = new PhotoStack({
                size : [window.innerWidth, window.innerHeight],
                urls : urls
            });

            this.add(photoStack);
        }
    });

    module.exports = PeterView;
});