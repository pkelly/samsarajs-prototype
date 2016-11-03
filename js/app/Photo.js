define(function(require, exports, module) {
    var View = require('samsara/core/View');
    var Transform = require('samsara/core/Transform');
    var Surface = require('samsara/dom/Surface');
    var ContainerSurface = require('samsara/dom/ContainerSurface');
    var GenericInput = require('samsara/inputs/GenericInput');
    var Utils = require('js/app/utils/PhotoStackUtils');
    var Transitionable = require('samsara/core/Transitionable');


    var Photo = View.extend({

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
            origin : [.5,.5],
            properties: {
            	overflow: 'hidden',
            	'z-index': options['z-index']
            }
        });

        this.container = container;

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

      	var drag = gestureInput.map(function(data){
	        return Transform.translate(data.cumulate);
	      });

	      var t = new Transitionable(0); // define a transitionable with initial value 0
	      var t2 = new Transitionable(0); // define a transitionable with initial value 0
	      var t3 = new Transitionable(0); // define a transitionable with initial value 0

	      var clickRotate = t.map(function(angle) {
	      	return Transform.rotateZ(-angle);
	      });

	      var clickCenterX = t2.map(function(amt) {
	      	
	      	return Transform.translateX(amt);
	      });

	      var clickCenterY = t3.map(function(amt) {
	      	return Transform.translateY(amt);
	      });

	      var that = this;
	      container.on('click', function() {
      		t.set(that.rotation, {curve : 'easeInOut', duration : 700});
      		//t2.set(100, {curve : 'easeInOut', duration : 700});
      		//t3.set(100, {curve : 'easeInOut', duration : 700});
      		that.emit('click');
        });

       	this.rotation = Utils.getRandomRadian();

        // Build the render subtree for the view
        this
        	.add({transform : Transform.translateX(Utils.getRandomInt(0, this.windowWidth))})
          .add({transform : Transform.translateY(Utils.getRandomInt(0, this.windowHeight))})
        	.add({transform : drag})
        	.add({transform : Transform.rotateZ(this.rotation)})

        	.add({transform : clickRotate})
        	.add({transform : clickCenterX})
        	.add({transform : clickCenterY})
        	
        	.add(container);
        }
    });

    module.exports = Photo;
});