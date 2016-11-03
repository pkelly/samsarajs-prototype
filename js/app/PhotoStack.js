define(function (require, exports, module) {
  var View = require('samsara/core/View');
  var Surface = require('samsara/dom/Surface');
  var Transform = require('samsara/core/Transform');
  var GenericInput = require('samsara/inputs/GenericInput');
  var MouseInput = require('samsara/inputs/MouseInput');
  var TouchInput = require('samsara/inputs/TouchInput');

  var Photo = require('./Photo');

  // ParallaxCats is a scrollview of ParallaxCat images
  var PhotoStack = View.extend({
    defaults: {
      width : '',
      height : '',
      urls : []
    },
    initialize: function (options) {
      this.setSize(options.size)
      this.width = options.size[0]
      this.height = options.size[1]

      this.zindex = 100;

      // Register all the inputs we need
      // Ids registered can be used globally in the application
      GenericInput.register({
         "mouse" : MouseInput,
         "touch" : TouchInput
      });

      // Create the photos
      this.photos = [];
      for (var i = 0; i < options.urls.length; i++) {
        var photo = new Photo({
          src: options.urls[i],
          index: i,
          'z-index': i,
          size: [250,175],
          windowDimensions: [this.width, this.height]
        });

        this.photos.push(photo);

        var that = this;
        photo.on('click', function(){
          that.movePhotoToFront(this);
        });

        this.add(photo);
      }
    },

    movePhotoToFront: function(photo) {
      photo.container.setProperties({'z-index': ++this.zindex});
    }
  });

  module.exports = PhotoStack;
});
