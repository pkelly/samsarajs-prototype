/* Copyright © 2015-2016 David Valdman */

define(function(require, exports, module) {
    var EventHandler = require('../events/EventHandler');
    var Stream = require('../streams/Stream');
    var ResizeStream = require('../streams/ResizeStream');
    var SizeNode = require('../core/SizeNode');
    var LayoutNode = require('../core/LayoutNode');
    var sizeAlgebra = require('../core/algebras/size');
    var layoutAlgebra = require('../core/algebras/layout');
    var ElementOutput = require('../core/ElementOutput');
    var dirtyQueue = require('../core/queues/dirtyQueue');

    var isTouchEnabled = "ontouchstart" in window;
    var isIOS = /iPad|iPhone|iPod/.test(navigator.platform);

    /**
     * Surface is a wrapper for a DOM element animated by Samsara.
     *  Samsara will commit opacity, size and CSS3 `transform` properties into the Surface.
     *  CSS classes, properties and DOM attributes can also be added and dynamically changed.
     *  Surfaces also act as sources for DOM events such as `click`.
     *
     * @example
     *
     *      var context = new Context()
     *
     *      var surface = new Surface({
     *          content : 'Hello world!',
     *          size : [true,100],
     *          opacity : .5,
     *          classes : ['myClass1', 'myClass2'],
     *          properties : {background : 'red'}
     *      });
     *
     *      context.add(surface);
     *
     *      context.mount(document.body);
     *
     *  @example
     *
     *      // same as above but create an image instead
     *      var surface = new Surface({
     *          tagName : 'img',
     *          attributes : {
     *              src : 'cat.jpg'
     *          },
     *          size : [100,100]
     *      });
     *
     * @class Surface
     * @namespace DOM
     * @constructor
     * @extends Core.ElementOutput
     * @param [options] {Object}                Options
     * @param [options.size] {Number[]}         Size (width, height) in pixels. These can also be `true` or `undefined`.
     * @param [options.classes] {String[]}      CSS classes
     * @param [options.properties] {Object}     Dictionary of CSS properties
     * @param [options.attributes] {Object}     Dictionary of HTML attributes
     * @param [options.content] Sstring}        InnerHTML content
     * @param [options.origin] {Number[]}       Origin (x,y), with values between 0 and 1
     * @param [options.margins] {Number[]}      Margins (x,y) in pixels
     * @param [options.proportions] {Number[]}  Proportions (x,y) with values between 0 and 1
     * @param [options.aspectRatio] {Number}    Aspect ratio
     * @param [options.opacity=1] {Number}      Opacity
     * @param [options.tagName="div"] {String}  HTML tagName
     * @param [options.enableScroll] {Boolean}  Allows a Surface to support native scroll behavior
     * @param [options.roundToPixel] {Boolean}  Prevents text-blurring if set to true, at the cost to jittery animation
     */
    function Surface(options) {
        this.properties = {};
        this.attributes = {};
        this.classList = [];
        this.content = '';
        this._cachedSize = null;
        this._allocator = null;

        this._elementOutput = new ElementOutput();

        this._eventOutput = new EventHandler();
        EventHandler.setOutputHandler(this, this._eventOutput);

        this._eventForwarder = function _eventForwarder(event) {
            this._eventOutput.emit(event.type, event);
        }.bind(this);

        this._sizeNode = new SizeNode();
        this._layoutNode = new LayoutNode();

        this._size = new EventHandler();
        this._layout = new EventHandler();

        this.size = ResizeStream.lift(function elementSizeLift(sizeSpec, parentSize) {
            if (!parentSize) return false; // occurs when surface is never added
            return sizeAlgebra(sizeSpec, parentSize);
        }, [this._sizeNode, this._size]);

        this.layout = Stream.lift(function(parentSpec, objectSpec, size) {
            if (!parentSpec || !size) return false;
            return (objectSpec)
                ? layoutAlgebra(objectSpec, parentSpec, size)
                : parentSpec;
        }, [this._layout, this._layoutNode, this.size]);

        this.layout.on('update', commitLayout.bind(this));
        this.layout.on('end', commitLayout.bind(this));
        this.size.on('resize', commitSize.bind(this));

        if (options) this.setOptions(options);
    }

    Surface.prototype = Object.create(ElementOutput.prototype);
    Surface.prototype.constructor = Surface;
    Surface.prototype.elementType = 'div'; // Default tagName. Can be overridden in options.
    Surface.prototype.elementClass = 'samsara-surface';

    function commitLayout(layout) {
        if (this._currentTarget)
            this._elementOutput.commitLayout(this._currentTarget, layout);
    }

    function commitSize(size) {
        if (this._currentTarget){
            var shouldResize = this._elementOutput.commitSize(this._currentTarget, size);
            this._cachedSize = size;
            if (shouldResize) this.emit('resize', size);
        }
    }

    function enableScroll(){
        this.addClass('samsara-scrollable');

        if (!isTouchEnabled) return;

        this.on('deploy', function(target){
            // Hack to prevent page scrolling for iOS when scroll starts at extremes
            if (isIOS) {
                target.addEventListener('touchstart', function () {
                    var top = target.scrollTop;
                    var height = target.offsetHeight;
                    var scrollHeight = target.scrollHeight;

                    if (top == 0)
                        target.scrollTop = 1;
                    else if (top + height == scrollHeight)
                        target.scrollTop = scrollHeight - height - 1;

                }, false);
            }

            // Prevent bubbling to capture phase of window's touchmove event which prevents default.
            target.addEventListener('touchmove', function(event){
                event.stopPropagation();
            }, false);
        });
    }
    
    /**
     * Setter for HTML attributes.
     *
     * @method setAttributes
     * @chainable
     * @param attributes {Object}   HTML Attributes
     */
    Surface.prototype.setAttributes = function setAttributes(attributes) {
        for (var key in attributes) {
            var value = attributes[key];
            if (value != undefined) this.attributes[key] = attributes[key];
        }

        dirtyQueue.push(function(){
            if (this._currentTarget)
                this._elementOutput.applyAttributes(this._currentTarget, attributes);
        }.bind(this));

        return this;
    };

    /**
     * Getter for HTML attributes.
     *
     * @method getAttributes
     * @return {Object}
     */
    Surface.prototype.getAttributes = function getAttributes() {
        return this.attributes;
    };

    /**
     * Setter for CSS properties.
     *  Note: properties are camelCased, not hyphenated.
     *
     * @method setProperties
     * @chainable
     * @param properties {Object}   CSS properties
     */
    Surface.prototype.setProperties = function setProperties(properties) {
        for (var key in properties)
            this.properties[key] = properties[key];

        dirtyQueue.push(function() {
            if (this._currentTarget)
                this._elementOutput.applyProperties(this._currentTarget, properties);
        }.bind(this));

        return this;
    };

    /**
     * Getter for CSS properties.
     *
     * @method getProperties
     * @return {Object}             Dictionary of this Surface's properties.
     */
    Surface.prototype.getProperties = function getProperties() {
        return this.properties;
    };

    /**
     * Add CSS class to the list of classes on this Surface.
     *
     * @method addClass
     * @chainable
     * @param className {String}    Class name
     */
    Surface.prototype.addClass = function addClass(className) {
        if (this.classList.indexOf(className) < 0) {
            this.classList.push(className);

            dirtyQueue.push(function() {
                if (this._currentTarget)
                    this._elementOutput.applyClasses(this._currentTarget, this.classList);
            }.bind(this));
        }
        return this;
    };

    /**
     * Remove CSS class from the list of classes on this Surface.
     *
     * @method removeClass
     * @param className {string}    Class name
     */
    Surface.prototype.removeClass = function removeClass(className) {
        var i = this.classList.indexOf(className);
        if (i >= 0) {
            this.classList.splice(i, 1);
            dirtyQueue.push(function() {
                if (this._currentTarget)
                    this._elementOutput.removeClasses(this._currentTarget, this.classList);
            }.bind(this));
        }
    };

    /**
     * Toggle CSS class for this Surface.
     *
     * @method toggleClass
     * @param  className {String}   Class name
     */
    Surface.prototype.toggleClass = function toggleClass(className) {
        var i = this.classList.indexOf(className);
        (i == -1)
            ? this.addClass(className)
            : this.removeClass(className);
    };

    /**
     * Reset classlist.
     *
     * @method setClasses
     * @chainable
     * @param classlist {String[]}  ClassList
     */
    Surface.prototype.setClasses = function setClasses(classList) {
        for (var i = 0; i < classList.length; i++) {
            this.addClass(classList[i]);
        }
        return this;
    };

    /**
     * Get array of CSS classes attached to this Surface.
     *
     * @method getClasslist
     * @return {String[]}
     */
    Surface.prototype.getClassList = function getClassList() {
        return this.classList;
    };

    /**
     * Set or overwrite innerHTML content of this Surface.
     *
     * @method setContent
     * @chainable
     * @param content {String|DocumentFragment} HTML content
     */
    Surface.prototype.setContent = function setContent(content) {
        if (this.content !== content) {
            this.content = content;

            dirtyQueue.push(function() {
                if (this._currentTarget)
                    this._elementOutput.deploy(this._currentTarget, content);
            }.bind(this));
        }
        return this;
    };

    /**
     * Return innerHTML content of this Surface.
     *
     * @method getContent
     * @return {String}
     */
    Surface.prototype.getContent = function getContent() {
        return this.content;
    };

    /**
     * Set options for this surface
     *
     * @method setOptions
     * @param options {Object} Overrides for default options. See constructor.
     */
    Surface.prototype.setOptions = function setOptions(options) {
        if (options.tagName !== undefined) this.elementType = options.tagName;
        if (options.opacity !== undefined) this.setOpacity(options.opacity);
        if (options.size !== undefined) this.setSize(options.size);
        if (options.origin !== undefined) this.setOrigin(options.origin);
        if (options.proportions !== undefined) this.setProportions(options.proportions);
        if (options.margins !== undefined) this.setMargins(options.margins);
        if (options.classes !== undefined) this.setClasses(options.classes);
        if (options.properties !== undefined) this.setProperties(options.properties);
        if (options.attributes !== undefined) this.setAttributes(options.attributes);
        if (options.content !== undefined) this.setContent(options.content);
        if (options.aspectRatio !== undefined) this.setAspectRatio(options.aspectRatio);
        if (options.enableScroll) enableScroll.call(this);
        if (options.roundToPixel) this.roundToPixel = options.roundToPixel;
    };

    /**
     * Adds a handler to the `type` channel which will be executed on `emit`.
     *
     * @method on
     *
     * @param type {String}         DOM event channel name, e.g., "click", "touchmove"
     * @param handler {Function}    Handler. It's only argument will be an emitted data payload.
     */
    Surface.prototype.on = function on(type, handler) {
        if (this._currentTarget)
            this._elementOutput.on(this._currentTarget, type, this._eventForwarder);
        EventHandler.prototype.on.apply(this._eventOutput, arguments);
    };

    /**
     * Removes a previously added handler to the `type` channel.
     *  Undoes the work of `on`.
     *
     * @method off
     * @param type {String}         DOM event channel name e.g., "click", "touchmove"
     * @param handler {Function}    Handler
     */
    Surface.prototype.off = function off(type, handler) {
        if (this._currentTarget)
            this._elementOutput.off(this._currentTarget, type, this._eventForwarder);
        EventHandler.prototype.off.apply(this._eventOutput, arguments);
    };

    /**
     * Allocates the element-type associated with the Surface, adds its given
     *  element classes, and prepares it for future committing.
     *
     *  This method is called upon the first `start` or `resize`
     *  event the Surface gets.
     *
     * @private
     * @method setup
     * @param allocator {ElementAllocator} Allocator
     */
    Surface.prototype.setup = function setup(allocator) {
        this._allocator = allocator;

        // create element of specific type
        var target = allocator.allocate(this.elementType);
        this._currentTarget = target;

        // add any element classes
        if (this.elementClass) {
            if (this.elementClass instanceof Array)
                for (var i = 0; i < this.elementClass.length; i++)
                    this.addClass(this.elementClass[i]);
            else this.addClass(this.elementClass);
        }

        for (var type in this._eventOutput.listeners)
            this._elementOutput.on(target, type, this._eventForwarder);

        this._elementOutput.set(target);
        this._elementOutput.applyClasses(target, this.classList);
        this._elementOutput.applyProperties(target, this.properties);
        this._elementOutput.applyAttributes(target, this.attributes);

        this.deploy(target);
    };

    /**
     * Remove all Samsara-relevant data from the Surface.
     *
     * @private
     * @method remove
     */
    Surface.prototype.remove = function remove() {
        var target = this._currentTarget;

        this._elementOutput.removeClasses(target, this.classList);
        this._elementOutput.removeProperties(target, this.properties);
        this._elementOutput.removeAttributes(target, this.attributes);
        this._elementOutput.reset(target);

        for (var type in this._eventOutput.listeners)
            this._elementOutput.off(target, type, this._eventForwarder);

        // cache the target's contents for later deployment
        this.recall(target);

        this._allocator.deallocate(target);
        this._allocator = null;

        this._currentTarget = null;
    };

    /**
     * Insert the Surface's content into the currentTarget.
     *
     * @private
     * @method deploy
     * @param target {Node} DOM element to set content into
     */
    Surface.prototype.deploy = function deploy(target) {
        var content = this.getContent();
        this._elementOutput.deploy(target, content);
        this._eventOutput.emit('deploy', target);
    };

    /**
     * Cache the content of the Surface in a document fragment for future deployment.
     *
     * @private
     * @method recall
     * @param target {Node}
     */
    Surface.prototype.recall = function recall(target) {
        this._eventOutput.emit('recall');
        this.content = this._elementOutput.recall(target);
    };

    /**
     * Getter for size.
     *
     * @method getSize
     * @return {Number[]}
     */
    Surface.prototype.getSize = function getSize() {
        // TODO: remove cachedSize
        return this._cachedSize;
    };

    /**
     * Setter for size.
     *
     * @method setSize
     * @param size {Number[]|Stream} Size as [width, height] in pixels, or a stream.
     */
    Surface.prototype.setSize = function setSize(size) {
        this._cachedSize = size;
        this._sizeNode.set({size : size});
    };

    /**
     * Setter for proportions.
     *
     * @method setProportions
     * @param proportions {Number[]|Stream} Proportions as [x,y], or a stream.
     */
    Surface.prototype.setProportions = function setProportions(proportions) {
        this._sizeNode.set({proportions : proportions});
    };

    /**
     * Setter for margins.
     *
     * @method setMargins
     * @param margins {Number[]|Stream} Margins as [width, height] in pixels, or a stream.
     */
    Surface.prototype.setMargins = function setMargins(margins) {
        this._sizeNode.set({margins : margins});
    };

    /**
     * Setter for aspect ratio. If only one of width or height is specified,
     *  the aspect ratio will replace the unspecified dimension by scaling
     *  the specified dimension by the value provided.
     *
     * @method setAspectRatio
     * @param aspectRatio {Number|Stream} Aspect ratio.
     */
    Surface.prototype.setAspectRatio = function setAspectRatio(aspectRatio) {
        this._sizeNode.set({aspectRatio : aspectRatio});
    };

    /**
     * Setter for origin.
     *
     * @method setOrigin
     * @param origin {Number[]|Stream} Origin as [x,y], or a stream.
     */
    Surface.prototype.setOrigin = function setOrigin(origin){
        this._layoutNode.set({origin : origin});
        this._elementOutput._originDirty = true;
    };

    /**
     * Setter for opacity.
     *
     * @method setOpacity
     * @param opacity {Number} Opacity
     */
    Surface.prototype.setOpacity = function setOpacity(opacity){
        this._layoutNode.set({opacity : opacity});
        this._elementOutput._opacityDirty = true;
    };

    module.exports = Surface;
});
