define(function (require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var Transitionable = require('samsara/core/Transitionable');
    var SequentialLayout = require('samsara/layouts/SequentialLayout');
    var ParallaxCats = require('../ParallaxCats');

    var JackieView = View.extend({
        defaults: {
        },
        initialize: function (options) {
            // Location of cat images
            var urls = [
                './assets/wedding1.jpg',
                './assets/wedding2.jpg',
                './assets/wedding3.jpg',
                './assets/wedding4.jpg',
                './assets/wedding5.jpg',
                './assets/wedding6.jpg',
                './assets/wedding7.jpg'
            ];

            // Create the parallaxCats view with specified options
            var parallaxCats = new ParallaxCats({
                size : [Math.min(400, window.innerWidth), undefined],
                origin: [.5, 0],
                skew : Math.PI / 25,
                parallaxAmount : 70,
                urls : urls
            });

            // Create a Samsara Context as the root of the render tree

            // Add the parallaxCats to the context and center the origin point
            this
                .add({align : [.5,0]})
                .add(parallaxCats);
        }
    });

    module.exports = JackieView;
});