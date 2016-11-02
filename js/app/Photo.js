define(function(require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var ContainerSurface = require('samsara/dom/ContainerSurface');

    var Photo = View.extend({
    	defaults : {
          // src : '',
          // index : 0,
          // rotation : 0
        },

        initialize: function (options) {
        	// Each image is placed inside a container with
          // `overflow : hidden` to clip the content
        	var container = new ContainerSurface({
              classes: ['photostack-photo'],
              properties: {
              	overflow: 'hidden'
              }
          });

           // Create photo
          var photo = new Surface({
              tagName : 'img',
              origin : options.origin,
              size : options.size,
              attributes : {src : options.src}
          });

          // Build the render subtree inside the container
          container.add(photo);

          // Build the render subtree for the view
          this.add(container);
        }
    });

    module.exports = Photo;
});