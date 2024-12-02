/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Purchase");
    WinJS.Namespace.define("MS.Entertainment.Purchase", {
        GamePurchaseFlowProvider: WinJS.Class.define(null, {getPurchaseFlow: function getPurchaseFlow(mediaItem, serviceId, target, purchaseType, offerId, returnUri, gamerTag) {
                var purchaseExp = null;
                var purchaseUrl = String.empty;
                var taskId = String.empty;
                if (mediaItem.mediaType !== Microsoft.Entertainment.Queries.ObjectType.game) {
                    MS.Entertainment.Purchase.fail("Expected game media for Games purchase flow.");
                    return null
                }
                if (mediaItem.type === MS.Entertainment.Platform.PurchaseHelpers.PDLC_TYPE) {
                    if (offerId) {
                        purchaseUrl = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_PurchaseFlow) + "/purchase/Windows/" + offerId + "?gamertag=" + gamerTag;
                        if (purchaseUrl) {
                            purchaseExp = new MS.Entertainment.Purchase.PurchaseGamePDLC;
                            purchaseExp.returnUri = returnUri;
                            taskId = MS.Entertainment.UI.Controls.WebHost.TaskId.GAME
                        }
                    }
                }
                else {
                    var type = String.empty;
                    if (mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern) {
                        type = MS.Entertainment.Platform.PurchaseHelpers.METRO_TARGET;
                        var signedInUserService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        var offer = signedInUserService.isGold() ? mediaItem.offerGold : mediaItem.offerSilver;
                        if (offer && offer.paymentType === MS.Entertainment.Data.Augmenter.Marketplace.edsPaymentType.currency)
                            serviceId = offer.offerId
                    }
                    else
                        type = MS.Entertainment.Platform.PurchaseHelpers.CONSOLE_TARGET;
                    if (mediaItem.downloadType === MS.Entertainment.Platform.PurchaseHelpers.AVATAR_TYPE)
                        type = MS.Entertainment.Platform.PurchaseHelpers.AVATAR_TYPE;
                    purchaseUrl = MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_PurchaseFlow) + "/purchase/" + type + "/" + serviceId + "?gamertag=" + gamerTag;
                    if (purchaseUrl) {
                        purchaseExp = new MS.Entertainment.Purchase.PurchaseXBox;
                        taskId = MS.Entertainment.UI.Controls.WebHost.TaskId.GAME
                    }
                }
                return {
                        purchaseExp: purchaseExp, purchaseUrl: purchaseUrl, taskId: taskId
                    }
            }}, {factory: function factory() {
                return new MS.Entertainment.Purchase.GamePurchaseFlowProvider
            }}), PurchaseXBox: WinJS.Class.derive(MS.Entertainment.UI.Controls.WebHostExperience, function PurchaseXBox_constructor() {
                MS.Entertainment.UI.Controls.WebHostExperience.prototype.constructor.call(this)
            }, {
                mediaItem: null, startListener: function startListener() {
                        var trace = "";
                        if (!this.disposed)
                            this.eventProvider.tracePurchaseFlowGames_Start(trace);
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.startListener.apply(this, arguments)
                    }, messageReceived: function messageReceived(messageStruct, webHost, sendMessageFunc) {
                        var offerId = String.empty;
                        var errorCode = String.empty;
                        if (!this.disposed)
                            switch (messageStruct.verb) {
                                case"CLOSE_DIALOG":
                                    if (messageStruct.reason === "CANCEL")
                                        this.eventProvider.tracePurchaseFlowGames_Cancel(String.empty);
                                    else if (messageStruct.reason === "ERROR")
                                        this.eventProvider.tracePurchaseFlowGames_Error(String.empty, messageStruct.errorCode);
                                    else if (messageStruct.reason === "REJECTION")
                                        this.eventProvider.tracePurchaseFlowGames_Rejection(String.empty, messageStruct.errorCode);
                                    else if (messageStruct.reason === "SUCCESS") {
                                        var offerId = String.empty;
                                        if (messageStruct.offerIds)
                                            offerId = messageStruct.offerIds[0];
                                        this.eventProvider.tracePurchaseFlowGames_Finish(offerId);
                                        MS.Entertainment.Utilities.Telemetry.logPurchaseMade(this.mediaItem);
                                        var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.gamesPurchaseHistory);
                                        purchaseHistoryService.clearPurchaseHistoryCache()
                                    }
                                    break
                            }
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.messageReceived.apply(this, arguments)
                    }
            }, {factory: function factory() {
                    return new MS.Entertainment.Purchase.PurchaseXBox
                }}), PurchaseGamePDLC: WinJS.Class.derive(MS.Entertainment.UI.Controls.WebHostExperience, function PurchaseGamePDLC_constructor() {
                MS.Entertainment.UI.Controls.WebHostExperience.prototype.constructor.call(this);
                this.onErrorEvent = this._onErrorEvent
            }, {
                mediaItem: null, returnUri: String.empty, purchaseGameFailed: false, _onErrorEvent: function _onErrorEvent(message) {
                        var uri = this.returnUri ? this.returnUri + "&purchaseresult=Failed" : String.empty;
                        this._navigateToUri(uri)
                    }, startListener: function startListener() {
                        if (!this.disposed)
                            this.eventProvider.tracePurchaseFlowGames_Start(String.empty);
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.startListener.apply(this, arguments)
                    }, messageReceived: function messageReceived(messageStruct, webHost, sendMessageFunc) {
                        var offerId = String.empty;
                        var errorCode = String.empty;
                        var uri = String.empty;
                        if (!this.disposed)
                            switch (messageStruct && messageStruct.verb) {
                                case"CLOSE_DIALOG":
                                    switch (messageStruct.reason) {
                                        case"SUCCESS":
                                            var offerId = String.empty;
                                            if (messageStruct.offerIds && messageStruct.offerIds.length > 0)
                                                offerId = messageStruct.offerIds[0];
                                            this.eventProvider.tracePurchaseFlowGames_Finish(offerId);
                                            MS.Entertainment.Utilities.Telemetry.logPurchaseMade(this.mediaItem);
                                            uri = this.returnUri ? this.returnUri + "&purchaseresult=Succeeded" : String.empty;
                                            var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.gamesPurchaseHistory);
                                            purchaseHistoryService.clearPurchaseHistoryCache();
                                            break;
                                        case"CANCEL":
                                            if (!this.purchaseGameFailed) {
                                                this.eventProvider.tracePurchaseFlowGames_Cancel(String.empty);
                                                uri = this.returnUri ? this.returnUri + "&purchaseresult=UserCancelled" : String.empty
                                            }
                                            else
                                                uri = this.returnUri ? this.returnUri + "&purchaseresult=Failed" : String.empty;
                                            break;
                                        case"ERROR":
                                            this.purchaseGameFailed = true;
                                            break;
                                        case"REJECTION":
                                            this.purchaseGameFailed = true;
                                            break;
                                        default:
                                            break
                                    }
                                    break
                            }
                        MS.Entertainment.UI.Controls.WebHostExperience.prototype.messageReceived.apply(this, arguments);
                        this._navigateToUri(uri)
                    }, _navigateToUri: function _navigateToUri(uri) {
                        if (uri) {
                            var that = this;
                            WinJS.Promise.timeout(1000).then(function() {
                                that.handleReturnUri(uri)
                            })
                        }
                    }, handleReturnUri: function handleReturnUri(uri) {
                        if (uri) {
                            var service = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                            var action = service.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.launchApp);
                            action.automationId = MS.Entertainment.UI.AutomationIds.launchAppPurchaseGame;
                            action.parameter = {
                                uri: uri, appendSource: false, appendGamerTag: false
                            };
                            action.execute()
                        }
                    }
            }, {factory: function factory() {
                    return new MS.Entertainment.Purchase.PurchaseGamePDLC
                }})
    })
})()
