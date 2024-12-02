/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment");
WinJS.Namespace.define("MS.Entertainment", {ObservableArray: WinJS.Class.define(function observableArrayConstructor(data) {
        this._listeners = [];
        this._indexableItems = WinJS.Binding.as({length: 0});
        if (!data)
            this._data = [];
        else
            this._data = data.slice();
        this._updateBindableItems()
    }, {
        _getObservable: function() {
            return this
        }, _data: null, _listeners: null, _indexableItems: null, _validateIndex: function validateIndex(index) {
                if ((index < 0) || (index > this.length - 1))
                    throw new Error("Index out of bounds");
            }, _raiseChangeEvent: function raiseChangeEvent(operation, index, item) {
                var changeObject = {
                        type: operation, index: index, item: item
                    };
                for (var i = 0; i < this._listeners.length; i++) {
                    var listener = this._listeners[i];
                    if (listener)
                        listener(changeObject)
                }
            }, _updateBindableItems: function _updateBindableItems() {
                if (this._data.length === this._indexableItems.length)
                    return;
                var that = this;
                var difference = this._data.length - this._indexableItems;
                for (var i = 0; i < this._data.length; i++) {
                    if (this._indexableItems.hasOwnProperty("item" + i))
                        continue;
                    (function(index) {
                        Object.defineProperty(that._indexableItems, "item" + index, {get: function() {
                                return that._data[index]
                            }})
                    })(i)
                }
                if (difference > 0)
                    for (var j = this._data.length; j < this._indexableItems.length; j++)
                        delete this._indexableItems["item" + j];
                this._indexableItems.length = this._data.length
            }, addChangeListener: function addChangeListener(handler) {
                if (!handler)
                    throw new Error("Argument was invalid: undefined/null");
                this._listeners.push(handler)
            }, removeChangeListener: function removeChangeListener(handler) {
                var handlerIndex = this._listeners.indexOf(handler);
                if (handlerIndex === -1)
                    return;
                this._listeners.splice(handlerIndex, 1)
            }, length: {get: function() {
                    return this._data.length
                }}, getArray: function getArray() {
                return [].concat(this._data)
            }, indexOf: function indexOf(item) {
                return this._data.indexOf(item)
            }, lastIndexOf: function lastIndexOf(item, startFrom) {
                return this._data.lastIndexOf(item, startFrom)
            }, contains: function contains(item) {
                return (this.indexOf(item) !== -1)
            }, item: function item(index) {
                this._validateIndex(index);
                return this._data[index]
            }, clear: function clear() {
                this._data.length = 0;
                this._indexableItems = WinJS.Binding.as({length: 0});
                this._raiseChangeEvent(MS.Entertainment.ObservableArray.OperationTypes.reset, -1, null)
            }, add: function add(item) {
                this.insert(this.length, item)
            }, remove: function remove(item) {
                var index = this.indexOf(item);
                if (index < 0)
                    return;
                return this.removeAt(index)
            }, removeAt: function removeAt(index) {
                var removedItems = null;
                this._validateIndex(index);
                var item = this.item(index);
                removedItems = this._data.splice(index, 1);
                MS.Entertainment.assert(removedItems.length === 1, "expecting to remove more than one item.  Removed: " + removedItems.length);
                this._updateBindableItems();
                this._raiseChangeEvent(MS.Entertainment.ObservableArray.OperationTypes.remove, index, item);
                return removedItems.length > 0 ? removedItems[0] : null
            }, insert: function insert(index, item) {
                if ((index < 0) || (index > this.length))
                    throw new Error("Index out of bounds");
                this._data.splice(index, 0, item);
                this._updateBindableItems();
                this._raiseChangeEvent(MS.Entertainment.ObservableArray.OperationTypes.add, index, item)
            }, spliceArray: function spliceArray(index, count, array) {
                this.splice.bind(this, index, count).apply(this, array)
            }, push: function push(item) {
                this.add(item);
                return this.length
            }, pop: function pop() {
                if (this.length < 1)
                    return;
                var index = this.length - 1;
                return this.removeAt(index)
            }, shift: function shift() {
                if (this.length < 1)
                    return;
                return this.removeAt(0)
            }, splice: function splice(index, count) {
                var removedItems = [];
                if (count !== 0)
                    this._validateIndex(index + count - 1);
                for (var i = index; i < index + count; i++)
                    removedItems.push(this.removeAt(index));
                if (arguments.length > 2)
                    for (var j = 2; j < arguments.length; j++)
                        this.insert(index + j - 2, arguments[j]);
                return removedItems
            }, unshift: function unshift(item) {
                this.insert(0, item);
                return this.length
            }, bindableItems: {get: function() {
                    return this._indexableItems
                }}
    }, {OperationTypes: WinJS.Class.define(null, null, {
            add: "add", remove: "remove", reset: "reset"
        })})})
