/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Components/Shell/PurchaseHelpers.js", "/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {ExtrasViewModel: WinJS.Class.define(function extrasViewModel_constructor(mediaItem) {
            MS.Entertainment.ViewModels.assert(mediaItem, "mediaItem cannot be null or undefined for ExtrasViewModel");
            MS.Entertainment.ViewModels.assert(mediaItem.hydrated, "mediaItem must be hydrated for ExtrasViewModel");
            this._mediaItem = mediaItem;
            this._allExtras = [];
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("gameChildHydration")
        }, {
            _extrasTypes: null, _mediaItem: null, _allExtras: null, _extrasPromise: null, _queryWatcher: null, _navigators: null, _downloadType: null, defaultSelectionIndex: null, beginQuery: function beginQuery() {
                    var childrenQuery;
                    if (this._mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern)
                        childrenQuery = new MS.Entertainment.Data.Query.Games.GameMetroChildren;
                    else
                        childrenQuery = new MS.Entertainment.Data.Query.Games.XboxGameChildren;
                    if (this._mediaItem.hasServiceId) {
                        childrenQuery.serviceId = this._mediaItem.serviceId;
                        childrenQuery.idType = MS.Entertainment.Data.Query.edsIdType.canonical
                    }
                    else {
                        childrenQuery.serviceId = this._mediaItem.hexTitleId;
                        childrenQuery.idType = MS.Entertainment.Data.Query.edsIdType.xboxHexTitle
                    }
                    childrenQuery.impressionGuid = this._mediaItem.impressionGuid;
                    childrenQuery.mediaItemType = this._mediaItem.itemTypeQueryString;
                    if (this._downloadType)
                        if (this._downloadType.type === MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE)
                            if (this._mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern)
                                childrenQuery.desiredItemTypes = [MS.Entertainment.Platform.PurchaseHelpers.METRO_GAME_CONTENT, MS.Entertainment.Platform.PurchaseHelpers.METRO_GAME_CONSUMABLE];
                            else
                                childrenQuery.desiredItemTypes = [MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_CONTENT];
                        else if (this._downloadType.type === MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE)
                            if (this._mediaItem.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern)
                                childrenQuery.desiredItemTypes = [MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE];
                            else
                                childrenQuery.desiredItemTypes = [MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_TRIAL, MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_DEMO];
                        else
                            childrenQuery.desiredItemTypes = [this._downloadType.type];
                    this._queryWatcher.registerQuery(childrenQuery);
                    return childrenQuery.execute().then(function querySuccess(q) {
                            if (q.result && q.result.items && q.result.items.count > 0) {
                                this._allExtras = q.result.items;
                                this._navigators = MS.Entertainment.ViewModels.ExtrasViewModel.createEDSNavigators(q.result);
                                return q.result.items
                            }
                            else {
                                this._allExtras = null;
                                this._navigators = null
                            }
                        }.bind(this), function queryFailure(e) {
                            this._allExtras = null;
                            this._navigators = null
                        }.bind(this))
                }, getExtrasTypes: function getExtrasTypes() {
                    if (this._extrasTypes)
                        return WinJS.Promise.wrap(this._extrasTypes);
                    return this.beginQuery().then(function() {
                            if (this._navigators) {
                                this._extrasTypes = [];
                                var extrasModifierIndex = 1;
                                this._navigators.options.forEach(function(option) {
                                    var title = String.empty;
                                    switch (option.value) {
                                        case MS.Entertainment.Platform.PurchaseHelpers.AVATAR_TYPE:
                                            title = MS.Entertainment.ViewModels.ExtrasViewModel.formatGameExtraSting(option.count, String.id.IDS_DETAILS_GAME_EXTRAS_AVATAR, String.id.IDS_DETAILS_GAME_EXTRAS_AVATARS);
                                            break;
                                        case MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE:
                                            title = MS.Entertainment.ViewModels.ExtrasViewModel.formatGameExtraSting(option.count, String.id.IDS_DETAILS_GAME_EXTRAS_ADDON, String.id.IDS_DETAILS_GAME_EXTRAS_ADDONS);
                                            break;
                                        case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_TRIAL:
                                        case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_DEMO:
                                        case MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE:
                                            title = MS.Entertainment.ViewModels.ExtrasViewModel.formatGameExtraSting(option.count, String.id.IDS_DETAILS_GAME_EXTRAS_DEMO, String.id.IDS_DETAILS_GAME_EXTRAS_DEMOS);
                                            break;
                                        case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_VIDEO:
                                        case MS.Entertainment.Platform.PurchaseHelpers.GAME_VIDEO_TYPE:
                                            title = MS.Entertainment.ViewModels.ExtrasViewModel.formatGameExtraSting(option.count, String.id.IDS_DETAILS_GAME_EXTRAS_VIDEO, String.id.IDS_DETAILS_GAME_EXTRAS_VIDEOS);
                                            break;
                                        case MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAMER_TILE:
                                        case MS.Entertainment.Platform.PurchaseHelpers.GAMER_PICTURE_TYPE:
                                            title = MS.Entertainment.ViewModels.ExtrasViewModel.formatGameExtraSting(option.count, String.id.IDS_DETAILS_GAME_EXTRAS_PICTURE, String.id.IDS_DETAILS_GAME_EXTRAS_PICTURES);
                                            break;
                                        case MS.Entertainment.Platform.PurchaseHelpers.XBOX_THEME:
                                        case MS.Entertainment.Platform.PurchaseHelpers.GAME_THEME_TYPE:
                                            title = MS.Entertainment.ViewModels.ExtrasViewModel.formatGameExtraSting(option.count, String.id.IDS_DETAILS_GAME_EXTRAS_THEME, String.id.IDS_DETAILS_GAME_EXTRAS_THEMES);
                                            break;
                                        default:
                                            MS.Entertainment.UI.Controls.assert(false, "ExtrasViewModel recieved an unknown extra type.");
                                            break
                                    }
                                    this._extrasTypes.push({
                                        type: option.value, label: title, count: option.count, index: extrasModifierIndex++
                                    })
                                }.bind(this))
                            }
                            return WinJS.Promise.wrap(this._extrasTypes)
                        }.bind(this))
                }, getItems: function getItems(modifier) {
                    if (!modifier || !modifier.type)
                        this._downloadType = null;
                    else
                        this._downloadType = modifier;
                    return this.beginQuery()
                }, appendLastPurchaseDate: function appendLastPurchaseDate(extras) {
                    if (!extras)
                        return WinJS.Promise.wrap(null);
                    var purchaseHistoryService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.gamesPurchaseHistory);
                    return purchaseHistoryService.getPurchaseHistoryForTitleId(this._mediaItem.titleId).then(function updatePurchaseHistory(receipts) {
                            if (receipts && receipts.length) {
                                var purchaseDateByOfferId = [];
                                for (var i = 0; i < receipts.length; i++)
                                    purchaseDateByOfferId[receipts[i].offerId] = receipts[i].purchaseDate;
                                var signedInUserService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                                var offerProperty = signedInUserService.isGold() ? "offerGold" : "offerSilver";
                                for (var i = 0; i < extras.length; i++)
                                    if (extras[i] && extras[i][offerProperty])
                                        extras[i].purchaseDate = purchaseDateByOfferId[extras[i][offerProperty].offerId]
                            }
                            return WinJS.Promise.wrap(extras)
                        }.bind(this), function purchaseHistoryFailed() {
                            return WinJS.Promise.wrap(extras)
                        }.bind(this))
                }, getModifierDataSource: function getModifierDataSource() {
                    return this.getExtrasTypes().then(function modifierDataSource(types) {
                            var allType = [{label: String.load(String.id.IDS_FILTER_ALL)}];
                            return allType.concat(types)
                        })
                }
        }, {
            createEDSNavigators: function createMetroNavigators(result) {
                var counts = {};
                var navigators = {options: []};
                if (!result || !result.totals)
                    return navigators;
                result.totals.toArray().then(function(items) {
                    for (var i = 0; i < items.length; i++)
                        if (items[i].Name === MS.Entertainment.Platform.PurchaseHelpers.METRO_GAME_CONSUMABLE || items[i].Name === MS.Entertainment.Platform.PurchaseHelpers.METRO_GAME_CONTENT || items[i].Name === MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_CONTENT)
                            if (counts[MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE])
                                counts[MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE] += items[i].Count;
                            else
                                counts[MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE] = items[i].Count;
                        else if (items[i].Name === MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_DEMO || items[i].Name === MS.Entertainment.Platform.PurchaseHelpers.XBOX_GAME_TRIAL)
                            if (counts[MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE])
                                counts[MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE] += items[i].Count;
                            else
                                counts[MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE] = items[i].Count;
                        else
                            counts[items[i].Name] = items[i].Count;
                    for (var name in counts)
                        if (counts.hasOwnProperty(name))
                            navigators.options.push({
                                value: name, count: counts[name]
                            })
                });
                return navigators
            }, formatGameExtraSting: function formatGameExtraSting(count, singularStringId, pluralStringId) {
                    var stringId = count === 1 ? singularStringId : pluralStringId;
                    return String.load(stringId)
                }
        })})
})()
