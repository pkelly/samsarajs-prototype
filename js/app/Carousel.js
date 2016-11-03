define(function (require, exports, module) {
    var View = require('samsara/core/View');
    var Surface = require('samsara/dom/Surface');
    var Scrollview = require('samsara/layouts/Scrollview');
    var PhilView = require('./screens/PhilView');
    var JackieView = require('./screens/JackieView');
    var PeterView = require('./screens/PeterView');
    var JoshView = require('./screens/JoshView');
    var NicoletteView = require('./screens/NicoletteView');

    var Dots = require('./Dots');
    var Arrows = require('./Arrows');

    var Carousel = View.extend({
        defaults: {
            pages: 10
        },
        initialize: function (options) {
            // Tracks the current page state
            this.currentPage = 0;

            // Create the arrows, dots and scrollview
            this.createArrows(options.arrows);
            this.createDots(options.dots);
            this.createScrollview();

            // Create the surfaces with uniformly graded hues
            var hue = 0;
            var surfaces = [];

            surfaces.push(new PeterView());
            surfaces.push(new PhilView());
            surfaces.push(new JackieView());
            surfaces.push(new JoshView());
            surfaces.push(new NicoletteView());

            // Add the surfaces to the carousel
            this.addItems(surfaces);
        },
        createArrows : function(options){
            this.arrows = new Arrows(options);

            // Transition the scrollview to the next page
            this.arrows.on('next', function () {
                if (this.currentPage < this.options.pages - 1)
                    this.scrollview.goTo(++this.currentPage);
            }.bind(this));

            // Transition the scrollview to the previous page
            this.arrows.on('prev', function () {
                if (this.currentPage > 0)
                    this.scrollview.goTo(--this.currentPage);
            }.bind(this));

            // Add the arrows the render subtree
            this.add(this.arrows);
        },
        createScrollview : function(options){
            // Patch the options with necessary defaults
            options = options || {};
            options.direction = Scrollview.DIRECTION.X;
            options.paginated = true;

            this.scrollview = new Scrollview(options);

            // Update the current page in case the user has changed
            // it by scrolling
            this.scrollview.on('page', function (index) {
                this.currentPage = index;
                this.dots.goTo(index);
            }.bind(this));

            // Check if the scrollview is at the beginning or end
            this.scrollview.on('update', function (data) {
                (data.index == 0 && data.progress < .5)
                    ? this.arrows.hideLeft()
                    : this.arrows.showLeft();

                (data.index == this.options.pages - 1 && data.progress > .5)
                    ? this.arrows.hideRight()
                    : this.arrows.showRight();
            }.bind(this));

            this.add(this.scrollview);
        },
        createDots : function(options){
            this.dots = new Dots(options);

            // Calculate the size of the dots
            var N = options.numDots;
            var spacing = options.spacing;
            var diameter = options.diameter;
            var size = [N * diameter + (N - 1) * spacing, diameter];

            // Center and align towards the bottom
            this.add({align: [.5, .95]})
                .add({size: size, origin: [.5, .5]}) // define origin point and size of dots view
                .add(this.dots);
        },
        addItems : function(items){
            this.scrollview.addItems(items);
        }
    });

    module.exports = Carousel;
});
