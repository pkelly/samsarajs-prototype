define(function(require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var ContainerSurface = require('samsara/dom/ContainerSurface');
    var GenericInput = require('samsara/inputs/GenericInput');
    var Utils = require('js/app/utils/PhotoStackUtils');


    var Photo = View.extend({
    	defaults : {
        index : 0,
      },

      initialize: function (options) {
      	this.windowDimensions = options.windowDimensions;
      	this.windowWidth = this.windowDimensions[0];
        this.windowHeight = this.windowDimensions[1];

        // Create photo
        var photo = new Surface({
            tagName : 'img',
            size : options.size,
            attributes : {src : options.src}
        });

      	// Each image is placed inside a container with
        // `overflow : hidden` to clip the content
      	var container = new ContainerSurface({
            classes: ['photostack-photo'],
            properties: {
            	overflow: 'hidden'
            }
        });

        // container.setProperties({ 'z-index': '1' });

        // Build the render subtree inside the container
        container
        	.add(photo);

        //Create a gesture input unifying touch and mouse inputs.
	      var gestureInput = new GenericInput(
	          ['mouse', 'touch'],
	          { 
	            directionX : GenericInput.DIRECTION.X,
	            directionY : GenericInput.DIRECTION.Y
	          }
	      );

        // gestureInput now listens to the DOM events originating from the surface
      	gestureInput.subscribe(container);

      	// gestureInput.on('start', function(payload){ 
      	// console.log('start')            
       //    container.toggleClass('photostack-dragging');
       //  });

      	// gestureInput.on('end', function(payload){         
      	// 	console.log('end')
       //    container.toggleClass('photostack-photo');
       //  });

      	var drag = gestureInput.map(function(data){
	          return Transform.translate(data.cumulate);
	          
	      });

        // Build the render subtree for the view
        this
        	.add({transform : Transform.translateX(Utils.getRandomInt(0, this.windowWidth))})
          .add({transform : Transform.translateY(Utils.getRandomInt(0, this.windowHeight))})
        	.add({transform : drag})
        	.add({transform : Transform.rotateZ(Utils.getRandomRadian())})
        	.add(container);
        }
    });

    module.exports = Photo;
});