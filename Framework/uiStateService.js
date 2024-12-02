/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/servicelocator.js");
(function() {
    "use strict";
    var observableProperty = MS.Entertainment.UI.Framework.observableProperty;
    var UiStateService = WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function uiStateService() {
            var currentView = Windows.UI.ViewManagement.InputPane.getForCurrentView();
            currentView.addEventListener("showing", function uiStateService_SoftKeyboardShown() {
                if (this._hidingPromise)
                    this._hidingPromise.cancel();
                this.softKeyboardOpen = true
            }.bind(this));
            currentView.addEventListener("hiding", function uiStateService_SoftKeyboardHiding(e) {
                this._hidingPromise = WinJS.Promise.timeout(250).then(function uiStateService_SoftKeyboardHidden() {
                    this._hidingPromise = null;
                    this.softKeyboardOpen = false
                }.bind(this), function(){})
            }.bind(this));
            window.addEventListener("resize", function uiStateService_WindowResizing() {
                if (!this.softKeyboardOpen && !this.isSnapped)
                    this.dispatchEvent("windowresize")
            }.bind(this))
        }, {
            animationsEnabled: {get: function() {
                    return MS.Entertainment.UI.Framework.animationsEnabled
                }}, activationKind: observableProperty("activationKind", null), appBarVisible: observableProperty("appBarVisible", false), engageVisible: observableProperty("engageVisible", false), nowPlayingVisible: observableProperty("nowPlayingVisible", false), nowPlayingInset: observableProperty("nowPlayingInset", false), nowPlayingTileVisible: observableProperty("nowPlayingTileVisible", false), isFullScreenVideo: observableProperty("isFullScreenVideo", false), isFullScreenMusic: observableProperty("isFullScreenMusic", false), isScrolling: observableProperty("isScrolling", false), isSnapped: observableProperty("isSnapped", false, true), isFirstLaunch: observableProperty("isFirstLaunch", true), isAppVisible: observableProperty("isAppVisible", true, true), isHubStripVisible: observableProperty("isHubStripVisible", false), applicationTitle: observableProperty("applicationTitle", String.empty), overlayVisible: observableProperty("overlayVisible", false), activityOverlayVisible: observableProperty("activityOverlayVisible", false), xboxControllerVisible: observableProperty("xboxControllerVisible", false), isAvatarRenderingUsingD3D: observableProperty("isAvatarRenderingUsingD3D", false), networkStatus: observableProperty("networkStatus", null), isSettingsCharmVisible: observableProperty("isSettingsCharmVisible", false), lowEndSystemAvatarMode: observableProperty("lowEndSystemAvatarMode", false), softKeyboardOpen: observableProperty("softKeyboardOpen", false), servicesEnabled: observableProperty("servicesEnabled", true), isInRestrictedBackground: observableProperty("isInRestrictedBackground", false), primarySessionId: observableProperty("primarySessionId", String.empty)
        });
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.uiState, function getUiStateService() {
        return new UiStateService
    }, true)
})()
