define(function (require, exports, module) {
  var View = require('samsara/core/View');
  var Transform = require('samsara/core/Transform');
  var Surface = require('samsara/dom/Surface');
  var Transitionable = require('samsara/core/Transitionable');

  WALL_LENGTH = 200;

  var Hallway = View.extend({
      defaults : {
          images: []
      },
      initialize: function (options) {

          this.addWallCircle(options.images);

      },

      addWallCircle : function(images) {
        n = images.length;
        theta = Math.PI*2/n;
        r = 2 * WALL_LENGTH/(2*Math.sin(theta/2))

        for(i=0; i<images.length; i++) {
          var wall = new Surface({
            content: '<img src=\"' + images[i] + '\"\\>',
            size: [WALL_LENGTH, 200],
            classes: ['face']
          });
          this.add({
              transform: Transform.thenMove(
                      Transform.rotateY(((i) * theta)),
                      [r * Math.sin((i-0.5)*theta), 0, r*Math.cos((i-0.5)*theta)]
                  )
          }).add(wall);
        }
      }
  });
  module.exports = Hallway;
});
