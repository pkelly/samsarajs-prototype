/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

/* Modified work copyright © 2015-2016 David Valdman */

define(function(require, exports, module) {
    var EventHandler = require('./EventHandler');

    /**
     * EventSplitter routes events to various event destinations
     *  based on custom logic. The return of the provided splitter
     *  function should be of type EventEmitter.
     *
     *  @example
     *
     *      var eventEmitter = new EventEmitter();
     *      var eventEmitterX = new eventEmitter();
     *      var eventEmitterY = new eventEmitter();
     *
     *      var eventSplitter = new EventSplitter(function(payload){
     *          return (payload.x > payload.y)
     *              ? eventEmitterX;
     *              : eventEmitterY;
     *      });
     *
     *      eventSplitter.subscribe(eventEmitter);
     *
     *      eventEmitterX.on('move', function(){
     *          console.log('x is bigger')
     *      });
     *
     *      eventEmitterY.on('move', function(){
     *          console.log('y is bigger')
     *      })
     *
     *      eventEmitter.emit('move', {x : 3, y : 2}); // x is bigger
     *
     * @class EventSplitter
     * @private
     * @namespace Events
     * @constructor
     * @param splitter {Function}
     */
    function EventSplitter(splitter) {
        EventHandler.call(this);
        this._splitter = splitter;
    }
    EventSplitter.prototype = Object.create(EventHandler.prototype);
    EventSplitter.prototype.constructor = EventSplitter;

    /**
     * Emit event.
     *
     * @method emit
     * @param type {String} Channel name
     * @param data {Object} Payload
     */
    EventSplitter.prototype.emit = function emit(type, data) {
        var target = this._splitter.apply(this, arguments);
        if (target && target.emit instanceof Function)
            target.emit(type, data);
    };

    /**
     * Alias of emit.
     *
     * @method trigger
     * @param type {String} Channel name
     * @param data {Object} Payload
     */
    EventSplitter.prototype.trigger = EventSplitter.prototype.emit;

    module.exports = EventSplitter;
});
