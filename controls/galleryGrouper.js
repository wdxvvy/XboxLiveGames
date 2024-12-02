/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/stringids.js", "/Framework/utilities.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GalleryGrouper: WinJS.Class.define(function galleryGrouperConstructor(){}, {
            getKeySource: function getKeySource(item) {
                var key;
                if (item.data && item.data.groupKey)
                    key = item.data.groupKey;
                else if (item.data && item.data.inlinePanel)
                    key = MS.Entertainment.Utilities.valueFromPropertyPathFragments(item.data.dataItem.data, this.keyPropertyFragments);
                else if (item.data && item.data.isAction)
                    if (typeof item.data.groupHeader === "number")
                        key = String.load(item.data.groupHeader);
                    else if (typeof item.data.groupHeader === "string")
                        key = item.data.groupHeader;
                    else
                        MS.Entertainment.UI.Controls.fail("an action in a grouped view must specify a groupHeader");
                else if (item.data)
                    key = MS.Entertainment.Utilities.valueFromPropertyPathFragments(item.data, this.keyPropertyFragments);
                else
                    key = String.empty;
                return key
            }, createKey: function createKey(item) {
                    var key = this.getKeySource(item);
                    if (key)
                        key += String.empty;
                    key = MS.Entertainment.Utilities.trimCharacterDirection(key);
                    return key
                }, createParentKey: function createParentKey(item) {
                    return null
                }, createData: function createData(item) {
                    return item.data
                }, _keyPropertyName: null, _keyPropertyFragments: null, useKeyAsData: true, keyPropertyName: {
                    get: function() {
                        return this._keyPropertyName
                    }, set: function(value) {
                            if (value !== this._keyPropertyName) {
                                this._keyPropertyFragments = null;
                                this._keyPropertyName = value
                            }
                        }
                }, keyPropertyFragments: {get: function() {
                        this._keyPropertyFragments = this._keyPropertyFragments || MS.Entertainment.Utilities.getPropertyPathFragments(this._keyPropertyName);
                        return this._keyPropertyFragments
                    }}, execute: function execute(item) {
                    var key = this.createKey(item);
                    var parentKey = this.createParentKey(item);
                    var data = (this.useKeyAsData) ? {title: key} : this.createData(item);
                    return {
                            key: key + String.empty, parentKey: (parentKey || key) + String.empty, data: data
                        }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        GalleryAlphaWordGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryGrouper, function galleryAlphaWordGrouperConstructor(){}, {
            isSubGroup: false, _parentGrouper: null, createKey: function createKey(item) {
                    var key = MS.Entertainment.UI.Controls.GalleryGrouper.prototype.createKey.call(this, item) + "";
                    if (!key || key === "null")
                        key = String.load(String.id.IDS_UNKNOWN_VALUE);
                    return key
                }, createParentKey: function createParentKey(item) {
                    var key = null;
                    if (this.isSubGroup) {
                        if (!this._parentGrouper) {
                            this._parentGrouper = new MS.Entertainment.UI.Controls.GalleryAlphaCharGrouper;
                            this._parentGrouper.keyPropertyName = this.keyPropertyName
                        }
                        key = this._parentGrouper.createKey(item)
                    }
                    return key
                }
        }), GalleryAlphaCharGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryGrouper, function galleryAlphaCharGrouperConstructor() {
                try {
                    this._characterGroupings = new Windows.Globalization.Collation.CharacterGroupings
                }
                catch(error) {}
            }, {
                _characterGroupings: null, createKey: function createKey(item) {
                        var index = 0;
                        var key = String.empty;
                        var originalKey = MS.Entertainment.UI.Controls.GalleryGrouper.prototype.createKey.call(this, item) + "";
                        if (item.isAction)
                            return originalKey;
                        if (this._characterGroupings)
                            key = this._characterGroupings.lookup(originalKey || String.empty);
                        if (key === "Numbers")
                            key = String.load(String.id.IDS_NUMBER_SYMBOL);
                        else if (key === "Symbols")
                            key = String.load(String.id.IDS_WILD_CARD_SYMBOL);
                        return key
                    }
            }), GalleryNumericGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryGrouper, function galleryNumericGrouperConstructor(){}, {}), GalleryYearGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryGrouper, function galleryYearGrouperConstructor(){}, {createKey: function createKey(item) {
                    var key = this.getKeySource(item);
                    if (!key || key === "null")
                        return String.load(String.id.IDS_UNKNOWN_VALUE);
                    if (item.isAction)
                        return key;
                    var date = MS.Entertainment.Data.Factory.localizedYear(key);
                    return date || key
                }}), GalleryMonthGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryGrouper, function galleryMonthGrouperConstructor(){}, {createKey: function createKey(item) {
                    var key = MS.Entertainment.UI.Controls.GalleryGrouper.prototype.createKey.call(this, item);
                    if (!key || key === "null")
                        return String.load(String.id.IDS_UNKNOWN_VALUE);
                    if (item.isAction)
                        return key;
                    var date = new Date(key);
                    var formattedMonth = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).abbreviatedMonthYear;
                    if (!MS.Entertainment.UI.Controls.GalleryMonthGrouper.minCalendar) {
                        MS.Entertainment.UI.Controls.GalleryMonthGrouper.minCalendar = new Windows.Globalization.Calendar(formattedMonth.languages);
                        MS.Entertainment.UI.Controls.GalleryMonthGrouper.minCalendar.setToMin()
                    }
                    if (!MS.Entertainment.UI.Controls.GalleryMonthGrouper.enCalendar)
                        MS.Entertainment.UI.Controls.GalleryMonthGrouper.enCalendar = new Windows.Globalization.Calendar(["en-US"]);
                    MS.Entertainment.UI.Controls.GalleryMonthGrouper.enCalendar.setDateTime(date);
                    if (MS.Entertainment.UI.Controls.GalleryMonthGrouper.enCalendar.compare(MS.Entertainment.UI.Controls.GalleryMonthGrouper.minCalendar) < 0)
                        date = MS.Entertainment.UI.Controls.GalleryMonthGrouper.minCalendar.getDateTime();
                    var month = formattedMonth.format(date);
                    return month
                }}, {enCalendar: null}), GalleryDayGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryGrouper, function galleryDayGrouperConstructor(){}, {createKey: function createKey(item) {
                    var key = MS.Entertainment.UI.Controls.GalleryGrouper.prototype.createKey.call(this, item);
                    if (!key)
                        return String.load(String.id.IDS_UNKNOWN_VALUE);
                    if (item.isAction)
                        return key;
                    var date = new Date(key).toDateString();
                    return date
                }}), GalleryRecentGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryGrouper, function galleryRecentGrouperConstructor(){}, {createKey: function createKey(item) {
                    var key = MS.Entertainment.UI.Controls.GalleryGrouper.prototype.createKey.call(this, item);
                    if (!key)
                        return String.load(String.id.IDS_UNKNOWN_VALUE);
                    if (item.isAction)
                        return key;
                    var date = new Date(key);
                    var today = new Date;
                    var diff = Date.subtract(today, date);
                    var group;
                    if (diff.days <= 7)
                        group = String.load(String.id.IDS_RECENT_THIS_WEEK);
                    else if (diff.days <= 14)
                        group = String.load(String.id.IDS_RECENT_LAST_WEEK);
                    else if (date.getYear() === today.getYear() && date.getMonth() === today.getMonth())
                        group = String.load(String.id.IDS_RECENT_THIS_MONTH);
                    else {
                        var superShortMonthPattern = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).abbreviatedMonth;
                        var shortMonth = superShortMonthPattern.format(date);
                        group = shortMonth + " " + date.getFullYear()
                    }
                    return group
                }}), SearchResultsGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryGrouper, function searchResultsGrouperConstructor(){}, {createKey: function createKey(item) {
                    if (item.data && item.data.isHCR)
                        return "-1";
                    else
                        return MS.Entertainment.UI.Controls.GalleryGrouper.prototype.createKey.call(this, item)
                }})
    });
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GalleryAlphaWordSubGrouper: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryAlphaWordGrouper, function GalleryAlphaWordSubGrouper(){}, {isSubGroup: true})})
}())
