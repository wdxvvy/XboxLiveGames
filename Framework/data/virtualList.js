/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/factory.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Data");
(function(MSE, undefined) {
    "use strict";
    WinJS.Namespace.defineWithParent(MSE, "Data", {
        chunkingType: {
            nothing: 0, next: 1, previous: 2
        }, VirtualListBase: WinJS.Class.derive(MS.Entertainment.Data.List, function virtualListBaseConstructor(itemFactory, chunker) {
                MS.Entertainment.Data.List.prototype.constructor.call(this, itemFactory);
                this._chunker = chunker;
                this._loadedRanges = new MS.Entertainment.Data.Ranges;
                this._loadedNonSourceRanges = new MS.Entertainment.Data.Ranges;
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                this._cacheLifespanMS = configurationManager.shell.randomAccessCacheLifespanMS
            }, {
                _uncacheTimer: null, _cacheLifespanMS: 0, _chunkingDirection: 0, _chunkingPreviousIndex: 0, _chunkingWorkerPromise: null, _chunkerEvents: null, _notificationHandler: null, _groupHinter: null, _pendingGroupHinter: null, _groupHinterExecuted: false, _currentGroupHinterPromise: null, _delayGroupHinterPromise: null, _chunker: null, _chunkerCount: -1, _loadedRanges: null, _loadedNonSourceRanges: null, _editCount: 0, _allowValidateRanges: 0, _grouper: null, _grouperEvents: null, _groupHinterRefreshDelayMS: 1000, dispose: function dispose() {
                        MS.Entertainment.Data.List.prototype.dispose.call(this);
                        this._notificationHandler = null;
                        this._loadedRanges = new MS.Entertainment.Data.Ranges;
                        this._loadedNonSourceRanges = new MS.Entertainment.Data.Ranges;
                        this.chunker = null;
                        if (this._grouperEvents) {
                            this._grouperEvents.cancel();
                            this._grouperEvents = null
                        }
                        if (this._currentGroupHinterPromise) {
                            this._currentGroupHinterPromise.cancel();
                            this._currentGroupHinterPromise = null
                        }
                        if (this._delayGroupHinterPromise) {
                            this._delayGroupHinterPromise.cancel();
                            this._delayGroupHinterPromise = null
                        }
                        this._grouper = null;
                        this._stopUncacheTimer()
                    }, chunkingEnabled: {get: function() {
                            return (!!this._chunker)
                        }}, chunker: {
                        get: function() {
                            return this._chunker
                        }, set: function(value) {
                                if (value !== this._chunker) {
                                    this._chunker = value;
                                    this._chunkerCount = (this._chunker) ? !isNaN(this._chunker.totalCount) ? this._chunker.totalCount : -1 : -1;
                                    this._setRandomCount(this._chunkerCount);
                                    this._updateChunkerEventHandlers();
                                    this._notifyInvalidateList()
                                }
                            }
                    }, chunkerCount: {get: function() {
                            return this._chunkerCount
                        }}, hasChunkerCount: {get: function() {
                            return this.chunkerCount >= 0
                        }}, sequentialChunking: {get: function() {
                            return (!!this._chunker && !!this._chunker.loadPreviousChunk && !!this._chunker.loadNextChunk)
                        }}, randomAccessChunking: {get: function() {
                            return (!!this._chunker && this.hasChunkerCount && !!this._chunker.loadChunk)
                        }}, hasNextChunk: {get: function() {
                            return (this._chunker) ? this._chunker.hasNextChunk && (!this.hasMaxCount || this.count < this.maxCount) : false
                        }}, hasPreviousChunk: {get: function() {
                            return (this._chunker) ? this._chunker.hasPreviousChunk : false
                        }}, chunkSize: {get: function() {
                            return (this._chunker) ? this._chunker.chunkSize : 0
                        }}, groupHinter: {
                        get: function() {
                            return this._pendingGroupHinter || this._groupHinter
                        }, set: function(value) {
                                if (this._groupHinter !== value && this._pendingGroupHinter !== value)
                                    this._pendingGroupHinter = value
                            }
                    }, groupHints: {get: function() {
                            return this._grouper && this._grouper.groupHints
                        }}, hasGroupHints: {get: function() {
                            var groupHintsCount = this.groupHints ? this.groupHints.count : 0;
                            return (!!this._groupHinter || !!this._pendingGroupHinter) && (!this._groupHinterExecuted || groupHintsCount > 0)
                        }}, source: {get: function() {
                            return this._source
                        }}, grouper: {get: function() {
                            return (this._grouper) ? this._grouper.grouper : null
                        }}, headerIndices: {get: function() {
                            if (this._grouper)
                                return this._grouper.headerIndices;
                            else
                                return []
                        }}, nonSourceIndices: {get: function() {
                            var result = [];
                            if (this._loadedNonSourceRanges)
                                this._loadedNonSourceRanges.ranges.forEach(function(item) {
                                    for (var i = item.start; i <= item.end; i++)
                                        result.push(i)
                                });
                            return result
                        }}, nonSourceCount: {get: function() {
                            var result = 0;
                            if (this._loadedNonSourceRanges)
                                result = this._loadedNonSourceRanges.count(0, this.count);
                            return result
                        }}, _randomAccessCachingEnabled: {get: function() {
                            return (this._cacheLifespanMS > 0) && (this.randomAccessChunking)
                        }}, createItem: function createItem(source, isNonSourceData) {
                        var item = MS.Entertainment.Data.List.prototype.createItem.apply(this, arguments);
                        item.isNonSourceData = (isNonSourceData === undefined) ? true : isNonSourceData;
                        return item
                    }, setGrouper: function setGrouper(value) {
                        if ((this._disposed && value) || (this._grouper && this._grouper.grouper === value) || (!this._grouper && !value))
                            return WinJS.Promise.wrap();
                        return this._setGrouper(value)
                    }, _ensureGrouper: function _ensureGrouper() {
                        if (!this._grouper)
                            this._setGrouper(MS.Entertainment.Data.emptyGrouper)
                    }, _setGrouper: function _setGrouper(value) {
                        if (this._disposed && value)
                            return WinJS.Promise.wrap();
                        var oldGrouper = this._grouper;
                        this._grouper = null;
                        if (this._grouperEvents) {
                            this._grouperEvents.cancel();
                            this._grouperEvents = null
                        }
                        if (oldGrouper && !this._disposed)
                            oldGrouper.clear();
                        if (value) {
                            this._grouper = new MS.Entertainment.Data.ListGrouper(value);
                            this._grouperEvents = MS.Entertainment.Utilities.addEventHandlers(this._grouper, {batchChange: this._onBatchChange.bind(this)})
                        }
                        if (oldGrouper && oldGrouper.grouper || this._grouper && this._grouper.grouper)
                            return this._updateGroups();
                        else
                            return WinJS.Promise.wrap()
                    }, getGroupHints: function getGroupHints() {
                        return this._loadPendingGroupHints(true).then(null, function ignoreError(){}).then(function returnGroupHints() {
                                return this.groupHints
                            }.bind(this))
                    }, _forceRefreshGroupHints: function forceRefreshGroupHints() {
                        this._currentGroupHinterPromise = null;
                        return this._loadPendingGroupHints(true)
                    }, _loadPendingGroupHints: function _loadPendingGroupHints(refreshAlways, useTimeout) {
                        if (this._pendingGroupHinter) {
                            this._groupHinterExecuted = false;
                            this._groupHinter = this._pendingGroupHinter;
                            this._pendingGroupHinter = null;
                            return this._refreshGroupHints(useTimeout)
                        }
                        else if (refreshAlways)
                            return this._refreshGroupHints(useTimeout)
                    }, _refreshGroupHints: function _refreshGroupHints(useTimeout) {
                        if (useTimeout)
                            return this._delayRefreshGroupHints();
                        else
                            return this._noDelayRefreshGroupHints()
                    }, _delayRefreshGroupHints: function _delayRefreshGroupHints() {
                        if (this._delayGroupHinterPromise)
                            this._delayGroupHinterPromise.cancel();
                        this._delayGroupHinterPromise = WinJS.Promise.timeout(this._groupHinterRefreshDelayMS).then(this._noDelayRefreshGroupHints.bind(this), function ignoreError(){});
                        return this._delayGroupHinterPromise
                    }, _noDelayRefreshGroupHints: function _noDelayRefreshGroupHints() {
                        if (this._delayGroupHinterPromise) {
                            this._delayGroupHinterPromise.cancel();
                            this._delayGroupHinterPromise = null
                        }
                        if ((this._disposed) || (this._currentGroupHinterPromise) || (!this._groupHinter && !this.groupHints))
                            return WinJS.Promise.as(this._currentGroupHinterPromise);
                        var groupHintsPromise;
                        if (!this._groupHinter)
                            groupHintsPromise = null;
                        else if (!this._groupHinter.getItems) {
                            MS.Entertainment.Data.fail("A groupHinter must implement an getItems() function");
                            groupHintsPromise = null
                        }
                        else
                            groupHintsPromise = this._groupHinter.getItems();
                        this._currentGroupHinterPromise = groupHintsPromise = WinJS.Promise.as(groupHintsPromise);
                        this._currentGroupHinterPromise = groupHintsPromise = groupHintsPromise.then(function gotGroupHints(groupHints) {
                            return groupHints
                        }.bind(this), function handleError(error) {
                            MS.Entertainment.Data.fail("For some reason getting the group hints failed. Error: " + (error && error.message));
                            return null
                        }.bind(this)).then(function setGroupHints(groupHints) {
                            if (this._currentGroupHinterPromise === groupHintsPromise) {
                                this._groupHinterExecuted = true;
                                return this._setGroupHints(groupHints)
                            }
                        }.bind(this)).then(function setGroupHintsCompleted() {
                            if (this._currentGroupHinterPromise === groupHintsPromise)
                                this._currentGroupHinterPromise = null;
                            return this.groupHints
                        }.bind(this));
                        return WinJS.Promise.as(groupHintsPromise)
                    }, _setGroupHints: function _setGroupHints(groupHints) {
                        if (groupHints)
                            this._ensureGrouper();
                        if (this._grouper && groupHints !== this._grouper.groupHints) {
                            var oldValue = this._grouper.groupHints;
                            if (groupHints)
                                groupHints.forEachAll(function(args) {
                                    this._addFirstItemIndexHintToGroupHint(args.item);
                                    if (args.item.data && args.item.data.subGroupHints)
                                        args.item.data.subGroupHints.forEach(function(subGroupHint) {
                                            this._addFirstItemIndexHintToGroupHint(subGroupHint)
                                        }, this)
                                }.bind(this)).done(null, function handleError(error) {
                                    MS.Entertainment.Data.fail("Failed to add firstItemIndex to the group hints. Error message = " + (error && error.message))
                                });
                            return this._grouper.setGroupHints(groupHints).then(function notifyChanges() {
                                    if (groupHints)
                                        this._forceListenToAllRandomAccessChanges();
                                    this.dispatchChangeAndNotify("groupHints", groupHints, oldValue)
                                }.bind(this), function handleError(error) {
                                    MS.Entertainment.Data.fail("Failed to set group hints. Error message = " + (error && error.message))
                                })
                        }
                    }, _pauseChunkerEvents: function _pauseChunkerEvents() {
                        var promise;
                        if (this.chunker && this.chunker.pause)
                            promise = this.chunker.pause();
                        return WinJS.Promise.as(promise)
                    }, _unpauseChunkerEvents: function _unpauseChunkerEvents() {
                        var promise;
                        if (this.chunker && this.chunker.unpause)
                            promise = this.chunker.unpause();
                        return WinJS.Promise.as(promise)
                    }, _forceListenToAllRandomAccessChanges: function _forceListenToAllRandomAccessChanges() {
                        if (this.chunker)
                            this._safeChunkWork(function loadLastChunk() {
                                if (this.chunker && this.randomAccessChunking && this.count && this.hasCount)
                                    return this.chunker.loadChunk(this.count - 1, 0, 0)
                            }.bind(this))
                    }, _addFirstItemIndexHintToGroupHint: function _addFirstItemIndexHintToGroupHint(groupHint) {
                        if (groupHint && (groupHint.data && groupHint.data.firstItemIndexSourceHint >= 0) || (groupHint.firstItemIndexSourceHint >= 0)) {
                            var sourceIndex = (groupHint.data && groupHint.data.firstItemIndexSourceHint >= 0) ? groupHint.data.firstItemIndexSourceHint : groupHint.firstItemIndexSourceHint;
                            MS.Entertainment.Data.Factory.ListItemWrapper.addFirstItemIndexHint(groupHint, function getFirstItemIndexHint() {
                                return this.indexFromSourceIndex(sourceIndex)
                            }.bind(this));
                            groupHint = null
                        }
                    }, setNotificationHandler: function setNotificationHandler(notificationHandler) {
                        if (this._disposed)
                            return;
                        this._notificationHandler = notificationHandler
                    }, preventNotifications: false, _clearChunkerEventHandlers: function _clearChunkerEventHandlers() {
                        if (this._chunkerEvents) {
                            this._chunkerEvents.cancel();
                            this._chunkerEvents = null
                        }
                    }, _updateChunkerEventHandlers: function _updateChunkerEventHandler() {
                        this._clearChunkerEventHandlers();
                        if (this.chunker)
                            this._chunkerEvents = MS.Entertainment.Utilities.addEvents(this.chunker, {
                                batchChange: this._onBatchChange.bind(this), reset: this._resetCaches.bind(this)
                            })
                    }, _onBatchChange: function _onBatchChange(args) {
                        var nonSourceData = args.detail.sender === this._grouper;
                        return this._editingListPrivate().then(function readyForEdit() {
                                var data,
                                    oldData,
                                    key,
                                    index;
                                var startIndex = this.count;
                                var changes = args.detail.changes;
                                var batch = this._startNotificationBatch();
                                try {
                                    changes.forEach(function applyChange(change) {
                                        if (change.absoluteIndex >= 0)
                                            index = change.absoluteIndex;
                                        else
                                            index = this._indexFromSourceIndex(change.index, change.change === "Add");
                                        switch (change.change) {
                                            case"Add":
                                                this._validateInsertIndex(index);
                                                data = this.createItem(change.value, nonSourceData);
                                                this._addCount(1);
                                                data = this._cacheData(index, data);
                                                startIndex = Math.min(startIndex, data.itemIndex);
                                                batch.inserted(data, this._keyFromIndex(data.itemIndex - 1), this._keyFromIndex(data.itemIndex + 1), data.itemIndex);
                                                break;
                                            case"Remove":
                                                this._validateIndex(index);
                                                startIndex = Math.min(startIndex, index);
                                                data = this._uncacheData(index, 1)[0];
                                                key = this._removeDataKey(data);
                                                this._addCount(-1);
                                                if (data)
                                                    batch.removed(key, data.itemIndex);
                                                break;
                                            case"Update":
                                                oldData = this._itemNoValidate(index);
                                                if (change.value)
                                                    data = this.createItem(change.value, nonSourceData);
                                                if (oldData && data) {
                                                    data = this._updateCacheData(index, data);
                                                    data.key = oldData.key;
                                                    batch.changed(data, oldData)
                                                }
                                                break
                                        }
                                        {}
                                    }.bind(this))
                                }
                                catch(error) {
                                    MS.Entertainment.Data.fail("Exception occured while handling change event. Error message: " + (error && error.message))
                                }
                                if (this._validateIndexNoThrow(startIndex))
                                    this._updateItemKeyMap(startIndex);
                                if (!nonSourceData)
                                    this._loadPendingGroupHints(true, true);
                                this._endNotificationBatch();
                                this._safeStartUncacheTimer()
                            }.bind(this))
                    }, forEach: function forEach(callback, index, countAfter) {
                        var that = this;
                        index = index || 0;
                        var sourceCount = countAfter !== undefined && countAfter !== null ? index + countAfter : undefined;
                        return this._copyFromSourceAsync(sourceCount).then(function copiedSourceItems() {
                                return that._forEach(callback, index, countAfter)
                            }, function copyFailed(error) {
                                return WinJS.Promise.wrapError(error)
                            })
                    }, forEachAll: function forEachAll(callback, index, countAfter) {
                        index = index || 0;
                        var callbacks = {
                                iteration: callback, completed: null, error: null, cancel: function() {
                                        callbacks.cancelled = true
                                    }, cancelled: false
                            };
                        var promise = new WinJS.Promise(function startForEachAll(completed, error) {
                                callbacks.completed = completed;
                                callbacks.error = error;
                                this._forEachAll(callbacks, index, countAfter)
                            }.bind(this), function cancelForEachAll() {
                                callbacks.cancel()
                            });
                        promise.done(function forEachAllCompleted() {
                            callbacks = null
                        }, function forEachAllError() {
                            callbacks = null
                        });
                        return promise
                    }, _forEachAll: function _forEachAll(callbacks, index, countAfter) {
                        index = index || 0;
                        var itemsFromIndexCountAfter = countAfter;
                        if (isNaN(itemsFromIndexCountAfter))
                            itemsFromIndexCountAfter = this.chunkSize > 0 ? this.chunkSize : 100;
                        this.itemsFromIndex(index, 0, itemsFromIndexCountAfter).then(function gotItems(result) {
                            if (callbacks.cancelled)
                                return;
                            var oldIndex = index;
                            var adjustedCountAfter = isNaN(countAfter) ? result.totalCount - index - 1 : Math.min(countAfter, result.totalCount - index - 1);
                            var lastNeededIndex = index + adjustedCountAfter;
                            var lastLoadedAfter = result.items.length - result.offset;
                            var lastLoadedIndex = index + lastLoadedAfter - 1;
                            var maxItemsIndex;
                            if (lastNeededIndex <= lastLoadedIndex) {
                                index = -1;
                                maxItemsIndex = result.items.length - (lastLoadedIndex - lastNeededIndex) - 1
                            }
                            else if (lastLoadedAfter >= 0) {
                                countAfter = countAfter - lastLoadedAfter;
                                index = lastLoadedIndex + 1;
                                maxItemsIndex = result.items.length - 1
                            }
                            else if (!this.randomAccessChunking)
                                index = -1;
                            return new WinJS.Promise(function promiseInitialization(completed, error) {
                                    this._forEachIteration({
                                        callback: callbacks.iteration, cancel: callbacks.cancel, index: result.offset, last: maxItemsIndex, completed: completed, error: error, stopped: false, getCount: function getCount() {
                                                return result.items.length
                                            }, getItem: function getItem(index) {
                                                return result.items[index]
                                            }
                                    })
                                }.bind(this))
                        }.bind(this)).done(function checkIfMoreDataNeeded() {
                            if (callbacks.cancelled || index < 0)
                                callbacks.completed();
                            else
                                this._forEachAll(callbacks, index, countAfter)
                        }.bind(this), function forEachAllFailed(error) {
                            if (error && error.shouldRetry)
                                this._forEachAll(callbacks, index, countAfter);
                            else
                                callbacks.error(error)
                        }.bind(this))
                    }, isHeader: function isHeader(index) {
                        return this._grouper ? this._grouper.countHeaders(index, index) === 1 : 0
                    }, headerCount: {get: function getHeaderCount() {
                            return this._grouper ? this._grouper.countHeaders(0, this.count) : 0
                        }}, _items: function _items(index, countBefore, countAfter) {
                        var result = MS.Entertainment.Data.List.prototype._items.apply(this, arguments);
                        if (this.groupHinter && (!this._grouper || (this._grouper.grouper && this._grouper.grouper.isEmpty)) && result && result.items)
                            result.items.forEach(function setGroupIndexHint(item) {
                                if (this._grouper)
                                    item.groupIndexHint = this._grouper.groupIndexFromSourceIndex(this.indexToSourceIndex(item.itemIndex));
                                if (item.groupIndexHint < 0 || !item.groupIndexHint)
                                    item.groupIndexHint = 0
                            }, this);
                        this._loadPendingGroupHints();
                        return result
                    }, itemsFromKey: function itemsFromKey(key, countBefore, countAfter) {
                        var result;
                        var index = this._indexFromKey(key);
                        var validIndex = typeof index === "number" && index >= 0;
                        if (!validIndex) {
                            result = new Error("Invalid index supplied, likely the item has since been removed");
                            result.name = WinJS.UI.FetchError.doesNotExist;
                            result = WinJS.Promise.wrapError(result)
                        }
                        else
                            result = this._itemsFromIndex(index, countBefore, countAfter, key);
                        return result
                    }, itemsFromDescription: function itemsFromDescription(itemDescription, countBefore, countAfter) {
                        var result;
                        var index = this._indexFromItemDescription(itemDescription);
                        index = this._indexFromSourceIndex(index) - this._loadedNonSourceRanges.exclusionCount(index, index);
                        if (index >= 0)
                            result = this._itemsFromIndex(index, countBefore, countAfter, null).then(function examineResult(result) {
                                result.totalCount = null;
                                return result
                            }.bind(this));
                        else
                            result = WinJS.Promise.wrapError(new Error("Unable to locate item from the given description"));
                        return result
                    }, itemsFromIndex: function itemsFromIndex(index, countBefore, countAfter) {
                        return this._itemsFromIndex(index, countBefore, countAfter)
                    }, _itemsFromIndex: function _itemsFromIndex(index, countBefore, countAfter, keyHint) {
                        if (!this._indexFromKey(keyHint))
                            keyHint = null;
                        if (this.randomAccessChunking)
                            return this._itemsFromIndexRandomChunking(index, countBefore, countAfter, keyHint);
                        else
                            return this._itemsFromIndexSequentialChunking(index, countBefore, countAfter)
                    }, _itemsFromIndexRandomChunking: function _itemsFromIndexRandomChunking(index, countBefore, countAfter, keyHint) {
                        var cacheStartCount = 0;
                        var cacheEndCount = 0;
                        var cacheMiddleCount = 0;
                        var chunkingWorkerPromise = this._chunkingWorkerPromise || WinJS.Promise.wrap();
                        var editCount = this._editCount;
                        var originalBefore = countBefore;
                        var originalAfter = countAfter;
                        var clampRange = false;
                        if (isNaN(countBefore)) {
                            countBefore = 0;
                            clampRange = true
                        }
                        if (isNaN(countAfter)) {
                            countAfter = Math.max(0, this.chunkSize - 1);
                            clampRange = true
                        }
                        if (this.chunkSize) {
                            if (clampRange && countBefore + 1 + countAfter > this.chunkSize)
                                if (countBefore > countAfter) {
                                    countAfter = Math.max(0, this.chunkSize - (countBefore + 1));
                                    countBefore = Math.max(0, this.chunkSize - (countAfter + 1))
                                }
                                else {
                                    countBefore = Math.max(0, this.chunkSize - (countAfter + 1));
                                    countAfter = Math.max(0, this.chunkSize - (countBefore + 1))
                                }
                            countBefore = index - (Math.floor((index - countBefore) / this.chunkSize) * this.chunkSize);
                            countAfter = ((Math.floor((index + countAfter) / this.chunkSize) + 1) * this.chunkSize) - 1 - index
                        }
                        if (index - countBefore < 0 || countBefore < 0)
                            countBefore = index;
                        var pauseChunkerEventsPromise = this._pauseChunkerEvents();
                        var lastRandomChunkFinished = function lastRandomChunkFinished() {
                                return pauseChunkerEventsPromise.then(function chunkerPaused() {
                                        if (editCount !== this._editCount)
                                            return this._createRetryError(MS.Entertainment.Data.List.ErrorMessage.ListChanged);
                                        this._stopUncacheTimer();
                                        this._startNotificationBatch();
                                        return this._copyFromSourceIfNeeded()
                                    }.bind(this))
                            }.bind(this);
                        return this._chunkingWorkerPromise = chunkingWorkerPromise.then(lastRandomChunkFinished, lastRandomChunkFinished).then(function copiedFromSource() {
                                if (!this.randomAccessChunking)
                                    return WinJS.Promise.wrapError("Item request has failled because the list has likely been disposed");
                                editCount = this._editCount;
                                var rangeCount0,
                                    rangeCount1,
                                    rangeCount2,
                                    rangeCount3,
                                    rangeCount4;
                                var cacheSourceOrigin,
                                    cacheSourceStartToEnd,
                                    cacheSourceStartToOrigin,
                                    cacheSourceEndToOrigin;
                                var adjustedIndex,
                                    adjustedBefore,
                                    adjustedAfter,
                                    firstIndex,
                                    lastIndex,
                                    requestLength;
                                var keyHint;
                                if (keyHint) {
                                    keyIndex = this._indexFromKey(keyHint);
                                    index = (keyIndex !== undefined) ? keyIndex : index
                                }
                                firstIndex = index - countBefore;
                                lastIndex = index + countAfter;
                                requestLength = countBefore + 1 + countAfter;
                                cacheStartCount = this._loadedRanges.count(firstIndex, lastIndex, true);
                                cacheEndCount = this._loadedRanges.countFromEnd(index, lastIndex, true);
                                cacheMiddleCount = Math.max(0, this._loadedRanges.count(firstIndex, lastIndex) - cacheStartCount - cacheEndCount);
                                if (editCount !== this._editCount)
                                    adjustedBefore = -1;
                                else if (cacheStartCount <= 0 && cacheEndCount <= 0 && cacheMiddleCount <= 0) {
                                    adjustedIndex = index - this._loadedNonSourceRanges.count(0, index - countBefore - 1);
                                    adjustedBefore = countBefore;
                                    adjustedAfter = countAfter
                                }
                                else if (cacheStartCount === requestLength)
                                    adjustedBefore = -1;
                                else {
                                    rangeCount0 = this._loadedNonSourceRanges.count(index, index);
                                    rangeCount1 = this._loadedNonSourceRanges.count(0, index - 1);
                                    rangeCount2 = this._loadedNonSourceRanges.count(firstIndex, index - 1);
                                    rangeCount3 = this._loadedNonSourceRanges.count(index + 1, lastIndex);
                                    rangeCount4 = this._loadedNonSourceRanges.count(firstIndex, lastIndex);
                                    cacheSourceOrigin = this._loadedRanges.count(index, index, true);
                                    cacheSourceOrigin -= this._loadedNonSourceRanges.count(index, index + cacheSourceOrigin);
                                    cacheSourceStartToEnd = cacheStartCount - this._loadedNonSourceRanges.count(firstIndex, firstIndex + cacheStartCount - 1);
                                    cacheSourceStartToOrigin = this._loadedRanges.count(firstIndex, index - 1, true);
                                    cacheSourceStartToOrigin -= this._loadedNonSourceRanges.count(firstIndex, firstIndex + cacheSourceStartToOrigin - 1);
                                    cacheSourceEndToOrigin = this._loadedRanges.countFromEnd(index, lastIndex, true);
                                    cacheSourceEndToOrigin -= this._loadedNonSourceRanges.count(lastIndex - cacheSourceEndToOrigin + 1, lastIndex);
                                    adjustedIndex = index - rangeCount1 + (cacheSourceStartToEnd - cacheSourceStartToOrigin);
                                    adjustedBefore = countBefore - rangeCount2 - cacheSourceStartToOrigin;
                                    adjustedAfter = countAfter - rangeCount3 - (cacheSourceEndToOrigin) - (rangeCount0 + cacheSourceStartToEnd - cacheSourceStartToOrigin);
                                    if (adjustedAfter < 0) {
                                        adjustedIndex = adjustedIndex + adjustedAfter;
                                        adjustedBefore = adjustedBefore + adjustedAfter;
                                        adjustedAfter = 0
                                    }
                                }
                                if (adjustedBefore >= 0 && adjustedAfter >= 0)
                                    return this.chunker.loadChunk(adjustedIndex, adjustedBefore, adjustedAfter)
                            }.bind(this)).then(function loadedChunk(chunkResult) {
                                var j = 0;
                                var currentItem;
                                var lastCount = 0;
                                var chunkResultLength = (chunkResult) ? chunkResult.items.length : 0;
                                var chunkFailed = (chunkResult) ? chunkResult.error : false;
                                var absoluteIndex = index - countBefore;
                                var maxAbsoluteIndex = -1;
                                var result;
                                if (editCount === this._editCount) {
                                    if (chunkResult)
                                        this._setRandomCount(chunkResult.totalCount);
                                    maxAbsoluteIndex = Math.min(this.count - 1, index + countAfter)
                                }
                                if (cacheStartCount > 0 && absoluteIndex <= maxAbsoluteIndex)
                                    absoluteIndex += cacheStartCount;
                                while (absoluteIndex <= maxAbsoluteIndex && j < chunkResultLength) {
                                    currentItem = this._item(absoluteIndex);
                                    if (!currentItem || !currentItem.isNonSourceData) {
                                        lastCount = this.count;
                                        currentItem = this._cacheSourceItemData(absoluteIndex, chunkResult.items[j]);
                                        maxAbsoluteIndex += (this.count - lastCount);
                                        absoluteIndex += (currentItem.itemIndex - absoluteIndex);
                                        j++
                                    }
                                    else if (currentItem && !currentItem.cached) {
                                        result = new Error("Data is not up to data. Please try again.");
                                        maxAbsoluteIndex = -1;
                                        totalCount = 0;
                                        break
                                    }
                                    absoluteIndex += 1
                                }
                                if (chunkFailed)
                                    result = this._emptyItems(index);
                                else if (maxAbsoluteIndex >= 0 || this.count === 0) {
                                    var keyIndex;
                                    if (keyHint)
                                        keyIndex = this._indexFromKey(keyHint);
                                    countAfter = Math.max(0, Math.min(maxAbsoluteIndex - index, countAfter));
                                    if (keyIndex !== index && keyIndex !== undefined && keyIndex >= index - countBefore && keyIndex <= index + countAfter) {
                                        var keyIndexDelta = keyIndex - index;
                                        result = this._items(keyIndex, Math.max(countBefore - keyIndexDelta, keyIndex - (index - countBefore)), Math.min(Math.max(0, countAfter + keyIndexDelta), (index + countAfter) - keyIndex))
                                    }
                                    else
                                        result = this._items(index, countBefore, countAfter)
                                }
                                if (!result)
                                    result = this._createRetryError(MS.Entertainment.Data.List.ErrorMessage.ListChanged);
                                this._endNotificationBatch();
                                if (result.items)
                                    this._startUncacheTimer();
                                else
                                    result = WinJS.Promise.wrapError(result);
                                return result
                            }.bind(this)).then(function handleSuccess(result) {
                                this._unpauseChunkerEvents();
                                return result
                            }.bind(this), function handleError(error) {
                                this._unpauseChunkerEvents();
                                return WinJS.Promise.wrapError(error)
                            }.bind(this))
                    }, _createRetryError: function _createRetryError(message) {
                        var error = new Error(message);
                        error.shouldRetry = true;
                        return error
                    }, _getLogger: function _getLogger() {
                        MS.Entertainment.Data.VirtualListBase.debugId = MS.Entertainment.Data.VirtualListBase.debugId || 0;
                        MS.Entertainment.Data.VirtualListBase.debugId++;
                        var id = MS.Entertainment.Data.VirtualListBase.debugId;
                        return {
                                logEnterLoadChunk: function _logEnterLoadChunk(index, countBefore, countAfter) {
                                    Debug.console.log(0, "[LIST " + id + "] enter load chunk [index = " + index + "][countAfter = " + countAfter + "][countBefore = " + countBefore + "]")
                                }, logWaitingToLoadChunk: function _logWaitingToLoadChunk(index, countBefore, countAfter) {
                                        Debug.console.log(0, "[LIST " + id + "] waiting to load chunk [index = " + index + "][countAfter = " + countAfter + "][countBefore = " + countBefore + "]")
                                    }, logPreLoadChunk: function _logPreLoadChunk(adjustedIndex, adjustedBefore, adjustedAfter) {
                                        Debug.console.log(0, "[LIST " + id + "] pre-load chunk [adjustedIndex = " + adjustedIndex + "][adjustedAfter = " + adjustedAfter + "][adjustedBefore = " + adjustedBefore + "]")
                                    }, logPostLoadChunk: function _logPostLoadChunk(chunkSize, chunkAbsoluteIndex, absoluteIndex, maxAbsoluteIndex) {
                                        Debug.console.log(0, "[LIST " + id + "] post-load chunk [chunkSize = " + chunkSize + "][chunkAbsoluteIndex = " + chunkAbsoluteIndex + "][absoluteIndex = " + absoluteIndex + "][maxAbsoluteIndex = " + maxAbsoluteIndex + "]")
                                    }, logLeaveLoadChunk: function _logLeaveLoadChunk(result, expectedCount) {
                                        if (result && result.items) {
                                            Debug.console.log(0, "[LIST " + id + "] leave load chunk [offset = " + result.offset + "][absoluteIndex = " + result.itemIndex + "][totalCount = " + result.totalCount + "][itemsLength = " + result.items.length + "][expectedCount = " + expectedCount + "]");
                                            if (result.items.length) {
                                                Debug.console.log(0, "[LIST " + id + "] leave load chunk [items[0].data.name = '" + result.items[0].data.name + "']");
                                                Debug.console.log(0, "[LIST " + id + "] leave load chunk [items[X].data.name = '" + result.items[result.items.length - 1].data.name + "']")
                                            }
                                        }
                                    }
                            }
                    }, _itemsFromIndexSequentialChunking: function _itemsFromIndexSequentialChunking(index, countBefore, countAfter) {
                        countBefore = isNaN(countBefore) ? 0 : countBefore;
                        countAfter = isNaN(countAfter) ? this.chunkSize - 1 : countAfter;
                        if (countBefore < 0)
                            countBefore = 0;
                        var maxEndIndex;
                        var maxStartIndex;
                        var minStartIndex;
                        var minEndIndex;
                        var startedAtEnd = countAfter + index + 1 >= this.count;
                        minStartIndex = Math.max(index - countBefore, 0);
                        minEndIndex = Math.min(index + countAfter, this.count - 1);
                        if (this.chunkSize > 0) {
                            maxEndIndex = Math.max(0, (minEndIndex + this.chunkSize - 1) - (minEndIndex % this.chunkSize));
                            maxStartIndex = Math.max(0, minStartIndex - (minStartIndex % this.chunkSize))
                        }
                        else {
                            maxEndIndex = this.count > 0 ? this.count - 1 : 0;
                            maxStartIndex = 0
                        }
                        return this._prefetchData(minStartIndex, minEndIndex, maxStartIndex, maxEndIndex).then(function prefetchCompleted() {
                                return this._copyFromSourceAsync(maxEndIndex)
                            }.bind(this)).then(function copiedFromSource() {
                                if (isNaN(countAfter) || countAfter < 0 || countAfter + index >= this.count)
                                    countAfter = Math.max(0, this.count - index - 1);
                                if (this.hasNextChunk && startedAtEnd)
                                    countAfter = countAfter - 1;
                                return this._items(index, countBefore, countAfter)
                            }.bind(this))
                    }, createListAdaptor: function createListAdaptor() {
                        return {
                                compareByIdentity: !this.randomAccessChunking, getCount: this.getCount.bind(this), itemsFromKey: this.itemsFromKey.bind(this), itemsFromIndex: this.itemsFromIndex.bind(this), itemsFromDescription: this.itemsFromDescription.bind(this), setNotificationHandler: this.setNotificationHandler.bind(this), itemSignature: function(data) {
                                        var result;
                                        if (!data)
                                            result = data;
                                        else if (data.itemSignature !== undefined)
                                            result = data.itemSignature;
                                        else {
                                            result = JSON.stringify(MS.Entertainment.Data.deflate(data));
                                            if (!result === undefined)
                                                throw new Error("item signature could not be created");
                                            data.itemSignature = result
                                        }
                                        return result
                                    }.bind(this), insertAtStart: function insertAtStart(key, data) {
                                        return this._insertAtAsync(0, data)
                                    }.bind(this), insertBefore: function insertBefore(key, data, nextKey, nextIndexHint) {
                                        return this._insertAtAsync(this._indexFromKey(nextKey), data, nextKey)
                                    }.bind(this), insertAfter: function insertAfter(key, data, previousKey, previousIndexHint) {
                                        return this._insertAtAsync(this._indexFromKey(previousKey), data, previousKey, 1)
                                    }.bind(this), insertAtEnd: function insertAtEnd(key, data) {
                                        return this._insertAtAsync(this.count, data)
                                    }.bind(this), change: function change(key, newData, indexHint) {
                                        var that = this;
                                        return this._editingListPrivate().then(function copiedFromSource() {
                                                var newItem = that._changeByKey(key, newData);
                                                return newItem
                                            }, function copyFailed(error) {
                                                return WinJS.Promise.wrapError(error)
                                            })
                                    }.bind(this), moveToStart: function moveToStart(key, indexHint) {
                                        return this._moveByKeyAsync(key, 0)
                                    }.bind(this), moveBefore: function moveBefore(key, nextKey, indexHint, nextIndexHint) {
                                        return this._moveByKeyAsync(key, this._indexFromKey(nextKey), nextKey)
                                    }.bind(this), moveAfter: function moveAfter(key, previousKey, indexHint, previousIndexHint) {
                                        return this._moveByKeyAsync(key, this._indexFromKey(previousKey), previousKey, 1)
                                    }.bind(this), moveToEnd: function moveToEnd(key, indexHint) {
                                        return this._moveByKeyAsync(key, this.count)
                                    }.bind(this), remove: function remove(key, indexHint) {
                                        var that = this;
                                        return this._editingListPrivate().then(function copiedFromSource() {
                                                var index = that._indexFromKey(key);
                                                var removedItem = that._removeAt(index);
                                                return removedItem
                                            }, function copyFailed(error) {
                                                return WinJS.Promise.wrapError(error)
                                            })
                                    }.bind(this)
                            }
                    }, insertAt: function insertAt(index, data, options) {
                        var that = this;
                        var insertedData;
                        options = options || {};
                        return this._editingListPrivate().then(function copiedFromSource() {
                                index = that._indexFromNoHeaderIndex(index, true);
                                insertedData = that._insertAt(index, data, false, options.isSourceData);
                                if (!options.suppressEvents)
                                    that._notifyInsertedItem(insertedData, insertedData.itemIndex);
                                {};
                                return insertedData
                            }, function copyFailed(error) {
                                return WinJS.Promise.wrapError(error)
                            })
                    }, removeAt: function removeAt(index, options) {
                        options = options || {};
                        var that = this;
                        return this._editingListPrivate().then(function copiedFromSource() {
                                index = that._indexFromNoHeaderIndex(index);
                                var removedItem = that._removeAt(index);
                                if (removedItem && !options.suppressEvents)
                                    that._notifyRemoved(removedItem.key, removedItem.itemIndex);
                                return removedItem
                            }, function copyFailed(error) {
                                return WinJS.Promise.wrapError(error)
                            })
                    }, moveAt: function moveAt(fromIndex, toIndex, options) {
                        options = options || {};
                        var that = this;
                        return this._editingListPrivate().then(function copiedFromSource() {
                                fromIndex = that._indexFromNoHeaderIndex(fromIndex);
                                toIndex = that._indexFromNoHeaderIndex(toIndex, true);
                                var item = that._moveByIndex(fromIndex, toIndex);
                                if (item && !options.suppressEvents)
                                    that._notifyMoved(item, fromIndex);
                                return item
                            }, function moveFailed(error) {
                                return WinJS.Promise.wrapError(error)
                            })
                    }, insertRangeAtEnd: function insertRangeAtEnd(range, options) {
                        options = options || {};
                        return this._editingListPrivate().then(function() {
                                var startIndex = this.count;
                                var count = this._insertRangeAt(startIndex, range, false, options.isSourceData);
                                if (!options.suppressEvents)
                                    this._notifyRangeInserted(startIndex, count)
                            }.bind(this), function(error) {
                                throw error;
                            })
                    }, insertRangeAtStart: function insertRangeAtStart(range, options) {
                        options = options || {};
                        return this._editingListPrivate().then(function() {
                                var count = this._insertRangeAt(0, range, false, options.isSourceData);
                                if (!options.suppressEvents)
                                    this._notifyRangeInserted(0, count)
                            }.bind(this), function(error) {
                                throw error;
                            })
                    }, insertRangeAt: function insertRangeAt(index, range, options) {
                        options = options || {};
                        return this._editingListPrivate().then(function() {
                                index = this._indexFromNoHeaderIndex(index, true);
                                var count = this._insertRangeAt(index, range, false, options.isSourceData);
                                if (!options.suppressEvents)
                                    this._notifyRangeInserted(index, count)
                            }.bind(this), function(error) {
                                throw error;
                            })
                    }, removeIndices: function removeIndices(indices, options) {
                        indices = indices || [];
                        var ranges = indices.map(function mapIndex(index) {
                                return {
                                        firstIndex: index, lastIndex: index
                                    }
                            });
                        return this.removeRanges(ranges, options)
                    }, removeRangeAt: function removeRangeAt(index, count, options) {
                        options = options || {};
                        return this._editingListPrivate().then(function() {
                                index = this._indexFromNoHeaderIndex(index);
                                var removed = this._removeRangeAt(index, count);
                                if (!options.suppressEvents)
                                    this._notifyRangeRemoved(removed, index)
                            }.bind(this), function(error) {
                                throw error;
                            })
                    }, removeRanges: function removeRanges(ranges, options) {
                        options = options || {};
                        if (!ranges)
                            throw new Error("Parameter 'ranges' was null or empty");
                        return this._editingListPrivate().then(function() {
                                var removed = [];
                                for (var i = ranges.length - 1; i >= 0; i--)
                                    removed = removed.concat(this._removeRangeAt(ranges[i].firstIndex, ranges[i].lastIndex - ranges[i].firstIndex + 1));
                                if (!options.suppressEvents)
                                    this._notifyRangeRemoved(removed)
                            }.bind(this), function(error) {
                                throw error;
                            })
                    }, _setRandomCount: function _setRandomCount(count) {
                        if (this.randomAccessChunking) {
                            this.count = count + this._loadedNonSourceRanges.count(0);
                            this._chunkerCount = count
                        }
                    }, _setSequentialCount: function _setSequentialCount(count) {
                        if (!this.randomAccessChunking)
                            this.count = count
                    }, _setEmptyCount: function _setEmptyCount(count) {
                        if (this.count < 0)
                            this.count = count
                    }, _insertAtAsync: function _insertAtAsync(index, data, key, offset, isSourceData) {
                        var that = this;
                        offset = offset || 0;
                        return this._editingListPrivate().then(function copiedFromSource() {
                                index = (isNaN(index)) ? that._indexFromKey(key) : index;
                                var item = that._insertAt(index + offset, data, false, isSourceData);
                                return item
                            }, function copyFailed(error) {
                                return WinJS.Promise.wrapError(error)
                            })
                    }, _moveByKeyAsync: function _moveByKeyAsync(fromKey, toIndex, toKey, toOffset) {
                        var that = this;
                        toOffset = toOffset || 0;
                        return this._editingListPrivate().then(function copiedFromSource() {
                                toIndex = (isNaN(toIndex)) ? that._indexFromKey(toKey) : toIndex;
                                var item = that._moveByKey(fromKey, toIndex + toOffset);
                                return item
                            }, function copyFailed(error) {
                                return WinJS.Promise.wrapError(error)
                            })
                    }, indexFromSourceIndex: function indexFromSourceIndex(index) {
                        return this._indexFromSourceIndex(index, false)
                    }, indexToSourceIndex: function indexToSourceIndex(index) {
                        return index - this._loadedNonSourceRanges.count(0, index)
                    }, noHeaderIndexFromSourceIndex: function noHeaderIndexFromSourceIndex(index) {
                        return this._indexToNoHeaderIndex(this._indexFromSourceIndex(index, false))
                    }, _indexFromSourceIndex: function _indexFromSourceIndex(index, insert) {
                        return index + this._loadedNonSourceRanges.exclusionCount(0, insert && index ? index - 1 : index)
                    }, _indexToNoHeaderIndex: function _indexToNoHeaderIndex(index) {
                        if (this._grouper)
                            index -= this._grouper.countHeaders(0, index);
                        return index
                    }, _indexFromNoHeaderIndex: function _indexFromNoHeaderIndex(index, insert) {
                        if (this._grouper)
                            index += this._grouper.exclusionCountHeaders(0, insert && index ? index - 1 : index);
                        return index
                    }, _copyItemTo: function _copyItemTo(item, oldItem) {
                        if (oldItem) {
                            item.key = oldItem.key;
                            item.itemIndex = oldItem.itemIndex;
                            if (this._grouper)
                                this._grouper.copy(item, oldItem)
                        }
                    }, _updateCacheData: function _updateCacheData(index, data) {
                        if (data && data.cached) {
                            if (this._grouper)
                                index = this._grouper.update(index, data, this._itemNoValidate.bind(this));
                            else
                                MS.Entertainment.Data.ListGrouper.clearGroup(data);
                            data.itemIndex = index
                        }
                        data = MSE.Data.List.prototype._updateCacheData.call(this, index, data);
                        this._updateCacheDataRanges(index, data);
                        return data
                    }, _updateCacheDataRanges: function _updateCacheDataRanges(index, data) {
                        if (data) {
                            if (data.cached) {
                                this._loadedRanges.insert(index);
                                if (data.isNonSourceData)
                                    this._loadedNonSourceRanges.insert(index)
                            }
                            else {
                                this._loadedRanges.remove(index);
                                if (data.isNonSourceData)
                                    this._loadedNonSourceRanges.remove(index)
                            }
                            this._validateCacheAt(index - 1);
                            this._validateCacheAt(index);
                            this._validateCacheAt(index + 1);
                            this._validateRanges(data.isHeader)
                        }
                    }, _cacheData: function _cacheData(index, data) {
                        if (data && data.data) {
                            if (this._grouper)
                                index = this._grouper.insert(index, data, this._itemNoValidate.bind(this));
                            else
                                MS.Entertainment.Data.ListGrouper.clearGroup(data);
                            data.itemIndex = index
                        }
                        data = MSE.Data.List.prototype._cacheData.call(this, index, data);
                        if (data) {
                            this._loadedRanges.shift(index, true);
                            this._loadedNonSourceRanges.shift(index, true);
                            if (data.cached) {
                                this._loadedRanges.insert(index);
                                if (data.isNonSourceData)
                                    this._loadedNonSourceRanges.insert(index)
                            }
                            this._validateCacheAt(index);
                            this._validateRanges(data.isHeader)
                        }
                        return data
                    }, _uncacheData: function _uncacheData(index, count) {
                        var result = [];
                        var data;
                        for (var i = 0; i < count; i++) {
                            index = i + index;
                            if (this._grouper)
                                index = this._grouper.remove(index, this._itemNoValidate(index), this._itemNoValidate.bind(this));
                            data = MSE.Data.List.prototype._uncacheData.call(this, index, 1)[0];
                            if (data) {
                                if (data.cached) {
                                    this._loadedRanges.remove(index);
                                    if (data.isNonSourceData)
                                        this._loadedNonSourceRanges.remove(index)
                                }
                                data.itemIndex = index
                            }
                            this._loadedRanges.shift(index + 1, false);
                            this._loadedNonSourceRanges.shift(index + 1, false);
                            result.push(data);
                            this._validateCacheAt(index);
                            this._validateRanges(data && data.isHeader)
                        }
                        return result
                    }, _validateCacheAt: function _validateCacheAt(index){}, _validateRanges: function _validateRanges(disallowGroupValidates) {
                        if (this._allowValidateRanges <= 0)
                            return;
                        var ranges;
                        var item;
                        var cached;
                        var nonSourceCached;
                        var i;
                        for (i = 0; i < this._data.length; i++) {
                            item = this._data[i];
                            cached = this._loadedRanges.count(i, i) === 1;
                            nonSourceCached = this._loadedNonSourceRanges.count(i, i) === 1;
                            MS.Entertainment.Data.assert(!item || (item.cached && cached) || (!item.cached && !cached), "Item's cached flag and cache range do not match");
                            MS.Entertainment.Data.assert(!item || (item.isNonSourceData && nonSourceCached) || (!item.isNonSourceData && !nonSourceCached), "Item's isNonSourceData and the range indices do not match. index " + i)
                        }
                        if (this._allowValidateRanges <= 1)
                            return;
                        ranges = this._loadedRanges.ranges;
                        ranges.forEach(function(item) {
                            MS.Entertainment.Data.assert(item && item.start <= item.end, "A loaded data range is not correct")
                        });
                        ranges = this._loadedNonSourceRanges.ranges;
                        ranges.forEach(function(item) {
                            MS.Entertainment.Data.assert(item && item.start <= item.end, "A loaded non-source data range is not correct")
                        });
                        if (this._allowValidateRanges <= 2)
                            return;
                        if (this._grouper && !disallowGroupValidates) {
                            ranges = this._grouper.headerRanges;
                            ranges.forEach(function(item) {
                                if (!item)
                                    return;
                                var listStartItem = this._itemNoValidate(item.start);
                                var listEndItem = this._itemNoValidate(item.end);
                                MS.Entertainment.Data.assert(listStartItem && listStartItem.isHeader, "A header range is invalid, was expecting a header item");
                                MS.Entertainment.Data.assert(listEndItem && listEndItem.isHeader, "A header range is invalid, was expecting a header item");
                                MS.Entertainment.Data.assert((item.start === item.end) || (item.start === item.end - 1 && listStartItem.isHeader && listEndItem.isHeader && listStartItem.group.key !== listEndItem.group.key), "A header range is larger than expected.")
                            }, this)
                        }
                    }, _cacheSourceItemData: function _cacheSourceItemData(index, sourceItem) {
                        var data;
                        if (!(index in this._data)) {
                            data = this.createItem(sourceItem, false);
                            data = this._updateCacheData(index, data);
                            this._updateItemKeyMap(data.itemIndex, data.itemIndex)
                        }
                        else {
                            data = this._item(index);
                            if (!data.cached) {
                                this.copyItem(sourceItem, data);
                                this._updateCacheDataRanges(index, data)
                            }
                        }
                        return data
                    }, _uncacheSourceItemData: function _uncacheSourceItemData(index) {
                        var uncachedItem;
                        var item = this._itemNoValidate(index);
                        if (item && !item.isNonSourceData) {
                            uncachedItem = new MS.Entertainment.Data.Factory.ListItemWrapper;
                            this._copyItemTo(uncachedItem, item);
                            this._updateCacheData(index, uncachedItem)
                        }
                    }, _safeChunkWork: function _safeChunkWork(worker) {
                        var chunkingWorkerPromise = this._chunkingWorkerPromise || WinJS.Promise.wrap();
                        var newChunkingWorkerPromise = this._chunkingWorkerPromise = new WinJS.Promise(function initializePromise(complete) {
                                chunkingWorkerPromise.then(function safeToWork() {
                                    var promise;
                                    if (worker)
                                        promise = worker();
                                    return WinJS.Promise.as(promise)
                                }, function ignoreChunkingWorkerPromiseError(){}).then(null, function handleError(error) {
                                    MS.Entertainment.Data.fail("Failed to execute work inside _safeChunkWork. Error message = " + error && error.message)
                                }).done(function finallyCompleteWork() {
                                    complete()
                                }.bind(this))
                            }.bind(this));
                        return this._chunkingWorkerPromise
                    }, _safeStartUncacheTimer: function _safeStartUncacheTimer() {
                        var noChunking = false;
                        if (this._randomAccessCachingEnabled)
                            WinJS.Promise.as(this._chunkingWorkerPromise).done(function testChunking() {
                                noChunking = true
                            }, function testChunkingHandleError() {
                                noChunking = true
                            });
                        if (noChunking)
                            this._startUncacheTimer()
                    }, _startUncacheTimer: function _startUncacheTimer() {
                        if (this._disposed)
                            return;
                        this._stopUncacheTimer();
                        if (this._randomAccessCachingEnabled)
                            this._uncacheTimer = WinJS.Promise.timeout(this._cacheLifespanMS).done(function _uncacheDataTimer() {
                                if (!this._uncacheTimer)
                                    return;
                                var end,
                                    i,
                                    range;
                                this._loadedRanges.ranges.forEach(function(range) {
                                    end = range.end;
                                    for (i = range.start; i <= end; i++)
                                        this._uncacheSourceItemData(i)
                                }, this);
                                this._uncacheTimer = null
                            }.bind(this), function _uncacheDataTimerFailed(error) {
                                MS.Entertainment.Data.fail("Uncache timer failed to fire. Error message = " + (error && error.message))
                            })
                    }, _stopUncacheTimer: function _stopUncacheTimer() {
                        if (this._uncacheTimer) {
                            this._uncacheTimer.cancel();
                            this._uncacheTimer = null
                        }
                    }, _resetCaches: function _resetCaches(args) {
                        if (this.randomAccessChunking) {
                            var i;
                            var item;
                            var nonSourceData = [];
                            var nonSourceIndices = this.nonSourceIndices;
                            var headerCount = this.headerCount;
                            var totalCount = !args || !args.detail || isNaN(args.detail.totalCount) ? 0 : args.detail.totalCount;
                            this.preventNotifications = true;
                            this._clearChunkerEventHandlers();
                            for (i = 0; i < nonSourceIndices.length; i++) {
                                item = nonSourceIndices[i];
                                if (headerCount >= nonSourceIndices.length - i)
                                    break;
                                if (!this.isHeader(item)) {
                                    nonSourceData.length = item + 1;
                                    nonSourceData[item] = this._data[item]
                                }
                            }
                            this._loadedRanges = new MS.Entertainment.Data.Ranges;
                            this._loadedNonSourceRanges = new MS.Entertainment.Data.Ranges;
                            this._setSource([]).done(null, function ignoreError(){});
                            if (this.grouper)
                                this._setGrouper(this.grouper).done(null, function ignoreError(){});
                            this._setCount(totalCount);
                            for (i = 0; i < nonSourceData.length; i++) {
                                item = nonSourceData[i];
                                if (item)
                                    this.insertAt(i, item, {suppressEvents: true})
                            }
                            this._forceRefreshGroupHints().then(null, function ignoreError(){}).done(function notifyListView() {
                                this.preventNotifications = false;
                                this._notifyInvalidateList();
                                this._updateChunkerEventHandlers()
                            }.bind(this))
                        }
                    }, _copyFromSourceAsync: function _copyFromSourceAsync(endIndex) {
                        if (this._copyingFromSource || this.isEmptySource())
                            return WinJS.Promise.wrap();
                        var startIndex = this._data.length;
                        this._copyingFromSource = true;
                        var promise = this._getSourceCountAsync().then(function gotCount(count) {
                                if (!isNaN(count)) {
                                    this._setEmptyCount(count);
                                    endIndex = isNaN(endIndex) ? count - 1 : Math.min(count - 1, endIndex)
                                }
                                else
                                    endIndex = isNaN(endIndex) ? startIndex : endIndex;
                                if (startIndex <= endIndex)
                                    return this._getSourceItemsAsync(startIndex, endIndex)
                            }.bind(this), function getFailed(error) {
                                if (error !== MSE.Data.List.CountResult.unknown)
                                    return new WinJS.Promise.wrapError(error)
                            }.bind(this)).then(function gotSourceItems(result) {
                                var absoluteIndex = startIndex;
                                var insertedItem;
                                if (result && result.items) {
                                    if (!isNaN(result.totalCount))
                                        this._setSequentialCount(result.totalCount);
                                    for (var i = 0; i < result.items.length; i++) {
                                        insertedItem = this._cacheSourceItemData(absoluteIndex, result.items[i]);
                                        absoluteIndex = insertedItem.itemIndex + 1
                                    }
                                }
                            }.bind(this));
                        this._copyingFromSource = false;
                        return promise
                    }, _copyFromSourceIfNeeded: function _copyFromSourceIfNeeded() {
                        var result;
                        if (!this.isEmptySource || !this.isEmptySource())
                            result = this._editingListPrivate();
                        return WinJS.Promise.as(result)
                    }, _editingListPrivate: function _editingListPrivate() {
                        this._editCount++;
                        return this._copyFromSourceAsync().then(this._editingList.bind(this)).then(null, function ignoreError(){}).then(function doneEditing() {
                                this._editCount++
                            }.bind(this))
                    }, isEmptySource: function isEmptySource() {
                        return false
                    }, _editingList: function _editingList() {
                        throw new Error("_editingList hasn't been defined");
                    }, _getSourceItemsAsync: function _getSourceItemsAsync(startIndex, endIndex) {
                        throw new Error("_getSourceItemsAync hasn't been defined");
                    }, _getSourceCountAsync: function _getSourceCountAsync() {
                        throw new Error("_getSourceCountAsync hasn't been defined");
                    }, _updateGroups: function _updateGroups() {
                        return this._editingListPrivate().then(function updateGroups() {
                                var item;
                                var absoluteIndex = 0;
                                this._startNotificationBatch();
                                while (absoluteIndex < this._data.length) {
                                    item = this._item(absoluteIndex);
                                    if (item && !item.isHeader) {
                                        item.group = null;
                                        item = this._updateCacheData(absoluteIndex, item);
                                        absoluteIndex = item.itemIndex
                                    }
                                    absoluteIndex++
                                }
                                this._endNotificationBatch()
                            }.bind(this))
                    }, _prefetchWorker: function _prefetchWorker(chunkDirections, result) {
                        var returnPromise;
                        var countCurrent = this.count;
                        var loadFunction = this._preChunkStep(chunkDirections.pop());
                        if (loadFunction)
                            returnPromise = loadFunction().then(function handleLoadSuccess() {
                                if (this._isChunkingNext())
                                    result.chunkedAfter = this.count - countCurrent;
                                else
                                    result.chunkedBefore = this.count - countCurrent;
                                this._postChunkStep();
                                return this._prefetchWorker(chunkDirections, result)
                            }.bind(this), function handleLoadFailures() {
                                this._postChunkStep();
                                return result
                            }.bind(this));
                        else {
                            this._postChunkStep();
                            returnPromise = WinJS.Promise.wrap(result)
                        }
                        return returnPromise
                    }, _prefetchData: function _prefetchData(minStartIndex, minEndIndex, maxStartIndex, maxEndIndex) {
                        var chunkDirections;
                        var returnPromise;
                        var block = false;
                        var result = {
                                chunkedAfter: 0, chunkedBefore: 0
                            };
                        if (this.chunkingEnabled) {
                            if (this.hasNextChunk)
                                if (minEndIndex + 1 >= this._data.length) {
                                    block = true;
                                    chunkDirections = [MSE.Data.chunkingType.next]
                                }
                                else if (maxEndIndex + 1 >= this._data.length)
                                    chunkDirections = [MSE.Data.chunkingType.next];
                            if (this.hasPreviousChunk)
                                if (minStartIndex < 0) {
                                    block = true;
                                    chunkDirections = chunkDirections || [];
                                    chunkDirections.push(MSE.Data.chunkingType.previous)
                                }
                                else if (maxStartIndex <= 0) {
                                    chunkDirections = chunkDirections || [];
                                    chunkDirections.push(MSE.Data.chunkingType.previous)
                                }
                        }
                        if (!chunkDirections)
                            returnPromise = WinJS.Promise.wrap(result);
                        else if (this._chunkingWorkerPromise) {
                            if (block)
                                returnPromise = this._chunkingWorkerPromise.then(function() {
                                    return this._prefetchData(minStartIndex, minEndIndex, maxStartIndex, maxEndIndex)
                                }.bind(this))
                        }
                        else {
                            this._chunkingWorkerPromise = this._prefetchWorker(chunkDirections, result);
                            this._chunkingWorkerPromise.then(function() {
                                this._chunkingWorkerPromise = null
                            }.bind(this));
                            returnPromise = WinJS.Promise.wrap(result)
                        }
                        return WinJS.Promise.as(returnPromise)
                    }, _isChunking: function _isChunking() {
                        return this._chunkingDirection === MSE.Data.chunkingType.next || this._chunkingDirection === MSE.Data.chunkingType.previous
                    }, _isChunkingNext: function _isChunkingNext() {
                        return this._chunkingDirection === MSE.Data.chunkingType.next
                    }, _isChunkingPrevious: function _isChunkingPrevious() {
                        return this._chunkingDirection === MSE.Data.chunkingType.previous
                    }, _isChunkingNothing: function _isChunkingNothing() {
                        return this._chunkingDirection === MSE.Data.chunkingType.nothing
                    }, _preChunkStep: function _preChunkStep(newChunkingDirection) {
                        var that = this;
                        this._chunkingDirection = newChunkingDirection || MSE.Data.chunkingType.nothing;
                        return (this._isChunkingNext()) ? function() {
                                return that._chunker.loadNextChunk()
                            } : (this._isChunkingPrevious()) ? function() {
                                return that._chunker.loadPreviousChunk()
                            } : (null)
                    }, _postChunkStep: function _postChunkStep() {
                        this._chunkingDirection = MSE.Data.chunkingType.nothing;
                        this._chunkingPreviousIndex = 0
                    }, _startNotificationBatch: function _startNotificationBatch() {
                        if (!this._notificationBatch)
                            this._notificationBatch = new MS.Entertainment.Data.UpdateBatch(this._createNotificationHandler());
                        this._notificationBatch.start();
                        return this._notificationBatch
                    }, _endNotificationBatch: function _endNotificationBatch() {
                        if (this._notificationBatch)
                            if (this._notificationBatch.end())
                                this._notificationBatch = null
                    }, _notifyBeginNotifications: function _notifyBeginNotifications() {
                        if (!this.preventNotifications && this._notificationHandler && this._notificationHandler.beginNotifications)
                            this._notificationHandler.beginNotifications()
                    }, _notifyEndNotifications: function _notifyEndNotifications() {
                        if (!this.preventNotifications && this._notificationHandler && this._notificationHandler.endNotifications)
                            this._notificationHandler.endNotifications()
                    }, _notifyInvalidateList: function _invalidateList() {
                        if (!this.preventNotifications && this._notificationHandler && this._notificationHandler.invalidateAll)
                            this._notificationHandler.invalidateAll()
                    }, _notifyInsertedItem: function _notifyInsertedItem(item, index) {
                        this._notifyInsertedItemWithKeys(item, this._keyFromIndex(index - 1), this._keyFromIndex(index + 1), index)
                    }, _notifyInsertedItemWithKeys: function _notifyInsertedItem(item, keyBefore, keyAfter, index) {
                        if (!this.preventNotifications) {
                            if (this._notificationHandler && this._notificationHandler.inserted)
                                this._notificationHandler.inserted(item, keyBefore, keyAfter, index);
                            this.dispatchEvent(MS.Entertainment.Data.listEvents.itemInserted, {
                                sender: this, newValue: item, index: index
                            })
                        }
                    }, _notifyRangeInserted: function _notifyRangeInserted(startIndex, count) {
                        if (count > 0 && count + startIndex <= this.count && startIndex >= 0 && startIndex < this.count && !this.preventNotifications) {
                            var batch = this._startNotificationBatch();
                            var previousKey = this._keyFromIndex(startIndex - 1);
                            var nextKey = this._keyFromIndex(startIndex + count);
                            var i;
                            if (!nextKey && !previousKey) {
                                batch.inserted(this._item(startIndex), null, null, startIndex);
                                previousKey = this._keyFromIndex(startIndex);
                                startIndex + 1
                            }
                            if (nextKey)
                                for (i = 0; i < count; i++)
                                    batch.inserted(this._item(i + startIndex), null, nextKey, startIndex);
                            else
                                for (i = count - 1; i >= 0; i--)
                                    batch.inserted(this._item(i + startIndex), previousKey, null, startIndex);
                            this._endNotificationBatch()
                        }
                    }, _notifyRangeRemoved: function _notifyRangeRemoved(itemsRemoved, index) {
                        if (itemsRemoved && itemsRemoved.length > 0 && !this.preventNotifications && this._notificationHandler && this._notificationHandler.beginNotifications && this._notificationHandler.removed && this._notificationHandler.endNotifications) {
                            this._notificationHandler.beginNotifications();
                            itemsRemoved.forEach(function(removedItem) {
                                this._notificationHandler.removed(removedItem.key, index);
                                index++
                            }, this);
                            this._notificationHandler.endNotifications()
                        }
                    }, _notifyChanged: function _notifyChanged(newValue, oldValue) {
                        if (newValue) {
                            var index = this._indexFromKey(newValue.key);
                            if (!this.preventNotifications && this._notificationHandler && this._notificationHandler.changed)
                                this._notificationHandler.changed(newValue, oldValue);
                            this.dispatchEvent(MS.Entertainment.Data.listEvents.itemChanged, {
                                sender: this, newValue: newValue, oldValue: oldValue, index: index
                            })
                        }
                    }, _notifyMoved: function _notifyMoved(item, oldIndex) {
                        if (!this.preventNotifications && this._notificationHandler && this._notificationHandler.moved) {
                            var newIndex = this._indexFromKey(item.key);
                            this._notificationHandler.moved(item, this._keyFromIndex(newIndex - 1), this._keyFromIndex(newIndex + 1), oldIndex, newIndex)
                        }
                    }, _notifyRemoved: function _notifyRemoved(key, index) {
                        if (key && !this.preventNotifications && this._notificationHandler && this._notificationHandler.removed)
                            this._notificationHandler.removed(key, index)
                    }, _createNotificationHandler: function _createNotificationHandler() {
                        return {
                                changed: this._notifyChanged.bind(this), removed: this._notifyRemoved.bind(this), inserted: this._notifyInsertedItemWithKeys.bind(this), beginNotifications: this._notifyBeginNotifications.bind(this), endNotifications: this._notifyEndNotifications.bind(this)
                            }
                    }, _nextInsertIndex: function _nextInsertIndex() {
                        return this._isChunkingPrevious() ? this._chunkingPreviousIndex++ : this._data.length
                    }, _undoInsertIndex: function _undoInsertIndex() {
                        if (this._isChunkingPrevious())
                            this._chunkingPreviousIndex--
                    }
            }), UpdateBatch: WinJS.Class.define(function updateBatch(notificationHandler) {
                if (!notificationHandler || !notificationHandler.changed || !notificationHandler.removed || !notificationHandler.inserted || !notificationHandler.endNotifications || !notificationHandler.beginNotifications)
                    throw new Error("Invalid notification handler given to the update batch class");
                this._notificationHandler = notificationHandler;
                this._batch = []
            }, {
                _notificationHandler: null, _batch: null, _startCount: 0, _createBatchItem: function _createBatchItem(callback, args) {
                        this._batch.push({
                            callback: callback, arguments: args
                        })
                    }, changed: function changed(newItem, oldItem) {
                        this._createBatchItem(this._notificationHandler.changed, arguments)
                    }, removed: function removed(key, index) {
                        this._createBatchItem(this._notificationHandler.removed, arguments)
                    }, inserted: function inserted(item, keyBefore, keyAfter, index) {
                        this._createBatchItem(this._notificationHandler.inserted, arguments)
                    }, start: function start() {
                        this._startCount++
                    }, end: function end() {
                        var executed = false;
                        this._startCount--;
                        MS.Entertainment.Data.assert(this._startCount >= 0, "UpdateBatch::end called too many times");
                        if (this._startCount === 0) {
                            this.execute();
                            executed = true
                        }
                        else if (this._startCount < 0)
                            this._startCount = 0;
                        return executed
                    }, execute: function execute() {
                        this._notificationHandler.beginNotifications();
                        this._batch.forEach(function(event) {
                            event.callback.apply(null, event.arguments)
                        });
                        this._notificationHandler.endNotifications();
                        this._batch = []
                    }
            }), DatabaseListWrapper: WinJS.Class.define(function databaseListWrapper(list) {
                this._source = list
            }, {
                _source: null, length: {get: function() {
                            return this._source.dataItemsCount || 0
                        }}, getItem: function(index) {
                        return this._source.getItem(index)
                    }
            }), VectorViewWrapper: WinJS.Class.define(function vectorViewWrapper(list) {
                this._source = list
            }, {
                _source: null, length: {get: function() {
                            return this._source.length || this._source.size || 0
                        }}, getItem: function(index) {
                        return this._source[index]
                    }
            }, {
                isVectorView: function isVectorView(object) {
                    return object && !MS.Entertainment.Data.VectorViewWrapper.isVectorViewWrapper(object) && !Array.isArray(object) && (typeof object === "object") && (typeof object.size === "number" || typeof object.length === "number")
                }, isVectorViewWrapper: function isVectorViewWrapper(object) {
                        return MS.Entertainment.Data.VectorViewWrapper.prototype.isPrototypeOf(object)
                    }, getLength: function getLength(object) {
                        return object.size
                    }
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data", {VirtualList: WinJS.Class.derive(MS.Entertainment.Data.VirtualListBase, function virtualListConstructor(itemFactory, source, chunker) {
            MS.Entertainment.Data.VirtualListBase.prototype.constructor.call(this, itemFactory, chunker);
            this.setSource(source).done(null, function(){})
        }, {
            _source: null, dispose: function dispose() {
                    MS.Entertainment.Data.VirtualListBase.prototype.dispose.call(this);
                    this._source = null
                }, isEmptySource: function isEmptySource() {
                    return this._source === MSE.Data.VirtualList.emptySource
                }, isSourceArray: function isSourceArray() {
                    return this._source ? Array.isArray(this._source) : false
                }, isSourceVector: function isSourceVector() {
                    return this._source ? typeof this._source.getItem === "function" : false
                }, isSourceList: function isSourceList() {
                    return this._source ? typeof this._source.itemsFromIndex === "function" : false
                }, setSource: function setSource(source) {
                    if (MSE.Data.VectorViewWrapper.isVectorView(source))
                        source = new MSE.Data.VectorViewWrapper(source);
                    else if (source && !Array.isArray(source) && !MSE.Data.VirtualList.is(source) && !MSE.Data.VectorViewWrapper.isVectorViewWrapper(source))
                        throw new Error("Invalid operation. Attempting to convert an unsupported source type to a virtual list");
                    source = source || MSE.Data.VirtualList.emptySource;
                    if (this._source !== source)
                        return this._setSource(source);
                    else
                        return WinJS.Promise.wrap()
                }, _clearOldSource: function _clearOldSource() {
                    this._keyMap = {};
                    this._data = [];
                    this._loadedRanges = new MS.Entertainment.Data.Ranges;
                    this._loadedNonSourceRanges = new MS.Entertainment.Data.Ranges;
                    this._source = MSE.Data.VirtualList.emptySource
                }, _setSource: function _setSource(source) {
                    var returnPromise;
                    source = source || MSE.Data.VirtualList.emptySource;
                    this._clearOldSource();
                    this._source = source;
                    this.count = -1;
                    returnPromise = this._getSourceCountAsync().then(function gotCount(value) {
                        if (this.randomAccessChunking)
                            this.count = this.chunkerCount;
                        else
                            this.count = value || 0;
                        if (!value)
                            this._source = MSE.Data.VirtualList.emptySource;
                        this._notifyInvalidateList()
                    }.bind(this));
                    return returnPromise
                }, _editingList: function _editingList() {
                    this._source = MSE.Data.VirtualList.emptySource
                }, _getSourceItemsAsync: function _getSourceItemsAsync(startIndex, lastIndex) {
                    var promise;
                    if (startIndex > lastIndex || startIndex < 0 || this.isEmptySource())
                        promise = this._getEmptySourceItems();
                    else if (this.isSourceArray())
                        promise = this._getArraySourceItems(this.source, startIndex, lastIndex);
                    else if (this.isSourceList())
                        promise = this._getVirtualListSourceItems(this.source, startIndex, lastIndex);
                    else if (this.isSourceVector())
                        promise = this._getVectorSourceItems(this.source, startIndex, lastIndex);
                    else
                        promise = WinJS.Promise.wrapError(new Error("Unknown source item type"));
                    return promise
                }, _getSourceCountAsync: function _getSourceCountAsync() {
                    var promise;
                    if (this.isEmptySource())
                        promise = WinJS.Promise.wrapError(MSE.Data.List.CountResult.unknown);
                    else if (!this._source)
                        promise = WinJS.Promise.wrap(0);
                    else if (typeof this._source.length === "number")
                        promise = WinJS.Promise.wrap(this._source.length);
                    else if (typeof this._source.getCount === "function")
                        promise = this._source.getCount();
                    else
                        promise = WinJS.Promise.wrap(0);
                    return promise
                }, _createSourceItemsResult: function _createSourceItemsResult(items, totalCount) {
                    if (isNaN(totalCount))
                        return {items: items};
                    else
                        return {
                                items: items, totalCount: totalCount
                            }
                }, _getEmptySourceItems: function _getEmptySourceItems() {
                    return this._createSourceItemsResult([])
                }, _getArraySourceItems: function _getArraySourceItems(source, startIndex, lastIndex) {
                    return WinJS.Promise.wrap(this._createSourceItemsResult(source.slice(startIndex, lastIndex + 1)))
                }, _getVectorSourceItems: function _getVectorSourceItems(source, startIndex, lastIndex) {
                    var result = [];
                    for (var i = startIndex; i <= lastIndex; i++)
                        result.push(source.getItem(i));
                    return WinJS.Promise.wrap(this._createSourceItemsResult(result))
                }, _getVirtualListSourceItems: function _getVirtualListSourceItems(source, startIndex, lastIndex) {
                    var count = Math.max(0, lastIndex - startIndex);
                    return source.itemsFromIndex(startIndex, 0, count).then(function handleResult(args) {
                            var result = [];
                            for (var i = args.offset; i < args.items.length; i++)
                                result.push(args.items[i].data);
                            return this._createSourceItemsResult(result)
                        }.bind(this))
                }
        }, {
            emptySource: [], is: function isVirtualList(object) {
                    return MSE.Data.VirtualList.prototype.isPrototypeOf(object)
                }, wrapArray: function wrapArray(array) {
                    var virtualList = new MS.Entertainment.Data.VirtualList;
                    return virtualList.setSource(array).then(function returnVirtualList() {
                            return virtualList
                        })
                }
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data", {SelectionList: WinJS.Class.derive(MSE.Data.VirtualList, function selectionListConstructor() {
            MSE.Data.VirtualList.prototype.constructor.call(this)
        }, {
            _chunkerSource: null, _selection: null, _selectedItemsPromise: null, _selectedEverything: false, _selectionCountLocked: 0, copy: function copy() {
                    var list = new MS.Entertainment.Data.SelectionList;
                    list.setSource(this._chunkerSource, this._selection, this._selectedEverything);
                    list._lockSelection();
                    return list
                }, chunkSize: {get: function() {
                        return 100
                    }}, originalSelectionIndices: {get: function get_originalSelectionIndices() {
                        var result;
                        if (this._selection && this._selection.getIndices)
                            result = this._selection.getIndices();
                        return result || []
                    }}, originalSelectionSourceIndices: {get: function get_originalSelectionSourceIndices() {
                        var result = this.originalSelectionIndices;
                        if (this._chunkerSource && this._chunkerSource.indexToSourceIndex)
                            result = result.map(function(index) {
                                return this._chunkerSource.indexToSourceIndex(index)
                            }, this);
                        return result
                    }}, _selectionCount: {get: function() {
                        if (this._selectedEverything)
                            return this._chunkerSource ? this._chunkerSource.count - this._chunkerSource.nonSourceCount : 0;
                        else
                            return this._selection ? this._selection.count() : this._selectionCountLocked
                    }}, _createChunker: function() {
                    return {
                            totalCount: this._selectionCount, loadChunk: this._loadChunkFromSource.bind(this)
                        }
                }, setSource: function setSource(source, selection, selectedEverything) {
                    if (selection && !selection.count && !selection.getItems && !selection.getIndices)
                        throw new Error("Invalid selection type was passed to SelectionList");
                    var initialCount = selection ? selection.count() : 0;
                    if (initialCount > 1 && source && !source.forEachAll)
                        throw new Error("Invalid source type was passed to SelectionList.  At the moment multi-selection only supports a VirtualList source");
                    this._clearOldSource();
                    this._selection = selection;
                    this._selectedEverything = selectedEverything;
                    this._chunkerSource = source;
                    this.chunker = this._createChunker();
                    return MSE.Data.VirtualList.prototype.setSource.call(this, null)
                }, _lockSelection: function _lockSelection() {
                    if (!this._selectedEverything && !this._selectedItemsPromise) {
                        this._selectedItemsPromise = this._selection ? this._selection.getItems() : WinJS.Promise.wrap([]);
                        this._selectionCountLocked = this._selection ? this._selection.count() : 0;
                        this._selection = null
                    }
                }, _getSelectedItems: function _getSelectedItems() {
                    if (this._selection)
                        return this._selection.getItems();
                    else if (this._selectedItemsPromise)
                        return this._selectedItemsPromise;
                    else
                        return WinJS.Promise.wrap([])
                }, _getEmptyChunk: function _getEmptyChunk() {
                    return this._createChunkResult(null, null, null, true)
                }, _createChunkResult: function _createChunkResult(items, offset, count, error) {
                    return WinJS.Promise.wrap({
                            items: items || [], offset: offset || 0, error: !!error, totalCount: count || this._selectionCount
                        })
                }, _loadChunkFromSource: function _loadChunkFromSource(index, countBefore, countAfter) {
                    countAfter = countAfter || 0;
                    countBefore = countBefore || 0;
                    var selectionCount = this._selectionCount;
                    if (index - countBefore < 0 || countBefore < 0 || countAfter < 0 || selectionCount === 0)
                        return this._getEmptyChunk();
                    else if (this._selectedEverything && selectionCount > 1)
                        return this._getChunkAllSelected(index, countBefore, countAfter);
                    else
                        return this._getChunkSomeSelected(index, countBefore, countAfter)
                }, _getChunkAllSelected: function _getChunkAllSelected(index, countBefore, countAfter) {
                    var items = [];
                    var offset = countBefore;
                    var startIndex = this._chunkerSource.indexFromSourceIndex(index - countBefore);
                    var totalNeeded = countBefore + 1 + countAfter;
                    return this._chunkerSource.forEachAll(function iteration(args) {
                            if (!args.item.isNonSourceData)
                                items.push(args.item.data);
                            if (items.length >= totalNeeded)
                                args.stop = true
                        }.bind(this), startIndex).then(function gotItems() {
                            return this._createChunkResult(items, offset)
                        }.bind(this))
                }, _getChunkSomeSelected: function _getChunkSomeSelected(index, countBefore, countAfter) {
                    var selectionCount = this._selectionCount;
                    var startIndex = index - countBefore;
                    var endIndex = index + countAfter;
                    return this._getSelectedItems().then(function(selectionItems) {
                            var items = [];
                            selectionItems = selectionItems || [];
                            for (var i = startIndex; i <= endIndex && i < selectionItems.length; i++)
                                items.push(selectionItems[i] ? selectionItems[i].data : null);
                            return this._createChunkResult(items, countBefore, selectionCount)
                        }.bind(this))
                }
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data", {TrimmedList: WinJS.Class.derive(MSE.Data.VirtualList, function virtualListConstructor(itemFactory, source, chunker) {
            MSE.Data.VirtualList.prototype.constructor.call(this, itemFactory, source, chunker)
        }, {
            _maxCount: -1, maxCount: {
                    get: function() {
                        return this._maxCount
                    }, set: function(value) {
                            if (this._maxCount !== value)
                                this._maxCount = value;
                            if (this._maxCount >= 0)
                                this.count = Math.min(this._maxCount, this.count)
                        }
                }, count: {
                    get: function() {
                        return this.getProperty("count")
                    }, set: function(value) {
                            if (this.maxCount >= 0)
                                value = Math.min(this._maxCount, value);
                            this.setProperty("count", value)
                        }
                }
        })})
})(WinJS.Namespace.define("MS.Entertainment", null))
