/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Pages");
WinJS.Namespace.define("MS.Entertainment.Pages", {ContentNotificationList: MS.Entertainment.UI.Framework.defineUserControl("Components/Shell/ContentNotificationList.html#contentNotificationListTemplate", null, null, {source: null})});
WinJS.Namespace.define("MS.Entertainment.Pages", {ContentNotificationTileItem: MS.Entertainment.UI.Framework.defineUserControl(null, function contentNotificationTileItemConstructor(element, options){}, {
        _bindings: null, _contentNotifications: null, _alternateText: String.empty, _alternateIcon: String.empty, _useAlternateTextStyle: null, defaultTextStyle: String.empty, alternateTextStyle: String.empty, controlName: "contentNotificationTileItem", initialize: function initialize() {
                this._findNotificationForDisplay = this._findNotificationForDisplay.bind(this);
                this._displayedShortNotificationUpdated = this._displayedShortNotificationUpdated.bind(this);
                this._displayedLongNotificationUpdated = this._displayedLongNotificationUpdated.bind(this);
                this._displayedIconNotificationUpdated = this._displayedIconNotificationUpdated.bind(this);
                this._bindings
            }, unload: function unload() {
                this.contentNotifications = null;
                this.displayedNotification = null;
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _findNotificationForDisplay: function _findNotificationForDisplay() {
                var i,
                    item;
                var notifications = this.contentNotifications;
                for (i = 0; i < notifications.length; i++) {
                    item = WinJS.Binding.unwrap(notifications).item(i);
                    if (this.checkItem(item)) {
                        if (item !== this._displayedNotification)
                            this.displayedNotification = item;
                        return
                    }
                }
                this.displayedNotification = null
            }, checkItem: function checkItem(item) {
                return true
            }, contentNotifications: {
                get: function get_contentNotifications() {
                    return this._contentNotifications
                }, set: function set_contentNotifications(value) {
                        if (this.contentNotifications)
                            this.contentNotifications.removeChangeListener(this._findNotificationForDisplay);
                        this._contentNotifications = value;
                        if (this.contentNotifications) {
                            this.contentNotifications.addChangeListener(this._findNotificationForDisplay);
                            this._findNotificationForDisplay()
                        }
                    }
            }, alternateText: {
                get: function get_alternateText() {
                    return this._alternateText
                }, set: function set_alternateText(value) {
                        this._alternateText = value;
                        if (!this.displayedNotification) {
                            this.displayedDefaultShortNotificationUpdated();
                            this.displayedDefaultLongNotificationUpdated()
                        }
                    }
            }, alternateIcon: {
                get: function get_alternateIcon() {
                    return this._alternateIcon
                }, set: function set_alternateIcon(value) {
                        this._alternateIcon = value;
                        if (!this.displayedNotification)
                            this.displayedDefaultIconNotificationUpdated()
                    }
            }, useAlternateTextStyle: {
                set: function setUseAlternateTextStyle(value) {
                    if (this._useAlternateTextStyle === value)
                        return;
                    if (value) {
                        if (this.defaultTextStyle)
                            WinJS.Utilities.removeClass(this.domElement, this.defaultTextStyle);
                        if (this.alternateTextStyle)
                            WinJS.Utilities.addClass(this.domElement, this.alternateTextStyle)
                    }
                    else {
                        if (this.alternateTextStyle)
                            WinJS.Utilities.removeClass(this.domElement, this.alternateTextStyle);
                        if (this.defaultTextStyle)
                            WinJS.Utilities.addClass(this.domElement, this.defaultTextStyle)
                    }
                    this._useAlternateTextStyle = value
                }, get: function getUseAlternateTextStyle() {
                        return this._useAlternateTextStyle
                    }
            }, displayedDefaultShortNotificationUpdated: function displayedDefaultShortNotificationUpdated() {
                this.useAlternateTextStyle = !!this.alternateText;
                this._displayedShortNotificationUpdated(this.alternateText || String.empty)
            }, displayedDefaultLongNotificationUpdated: function displayedDefaultLongNotificationUpdated() {
                this.useAlternateTextStyle = !!this.alternateText;
                this._displayedLongNotificationUpdated(this.alternateText || String.empty)
            }, displayedDefaultIconNotificationUpdated: function displayedDefaultIconNotificationUpdated() {
                this._displayedIconNotificationUpdated(this.alternateIcon || String.empty)
            }, displayedNotification: {
                get: function get_displayedNotification() {
                    return this._displayedNotification
                }, set: function set_displayedNotification(value) {
                        if (this._bindings) {
                            this._bindings.cancel();
                            this._bindings = null
                        }
                        this._displayedNotification = value;
                        this.useAlternateTextStyle = !this._displayedNotification;
                        if (this._displayedNotification)
                            this._bindings = WinJS.Binding.bind(this, {_displayedNotification: {
                                    shortText: this._displayedShortNotificationUpdated, longText: this._displayedLongNotificationUpdated, icon: this._displayedIconNotificationUpdated
                                }});
                        else {
                            this.displayedDefaultShortNotificationUpdated();
                            this.displayedDefaultLongNotificationUpdated();
                            this.displayedDefaultIconNotificationUpdated()
                        }
                    }, enumerable: false
            }, _displayedNotification: null, _displayedShortNotificationUpdated: function _displayedShortNotificationUpdated(newValue){}, _displayedLongNotificationUpdated: function _displayedLongNotificationUpdated(newValue){}, _displayedIconNotificationUpdated: function _displayedIconNotificationUpdated(newValue){}
    }, {})});
WinJS.Namespace.define("MS.Entertainment.Pages", {ContentNotificationShortTextTileItem: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.ContentNotificationTileItem, null, function contentNotificationShortTextTileItem(){}, {
        controlName: "contentNotificationShortTextTileItem", checkItem: function checkItem(item) {
                return item.shortText
            }, _displayedShortNotificationUpdated: function _displayedShortNotificationUpdated(newValue) {
                if (!this._unloaded)
                    this.domElement.textContent = newValue
            }
    })})
