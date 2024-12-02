/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function(undefined) {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {
        Purchase: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function purchase() {
            this.base()
        }, {
            eventHandlers: null, subTitle: null, executed: function executed(param) {
                    var listOrMediaItem = MS.Entertainment.UI.Actions.extractMediaItemFromParam(param);
                    var target = (param) ? param.target : null;
                    var purchaseType = (param) ? param.purchaseType : null;
                    MS.Entertainment.Data.List.getData(listOrMediaItem, 0).done(function launchPurchaseFlow(mediaItem) {
                        if (param && param.hydrateMediaItem)
                            mediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem);
                        if (MS.Entertainment.Utilities.Telemetry.isCurrentPageSearchPage())
                            MS.Entertainment.Utilities.Telemetry.logSearchExit(mediaItem, false, "Buy");
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        MS.Entertainment.Platform.PurchaseHelpers.launchPurchaseFlow(mediaItem, target, purchaseType, this.eventHandlers, null, null, signedInUser.gamerTag)
                    }.bind(this), function getDataFailed() {
                        MS.Entertainment.UI.Actions.assert(false, "Execute purchase failed")
                    })
                }, canExecute: function canExecute(param) {
                    return this.isEnabled
                }
        }), WatchOnXbox: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function watchOnXbox() {
                this.base()
            }, {
                executed: function executed(param) {
                    var listOrMediaItem = MS.Entertainment.UI.Actions.extractMediaItemFromParam(param);
                    MS.Entertainment.Data.List.getData(listOrMediaItem, 0).then(function watchOnXbox(mediaItem) {
                        if (param && param.hydrateMediaItem)
                            mediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem);
                        if (MS.Entertainment.Utilities.Telemetry.isCurrentPageSearchPage())
                            MS.Entertainment.Utilities.Telemetry.logSearchExit(mediaItem, false, "WatchOnXBox");
                        MS.Entertainment.Platform.PlaybackHelpers.playToXboxPauseLocalPlayback(mediaItem)
                    }.bind(this))
                }, canExecute: function canExecute(param) {
                        return MS.Entertainment.Platform.PlaybackHelpers.isPlayToXboxFeatureEnabled()
                    }
            }), PlayOnXbox: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function playOnXbox() {
                this.base()
            }, {
                executed: function executed(param) {
                    var mediaItem = MS.Entertainment.UI.Actions.extractMediaItemFromParam(param);
                    if (param && param.hydrateMediaItem)
                        mediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem);
                    if (MS.Entertainment.Utilities.Telemetry.isCurrentPageSearchPage())
                        MS.Entertainment.Utilities.Telemetry.logSearchExit(mediaItem, false, "PlayOnXBox");
                    MS.Entertainment.Platform.PlaybackHelpers.playToXboxPauseLocalPlayback(mediaItem, null)
                }, canExecute: function canExecute(param) {
                        return MS.Entertainment.Platform.PlaybackHelpers.isPlayToXboxFeatureEnabled()
                    }
            }), DownloadDemo: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function downloadDemo() {
                this.base()
            }, {
                executed: function executed(param) {
                    var mediaItem = MS.Entertainment.UI.Actions.extractMediaItemFromParam(param);
                    if (param && param.hydrateMediaItem)
                        mediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem);
                    if (mediaItem.gameDemo) {
                        var gameMediaItem = {
                                serviceId: mediaItem.gameDemo.id, mediaType: Microsoft.Entertainment.Queries.ObjectType.game
                            };
                        MS.Entertainment.Platform.PurchaseHelpers.launchPurchaseFlow(gameMediaItem)
                    }
                    if (MS.Entertainment.Utilities.Telemetry.isCurrentPageSearchPage())
                        MS.Entertainment.Utilities.Telemetry.logSearchExit(mediaItem, false, "DownloadDemo")
                }, canExecute: function canExecute(param) {
                        return true
                    }
            })
    });
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    if (!actionService.isRegistered(MS.Entertainment.UI.Actions.ActionIdentifiers.purchase))
        actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.purchase, function() {
            return new MS.Entertainment.UI.Actions.Purchase
        });
    if (!actionService.isRegistered(MS.Entertainment.UI.Actions.ActionIdentifiers.watchOnXbox))
        actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.watchOnXbox, function() {
            return new MS.Entertainment.UI.Actions.WatchOnXbox
        });
    if (!actionService.isRegistered(MS.Entertainment.UI.Actions.ActionIdentifiers.playOnXbox))
        actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.playOnXbox, function() {
            return new MS.Entertainment.UI.Actions.PlayOnXbox
        });
    if (!actionService.isRegistered(MS.Entertainment.UI.Actions.ActionIdentifiers.downloadDemo))
        actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.downloadDemo, function() {
            return new MS.Entertainment.UI.Actions.DownloadDemo
        });
    WinJS.Namespace.define("MS.Entertainment.Pages", {ActionButtonsControl: MS.Entertainment.UI.Framework.defineUserControl("/Components/InlineDetails/ActionButtonsControl.html#actionButtonsControlTemplate", null, {
            replaceInline: false, defaultButtonClass: null, tabIndex: 0, _buttonsChangedHandler: null, buttons: MS.Entertainment.UI.Framework.observableProperty("buttons", null), currentButtons: MS.Entertainment.UI.Framework.observableProperty("currentButtons", null), initialize: function initialize() {
                    this._actionButtons.defaultButtonClass = this.defaultButtonClass;
                    this._actionButtons.tabIndex = this.tabIndex;
                    this.currentButtons = new MS.Entertainment.ObservableArray;
                    this._buttonsChangedHandler = MS.Entertainment.Utilities.addEventHandlers(this, {buttonsChanged: this._buttonsChanged.bind(this)});
                    this._buttonsChanged({detail: {newValue: this.buttons}})
                }, unload: function unload() {
                    if (this._buttonsChangedHandler) {
                        this._buttonsChangedHandler.cancel();
                        this._buttonsChangedHandler = null
                    }
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
                }, _buttonsChanged: function buttonInfoChanged(e) {
                    var newButtons = e && e.detail && e.detail.newValue;
                    if (!newButtons)
                        return;
                    WinJS.Utilities.removeClass(this._actionButtons.domElement, "hideFromDisplay");
                    if (!this.replaceInline)
                        this.currentButtons = newButtons;
                    else {
                        var i;
                        var enabledActions = {};
                        newButtons.forEach(function addId(action) {
                            MS.Entertainment.UI.assert(action.id, "Missing action Id");
                            enabledActions[action.id] = true
                        });
                        for (i = (this.currentButtons.length - 1); i >= 0; i--) {
                            var action = this.currentButtons.item(i);
                            if (!enabledActions[action.id])
                                this.currentButtons.removeAt(i)
                        }
                        var action;
                        var currentIndex = 0;
                        var actionLength = newButtons.length;
                        for (i = 0; i < actionLength; i++) {
                            action = newButtons[i];
                            if (this.currentButtons.length <= currentIndex)
                                this.currentButtons.push(action);
                            else if (this.currentButtons.item(currentIndex).id !== action.id)
                                this.currentButtons.insert(currentIndex, action);
                            currentIndex++
                        }
                        WinJS.Promise.timeout().then(function raiseReadyEvent() {
                            var domEvent = document.createEvent("Event");
                            domEvent.initEvent("ActionsReady", true, true);
                            this._actionButtons.domElement.dispatchEvent(domEvent)
                        }.bind(this))
                    }
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {ActionButtonsListControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ItemsControl, null, function actionButtonsListControl(){}, {
            listViewModel: null, defaultButtonClass: null, tabIndex: 0, controlName: "ActionButtonsControl", initialize: function initialize() {
                    if (!this.itemTemplate)
                        this.itemTemplate = "/Components/InlineDetails/ActionButtonsControl.html#actionButtonTemplate";
                    MS.Entertainment.UI.Controls.ItemsControl.prototype.initialize.apply(this, arguments)
                }, processItemData: function processItemData(itemData, index) {
                    itemData.execute = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(itemData.execute, itemData);
                    if (!itemData.className) {
                        var className = this.defaultButtonClass;
                        if (itemData.extendedClassNames)
                            className += " " + itemData.extendedClassNames;
                        itemData.addProperty("className", className);
                        itemData.tabIndex = this.tabIndex
                    }
                    if (this.listViewModel)
                        return new MS.Entertainment.UI.Controls.ItemsControlViewModel(itemData, this.listViewModel, index);
                    else
                        return itemData
                }, itemsRendered: function itemsRendered() {
                    WinJS.Promise.timeout().done(function raiseReadyEvent() {
                        var domEvent = document.createEvent("Event");
                        domEvent.initEvent("ActionsReady", true, true);
                        this.domElement.dispatchEvent(domEvent)
                    }.bind(this))
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {SmartBuyButtonsListControl: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.ActionButtonsListControl, null, null, {
            _eventProxyHandler: null, _eventProxy: null, controlName: "ActionButtonsControl", eventProxy: {
                    get: function() {
                        return this._eventProxy
                    }, set: function(value) {
                            if (value !== this._eventProxy) {
                                this._eventProxy = value;
                                this._cancelEventHandlers();
                                if (this._eventProxy)
                                    this._eventProxyHandler = MS.Entertainment.Utilities.addEventHandlers(this._eventProxy, {currentButtonsChanged: this._setDataSourceFromEvent.bind(this)})
                            }
                        }
                }, unload: function unload() {
                    MS.Entertainment.Pages.ActionButtonsListControl.prototype.unload.apply(this, arguments);
                    this._cancelEventHandlers()
                }, _cancelEventHandlers: function _cancelEventHandlers() {
                    if (this._eventProxyHandler) {
                        this._eventProxyHandler.cancel();
                        this._eventProxyHandler = null
                    }
                }, _setDataSourceFromEvent: function _setDataSourceFromEvent(args) {
                    if (!this._unloaded)
                        this.dataSource = args.detail.value
                }
        })})
})()
