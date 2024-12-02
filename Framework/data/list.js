/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/factory.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Data");
(function(MSE, undefined) {
    "use strict";
    WinJS.Namespace.defineWithParent(MSE, "Data", {
        chunkerEvents: {
            batchChange: "batchChange", reset: "reset"
        }, listEvents: {
                itemChanged: "itemChanged", countChanged: "countChanged", itemInserted: "itemInserted"
            }, observableListMixin: {
                count: 0, itemFactory: null, instance: null
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data", {ObservableList: WinJS.Class.mix(function observableList() {
            this._initObservable(Object.create(MS.Entertainment.Data.observableListMixin));
            this.status = MSE.Data.queryStatus.idle
        }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, MS.Entertainment.UI.Framework.UpdatePropertyMixin, WinJS.Binding.expandProperties(MS.Entertainment.Data.observableListMixin))});
    WinJS.Namespace.defineWithParent(MSE, "Data", {List: WinJS.Class.derive(MS.Entertainment.Data.ObservableList, function listConstructor(itemFactory) {
            MS.Entertainment.Data.ObservableList.prototype.constructor.call(this);
            this._data = [];
            this._keyMap = {};
            this.instance = this;
            this.setItemFactory(itemFactory)
        }, {
            _data: null, _keyMap: null, _nextDefaultKey: 0, _disposed: false, dispose: function dispose() {
                    this._data = [];
                    this._keyMap = {};
                    this._disposed = true
                }, _maxCount: -1, maxCount: {
                    get: function() {
                        return this._maxCount
                    }, set: function(value) {
                            if (this._maxCount !== value) {
                                this._maxCount = value;
                                if (this._maxCount >= 0)
                                    this._setCount(Math.min(this._maxCount, this.count))
                            }
                        }
                }, hasMaxCount: {get: function() {
                        return this.maxCount >= 0
                    }}, count: {
                    get: function() {
                        var count = this.getProperty("count");
                        return (count < 0) ? 0 : count
                    }, set: function(value) {
                            if (this.hasMaxCount)
                                value = Math.min(this._maxCount, value);
                            this.setProperty("count", value)
                        }
                }, hasCount: {get: function() {
                        return this.getProperty("count") >= 0
                    }}, setItemFactory: function setItemFactory(itemFactory) {
                    this.itemFactory = itemFactory || MSE.Data.Factory.self;
                    if (!this.itemFactory.listItemFactory)
                        this.itemFactory = MSE.Data.Factory.createListItemFactory(this.itemFactory)
                }, createItem: function createItem(source) {
                    return this.itemFactory(source === undefined ? null : source)
                }, copyItem: function copyItem(source, destination) {
                    return this.itemFactory(source === undefined ? null : source, destination)
                }, insert: function insert() {
                    return this._insertAt(this.count, null)
                }, insertAt: function insertAt(index, data) {
                    this._insertAt(index, data);
                    return WinJS.Promise.wrap(this._item(index))
                }, forEach: function forEach(callback, index, countAfter) {
                    return this._forEach(callback, index, countAfter)
                }, forEachAll: function forEachAll(callback, index, countAfter) {
                    return this.forEach(callback, index, countAfter)
                }, toArray: function(startIndex, maxCount) {
                    return this._toArray(false, startIndex, maxCount)
                }, toArrayAll: function(startIndex, maxCount) {
                    return this._toArray(true, startIndex, maxCount)
                }, _toArray: function _toArray(all, startIndex, maxCount) {
                    startIndex = startIndex || 0;
                    var result = [];
                    var countAfter;
                    var forFunction = all ? this.forEachAll : this.forEach;
                    if (!isNaN(maxCount))
                        countAfter = maxCount - 1;
                    return forFunction.call(this, function addItem(args) {
                            if (args.item && args.item.data)
                                result.push(args.item.data)
                        }, 0, countAfter).then(null, function ignoreError(){}).then(function returnItems() {
                            return result
                        })
                }, _indexFromItemDescription: function _indexFromItemDescription(itemDescription) {
                    var result = -1;
                    if (itemDescription && !isNaN(itemDescription.sourceIndexHint) && itemDescription.sourceIndexHint >= 0)
                        result = itemDescription.sourceIndexHint;
                    else
                        MSE.Data.fail("Invalid item description was given to _indexFromItemDescription(). Descriptions must have a valid sourceIndexHint");
                    return result
                }, itemsFromDescription: function itemsFromDescription(itemDescription, countBefore, countAfter) {
                    var result;
                    var index = this._indexFromItemDescription(itemDescription);
                    if (index >= 0)
                        result = this.itemsFromIndex(index, 0, 0).then(function examineResult(result) {
                            return result
                        });
                    else
                        result = WinJS.Promise.wrapError(new Error("Unable to locate item from the given description"));
                    return result
                }, itemsFromIndex: function itemsFromIndex(index, countBefore, countAfter) {
                    return WinJS.Promise.wrap(this._items(index, countBefore, countAfter))
                }, createListAdaptor: function createListAdaptor() {
                    return {
                            compareByIdentity: true, getCount: this.getCount.bind(this), itemsFromIndex: this.itemsFromIndex.bind(this), itemsFromDescription: this.itemsFromDescription.bind(this), insertAtStart: function insertAtStart(key, data) {
                                    return WinJS.Promise.wrap(this._insertAt(0, data))
                                }, insertBefore: function insertBefore(key, data, nextKey, nextIndexHint) {
                                    return WinJS.Promise.wrap(this._insertAt(this._indexFromKey(nextKey), data))
                                }, insertAfter: function insertAfter(key, data, previousKey, previousIndexHint) {
                                    return WinJS.Promise.wrap(this._insertAt(this._indexFromKey(previousKey) + 1, data))
                                }, insertAtEnd: function insertAtEnd(key, data) {
                                    return WinJS.Promise.wrap(this._insertAt(this.count, data))
                                }, change: function change(key, newData, indexHint) {
                                    return WinJS.Promise.wrap(this._changeByKey(key, newData))
                                }, moveToStart: function moveToStart(key, indexHint) {
                                    return WinJS.Promise.wrap(this._moveByKey(key, 0))
                                }, moveBefore: function moveBefore(key, nextKey, indexHint, nextIndexHint) {
                                    return WinJS.Promise.wrap(this._moveByKey(key, this._indexFromKey(nextKey)))
                                }, moveAfter: function moveAfter(key, previousKey, indexHint, previousIndexHint) {
                                    return WinJS.Promise.wrap(this._moveByKey(key, this._indexFromKey(previousKey) + 1))
                                }, moveToEnd: function moveToEnd(key, indexHint) {
                                    return WinJS.Promise.wrap(this._moveByKey(key, this.count))
                                }, remove: function remove(key, indexHint) {
                                    return WinJS.Promise(this._removeAtKey(key))
                                }
                        }
                }, getCount: function getCount() {
                    if (this.count < 0)
                        return WinJS.Promise.wrapError(MSE.Data.List.CountResult.unknown);
                    else
                        return WinJS.Promise.wrap(this.count)
                }, getItem: function getItem(destinationIndex) {
                    this._validateIndex(destinationIndex);
                    return this._item(destinationIndex)
                }, keyFromIndex: function keyFromIndex(key) {
                    return this._keyFromIndex(key)
                }, indexFromKey: function indexFromKey(key) {
                    return this._indexFromKey(key)
                }, _insertAt: function _insertAt(index, data, noTranslation, isSourceData) {
                    this._validateInsertIndex(index);
                    var dataToCache = (noTranslation) ? data : this.createItem(data, !isSourceData);
                    dataToCache = this._cacheData(index, dataToCache);
                    this._addCount(1);
                    this._updateItemKeyMap(dataToCache.itemIndex);
                    return dataToCache
                }, _insertRangeAt: function _insertRangeAt(startIndex, sourceData, noTranslation, isSourceData) {
                    var dataToCache;
                    var index = startIndex;
                    this._validateInsertIndex(index);
                    if (Array.isArray(sourceData))
                        sourceData.forEach(function _insertRangeAtLoop(item) {
                            dataToCache = (noTranslation) ? item : this.createItem(item, !isSourceData);
                            dataToCache = this._cacheData(index, dataToCache);
                            this._addCount(1);
                            index = dataToCache.itemIndex + 1
                        }, this);
                    this._updateItemKeyMap(startIndex);
                    return index - startIndex
                }, _removeAt: function _removeAt(index) {
                    this._validateIndex(index);
                    var data = this._uncacheData(index, 1)[0];
                    MSE.Data.assert(!data || data.itemIndex === index, "The index of the stored data didn't match the removed index.");
                    this._removeDataKey(data);
                    this._addCount(-1);
                    this._updateItemKeyMap(index);
                    return data
                }, _removeDataKey: function _removeDataKey(data) {
                    var key;
                    if (data && data.key) {
                        key = data.key;
                        delete this._keyMap[data.key]
                    }
                    return key
                }, _removeRangeAt: function _removeRangeAt(index, count) {
                    this._validateIndex(index);
                    this._validateIndex(index + count - 1);
                    var removed = this._uncacheData(index, count);
                    if (removed) {
                        this._addCount(-removed.length);
                        removed.forEach(function _removeRangeAtLoop(removedItem) {
                            delete this._keyMap[removedItem.key]
                        }, this);
                        this._updateItemKeyMap(removed.length ? removed[0].itemIndex : index)
                    }
                    return removed
                }, _removeAtKey: function _removeAtKey(key) {
                    return this._removeAt(this._indexFromKey(key))
                }, _validateInsertIndex: function _validateInsertIndex(index) {
                    if (index < 0 || (index > this.count && this.hasCount))
                        throw new Error("index out of range");
                }, _validateIndex: function _validateIndex(index) {
                    if ((index < 0) || (index >= this.count && this.hasCount))
                        throw new Error("index out of range in VirtualListBase");
                }, _validateIndexNoThrow: function _validateIndexNoThrow(index) {
                    return (index >= 0) && (index < this.count && this.hasCount)
                }, _setCount: function _setCount(value) {
                    if (value < 0)
                        throw"new count is out of range";
                    if (value !== undefined && value !== null) {
                        var oldValue = this.count;
                        this.count = value;
                        if (oldValue !== value)
                            this.dispatchEvent(MS.Entertainment.Data.listEvents.countChanged, {
                                newValue: value, oldValue: oldValue
                            })
                    }
                }, _addCount: function _addCount(addition) {
                    this._setCount(this.count + addition)
                }, _trimData: function _trimData(newLength) {
                    if (this._data.length > newLength)
                        this._uncacheData(newLength, this._data.length - newLength)
                }, _forEach: function _forEach(callback, index, countAfter) {
                    index = index || 0;
                    countAfter = countAfter === undefined ? this.count : countAfter;
                    var totalCount = Math.min(this.count, this._data.length);
                    var first = Math.max(index, 0);
                    var last = Math.min(index + countAfter, totalCount - 1);
                    if (first >= this.count && !(first === 0 && this.count === 0))
                        throw"index is out of range";
                    return new WinJS.Promise(function promiseInitialization(completed, error) {
                            this._forEachIteration({
                                callback: callback, index: first, last: last, completed: completed, error: error, getCount: function getCount() {
                                        return this.count
                                    }.bind(this), getItem: function getItem(index) {
                                        return this._item(index)
                                    }.bind(this)
                            })
                        }.bind(this))
                }, _forEachIteration: function _forEachIteration(iterationArgs) {
                    var promise,
                        args;
                    var promiseCompleted = true;
                    MSE.Data.assert(iterationArgs, "invalid argument. iterationArgs was null or undefined.");
                    while (iterationArgs.index <= iterationArgs.last && iterationArgs.index < iterationArgs.getCount()) {
                        args = {
                            item: iterationArgs.getItem(iterationArgs.index), stop: false
                        };
                        try {
                            promise = WinJS.Promise.as(iterationArgs.callback(args))
                        }
                        catch(exception) {
                            MS.Entertainment.Data.assert(false, "ForEach callback throw an exception. " + exception);
                            promise = WinJS.Promise.wrapError(exception)
                        }
                        promiseCompleted = false;
                        promise.done(function() {
                            if (args.stop) {
                                if (iterationArgs.cancel)
                                    iterationArgs.cancel();
                                iterationArgs.index = iterationArgs.last + 1
                            }
                            else
                                iterationArgs.index = iterationArgs.index + 1;
                            promiseCompleted = true
                        }, function ignoreError(){});
                        if (!promiseCompleted) {
                            promise.done(function() {
                                this._forEachIteration(iterationArgs)
                            }.bind(this), function(error) {
                                iterationArgs.error(error)
                            });
                            break
                        }
                    }
                    if (promiseCompleted)
                        iterationArgs.completed()
                }, _items: function _items(index, countBefore, countAfter) {
                    var safeCount = this._data.length;
                    var first = (countBefore !== undefined && !isNaN(countBefore)) ? Math.max(index - countBefore, 0) : 0;
                    var last = (countAfter !== undefined && !isNaN(countAfter)) ? Math.min(index + countAfter, safeCount - 1) : safeCount - 1;
                    var data = [];
                    var offset = Math.max(index - first, 0);
                    if (first < this.count && first <= last)
                        data = this._data.slice(first, last + 1);
                    return {
                            items: data, offset: offset, totalCount: this.count, absoluteIndex: first + offset
                        }
                }, _emptyItems: function _emptyItems(index) {
                    return {
                            items: [], offset: 0, totalCount: this.count, absoluteIndex: index
                        }
                }, _item: function _item(index) {
                    this._validateIndex(index);
                    return this._itemNoValidate(index)
                }, _itemNoValidate: function(index) {
                    var data = this._data[index];
                    if (data) {
                        this._keyMap[this._itemKey(data)] = index;
                        data.itemIndex = index
                    }
                    else if ((index >= 0) && (index < this.count))
                        data = null;
                    return data
                }, _itemFromKey: function _itemFromKey(key) {
                    return this._item(this._indexFromKey(key))
                }, _updateCacheData: function _updateCacheData(index, data) {
                    this._validateIndex(index);
                    if (this._data.length <= index)
                        this._data.length = index + 1;
                    this._data[index] = data;
                    return data
                }, _cacheData: function _cacheData(index, data) {
                    if (index < this._data.length)
                        this._data.splice(index, 0, data);
                    else if (index >= 0) {
                        if (this._data.length <= index)
                            this._data.length = index + 1;
                        this._data[index] = data
                    }
                    return data
                }, _uncacheData: function _uncacheData(startIndex, count) {
                    return this._data.splice(startIndex, count)
                }, _createEmptyItem: function _createEmptyItem() {
                    var emptyItem = new MS.Entertainment.Data.Factory.ListItemWrapper;
                    emptyItem.key = this._createItemKey(item);
                    return emptyItem
                }, _createPlaceholderItem: function _createPlaceholderItem(index) {
                    var item = this._item(index);
                    if (!item)
                        item = this._cacheData(index, this._createEmptyItem());
                    return item
                }, _createItemKey: function _createItemKey(data) {
                    var key;
                    if (data && data.getHashCode) {
                        key = data.getHashCode();
                        if (!key || "key" in this._keyMap) {
                            MS.Entertainment.Data.fail("Key is null or undefined or already exists in list. Key = " + key);
                            key = null
                        }
                    }
                    while (!key || "key" in this._keyMap)
                        key = (this._nextDefaultKey++) + String.empty;
                    return key
                }, _itemKey: function _itemKey(data) {
                    if (!data.key)
                        data.key = this._createItemKey(data);
                    return data.key
                }, _updateItemKeyMap: function _updateItemKeyMap(startIndex, endIndex) {
                    endIndex = endIndex || this._data.length;
                    for (var i = startIndex; i < this._data.length && i <= endIndex; i++)
                        this._itemNoValidate(i)
                }, _keyFromIndex: function _keyFromIndex(index) {
                    var data;
                    if (index >= 0 && index < this.count)
                        data = this._item(index);
                    if (data)
                        return data.key
                }, _indexFromKey: function _indexFromKey(key) {
                    return this._keyMap[key]
                }, _setAt: function _setAt(index, newData) {
                    this._validateIndex(index);
                    var oldItem = this._item(index);
                    var newItem = this.createItem(newData, oldItem.isNonSourceData);
                    this._updateCacheData(index, newItem);
                    newItem.key = oldItem.key;
                    return newItem
                }, _changeByKey: function _changeByKey(key, newData) {
                    var index = this._indexFromKey(key);
                    return this._setAt(index, newData)
                }, _moveByKey: function _moveByKey(fromKey, toIndex) {
                    var fromIndex = this._indexFromKey(fromKey);
                    return this._moveByIndex(fromIndex, toIndex)
                }, _moveByIndex: function _moveByIndex(fromIndex, toIndex) {
                    this._validateIndex(fromIndex);
                    this._validateInsertIndex(toIndex);
                    if (fromIndex < toIndex)
                        toIndex--;
                    var data = this._uncacheData(fromIndex, 1)[0];
                    fromIndex = data.itemIndex;
                    data = this._cacheData(toIndex, data);
                    this._updateItemKeyMap(Math.min(fromIndex, toIndex));
                    return data
                }
        }, {
            isList: function isList(list) {
                return MS.Entertainment.Data.List.prototype.isPrototypeOf(list)
            }, isListOrArray: function isListOrArray(listOrArray) {
                    return Array.isArray(listOrArray) || MS.Entertainment.Data.List.prototype.isPrototypeOf(listOrArray)
                }, getData: function getData(list, index) {
                    var result;
                    if (Array.isArray(list))
                        result = list[index];
                    else if (MS.Entertainment.Data.List.isList(list))
                        result = list.itemsFromIndex(index, 0, 0).then(function(result) {
                            return result.items[result.offset].data
                        });
                    else
                        result = list;
                    return WinJS.Promise.as(result)
                }, dataFromIndex: function dataFromIndex(list, index) {
                    var returnValue = list;
                    if (MS.Entertainment.Data.List.isList(list))
                        returnValue = list.itemsFromIndex(index, 0, 0).then(function gotItems(args) {
                            var item = args.items[args.offset];
                            return item ? item.data : null
                        });
                    return WinJS.Promise.as(returnValue)
                }, listToArray: function listToArray(list, startIndex, maxCount) {
                    var result;
                    if (isNaN(startIndex))
                        startIndex = 0;
                    if (Array.isArray(list)) {
                        var endIndex = (!isNaN(maxCount)) ? startIndex + maxCount + 1 : undefined;
                        result = WinJS.Promise.wrap(list.slice(startIndex, endIndex))
                    }
                    else if (MS.Entertainment.Data.List.isList(list)) {
                        if (isNaN(maxCount))
                            maxCount = list.count - startIndex;
                        result = list.toArrayAll(startIndex, maxCount)
                    }
                    else if (list)
                        result = WinJS.Promise.wrap([list]);
                    else
                        result = WinJS.Promise.wrap([]);
                    return result
                }, CountResult: {unknown: "unknown"}, FetchError: {
                    noResponse: "noResponse", doesNotExist: "doesNotExist"
                }, ErrorMessage: {ListChanged: "List has changed"}
        })})
})(WinJS.Namespace.define("MS.Entertainment", null))
