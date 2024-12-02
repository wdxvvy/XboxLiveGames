/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/navigation.js", "/Framework/serviceLocator.js");
(function(undefined) {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {
        navigate: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function navigateConstructor() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.AutomationIds.navigate, offlineMessageTitle: null, executed: function executed(param) {
                    if (param === MS.Entertainment.UI.Actions.navigate.NavigateLocation.back) {
                        if (!MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).overlayVisible)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateBack()
                    }
                    else if (param === MS.Entertainment.UI.Actions.navigate.NavigateLocation.home) {
                        var navigatonService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                        navigatonService.navigateToDefaultPage()
                    }
                    else {
                        var location = this._extractLocation(param);
                        var args = this._extractArguments(param);
                        MS.Entertainment.UI.Actions.assert((location), "the navigate command was expecting a location object, but didn't get one.");
                        MS.Entertainment.UI.Actions.assert((typeof location.page === "string"), "the navigate command was expecting a string page location, but didn't get one.");
                        if (location && location.page)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(location.page, location.hub, location.panel, args)
                    }
                }, canExecute: function canExecute(param) {
                    if (this.disableWhenOffline)
                        switch (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus) {
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                                break;
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                            case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                                if (this.offlineMessageTitle && !this.referenceContainer) {
                                    var errorCode = MS.Entertainment.Platform.Playback.Error.NS_E_WMPIM_USEROFFLINE.code;
                                    MS.Entertainment.UI.Shell.showError(this.offlineMessageTitle, errorCode)
                                }
                                return false
                        }
                    if (this.disableOnServicesDisabled)
                        return MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).servicesEnabled;
                    var location = this._extractLocation(param);
                    return !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).isSnapped && (location) && ((typeof location.page === "string") || location === MS.Entertainment.UI.Actions.navigate.NavigateLocation.back || location === MS.Entertainment.UI.Actions.navigate.NavigateLocation.home)
                }, _extractLocation: function _extractLocation(param) {
                    var location;
                    if (param === MS.Entertainment.UI.Actions.navigate.NavigateLocation.back)
                        location = param;
                    else if (param === MS.Entertainment.UI.Actions.navigate.NavigateLocation.home)
                        location = param;
                    else if (typeof param === "object")
                        location = param;
                    else
                        location = {page: param};
                    return location
                }, _extractArguments: function _extractArguments(param) {
                    var result = null;
                    var args = null;
                    if (param && param.args) {
                        args = WinJS.Binding.unwrap(param.args);
                        result = {};
                        for (var key in args)
                            result[key] = args[key]
                    }
                    return result
                }
        }, {NavigateLocation: {
                back: "back", home: "home"
            }}), musicCollectionNavigate: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function musicCollectionNavigateConstructor() {
                this.base()
            }, {
                automationId: MS.Entertainment.UI.AutomationIds.navigate, executed: function executed() {
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.musicCollection)
                    }, canExecute: function canExecute() {
                        return true
                    }
            }), videoCollectionNavigate: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function videoCollectionNavigateConstructor() {
                this.base()
            }, {
                automationId: MS.Entertainment.UI.AutomationIds.navigate, executed: function executed() {
                        var hub = MS.Entertainment.UI.Monikers.allVideoCollection;
                        var view = MS.Entertainment.ViewModels.VideoCollection.ViewTypes.all;
                        try {
                            view = Windows.Storage.ApplicationData.current.localSettings.values["VideoCollectionView"]
                        }
                        catch(e) {}
                        switch (view) {
                            case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.all:
                                hub = MS.Entertainment.UI.Monikers.allVideoCollection;
                                break;
                            case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.movies:
                                hub = MS.Entertainment.UI.Monikers.movieCollection;
                                break;
                            case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.tv:
                                hub = MS.Entertainment.UI.Monikers.tvCollection;
                                break;
                            case MS.Entertainment.ViewModels.VideoCollection.ViewTypes.other:
                                hub = MS.Entertainment.UI.Monikers.otherVideoCollection;
                                break
                        }
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.videoCollection, hub)
                    }, canExecute: function canExecute() {
                        return true
                    }
            }), depthGalleryNavigate: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function depthGalleryNavigateConstructor() {
                this.base()
            }, {
                executed: function executed() {
                    var parameter = this.parameter || {};
                    var page = parameter.page;
                    var hub = parameter.hub;
                    var panel = parameter.panel;
                    var navigationArguments = parameter.args || {};
                    navigationArguments.data = parameter.data;
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(page, hub, panel, navigationArguments)
                }, canExecute: function canExecute() {
                        return true
                    }
            })
    });
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate, function() {
        return new MS.Entertainment.UI.Actions.navigate
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.musicCollectionNavigate, function() {
        return new MS.Entertainment.UI.Actions.musicCollectionNavigate
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.videoCollectionNavigate, function() {
        return new MS.Entertainment.UI.Actions.videoCollectionNavigate
    });
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.depthGalleryNavigate, function() {
        return new MS.Entertainment.UI.Actions.depthGalleryNavigate
    })
})()
