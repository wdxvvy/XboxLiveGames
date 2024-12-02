/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/Data/factory.js", "/Framework/Data/Augmenters/commonAugmenters.js");
(function(MSE, undefined) {
    var alias = MSE.Data.Property.alias;
    var augment = MSE.Data.Property.augment;
    var convert = MSE.Data.Property.convert;
    var convertNoDeflate = MSE.Data.Property.convertNoDeflate;
    var convertOriginal = MSE.Data.Property.convertOriginal;
    var convertOriginalNoDeflate = MSE.Data.Property.convertOriginalNoDeflate;
    var searchNoDeflate = MSE.Data.Property.searchNoDeflate;
    var list = MSE.Data.Property.list;
    var format = MSE.Data.Property.format;
    var collect = MSE.Data.Property.collect;
    var sortArray = MSE.Data.Property.sortArray;
    var value = MSE.Data.Property.value;
    var hydrated = MSE.Data.Property.hydrated;
    var hydratedRequired = MSE.Data.Property.hydratedRequired;
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Data");
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.Marketplace", {
        edsDate: function edsDate(data) {
            var returnValue = MS.Entertainment.Data.Factory.date(data);
            if (returnValue)
                returnValue = (returnValue.getFullYear() === 2799) ? null : returnValue;
            return returnValue
        }, edsMediaTypeIntegerToString: function edsMediaTypeIntegerToString(integer) {
                var result;
                if (integer in MS.Entertainment.Data.Query.edsMediaTypeIntegerToStringMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeIntegerToStringMappings[integer];
                else
                    MS.Entertainment.Data.fail("Invalid integer. Can not find string media type mapping: " + integer, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsMediaTypeToDatabaseMediaType: function edsMediaTypeToDatabaseMediaType(type) {
                var result;
                if (!isNaN(type))
                    type = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                if (type in MS.Entertainment.Data.Query.edsMediaTypeToDatabaseMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeToDatabaseMappings[type];
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find database media type mapping: " + type, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsMediaTypeFromDatabaseTypes: function edsMediaTypeFromDatabaseTypes(types) {
                types = types || {};
                var databaseMediaType = types.mediaType;
                var subTypeName = MSE.Data.Factory.Library.mediaTypeToSubTypeNameMappings[types.mediaType];
                var subTypeMappings = MS.Entertainment.Data.Query.databaseMediaTypeToSubTypeMappingMappings[types.mediaType];
                if (Array.isArray(subTypeName)) {
                    databaseMediaType = [];
                    subTypeName.forEach(function(key) {
                        databaseMediaType.push(types[key])
                    })
                }
                else if (subTypeName && subTypeMappings)
                    databaseMediaType = types[subTypeName];
                return MSE.Data.Factory.Marketplace.edsMediaTypeFromDatabaseType(databaseMediaType, subTypeMappings)
            }, edsMediaTypeFromDatabaseType: function edsMediaTypeFromDatabaseType(mediaType, mappings) {
                var key;
                var result;
                var mappingValue;
                var match = false;
                var i = 0;
                mappings = mappings || MS.Entertainment.Data.Query.edsMediaTypeToDatabaseMappings;
                if (Array.isArray(mediaType))
                    for (key in mappings) {
                        match = true;
                        mappingValue = mappings[key];
                        for (i = 0; i < mappingValue.length; i++)
                            if (mappingValue[i] !== mediaType[i]) {
                                match = false;
                                break
                            }
                        if (match) {
                            result = key;
                            break
                        }
                    }
                else
                    for (key in mappings)
                        if (mappings[key] === mediaType) {
                            result = key;
                            break
                        }
                return result
            }, edsMediaTypeToVideoType: function edsMediaTypeToVideoType(type) {
                var result;
                if (!isNaN(type))
                    type = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                if (type in MS.Entertainment.Data.Query.edsMediaTypeToVideoTypeMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeToVideoTypeMappings[type];
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find database video type mapping: " + type, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsMediaTypeToGameType: function edsMediaTypeToGameType(type) {
                var result;
                if (!isNaN(type))
                    type = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                if (type in MS.Entertainment.Data.Query.edsMediaTypeToGameTypeMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeToGameTypeMappings[type];
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find database game type mapping: " + type, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsMediaTypeToGameTitleType: function edsMediaTypeToGameTitleType(type) {
                var result;
                if (!isNaN(type))
                    type = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                if (type in MS.Entertainment.Data.Query.edsMediaTypeToGameTitleTypeMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeToGameTitleTypeMappings[type];
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find database game title type mapping: " + type, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsMediaTypeToPersonType: function edsMediaTypeToPersonType(type) {
                var result;
                if (!isNaN(type))
                    type = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                if (type in MS.Entertainment.Data.Query.edsMediaTypeToPersonTypeMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeToPersonTypeMappings[type];
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find database person type mapping: " + type, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsMediaTypeToHcrType: function edsMediaTypeToHcrType(type) {
                var result;
                if (!isNaN(type))
                    type = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                if (type in MS.Entertainment.Data.Query.edsMediaTypeToZuneHcrTypeMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeToZuneHcrTypeMappings[type];
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find hcr type mapping: " + type, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsMediaTypeToContentType: function edsMediaTypeToContentType(type) {
                var result;
                if (!isNaN(type))
                    type = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                if (type in MS.Entertainment.Data.Query.edsMediaTypeToContentTypeMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeToContentTypeMappings[type];
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find content type mapping: " + type, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsMediaTypeToGamePlatformType: function edsMediaTypeToGamePlatformType(type) {
                var result;
                if (!isNaN(type))
                    type = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                if (type in MS.Entertainment.Data.Query.edsMediaTypeToGamePlatformTypeMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeToGamePlatformTypeMappings[type];
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find game platform type mapping: " + type, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsMediaTypeToPurchaseHelperType: function edsMediaTypeToPurchaseHelperType(type) {
                var result;
                if (!isNaN(type))
                    type = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                if (type in MS.Entertainment.Data.Query.edsMediaTypeToPurchaseHelperTypeMappings)
                    result = MS.Entertainment.Data.Query.edsMediaTypeToPurchaseHelperTypeMappings[type];
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find purchase helper type mapping: " + type, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsPaymentTypeIntegerToString: function edsPaymentTypeIntegerToString(integer) {
                var result;
                if (integer in MS.Entertainment.Data.Augmenter.Marketplace.edsPaymentTypeIntegerToStringMappings)
                    result = MS.Entertainment.Data.Augmenter.Marketplace.edsPaymentTypeIntegerToStringMappings[integer];
                else
                    MS.Entertainment.Data.fail("Invalid integer. Can not find string payment type mapping: " + integer, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsRatingToStars: function(data) {
                if (!data)
                    data = 0;
                return data * 5
            }, edsEditorialId: function edsEditorialId(id) {
                id = id.replace(/\//g, "_");
                id = id.replace(/&/g, "!");
                return "xm-" + id
            }, edsServiceIdType: function edsServiceIdType(idHost) {
                var idType;
                if (idHost)
                    if ("ZuneId" in idHost)
                        idType = MS.Entertainment.Data.Query.edsIdType.zuneCatalog;
                    else if ("ID" in idHost || "id" in idHost)
                        idType = MS.Entertainment.Data.Query.edsIdType.canonical;
                return idType
            }, edsServiceIdTypeWithLegacy: function edsServiceIdTypeWithLegacy(idHost) {
                var idType;
                if (idHost)
                    if ("LegacyAmgId" in idHost)
                        idType = MS.Entertainment.Data.Query.edsIdType.zuneCatalog;
                    else
                        idType = MSE.Data.Factory.Marketplace.edsServiceIdType(idHost);
                return idType
            }, edsServiceIdTypeLegacy: function edsServiceIdTypeLegacy() {
                return MS.Entertainment.Data.Query.edsIdType.zuneCatalog
            }, edsRights: function edsRights(providers, providerId, deviceType, offerAugmenter) {
                var result = [];
                var currentDate;
                offerAugmenter = offerAugmenter || MSE.Data.Augmenter.Marketplace.EDSOfferRight;
                if (Array.isArray(providers)) {
                    currentDate = new Date;
                    providers.forEach(function providerItem(provider) {
                        if (provider && Array.isArray(provider.ProviderContents) && (!providerId || provider.ID === providerId) && (!deviceType || provider.DeviceType === deviceType))
                            provider.ProviderContents.forEach(function augmentItem(content) {
                                if (content && Array.isArray(content.OfferInstances))
                                    content.OfferInstances.forEach(function augmentOffer(offer) {
                                        var endDate = MS.Entertainment.Data.Factory.date(offer.EndDate);
                                        if (!endDate || currentDate <= endDate)
                                            result.push(MSE.Data.augment({
                                                provider: provider, content: content, offer: offer
                                            }, offerAugmenter))
                                    })
                            })
                    })
                }
                return result
            }, edsRightsIEBProviders: function edsRightsIEBProviders(providers) {
                return MS.Entertainment.Data.Factory.Marketplace.edsRights(providers)
            }, edsRightsZuneProviders: function edsRightsZuneProviders(providers) {
                return MS.Entertainment.Data.Factory.Marketplace.edsRights(providers, MS.Entertainment.Data.Augmenter.Marketplace.edsProviderId.xboxVideo)
            }, edsRightsCurrentClientProviders: function edsRightsCurrentClientProviders(providers) {
                return MS.Entertainment.Data.Factory.Marketplace.edsRights(providers, null)
            }, edsDeviceTypesValidate: function edsDeviceTypesValidate(deviceTypes) {
                if (!Array.isArray(deviceTypes))
                    deviceTypes = [deviceTypes];
                return deviceTypes
            }, edsPaymentTypesValidate: function edsPaymentTypesValidate(paymentTypeContainer) {
                var result;
                if (paymentTypeContainer) {
                    result = paymentTypeContainer.PaymentTypes;
                    if (Array.isArray(result));
                    else if (paymentTypeContainer.DistributionRight === MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.purchase || paymentTypeContainer.DistributionRight === MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.purchaseToOwn || paymentTypeContainer.DistributionRight === MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.rent)
                        result = [MS.Entertainment.Data.Augmenter.Marketplace.edsPaymentType.creditCard]
                }
                return result || []
            }, edsResolutionFormatValidate: function edsResolutionFormatValidate(resolutionFormat) {
                return resolutionFormat
            }, edsFriendlyResolutionFormatValidate: function edsFriendlyResolutionFormatValidate(resolutionFormat) {
                resolutionFormat = MSE.Data.Factory.Marketplace.edsResolutionFormatValidate(resolutionFormat);
                if (resolutionFormat === MS.Entertainment.Data.Augmenter.Marketplace.edsResolutionFormat.hd1080p)
                    resolutionFormat = MS.Entertainment.Data.Augmenter.Marketplace.edsResolutionFormat.hd;
                return resolutionFormat
            }, edsAudioEncodingValidate: function edsAudioEncodingValidate(audioEncoding) {
                return audioEncoding
            }, edsConvertToRightType: function edsConvertToRightType(distributionRight, mappings) {
                var result = distributionRight;
                mappings = mappings || MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRightToRightTypeMappings;
                if (distributionRight in mappings)
                    result = mappings[distributionRight] || distributionRight;
                else
                    MS.Entertainment.Data.fail("Invalid type. Can not find license right type mapping for distribution right. " + distributionRight, null, MS.Entertainment.UI.Debug.errorLevel.low);
                return result
            }, edsConvertToSeasonRightType: function edsConvertToSeasonRightType(distributionRight) {
                return MS.Entertainment.Data.Factory.Marketplace.edsConvertToRightType(distributionRight, MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRightToSeasonRightTypeMappings)
            }, edsSetImpressionGuid: function edsSetImpressionGuid(values) {
                var result = null;
                var impressionGuid = null;
                if (values && values.length >= 2) {
                    impressionGuid = values[0];
                    result = values[1]
                }
                if (result && impressionGuid)
                    result.impressionGuid = impressionGuid;
                return result
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Augmenter.Marketplace", {
        edsImagePurpose: {
            background: "Background", backLText: "BackLText", backRText: "BackRText", boxArt: "BoxArt", cover: "Cover", foreground: "Foreground", icon: "Icon", image: "Image", hero: "Hero", logo: "Logo", mobile: "Mobile", nowPlaying: "NowPlaying", pcBackground: "PCBackground", pcLogo: "PCLogo", sideStage: "SideStage", sellImage: "SellImage", subHero: "SubHero", superHero: "SuperHero", thumbnail: "Thumbnail", weRecommend: "WeRecommend", wideBackground: "WideBackgroundImage", xboxBackground: "XboxBackground"
        }, edsProviderId: {
                cinemaNow: "0x333207D1", vudu: "0x325a07d1", xfinity: "0x473007D1", xboxVideo: "XboxVideo", zune: "0x5848085B"
            }, edsDeviceType: {
                all: "All", pc: "WindowsPC", xblWinClient: "XblWinClient", xbox360: "Xbox360", zuneDevice: "Zune3.0", zuneMobile: "ZuneMobile"
            }, edsResolutionFormat: {
                hd: "HD", hd1080p: "HD1080p", sd: "SD", xd: "XD"
            }, edsAudioEncoding: {
                mp3: "MP3", wma: "WMA", na: "NA"
            }, edsDistributionRight: {
                adSupported: "AdSupported", albumOnlyPurchase: "AlbumOnlyPurchase", albumPurchase: "AlbumPurchase", free: "Free", freeStream: "FreeStream", freeWithAds: "FreeWithAds", freeWithSubscription: "FreeWithSubscription", groupMediaPurchaseToOwn: "GroupMediaPurchaseToOwn", payPerView: "PayPerView", preview: "Preview", purchase: "Purchase", purchaseStream: "PurchaseStream", purchaseToOwn: "PurchaseToOwn", rent: "Rent", rentStream: "RentStream", seasonPurchase: "SeasonPurchase", seasonPurchaseStream: "SeasonPurchaseStream", stream: "Stream", subscription: "Subscription", subscriptionFree: "SubscriptionFree", trackAvailable: "TrackAvailable", trial: "Trial"
            }, edsPaymentType: {
                creditCard: "Credit Card", currency: "Currency", mobileOperator: "Mobile Operator", points: "Microsoft Points"
            }, edsCriticReviewSourceType: {
                metaCritic: "Metacritic", rottenTomatoes: "Rotten Tomatoes", rovi: "Rovi"
            }, edsContributorRole: {
                director: "Director", actor: "Actor", writer: "Writer"
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Augmenter.Marketplace", {
        edsImagePurposeToRankMappings: (function() {
            var mappings = {};
            mappings[MSE.Data.Augmenter.Marketplace.edsImagePurpose.pcBackground] = 5;
            mappings[MSE.Data.Augmenter.Marketplace.edsImagePurpose.background] = 4;
            mappings[MSE.Data.Augmenter.Marketplace.edsImagePurpose.wideBackground] = 3;
            mappings[MSE.Data.Augmenter.Marketplace.edsImagePurpose.pcLogo] = 2;
            mappings[MSE.Data.Augmenter.Marketplace.edsImagePurpose.logo] = 1;
            return mappings
        })(), edsGameExtraImagePurposeToRankMappings: (function() {
                var mappings = {};
                mappings[MSE.Data.Augmenter.Marketplace.edsImagePurpose.image] = 3;
                mappings[MSE.Data.Augmenter.Marketplace.edsImagePurpose.thumbnail] = 2;
                mappings[MSE.Data.Augmenter.Marketplace.edsImagePurpose.boxArt] = 1;
                return mappings
            })(), edsDistributionRightToRightTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.adSupported] = null;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.albumOnlyPurchase] = null;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.albumPurchase] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.albumPurchase;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.free] = null;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.freeStream] = null;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.freeWithAds] = null;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.freeWithSubscription] = null;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.payPerView] = null;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.groupMediaPurchaseToOwn] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.seasonPurchase;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.preview] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.preview;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.purchase] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.purchase;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.purchaseStream] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.purchaseStream;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.purchaseToOwn] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.purchase;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.rent] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.rent;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.rentStream] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.rentStream;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.seasonPurchase] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.seasonPurchase;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.seasonPurchaseStream] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.seasonPurchaseStream;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.stream] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.stream;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.subscription] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.subscription;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.subscriptionFree] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.subscriptionFree;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.trial] = null;
                return mapping
            })(), edsDistributionRightToAlbumRightTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.freeStream] = null;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.preview] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.preview;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.purchase] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.albumPurchase;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.purchaseToOwn] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.albumPurchase;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.stream] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.stream;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.subscription] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.subscription;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.subscriptionFree] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.subscriptionFree;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.trackAvailable] = null;
                return mapping
            })(), edsDistributionRightToSeasonRightTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.preview] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.preview;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.purchase] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.seasonPurchase;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.purchaseToOwn] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.seasonPurchase;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.rent] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.rent;
                mapping[MS.Entertainment.Data.Augmenter.Marketplace.edsDistributionRight.stream] = MS.Entertainment.Data.Augmenter.Marketplace.RightType.stream;
                return mapping
            })(), edsPaymentTypeIntegerToStringMappings: {
                1: MS.Entertainment.Data.Augmenter.Marketplace.edsPaymentType.points, 3: MS.Entertainment.Data.Augmenter.Marketplace.edsPaymentType.currency
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Comparer.Marketplace", {
        edsCompareImage: function edsCompareImage(image1, image2) {
            var result;
            if (image1 === image2)
                result = 0;
            else if (!image2)
                result = -1;
            else if (!image1)
                result = 1;
            else {
                var biggestSize1 = (image1.Width > image1.Height) ? image1.Width : image1.Height;
                var biggestSize2 = (image2.Width > image2.Height) ? image2.Width : image2.Height;
                biggestSize1 = isNaN(biggestSize1) ? 0 : biggestSize1;
                biggestSize2 = isNaN(biggestSize1) ? 0 : biggestSize2;
                if (biggestSize1 > biggestSize2)
                    result = -1;
                else if (biggestSize1 < biggestSize2)
                    result = 1;
                else if (image1.Order < image2.Order)
                    result = -1;
                else if (image1.Order > image2.Order)
                    result = 1;
                else
                    result = 0
            }
            return result
        }, edsCompareImageByPurposeThenSize: function edsCompareImageByPurposeThenSize(image1, image2, rankings) {
                var selectBestPurposeRank = function selectBestPurposeRank(purposes, rankings) {
                        var bestPurpose = -1;
                        if (purposes && rankings)
                            for (var i = 0; i < purposes.length; i++) {
                                var rank = rankings[purposes[i]] || -1;
                                if (rank > bestPurpose)
                                    bestPurpose = rank
                            }
                        return bestPurpose
                    };
                var result;
                if (image1 === image2)
                    result = 0;
                else if (!image2)
                    result = -1;
                else if (!image1)
                    result = 1;
                else {
                    var biggestSize1 = (image1.Width > image1.Height) ? image1.Width : image1.Height;
                    var biggestSize2 = (image2.Width > image2.Height) ? image2.Width : image2.Height;
                    biggestSize1 = isNaN(biggestSize1) ? 0 : biggestSize1;
                    biggestSize2 = isNaN(biggestSize1) ? 0 : biggestSize2;
                    var purpose1 = selectBestPurposeRank(image1.Purposes, rankings);
                    var purpose2 = selectBestPurposeRank(image2.Purposes, rankings);
                    if (purpose1 > purpose2)
                        result = -1;
                    else if (purpose1 < purpose2)
                        result = 1;
                    else if (biggestSize1 > biggestSize2)
                        result = -1;
                    else if (biggestSize1 < biggestSize2)
                        result = 1;
                    else if (image1.Order < image2.Order)
                        result = -1;
                    else if (image1.Order > image2.Order)
                        result = 1;
                    else
                        result = 0
                }
                return result
            }, edsCompareImageByVideoPurpose: function edsCompareImageByVideoPurpose(image1, image2) {
                return MSE.Data.Comparer.Marketplace.edsCompareImageByPurposeThenSize(image1, image2, MS.Entertainment.Data.Augmenter.Marketplace.edsImagePurposeToRankMappings)
            }, edsCompareImageByGameExtraPurpose: function edsCompareImageByGameExtraPurpose(image1, image2) {
                return MSE.Data.Comparer.Marketplace.edsCompareImageByPurposeThenSize(image1, image2, MS.Entertainment.Data.Augmenter.Marketplace.edsGameExtraImagePurposeToRankMappings)
            }, edsCompareImagePurposeOnly: function edsCompareImagePurposeOnly(image1, image2) {
                var result;
                if (image1 === image2)
                    result = 0;
                else if (!image2)
                    result = -1;
                else if (!image1)
                    result = 1;
                else {
                    var image1rank = MS.Entertainment.Data.Augmenter.Marketplace.edsImagePurposeToRankMappings[image1.Purpose] || -1;
                    var image2rank = MS.Entertainment.Data.Augmenter.Marketplace.edsImagePurposeToRankMappings[image2.Purpose] || -1;
                    if (image1rank > image2rank)
                        result = -1;
                    else if (image1rank < image2rank)
                        result = 1;
                    else
                        result = 0
                }
                return result
            }, edsCompareImageRankOnly: function edsCompareImageRankOnly(image1, image2) {
                var result;
                if (image1 === image2)
                    result = 0;
                else if (!image2)
                    result = -1;
                else if (!image1)
                    result = 1;
                else if (image1.Order < image2.Order)
                    result = -1;
                else if (image1.Order > image2.Order)
                    result = 1;
                else
                    result = 0;
                return result
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Filter.Marketplace", {edsCreateImageFilter: function edsCreateImageFilter(imagePurpose, filterImagePurpose, minWidth, minHeight, maxWidth, maxHeight, minAspectRatio, maxAspectRatio) {
            if (imagePurpose && !Array.isArray(imagePurpose))
                imagePurpose = [imagePurpose];
            if (filterImagePurpose && !Array.isArray(filterImagePurpose))
                filterImagePurpose = [filterImagePurpose];
            return function edsImageFilter(image) {
                    var filter = true;
                    var i;
                    var aspectRatio;
                    var currentImagePurpose = imagePurpose;
                    if ((minAspectRatio || maxAspectRatio) && (image && image.Width && image.Height))
                        aspectRatio = image.Width / image.Height;
                    if (image && (isNaN(minWidth) || minWidth === null || image.Width >= minWidth) && (isNaN(minHeight) || minHeight === null || image.Height >= minHeight) && (isNaN(maxWidth) || maxWidth === null || image.Width <= maxWidth) && (isNaN(maxHeight) || maxHeight === null || image.Height <= maxHeight) && (!minAspectRatio || !aspectRatio || aspectRatio >= minAspectRatio) && (!maxAspectRatio || !aspectRatio || aspectRatio <= maxAspectRatio))
                        filter = false;
                    if (!filter && image.Purposes) {
                        filter = currentImagePurpose && currentImagePurpose.length ? true : false;
                        for (i = 0; i < image.Purposes.length; i++)
                            if (filterImagePurpose && filterImagePurpose.indexOf(image.Purposes[i]) >= 0) {
                                filter = true;
                                break
                            }
                            else if (currentImagePurpose && currentImagePurpose.indexOf(image.Purposes[i]) >= 0) {
                                filter = false;
                                currentImagePurpose = null;
                                if (!filterImagePurpose)
                                    break
                            }
                    }
                    return filter
                }
        }});
    WinJS.Namespace.defineWithParent(MSE, "Data.Filter.Marketplace", {
        edsFilterNonThumbnails: MSE.Data.Filter.Marketplace.edsCreateImageFilter([MSE.Data.Augmenter.Marketplace.edsImagePurpose.thumbnail], [MSE.Data.Augmenter.Marketplace.edsImagePurpose.background]), edsFilterNonStaticBackgrounds: MSE.Data.Filter.Marketplace.edsCreateImageFilter([MSE.Data.Augmenter.Marketplace.edsImagePurpose.background, MSE.Data.Augmenter.Marketplace.edsImagePurpose.thumbnail, MSE.Data.Augmenter.Marketplace.edsImagePurpose.pcBackground, MSE.Data.Augmenter.Marketplace.edsImagePurpose.wideBackground], [MSE.Data.Augmenter.Marketplace.edsImagePurpose.backLText, MSE.Data.Augmenter.Marketplace.edsImagePurpose.backRText], 240), edsFilterNonNowPlayingBackgrounds: MSE.Data.Filter.Marketplace.edsCreateImageFilter([MSE.Data.Augmenter.Marketplace.edsImagePurpose.foreground, MSE.Data.Augmenter.Marketplace.edsImagePurpose.background, MSE.Data.Augmenter.Marketplace.edsImagePurpose.pcBackground, MSE.Data.Augmenter.Marketplace.edsImagePurpose.wideBackground], [MSE.Data.Augmenter.Marketplace.edsImagePurpose.backLText, MSE.Data.Augmenter.Marketplace.edsImagePurpose.backRText], 500, 500), edsFilterNonCoversNonThumbnails: MSE.Data.Filter.Marketplace.edsCreateImageFilter([MSE.Data.Augmenter.Marketplace.edsImagePurpose.thumbnail, MSE.Data.Augmenter.Marketplace.edsImagePurpose.boxArt, MSE.Data.Augmenter.Marketplace.edsImagePurpose.cover], [MSE.Data.Augmenter.Marketplace.edsImagePurpose.background], null, null, null, null, null, 1), edsFilterNonCoversNonThumbnailsWideOrTall: MSE.Data.Filter.Marketplace.edsCreateImageFilter([MSE.Data.Augmenter.Marketplace.edsImagePurpose.thumbnail, MSE.Data.Augmenter.Marketplace.edsImagePurpose.boxArt, MSE.Data.Augmenter.Marketplace.edsImagePurpose.cover], [MSE.Data.Augmenter.Marketplace.edsImagePurpose.backLText, MSE.Data.Augmenter.Marketplace.edsImagePurpose.backRText]), edsFilterNonLogos: MSE.Data.Filter.Marketplace.edsCreateImageFilter([MSE.Data.Augmenter.Marketplace.edsImagePurpose.pcLogo, MSE.Data.Augmenter.Marketplace.edsImagePurpose.logo]), edsFilterNonSquareIcons: MSE.Data.Filter.Marketplace.edsCreateImageFilter(MSE.Data.Augmenter.Marketplace.edsImagePurpose.icon, null, null, null, null, null, 1, 1), edsFilterNonWideIcons: MSE.Data.Filter.Marketplace.edsCreateImageFilter(MSE.Data.Augmenter.Marketplace.edsImagePurpose.icon, null, null, null, null, null, 2, 2), edsFilterGameExtraImage: MSE.Data.Filter.Marketplace.edsCreateImageFilter([MSE.Data.Augmenter.Marketplace.edsImagePurpose.image, MSE.Data.Augmenter.Marketplace.edsImagePurpose.thumbnail, MSE.Data.Augmenter.Marketplace.edsImagePurpose.boxArt], null, 100, 100), edsFilterGameBoxArt: MSE.Data.Filter.Marketplace.edsCreateImageFilter(MSE.Data.Augmenter.Marketplace.edsImagePurpose.boxArt, null, 219, 300, 219, 300)
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        PartnerApplicationLaunchInfoEDS: MSE.Data.define(null, {
            deepLinkInfo: alias("DeepLinkInfo", String.empty), consoleTitleId: alias("TitleId", String.empty), clientType: alias("ClientType", String.empty)
        }), SearchTermEDS: MSE.Data.define(null, {
                mediaGroup: alias("MediaGroup", String.empty), value: alias("Value", String.empty)
            }), ImageEDS: MSE.Data.define(null, {}), ProviderContent: MSE.Data.define(null, {
                device: alias("Device", String.empty), imageUri: alias("Image.Url", String.empty)
            }), EDSGenre: MSE.Data.define(null, {
                name: alias("Name", String.empty), serviceId: alias("Name", String.empty), mediaType: Microsoft.Entertainment.Queries.ObjectType.genre
            }), EDSImage: MSE.Data.define(null, {
                width: alias("Width", 0), height: alias("Height", 0), purpose: alias("Purpose", 0), url: alias(["ResizeUrl", "Url"], null), resizeUrl: alias("ResizeUrl", null)
            }), EDSOffer: MSE.Data.define(null, {
                offerId: alias("OfferId", 0), price: alias("Price", 0), displayPrice: alias("DisplayPrice", String.empty), paymentType: convert("PaymentType", MSE.Data.Factory.Marketplace.edsPaymentTypeIntegerToString, String.empty)
            }), EDSDetailsResult: MSE.Data.define(null, {
                item: null, impressionGuid: convert("ImpressionGuid", MSE.Data.Factory.guid, String.empty)
            }), EDSBrowseResult: MSE.Data.define(null, {
                items: null, total: alias("Totals[0].Count", 0), impressionGuid: convert("ImpressionGuid", MSE.Data.Factory.guid, String.empty)
            }), EDSOfferRight: MSE.Data.define(null, {
                mediaInstanceId: convert("content.MediaInstanceID", MSE.Data.Factory.guid, String.empty), offerId: convert("offer.OfferId", MSE.Data.Factory.guid, String.empty), fulfillmentTicket: alias("offer.FulfillmentTicket", String.empty), fulfillmentTicketExpirationDate: alias("offer.Expiration", String.empty), licenseRight: convert("offer.DistributionRight", MSE.Data.Factory.Marketplace.edsConvertToRightType, String.empty), videoDefinition: convert("content.VideoAttributes.ResolutionFormat", MSE.Data.Factory.Marketplace.edsResolutionFormatValidate, String.empty), videoFriendlyDefinition: convert("content.VideoAttributes.ResolutionFormat", MSE.Data.Factory.Marketplace.edsFriendlyResolutionFormatValidate, String.empty), encoding: convert("content.AudioAttributes.Encoding", MSE.Data.Factory.Marketplace.edsAudioEncodingValidate, String.empty), videoFileUrl: alias("content.Url", String.empty), clientTypes: convert("provider.DeviceType", MSE.Data.Factory.Marketplace.edsDeviceTypesValidate, MSE.Data.Factory.array), paymentInstruments: convert("offer", MSE.Data.Factory.Marketplace.edsPaymentTypesValidate, MSE.Data.Factory.array), price: alias("offer.Price", 0), priceCurrencyCode: alias("offer.CurrencyCode", null)
            }), EDSCriticReview: MSE.Data.define(null, {
                criticName: alias("Critic", String.empty), criticText: alias("CriticText", String.empty), date: convert("Date", MSE.Data.Factory.date, MSE.Data.Factory.dateNow), publication: alias("Publication", String.empty), publicationUrl: alias("PublicationUrl", String.empty), scoreDescription: alias("ScoreDescription", String.empty)
            }), BBXAutoSuggestItem: MSE.Data.define(null, {
                isSuggestion: true, name: alias("Txt", String.empty)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {EDSReviewSource: MSE.Data.define(null, {
            name: alias("Name", String.empty), reviewScore: convert("ReviewScore", MSE.Data.Factory.intNumber, -1), reviewScoreCount: convert("ReviewScoreCount", MSE.Data.Factory.intNumber, -1), url: alias("Url", String.empty), criticReviews: augment("CriticReviews", MSE.Data.Augmenter.Marketplace.EDSCriticReview, [])
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {EDSMediaItem: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MediaItem, null, {
            serviceId: convert(["ZuneId", "ID", "id"], MSE.Data.Factory.guid, MS.Entertainment.Utilities.EMPTY_GUID), serviceIdType: convert(String.empty, MSE.Data.Factory.Marketplace.edsServiceIdType, null), zuneId: hydrated(convert("ZuneId", MSE.Data.Factory.guid, MS.Entertainment.Utilities.EMPTY_GUID)), canonicalId: hydrated(convert(["ID", "id"], MSE.Data.Factory.guid, MS.Entertainment.Utilities.EMPTY_GUID)), libraryId: hydrated(alias("libraryId", -1)), edsMediaGroup: alias("MediaGroup", null), edsMediaItemType: alias("MediaItemType", null), edsMediaItemTypeString: convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString, String.empty), name: hydratedRequired(convertOriginal(["Name", "name"], MSE.Data.Factory.normalizeTextDirection, String.empty)), title: hydratedRequired(convertOriginal(["Name", "name"], MSE.Data.Factory.normalizeTextDirection, String.empty)), images: hydrated(sortArray("Images", MSE.Data.Comparer.Marketplace.edsCompareImage, MSE.Data.Augmenter.Marketplace.EDSImage, MSE.Data.Factory.array)), primaryImage: searchNoDeflate("images", MSE.Data.Filter.Marketplace.edsFilterNonCoversNonThumbnails, null), backgroundImage: searchNoDeflate("images", MSE.Data.Filter.Marketplace.edsFilterNonStaticBackgrounds, null), imageUri: hydrated(convertNoDeflate("primaryImage.url", MSE.Data.Factory.self, null)), imageResizeUri: hydrated(convertNoDeflate("primaryImage.resizeUrl", MSE.Data.Factory.self, null)), primaryImageUri: hydrated(convertNoDeflate("primaryImage.url", MSE.Data.Factory.self, null)), backgroundImageUri: hydrated(convertNoDeflate("backgroundImage.url", MSE.Data.Factory.self, null)), backgroundImageResizeUri: convertNoDeflate("backgroundImage.resizeUrl", MSE.Data.Factory.self, null), rights: hydrated(convert("Providers", MSE.Data.Factory.Marketplace.edsRightsIEBProviders, null)), hasEDSMediaItemType: convert("MediaItemType", MSE.Data.Factory.bool, false), isValid: {get: function() {
                        var hasId = this.hasServiceId || this.inCollection || this.hasCanonicalId;
                        var expectedEDSMediaType = MSE.Data.Factory.Marketplace.edsMediaTypeFromDatabaseTypes(this);
                        return hasId && this.hasEDSMediaItemType && expectedEDSMediaType === this.edsMediaItemTypeString
                    }}
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        EDSGenericItem: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSMediaItem, null, {
            mediaType: convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeToDatabaseMediaType, null), personType: convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeToPersonType, null), videoType: convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeToVideoType, null), type: convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeToHcrType, null), contentType: convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeToContentType, null)
        }), ProviderEDS: MSE.Data.define(null, {
                titleId: alias("ID", String.empty), name: alias("Name", String.empty), imageUri: alias("Image.Url", String.empty), partnerApplicationLaunchInfoList: augment("PartnerApplicationLaunchInfos.PartnerApplicationLaunchInfo", MSE.Data.Augmenter.Marketplace.PartnerApplicationLaunchInfoEDS, null), providerContents: augment("ProviderContents.ProviderContent", MSE.Data.Augmenter.Marketplace.ProviderContent, null)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {GenreEDS: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MediaItem, null, {
            name: alias("Name", String.empty), mediaType: Microsoft.Entertainment.Queries.ObjectType.genre
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        SearchTermsResultEDS: MSE.Data.define(null, {items: augment("SearchTerms", MSE.Data.Augmenter.Marketplace.SearchTermEDS, MSE.Data.Factory.array)}), EDSSearchResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {
                items: list("Items", MSE.Data.Augmenter.Marketplace.EDSGenericItem, null), total: alias("Totals[0].Count", 0)
            }), EDSGenericResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {
                item: augment("Items[0]", MSE.Data.Augmenter.Marketplace.EDSGenericItem, null), total: alias("Totals[0].Count", 0)
            }), BBXAutoSuggestResult: MSE.Data.define(null, {
                items: list("AS.Results[0].Suggests", MSE.Data.Augmenter.Marketplace.BBXAutoSuggestItem, null), itemsArray: augment("AS.Results[0].Suggests", MSE.Data.Augmenter.Marketplace.BBXAutoSuggestItem, MSE.Data.Factory.array), total: alias("AS.Results[0].Suggests.length", 0)
            })
    })
})(MS.Entertainment)
