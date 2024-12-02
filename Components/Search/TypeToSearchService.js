/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {TypeToSearchService: WinJS.Class.define(function() {
            this._handleFocusIn = this._handleFocusIn.bind(this)
        }, {
            _isEnabledForApp: {get: function() {
                    return false
                }}, _isListeningForFocus: false, _disabledCount: 0, _listenForFocus: function _listenForFocus() {
                    if (this._isListeningForFocus)
                        return;
                    this._isListeningForFocus = true;
                    document.body.addEventListener("focusin", this._handleFocusIn)
                }, _stopListeningForFocus: function _stopListeningForFocus() {
                    if (!this._isListeningForFocus)
                        return;
                    document.body.removeEventListener("focusin", this._handleFocusIn);
                    this._isListeningForFocus = false
                }, _handleFocusIn: function _handleFocusIn() {
                    if (MS.Entertainment.Utilities.doesElementSupportKeyboardInput(document.activeElement))
                        this._suspendTypeToSearch();
                    else
                        this._resumeTypeToSearch()
                }, _suspendTypeToSearch: function _suspendTypeToSearch() {
                    Windows.ApplicationModel.Search.SearchPane.getForCurrentView().showOnKeyboardInput = false;
                    window.msWriteProfilerMark("ent:TypeToSearch:Suspended")
                }, _resumeTypeToSearch: function _resumeTypeToSearch() {
                    Windows.ApplicationModel.Search.SearchPane.getForCurrentView().showOnKeyboardInput = true;
                    window.msWriteProfilerMark("ent:TypeToSearch:Resume")
                }, disableTypeToSearch: function disableTypeToSearch() {
                    if (!this._isEnabledForApp)
                        return;
                    this._stopListeningForFocus();
                    this._suspendTypeToSearch();
                    this._disabledCount++;
                    window.msWriteProfilerMark("ent:TypeToSearch:Disabled")
                }, enableTypeToSearch: function enableTypeToSearch() {
                    if (!this._isEnabledForApp)
                        return;
                    if (this._disabledCount > 0) {
                        this._disabledCount--;
                        if (this._disabledCount > 0)
                            return
                    }
                    this._resumeTypeToSearch();
                    window.msWriteProfilerMark("ent:TypeToSearch:Enabled");
                    this._listenForFocus()
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.typeToSearch, function createTypeToSearchService() {
        return new MS.Entertainment.UI.TypeToSearchService
    })
})()
