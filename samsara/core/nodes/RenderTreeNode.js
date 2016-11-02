/* Copyright © 2015-2016 David Valdman */

define(function(require, exports, module) {
    var EventHandler = require('../../events/EventHandler');
    var Stream = require('../../streams/Stream');
    var ResizeStream = require('../../streams/ResizeStream');
    var SizeNode = require('../SizeNode');
    var LayoutNode = require('../LayoutNode');
    var layoutAlgebra = require('../algebras/layout');
    var sizeAlgebra = require('../algebras/size');
    var preTickQueue = require('../../core/queues/preTickQueue');
    var dirtyQueue = require('../../core/queues/dirtyQueue');

    var SIZE_KEYS = SizeNode.KEYS;
    var LAYOUT_KEYS = LayoutNode.KEYS;

    /**
     * A node in the render tree. As such, it wraps a layout or size node,
     *  providing them with an `add` method. By adding nodes, the render tree
     *  is constructed, the leaves of which are `Surfaces`.
     *
     *  @constructor
     *  @class RenderTreeNode
     *  @private
     *  @param object {Object|SizeNode|LayoutNode|Surface|View}
     */
    function RenderTreeNode(object) {
        // layout and size inputs
        this._layout = new EventHandler();
        this._size = new EventHandler();
        this._logic = new EventHandler();

        // layout and size streams
        this.size = new EventHandler();
        this.layout = new EventHandler();

        this.root = null;

        if (object) _set.call(this, object);
        else {
            this.layout.subscribe(this._layout);
            this.size.subscribe(this._size);
        }

        // save last spec if node is removed and later added
        this._cachedSpec = {
            layout : null,
            size : null
        };

        this.layout.on('start', function(data) {
            this._cachedSpec.layout = data;
        }.bind(this));

        this.layout.on('update', function(data) {
            this._cachedSpec.layout = data;
        }.bind(this));

        this.layout.on('end', function(data) {
            this._cachedSpec.layout = data;
        }.bind(this));

        this.size.on('resize', function(size) {
            this._cachedSpec.size = size;
        }.bind(this));

        this._logic.on('mount', function(node){
            this.root = node;
        }.bind(this));

        this._logic.on('unmount', function() {
            this.root = null;
        }.bind(this));
    }

    /**
     * Extends the render tree with a new node. Similar to how a tree data structure
     *  is created, but instead of a node with an array of children, children subscribe
     *  to notifications from the parent.
     *
     *  Nodes can be instances of `LayoutNode`, `SizeNode`, or Object literals with
     *  size and layout properties, in which case, appropriate nodes will be created.
     *
     *  This method also takes `Views` (subtrees) and `Surfaces` (leaves).
     *
     * @method add
     * @chainable
     * @param node {Object|SizeNode|LayoutNode|Surface|View} Node
     * @return {RenderTreeNode}
     */
    RenderTreeNode.prototype.add = function add(node) {
        var childNode;

        var self = this;
        preTickQueue.push(function() {
            if (!self._cachedSpec.size) return;
            self.size.trigger('resize', self._cachedSpec.size);
            self.layout.trigger('start', self._cachedSpec.layout);
            dirtyQueue.push(function() {
                self.layout.trigger('end', self._cachedSpec.layout);
            });
        });

        if (node.constructor === Object){
            // Object literal case
            return _createNodeFromObjectLiteral.call(this, node);
        }
        else if (node._isView){
            // View case
            return this.add(node._node);
        }
        else if (node instanceof RenderTreeNode){
            // RenderTree Node
            childNode = node;
        }
        else {
            // LayoutNode or SizeNode or Surface
            childNode = new RenderTreeNode(node);
        }

        childNode._layout.subscribe(this.layout);
        childNode._size.subscribe(this.size);
        childNode._logic.subscribe(this._logic);

        // Called when node is removed and later added
        if (this.root && !childNode.root)
            childNode._logic.trigger('mount', this.root);

        this._logic.emit('attach');

        return childNode;
    };

    RenderTreeNode.prototype.remove = function (){
        this._logic.trigger('detach');
        this._logic.trigger('unmount');
        this._layout.unsubscribe();
        this._size.unsubscribe();
        this._logic.unsubscribe();
    };

    function _createNodeFromObjectLiteral(object){
        var sizeKeys = {};
        var layoutKeys = {};

        for (var key in object){
            if (SIZE_KEYS[key]) sizeKeys[key] = object[key];
            else if (LAYOUT_KEYS[key]) layoutKeys[key] = object[key];
        }

        var node = this;
        var needsSize = Object.keys(sizeKeys).length > 0;
        var needsLayout = Object.keys(layoutKeys).length > 0;

        // create extra align node if needed
        if (needsSize && layoutKeys.align){
            var alignNode = new LayoutNode({
                align : layoutKeys.align
            });
            delete layoutKeys.align;
            node = node.add(alignNode);
        }

        // create size node first if needed
        if (needsSize)
            node = node.add(new SizeNode(sizeKeys));

        // create layout node if needed
        if (needsLayout)
            node = node.add(new LayoutNode(layoutKeys));

        return node;
    }

    function _set(object) {
        if (object instanceof SizeNode){
            var size = ResizeStream.lift(
                function SGSizeAlgebra (objectSpec, parentSize){
                    if (!parentSize) return false;
                    return (objectSpec)
                        ? sizeAlgebra(objectSpec, parentSize)
                        : parentSize;
                },
                [object, this._size]
            );
            this.size.subscribe(size);
            this.layout.subscribe(this._layout);
            return;
        }
        else if (object instanceof LayoutNode){
            var layout = Stream.lift(
                function SGLayoutAlgebra (objectSpec, parentSpec, size){
                    if (!parentSpec || !size) return false;
                    return (objectSpec)
                        ? layoutAlgebra(objectSpec, parentSpec, size)
                        : parentSpec;
                },
                [object, this._layout, this._size]
            );
            this.layout.subscribe(layout);
            this.size.subscribe(this._size);
            return;
        }

        // object is a leaf node
        object._size.subscribe(this._size);
        object._layout.subscribe(this._layout);

        this._logic.on('detach', function(){
            object.remove();
            object._size.unsubscribe(this._size);
            object._layout.unsubscribe(this._layout);
        }.bind(this));

        this._logic.on('attach', function(){
            if (this.root && !object._currentTarget)
                object.setup(this.root.allocator);
            object._size.subscribe(this._size);
            object._layout.subscribe(this._layout);
        }.bind(this));
    }

    module.exports = RenderTreeNode;
});
