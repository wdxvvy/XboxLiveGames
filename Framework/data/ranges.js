/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/factory.js", "/Framework/debug.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Data");
(function(MSE, undefined) {
    "use strict";
    WinJS.Namespace.defineWithParent(MSE, "Data", {Ranges: WinJS.Class.define(function ranges(initialRanges) {
            this._ranges = [];
            if (Array.isArray(initialRanges))
                initialRanges.forEach(function addRange(range) {
                    this._ranges.push(this._createRange(range.start, range.end))
                }, this);
            else if (initialRanges)
                this._ranges.push(this._createRange(initialRanges.start, initialRanges.end))
        }, {
            singleItems: false, _ranges: null, _createRange: function _createRange(index, endIndex) {
                    return {
                            start: index, end: isNaN(endIndex) ? index : endIndex
                        }
                }, ranges: {get: function() {
                        return this._ranges.map(function(item) {
                                return this._createRange(item.start, item.end)
                            }, this)
                    }}, printRanges: function printRanges() {
                    Debug.console.log(0, "[START PRINT RANGES]");
                    this._ranges.forEach(function(item) {
                        Debug.console.log(0, "[RANGE] [start = " + item.start + "] [end = " + item.end + "]")
                    }, this);
                    Debug.console.log(0, "[END PRINT RANGES]")
                }, shift: function shift(startIndex, forward) {
                    var i;
                    var increase = (forward) ? 1 : -1;
                    var foundRangeIndex = -1;
                    var foundRange;
                    for (i = 0; i < this._ranges.length; i++)
                        if ((this._ranges[i].start > startIndex) || (this._ranges[i].end >= startIndex)) {
                            foundRangeIndex = i;
                            break
                        }
                    if (foundRangeIndex >= 0) {
                        foundRange = this._ranges[foundRangeIndex];
                        if (foundRange.start < startIndex && foundRange.end >= startIndex) {
                            if (increase > 0) {
                                this._ranges.splice(foundRangeIndex, 0, this._createRange(foundRange.start, startIndex - 1));
                                foundRange.start = startIndex
                            }
                            else
                                foundRange.end += increase;
                            if (foundRange.end < foundRange.start)
                                this._ranges.splice(foundRangeIndex, 1);
                            else
                                foundRangeIndex++
                        }
                        for (i = foundRangeIndex; i < this._ranges.length; i++) {
                            this._ranges[i].start += increase;
                            this._ranges[i].end += increase
                        }
                        if (!this.singleItems) {
                            var right = this._ranges[foundRangeIndex + 1];
                            if (right && right.start <= foundRange.end + 1) {
                                foundRange.end = right.end;
                                this._ranges.splice(foundRangeIndex + 1, 1)
                            }
                            var left = this._ranges[foundRangeIndex - 1];
                            if (left && left.end >= foundRange.start - 1) {
                                foundRange.start = left.start;
                                this._ranges.splice(foundRangeIndex - 1, 1)
                            }
                        }
                    }
                }, get: function get(index) {
                    return this._ranges ? this._ranges[index] : null
                }, findLessThanOrEqual: function findLessThanOrEqual(index) {
                    var i;
                    var foundRangeIndex = -1;
                    for (i = 0; i < this._ranges.length; i++) {
                        if (this._ranges[i].end > index)
                            break;
                        foundRangeIndex = i
                    }
                    return foundRangeIndex
                }, findIndex: function findIndex(index) {
                    var i;
                    var foundRangeIndex = -1;
                    for (i = 0; i < this._ranges.length; i++)
                        if (this._ranges[i].start <= index && this._ranges[i].end >= index) {
                            foundRangeIndex = i;
                            break
                        }
                    return foundRangeIndex
                }, find: function find(index) {
                    var foundRange = null;
                    var foundRangeIndex = this.findIndex(index);
                    if (foundRangeIndex >= 0)
                        foundRange = this._ranges[foundRangeIndex];
                    return foundRange
                }, insert: function insert(index) {
                    var i;
                    var foundRangeIndex = -1;
                    var foundRange;
                    for (i = 0; i < this._ranges.length; i++)
                        if (this._ranges[i].end + 1 >= index && this._ranges[i].start - 1 <= index && !this.singleItems) {
                            foundRangeIndex = i;
                            break
                        }
                        else if (this._ranges[i].start > index) {
                            foundRangeIndex = i;
                            this._ranges.splice(foundRangeIndex, 0, this._createRange(index));
                            break
                        }
                    if (foundRangeIndex < 0)
                        foundRangeIndex = this._ranges.length;
                    foundRange = this._ranges[foundRangeIndex];
                    if (!foundRange) {
                        foundRange = this._createRange(index);
                        this._ranges.splice(foundRangeIndex, 0, foundRange)
                    }
                    else if (foundRange.end + 1 === index)
                        foundRange.end = index;
                    else if (foundRange.start - 1 === index)
                        foundRange.start = index;
                    if (!this.singleItems) {
                        var right = this._ranges[foundRangeIndex + 1];
                        if (right && right.start - 1 <= foundRange.end) {
                            foundRange.end = right.end;
                            this._ranges.splice(foundRangeIndex + 1, 1)
                        }
                        var left = this._ranges[foundRangeIndex - 1];
                        if (left && left.end + 1 >= foundRange.start) {
                            foundRange.start = left.start;
                            this._ranges.splice(foundRangeIndex - 1, 1)
                        }
                    }
                    return foundRange
                }, remove: function remove(index) {
                    var i;
                    var foundRangeIndex = -1;
                    var foundRange;
                    var split = false;
                    for (i = 0; i < this._ranges.length; i++)
                        if (this._ranges[i].end >= index && this._ranges[i].start <= index) {
                            foundRangeIndex = i;
                            break
                        }
                    foundRange = this._ranges[foundRangeIndex];
                    if (foundRange && foundRange.start <= index) {
                        split = true;
                        if (foundRange.start === index) {
                            split = false;
                            foundRange.start = index + 1
                        }
                        if (foundRange.end === index) {
                            split = false;
                            foundRange.end = index - 1
                        }
                        if (foundRange.start > foundRange.end) {
                            split = false;
                            foundRange = null;
                            this._ranges.splice(foundRangeIndex, 1)
                        }
                    }
                    if (split) {
                        this._ranges.splice(foundRangeIndex + 1, 0, this._createRange(index + 1, foundRange.end));
                        foundRange.end = Math.max(0, index - 1)
                    }
                    if (foundRange && !this.singleItems) {
                        var right = this._ranges[foundRangeIndex + 1];
                        if (right && right.start - 1 <= foundRange.end) {
                            foundRange.end = right.end;
                            this._ranges.splice(foundRangeIndex + 1, 1)
                        }
                        var left = this._ranges[foundRangeIndex - 1];
                        if (left && left.end + 1 >= foundRange.start) {
                            foundRange.start = left.start;
                            this._ranges.splice(foundRangeIndex - 1, 1)
                        }
                    }
                }, exclusionCount: function exclusionCount(startIndex, endIndex, consecutive) {
                    return this._count(startIndex, endIndex, consecutive, true)
                }, count: function count(startIndex, endIndex, consecutive) {
                    return this._count(startIndex, endIndex, consecutive, false)
                }, _count: function _count(startIndex, endIndex, consecutive, exclusion) {
                    var i,
                        range,
                        start,
                        end,
                        delta;
                    var count = 0;
                    if (startIndex > endIndex && !isNaN(endIndex))
                        return count;
                    for (i = 0; i < this._ranges.length; i++) {
                        range = this._ranges[i];
                        start = range.start;
                        end = range.end;
                        if (exclusion && start === startIndex) {
                            delta = end - start + 1;
                            startIndex += delta;
                            endIndex += delta;
                            count += delta
                        }
                        if (end < startIndex)
                            continue;
                        else if (start > endIndex)
                            break;
                        if (start < startIndex)
                            start = startIndex;
                        if (end > endIndex)
                            end = endIndex;
                        delta = end - start + 1;
                        if (exclusion && startIndex !== endIndex)
                            endIndex += delta;
                        count += delta;
                        if (consecutive) {
                            if (start > startIndex)
                                count = 0;
                            break
                        }
                    }
                    return count
                }, countFromEnd: function countFromEnd(startIndex, endIndex, inclusive) {
                    var i,
                        range,
                        start,
                        end;
                    var count = 0;
                    if (startIndex > endIndex)
                        return count;
                    for (i = this._ranges.length - 1; i >= 0; i--) {
                        range = this._ranges[i];
                        start = range.start;
                        end = range.end;
                        if (end < startIndex || start > endIndex)
                            continue;
                        if (start < startIndex)
                            start = startIndex;
                        if (end > endIndex)
                            end = endIndex;
                        count += end - start + 1;
                        if (inclusive) {
                            if (end < endIndex)
                                count = 0;
                            break
                        }
                    }
                    return count
                }
        })})
})(WinJS.Namespace.define("MS.Entertainment", null))
