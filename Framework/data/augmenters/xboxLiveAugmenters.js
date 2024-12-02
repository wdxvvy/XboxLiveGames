/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/factory.js", "/Framework/Data/Augmenters/commonAugmenters.js");
(function(MSE, undefined) {
    "use strict";
    var alias = MSE.Data.Property.alias;
    var augment = MSE.Data.Property.augment;
    var augmentNoDeflate = MSE.Data.Property.augmentNoDeflate;
    var convert = MSE.Data.Property.convert;
    var convertNoDeflate = MSE.Data.Property.convertNoDeflate;
    var convertOriginal = MSE.Data.Property.convertOriginal;
    var convertOriginalNoDeflate = MSE.Data.Property.convertOriginalNoDeflate;
    var search = MSE.Data.Property.search;
    var searchNoDeflate = MSE.Data.Property.searchNoDeflate;
    var list = MSE.Data.Property.list;
    var format = MSE.Data.Property.format;
    var collect = MSE.Data.Property.collect;
    var union = MSE.Data.Property.union;
    var sortArray = MSE.Data.Property.sortArray;
    var value = MSE.Data.Property.value;
    var hydrated = MSE.Data.Property.hydrated;
    var hydratedRequired = MSE.Data.Property.hydratedRequired;
    var hydratedIfAvailable = MSE.Data.Property.hydratedIfAvailable;
    var xboxCatalogIdPrefix = "66acd000-77fe-1000-9115-d802";
    var classicWindowsCatalogIdPrefix = "66acd000-77fe-1000-9115-d804";
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        SocialDataType: {
            leaderBoard: "leaderBoard", profile: "profile", gamercard: "gamercard", achievement: "achievement", activity: "activity"
        }, TitleType: (function loadTitleType() {
                if (Microsoft.Xbox && Microsoft.Xbox.TitleType)
                    return Microsoft.Xbox.TitleType;
                else
                    return {
                            application: "application", arcade: "arcade", demo: "demo", standard: "standard", system: "system"
                        }
            })(), PlatformType: (function loadPlatformType() {
                if (Microsoft.Xbox && Microsoft.Xbox.TitleType)
                    return Microsoft.Xbox.PlatformType;
                else
                    return {
                            mobile: "mobile", windowsPC: "windowsPC", webGames: "webGames", xbox360: "xbox360", xboxLIVEOnWindows: "xboxLIVEOnWindows"
                        }
            })(), MultiplayerMessageType: (function loadMultiplayerMessageType() {
                if (Microsoft.Xbox && Microsoft.Xbox.TitleType)
                    return Microsoft.Xbox.MultiplayerMessageType;
                else
                    return {
                            invitation: "invitation", nudge: "nudge", gameOver: "gameOver", gameTie: "gameTie", youLose: "youLose", yourTurn: "yourTurn", youWin: "youWin"
                        }
            })(), UserRelation: (function loadUserRelation() {
                if (Microsoft && Microsoft.Xbox && Microsoft.Xbox.UserRelation)
                    return {
                            userRelationNone: Microsoft.Xbox.UserRelation.none, userRelationAnyFriend: Microsoft.Xbox.UserRelation.anyFriend, userRelationFriendRequestee: Microsoft.Xbox.UserRelation.friendRequestee, userRelationFriendRequester: Microsoft.Xbox.UserRelation.friendRequester, userRelationMutualFriend: Microsoft.Xbox.UserRelation.mutualFriend
                        };
                else
                    return {
                            userRelationNone: "userRelationNone", userRelationAnyFriend: "userRelationAnyFriend", userRelationFriendRequestee: "userRelationFriendRequestee", userRelationFriendRequester: "userRelationFriendRequester", userRelationMutualFriend: "userRelationMutualFriend"
                        }
            })()
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.Marketplace", {
        xboxSubscriptionLevel: {
            gold: "gold", silver: "silver"
        }, gameCapabilitiesString: {
                offlinePlayersMinMax: "offlinePlayersMinMax", offlineCoopPlayersMinMax: "offlineCoopPlayersMinMax", offlineCoopHardDriveRequired: "offlineCoopHardDriveRequired", offlineSystemLinkMinMax: "offlineSystemLinkMinMax", offlineVoiceCommands: "offlineVoiceCommands", offlinePeripheralWheel: "offlinePeripheralWheel", offlinePeripheralGamePad: "offlinePeripheralGamePad", offlinePeripheralArcadeStick: "offlinePeripheralArcadeStick", offlinePeripheralFlightStick: "offlinePeripheralFlightStick", offlinePeripheralDancePad: "offlinePeripheralDancePad", offlinePeripheralForceFeedbackWheel: "offlinePeripheralForceFeedbackWheel", offlinePeripheralCamera: "offlinePeripheralCamera", offlineCustomSoundtracks: "offlineCustomSoundtracks", offlineDolbyDigital: "offlineDolbyDigital", onlinePlayersMinMax: "onlinePlayersMinMax", onlineMultiplayerHardDriveRequired: "onlineMultiplayerHardDriveRequired", onlineCoopPlayersMinMax: "onlineCoopPlayersMinMax", onlineCoopHardDriveRequired: "onlineCoopHardDriveRequired", onlineHardDriveRequired: "onlineHardDriveRequired", onlineContentDownload: "onlineContentDownload", onlineLeaderboards: "onlineLeaderboards", onlineSpectatorMode: "onlineSpectatorMode", onlineVoice: "onlineVoice", onlineOnly: "onlineOnly", supportedArchitectureX86: "supportedArchitectureX86", supportedArchitectureX64: "supportedArchitectureX64", supportedArchitectureARM: "supportedArchitectureARM"
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.Marketplace", {
        gameExtraTypeString: function gameExtraTypeString(mediaItemType) {
            var downloadType = MSE.Data.Factory.Marketplace.edsMediaTypeToPurchaseHelperType(mediaItemType);
            switch (downloadType) {
                case MS.Entertainment.Platform.PurchaseHelpers.AVATAR_TYPE:
                    return String.load(String.id.IDS_DETAILS_GAME_EXTRAS_TYPE_AVATARS);
                    break;
                case MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE:
                    return String.load(String.id.IDS_DETAILS_GAME_EXTRAS_TYPE_ADDON);
                    break;
                case MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE:
                    return String.load(String.id.IDS_DETAILS_GAME_EXTRAS_TYPE_DEMO);
                    break;
                case MS.Entertainment.Platform.PurchaseHelpers.GAME_VIDEO_TYPE:
                    return String.load(String.id.IDS_DETAILS_GAME_EXTRAS_TYPE_VIDEO);
                    break;
                case MS.Entertainment.Platform.PurchaseHelpers.GAMER_PICTURE_TYPE:
                    return String.load(String.id.IDS_DETAILS_GAME_EXTRAS_TYPE_PICTURE);
                    break;
                case MS.Entertainment.Platform.PurchaseHelpers.GAME_THEME_TYPE:
                    return String.load(String.id.IDS_DETAILS_GAME_EXTRAS_TYPE_THEME);
                    break;
                case MS.Entertainment.Platform.PurchaseHelpers.GAME_TYPE:
                    return String.load(String.id.IDS_DETAILS_GAME_EXTRAS_TYPE_GAME);
                    break
            }
            return String.empty
        }, edsGameExtraType: function edsGameExtraType(mediaItemType) {
                switch (mediaItemType) {
                    case MS.Entertainment.Platform.PurchaseHelpers.METRO_AVATAR_ITEM_ID:
                        return MS.Entertainment.Platform.PurchaseHelpers.AVATAR_TYPE;
                        break;
                    case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_CONTENT_ID:
                    case MS.Entertainment.Platform.PurchaseHelpers.METRO_GAME_CONTENT_ID:
                    case MS.Entertainment.Platform.PurchaseHelpers.METRO_GAME_CONSUMABLE_ID:
                        return MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE;
                        break;
                    case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_ID:
                        return MS.Entertainment.Platform.PurchaseHelpers.GAME_TYPE;
                        break;
                    case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_TRIAL_ID:
                    case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_DEMO_ID:
                        return MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE;
                        break;
                    case MS.Entertainment.Platform.PurchaseHelpers.XBOX_THEME_ID:
                        return MS.Entertainment.Platform.PurchaseHelpers.GAME_THEME_TYPE;
                        break;
                    case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAMER_TILE_ID:
                        return MS.Entertainment.Platform.PurchaseHelpers.GAMER_PICTURE_TYPE;
                        break;
                    case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_VIDEO_ID:
                        return MS.Entertainment.Platform.PurchaseHelpers.GAME_VIDEO_TYPE;
                        break
                }
                return null
            }, edsItemTypeQueryString: function edsItemTypeQueryString(type) {
                var result;
                if (!isNaN(type))
                    result = MSE.Data.Factory.Marketplace.edsMediaTypeIntegerToString(type);
                return result
            }, defaultGameWebDetailsUri: function defaultGameWebDetailsUri(data) {
                var result = null;
                if (!data)
                    return result;
                switch (data.defaultPlatformType) {
                    case MSE.Data.Augmenter.GamePlatform.Modern:
                        break;
                    default:
                        result = MSE.Data.Factory.Common.xboxGameWebDetailsUriFromTitleId(data.titleId);
                        break
                }
                return result
            }, metroGameWebDetailsUriFromId: function metroGameWebDetailsUriFromId(capabilities) {
                var url = null;
                if (capabilities) {
                    var guid = null;
                    for (var i = 0; i < capabilities.length && !guid; i++) {
                        var capability = capabilities[i];
                        if (capability.NonLocalizedName === "externalProductGuid")
                            guid = capability.Value
                    }
                    if (guid)
                        url = MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_WindowsAppMarketplace, guid.toString())
                }
                return url
            }, isOnlineFeature: function isOnlineFeature(capability) {
                var onlineTestExpression = /^online/;
                if (capability && capability.NonLocalizedName)
                    return onlineTestExpression.test(capability.NonLocalizedName);
                else
                    return false
            }, isCoopFeature: function isCoopFeature(capability) {
                var coopTestExpression = /Coop/;
                if (capability && capability.NonLocalizedName)
                    return coopTestExpression.test(capability.NonLocalizedName);
                else
                    return false
            }, isMaxPlayersFeature: function isMaxPlayersFeature(capability) {
                var maxPlayersTestExpression = /(Players|player)Max$/;
                if (capability && capability.NonLocalizedName)
                    return maxPlayersTestExpression.test(capability.NonLocalizedName);
                else
                    return false
            }, isMinPlayersFeature: function isMinPlayersFeature(capability) {
                var minPlayersTestExpression = /(Players|player)Min$/;
                if (capability && capability.NonLocalizedName)
                    return minPlayersTestExpression.test(capability.NonLocalizedName);
                else
                    return false
            }, isMaxSystemLinkFeature: function isMaxSystemLinkFeature(capability) {
                var maxPlayersTestExpression = /SystemLinkMax$/;
                if (capability && capability.NonLocalizedName)
                    return maxPlayersTestExpression.test(capability.NonLocalizedName);
                else
                    return false
            }, isMinSystemLinkFeature: function isMinSystemLinkFeature(capability) {
                var minPlayersTestExpression = /SystemLinkMin$/;
                if (capability && capability.NonLocalizedName)
                    return minPlayersTestExpression.test(capability.NonLocalizedName);
                else
                    return false
            }, isHardDriveFeature: function isHardDriveFeature(capability) {
                if (capability && capability.NonLocalizedName)
                    return capability.NonLocalizedName.indexOf("HardDrive") !== -1;
                else
                    return false
            }, edsGameCapabilityToString: function edsGameCapabilityToString(capability, minValue, maxValue) {
                var string = String.empty;
                var minMaxString = String.empty;
                if (capability && capability.NonLocalizedName)
                    switch (capability.NonLocalizedName) {
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePlayersMinMax:
                            minMaxString = String.load(String.id.IDS_GAMES_CAPABILITY_MIN_MAX).format(minValue, maxValue);
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_OFFLINE_PLAYERS).format(minMaxString);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineCoopPlayersMinMax:
                            minMaxString = String.load(String.id.IDS_GAMES_CAPABILITY_MIN_MAX).format(minValue, maxValue);
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_OFFLINE_COOP).format(minMaxString);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineCoopHardDriveRequired:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_HARDDRIVE_REQUIRED);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineSystemLinkMinMax:
                            minMaxString = String.load(String.id.IDS_GAMES_CAPABILITY_MIN_MAX).format(minValue, maxValue);
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_OFFLINE_SYSTEM_LINK).format(minMaxString);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineVoiceCommands:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_OFFLINE_VOICE_COMMAND);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePeripheralWheel:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_WHEEL);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePeripheralGamePad:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_GAME_PAD);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePeripheralArcadeStick:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_ARCADE_STICK);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePeripheralFlightStick:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_FLIGHT_STICK);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePeripheralDancePad:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_DANCE_PAD);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePeripheralForceFeedbackWheel:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_FORCE_FEEDBACK_WHEEL);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePeripheralCamera:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_CAMERA);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineCustomSoundtracks:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_CUSTOM_SOUNDTRACKS);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineDolbyDigital:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_OFFLINE_DOLBY_DIGITAL);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlinePlayersMinMax:
                            minMaxString = String.load(String.id.IDS_GAMES_CAPABILITY_MIN_MAX).format(minValue, maxValue);
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_ONLINE_MULTIPLAYER).format(minMaxString);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineMultiplayerHardDriveRequired:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_HARDDRIVE_REQUIRED);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineCoopPlayersMinMax:
                            minMaxString = String.load(String.id.IDS_GAMES_CAPABILITY_MIN_MAX).format(minValue, maxValue);
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_ONLINE_COOP).format(minMaxString);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineCoopHardDriveRequired:
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineHardDriveRequired:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_HARDDRIVE_REQUIRED);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineContentDownload:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_ONLINE_CONTENT);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineLeaderboards:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_ONLINE_LEADERBOARDS);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineSpectatorMode:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_ONLINE_SPECTATOR);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineVoice:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_ONLINE_VOICE_CHAT);
                            break;
                        case MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineOnly:
                            string = String.load(String.id.IDS_GAMES_CAPABILITY_ONLINE_ONLY);
                            break
                    }
                return string
            }, gamePlatformTypeToString: function gamePlatformTypeToString(type) {
                var platformTypeString = String.empty;
                if (type)
                    switch (type) {
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Xbox:
                            platformTypeString = String.load(String.id.IDS_GAMES_PLATFORM_XBOX);
                            break;
                        case MS.Entertainment.Data.Augmenter.GamePlatform.PC:
                            platformTypeString = String.load(String.id.IDS_GAMES_PLATFORM_WINDOWS);
                            break;
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Phone:
                            platformTypeString = String.load(String.id.IDS_GAMES_PLATFORM_PHONE);
                            break;
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Modern:
                            platformTypeString = String.load(String.id.IDS_GAMES_PLATFORM_METRO);
                            break;
                        case MS.Entertainment.Data.Augmenter.GamePlatform.Web:
                            platformTypeString = String.load(String.id.IDS_GAMES_PLATFORM_OTHER);
                            break;
                        default:
                            platformTypeString = String.empty;
                            break
                    }
                return platformTypeString
            }, spotlightGamePlatform: function spotlightGamePlatform(type) {
                var defaultPlatform = MS.Entertainment.Data.Augmenter.GamePlatform.Unknown;
                switch (type) {
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernGame:
                        defaultPlatform = MS.Entertainment.Data.Augmenter.GamePlatform.Modern;
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernPDLC:
                        defaultPlatform = MS.Entertainment.Data.Augmenter.GamePlatform.Modern;
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.WindowsGame:
                        defaultPlatform = MS.Entertainment.Data.Augmenter.GamePlatform.PC;
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.PhoneGame:
                        defaultPlatform = MS.Entertainment.Data.Augmenter.GamePlatform.Phone;
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.XboxGame:
                        defaultPlatform = MS.Entertainment.Data.Augmenter.GamePlatform.Xbox;
                        break
                }
                return defaultPlatform
            }, createUnknownArray: function createUnknownArray() {
                return [String.load(String.id.IDS_UNKNOWN_VALUE)]
            }, isFreeWithGold: function isFreeWithGold(args) {
                var requiresGold;
                var priceGold;
                if (Array.isArray(args)) {
                    requiresGold = args[0];
                    priceGold = args[1]
                }
                else
                    requiresGold = args;
                return requiresGold && priceGold === 0
            }, hasPriceInCurrency: function hasPriceInCurrency(data) {
                var hasPriceInCurrency = false;
                if (data.offers && data.offers.length)
                    for (var x = 0; x < data.offers.length; x++)
                        if (data.offers[x].PaymentType === 3) {
                            hasPriceInCurrency = true;
                            break
                        }
                return hasPriceInCurrency
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.Marketplace", {
        edsGameCapabilities: function edsGameCapabilities(capabilities) {
            var featureCapabilities = {
                    features: [], featuresLabel: String.load(String.id.IDS_GAMES_CAPABILITY_FEATURES), onlineFeatures: [], onlineFeaturesLabel: String.load(String.id.IDS_GAMES_CAPABILITY_ONLINE_FEATURES)
                };
            if (capabilities) {
                var minMaxValues = {
                        offlinePlayersMin: null, offlinePlayersMax: null, offlineCoopPlayersMin: null, offlineCoopPlayersMax: null, offlineSystemLinkMin: null, offlineSystemLinkMax: null, onlinePlayersMin: null, onlinePlayersMax: null, onlineCoopPlayersMin: null, onlineCoopPlayersMax: null
                    };
                var hasOnlineHardDriveCapability = false;
                var hasOfflineHardDriveCapability = false;
                for (var i = 0; i < capabilities.length; i++) {
                    var capability = capabilities[i];
                    if (MSE.Data.Factory.Marketplace.isOnlineFeature(capability))
                        if (MSE.Data.Factory.Marketplace.isMaxPlayersFeature(capability))
                            if (MSE.Data.Factory.Marketplace.isCoopFeature(capability))
                                minMaxValues.onlineCoopPlayersMax = capability.Value;
                            else
                                minMaxValues.onlinePlayersMax = capability.Value;
                        else if (MSE.Data.Factory.Marketplace.isMinPlayersFeature(capability))
                            if (MSE.Data.Factory.Marketplace.isCoopFeature(capability))
                                minMaxValues.onlineCoopPlayersMin = capability.Value;
                            else
                                minMaxValues.onlinePlayersMin = capability.Value;
                        else {
                            if (MSE.Data.Factory.Marketplace.isHardDriveFeature(capability))
                                if (hasOnlineHardDriveCapability)
                                    continue;
                                else
                                    hasOnlineHardDriveCapability = true;
                            var string = MSE.Data.Factory.Marketplace.edsGameCapabilityToString(capability);
                            if (string !== String.empty)
                                featureCapabilities.onlineFeatures.push({
                                    name: capability.NonLocalizedName, label: string
                                })
                        }
                    else if (MSE.Data.Factory.Marketplace.isMaxPlayersFeature(capability))
                        if (MSE.Data.Factory.Marketplace.isCoopFeature(capability))
                            minMaxValues.offlineCoopPlayersMax = capability.Value;
                        else
                            minMaxValues.offlinePlayersMax = capability.Value;
                    else if (MSE.Data.Factory.Marketplace.isMinPlayersFeature(capability))
                        if (MSE.Data.Factory.Marketplace.isCoopFeature(capability))
                            minMaxValues.offlineCoopPlayersMin = capability.Value;
                        else
                            minMaxValues.offlinePlayersMin = capability.Value;
                    else if (MSE.Data.Factory.Marketplace.isMaxSystemLinkFeature(capability))
                        minMaxValues.offlineSystemLinkMax = capability.Value;
                    else if (MSE.Data.Factory.Marketplace.isMinSystemLinkFeature(capability))
                        minMaxValues.offlineSystemLinkMin = capability.Value;
                    else {
                        if (MSE.Data.Factory.Marketplace.isHardDriveFeature(capability))
                            if (hasOfflineHardDriveCapability)
                                continue;
                            else
                                hasOfflineHardDriveCapability = true;
                        var string = MSE.Data.Factory.Marketplace.edsGameCapabilityToString(capability);
                        if (string !== String.empty)
                            featureCapabilities.features.push({
                                name: capability.NonLocalizedName, label: string
                            })
                    }
                }
                if (minMaxValues.offlinePlayersMin && minMaxValues.offlinePlayersMax)
                    featureCapabilities.features.unshift({
                        name: MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePlayersMinMax, label: MSE.Data.Factory.Marketplace.edsGameCapabilityToString({NonLocalizedName: MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlinePlayersMinMax}, minMaxValues.offlinePlayersMin, minMaxValues.offlinePlayersMax)
                    });
                if (minMaxValues.offlineCoopPlayersMin && minMaxValues.offlineCoopPlayersMax)
                    featureCapabilities.features.unshift({
                        name: MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineCoopPlayersMinMax, label: MSE.Data.Factory.Marketplace.edsGameCapabilityToString({NonLocalizedName: MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineCoopPlayersMinMax}, minMaxValues.offlineCoopPlayersMin, minMaxValues.offlineCoopPlayersMax)
                    });
                if (minMaxValues.offlineSystemLinkMin && minMaxValues.offlineSystemLinkMax)
                    featureCapabilities.features.unshift({
                        name: MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineSystemLinkMinMax, label: MSE.Data.Factory.Marketplace.edsGameCapabilityToString({NonLocalizedName: MSE.Data.Factory.Marketplace.gameCapabilitiesString.offlineSystemLinkMinMax}, minMaxValues.offlineSystemLinkMin, minMaxValues.offlineSystemLinkMax)
                    });
                if (minMaxValues.onlinePlayersMin && minMaxValues.onlinePlayersMax)
                    featureCapabilities.onlineFeatures.unshift({
                        name: MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlinePlayersMinMax, label: MSE.Data.Factory.Marketplace.edsGameCapabilityToString({NonLocalizedName: MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlinePlayersMinMax}, minMaxValues.onlinePlayersMin, minMaxValues.onlinePlayersMax)
                    });
                if (minMaxValues.onlineCoopPlayersMin && minMaxValues.onlineCoopPlayersMax)
                    featureCapabilities.onlineFeatures.unshift({
                        name: MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineCoopPlayersMinMax, label: MSE.Data.Factory.Marketplace.edsGameCapabilityToString({NonLocalizedName: MSE.Data.Factory.Marketplace.gameCapabilitiesString.onlineCoopPlayersMinMax}, minMaxValues.onlineCoopPlayersMin, minMaxValues.onlineCoopPlayersMax)
                    });
                if (!featureCapabilities.features.length)
                    featureCapabilities.features = null;
                if (!featureCapabilities.onlineFeatures.length)
                    featureCapabilities.onlineFeatures = null
            }
            return featureCapabilities
        }, isEdsGame: function isEdsGame(args) {
                var edsMediaType;
                var titleId;
                if (Array.isArray(args)) {
                    edsMediaType = args[0];
                    titleId = args[1]
                }
                else
                    edsMediaType = args;
                return MSE.Data.Factory.Marketplace.edsItemTypeQueryString(edsMediaType) !== MS.Entertainment.Data.Query.edsMediaType.xboxApp
            }, isEdsGameExtra: function isEdsGameExtra(edsMediaType) {
                var queryString = MSE.Data.Factory.Marketplace.edsItemTypeQueryString(edsMediaType);
                return edsMediaType && queryString && (queryString === MS.Entertainment.Data.Query.edsMediaType.metroGameContent || queryString === MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable || queryString === MS.Entertainment.Data.Query.edsMediaType.avatarItem || queryString === MS.Entertainment.Data.Query.edsMediaType.xbox360GameContent || queryString === MS.Entertainment.Data.Query.edsMediaType.xbox360GameDemo || queryString === MS.Entertainment.Data.Query.edsMediaType.xboxGameTrial || queryString === MS.Entertainment.Data.Query.edsMediaType.xboxTheme || queryString === MS.Entertainment.Data.Query.edsMediaType.xboxGamerTile || queryString === MS.Entertainment.Data.Query.edsMediaType.xboxGameVideo)
            }, isSpotlightGameExtra: function isSpotlightGameExtra(type) {
                return type === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernPDLC
            }, metroGameSupportsCurrentArchitecture: function metroGameSupportsCurrentArchitecture(capabilities) {
                var architecture = Windows.ApplicationModel.Package.current.id.architecture;
                var supported = false;
                if (capabilities) {
                    var isArchitectureSupported = function isArchitectureSupported(arch) {
                            var lowercaseArchitecture = arch.toLowerCase();
                            var capability;
                            for (var i = 0; i < capabilities.length; i++)
                                if (capabilities[i] && capabilities[i].NonLocalizedName && capabilities[i].NonLocalizedName.toLowerCase() === lowercaseArchitecture && capabilities[i].Value)
                                    return true;
                            return false
                        };
                    switch (architecture) {
                        case Windows.System.ProcessorArchitecture.x86:
                            supported = isArchitectureSupported(MSE.Data.Factory.Marketplace.gameCapabilitiesString.supportedArchitectureX86);
                            break;
                        case Windows.System.ProcessorArchitecture.x64:
                            supported = isArchitectureSupported(MSE.Data.Factory.Marketplace.gameCapabilitiesString.supportedArchitectureX64);
                            break;
                        case Windows.System.ProcessorArchitecture.arm:
                            supported = isArchitectureSupported(MSE.Data.Factory.Marketplace.gameCapabilitiesString.supportedArchitectureARM);
                            break
                    }
                }
                return supported
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.XboxLive", {
        isOnlineToString: function isOnlineToString(value) {
            var result = String.empty;
            if (value)
                result = String.load(String.id.IDS_SOCIAL_STATUS_ONLINE);
            else
                result = String.load(String.id.IDS_SOCIAL_STATUS_OFFLINE);
            return result
        }, lastSeenDateToString: (function() {
                var monthDays = 4 * 7;
                var yearDays = 12 * monthDays;
                return function lastSeenDateToString(value) {
                        var delta = Date.subtract(new Date, MS.Entertainment.Data.Factory.date(value));
                        var string;
                        var years = Math.floor(delta.days / yearDays);
                        var months = Math.floor(delta.days / monthDays);
                        var numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                        var formattedCount;
                        if (years > 1)
                            string = String.load(String.id.IDS_SOCIAL_STATUS_OFFLINE);
                        else if (years === 1)
                            string = String.load(String.id.IDS_SOCIAL_LAST_SEEN_1_YEAR);
                        else if (months > 1) {
                            formattedCount = numberFormatter.format(months);
                            string = String.load(String.id.IDS_SOCIAL_LAST_SEEN_X_MONTHS).format(formattedCount)
                        }
                        else if (months === 1)
                            string = String.load(String.id.IDS_SOCIAL_LAST_SEEN_1_MONTH);
                        else if (delta.days > 1) {
                            formattedCount = numberFormatter.format(delta.days);
                            string = String.load(String.id.IDS_SOCIAL_LAST_SEEN_X_DAYS).format(formattedCount)
                        }
                        else if (delta.days === 1)
                            string = String.load(String.id.IDS_SOCIAL_LAST_SEEN_1_DAY);
                        else if (delta.hours > 1) {
                            formattedCount = numberFormatter.format(delta.hours);
                            string = String.load(String.id.IDS_SOCIAL_LAST_SEEN_X_HOURS).format(formattedCount)
                        }
                        else if (delta.hours === 1)
                            string = String.load(String.id.IDS_SOCIAL_LAST_SEEN_1_HOUR);
                        else if (delta.minutes > 1) {
                            formattedCount = numberFormatter.format(delta.minutes);
                            string = String.load(String.id.IDS_SOCIAL_LAST_SEEN_X_MINUTES).format(formattedCount)
                        }
                        else if (delta.minutes === 1 || delta.seconds || delta.milliseconds)
                            string = String.load(String.id.IDS_SOCIAL_LAST_SEEN_1_MINUTE);
                        else
                            string = String.load(String.id.IDS_SOCIAL_STATUS_OFFLINE);
                        return string
                    }
            })(), displayHideOnEmptyString: function displayHideOnEmptyString(string) {
                return (string) ? "inherit" : "none"
            }, achievementDisplayDescription: function achievementDisplayDescription(achievement) {
                var description = String.empty;
                if (achievement)
                    description = achievement.isEarned ? achievement.description : achievement.lockedDescription;
                return description
            }, achievementEarnedString: function achievementEarnedString(achievement, dateOnly) {
                var dateFormat,
                    dateString;
                var result = String.empty;
                if (achievement.earned)
                    if (achievement.earnedDate && achievement.earnedDate !== Date.minValue && achievement.unlockedOnline) {
                        dateFormat = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).shortDate;
                        dateString = dateFormat.format(achievement.earnedDate);
                        result = dateOnly ? dateString : String.load(String.id.IDS_SOCIAL_ACHIEVEMENT_UNLOCKED_ON).format(dateString)
                    }
                    else
                        result = String.load(String.id.IDS_SOCIAL_ACHIEVEMENT_UNLOCKED);
                return result
            }, achievementGamerScoreDisplay: function achievementGamerScoreDisplay(achievement) {
                var gamerScoreDisplay = String.empty;
                if (achievement)
                    if (achievement.isSecret && !achievement.isEarned)
                        gamerScoreDisplay = String.load(String.id.IDS_EMPTY_SYMBOL);
                    else
                        gamerScoreDisplay = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber.format(achievement.gamerscore);
                return gamerScoreDisplay
            }, achievementEarnedStringDateOnly: function achievementEarnedStringDateOnly(achievement) {
                return MSE.Data.Factory.XboxLive.achievementEarnedString(achievement, true)
            }, achievementGamerScoreNarratorString: function achievementGamerScoreNarratorString(achievement) {
                var gamerScore = 0;
                if (!achievement.isSecret || achievement.isEarned)
                    gamerScore = achievement.gamerscore;
                else
                    gamerScore = 0;
                return String.load(String.id.IDS_SOCIAL_GAMERSCORE_NAR).format(gamerScore)
            }, gameGamePercentageNumber: function gameGamePercentageNumber(activity) {
                var totalAchievements;
                var currentAchievements;
                if (activity) {
                    totalAchievements = activity.totalAchievements !== undefined ? activity.totalAchievements : activity.TotalAchievements;
                    currentAchievements = activity.currentAchievements !== undefined ? activity.currentAchievements : activity.CurrentAchievements
                }
                return (activity && currentAchievements && totalAchievements) ? (currentAchievements / totalAchievements * 100) : 0.0001
            }, gameAchievementsProgressString: function achievementsProgressString(activity) {
                var currentAchievements;
                var totalAchievements;
                if (activity) {
                    var numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                    currentAchievements = activity.currentAchievements !== undefined ? numberFormatter.format(activity.currentAchievements) : numberFormatter.format(activity.CurrentAchievements);
                    totalAchievements = activity.totalAchievements !== undefined ? numberFormatter.format(activity.totalAchievements) : numberFormatter.format(activity.TotalAchievements);
                    return String.load(String.id.IDS_SOCIAL_ACHIEVEMENT_PROGRESS).format(currentAchievements, totalAchievements)
                }
                else
                    return String.empty
            }, gameAchievementsFullProgressString: function achievementsFullProgressString(activity) {
                var currentAchievements;
                var totalAchievements;
                if (activity) {
                    var numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                    currentAchievements = activity.currentAchievements !== undefined ? numberFormatter.format(activity.currentAchievements) : numberFormatter.format(activity.CurrentAchievements);
                    totalAchievements = activity.totalAchievements !== undefined ? numberFormatter.format(activity.totalAchievements) : numberFormatter.format(activity.TotalAchievements);
                    return String.load(String.id.IDS_DETAILS_GAME_ACHIEVEMENTS_EARNED).format(currentAchievements, totalAchievements)
                }
                else
                    return String.empty
            }, gameGamerScoreProgressString: function gameGamerScoreProgressString(activity) {
                var currentGamerscore;
                var totalGamerscore;
                if (activity) {
                    var numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                    currentGamerscore = activity.currentGamerscore !== undefined ? numberFormatter.format(activity.currentGamerscore) : numberFormatter.format(activity.CurrentGamerscore);
                    totalGamerscore = activity.totalGamerscore !== undefined ? numberFormatter.format(activity.totalGamerscore) : numberFormatter.format(activity.TotalGamerscore);
                    return String.load(String.id.IDS_SOCIAL_GAMER_SCORE_PROGRESS).format(currentGamerscore, totalGamerscore)
                }
                else
                    return String.empty
            }, gameGamePercentageString: function gameGamePercentageString(activity) {
                var percentage = 0;
                var totalAchievements;
                var currentAchievements;
                if (activity) {
                    totalAchievements = activity.totalAchievements !== undefined ? activity.totalAchievements : activity.TotalAchievements;
                    currentAchievements = activity.currentAchievements !== undefined ? activity.currentAchievements : activity.CurrentAchievements;
                    if (totalAchievements && currentAchievements) {
                        percentage = currentAchievements / totalAchievements;
                        percentage = Math.round(percentage * 100)
                    }
                    return String.load(String.id.IDS_SOCIAL_GAME_PERCENTAGE).format(percentage)
                }
                else
                    return String.empty
            }, gameNarratorProgressString: function gameNarratorProgressString(activity) {
                var percentage = 0;
                var totalAchievements;
                var currentAchievements;
                if (activity) {
                    totalAchievements = activity.totalAchievements !== undefined ? activity.totalAchievements : activity.TotalAchievements;
                    currentAchievements = activity.currentAchievements !== undefined ? activity.currentAchievements : activity.CurrentAchievements;
                    if (totalAchievements && currentAchievements) {
                        percentage = currentAchievements / totalAchievements;
                        percentage = Math.round(percentage * 100)
                    }
                    var currentGamerscore = activity.currentGamerscore !== undefined ? activity.currentGamerscore : activity.CurrentGamerscore;
                    var totalGamerscore = activity.totalGamerscore !== undefined ? activity.totalGamerscore : activity.TotalGamerscore;
                    return String.load(String.id.IDS_SOCIAL_NARRATOR_GAME_PROGRESS).format(percentage, currentGamerscore, totalGamerscore, currentAchievements, totalAchievements)
                }
                else
                    return String.empty
            }, gameImageUri: function gameImageUri(data) {
                if (data)
                    return MS.Entertainment.UI.Shell.ImageLoader.makeCatalogImageUri(data, MS.Entertainment.ImageIdType.xboxGame, null, false, true, MS.Entertainment.ImageRequested.primaryImage);
                else
                    return null
            }, achievementToString: function achievementToString(data) {
                var result;
                if (data && data.title && data.media && data.media.name) {
                    var gamerTag = data.gamerTag;
                    if (!gamerTag) {
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        gamerTag = signedInUser.gamerTag
                    }
                    if (gamerTag)
                        if (data.earned)
                            result = String.load(String.id.IDS_SHARE_SOCIAL_ACHIEVEMENT_TEXT).format(gamerTag, data.title, data.media.name);
                        else
                            result = String.load(String.id.IDS_SHARE_SOCIAL_UNACHIEVEMENT_TEXT).format(gamerTag, data.title, data.media.name)
                }
                return result
            }, leaderboardToString: function leaderboardToString(data) {
                var result = String.empty;
                if (data && data.media && data.userRow && data.userRow.gamerTag)
                    result = String.load(String.id.IDS_SHARE_LEADER_BOARD_TEXT).format(data.media.name, data.userRow.gamerTag, data.userRow.rank);
                return result
            }, gamesShareDescription: function gamesShareDescription(description) {
                return (description) ? description : " "
            }, friendRelationToString: function friendRelationToString(data) {
                var result = String.empty;
                if (data === MS.Entertainment.Data.Augmenter.XboxLive.UserRelation.userRelationFriendRequester)
                    result = String.load(String.id.IDS_SOCIAL_INCOMING_FRIEND_CHAT_BUBBLE);
                else if (data === MS.Entertainment.Data.Augmenter.XboxLive.UserRelation.userRelationFriendRequestee)
                    result = String.load(String.id.IDS_SOCIAL_OUTGOING_FRIEND_CHAT_BUBBLE);
                return result
            }, getMultiplayerMessageData: function getMultiplayerMessageData(userMessage) {
                if (userMessage) {
                    var data = userMessage.getMultiplayerMessageData();
                    return MSE.Data.augment(data, MS.Entertainment.Data.Augmenter.XboxLive.MultiplayerMessageData)
                }
                return null
            }, getInboxPopOverText: function getInboxPopOverText(inboxMessage) {
                var messageText = null;
                if (inboxMessage && inboxMessage.message)
                    switch (inboxMessage.message.getMultiplayerMessageData().type) {
                        case Microsoft.Xbox.MultiplayerMessageType.gameOver:
                            messageText = String.load(String.id.IDS_SOCIAL_MESSAGE_GAME_OVER_POPOVER_TEXT);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.gameTie:
                            messageText = String.load(String.id.IDS_SOCIAL_MESSAGE_GAME_TIE_POPOVER_TEXT);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.invitation:
                            messageText = String.load(String.id.IDS_SOCIAL_MESSAGE_INVITE_POPOVER_TEXT);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.nudge:
                            messageText = String.load(String.id.IDS_SOCIAL_MESSAGE_NUDGE_POPOVER_TEXT);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.youLose:
                            messageText = String.load(String.id.IDS_SOCIAL_MESSAGE_YOU_LOSE_POPOVER_TEXT);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.yourTurn:
                            messageText = String.load(String.id.IDS_SOCIAL_MESSAGE_YOUR_TURN_POPOVER_TEXT);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.youWin:
                            messageText = String.load(String.id.IDS_SOCIAL_MESSAGE_YOU_WIN_TEXT);
                            break
                    }
                return messageText
            }, getInboxMessageText: function getInboxMessageText(inboxMessage) {
                var messageText = null;
                if (inboxMessage && inboxMessage.message && inboxMessage.game)
                    switch (inboxMessage.message.getMultiplayerMessageData().type) {
                        case Microsoft.Xbox.MultiplayerMessageType.gameOver:
                            messageText = String.load(String.id.IDS_SOCIAL_INBOX_GAME_OVER_TEXT).format(inboxMessage.game.Name);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.gameTie:
                            messageText = String.load(String.id.IDS_SOCIAL_INBOX_GAME_TIE_TEXT).format(inboxMessage.game.Name);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.invitation:
                            messageText = String.load(String.id.IDS_SOCIAL_INBOX_INVITE_TEXT).format(inboxMessage.game.Name);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.nudge:
                            messageText = String.load(String.id.IDS_SOCIAL_INBOX_NUDGE_TEXT).format(inboxMessage.game.Name);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.youLose:
                            messageText = String.load(String.id.IDS_SOCIAL_INBOX_YOU_LOSE_TEXT).format(inboxMessage.game.Name);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.yourTurn:
                            messageText = String.load(String.id.IDS_SOCIAL_INBOX_YOUR_TURN_TEXT).format(inboxMessage.game.Name);
                            break;
                        case Microsoft.Xbox.MultiplayerMessageType.youWin:
                            messageText = String.load(String.id.IDS_SOCIAL_INBOX_YOU_WIN_TEXT).format(inboxMessage.game.Name);
                            break
                    }
                return messageText
            }, getAlertMessageText: function getAlertMessageText(inboxMessage) {
                var messageText = null;
                if (inboxMessage && inboxMessage.message && inboxMessage.game)
                    switch (inboxMessage.message.getMultiplayerMessageData().type) {
                        case Microsoft.Xbox.MultiplayerMessageType.invitation:
                            messageText = String.load(String.id.IDS_SOCIAL_ENGAGE_GAME_ALERT).format(inboxMessage.game.Name);
                            break;
                        default:
                            messageText = MS.Entertainment.Data.Factory.XboxLive.getInboxMessageText(inboxMessage);
                            break
                    }
                return messageText
            }, getMessageSummaryText: function getMessageSummaryText(text) {
                var summary = text;
                if (text && text.length >= 19)
                    summary = String.load(String.id.IDS_SOCIAL_INBOX_MESSAGE_TEXT).format(text);
                return summary
            }, getFormattedSentDate: function getFormattedSentDate(sent) {
                var now = new Date;
                var yesterday = new Date;
                yesterday.setDate(now.getDate() - 1);
                var formattedDate = String.empty;
                if (now.getDate() === sent.getDate() && now.getMonth() === sent.getMonth() && now.getFullYear() === sent.getFullYear())
                    formattedDate = new Windows.Globalization.DateTimeFormatting.DateTimeFormatter("shorttime").format(sent);
                else if (yesterday.getDate() === sent.getDate() && yesterday.getMonth() === sent.getMonth() && yesterday.getFullYear() === sent.getFullYear())
                    formattedDate = String.load(String.id.IDS_SOCIAL_MESSAGE_YESTERDAY_TEXT);
                else
                    formattedDate = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).shortDate.format(sent);
                return formattedDate
            }, getFormattedExpirationDate: function getFormattedExpirationDate(expiration) {
                var formattedDate = String.empty;
                var delta = Date.subtract(MS.Entertainment.Data.Factory.date(expiration), new Date);
                if (delta.days === 0)
                    formattedDate = String.load(String.id.IDS_SOCIAL_MESSAGE_EXPIRATION_0);
                else if (delta.days === 1)
                    formattedDate = String.load(String.id.IDS_SOCIAL_MESSAGE_EXPIRATION_1);
                else
                    formattedDate = String.load(String.id.IDS_SOCIAL_MESSAGE_EXPIRATION_N).format(delta.days);
                return formattedDate
            }, getPlatformGenreText: function getPlatformGenreText(game) {
                var text = null;
                var platform = MS.Entertainment.Data.Factory.Marketplace.gamePlatformTypeToString(game.defaultPlatformType);
                var genre = game.primaryGenre;
                if (platform && genre)
                    text = String.load(String.id.IDS_COMMA_SEPARATOR).format(platform, genre);
                else
                    text = platform || genre;
                return text
            }, achievementWebDetailsUri: function achievementWebDetailsUri(data) {
                if (data)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_XBoxLive, "Activity/Details", {titleId: data.toString(10)});
                else
                    return null
            }, profileWebDetailsUri: function profileWebDetailsUri(data) {
                if (data)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_XBoxLive, "Profile", {
                            gamertag: data, magic: "friendship"
                        });
                else
                    return null
            }, avatarTileUri: function avatarTileUri(gamerTag) {
                return MS.Entertainment.UI.Shell.ImageLoader.makeCatalogImageUri(gamerTag, MS.Entertainment.ImageIdType.gamer, null, false, true)
            }, gameHexTitleId: function gameHexTitleId(titleId) {
                if (titleId) {
                    var titleString = titleId.toString().toLowerCase();
                    if (titleString.substr(0, 2) !== "0x" && MS.Entertainment.Utilities.isNumeric(titleString))
                        return "0x" + parseInt(titleId).toString(16)
                }
                return 0
            }, isGame: function isGame(args) {
                var isGame = false;
                var titleType;
                var titleId;
                if (Array.isArray(args)) {
                    titleType = args[0];
                    titleId = args[1]
                }
                else
                    titleType = args;
                if (isNaN(titleType))
                    isGame = titleType === null || titleType === undefined || titleType === MS.Entertainment.Data.Augmenter.GameTitleType.game;
                else
                    isGame = !Microsoft.Xbox.TitleType || (titleType !== Microsoft.Xbox.TitleType.application && titleType !== Microsoft.Xbox.TitleType.system);
                return isGame
            }, supportedPlatform: function supportedPlatform(platform) {
                var type = null;
                switch (platform) {
                    case MSE.Data.Augmenter.GameSupportedPlatform.Xbox360:
                        type = MSE.Data.Augmenter.GamePlatform.Xbox;
                        break;
                    case MSE.Data.Augmenter.GameSupportedPlatform.WebGames:
                        type = MSE.Data.Augmenter.GamePlatform.PC;
                        break
                }
                return type
            }, defaultPlatformType: function defaultPlatformType(platforms) {
                if (typeof(platforms) === "string" && /^\[.*\]$/.test(platforms)) {
                    platforms = platforms.replace(/(\[)|(\])/g, "").split(",").map(function(item) {
                        return parseInt(item)
                    });
                    return MSE.Data.Factory.XboxLive.defaultPlatformType(platforms)
                }
                if (platforms.indexOf(Microsoft.Xbox.PlatformType.xbox360).returnValue || platforms.indexOf(Microsoft.Xbox.PlatformType.xbox360) >= 0)
                    return MSE.Data.Augmenter.GamePlatform.Xbox;
                else if (platforms.indexOf(Microsoft.Xbox.PlatformType.webGames).returnValue || platforms.indexOf(Microsoft.Xbox.PlatformType.webGames) >= 0)
                    return MSE.Data.Augmenter.GamePlatform.Web;
                else if (platforms.indexOf(Microsoft.Xbox.PlatformType.xboxLIVEOnWindows).returnValue || platforms.indexOf(Microsoft.Xbox.PlatformType.xboxLIVEOnWindows) >= 0)
                    return MSE.Data.Augmenter.GamePlatform.Modern;
                else if (platforms.indexOf(Microsoft.Xbox.PlatformType.windowsPC).returnValue || platforms.indexOf(Microsoft.Xbox.PlatformType.windowsPC) >= 0)
                    return MSE.Data.Augmenter.GamePlatform.PC;
                else if (platforms.indexOf(Microsoft.Xbox.PlatformType.mobile).returnValue || platforms.indexOf(Microsoft.Xbox.PlatformType.mobile) >= 0)
                    return MSE.Data.Augmenter.GamePlatform.Phone;
                return null
            }, playGameUri: function playGameUri(data) {
                return MSE.Data.Factory.XboxLive.getTypedResourceValue("Play URI", data)
            }, playMultiplayerGameUri: function playMultiplayerGameUri(data) {
                var uri = null;
                if (data && data.game && data.message) {
                    uri = MSE.Data.Factory.XboxLive.getTypedResourceValue("Play URI", data.game);
                    if (uri) {
                        var sessionId = data.message.getMultiplayerMessageData().sessionId;
                        var senderGamertag = data.message.senderGamertag;
                        if (sessionId && senderGamertag)
                            uri += "xboxlive-event?action=multiplayerInvite&sessionId=" + sessionId + "&senderGamertag=" + senderGamertag
                    }
                }
                return uri
            }, preferredFamilyName: function preferredFamilyName(data) {
                return MSE.Data.Factory.XboxLive.getTypedResourceValue("VPFN/MS Internal URI", data)
            }, primaryGameUrl: function primaryGameUrl(data) {
                return MSE.Data.Factory.XboxLive.getTypedResourceValue("Game Url", data)
            }, getTypedResourceValue: function getTypedResourceValue(type, data) {
                if (data && data.TypedResources)
                    for (var x = 0; x < data.TypedResources.length; x++)
                        if (data.TypedResources[x].Type === type)
                            return data.TypedResources[x].ResourceString;
                return null
            }, metroGameTrailers: function metroGameTrailers(trailers) {
                var list = [];
                if (trailers)
                    trailers.forEach(function(trailer) {
                        if (trailer.Files)
                            for (var i = 0; i < trailer.Files.length; i++)
                                if (trailer.Files[i].FileUrl)
                                    list.push(decodeURI(trailer.Files[i].FileUrl))
                    });
                return list
            }, createMediaObjectWithTitleId: function createMediaObjectWithTitleId(titleId) {
                return {
                        titleId: titleId, hexTitleId: MSE.Data.Factory.XboxLive.gameHexTitleId(titleId), mediaType: Microsoft.Entertainment.Queries.ObjectType.game
                    }
            }, lastPlayedDate: function lastPlayedDate(date) {
                var formatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).shortDate;
                return date && String.load(String.id.IDS_SOCIAL_ENGAGE_LAST_PLAYED_LABEL).format(formatter.format(date))
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Filter.Marketplace", {
        filterInvalidTrailers: function filterInvalidTrailers(url) {
            var filter = true;
            if (url && url.match && url.match(/^.+\.([Aa][Ss][Xx])$/))
                filter = false;
            return filter
        }, filterNonGoldOffers: function filterNonGoldOffers(offer) {
                var filter = true;
                if (offer && offer.SubscriptionLevels) {
                    var subscriptionLevel = MSE.Data.Factory.Marketplace.xboxSubscriptionLevel.gold.toLowerCase();
                    for (var i = 0; i < offer.SubscriptionLevels.length; i++)
                        if (offer.SubscriptionLevels[i].toLowerCase() === subscriptionLevel)
                            filter = false
                }
                return filter
            }, filterNonSilverOffers: function filterNonSilverOffers(offer) {
                var filter = true;
                if (offer && offer.SubscriptionLevels) {
                    var subscriptionLevel = MSE.Data.Factory.Marketplace.xboxSubscriptionLevel.silver.toLowerCase();
                    for (var i = 0; i < offer.SubscriptionLevels.length; i++)
                        if (offer.SubscriptionLevels[i].toLowerCase() === subscriptionLevel)
                            filter = false
                }
                return filter
            }
    }),
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        RatingDescriptorEDS: MSE.Data.define(null, {
            id: alias("Id", null), nonLocalizedDescriptor: alias("NonLocalizedDescriptor", String.empty)
        }), ContentRatingDescriptions: MSE.Data.define(null, {
                id: alias("Id", null), image: null, label: convert("Id", MS.Entertainment.Utilities.Ratings.getRatingDescriptorString, String.empty), nonLocalizedDescriptor: alias("NonLocalizedDescriptor", String.empty)
            }), GameTypedResourcesEDS: MSE.Data.define(null, {
                type: alias("Type", String.empty), resourceString: alias("ResourceString", String.empty)
            })
    }),
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        GameEDS: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSMediaItem, null, {
            mediaType: Microsoft.Entertainment.Queries.ObjectType.game, gameType: hydrated(convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeToGameType, null)), gameTitleType: hydrated(convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeToGameTitleType, null)), titleId: hydrated(convert("TitleId", MSE.Data.Factory.intNumber, 0)), hexTitleId: convert("TitleId", MSE.Data.Factory.XboxLive.gameHexTitleId), titleType: MSE.Data.Augmenter.XboxLive.TitleType.standard, _description: convert("Description", MSE.Data.Factory.normalizeSpacing, String.empty), description: hydrated(convertOriginalNoDeflate("_description", MSE.Data.Factory.normalizeTextDirection, String.empty)), publisher: hydrated(convertOriginal("PublisherName", MSE.Data.Factory.normalizeTextDirection, String.empty), MSE.Data.Comparer.notFalsy), studioName: hydrated(convertOriginal("DeveloperName", MSE.Data.Factory.normalizeTextDirection, String.empty), MSE.Data.Comparer.notFalsy), defaultPlatformType: convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeToGamePlatformType, MSE.Data.Augmenter.GamePlatform.Unknown), releaseDate: hydrated(convert("ReleaseDate", MSE.Data.Factory.Marketplace.edsDate, null)), genre: hydrated(convertNoDeflate("genres", MSE.Data.Factory.self)), genres: hydrated(augment("Genres", MSE.Data.Augmenter.Marketplace.GenreEDS, MSE.Data.Factory.Marketplace.createUnknownArray)), primaryGenre: hydrated(alias("Genres[0].Name", String.empty)), offers: hydrated(alias("OfferInstances", null)), _offerGold: hydrated(searchNoDeflate("OfferInstances", MSE.Data.Filter.Marketplace.filterNonGoldOffers, null)), _offerSilver: hydrated(searchNoDeflate("OfferInstances", MSE.Data.Filter.Marketplace.filterNonSilverOffers, null)), offerGold: hydrated(augmentNoDeflate("_offerGold", MSE.Data.Augmenter.Marketplace.EDSOffer, null)), offerSilver: hydrated(augmentNoDeflate("_offerSilver", MSE.Data.Augmenter.Marketplace.EDSOffer, null)), requiresGold: hydrated(convertNoDeflate("offerSilver", MSE.Data.Factory.not, false)), freeWithGold: hydrated(convertNoDeflate([["requiresGold", "offerGold.price"]], MSE.Data.Factory.Marketplace.isFreeWithGold, false)), rating: hydrated(alias("ParentalRating", String.empty)), ratingId: alias("RatingId", null), itemTypeQueryString: hydrated(convert(["ItemTypeId", "MediaItemType"], MSE.Data.Factory.Marketplace.edsItemTypeQueryString, null)), downloadType: hydrated(convert("MediaItemType", MSE.Data.Factory.Marketplace.edsMediaTypeToPurchaseHelperType)), downloadTypeString: convert("MediaItemType", MSE.Data.Factory.Marketplace.gameExtraTypeString), ratingDescriptors: hydrated(augment("RatingDescriptors", MSE.Data.Augmenter.Marketplace.RatingDescriptorEDS, null)), contentRatingDescriptions: hydrated(augment("RatingDescriptors", MSE.Data.Augmenter.Marketplace.ContentRatingDescriptions, MSE.Data.Factory.array)), contentRating: hydrated(convert("RatingId", MS.Entertainment.Utilities.Ratings.getRatingString, null)), contentRatingImageUri: hydrated(convert("RatingId", MS.Entertainment.Utilities.Ratings.getRatingImagePath, null)), typedResources: augment("TypedResources", MSE.Data.Augmenter.Marketplace.GameTypedResourcesEDS, null), primaryImage: searchNoDeflate("images", MSE.Data.Filter.Marketplace.edsFilterGameBoxArt, null), trailers: hydrated(convert("VideoPreviewInstances", MSE.Data.Factory.XboxLive.metroGameTrailers, null)), trailerUri: hydrated(searchNoDeflate("trailers", MSE.Data.Filter.Marketplace.filterInvalidTrailers, null)), capabilities: hydrated(convert("Capabilities", MSE.Data.Factory.Marketplace.edsGameCapabilities)), isGame: hydrated(convert([["ItemTypeId", "TitleId"]], MSE.Data.Factory.Marketplace.isEdsGame)), isGameExtra: convert("ItemTypeId", MSE.Data.Factory.Marketplace.isEdsGameExtra), supportsCurrentArchitecture: hydrated(value(true)), features: hydratedRequired(value(MSE.Data.Factory.Marketplace.createUnknownArray)), launchUri: hydrated(value(null)), familyName: hydrated(value(null)), webUri: hydrated(convertNoDeflate(String.empty, MSE.Data.Factory.Marketplace.defaultGameWebDetailsUri), MSE.Data.Comparer.notFalsy), contentNotifications: hydrated(value(null)), slideshow: hydrated(list("Slideshows[0].Images", MSE.Data.Augmenter.Marketplace.ImageEDS, null)), hasHexTitleId: {get: function() {
                        return !!this.hexTitleId
                    }}, onHydrated: MS.Entertainment.Hydrator.game
        }), GameSearchSuggestEDS: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MediaItem, null, {
                mediaType: Microsoft.Entertainment.Queries.ObjectType.game, serviceId: hydrated(convert("id", MSE.Data.Factory.guid, String.empty)), name: hydrated(alias("title", String.empty)), title: alias("title", String.empty), isGame: hydrated(convert([["ItemTypeId", "TitleId"]], MSE.Data.Factory.Marketplace.isEdsGame)), gameType: hydrated(value(null)), gameTitleType: hydrated(value(null)), backgroundImageUri: hydratedRequired(value(null)), imageUri: hydratedRequired(value(null)), trailerUri: hydratedRequired(value(null)), description: hydratedRequired(value(null)), primaryGenre: hydratedRequired(value(null)), studioName: hydratedRequired(value(null)), publisher: hydratedRequired(value(null)), features: hydratedRequired(value(null)), rating: hydratedRequired(value(String.empty)), offerGold: hydratedRequired(value(null)), offerSilver: hydratedRequired(value(null)), requiresGold: hydratedRequired(value(false)), freeWithGold: hydratedRequired(value(false)), contentRating: hydratedRequired(value(null)), contentRatingImageUri: hydratedRequired(value(null)), contentRatingDescriptions: hydratedRequired(value(null)), releaseDate: hydratedRequired(value(null)), downloadType: hydratedRequired(value(null)), launchUri: hydratedRequired(value(null)), familyName: hydratedRequired(value(null)), webUri: hydratedRequired(value(null)), supportsCurrentArchitecture: hydratedRequired(value(true)), contentNotifications: hydrated(value(null)), onHydrated: MS.Entertainment.Hydrator.game
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        GameParentItemEDS: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.GameEDS, null, {
            mediaType: Microsoft.Entertainment.Queries.ObjectType.game, defaultPlatformType: null, edsMediaGroup: alias("MediaGroup", null), serviceId: hydrated(convert(["ID", "id"], MSE.Data.Factory.guid, MS.Entertainment.Utilities.EMPTY_GUID)), onHydrated: MS.Entertainment.Hydrator.game
        }), BrowseXboxGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.Game, null, {
                defaultPlatformType: MSE.Data.Augmenter.GamePlatform.Xbox, titleType: MSE.Data.Augmenter.XboxLive.TitleType.standard, isGame: true
            }), XboxGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.GameEDS, null, {defaultPlatformType: alias("defaultPlatformType", MSE.Data.Augmenter.GamePlatform.Xbox)}), MetroGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.GameEDS, null, {
                defaultPlatformType: alias("defaultPlatformType", MSE.Data.Augmenter.GamePlatform.Modern), launchUri: hydrated(convert(String.empty, MSE.Data.Factory.XboxLive.playGameUri, String.empty), MSE.Data.Comparer.notFalsy), familyName: hydrated(convert(String.empty, MSE.Data.Factory.XboxLive.preferredFamilyName, String.empty), MSE.Data.Comparer.notFalsy), webUri: hydrated(convert("Capabilities", MSE.Data.Factory.Marketplace.metroGameWebDetailsUriFromId), MSE.Data.Comparer.notFalsy), supportsCurrentArchitecture: hydrated(convert("Capabilities", MSE.Data.Factory.Marketplace.metroGameSupportsCurrentArchitecture, true))
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        SearchXboxGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.XboxGame, null, {
            isMarketplace: true, hcrSecondaryText: convertOriginalNoDeflate("Genres[0].Name", MSE.Data.Factory.normalizeTextDirection, 0)
        }), SearchMetroGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MetroGame, null, {
                isMarketplace: true, hcrSecondaryText: convertOriginalNoDeflate("Genres[0].Name", MSE.Data.Factory.normalizeTextDirection, 0)
            }), MetroGameChild: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MetroGame, null, {
                images: sortArray("Images", MSE.Data.Comparer.Marketplace.edsCompareImageByGameExtraPurpose, MSE.Data.Augmenter.Marketplace.EDSImage, null), extraImage: searchNoDeflate("images", MSE.Data.Filter.Marketplace.edsFilterGameExtraImage, null), parentItemName: alias("ParentItems[0].ReducedName", String.empty), parentItem: augment("ParentItems[0]", MSE.Data.Augmenter.Marketplace.GameParentItemEDS, null), hasPriceInCurrency: convertNoDeflate(String.empty, MSE.Data.Factory.Marketplace.hasPriceInCurrency, false), isValid: {get: function() {
                            var hasId = this.hasServiceId || this.inCollection || this.hasCanonicalId;
                            return hasId && this.hasEDSMediaItemType
                        }}
            }), XboxGameChild: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.XboxGame, null, {
                images: sortArray("Images", MSE.Data.Comparer.Marketplace.edsCompareImageByGameExtraPurpose, MSE.Data.Augmenter.Marketplace.EDSImage, null), primaryImage: searchNoDeflate("images", MSE.Data.Filter.Marketplace.edsFilterGameExtraImage, null), isValid: {get: function() {
                            var hasId = this.hasServiceId || this.inCollection || this.hasCanonicalId;
                            return hasId && this.hasEDSMediaItemType
                        }}
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        RelatedGameResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {items: list("Items", MSE.Data.Augmenter.Marketplace.XboxGame, null)}), GameListEDS: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {items: list("Items", MSE.Data.Augmenter.Marketplace.GameEDS, null)}), BrowseMetroGameResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {
                items: list("Items", MSE.Data.Augmenter.Marketplace.MetroGame, null), genreList: alias("MediaQueryRefiners[0].Refiners[0].Refiners", null)
            }), SearchMetroGameResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {
                items: list("Items", MSE.Data.Augmenter.Marketplace.SearchMetroGame, null), genreList: alias("MediaQueryRefiners[0].Refiners[0].Refiners", null)
            }), BrowseXboxGameResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {
                items: list("Items", MSE.Data.Augmenter.Marketplace.XboxGame, null), genreList: alias("MediaQueryRefiners[0].Refiners[0].Refiners", null)
            }), SearchXboxGameResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {
                items: list("Items", MSE.Data.Augmenter.Marketplace.SearchXboxGame, null), genreList: alias("MediaQueryRefiners[0].Refiners[0].Refiners", null)
            }), DetailsMetroGameResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSDetailsResult, null, {
                item: augment("Items[0]", MSE.Data.Augmenter.Marketplace.MetroGame, null), items: list("Items", MSE.Data.Augmenter.Marketplace.MetroGame, null)
            }), DetailsXboxGameResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSDetailsResult, null, {
                item: augment("Items[0]", MSE.Data.Augmenter.Marketplace.XboxGame, null), items: list("Items", MSE.Data.Augmenter.Marketplace.XboxGame, null)
            }), DetailsMetroGameChildResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSDetailsResult, null, {
                item: augment("Items[0]", MSE.Data.Augmenter.Marketplace.MetroGameChild, null), items: list("Items", MSE.Data.Augmenter.Marketplace.MetroGameChild, null)
            }), DetailsXboxGameChildResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSDetailsResult, null, {
                item: augment("Items[0]", MSE.Data.Augmenter.Marketplace.XboxGameChild, null), items: list("Items", MSE.Data.Augmenter.Marketplace.XboxGameChild, null)
            }), FlexHubGameResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSDetailsResult, null, {
                item: augment("Items[0]", MSE.Data.Augmenter.Marketplace.GameEDS, null), items: list("Items", MSE.Data.Augmenter.Marketplace.GameEDS, null)
            }), EDSGameChildItemTotals: MSE.Data.define(null, {
                count: alias("Count", null), name: alias("Name", String.empty)
            }), MetroGameChildrenResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {
                items: list("Items", MSE.Data.Augmenter.Marketplace.MetroGameChild, null), totals: list("Totals[0].MediaItemTypes", MSE.Data.Augmenter.Marketplace.EDSGameChildItemTotals, null)
            }), XboxGameChildrenResult: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.EDSBrowseResult, null, {
                items: list("Items", MSE.Data.Augmenter.Marketplace.XboxGameChild, null), totals: list("Totals[0].MediaItemTypes", MSE.Data.Augmenter.Marketplace.EDSGameChildItemTotals, null)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {
        SpotlightGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.GameEDS, null, {
            name: hydrated(convertOriginal("title", MSE.Data.Factory.normalizeTextDirection, String.empty)), primaryText: convertOriginal("Title", MSE.Data.Factory.normalizeTextDirection, String.empty), _secondaryText: convert("Description", MSE.Data.Factory.string, String.empty), secondaryText: convertOriginalNoDeflate("_secondaryText", MSE.Data.Factory.normalizeTextDirection, String.empty), serviceId: alias("Action.Target", MSE.Data.Factory.guid, String.empty), actionTarget: alias("Action.Target", MSE.Data.Factory.guid, String.empty), actionType: convert("Action.type", MSE.Data.Augmenter.Spotlight.parseActionType), icon: convert("Action.type", MSE.Data.Augmenter.Spotlight.parseIcon, null), imagePrimaryUrl: alias("ImageUrl", String.empty), replaceable: convert("replaceable", MSE.Data.Factory.boolFromString, true), queryId: MS.Entertainment.UI.Monikers.homeSpotlight, isGameExtra: convertNoDeflate("actionType.mediaType", MSE.Data.Factory.Marketplace.isSpotlightGameExtra), defaultPlatformType: convertNoDeflate("actionType.mediaType", MSE.Data.Factory.Marketplace.spotlightGamePlatform, MSE.Data.Augmenter.GamePlatform.Unknown), downloadTypeString: hydratedIfAvailable(value(String.empty)), extraImage: hydratedIfAvailable(value(null)), parentItemName: hydratedIfAvailable(value(String.empty)), parentItem: hydratedIfAvailable(value(String.empty)), hasPriceInCurrency: hydratedIfAvailable(value(false))
        }), SpotlightModernGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MetroGame, null, {
                serviceId: hydrated(convert("actionTarget", MSE.Data.Factory.guid, String.empty)), name: hydrated(convertOriginal("title", MSE.Data.Factory.normalizeTextDirection, String.empty), MSE.Data.Comparer.notFalsy)
            }), SpotlightXboxGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.XboxGame, null, {
                serviceId: hydrated(convert("actionTarget", MSE.Data.Factory.guid, String.empty)), name: hydrated(convertOriginal("title", MSE.Data.Factory.normalizeTextDirection, String.empty), MSE.Data.Comparer.notFalsy)
            }), FeaturedPCGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MetroGame, null, {
                replaceable: convert("replaceable", MSE.Data.Factory.boolFromString, true), actionTarget: alias("Action.Target", String.empty), actionType: convert("Action.type", MSE.Data.Augmenter.Spotlight.parseActionType), serviceId: hydrated(convert("Action.Target", MSE.Data.Factory.guid, String.empty)), name: hydrated(convertOriginal("Title", MSE.Data.Factory.normalizeTextDirection, String.empty), MSE.Data.Comparer.notFalsy), title: convertOriginal("Title", MSE.Data.Factory.normalizeTextDirection, String.empty), primaryText: convertOriginal("Title", MSE.Data.Factory.normalizeTextDirection, String.empty), _secondaryText: convert("Description", MSE.Data.Factory.string, String.empty), secondaryText: convertOriginalNoDeflate("_secondaryText", MSE.Data.Factory.normalizeTextDirection, String.empty), imagePrimaryUrl: alias("ImageUrl", String.empty), queryId: MS.Entertainment.UI.Monikers.gamesWindowsPanel
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {
        SpotlightGameSlot: MSE.Data.define(null, {
            sequenceId: convert("SequenceId", MSE.Data.Factory.intNumber, -1), items: augment("Slot", MSE.Data.Augmenter.Spotlight.SpotlightGame, null)
        }), FeaturedPCSlot: MSE.Data.define(null, {
                sequenceId: convert("SequenceId", MSE.Data.Factory.intNumber, -1), items: augment("Slot", MSE.Data.Augmenter.Spotlight.FeaturedPCGame, null)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Spotlight", {
        GameSpotlightContent: MSE.Data.define(null, {entries: list("ContentManifest.Content.SlotGroup", MSE.Data.Augmenter.Spotlight.SpotlightGameSlot, null)}), FeaturedPCSpotlightContent: MSE.Data.define(null, {entries: list("ContentManifest.Content.SlotGroup", MSE.Data.Augmenter.Spotlight.FeaturedPCSlot, null)}), FeaturedXboxSpotlightContent: MSE.Data.define(null, {entries: list("ContentManifest.Content.SlotGroup", MSE.Data.Augmenter.Spotlight.FeaturedXboxSlot, null)}), FlexHubModernGame: MSE.Data.derive(MSE.Data.Augmenter.Spotlight.SpotlightModernGame, null, {
                serviceId: hydrated(convert("Action.Target", MSE.Data.Factory.guid, String.empty)), _description: convert("Description", MSE.Data.Factory.string, String.empty), flexHubItemDescription: convertOriginalNoDeflate("_description", MSE.Data.Factory.normalizeTextDirection, String.empty)
            }), FlexHubXboxGame: MSE.Data.derive(MSE.Data.Augmenter.Spotlight.SpotlightXboxGame, null, {
                serviceId: hydrated(convert("Action.Target", MSE.Data.Factory.guid, String.empty)), _description: convert("Description", MSE.Data.Factory.string, String.empty), flexHubItemDescription: convertOriginalNoDeflate("_description", MSE.Data.Factory.normalizeTextDirection, String.empty)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        Game: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MediaItem, null, {
            hexTitleId: convert("titleId", MSE.Data.Factory.XboxLive.gameHexTitleId), webUri: hydrated(convertNoDeflate(String.empty, MSE.Data.Factory.Marketplace.defaultGameWebDetailsUri), MSE.Data.Comparer.notFalsy), name: hydrated(alias("name", String.empty), MSE.Data.Comparer.notFalsy), mediaType: Microsoft.Entertainment.Queries.ObjectType.game, gameType: hydrated(value(null)), gameTitleType: hydrated(value(null)), itemTypeQueryString: hydrated(convert(["ItemTypeId", "MediaItemType"], MSE.Data.Factory.Marketplace.edsItemTypeQueryString, null)), serviceId: hydrated(value(null)), backgroundImageUri: hydratedRequired(value(null)), imageUri: hydratedRequired(value(null)), trailerUri: hydratedRequired(value(null)), description: hydratedRequired(value(null)), genres: hydratedRequired(value(null)), primaryGenre: hydratedRequired(value(null)), studioName: hydratedRequired(value(null)), publisher: hydratedRequired(value(null)), features: hydratedRequired(value(null)), rating: hydratedRequired(value(String.empty)), offerGold: hydratedRequired(value(null)), offerSilver: hydratedRequired(value(null)), requiresGold: hydratedRequired(value(false)), freeWithGold: hydratedRequired(value(false)), contentRating: hydratedRequired(value(null)), contentRatingImageUri: hydratedRequired(value(null)), contentRatingDescriptions: hydratedRequired(value(null)), releaseDate: hydratedRequired(value(null)), downloadType: hydratedRequired(value(null)), launchUri: hydratedRequired(value(null)), familyName: hydratedRequired(value(null)), supportsCurrentArchitecture: hydratedRequired(value(true)), contentNotifications: hydrated(value(null)), slideshow: hydratedRequired(value(null)), capabilities: hydratedRequired(value(null)), hasHexTitleId: {get: function() {
                        return !!this.hexTitleId
                    }}, onHydrated: MS.Entertainment.Hydrator.game
        }), DataAgentGame: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MediaItem, null, {
                titleId: hydrated(alias("TitleId", null)), titleType: alias("TitleType", null), hexTitleId: convert("TitleId", MSE.Data.Factory.XboxLive.gameHexTitleId), webUri: hydrated(convertNoDeflate(String.empty, MSE.Data.Factory.Marketplace.defaultGameWebDetailsUri), MSE.Data.Comparer.notFalsy), name: hydrated(alias("Name", String.empty), MSE.Data.Comparer.notFalsy), mediaType: Microsoft.Entertainment.Queries.ObjectType.game, serviceId: hydrated(value(null)), lastPlayed: convert("LastPlayed", MSE.Data.Factory.date), lastPlayedString: convertNoDeflate("lastPlayed", MSE.Data.Factory.XboxLive.lastPlayedDate), defaultPlatformType: convert("PlatformTypes", MSE.Data.Factory.XboxLive.defaultPlatformType, MSE.Data.Augmenter.GamePlatform.Unknown), isGame: hydrated(convert([["titleType", "titleId"]], MSE.Data.Factory.XboxLive.isGame, true)), itemTypeQueryString: hydrated(convert(["ItemTypeId", "MediaItemType"], MSE.Data.Factory.Marketplace.edsItemTypeQueryString, null)), gameType: hydrated(value(null)), gameTitleType: hydrated(value(null)), backgroundImageUri: hydratedRequired(value(null)), imageUri: hydratedRequired(value(null)), trailerUri: hydratedRequired(value(null)), description: hydratedRequired(value(null)), genres: hydratedRequired(value(null)), primaryGenre: hydratedRequired(value(null)), studioName: hydratedRequired(value(null)), publisher: hydratedRequired(value(null)), features: hydratedRequired(value(null)), rating: hydratedRequired(value(String.empty)), offerGold: hydratedRequired(value(null)), offerSilver: hydratedRequired(value(null)), requiresGold: hydratedRequired(value(false)), freeWithGold: hydratedRequired(value(false)), contentRating: hydratedRequired(value(null)), contentRatingImageUri: hydratedRequired(value(null)), contentRatingDescriptions: hydratedRequired(value(null)), releaseDate: hydratedRequired(value(null)), downloadType: hydratedRequired(value(null)), launchUri: hydratedRequired(value(null)), familyName: hydratedRequired(value(null)), supportsCurrentArchitecture: hydratedRequired(value(true)), contentNotifications: hydrated(value(null)), slideshow: hydratedRequired(value(null)), capabilities: hydratedRequired(value(null)), hasHexTitleId: {get: function() {
                            return !!this.hexTitleId
                        }}, onHydrated: MS.Entertainment.Hydrator.game
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        AchievementGame: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.Game, null, {name: hydrated(value(String.empty), MSE.Data.Comparer.notFalsy)}), GameActivity: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.Game, null, {
                defaultPlatformType: convert("platformTypes", MSE.Data.Factory.XboxLive.defaultPlatformType, MSE.Data.Augmenter.GamePlatform.Unknown), isGame: hydrated(convert([["titleType", "titleId"]], MSE.Data.Factory.XboxLive.isGame, true))
            }), GameStatus: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.Game, null, {
                titleId: hydrated(alias("titleId", MSE.Data.Factory.string, String.empty)), hexTitleId: convert("titleId", MSE.Data.Factory.XboxLive.gameHexTitleId)
            }), CollectionGame: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.Game, null, {
                isGame: hydrated(convert([["titleType", "titleId"]], MSE.Data.Factory.XboxLive.isGame, true)), inCollection: true, isMarketplace: false, defaultPlatformType: convert("platformTypes", MSE.Data.Factory.XboxLive.defaultPlatformType, MSE.Data.Augmenter.GamePlatform.Unknown)
            }), DataAgentCollectionGame: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.DataAgentGame, null, {
                currentAchievements: alias("CurrentAchievements", 0), totalAchievements: alias("TotalAchievements", 0), currentGamerscore: alias("CurrentGamerscore", 0), totalGamerscore: alias("TotalGamerscore", 0), gamerScoreProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameGamerScoreProgressString), percentageProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameGamePercentageString), percentageProgressString: convert(String.empty, MSE.Data.Factory.XboxLive.gameAchievementsFullProgressString), percentageProgressNumber: convert(String.empty, MSE.Data.Factory.XboxLive.gameGamePercentageNumber), isGame: hydrated(convert([["TitleType", "TitleId"]], MSE.Data.Factory.XboxLive.isGame, true)), inCollection: true, isMarketplace: false
            }), BeaconGame: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.Game, null, {
                isGame: hydrated(convert([["titleType", "titleId"]], MSE.Data.Factory.XboxLive.isGame, true)), name: hydrated(alias("titleName", String.empty), MSE.Data.Comparer.notFalsy), defaultPlatformType: convert("supportedPlatform", MSE.Data.Factory.XboxLive.supportedPlatform, MSE.Data.Augmenter.GamePlatform.Unknown)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        FriendProfileIdentity: MSE.Data.define(null, {
            gamerTag: alias("gamertag", String.empty), xuid: alias("xuid", 0)
        }), FriendProfileStatus: MSE.Data.define(null, {
                deviceType: alias("deviceType", String.empty), isOnline: alias("isOnline", true), relation: alias("relation", 0), titleId: hydrated(alias("titleId", 0)), media: convert("titleId", MSE.Data.Factory.XboxLive.createMediaObjectWithTitleId, 0), lastActivity: convert("lastActivity", MSE.Data.Factory.date, new Date), lastSeenText: convert("lastActivity", MSE.Data.Factory.XboxLive.lastSeenDateToString, String.empty), richPresence: convert("richPresence", MSE.Data.Factory.stringNoNewLines, String.empty), stateText: convert("isOnline", MSE.Data.Factory.XboxLive.isOnlineToString, String.empty)
            })
    }),
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        Profile: MSE.Data.define(null, {
            gamerTag: alias("gamertag", String.empty), hasAvatar: alias("hasAvatar", false), imageUri: convert("gamerPictureUrl", MSE.Data.Factory.string), avatarImageUri: alias("avatarImageUrl", String.empty), webUri: convert("gamertag", MSE.Data.Factory.XboxLive.profileWebDetailsUri), membershipType: alias("membershipLevel"), bio: alias("bio", String.empty), gamerScore: alias("gamerscore", 0), formattedGamerScore: convert("gamerscore", MSE.Data.Factory.formattedIntNumber, 0), location: alias("location", String.empty), motto: alias("motto", String.empty), name: alias("name", String.empty), reputation: alias("reputation", 0), userXuid: alias("userXuid", 0), status: null, achievements: null, activities: null, socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.profile
        }), FriendProfile: MSE.Data.define(null, {
                gamerTag: alias("gamertag", String.empty), hasAvatar: alias("hasAvatar", false), avatarImageUri: alias("avatarImageUrl", String.empty), membershipType: alias("membershipLevel"), bio: alias("bio", String.empty), gamerScore: alias("gamerscore", 0), formattedGamerScore: convert("gamerscore", MSE.Data.Factory.formattedIntNumber, 0), location: alias("location", String.empty), motto: alias("motto", String.empty), name: alias("name", String.empty), gamerPictureUrl: alias("gamerPictureUrl", String.empty), manifest: alias("manifest", String.empty), reputation: alias("reputation", 0), identity: augment("identity", MSE.Data.Augmenter.XboxLive.FriendProfileIdentity), status: augment("status", MSE.Data.Augmenter.XboxLive.FriendProfileStatus)
            }), Gamercard: MSE.Data.define(null, {
                gamerTag: alias("gamertag", String.empty), hasAvatar: false, gamerPictureUrl: alias("gamerpicLargeImagePath", String.empty), avatarImageUri: alias("avatarBodyImagePath", String.empty), gamerpicSmallUri: alias("gamerpicSmallImagePath", String.empty), gamerpicLargeUri: alias("gamerpicLargeImagePath", String.empty), webUri: convert("gamertag", MSE.Data.Factory.XboxLive.profileWebDetailsUri), membershipType: null, bio: convert("bio", MSE.Utilities.unEscapeHTML, String.empty), gamerScore: alias("gamerscore", 0), formattedGamerScore: convert("gamerscore", MSE.Data.Factory.formattedIntNumber, 0), location: convert("location", MSE.Utilities.unEscapeHTML, String.empty), motto: convert("motto", MSE.Utilities.unEscapeHTML, String.empty), name: convert("name", MSE.Utilities.unEscapeHTML, String.empty), reputation: 0, userXuid: 0, status: null, achievements: null, activities: null, socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.gamercard
            }), Achievement: MSE.Data.define(null, {
                _name: convert("name", MSE.Data.Factory.stringOrEmpty, String.empty), title: convertOriginalNoDeflate("_name", MSE.Data.Factory.normalizeTextDirection, String.empty), media: augment(String.empty, MSE.Data.Augmenter.XboxLive.AchievementGame), value: alias("gamerscore", 0), valueDisplay: convert(String.empty, MSE.Data.Factory.XboxLive.achievementGamerScoreDisplay), imageUri: hydrated(alias("pictureUrl", String.empty)), earned: alias("isEarned", false), earnedDate: convert("timeUnlocked", MSE.Data.Factory.date, Date.minValue), earnedString: convertNoDeflate(String.empty, MSE.Data.Factory.XboxLive.achievementEarnedString), earnedStringDateOnly: convertNoDeflate(String.empty, MSE.Data.Factory.XboxLive.achievementEarnedStringDateOnly), webUri: convert("titleId", MSE.Data.Factory.XboxLive.achievementWebDetailsUri), socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.achievement, _description: convert(String.empty, MSE.Data.Factory.XboxLive.achievementDisplayDescription), displayDescription: convertOriginalNoDeflate("_description", MSE.Data.Factory.normalizeTextDirection, String.empty), valueNarratorString: convert(String.empty, MSE.Data.Factory.XboxLive.achievementGamerScoreNarratorString), gamerTag: null
            }), Activity: MSE.Data.define(null, {
                media: augment(String.empty, MSE.Data.Augmenter.XboxLive.GameActivity), hexTitleId: convert("titleId", MSE.Data.Factory.XboxLive.gameHexTitleId), lastPlayed: convert("lastPlayed", MSE.Data.Factory.date), achievementProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameAchievementsProgressString), gamerScoreProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameGamerScoreProgressString), narratorGameProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameNarratorProgressString), percentageProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameGamePercentageString), percentageProgressString: convert(String.empty, MSE.Data.Factory.XboxLive.gameAchievementsFullProgressString), percentageProgressNumber: convert(String.empty, MSE.Data.Factory.XboxLive.gameGamePercentageNumber), isGame: convert([["titleType", "titleId"]], MSE.Data.Factory.XboxLive.isGame, true), socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.activity, hasHexTitleId: {get: function() {
                            return !!this.hexTitleId
                        }}
            }), DataAgentActivity: MSE.Data.define(null, {
                media: augment(String.empty, MSE.Data.Augmenter.XboxLive.DataAgentGame), titleId: hydrated(alias("TitleId", 0)), name: alias("Name", String.empty), hexTitleId: convert("TitleId", MSE.Data.Factory.XboxLive.gameHexTitleId), lastPlayed: convert("LastPlayed", MSE.Data.Factory.date), achievementProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameAchievementsProgressString), gamerScoreProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameGamerScoreProgressString), narratorGameProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameNarratorProgressString), percentageProgress: convert(String.empty, MSE.Data.Factory.XboxLive.gameGamePercentageString), percentageProgressString: convert(String.empty, MSE.Data.Factory.XboxLive.gameAchievementsFullProgressString), percentageProgressNumber: convert(String.empty, MSE.Data.Factory.XboxLive.gameGamePercentageNumber), isGame: convert([["titleType", "TitleId"]], MSE.Data.Factory.XboxLive.isGame, true), currentAchievements: alias("CurrentAchievements", 0), totalAchievements: alias("TotalAchievements", 0), currentGamerscore: alias("CurrentGamerscore", 0), totalGamerscore: alias("TotalGamerscore", 0), socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.activity, hasHexTitleId: {get: function() {
                            return !!this.hexTitleId
                        }}
            }), Status: MSE.Data.define(null, {
                lastSeenDate: convert("lastActivity", MSE.Data.Factory.date, new Date), lastSeenText: convert("lastActivity", MSE.Data.Factory.XboxLive.lastSeenDateToString, String.empty), richPresence: convert("richPresence", MSE.Data.Factory.stringNoNewLines, String.empty), media: augment(String.empty, MSE.Data.Augmenter.XboxLive.GameStatus), stateText: convert("isOnline", MSE.Data.Factory.XboxLive.isOnlineToString, String.empty), relation: alias("relation", MSE.Data.Augmenter.XboxLive.UserRelation.userRelationNone)
            }), NativeWrapper: MSE.Data.define(null, {})
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {ActivityCount: MSE.Data.define(null, {
            onlineCount: alias("activityCountOnline"), totalCount: alias("activityCountTotal")
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        mergeLeaders: function(leader1, leader2) {
            if (leader1)
                return leader1;
            else
                return leader2
        }, Leader: MSE.Data.define(null, {
                gamerPictureUrl: convert("gamertag", MSE.Data.Factory.XboxLive.avatarTileUri), gamerTag: alias("gamertag", String.empty), rank: alias("rank", String.empty), caption: alias("rating", String.empty), userXuid: alias("xuid", 0), mediaType: Microsoft.Entertainment.Queries.ObjectType.person, showGamerscore: false
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        Leaderboard: MSE.Data.define(null, {
            media: null, socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.leaderBoard, webUri: convertNoDeflate("media.titleId", MSE.Data.Factory.Common.xboxGameWebDetailsUriFromTitleId, String.empty), description: convertNoDeflate(String.empty, MSE.Data.Factory.XboxLive.leaderboardToString, String.empty), userRow: augment("userRow", MSE.Data.Augmenter.XboxLive.Leader), label: alias("metadata.leaderboardName", String.empty), rating: alias("metadata.ratingColumnName", String.empty), leaders: list("userList", MSE.Data.Augmenter.XboxLive.Leader)
        }), LeaderboardMetadata: MSE.Data.define(null, {
                label: alias("leaderboardName", String.empty), columnHeader: alias("ratingColumnName", String.empty)
            }), GamerscoreLeader: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.Leader, null, {showGamerscore: true})
    }),
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {SystemLeaderboard: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.Leaderboard, null, {
            userRow: augment("userRow", MSE.Data.Augmenter.XboxLive.GamerscoreLeader), leaders: list("userList", MSE.Data.Augmenter.XboxLive.GamerscoreLeader), label: {get: function() {
                        return String.load(String.id.IDS_SOCIAL_LEADERBOARD_SYSTEM_TITLE)
                    }}, rating: {get: function() {
                        return String.load(String.id.IDS_SOCIAL_LEADERBOARD_SYSTEM_SCORE)
                    }}, columnHeader: {get: function() {
                        return String.load(String.id.IDS_SOCIAL_LEADERBOARD_SYSTEM_SCORE)
                    }}
        })}),
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        MergedAchievement: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.Achievement, null, {
            _name: convert("primary.name", MSE.Data.Factory.stringOrEmpty, String.empty), title: convertOriginalNoDeflate("_name", MSE.Data.Factory.normalizeTextDirection, String.empty), description: alias("primary.description", String.empty), lockedDescription: alias("primary.lockedDescription", String.empty), _description: convert("primary", MSE.Data.Factory.XboxLive.achievementDisplayDescription), displayDescription: convertOriginalNoDeflate("_description", MSE.Data.Factory.normalizeTextDirection, String.empty), media: augment("primary", MSE.Data.Augmenter.XboxLive.AchievementGame), webUri: convert("primary.titleId", MSE.Data.Factory.XboxLive.achievementWebDetailsUri), titleId: alias("primary.titleId"), value: alias("primary.gamerscore", 0), primaryValue: alias("source[0].gamerscore", 0), secondaryValue: alias("source[1].gamerscore", 0), imageUri: hydrated(alias("primary.pictureUrl", String.empty)), earned: alias("primary.isEarned", false), primaryEarned: alias("source[0].isEarned", false), secondaryEarned: alias("source[1].isEarned", false), earnedDate: convert("primary.timeUnlocked", MSE.Data.Factory.date), primaryEarnedDate: convert("source[0].timeUnlocked", MSE.Data.Factory.date), secondaryEarnedDate: convert("source[1].timeUnlocked", MSE.Data.Factory.date), primaryAchievement: augment("source[0]", MSE.Data.Augmenter.XboxLive.Achievement, {}), secondaryAchievement: augment("source[1]", MSE.Data.Augmenter.XboxLive.Achievement, {}), socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.achievement
        }), MergedActivity: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.Activity, null, {
                media: augment("primary", MSE.Data.Augmenter.XboxLive.GameActivity), titleId: alias("primary.titleId"), isGame: convert([["primary.titleType", "primary.titleId"]], MSE.Data.Factory.XboxLive.isGame, true), hexTitleId: convert("primary.titleId", MSE.Data.Factory.XboxLive.gameHexTitleId), lastPlayed: convert("primary.lastPlayed", MSE.Data.Factory.date), totalGamerscore: alias("primary.totalGamerscore"), totalAchievements: alias("primary.totalAchievements"), primaryLastPlayed: convert("source[0].lastPlayed", MSE.Data.Factory.date), secondaryLastPlayed: convert("source[1].lastPlayed", MSE.Data.Factory.date), primaryUserActivity: augment("source[0]", MSE.Data.Augmenter.XboxLive.Activity, {}), secondaryUserActivity: augment("source[1]", MSE.Data.Augmenter.XboxLive.Activity, {}), achievementProgress: convert("primary", MSE.Data.Factory.XboxLive.gameAchievementsProgressString), gamerScoreProgress: convert("primary", MSE.Data.Factory.XboxLive.gameGamerScoreProgressString), narratorGameProgress: convert("primary", MSE.Data.Factory.XboxLive.gameNarratorProgressString), percentageProgress: convert("primary", MSE.Data.Factory.XboxLive.gameGamePercentageString), percentageProgressString: convert("primary", MSE.Data.Factory.XboxLive.gameAchievementsFullProgressString), percentageProgressNumber: convert("primary", MSE.Data.Factory.XboxLive.gameGamePercentageNumber), socialDataType: MS.Entertainment.Data.Augmenter.XboxLive.SocialDataType.activity
            })
    }),
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        AchievementSharePackage: MSE.Data.define(null, {
            mediaId: alias("media.titleId", String.empty), title: alias("title", String.empty), earned: alias("earned", false), description: alias("description", String.empty), text: convert(String.empty, MSE.Data.Factory.XboxLive.achievementToString, String.empty), uri: alias("webUri", String.empty), htmlUri: alias("webUri", String.empty), htmlImages: collect(["media.titleId", "imageUri"], [MSE.Data.Factory.XboxLive.gameImageUri, null]), htmlLines: collect(["title", "description", "media.name"])
        }), ProfileSharePackage: MSE.Data.define(null, {
                mediaId: alias("gamerTag", String.empty), title: format("gamerTag", String.id.IDS_SHARE_FRIEND_REQUEST, String.empty), description: String.empty, text: format("gamerTag", String.id.IDS_SHARE_FRIEND_REQUEST, String.empty), uri: alias("webUri", String.empty), htmlUri: alias("webUri", String.empty), htmlUriStringId: String.id.IDS_SHARE_FRIEND_REQUEST_LINK, htmlImages: collect(["avatarImageUri"]), htmlLines: collect(["motto", "gamerTag", "gamerScore", "name", "location", "motto"], [null, null, null, null, null, MSE.Data.Factory.XboxLive.displayHideOnEmptyString])
            }), LeaderBoardSharePackage: MSE.Data.define(null, {
                mediaId: alias("media.titleId", String.empty), title: alias("label", String.empty), description: alias("description", String.empty), text: alias("description", String.empty), uri: alias("media.webUri", String.empty), htmlUri: alias("media.webUri", String.empty), htmlImages: collect(["media.titleId"], [MSE.Data.Factory.XboxLive.gameImageUri]), htmlLines: collect(["label", "description"])
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {BubbleActivity: MSE.Data.define(null, {
            primaryText: String.empty, secondaryText: String.empty, imageUri: null, actionUserXuid: alias("identity.xuid", null), actionUserModel: alias("instance", null)
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        ChatBubbleActivity: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.BubbleActivity, null, {
            primaryText: alias("gamerTag", String.empty), secondaryText: alias("status.richPresence", String.empty), actionMediaItem: alias("status.media", null)
        }), ChatBubbleStatusActivity: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.BubbleActivity, null, {
                primaryText: alias("gamerTag", String.empty), secondaryText: alias("status.stateText", String.empty)
            }), ChatBubbleOffline: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.BubbleActivity, null, {
                primaryText: alias("gamerTag", String.empty), secondaryText: alias("status.lastSeenText", String.empty)
            }), ChatBubbleStatus: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.BubbleActivity, null, {
                primaryText: alias("gamerTag", String.empty), secondaryText: alias("status.stateText", String.empty)
            }), ChatBubbleGamerTag: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.BubbleActivity, null, {primaryText: alias("gamerTag", String.empty)}), ChatBubbleMotto: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.BubbleActivity, null, {primaryText: alias("motto", String.empty)}), ChatBubbleFriendRequest: MSE.Data.derive(MSE.Data.Augmenter.XboxLive.BubbleActivity, null, {
                primaryText: alias("gamerTag", String.empty), secondaryText: convert("status.relation", MSE.Data.Factory.XboxLive.friendRelationToString)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {MultiplayerMessageData: MSE.Data.define(null, {
            type: alias("type", String.empty), sessionId: alias("sessionId", String.empty), customData: alias("customData", null)
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {TextMessage: MSE.Data.define(null, {
            id: alias("id", String.empty), isRead: convert("isRead", MSE.Data.Factory.boolFromString, false), senderGamertag: alias("senderGamertag", String.empty), senderXuid: alias("senderXuid", 0), sent: convert("sent", MSE.Data.Factory.date), expiration: convert("expiration", MSE.Data.Factory.date), summary: alias("messageSummary", String.empty), hasText: convert("hasText", MSE.Data.Factory.boolFromString, false), hasAudio: convert("hasAudio", MSE.Data.Factory.boolFromString, false), hasPhoto: convert("hasPhoto", MSE.Data.Factory.boolFromString, false)
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {UserMessage: MSE.Data.define(null, {
            id: alias("id", String.empty), senderGamertag: alias("senderGamertag", String.empty), sent: convert("sent", MSE.Data.Factory.date), expiration: convert("expiration", MSE.Data.Factory.date), titleId: hydrated(alias("titleId", 0)), messageData: convert(null, MSE.Data.Factory.XboxLive.getMultiplayerMessageData)
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        TextInboxMessage: MSE.Data.define(null, {
            sender: augment("sender", MS.Entertainment.Data.Augmenter.XboxLive.Gamercard), message: augment("message", MS.Entertainment.Data.Augmenter.XboxLive.TextMessage), formattedSentDate: convert("message.sent", MSE.Data.Factory.XboxLive.getFormattedSentDate, String.empty), formattedExpirationDate: convert("message.expiration", MSE.Data.Factory.XboxLive.getFormattedExpirationDate, String.empty), inboxMessageText: convert("message.messageSummary", MSE.Data.Factory.XboxLive.getMessageSummaryText, String.empty), alertMessageText: convertNoDeflate("inboxMessageText", MSE.Data.Factory.self), read: alias("message.isRead", false)
        }), InboxMessage: MSE.Data.define(null, {
                sender: augment("sender", MS.Entertainment.Data.Augmenter.XboxLive.Gamercard), message: augment("message", MS.Entertainment.Data.Augmenter.XboxLive.UserMessage), game: augment("game", MSE.Data.Augmenter.Marketplace.GameEDS), popOverMessageText: convert(null, MSE.Data.Factory.XboxLive.getInboxPopOverText, String.empty), inboxMessageText: convert(null, MSE.Data.Factory.XboxLive.getInboxMessageText, String.empty), alertMessageText: convert(null, MSE.Data.Factory.XboxLive.getAlertMessageText, String.empty), formattedSentDate: convert("message.sent", MSE.Data.Factory.XboxLive.getFormattedSentDate, String.empty), gamePlatformText: convert("game.defaultPlatformType", MSE.Data.Factory.Marketplace.gamePlatformTypeToString, String.empty), platformGenreText: convert("game", MSE.Data.Factory.XboxLive.getPlatformGenreText, String.empty), launchUri: convert(null, MSE.Data.Factory.XboxLive.playMultiplayerGameUri, String.empty), familyName: convert("game", MSE.Data.Factory.XboxLive.preferredFamilyName, String.empty), read: false
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.XboxLive", {
        Leaderboards: MSE.Data.define(null, {items: list("items", MSE.Data.Augmenter.XboxLive.LeaderboardMetadata)}), FriendsResult: MSE.Data.define(null, {items: list("items", MSE.Data.Augmenter.XboxLive.FriendProfile)}), FriendsWithBeaconsResult: MSE.Data.define(null, {items: list("items")}), FriendActivitiesResult: MSE.Data.define(null, {items: list("items")}), AchievementsResult: MSE.Data.define(null, {items: list("items", MSE.Data.Augmenter.XboxLive.Achievement)}), ActivitiesResult: MSE.Data.define(null, {items: list("items", MSE.Data.Augmenter.XboxLive.Activity)}), DataAgentActivitiesResult: MSE.Data.define(null, {
                items: list("ResultSet", MS.Entertainment.Data.Augmenter.XboxLive.DataAgentActivity, null), totalCount: alias("TotalCount", null)
            }), ActivityCountsResult: MSE.Data.define(null, {items: list("items", MSE.Data.Augmenter.XboxLive.ActivityCount)}), GamesResult: MSE.Data.define(null, {items: list("items", MSE.Data.Augmenter.XboxLive.CollectionGame)}), DataAgentGamesResult: MSE.Data.define(null, {
                items: list("ResultSet", MS.Entertainment.Data.Augmenter.XboxLive.DataAgentCollectionGame, null), totalCount: alias("TotalCount", null)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {GameSharePackage: MSE.Data.define(null, {
            mediaId: alias("serviceId", String.empty), mediaType: alias("mediaType", Microsoft.Entertainment.Queries.ObjectType.game), mediaTitle: alias("name", String.empty), title: alias("name", String.empty), description: alias("description", String.empty), text: format("name", String.id.IDS_SHARE_GAME_TEXT, String.empty), uri: alias("webUri", String.empty), htmlUri: alias("webUri", String.empty), htmlImages: collect(["imageUri"]), htmlLines: collect(["name", "description"], [null, MSE.Data.Factory.XboxLive.gamesShareDescription])
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {MetroGameSharePackage: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.GameSharePackage, null, {htmlUriStringId: String.id.IDS_SHARE_MORE_MICROSOFT_DOT_COM})})
})(WinJS.Namespace.define("MS.Entertainment", null))
