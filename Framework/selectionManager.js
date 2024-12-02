/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Framework");
    WinJS.Namespace.define("MS.Entertainment.Framework", {SelectionManager: WinJS.Class.derive(MS.Entertainment.Utilities.EventInvoker, function selectionManager(dataSource, defaultSelectionIndex, settingsKey) {
            MS.Entertainment.Utilities.EventInvoker.prototype.constructor.call(this);
            this._handleChangesInDataSource = this._handleChangesInDataSource.bind(this);
            this._dataSource = dataSource;
            this._settingsKey = settingsKey;
            this._defaultSelectionIndex = defaultSelectionIndex;
            this._updateWorkingDataSource();
            this._updateDefaultSelection();
            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
            this._enableSaving = !configurationManager.shell.preventSelectionManagerSettingSaves
        }, {
            _dataSource: null, _workingDataSource: null, _bindings: null, _settingsKey: null, _enableSaving: true, _isRoamingSetting: true, _defaultSelectionIndex: -1, _selectedItem: null, _selectedIndex: -1, _disposed: false, dispose: function dispose() {
                    if (this._bindings) {
                        this._bindings.cancel();
                        this._bindings = null
                    }
                    this._setSelected(this._selectedItem, false);
                    this._dataSource = null;
                    this._selectedItem = null;
                    this._disposed = true
                }, dataSource: {
                    get: function() {
                        return this._dataSource
                    }, set: function(value) {
                            value = WinJS.Binding.unwrap(value);
                            var oldValue = this._dataSource;
                            var nullOrArray = !value || Array.isArray(value) || value instanceof MS.Entertainment.ObservableArray;
                            MS.Entertainment.Framework.assert(nullOrArray, "Source was not an array. Only array's are supported");
                            if (value !== this._dataSource && nullOrArray && !this._disposed) {
                                this._dataSource = value;
                                this._updateWorkingDataSource();
                                this._updateDefaultSelection();
                                this.notify("dataSource", value, oldValue)
                            }
                        }
                }, isRoamingSetting: {
                    get: function() {
                        return this._isRoamingSetting
                    }, set: function(value) {
                            var oldValue = this._isRoamingSetting;
                            if (value !== this._isRoamingSetting) {
                                this._isRoamingSetting = value;
                                if (this.dataSource && this.dataSource.length)
                                    this._saveSelection(this.selectedIndex);
                                this.notify("isRoamingSetting", value, oldValue)
                            }
                        }
                }, settingsKey: {
                    get: function() {
                        return this._settingsKey
                    }, set: function(value) {
                            var oldValue = this._settingsKey;
                            if (value !== this._settingsKey) {
                                this._settingsKey = value;
                                this.notify("settingsKey", value, oldValue)
                            }
                        }
                }, selectedIndex: {
                    get: function() {
                        return this._selectedIndex
                    }, set: function(value) {
                            if (value !== this._selectedIndex) {
                                var oldValue = this._selectedIndex;
                                this._selectedIndex = value;
                                this._onSelectedIndexChanged(value, oldValue)
                            }
                        }
                }, selectedItem: {
                    get: function() {
                        return this._item(this.selectedIndex)
                    }, set: function(value) {
                            var oldValue = WinJS.Binding.unwrap(this.selectedItem);
                            value = WinJS.Binding.unwrap(value);
                            if (value !== oldValue) {
                                var index = -1;
                                if (this._workingDataSource)
                                    for (var i = 0; i < this._workingDataSource.length; i++)
                                        if (WinJS.Binding.unwrap(this._workingDataSource.item(i)) === value) {
                                            index = i;
                                            break
                                        }
                                this.selectedIndex = index
                            }
                        }
                }, _setSelected: function _setSelected(item, value) {
                    if (item && "selected" in item)
                        item.selected = value
                }, _item: function _item(index) {
                    return (this._workingDataSource && index >= 0 && index < this._workingDataSource.length) ? this._workingDataSource.item(index) : null
                }, _updateWorkingDataSource: function _updateWorkingDataSource() {
                    if (this._workingDataSource)
                        this._workingDataSource.removeChangeListener(this._handleChangesInDataSource);
                    if (!this._dataSource) {
                        this._workingDataSource = null;
                        return
                    }
                    var tempWorkingData = WinJS.Binding.unwrap(this._dataSource);
                    if (!(this._dataSource instanceof MS.Entertainment.ObservableArray))
                        tempWorkingData = new MS.Entertainment.ObservableArray(this._dataSource);
                    if (tempWorkingData)
                        tempWorkingData.addChangeListener(this._handleChangesInDataSource);
                    this._workingDataSource = tempWorkingData
                }, _updateDefaultSelection: function _updateDefaultSelection() {
                    var newIndex = -1;
                    if (this.settingsKey && this._enableSaving)
                        if (this.isRoamingSetting)
                            newIndex = Windows.Storage.ApplicationData.current.roamingSettings.values[this.settingsKey];
                        else
                            newIndex = Windows.Storage.ApplicationData.current.localSettings.values[this.settingsKey];
                    if (newIndex < 0 || isNaN(newIndex) || (this._workingDataSource && newIndex >= this._workingDataSource.length))
                        newIndex = (isNaN(this._defaultSelectionIndex)) ? 0 : this._defaultSelectionIndex;
                    if (!this._workingDataSource || newIndex >= this._workingDataSource.length)
                        newIndex = -1;
                    if (newIndex !== this.selectedIndex)
                        this.selectedIndex = newIndex;
                    else if (newIndex >= 0)
                        this._onSelectedIndexChanged(newIndex, newIndex)
                }, _onSelectedIndexChanged: function _onSelectedIndexChanged(newValue, oldValue) {
                    if (oldValue !== undefined && oldValue !== null && !this._disposed) {
                        var oldSelectedItem = this._selectedItem;
                        var newSelectedItem = this._item(newValue);
                        var selectedIndexChanged = newValue !== oldValue;
                        var selectedItemChanged = newSelectedItem !== oldSelectedItem;
                        this._setSelected(oldSelectedItem, false);
                        if (selectedIndexChanged)
                            this.notify("selectedIndex", newValue, oldValue);
                        if (selectedItemChanged)
                            this.notify("selectedItem", newSelectedItem, oldSelectedItem);
                        this._selectedItem = newSelectedItem;
                        this._setSelected(newSelectedItem, true);
                        this._saveSelection(newValue);
                        if (selectedItemChanged)
                            this.dispatchEvent(MS.Entertainment.Framework.SelectionManager.events.selectedItemChanged, {
                                sender: this, newSelection: {
                                        item: newSelectedItem, index: newValue
                                    }, oldSelection: {
                                        item: oldSelectedItem, index: oldValue
                                    }
                            })
                    }
                }, _saveSelection: function _saveSelection(value) {
                    if (this.settingsKey && this._enableSaving && value >= 0)
                        if (this.isRoamingSetting)
                            Windows.Storage.ApplicationData.current.roamingSettings.values[this.settingsKey] = value;
                        else
                            Windows.Storage.ApplicationData.current.localSettings.values[this.settingsKey] = value
                }, _handleChangesInDataSource: function _handleChangesInDataSource(notification) {
                    var newIndex = this.selectedIndex;
                    switch (notification.type) {
                        case MS.Entertainment.ObservableArray.OperationTypes.add:
                            if (notification.index <= this.selectedIndex)
                                this.selectedIndex = this.selectedIndex + 1;
                            break;
                        case MS.Entertainment.ObservableArray.OperationTypes.remove:
                            if (notification.index <= this.selectedIndex && this.selectedIndex > 0)
                                this.selectedIndex = this.selectedIndex - 1;
                            else if (notification.index === this.selectedIndex)
                                this._onSelectedIndexChanged(notification.index, this.selectedIndex);
                            break;
                        case MS.Entertainment.ObservableArray.OperationTypes.reset:
                            this.selectedIndex = this._defaultSelectionIndex;
                            break;
                        default:
                            MS.Entertainment.UI.Controls.assert(false, "unsupported notification type: " + notification.type);
                            break
                    }
                    if (this.selectedIndex < 0 && this._workingDataSource.length > 0)
                        this.selectedIndex = this._defaultSelectionIndex
                }
        }, {events: {selectedItemChanged: "selectedItemChanged"}})})
})()
