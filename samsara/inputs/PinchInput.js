/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 *
 * @license MPL 2.0
 * @copyright Famous Industries, Inc. 2014
 */

/* Modified work copyright © 2015-2016 David Valdman */

define(function(require, exports, module) {
    var TwoFingerInput = require('../inputs/TwoFingerInput');
    var OptionsManager = require('../core/OptionsManager');

    /**
     * Detects two-finger pinching motion and emits `start`, `update` and
     *  `end` events with the payload data:
     *
     *      `value`         - Distance between the two touches
     *      `delta`         - Differential in successive distances
     *      `velocity`      - Relative velocity between two touches
     *      `displacement`  - Total accumulated displacement
     *      `center`        - Midpoint between the two touches
     *      `touchIds`      - Array of DOM event touch identifiers
     *
     * @example
     *
     *      var pinchInput = new PinchInput();
     *
     *      pinchInput.subscribe(Engine) // listens on `window` events
     *
     *      pinchInput.on('start', function(payload){
     *          console.log('start', payload);
     *      });
     *
     *      pinchInput.on('update', function(payload){
     *          console.log('update', payload);
     *      });
     *
     *      pinchInput.on('end', function(payload){
     *          console.log('end', payload);
     *      });
     *
     * @class PinchInput
     * @extends Inputs.TwoFingerInput
     * @uses Core.OptionsManager
     * @constructor
     * @param options {Object}              Options
     * @param [options.scale=1] {Number}    Scale the response to pinch
     */
    function PinchInput(options) {
        TwoFingerInput.call(this);

        this.options = OptionsManager.setOptions(this, options);

        this._displacement = 0;
        this._previousDistance = 0;
    }

    PinchInput.prototype = Object.create(TwoFingerInput.prototype);
    PinchInput.prototype.constructor = PinchInput;

    PinchInput.DEFAULT_OPTIONS = {
        scale : 1
    };

    PinchInput.prototype._startUpdate = function _startUpdate(event) {
        var center = TwoFingerInput.calculateCenter(this.posA, this.posB);
        this._previousDistance = TwoFingerInput.calculateDistance(this.posA, this.posB);

        this._displacement = 0;

        this._eventOutput.emit('start', {
            count: event.touches.length,
            touchIds: [this.touchAId, this.touchBId],
            value: this._previousDistance,
            center: center
        });
    };

    PinchInput.prototype._moveUpdate = function _moveUpdate(diffTime) {
        var currDist = TwoFingerInput.calculateDistance(this.posA, this.posB);
        var center = TwoFingerInput.calculateCenter(this.posA, this.posB);

        var scale = this.options.scale;
        var delta = scale * (currDist - this._previousDistance);
        var velocity = delta / diffTime;

        this._displacement += delta;

        this._eventOutput.emit('update', {
            delta : delta,
            velocity: velocity,
            value: currDist,
            displacement: this._displacement,
            center: center,
            touchIds: [this.touchAId, this.touchBId]
        });

        this._previousDistance = currDist;
    };

    module.exports = PinchInput;
});
