/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/factory.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Data");
(function(MSE, undefined) {
    "use strict";
    WinJS.Namespace.defineWithParent(MSE, "Data", {
        listGrouperEvents: {batchChange: "batchChange"}, emptyGrouper: {
                isEmpty: true, execute: function execute() {
                        return null
                    }
            }, emptyGroupKey: "noGroupHeader", ListGrouper: WinJS.Class.derive(MS.Entertainment.Utilities.EventInvoker, function listGrouper(grouper) {
                if (grouper && !grouper.execute)
                    throw new Error("Invalid galleryGrouper passed to ListGrouper");
                this._grouper = grouper;
                this._headerRanges = new MS.Entertainment.Data.Ranges;
                this._headerRanges.singleItems = true;
                this._groups = {}
            }, {
                _grouper: null, _groups: null, _groupHints: null, _groupHintRanges: null, _headerRanges: null, _validateGroups: false, _pendingChanges: null, _stopInsertingGroupHintHeaders: false, groupHints: {
                        get: function() {
                            return this._groupHints
                        }, set: function(value) {
                                this.setGroupHints(value)
                            }
                    }, grouper: {get: function() {
                            return this._grouper
                        }}, headerRanges: {get: function() {
                            if (this._headerRanges)
                                return this._headerRanges.ranges;
                            else
                                return []
                        }}, headerIndices: {get: function() {
                            var result = [];
                            if (this._headerRanges)
                                this._headerRanges.ranges.forEach(function(item) {
                                    result.push(item.start)
                                });
                            return result
                        }}, clear: function clear() {
                        var ranges;
                        if (this._headerRanges)
                            ranges = this._headerRanges.ranges;
                        if (ranges)
                            ranges.forEach(function(range) {
                                this._removeHeader(range.start)
                            }, this);
                        this._dispatchChanges();
                        this._groups = null;
                        this._groupHintRanges = null
                    }, setGroupHints: function setGroupHints(value) {
                        var result;
                        if (this._groupHints !== value)
                            result = this._onGroupHintsChanged(value, this._groupHints).then(function setGroupHints(promiseResult) {
                                this._groupHints = value;
                                return promiseResult
                            }.bind(this));
                        return WinJS.Promise.as(result)
                    }, groupIndexFromSourceIndex: function groupIndexFromSourceIndex(sourceIndex) {
                        var result = -1;
                        if (this._groupHintRanges)
                            result = this._groupHintRanges.findLessThanOrEqual(sourceIndex);
                        return result
                    }, countHeaders: function countHeaders(startIndex, endIndex) {
                        return this._headerRanges.count(startIndex, endIndex)
                    }, exclusionCountHeaders: function countHeaders(startIndex, endIndex) {
                        return this._headerRanges.exclusionCount(startIndex, endIndex)
                    }, calculate: function calculate(item) {
                        return (item && item.group) || (this._grouper ? this._grouper.execute(item) : null)
                    }, copy: function copy(item, oldItem) {
                        if (item && oldItem) {
                            item.group = oldItem.group;
                            item.isHeader = oldItem.isHeader
                        }
                    }, update: function update(index, item, existingItems) {
                        return this._insert(index, item, existingItems, true)
                    }, insert: function insert(index, item, existingItems) {
                        return this._insert(index, item, existingItems, false)
                    }, _insert: function _insert(index, item, existingItems, updating) {
                        if (!item || item.isHeader || (updating && item.group))
                            return index;
                        var group = this.calculate(item);
                        if (!group || !group.key)
                            return index;
                        var itemBefore = existingItems(index - 1);
                        var itemAfter = existingItems(updating ? index + 1 : index);
                        var groupHeaderIndex = -1;
                        if (this._isNotMatchingHeader(itemBefore, group)) {
                            if (updating)
                                this._removeHeader(index - 1, itemBefore.group);
                            else
                                itemAfter = itemBefore;
                            index--;
                            itemBefore = existingItems(index - 1)
                        }
                        if (this._canInsertHeaderUsingGroup(item, group))
                            index = this._moveOrInsertHeaderIfNeeded(index, group, itemBefore, itemAfter).index;
                        this._updateHeaderIfNeeded(group);
                        item.group = group;
                        if (!updating)
                            this._headerRanges.shift(index, true);
                        if (itemAfter) {
                            if (this._canInsertHeaderUsingGroup(itemAfter, itemAfter.group)) {
                                var moveResult = this._moveOrInsertHeaderIfNeeded(index + 1, itemAfter.group, item, null);
                                if (moveResult.oldHeaderIndex >= 0 && moveResult.oldHeaderIndex < index && moveResult.oldHeaderIndex !== moveResult.newHeaderIndex)
                                    index--
                            }
                            this._updateHeaderIfNeeded(itemAfter.group)
                        }
                        this._dispatchChanges();
                        return index
                    }, _isStartOrEnd: function _atStartOrEnd(item) {
                        return item === undefined
                    }, _isHeader: function _isHeader(item) {
                        return !!(item && item.isHeader)
                    }, _isUnknown: function _isUnknown(item) {
                        return item === null
                    }, _isMatch: function _isMatch(item, group) {
                        return !!(item && group && item.group && item.group.key === group.key)
                    }, _isNotMatch: function _isNotMatch(item, group) {
                        return !!((this._isStartOrEnd(item)) || (item && group && item.group && item.group.key !== group.key))
                    }, _isNotMatchingHeader: function isNotMatchingHeader(item, group) {
                        return !!(item && item.isHeader && this._isNotMatch(item, group))
                    }, _canInsertHeaderUsingGroup: function _canInsertHeaderUsingGroup(item, group) {
                        return !!(item && group && !item.isAction && !item.isHeader && !item.noHeader)
                    }, _canInsertHeader: function _canInsertHeader(item) {
                        return !!(item && this._canInsertHeaderUsingGroup(item, item.group))
                    }, remove: function remove(index, item, existingItems) {
                        item = item || {};
                        if (!item.isHeader) {
                            var itemBefore = existingItems(index - 1);
                            var itemAfter = existingItems(index + 1);
                            if ((this._isStartOrEnd(itemBefore) || this._isHeader(itemBefore)) && (this._isStartOrEnd(itemAfter) || this._isHeader(itemAfter))) {
                                index--;
                                MS.Entertainment.Data.assert(!itemBefore || itemBefore.group, "Expecting the item before to have a group. index: " + index);
                                MS.Entertainment.Data.assert(!itemBefore || !itemBefore.group || !item || !item.group || item.group.key === itemBefore.group.key, "Both the item and the item's header have a group key, but they don't match. Expecting them to match." + " index: " + index + " item.group.key: " + (item && item.group && item.group.key) + " itemBefore.group.key" + (itemBefore && itemBefore.group && itemBefore.group.key));
                                this._removeHeader(index, itemBefore && itemBefore.group)
                            }
                            this._headerRanges.shift(index + 1, false);
                            item.group = null;
                            this._dispatchChanges()
                        }
                        return index
                    }, _moveOrInsertHeaderIfNeeded: function _moveOrInsertHeaderIfNeeded(index, group, itemBefore, itemAfter) {
                        var result = {
                                index: index, oldHeaderIndex: -1, newHeaderIndex: -1
                            };
                        var atBoundary = this._isNotMatch(itemBefore, group);
                        if (this._groups[group.key])
                            result.oldHeaderIndex = result.newHeaderIndex = this._groups[group.key].start;
                        if (atBoundary)
                            if (result.oldHeaderIndex === index)
                                index++;
                            else if (result.oldHeaderIndex >= 0 && result.oldHeaderIndex !== index - 1) {
                                this._removeHeader(result.oldHeaderIndex, group);
                                if (result.oldHeaderIndex < index)
                                    index--;
                                result.newHeaderIndex = index;
                                this._insertHeader(index, group);
                                index++
                            }
                            else if (this._insertHeaderIfNeeded(index, group, itemBefore, itemAfter)) {
                                result.newHeaderIndex = index;
                                index++
                            }
                        result.index = index;
                        return result
                    }, _insertHeaderIfNeeded: function _insertHeaderIfNeeded(index, group, itemBefore, itemAfter) {
                        var inserted = false;
                        if (group) {
                            var lastKnownIndex = -1;
                            if (this._groups[group.key])
                                lastKnownIndex = this._groups[group.key].start;
                            if (lastKnownIndex < 0) {
                                this._insertHeader(index, group);
                                lastKnownIndex = index;
                                inserted = true
                            }
                        }
                        return inserted
                    }, _updateHeaderIfNeeded: function _updateHeaderIfNeeded(newGroup) {
                        this._pendingChanges = this._pendingChanges || [];
                        if (newGroup && !newGroup.fromGroupHint) {
                            var groupRange = this._groups[newGroup.key];
                            var groupIndex = -1;
                            if (groupRange && groupRange.data && groupRange.data.fromGroupHint) {
                                groupIndex = groupRange.start;
                                groupRange.data = null
                            }
                            if (groupIndex >= 0)
                                this._pendingChanges.push({
                                    change: "Update", absoluteIndex: groupIndex, value: new MS.Entertainment.Data.Factory.ListHeaderWrapper(newGroup)
                                })
                        }
                    }, _insertHeader: function _insertHeader(index, group) {
                        this._pendingChanges = this._pendingChanges || [];
                        MS.Entertainment.Data.assert(group, "The group header being inserted is null");
                        MS.Entertainment.Data.assert(!this._groups[group.key], "Inserting a header that already exists, this should not happen");
                        this._headerRanges.shift(index, true);
                        this._groups[group.key] = this._headerRanges.insert(index);
                        this._groups[group.key].data = group;
                        this._pendingChanges.push({
                            change: "Add", absoluteIndex: index, value: new MS.Entertainment.Data.Factory.ListHeaderWrapper(group)
                        })
                    }, _removeHeader: function _removeHeader(index, group) {
                        this._pendingChanges = this._pendingChanges || [];
                        if (group && group.key)
                            delete this._groups[group.key];
                        this._pendingChanges.push({
                            change: "Remove", absoluteIndex: index
                        });
                        this._headerRanges.remove(index);
                        this._headerRanges.shift(index + 1, false)
                    }, _dispatchChanges: function _dispatchChanges() {
                        var pendingChanges = this._pendingChanges;
                        this._pendingChanges = null;
                        if (pendingChanges && pendingChanges.length)
                            this.dispatchEvent(MS.Entertainment.Data.listGrouperEvents.batchChange, {
                                sender: this, changes: pendingChanges
                            })
                    }, _onGroupHintsChanged: function _onGroupHintsChanged(newValue, oldValue) {
                        var firstGroupHints = !!newValue && !oldValue;
                        var ranges = [];
                        var headersInserted = 0;
                        if (!firstGroupHints)
                            this._stopInsertingGroupHintHeaders = true;
                        if (!newValue)
                            return WinJS.Promise.wrap();
                        var returnPromise = newValue.forEachAll(function addItem(args) {
                                var item = args.item;
                                ranges.push({
                                    start: item.data.firstItemIndexSourceHint, end: item.data.firstItemIndexSourceHint
                                })
                            }.bind(this)).then(function setGroupHintRanges() {
                                this._groupHintRanges = new MS.Entertainment.Data.Ranges(ranges);
                                this._groupHintRanges.singleItems = true
                            }.bind(this), function handelError() {
                                this._groupHintRanges = new MS.Entertainment.Data.Ranges;
                                this._groupHintRanges.singleItems = true
                            }.bind(this));
                        if (!this._stopInsertingGroupHintHeaders)
                            newValue.forEachAll(function addItem(args) {
                                if (this._stopInsertingGroupHintHeaders) {
                                    args.stop = true;
                                    return
                                }
                                var item = args.item;
                                if (!this._stopInsertingGroupHintHeaders)
                                    headersInserted += this._insertGroupFromGroupHint(item, headersInserted);
                                if (headersInserted >= 100) {
                                    this._dispatchChanges();
                                    headersInserted = 0;
                                    return WinJS.Promise.timeout()
                                }
                            }.bind(this)).then(null, function ingoreError(){}).done(function dispatchChanges() {
                                this._dispatchChanges()
                            }.bind(this));
                        return returnPromise
                    }, _insertGroupFromGroupHint: function _insertGroupFromGroupHint(groupHint, offset) {
                        var group;
                        if (!groupHint || !groupHint.data)
                            return;
                        var headersInserted = 0;
                        var subGroupHint;
                        var subGroupHintsLength = groupHint.data.subGroupHints ? groupHint.data.subGroupHints.length : 0;
                        if (subGroupHintsLength && groupHint.firstItemIndexHint > 0)
                            for (var i = 0; i < subGroupHintsLength; i++) {
                                subGroupHint = groupHint.data.subGroupHints[i];
                                headersInserted += this._insertGroupFromGroupHint({
                                    data: subGroupHint, firstItemIndexHint: subGroupHint.firstItemIndexHint
                                }, offset + headersInserted)
                            }
                        else if (!subGroupHintsLength && groupHint.firstItemIndexHint >= 0)
                            group = this.calculate(groupHint);
                        if (group) {
                            group.fromGroupHint = true;
                            if (this._insertHeaderIfNeeded(groupHint.firstItemIndexHint + offset, group, null, null))
                                headersInserted++
                        }
                        return headersInserted
                    }
            }, {clearGroup: function clearGroup(item) {
                    if (item) {
                        item.group = null;
                        item.isHeader = false
                    }
                }})
    })
})(WinJS.Namespace.define("MS.Entertainment", null))
