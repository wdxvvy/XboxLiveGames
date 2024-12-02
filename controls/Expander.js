/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
(function() {
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {Expander: MS.Entertainment.UI.Framework.defineUserControl("Controls/Expander.html#expanderTemplate", function Expander_constructor() {
            this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)})
        }, {
            _events: null, _panelEvents: null, _expanding: false, _collapsing: false, _networkStatusBinding: null, _isOnline: null, initialize: function Expander_initialize(element, options) {
                    this._events = MS.Entertainment.Utilities.addEvents(this.domElement, {
                        focus: this._onFocused.bind(this), focusout: this._onBlur.bind(this)
                    });
                    this._panelEvents = MS.Entertainment.Utilities.addEvents(this.panel.domElement, {click: this._onClicked.bind(this)});
                    this._setExpandedStyles(this.expanded)
                }, unload: function Expander_unload() {
                    if (this._events) {
                        this._events.cancel();
                        this._events = null
                    }
                    if (this._panelEvents) {
                        this._panelEvents.cancel();
                        this._panelEvents = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, onExpandedChanged: function Expander_onExpandedChanged(newValue, oldValue){}, onExpandedChanging: function Expander_onExpandedChanging(newValue, oldValue){}, setExpanded: function Expanded_setExpanded(value) {
                    if (value !== this.expanded) {
                        this.onExpandedChanging(value, this.expanded);
                        this._setExpandedStyles(value);
                        this.expanded = value;
                        this.onExpandedChanged(value, this.expanded)
                    }
                    if (value && !this._hasFocus())
                        MS.Entertainment.UI.Framework.focusElement(this.domElement)
                }, _hasFocus: function Expander_hasFocus() {
                    return this.domElement === document.activeElement || this.domElement.contains(document.activeElement)
                }, _setExpandedStyles: function Expander_setExpandedStyles(expanded) {
                    MS.Entertainment.Utilities.toggleHideOnElement(this.flyoutPanel.domElement || this.flyoutPanel, !expanded);
                    MS.Entertainment.Utilities.toggleClassOnElement(this.panel.domElement || this.panel, expanded, "expanded");
                    MS.Entertainment.Utilities.toggleClassOnElement(this.flyoutPanel.domElement || this.flyoutPanel, expanded, "expanded")
                }, _onClicked: function Expander_onClicked(event) {
                    if (this._isOnline)
                        if (this.expanded)
                            this.setExpanded(false);
                        else
                            this.setExpanded(true)
                }, _onFocused: function Expander_onFocused(event) {
                    if (!this._expanding) {
                        this._expanding = true;
                        WinJS.Promise.timeout().then(function() {
                            if (!this._collapsing)
                                this.setExpanded(true);
                            this._expanding = false
                        }.bind(this))
                    }
                }, _onBlur: function Expander_onBlur(event) {
                    if (!this._collapsing) {
                        this._collapsing = true;
                        WinJS.Promise.timeout().then(function() {
                            if (!this._expanding && !this._hasFocus())
                                this.setExpanded(false);
                            this._collapsing = false
                        }.bind(this))
                    }
                }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                    var isOnline = this._isNetworkStatusCodeOnline(newValue);
                    if (isOnline !== this._isOnline)
                        this._isOnline = isOnline
                }, _isNetworkStatusCodeOnline: function _isNetworkStatusCodeOnline(status) {
                    var isOnline = false;
                    switch (status) {
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                            isOnline = true;
                            break;
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                        case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                            isOnline = false;
                            break
                    }
                    return isOnline
                }
        }, {
            model: null, expanded: false
        })})
})()
