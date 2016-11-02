/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

/* Modified work copyright © 2015-2016 David Valdman */

define(function(require, exports, module) {
    var EventEmitter = require('./EventEmitter');

    /**
     * EventHandler extends EventEmitter to provide subscription methods.
     *  It also includes helper methods on the constructor for setting up Controllers and Views
     *  with input and output emitters.
     *
     *  @example
     *
     *      var eventHandlerA = new EventHandler();
     *      var eventHandlerB = new EventHandler();
     *
     *      eventHandlerB.subscribe(eventHandlerA);
     *
     *      eventHandlerB.on('name', function(payload){
     *          console.log(payload) // {data : 0}
     *      });
     *
     *      eventHandlerA.emit('name', {data : 0});
     *
     * @class EventHandler
     * @namespace Events
     * @extends Events.EventEmitter
     * @constructor
     */
    function EventHandler() {
        EventEmitter.apply(this, arguments);

        this.upstream = []; // upstream event handlers
        this.upstreamListeners = {}; // upstream listeners
    }

    EventHandler.prototype = Object.create(EventEmitter.prototype);
    EventHandler.prototype.constructor = EventHandler;

    /**
     * Constructor helper method. Assign an event handler to receive an object's input events.
     *  Defines `trigger`, `subscribe` and `unsubscribe` methods on the class instance.
     *
     * @method setInputHandler
     * @static
     * @param object {Object}           Class instance
     * @param handler {EventHandler}    EventHandler representing an input source
     */
    EventHandler.setInputHandler = function setInputHandler(object, handler) {
        object.trigger = handler.trigger.bind(handler);
        object.subscribe = handler.subscribe.bind(handler);
        object.unsubscribe = handler.unsubscribe.bind(handler);
    };

    /**
     * Constructor helper method. Assign an event handler to emit an object's output events.
     *  Defines `emit`, `on` and `off` methods on the class instance.
     *
     * @method setOutputHandler
     * @static
     * @param object {Object}           Object to provide on, off and emit methods
     * @param handler {EventHandler}    Handler assigned event handler
     */
    EventHandler.setOutputHandler = function setOutputHandler(object, handler) {
        handler.bindThis(object);
        object.emit = handler.emit.bind(handler);
        object.on = handler.on.bind(handler);
        object.off = handler.off.bind(handler);
    };

    /**
     * Constructor helper method. Given an events dictionary of {eventName : handler} pairs, attach them to
     *  a provided input handler for an object.
     *
     * @method setInputEvents
     * @static
     * @private
     * @param object {Object}           Object to provide on, off and emit methods
     * @param handler {EventHandler}    Handler assigned event handler
     */
    EventHandler.setInputEvents = function setInputEvents(object, events, handlerIn){
        for (var key in events) {
            var handlerName = events[key];
            var handler = (typeof handlerName === 'string')
                ? object[handlerName]
                : handlerName;
            if (handler) handlerIn.on(key, handler.bind(object));
        }
    };

    /**
     * Adds a handler to the `type` channel which will be executed on `emit`.
     *  Extends EventEmitter's `on` method.
     *
     * @method on
     * @param type {String}             Event channel name
     * @param handler {Function}        Handler
     */
    EventHandler.prototype.on = function on(type, handler) {
        EventEmitter.prototype.on.apply(this, arguments);
        if (!(type in this.upstreamListeners)) {
            var upstreamListener = this.trigger.bind(this, type);
            this.upstreamListeners[type] = upstreamListener;
            for (var i = 0; i < this.upstream.length; i++) {
                this.upstream[i].on(type, upstreamListener);
            }
        }
    };

    /**
     * Listen for events from an an upstream source.
     *
     * @method subscribe
     * @param source {EventEmitter} Event source
     */
    EventHandler.prototype.subscribe = function subscribe(source) {
        var index = this.upstream.indexOf(source);
        if (index < 0) {
            this.upstream.push(source);
            for (var type in this.upstreamListeners) {
                source.on(type, this.upstreamListeners[type]);
            }
        }
        return source;
    };

    /**
     * Stop listening to events from an upstream source.
     *  Undoes work of `subscribe`.
     *
     *  If no source is provided, all subscribed sources are unsubscribed from.
     *
     * @method unsubscribe
     * @param [source] {EventEmitter} Event source
     */
    EventHandler.prototype.unsubscribe = function unsubscribe(source) {
        if (!source) {
            for (var i = 0; i < this.upstream.length; i++)
                this.unsubscribe(this.upstream[i]);
        }
        else {
            var index = this.upstream.indexOf(source);
            if (index >= 0) {
                this.upstream.splice(index, 1);
                for (var type in this.upstreamListeners) {
                    source.off(type, this.upstreamListeners[type]);
                }
            }
        }
    };

    module.exports = EventHandler;
});
