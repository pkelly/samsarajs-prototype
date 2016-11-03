define(function(require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var ContainerSurface = require('samsara/dom/ContainerSurface');
    var GenericInput = require('samsara/inputs/GenericInput');
    var Utils = require('js/app/utils/PhotoStackUtils');
    var ContainerSurface = require('samsara/dom/ContainerSurface');
    var Photo = require('./Photo');

    var PhotoWrapper = View.extend({

      initialize: function (options) {

        var photo = new Photo({
          src: options.src,
          index: options.index,
          size: [400,300],
          windowDimensions: [options.windowDimensions[0], options.windowDimensions[1]],
        });

        var container = new ContainerSurface({
            properties: {
              border: '1px solid red',
              
            }
        });

        container.add(photo);

        this.add(container);
      }
    });

    module.exports = PhotoWrapper;
});