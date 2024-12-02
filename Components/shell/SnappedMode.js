/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/corefx.js", "/Framework/servicelocator.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Components.Shell");
WinJS.Namespace.define("MS.Entertainment.UI.Components.Shell", {
    SnappedMode: MS.Entertainment.UI.Framework.defineUserControl("Components/Shell/SnappedMode.html#snappedModeTemplate", function snappedModeConstructor(element, options){}, {}), initializeSnappedMode: function initializeSnappedMode() {
            var snappedElement = document.getElementById("htmlSnapped");
            var unsnappedElement = document.getElementById("htmlUnsnapped");
            var snappedUserControlElement = null;
            var didMoveNowPlaying = false;
            var didBindToNowPlaying = false;
            var freezeControls = function freezeControls() {
                    var itemsToFreeze = [];
                    var currentPage = document.querySelector("#pageContainer .currentPage");
                    if (currentPage)
                        itemsToFreeze.push(currentPage);
                    var overlays = document.querySelectorAll(".overlayAnchor:not(.noFreeze)");
                    Array.prototype.forEach.call(overlays, function(overlay) {
                        itemsToFreeze.push(overlay)
                    });
                    itemsToFreeze.forEach(function(item) {
                        MS.Entertainment.Utilities.freezeControlsInSubtree(item)
                    })
                };
            var thawControls = function thawControls() {
                    var itemsToThaw = [];
                    var currentPage = document.querySelector("#pageContainer .currentPage");
                    if (currentPage)
                        itemsToThaw.push(currentPage);
                    var overlays = document.querySelectorAll(".overlayAnchor:not(.noFreeze)");
                    Array.prototype.forEach.call(overlays, function(overlay) {
                        itemsToThaw.push(overlay)
                    });
                    itemsToThaw.forEach(function(item) {
                        MS.Entertainment.Utilities.thawControlsInSubtree(item)
                    })
                };
            var UnsnapButtonAction = MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function unsnapAction() {
                    this.base()
                }, {
                    automationId: MS.Entertainment.UI.AutomationIds.unsnapButtonAction, executed: function executed(parameter) {
                            var appView = Windows.UI.ViewManagement.ApplicationView;
                            if (appView && !appView.tryUnsnap());
                        }, canExecute: function canExecute(parameter) {
                            return true
                        }
                });
            var navigateOnMedia = function navigateOnMedia(newValue, oldValue) {
                    if (newValue && !didMoveNowPlaying) {
                        snappedUserControlElement = document.createElement("div");
                        snappedUserControlElement.className = "musicSnappedNowPlaying snappedContainer win-ui-dark";
                        snappedElement.appendChild(snappedUserControlElement);
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).nowPlayingTileVisible = false;
                        var nowPlayingControl = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).getNowPlayingControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying);
                        MS.Entertainment.Utilities.empty(snappedUserControlElement);
                        snappedUserControlElement.appendChild(nowPlayingControl.domElement);
                        didMoveNowPlaying = true
                    }
                };
            var snapMusic = function snapMusic() {
                    WinJS.Utilities.addClass(document.body, "snapped");
                    WinJS.Utilities.removeClass(snappedElement, "hideFromDisplay");
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    uiStateService.isSnapped = true;
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    if (sessionMgr.primarySession && sessionMgr.primarySession.currentMedia) {
                        var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        if (!uiStateService.nowPlayingVisible || !navigationService.currentPage || !navigationService.currentPage.iaNode || navigationService.currentPage.iaNode.moniker !== "immersiveDetails") {
                            WinJS.Utilities.addClass(unsnappedElement, "hideFromDisplay");
                            freezeControls();
                            navigateOnMedia(true)
                        }
                        else
                            WinJS.Utilities.addClass(snappedElement, "hideFromDisplay")
                    }
                    else {
                        WinJS.Utilities.addClass(unsnappedElement, "hideFromDisplay");
                        MS.Entertainment.UI.Framework.loadTemplate("Components/Music/MusicSharedTemplates.html#musicSnappedTemplate").then(function renderControl(controlInstance) {
                            var dataContext = WinJS.Binding.as({unsnapAction: new UnsnapButtonAction});
                            snappedUserControlElement = document.createElement("div");
                            snappedElement.appendChild(snappedUserControlElement);
                            return controlInstance.render(dataContext, snappedUserControlElement)
                        }.bind(this));
                        sessionMgr.primarySession.bind("currentMedia", navigateOnMedia);
                        didBindToNowPlaying = true;
                        freezeControls()
                    }
                };
            var unSnapMusic = function unSnapMusic() {
                    WinJS.Utilities.removeClass(document.body, "snapped");
                    WinJS.Utilities.removeClass(unsnappedElement, "hideFromDisplay");
                    var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    uiStateService.isSnapped = false;
                    if (didMoveNowPlaying) {
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.nowPlayingControlManager).releaseNowPlayingControl(MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying);
                        didMoveNowPlaying = false
                    }
                    thawControls();
                    if (didBindToNowPlaying)
                        sessionMgr.primarySession.unbind("currentMedia", navigateOnMedia);
                    snappedUserControlElement = null;
                    WinJS.Utilities.addClass(snappedElement, "hideFromDisplay");
                    MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar).hide()
                };
            var matchSnappedWatcher = matchMedia("all and (min-width: 320px) and (max-width: 499px)");
            function onSnappedMode(matchSnapped) {
                if (matchSnapped.matches) {
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped = true;
                    snappedUserControlElement = document.createElement("div");
                    snappedElement.appendChild(snappedUserControlElement);
                    new MS.Entertainment.UI.Components.Shell.SnappedMode(snappedUserControlElement, {});
                    WinJS.Utilities.addClass(unsnappedElement, "hideFromDisplay");
                    freezeControls();
                    WinJS.Utilities.removeClass(snappedElement, "hideFromDisplay");
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).switchedToSnappedMode()
                }
            }
            matchSnappedWatcher.addListener(onSnappedMode);
            if (matchSnappedWatcher.matches)
                onSnappedMode(matchSnappedWatcher);
            var snappedControlsToRemove = [];
            var matchUnsnappedWatcher = matchMedia("all and (min-width: 500px)");
            matchUnsnappedWatcher.addListener(function onUnsnappedMode(matchUnsnapped) {
                if (matchUnsnapped.matches) {
                    thawControls();
                    WinJS.Utilities.removeClass(unsnappedElement, "hideFromDisplay");
                    WinJS.Utilities.addClass(snappedElement, "hideFromDisplay");
                    snappedControlsToRemove.push(snappedUserControlElement);
                    snappedUserControlElement = null;
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).updateAndNotify("isSnapped", false).then(function _delay() {
                        var actualControl = snappedControlsToRemove.pop();
                        while (actualControl) {
                            snappedElement.removeChild(actualControl);
                            actualControl = snappedControlsToRemove.pop()
                        }
                    });
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).switchedToUnsnappedMode()
                }
            })
        }
})
