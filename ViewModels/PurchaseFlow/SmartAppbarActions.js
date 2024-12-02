/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/factory.js", "/Framework/telemetryUtilities.js", "/Framework/utilities.js");
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI", {AppBarActions: {
            clearSelection: "clearSelection", getOnXbox360: "getOnXbox360", navigateToHome: "navigateToHome", navigateToNowPlaying: "navigateToNowPlaying", playOnXbox360: "playOnXbox360", search: "search"
        }});
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {
        SmartAppbarActionHost: WinJS.Class.define(function SmartAppbarActionHost() {
            this._selectionHandlers = []
        }, {
            _mediaItem: null, _selectedItemBindings: null, _mediaContext: null, _selectedItemStateEngine: null, _shareOperation: null, _selectionHandlers: null, dispose: function dispose() {
                    var appBarControl = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                    if (appBarControl)
                        appBarControl.hide(true);
                    this._releaseMediaContext();
                    this._releaseMediaResources()
                }, mediaItem: {
                    get: function mediaItem_get() {
                        return this._mediaItem
                    }, set: function mediaItem_set(value) {
                            if (this._mediaItem !== value) {
                                this._mediaItem = value;
                                this._updateState()
                            }
                        }
                }, addSelectionHandlers: function addSelectionHandlers(handlers) {
                    this._selectionHandlers = this._selectionHandlers || [];
                    this._selectionHandlers.push(handlers)
                }, _releaseMediaResources: function _releaseMediaResources() {
                    if (this._shareOperation) {
                        this._shareOperation.cancel();
                        this._shareOperation = null
                    }
                    if (this._selectedItemStateEngine) {
                        this._selectedItemStateEngine.unload();
                        this._selectedItemStateEngine = null
                    }
                    if (this._selectedItemBindings) {
                        this._selectedItemBindings.cancel();
                        this._selectedItemBindings = null
                    }
                }, _releaseMediaContext: function _releaseMediaContext() {
                    if (this._mediaContext) {
                        this._mediaContext.clearContext();
                        this._mediaContext = null
                    }
                }, _updateState: function _updateState() {
                    this._releaseMediaResources();
                    if (!this._mediaItem)
                        this._releaseMediaContext();
                    else {
                        var appBarService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar);
                        var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                        if (this._mediaContext)
                            this._mediaContext.updateMediaItem(this._mediaItem);
                        else
                            this._mediaContext = appBarService.pushMediaContext(this._mediaItem, this._selectionHandlers, [], {executeLocation: MS.Entertainment.UI.Actions.ExecutionLocation.selection});
                        if (this._mediaItem.hydrate)
                            this._mediaItem.hydrate();
                        MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(this._mediaItem);
                        if (!this._selectedItemStateEngine)
                            this._selectedItemStateEngine = MS.Entertainment.ViewModels.SmartBuyStateEngine.getSelectionStateFromMediaItem(this._mediaItem);
                        if (!this._selectedItemBindings)
                            this._selectedItemBindings = WinJS.Binding.bind(this._selectedItemStateEngine, {currentAppbarActions: this._updateAppBarActions.bind(this)});
                        this._shareOperation = sender.pendingShare(this._mediaItem)
                    }
                }, _updateAppBarActions: function _updateAppBarActions(newActions) {
                    if (this._mediaContext)
                        this._mediaContext.setToolbarActions(newActions);
                    if (newActions.length > 0) {
                        var appBarControl = MS.Entertainment.globalControls.getControl(MS.Entertainment.globalControls.GlobalControl.appBar);
                        if (appBarControl)
                            appBarControl.show()
                    }
                }
        }), SmartAppbarActions: (function SmartAppbarActions() {
                var _actionService;
                return {
                        createAppbarActionFromAction: function createAppbarActionFromAction(actionId, parameter, appBarActionId, automationId, titleId, icon) {
                            if (!_actionService)
                                _actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var action = _actionService.getAction(actionId);
                            action.parameter = parameter || {};
                            var appBarAction = new MS.Entertainment.UI.ToolbarAction;
                            appBarAction.id = appBarActionId;
                            appBarAction.automationId = automationId;
                            appBarAction.title = String.load(titleId);
                            appBarAction.icon = icon;
                            appBarAction.wrappedAction = action;
                            appBarAction.parameter = parameter || {};
                            appBarAction.executed = function executed(parameter) {
                                parameter = parameter || {};
                                var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                                var options = mediaContext.options || {};
                                appBarAction.parameter.actionType = MS.Entertainment.UI.Actions.ActionWrapperType.appbarAction;
                                appBarAction.executeLocation = options.executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.selection;
                                action.parameter.mediaItem = parameter.mediaItem || mediaContext.mediaItem;
                                action.parameter.actionType = MS.Entertainment.UI.Actions.ActionWrapperType.appbarAction;
                                action.parameter.executeLocation = options.executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.selection;
                                action.id = appBarAction.id;
                                action.automationId = appBarAction.automationId;
                                action.title = appBarAction.title;
                                action.referenceContainer = appBarAction.referenceContainer;
                                WinJS.Promise.as(action.execute()).done(function actionFinished() {
                                    if (!parameter.skipCompleteHandler && mediaContext)
                                        mediaContext.dispatchEvent(appBarActionId)
                                }, function handleError(error) {
                                    MS.Entertainment.ViewModels.fail("Executing app bar action has failed. ActionId: " + appBarActionId + " Error: " + (error && error.message))
                                })
                            };
                            action.bind("isEnabled", function isEnabledChanged(isEnabled) {
                                appBarAction.isEnabled = isEnabled
                            });
                            if (parameter.hasSubActions)
                                action.bind("subActions", function subActionsChanged(newItems) {
                                    appBarAction.subActions = newItems
                                });
                            appBarAction.canExecute = function canExecute(parameter) {
                                if (!action.parameter.mediaItem || !action.parameter.isFlyoutAction) {
                                    var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                                    action.parameter.mediaItem = mediaContext.mediaItem
                                }
                                action.requeryCanExecute();
                                return action.isEnabled
                            };
                            return {action: appBarAction}
                        }, createGetOnXboxAction: function createGetOnXboxAction() {
                                var action = new MS.Entertainment.UI.ToolbarAction;
                                action.id = MS.Entertainment.UI.AppBarActions.getOnXbox360;
                                action.automationId = MS.Entertainment.UI.AutomationIds.appBarGetOnXbox360;
                                action.title = String.load(String.id.IDS_VIDEO_GET_FOR_XBOX360_APPBAR);
                                action.icon = MS.Entertainment.UI.Icon.shop;
                                action.executed = function executed() {
                                    var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                                    var mediaItems = mediaContext.mediaItem;
                                    var options = mediaContext.options || {};
                                    action.parameter = {
                                        actionType: MS.Entertainment.UI.Actions.ActionWrapperType.appbarAction, executeLocation: options.executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.selection
                                    };
                                    if (mediaItems === null)
                                        throw new Error("Invalid mediaItems when getGetOnXboxAction was executed");
                                    if (!_actionService)
                                        _actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                    var playToXboxAction = _actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.playOnXbox);
                                    var mediaItem = Array.isArray(mediaItems) ? mediaItems[0] : mediaItems;
                                    playToXboxAction.automationId = MS.Entertainment.UI.AutomationIds.appBarGetOnXbox360;
                                    playToXboxAction.parameter = {
                                        mediaItem: mediaItem, actionType: MS.Entertainment.UI.Actions.ActionWrapperType.appbarAction, executeLocation: options.executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.selection
                                    };
                                    playToXboxAction.eventHandlers = {onFinishedEvent: function onFinishedEvent() {
                                            if (mediaContext)
                                                mediaContext.dispatchEvent(MS.Entertainment.UI.AppBarActions.getOnXbox360)
                                        }};
                                    playToXboxAction.execute()
                                };
                                return {action: action}
                            }, createClearSelectionAppbarAction: function createClearSelectionAppbarAction() {
                                var clearSelectionAction = new MS.Entertainment.UI.ToolbarAction;
                                clearSelectionAction.id = MS.Entertainment.UI.AppBarActions.clearSelection;
                                clearSelectionAction.automationId = MS.Entertainment.UI.AutomationIds.appBarClearSelection;
                                clearSelectionAction.title = String.load(String.id.IDS_CLEAR_SELECTION);
                                clearSelectionAction.icon = WinJS.UI.AppBarIcon.clear;
                                clearSelectionAction.executed = function executed() {
                                    var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                                    var options = mediaContext.options || {};
                                    clearSelectionAction.parameter = {
                                        actionType: MS.Entertainment.UI.Actions.ActionWrapperType.appbarAction, executeLocation: options.executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.selection
                                    };
                                    if (mediaContext)
                                        mediaContext.dispatchEvent(MS.Entertainment.UI.AppBarActions.clearSelection)
                                };
                                clearSelectionAction.canExecute = function canExecute(parameter) {
                                    return true
                                };
                                return {action: clearSelectionAction}
                            }, createPlayOnXboxAppbarAction: function createPlayOnXboxAppbarAction(actionId) {
                                if (!_actionService)
                                    _actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                                var playToXboxAction = _actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.playOnXbox);
                                var action = new MS.Entertainment.UI.ToolbarAction;
                                action.id = MS.Entertainment.UI.AppBarActions.playOnXbox360;
                                playToXboxAction.automationId = action.automationId = MS.Entertainment.UI.AutomationIds.appBarPlayOnXbox360;
                                action.title = String.load(String.id.IDS_DETAILS_PLAY_ON_XBOX_APPBAR_LABEL);
                                action.icon = MS.Entertainment.UI.Icon.sendToXbox;
                                action.adornerMode = MS.Entertainment.UI.Controls.IconButtonMode.Custom;
                                action.adornerRing = MS.Entertainment.UI.Icon.sendToXboxAdornerAppbar;
                                action.executed = function executed() {
                                    var mediaContext = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appToolbar).currentMediaContext;
                                    var mediaItem = mediaContext.mediaItem;
                                    var options = mediaContext.options || {};
                                    MS.Entertainment.Data.List.getData(mediaItem, 0).done(function getDataSucceeded(listMediaItem) {
                                        action.parameter = {
                                            actionType: MS.Entertainment.UI.Actions.ActionWrapperType.appbarAction, executeLocation: options.executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.selection
                                        };
                                        playToXboxAction.parameter = {
                                            mediaItem: listMediaItem, actionType: MS.Entertainment.UI.Actions.ActionWrapperType.appbarAction, executeLocation: options.executeLocation || MS.Entertainment.UI.Actions.ExecutionLocation.selection
                                        };
                                        playToXboxAction.eventHandlers = {onFinishedEvent: function onFinishedEvent() {
                                                if (mediaContext)
                                                    mediaContext.dispatchEvent(MS.Entertainment.UI.AppBarActions.playOnXbox360)
                                            }};
                                        playToXboxAction.execute()
                                    }, function getDataFailed(error) {
                                        MS.Entertainment.ViewModels.fail("createPlayOnXboxAppbarAction_getData failed: " + error)
                                    })
                                };
                                action.canExecute = function canExecute() {
                                    return playToXboxAction.isEnabled
                                };
                                return {action: action}
                            }, createNavigateToHomeAction: function createNavigateToHomeAction() {
                                return this.createAppbarActionFromAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate, MS.Entertainment.UI.Actions.navigate.NavigateLocation.home, MS.Entertainment.UI.AppBarActions.navigateToHome, MS.Entertainment.UI.AutomationIds.appBarNavigateToHome, String.id.IDS_GLOBAL_COMMAND_HOME, WinJS.UI.AppBarIcon.home)
                            }, createNavigateToNowPlayingAction: function createNavigateToNowPlayingAction() {
                                return this.createAppbarActionFromAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate, MS.Entertainment.UI.Monikers.fullScreenNowPlaying, MS.Entertainment.UI.AppBarActions.navigateToNowPlaying, MS.Entertainment.UI.AutomationIds.appBarNavigateToNowPlaying, String.id.IDS_GLOBAL_COMMAND_NOW_PLAYING, MS.Entertainment.UI.Icon.inlineNowPlaying)
                            }, createSearchAction: function createSearchAction() {
                                return this.createAppbarActionFromAction(MS.Entertainment.UI.Actions.ActionIdentifiers.search, {}, MS.Entertainment.UI.AppBarActions.search, MS.Entertainment.UI.AutomationIds.appBarSearch, String.id.IDS_GLOBAL_COMMAND_SEARCH, WinJS.UI.AppBarIcon.find)
                            }
                    }
            })()
    })
})()
