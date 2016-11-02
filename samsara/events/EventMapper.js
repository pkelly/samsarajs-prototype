/* Copyright © 2015-2016 David Valdman */

define(function(require, exports, module) {
    var EventHandler = require('./EventHandler');

    /**
     * EventMapper modifies the data payload of an event based on
     *  a provided function.
     *
     *  Note: it does not modify the event's `type`.
     *
     *  @example
     *
     *      var eventMapper = new EventMapper(function(payload){
     *          return payload.x + payload.y
     *      });
     *
     *      var eventEmitter = new EventEmitter();
     *
     *      eventMapper.subscribe(eventEmitter);
     *
     *      eventMapper.on('name', function(value){
     *          alert(value);
     *      });
     *
     *      eventEmitter.emit('name', {x : 1, y : 2}); // alerts 3
     *
     * @class EventMapper
     * @namespace Events
     * @constructor
     * @param map {Function}  Function to modify the event payload
     */
    function EventMapper(map) {
        EventHandler.call(this);
        this._mappingFunction = map;
    }

    EventMapper.prototype = Object.create(EventHandler.prototype);
    EventMapper.prototype.constructor = EventMapper;

    /**
     * Emit mapped event.
     *
     * @method emit
     * @param type {String} Channel name
     * @param data {Object} Payload
     */
    EventMapper.prototype.emit = function emit(type, data) {
        var mappedData = this._mappingFunction(data);
        EventHandler.prototype.emit.call(this, type, mappedData);
    };

    /**
     * Alias of emit.
     *
     * @method trigger
     * @param type {String} Channel name
     * @param data {Object} Payload
     */
    EventMapper.prototype.trigger = EventMapper.prototype.emit;

    module.exports = EventMapper;
});
