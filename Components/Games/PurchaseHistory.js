/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Purchase");
    WinJS.Namespace.define("MS.Entertainment.Purchase", {GamesPurchaseHistory: WinJS.Class.define(function gamesPurchaseHistoryConstructor() {
            Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", this._onAppResume.bind(this))
        }, {
            _onAppResume: function _onAppResume() {
                this.clearPurchaseHistoryCache()
            }, getPurchaseHistoryForTitleId: function getPurchaseHistoryForTitleId(titleId) {
                    if (!titleId)
                        return WinJS.Promise.wrap(null);
                    return Microsoft.Xbox.Marketplace.MarketplaceService.getReceiptsAsync(titleId, 0, 0, null).then(function completed(receiptCollection) {
                            var receipts = [];
                            if (receiptCollection && receiptCollection.items)
                                receipts = receiptCollection.items;
                            return WinJS.Promise.wrap(receipts)
                        }, function failed(error) {
                            if (error && error.number && error.number === -2147024894)
                                return WinJS.Promise.wrap(null);
                            else
                                return WinJS.Promise.wrapError(error)
                        })
                }, getPurchaseHistoryForOfferId: function getPurchaseHistoryForOfferId(titleId, offerId) {
                    if (!offerId || !titleId)
                        return WinJS.Promise.wrap(null);
                    return Microsoft.Xbox.Marketplace.MarketplaceService.getReceiptAsync(titleId, offerId).then(function completed(receipt) {
                            return WinJS.Promise.wrap(receipt)
                        }, function failed(error) {
                            if (error && error.number && error.number === -2147024894)
                                return WinJS.Promise.wrap(null);
                            else
                                return WinJS.Promise.wrapError(error)
                        })
                }, clearPurchaseHistoryCache: function clearPurchaseHistoryCache() {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (signIn.isSignedIn)
                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.getReceipts)
                }
        }, {factory: function factory() {
                return new MS.Entertainment.Purchase.GamesPurchaseHistory
            }})});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.gamesPurchaseHistory, MS.Entertainment.Purchase.GamesPurchaseHistory.factory)
})()
