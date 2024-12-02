/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
(function() {
    "use strict";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {SmartBuyStateHandlers: {
            onExtraImmersiveDetailsStateChanged: function onExtraImmersiveDetailsStateChanged(stateInfo) {
                if (!this.media.hydrated)
                    return WinJS.Promise.wrap(null);
                var buttons = [];
                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                var xbox360GamesPurchaseEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesPurchase);
                var xbox360GamesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesMarketplace);
                var metroGamesPurchaseEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesPurchase);
                var metroGamesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
                var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.gamesPurchaseHistory);
                var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                var signedInUserService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                var offer = signedInUserService.isGold() ? this.media.offerGold : this.media.offerSilver;
                if (!offer)
                    return WinJS.Promise.wrap([]);
                else if (signInService.isSignedIn)
                    return purchaseHistoryService.getPurchaseHistoryForOfferId(this.media.titleId, offer.offerId).then(function addGameExtraButtons(receipt) {
                            if (this.media.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Xbox)
                                return WinJS.Promise.wrap([]);
                            else if (this.media.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern) {
                                if (metroGamesPurchaseEnabled)
                                    if (this.media.hasPriceInCurrency && this.media.downloadType !== MS.Entertainment.Platform.PurchaseHelpers.AVATAR_TYPE && this.buttons.buyExtra && this.buttons.extraPurchased)
                                        if (receipt) {
                                            var formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).shortDate;
                                            if (this.media.itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable) {
                                                this.buttons.buyExtra.subTitle = String.load(String.id.IDS_DETAILS_EXTRA_LAST_PURCHASE_ON_LABEL).format(offer.displayPrice, formatter.format(receipt.purchaseDate));
                                                buttons.push(this.buttons.buyExtra)
                                            }
                                            else if (this.media.itemTypeQueryString === MS.Entertainment.Data.Query.edsMediaType.metroGameContent) {
                                                this.buttons.extraPurchased.subTitle = String.load(String.id.IDS_DETAILS_EXTRA_PRICE_PURCHASE_ON).format(offer.displayPrice, formatter.format(receipt.purchaseDate));
                                                buttons.push(this.buttons.extraPurchased)
                                            }
                                        }
                                        else {
                                            this.buttons.buyExtra.subTitle = offer.displayPrice;
                                            buttons.push(this.buttons.buyExtra)
                                        }
                                if (this.buttons.gameDetails)
                                    buttons.push(this.buttons.gameDetails)
                            }
                            return WinJS.Promise.wrap(buttons)
                        }.bind(this), function purchaseHistoryFailed() {
                            return WinJS.Promise.wrap([])
                        });
                else {
                    buttons.push(this.buttons.buyExtra);
                    if (this.buttons.gameDetails)
                        buttons.push(this.buttons.gameDetails);
                    return WinJS.Promise.wrap(buttons)
                }
            }, onGameImmersiveDetailsStateChanged: function onGameImmersiveDetailsStateChanged(stateInfo) {
                    if (!this.media.hydrated)
                        return WinJS.Promise.wrap(null);
                    var buttons = [];
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var xbox360GamesPurchaseEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesPurchase);
                    var xbox360GamesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesMarketplace);
                    var xbox360ConsoleRegionsEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360ConsoleRegions);
                    switch (this.media.defaultPlatformType) {
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Modern:
                            if (this.media.supportsCurrentArchitecture)
                                buttons.push(this.buttons.playOnPC);
                            break;
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Xbox:
                            if (xbox360ConsoleRegionsEnabled)
                                buttons.push(this.buttons.playOnXbox);
                            break;
                        case MS.Entertainment.Data.Augmenter.GamePlatform.PC:
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Phone:
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Web:
                            break;
                        default:
                            MS.Entertainment.ViewModels.fail("SmartBuyStateHandlers_onGameImmersiveDetailsStateChanged does not recognize defaultPlatformType");
                            break
                    }
                    return WinJS.Promise.wrap(buttons)
                }, onGameInlineDetailsStateChanged: function onGameInlineDetailsStateChanged(stateInfo) {
                    if (!this.media.hydrated)
                        return WinJS.Promise.wrap(null);
                    var buttons = [];
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var xbox360GamesPurchaseEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesPurchase);
                    var xbox360GamesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesMarketplace);
                    var xbox360ConsoleRegionsEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360ConsoleRegions);
                    var canPlayTrailer = false;
                    if (this.media.trailerUri)
                        if (this.media.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.PC || this.media.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern)
                            canPlayTrailer = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.streamMetroGameTrailers);
                        else if (this.media.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Xbox)
                            canPlayTrailer = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.streamXbox360GameTrailers);
                    switch (this.media.defaultPlatformType) {
                        case MS.Entertainment.Data.Augmenter.GamePlatform.PC:
                            buttons.push(this.buttons.gameDetails);
                            if (canPlayTrailer)
                                buttons.push(this.buttons.playGameTrailer);
                            break;
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Modern:
                            if (this.media.supportsCurrentArchitecture)
                                buttons.push(this.buttons.playOnPC);
                            buttons.push(this.buttons.gameDetails);
                            if (canPlayTrailer)
                                buttons.push(this.buttons.playGameTrailer);
                            break;
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Phone:
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Web:
                            buttons.push(this.buttons.gameDetails);
                            break;
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Xbox:
                            buttons.push(this.buttons.gameDetails);
                            if (xbox360ConsoleRegionsEnabled)
                                buttons.push(this.buttons.playOnXbox);
                            if (canPlayTrailer)
                                buttons.push(this.buttons.playGameTrailer);
                            break;
                        default:
                            MS.Entertainment.ViewModels.fail("SmartBuyStateHandlers_onGameInlineDetailsStateChanged does not recognize defaultPlatformType");
                            break
                    }
                    return WinJS.Promise.wrap(buttons)
                }, _mediaHasAnyRight: function _mediaHasAnyRight(media, tuner, rights) {
                    var possibleRights = MS.Entertainment.ViewModels.SmartBuyStateHandlers._getMatchingRights(media, tuner, rights);
                    return (possibleRights && possibleRights.length > 0)
                }, mediaHasAnyRight: function mediaHasAnyRight(media, tuner, rights) {
                    return MS.Entertainment.ViewModels.SmartBuyStateHandlers._mediaHasAnyRight(media, tuner, rights)
                }, _getMatchingRights: function _getMatchingRights(media, tuner, rights) {
                    if (!media || !media.rights)
                        return null;
                    var possibleRights = [];
                    var nowDate = Date.now();
                    for (var i = 0; i < media.rights.length; i++) {
                        var right = media.rights[i];
                        if (!MS.Entertainment.Utilities.rightSupportsTuner(right, tuner))
                            continue;
                        if (!rights || rights.length === 0) {
                            possibleRights.push(right);
                            continue
                        }
                        var foundRight = false;
                        for (var j = 0; j < rights.length; j++)
                            if (right.licenseRight === rights[j] && (MS.Entertainment.ViewModels.SmartBuyStateHandlers._isValidOffer(right, media.mediaType) || right.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Preview || right.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.PreviewStream || right.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.FreeStream || right.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Subscription || right.licenseRight === MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Stream)) {
                                foundRight = true;
                                break
                            }
                        if (!foundRight)
                            continue;
                        if (right.offer && right.offer.StartDate && right.offer.EndDate)
                            try {
                                var startDate = parseInt(right.offer.StartDate.split("(")[1].split(")")[0]);
                                var endDate = parseInt(right.offer.EndDate.split("(")[1].split(")")[0]);
                                if (startDate > nowDate || nowDate > endDate)
                                    continue
                            }
                            catch(e) {
                                MS.Entertainment.Data.fail("Invalid start or end date specified on media, service id = " + media.serviceId, null, MS.Entertainment.UI.Debug.errorLevel.low)
                            }
                        possibleRights.push(right)
                    }
                    return possibleRights
                }, _isValidOffer: function _isValidOffer(right, mediaType) {
                    var isValidOffer = right && right.offerId;
                    if (isValidOffer && (mediaType === Microsoft.Entertainment.Queries.ObjectType.track || mediaType === Microsoft.Entertainment.Queries.ObjectType.album)) {
                        var paymentTypes = right.paymentInstruments;
                        if (paymentTypes)
                            paymentTypes = Array.isArray(paymentTypes) ? paymentTypes : [paymentTypes];
                        isValidOffer = paymentTypes && paymentTypes.length && paymentTypes.some(function doesOfferSupportPurchaseType(paymentType) {
                            return (paymentType === MS.Entertainment.Data.Augmenter.Marketplace.edsPaymentType.creditCard)
                        })
                    }
                    return isValidOffer
                }, Tuner: {
                    All: MS.Entertainment.Data.Augmenter.Marketplace.edsDeviceType.all, Xbox360: MS.Entertainment.Data.Augmenter.Marketplace.edsDeviceType.xbox360, Windows: MS.Entertainment.Data.Augmenter.Marketplace.edsDeviceType.pc, Zune30: MS.Entertainment.Data.Augmenter.Marketplace.edsDeviceType.zuneDevice, ZuneMobile: MS.Entertainment.Data.Augmenter.Marketplace.edsDeviceType.zuneMobile
                }, MarketplaceRight: {
                    Rent: "Rent", RentStream: "RentStream", Purchase: "Purchase", PurchaseStream: "PurchaseStream", AlbumPurchase: "AlbumPurchase", Preview: "Preview", PreviewStream: "PreviewStream", Download: "Download", FreeStream: "FreeStream", SeasonPurchase: "SeasonPurchase", SeasonPurchaseStream: "SeasonPurchaseStream", Stream: "Stream", Subscription: "Subscription", SubscriptionFree: "SubscriptionFree", TransferToPortableDevice: "TransferToPortableDevice", Trial: "Trial"
                }
        }})
})()
