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
          src: options.urls[i],
          index: i,
          size: [400,300]
        });


        this
          .add({transform : Transform.translateX(this.getRandomInt(0,this.width))})
          .add({transform : Transform.translateY(this.getRandomInt(0,this.height))})
          .add({transform : Transform.rotateZ(this.getRandomRadian())})
          .add(photo);
      }
    },
    getRandomInt: function (minInt, maxInt) {
      return Math.floor(Math.random() * (maxInt - minInt)) + minInt;
    },

    getRandomRadian: function () {
      return Math.random() * 2 * Math.PI;
    }
  });

  module.exports = PhotoStack;
});
