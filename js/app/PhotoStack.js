define(function (require, exports, module) {
    var View = require('samsara/core/View');
    var Surface = require('samsara/dom/Surface');
    var Transform = require('samsara/core/Transform');
    //var Scrollview = require('samsara/layouts/Scrollview');
    var Photo = require('./Photo');

    // ParallaxCats is a scrollview of ParallaxCat images
    var PhotoStack = View.extend({
        defaults: {
            // skew : 0,
            //parallaxAmount : ,
            width : '',
            height : '',
            urls : []
        },
        initialize: function (options) {
            this.setSize(options.size)
            this.width = options.size[0]
            this.height = options.size[1]

            // Create the photos
            var photos = [];
            for (var i = 0; i < options.urls.length; i++) {
                var photo = new Photo({
                    // proportions : [1, 1/2],
                    src: options.urls[i],
                    index: i,
                    origin : [.5,.5],   // sets the "origin" point to the center of the surface
                    size: [400,300]
                });

                var translateAndRotate = Transform.compose(
                    Transform.translateX(this.getRandomInt(0,900)),
                    //Transform.rotateZ(2)
                    Transform.translateY(this.getRandomInt(0,this.height))
                   //Transform.rotateZ(2)
                );

                this
                    .add({transform : Transform.translateX(this.getRandomInt(0,this.width))})
                    .add({transform : Transform.translateY(this.getRandomInt(0,this.height))})
                    .add({transform : Transform.rotateZ(this.getRandomInt(0,2*Math.floor(Math.PI)))})
                    .add(photo);
            }

            //scrollview.addItems(cats);

            // Build the render subtree consisting of only the scrollview
            //this.add(photos);
        },
        getRandomInt: function (minInt, maxInt) {
            return Math.floor(Math.random() * (maxInt - minInt)) + minInt;
        }
    });

    module.exports = PhotoStack;
});
