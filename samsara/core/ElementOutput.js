/* Copyright © 2015-2016 David Valdman */

define(function(require, exports, module) {
    var Transform = require('./Transform');

    var usePrefix = !('transform' in window.document.documentElement.style);
    var devicePixelRatio = 2 * (window.devicePixelRatio || 1);
    var MIN_OPACITY = 0.0001;
    var MAX_OPACITY = 0.9999;
    var EPSILON = 1e-5;
    var _zeroZero = [0,0];

    /**
     * Responsible for committing CSS3 properties to the DOM and providing DOM event hooks
     *  from a provided DOM element. Where Surface's API handles inputs from the developer
     *  from within Samsara, ElementOutput handles the DOM interaction layer.
     *
     *
     * @class ElementOutput
     * @constructor
     * @namespace Core
     * @uses Core.LayoutNode
     * @uses Core.SizeNode
     * @private
     * @param {Node} element document parent of this container
     */
    function ElementOutput() {
        this._cachedSpec = {};
        this._opacityDirty = true;
        this._originDirty = true;
        this._transformDirty = true;
        this._isVisible = true;
    }

    function _round(value, unit){
        return (unit === 1)
            ? Math.round(value)
            : Math.round(value * unit) / unit
    }

    function _formatCSSTransform(transform, unit) {
        var result = 'matrix3d(';
        for (var i = 0; i < 15; i++) {
            if (Math.abs(transform[i]) < EPSILON) transform[i] = 0;
            result += (i === 12 || i === 13)
                ? _round(transform[i], unit) + ','
                : transform[i] + ',';
        }
        return result + transform[15] + ')';
    }

    function _formatCSSOrigin(origin) {
        return (100 * origin[0]) + '% ' + (100 * origin[1]) + '%';
    }

    function _xyNotEquals(a, b) {
        return (a && b) ? (a[0] !== b[0] || a[1] !== b[1]) : a !== b;
    }

    var _setOrigin = usePrefix
        ? function _setOrigin(element, origin) {
            element.style.webkitTransformOrigin = _formatCSSOrigin(origin);
        }
        : function _setOrigin(element, origin) {
            element.style.transformOrigin = _formatCSSOrigin(origin);
        };

    var _setTransform = (usePrefix)
        ? function _setTransform(element, transform, unit) {
            element.style.webkitTransform = _formatCSSTransform(transform, unit);
        }
        : function _setTransform(element, transform, unit) {
            element.style.transform = _formatCSSTransform(transform, unit);
        };

    var _setSize = function _setSize(target, size){
        if (size[0] === true) size[0] = target.offsetWidth;
        else target.style.width = size[0] + 'px';

        if (size[1] === true) size[1] = target.offsetHeight;
        else target.style.height = size[1] + 'px';
    };

    // {Visibility : hidden} allows for DOM events to pass through the element
    // TODO: use pointerEvents instead. However, there is a bug in Chrome for Android
    // ticket here: https://code.google.com/p/chromium/issues/detail?id=569654
    var _setOpacity = function _setOpacity(element, opacity) {
        if (!this._isVisible && opacity > MIN_OPACITY) {
            //element.style.pointerEvents = 'auto';
            element.style.visibility = 'visible';
            this._isVisible = true;
        }

        if (opacity > MAX_OPACITY) opacity = MAX_OPACITY;
        else if (opacity < MIN_OPACITY) {
            opacity = MIN_OPACITY;
            if (this._isVisible) {
                //element.style.pointerEvents = 'none';
                element.style.visibility = 'hidden';
                this._isVisible = false;
            }
        }

        if (this._isVisible) element.style.opacity = opacity;
    };

    ElementOutput.prototype.applyClasses = function applyClasses(target, classList) {
        for (var i = 0; i < classList.length; i++)
            target.classList.add(classList[i]);
    };

    ElementOutput.prototype.applyProperties = function applyProperties(target, properties) {
        for (var key in properties)
            target.style[key] = properties[key];
    };

    ElementOutput.prototype.applyAttributes = function applyAttributes(target, attributes) {
        for (var key in attributes)
            target.setAttribute(key, attributes[key]);
    };

    ElementOutput.prototype.removeClasses = function removeClasses(target, classList) {
        for (var i = 0; i < classList.length; i++)
            target.classList.remove(classList[i]);
    };

    ElementOutput.prototype.removeProperties = function removeProperties(target, properties) {
        for (var key in properties)
            target.style[key] = '';
    };

    ElementOutput.prototype.removeAttributes = function removeAttributes(target, attributes) {
        for (var key in attributes)
            target.removeAttribute(key);
    };

    ElementOutput.prototype.on = function on(target, type, handler) {
        target.addEventListener(type, handler);
    };

    ElementOutput.prototype.off = function off(target, type, handler) {
        target.removeEventListener(type, handler);
    };

    ElementOutput.prototype.deploy = function deploy(target, content) {
        if (content instanceof Node) {
            while (target.hasChildNodes()) target.removeChild(target.firstChild);
            target.appendChild(content);
        }
        else target.innerHTML = content;
    };

    ElementOutput.prototype.recall = function deploy(target) {
        var df = document.createDocumentFragment();
        while (target.hasChildNodes()) df.appendChild(target.firstChild);
        return df;
    };

    ElementOutput.prototype.set = function set(target){
        target.style.display = '';
        target.style.visibility = '';

        // for true-sized elements, reset height and width
        if (this._cachedSize) {
            if (this._cachedSize[0] === true) target.style.width = 'auto';
            if (this._cachedSize[1] === true) target.style.height = 'auto';
        }
    };

    ElementOutput.prototype.reset = function reset(target){
        target.style.display = 'none';
        target.style.opacity = '';
        target.style.width = '';
        target.style.height = '';

        if (usePrefix) {
            target.style.webkitTransform = '';
            target.style.webkitTransformOrigin = '';
        }
        else {
            target.style.transform = '';
            target.style.transformOrigin = '';
        }

        this._cachedSpec = {};
    };

    ElementOutput.prototype.commitLayout = function commitLayout(target, layout) {
        var cache = this._cachedSpec;

        var transform = layout.transform || Transform.identity;
        var opacity = (layout.opacity === undefined) ? 1 : layout.opacity;
        var origin = layout.origin || _zeroZero;

        this._transformDirty = Transform.notEquals(cache.transform, transform);
        this._opacityDirty = this._opacityDirty || (cache.opacity !== opacity);
        this._originDirty = this._originDirty || (origin && _xyNotEquals(cache.origin, origin));

        if (this._opacityDirty) {
            cache.opacity = opacity;
            _setOpacity.call(this, target, opacity);
        }

        if (this._originDirty){
            cache.origin = origin;
            _setOrigin(target, origin);
        }

        if (this._transformDirty) {
            cache.transform = transform;
            _setTransform(target, transform, this.roundToPixel ? 1 : devicePixelRatio);
        }

        this._originDirty = false;
        this._transformDirty = false;
        this._opacityDirty = false;
    };

    ElementOutput.prototype.commitSize = function commitSize(target, size){
        if (size[0] !== true) size[0] = _round(size[0], devicePixelRatio);
        if (size[1] !== true) size[1] = _round(size[1], devicePixelRatio);

        if (_xyNotEquals(this._cachedSpec.size, size)){
            this._cachedSpec.size = size;
            _setSize(target, size);
            return true;
        }
        else return false;
    };

    module.exports = ElementOutput;
});
