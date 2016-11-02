/* Copyright © 2015-2016 David Valdman */
// TODO: cancel RAF when asleep
define(function(require, exports, module) {
    var EventHandler = require('../events/EventHandler');
    var State = require('./SUE');
    var postTickQueue = require('./queues/postTickQueue');
    var preTickQueue = require('./queues/preTickQueue');
    var dirtyQueue = require('./queues/dirtyQueue');
    var tickQueue = require('./queues/tickQueue');

    var rafId = Number.NaN;
    var isMobile = /mobi/i.test(window.navigator.userAgent);
    var orientation = Number.NaN;
    var windowWidth = Number.NaN;
    var windowHeight = Number.NaN;

    // Listen to window resize events
    window.addEventListener('resize', handleResize, false);

    /**
     * Engine is a singleton object that is required to run a Samsara application.
     *  It is the "heartbeat" of the application, managing the batching of streams
     *  and creating `RootNodes` and `Contexts` to begin render trees.
     *
     *  It also listens and can respond to DOM events on the HTML `<body>` tag
     *  and `window` object. For instance the `resize` event.
     *
     * @class Engine
     * @namespace Core
     * @static
     * @private
     * @uses Core.EventHandler
     */
    var Engine = {};

    /*
    * Emitter for resize events when window resizes
    */
    Engine.size = new EventHandler();

    /**
     * Updates by a single frame of the application by looping through all function queues.
     *  This is repeatedly called within a requestAnimationFrame loop until the application
     *  is receiving no layout changes. At this point the requestAnimationFrame will be
     *  canceled until the next change.
     *
     * @private
     * @method step
     */
    Engine.step = function step() {
        // browser events and their handlers happen before rendering begins
        while (preTickQueue.length) (preTickQueue.shift())();

        // tick signals base event flow coming in
        State.set(State.STATES.UPDATE);

        for (var i = 0; i < tickQueue.length; i++) tickQueue[i]();

        // post tick is for resolving larger components from their incoming signals
        while (postTickQueue.length) (postTickQueue.shift())();

        State.set(State.STATES.END);

        while (dirtyQueue.length) (dirtyQueue.shift())();

        State.set(State.STATES.START);
    };

    /**
     * Initiate the Engine's request animation frame loop.
     *
     * @method start
     * @static
     */
    Engine.start = function start() {
        Engine.step();
        rafId = window.requestAnimationFrame(start);
    };

    /**
     * Stop the Engine's request animation frame loop.
     *
     * @method stop
     * @static
     */
    Engine.stop = function() {
        window.cancelAnimationFrame(rafId);
    };

    /**
     * Subscribe context to resize events and start the render loop if not running
     *
     * @method registerContext
     * @static
     */
    Engine.registerContext = function(context) {
        context._size.subscribe(this.size);
        if (!rafId) Engine.start();
        handleResize();
    };

    /**
     * Unsubscribe context from resize events
     *
     * @method deregisterContext
     * @static
     */
    Engine.deregisterContext = function(context){
        context._size.unsubscribe(this.size);
    };

    // Emit a resize event if the window's height or width has changed
    function handleResize() {
        var newHeight = window.innerHeight;
        var newWidth = window.innerWidth;

        if (isMobile) {
            var newOrientation = newHeight > newWidth;
            if (orientation === newOrientation) return false;
            orientation = newOrientation;
        }
        else {
            if (newWidth === windowWidth && newHeight === windowHeight) return false;
            windowWidth = newWidth;
            windowHeight = newHeight;
        }

        preTickQueue.push(function() {
            Engine.size.emit('resize');
            dirtyQueue.push(function() {
                Engine.size.emit('resize');
            });
        });
    }

    module.exports = Engine;
});
