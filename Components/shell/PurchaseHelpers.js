/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/WebHostExperience.js", "/Components/Marketplace.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.PurchaseHelpers");
WinJS.Namespace.define("MS.Entertainment.Platform.PurchaseHelpers", {
    CONSOLE_TARGET: "XBox", PC_TARGET: "X8", METRO_TARGET: "Windows", PURCHASE_TYPE_RENT: "Rent", PURCHASE_TYPE_BUY: "Buy", AVATAR_TYPE: "AvatarItem", PDLC_TYPE: "PDLCItem", GAME_ADDON_TYPE: "GameAddon", GAME_DEMO_TYPE: "GameDemo", GAME_VIDEO_TYPE: "GameVideo", GAMER_PICTURE_TYPE: "GamerPic", GAME_THEME_TYPE: "Theme", METRO_GAME_CONSUMABLE: "MetroGameConsumable", METRO_GAME_CONTENT: "MetroGameContent", METRO_GAME_ID: 62, METRO_AVATAR_ITEM_ID: 47, METRO_GAME_CONTENT_ID: 63, METRO_GAME_CONSUMABLE_ID: 64, XBOX_GAME_CONTENT: "Xbox360GameContent", XBOX_GAME: "Xbox360Game", XBOX_GAME_TRIAL: "XboxGameTrial", XBOX_GAME_DEMO: "Xbox360GameDemo", XBOX_THEME: "XboxTheme", XBOX_GAMER_TILE: "XboxGamerTile", XBOX_GAME_VIDEO: "XboxGameVideo", XBOX_GAME_TRAILER: "XboxGameTrailer", XBOX_GAME_CONTENT_ID: 18, XBOX_GAME_ID: 1, XBOX_ARCADE_ID: 23, XBOX_INDIE_ID: 37, XBOX_GAME_TRIAL_ID: 5, XBOX_GAME_DEMO_ID: 19, XBOX_THEME_ID: 20, XBOX_GAMER_TILE_ID: 22, XBOX_GAME_VIDEO_ID: 30, GAME_TYPE: "Game", MOVIE_TYPE: "Movie", TV_EPISODE_TYPE: "TVEpisode", TV_SEASON_TYPE: "TVSeason", ALBUM_TYPE: "Album", TRACK_TYPE: "Track", WATCH_ON_CONSOLE_TARGET: "360", WATCH_ON_PC_TARGET: "X8", LicenseRightMap: {
            _scriptLicenseRights: null, _delayLoadScriptLicenseRights: function _delayLoadScriptLicenseRights() {
                    if (!MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap._scriptLicenseRights)
                        MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap._scriptLicenseRights = [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Preview, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Stream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Subscription, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Purchase, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.AlbumPurchase, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.SubscriptionFree, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.TransferToPortableDevice, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Rent, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.PurchaseStream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.RentStream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.PreviewStream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Trial, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.SeasonPurchase, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.SeasonPurchaseStream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.FreeStream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Download, ]
                }, toNative: function toNative(licenseRight) {
                    if (typeof(licenseRight) === "number")
                        return licenseRight;
                    if (typeof(licenseRight) !== "string")
                        return Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.unknownMediaRight;
                    MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap._delayLoadScriptLicenseRights();
                    return MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap._scriptLicenseRights.indexOf(licenseRight)
                }, toScript: function toScript(licenseRight) {
                    if (typeof(licenseRight) === "string")
                        return licenseRight;
                    MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap._delayLoadScriptLicenseRights();
                    if (typeof(licenseRight) !== "number" || licenseRight < 0 || licenseRight >= MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap._scriptLicenseRights.length)
                        return null;
                    return MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap._scriptLicenseRights[licenseRight]
                }, ModernLicenseRight: {
                    Invalid: 0, AlbumPurchase: 100, Download: 200, FreeStream: 300, FreeStreamLimitExceeded: 301, Preview: 400, PreviewStream: 500, Purchase: 600, PurchaseStream: 700, Rent: 800, RentStream: 900, Root: 1000, SeasonPurchase: 1100, SeasonPurchaseStream: 1200, Stream: 1300, Subscription: 1400, SubscriptionFree: 1500, TakeDown: 1600, TransferToPortableDevice: 1700, Trial: 1800
                }, fromModernToNative: function fromModernToNative(licenseRight) {
                    var LicenseRightMap = MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap;
                    var MarketplaceRight = MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight;
                    switch (licenseRight) {
                        case LicenseRightMap.ModernLicenseRight.AlbumPurchase:
                            return LicenseRightMap.toNative(MarketplaceRight.AlbumPurchase);
                        case LicenseRightMap.ModernLicenseRight.Download:
                            return LicenseRightMap.toNative(MarketplaceRight.Download);
                        case LicenseRightMap.ModernLicenseRight.FreeStream:
                            return LicenseRightMap.toNative(MarketplaceRight.FreeStream);
                        case LicenseRightMap.ModernLicenseRight.Preview:
                            return LicenseRightMap.toNative(MarketplaceRight.Preview);
                        case LicenseRightMap.ModernLicenseRight.PreviewStream:
                            return LicenseRightMap.toNative(MarketplaceRight.PreviewStream);
                        case LicenseRightMap.ModernLicenseRight.Purchase:
                            return LicenseRightMap.toNative(MarketplaceRight.Purchase);
                        case LicenseRightMap.ModernLicenseRight.PurchaseStream:
                            return LicenseRightMap.toNative(MarketplaceRight.PurchaseStream);
                        case LicenseRightMap.ModernLicenseRight.Rent:
                            return LicenseRightMap.toNative(MarketplaceRight.Rent);
                        case LicenseRightMap.ModernLicenseRight.RentStream:
                            return LicenseRightMap.toNative(MarketplaceRight.RentStream);
                        case LicenseRightMap.ModernLicenseRight.SeasonPurchase:
                            return LicenseRightMap.toNative(MarketplaceRight.SeasonPurchase);
                        case LicenseRightMap.ModernLicenseRight.SeasonPurchaseStream:
                            return LicenseRightMap.toNative(MarketplaceRight.SeasonPurchaseStream);
                        case LicenseRightMap.ModernLicenseRight.Stream:
                            return LicenseRightMap.toNative(MarketplaceRight.Stream);
                        case LicenseRightMap.ModernLicenseRight.Subscription:
                            return LicenseRightMap.toNative(MarketplaceRight.Subscription);
                        case LicenseRightMap.ModernLicenseRight.SubscriptionFree:
                            return LicenseRightMap.toNative(MarketplaceRight.SubscriptionFree);
                        case LicenseRightMap.ModernLicenseRight.TransferToPortableDevice:
                            return LicenseRightMap.toNative(MarketplaceRight.TransferToPortableDevice);
                        case LicenseRightMap.ModernLicenseRight.Trial:
                            return LicenseRightMap.toNative(MarketplaceRight.Trial);
                        case LicenseRightMap.ModernLicenseRight.Invalid:
                        case LicenseRightMap.ModernLicenseRight.FreeStreamLimitExceeded:
                        case LicenseRightMap.ModernLicenseRight.Root:
                        case LicenseRightMap.ModernLicenseRight.TakeDown:
                        default:
                            throw new Error("Unsupported license right.");
                    }
                }
        }, Error: {NS_E_EXPLICIT_CONTENT_BLOCKED: (0xC00D1355 - 0xFFFFFFFF - 1)}, launchPurchaseFlow: function launchPurchaseFlow(mediaItem, target, purchaseType, eventHandlers, offerId, returnUri, gamerTag) {
            var serviceId = mediaItem.hasZuneId ? mediaItem.zuneId : mediaItem.serviceId;
            var unsnappingPromise;
            if (!target)
                target = this.PC_TARGET;
            var flowProvider = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.purchaseFlowProvider);
            if (flowProvider) {
                var purchaseFlow = flowProvider.getPurchaseFlow(mediaItem, serviceId, target, purchaseType, offerId, returnUri, gamerTag);
                if (purchaseFlow && purchaseFlow.purchaseExp) {
                    if (eventHandlers) {
                        purchaseFlow.purchaseExp.onStartEvent = eventHandlers.onStartEvent;
                        purchaseFlow.purchaseExp.onMessageEvent = eventHandlers.onMessageEvent;
                        purchaseFlow.purchaseExp.onErrorEvent = eventHandlers.onErrorEvent;
                        purchaseFlow.purchaseExp.onFinishedEvent = eventHandlers.onFinishedEvent;
                        purchaseFlow.purchaseExp.onCancelEvent = eventHandlers.onCancelEvent;
                        purchaseFlow.purchaseExp.onPageLoadEvent = eventHandlers.onPageLoadEvent
                    }
                    if (Windows.UI.ViewManagement.ApplicationView && Windows.UI.ViewManagement.ApplicationView.tryUnsnap())
                        unsnappingPromise = WinJS.Promise.timeout();
                    WinJS.Promise.as(unsnappingPromise).then(function applicationIsUnsnapped() {
                        purchaseFlow.purchaseExp.mediaItem = mediaItem;
                        MS.Entertainment.UI.PurchaseHistoryService.enterPurchaseFlowActivity();
                        return MS.Entertainment.UI.Shell.showWebHostDialog(null, {
                                desiredLeft: "0%", desiredTop: "10%", showBackButton: false, showCancelButton: false
                            }, {
                                sourceUrl: String.empty, authenticatedSourceUrl: purchaseFlow.purchaseUrl, webHostExperience: purchaseFlow.purchaseExp, taskId: purchaseFlow.taskId, isDialog: true
                            })
                    }).done(function showWebHostDialogComplete() {
                        MS.Entertainment.UI.PurchaseHistoryService.leavePurchaseFlowActivity(false);
                        if (eventHandlers && eventHandlers.onShowWebHostDialogComplete)
                            eventHandlers.onShowWebHostDialogComplete()
                    }, function showWebHostDialogError(error) {
                        MS.Entertainment.UI.PurchaseHistoryService.leavePurchaseFlowActivity(true);
                        if (eventHandlers && eventHandlers.onShowWebHostDialogError)
                            eventHandlers.onShowWebHostDialogError()
                    })
                }
            }
        }, queryMediaDetailForCacheItemAsync: function queryMediaDetailForCacheItemAsync(cacheItemWithData, mediaType) {
            return WinJS.Promise.wrapError(new Error("The media type is not supported."))
        }, getPreferredRight: function getPreferredRight(rights, licenseRightsOrderedByPreference) {
            if (!Array.isArray(rights) || !Array.isArray(licenseRightsOrderedByPreference))
                return null;
            for (var i = 0; i < licenseRightsOrderedByPreference.length; i++) {
                var nativeLicenseRight = MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap.toNative(licenseRightsOrderedByPreference[i]);
                for (var j = 0; j < rights.length; j++)
                    if (nativeLicenseRight === MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap.toNative(rights[j].licenseRight))
                        return rights[j]
            }
            return null
        }, filterRights: function filterRights(sourceRights, filterLicenseRights) {
            var rights = [];
            if (!Array.isArray(sourceRights))
                return rights;
            if (!Array.isArray(filterLicenseRights) || filterLicenseRights.length === 0)
                return sourceRights;
            for (var i = 0; i < filterLicenseRights.length; i++)
                for (var j = 0; j < sourceRights.length; j++)
                    if (MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap.toNative(filterLicenseRights[i]) === MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap.toNative(sourceRights[j].licenseRight)) {
                        rights.push(sourceRights[j]);
                        break
                    }
            return rights
        }, doesAnyLicenseRightRequireSignIn: function doesAnyLicenseRightRequireSignIn(licenseRights) {
            if (Array.isArray(licenseRights))
                for (var i = 0; i < licenseRights.length; i++)
                    if (licenseRights[i] !== MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Preview && licenseRights[i] !== MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.PreviewStream && licenseRights[i] !== Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.preview && licenseRights[i] !== Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.previewStream)
                        return true;
            return false
        }, mapLicenseRightArrayToNative: function mapLicenseRightArrayToNative(licenseRights) {
            var nativeLicenseRights = [];
            if (!Array.isArray(licenseRights))
                return nativeLicenseRights;
            for (var i = 0; i < licenseRights.length; i++)
                nativeLicenseRights.push(MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap.toNative(licenseRights[i]));
            return nativeLicenseRights
        }, getAssetLocationsRequestInfo: function getAssetLocationsRequestInfo(serviceMediaId, rights, filterLicenseRights) {
            var requestInfo = {
                    serviceMediaIds: [], mediaInstanceIds: [], nativeLicenseRights: [], offerIds: []
                };
            if (serviceMediaId && !MS.Entertainment.Utilities.isEmptyGuid(serviceMediaId)) {
                var rights = MS.Entertainment.Platform.PurchaseHelpers.filterRights(rights, filterLicenseRights);
                var mediaInstanceIds = [];
                for (var i = 0; i < rights.length; i++) {
                    var mediaInstanceId = rights[i].mediaInstanceId;
                    var offerId = rights[i].offerId;
                    if (mediaInstanceId && !MS.Entertainment.Utilities.isEmptyGuid(mediaInstanceId)) {
                        requestInfo.serviceMediaIds.push(serviceMediaId);
                        requestInfo.mediaInstanceIds.push(mediaInstanceId);
                        requestInfo.nativeLicenseRights.push(MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap.toNative(rights[i].licenseRight));
                        requestInfo.offerIds.push((!offerId || MS.Entertainment.Utilities.isEmptyGuid(offerId)) ? null : offerId)
                    }
                }
            }
            return requestInfo
        }, getAssetLocationsAsync: function getAssetLocationsAsync(serviceMediaId, rights, filterLicenseRights, autoActivateMachine, context, ticket) {
            var requestInfo = MS.Entertainment.Platform.PurchaseHelpers.getAssetLocationsRequestInfo(serviceMediaId, rights, filterLicenseRights);
            return MS.Entertainment.Platform.PurchaseHelpers.getAssetLocationsUsingRequestInfoAsync(requestInfo, autoActivateMachine, context, ticket)
        }, getAssetLocationsUsingRequestInfoAsync: function getAssetLocationsUsingRequestInfoAsync(requestInfo, autoActivateMachine, context, ticket, skipSubscriptionFiltering) {
            if (!requestInfo || !Array.isArray(requestInfo.mediaInstanceIds) || requestInfo.mediaInstanceIds.length === 0)
                return WinJS.Promise.wrap([]);
            if (!Array.isArray(requestInfo.nativeLicenseRights) || requestInfo.mediaInstanceIds.length !== requestInfo.nativeLicenseRights.length)
                return WinJS.Promise.wrapError(new Error("The input mediaInstanceIds and licenseRights must be arrays of equal length."));
            if (!Array.isArray(requestInfo.offerIds) || requestInfo.mediaInstanceIds.length !== requestInfo.offerIds.length)
                return WinJS.Promise.wrapError(new Error("The input mediaInstanceIds and offerIds must be arrays of equal length."));
            var promise = WinJS.Promise.wrap(ticket);
            if (MS.Entertainment.Platform.PurchaseHelpers.doesAnyLicenseRightRequireSignIn(requestInfo.nativeLicenseRights) && (!ticket))
                promise = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport));
            var passportTicket = null;
            promise = promise.then(function getPassportTicket_complete(ticket) {
                passportTicket = ticket;
                if (!skipSubscriptionFiltering && (!passportTicket || !MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser).isSubscription))
                    for (var i = 0; i < requestInfo.nativeLicenseRights.length; i++)
                        switch (requestInfo.nativeLicenseRights[i]) {
                            case Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.subscriptionDownload:
                            case Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.subscriptionStream:
                                requestInfo.serviceMediaIds.splice(i, 1);
                                requestInfo.mediaInstanceIds.splice(i, 1);
                                requestInfo.nativeLicenseRights.splice(i, 1);
                                requestInfo.offerIds.splice(i, 1);
                                i--;
                                break
                        }
            }, function getPassportTicket_error(e) {
                for (var i = 0; i < requestInfo.nativeLicenseRights.length; i++)
                    switch (requestInfo.nativeLicenseRights[i]) {
                        case Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.freeStream:
                        case Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.preview:
                        case Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.previewStream:
                            break;
                        default:
                            requestInfo.serviceMediaIds.splice(i, 1);
                            requestInfo.mediaInstanceIds.splice(i, 1);
                            requestInfo.nativeLicenseRights.splice(i, 1);
                            requestInfo.offerIds.splice(i, 1);
                            i--;
                            break
                    }
            });
            return promise.then(function requestMediaInstances_complete() {
                    if (requestInfo.mediaInstanceIds.length === 0)
                        return WinJS.Promise.wrap([]);
                    requestInfo = {
                        serviceMediaIds: [requestInfo.serviceMediaIds[0]], mediaInstanceIds: [requestInfo.mediaInstanceIds[0]], nativeLicenseRights: [requestInfo.nativeLicenseRights[0]], offerIds: [requestInfo.offerIds[0]]
                    };
                    return Microsoft.Entertainment.Marketplace.Marketplace.getAssetLocationsAsync(passportTicket ? passportTicket : String.empty, requestInfo.serviceMediaIds, requestInfo.mediaInstanceIds, requestInfo.nativeLicenseRights, [], context ? [context] : [], !!autoActivateMachine).then(function getAssetLocationsAsync_complete(jsonAssetLocations) {
                            var assetLocations = JSON.parse(jsonAssetLocations).results;
                            assetLocations[0].offerId = requestInfo.offerIds[0];
                            return WinJS.Promise.wrap(assetLocations)
                        }.bind(this))
                })
        }, ensurePreownedMediaAddedAsync: function ensurePreownedMediaAddedAsync(media) {
            var addMediaResult = MS.Entertainment.Platform.PurchaseHelpers.createAddMediaResult();
            return WinJS.Promise.wrap(addMediaResult)
        }, addNonCollectionMediaToLibrary: function addNonCollectionMediaToLibrary(mediaItemsArray) {
            var serviceMediaIds = mediaItemsArray.map(function getServiceMediaId(mediaItem) {
                    return !MS.Entertainment.Utilities.isEmptyGuid(mediaItem.zuneId) ? mediaItem.zuneId : MS.Entertainment.Utilities.EMPTY_GUID
                });
            var mediaTypes = mediaItemsArray.map(function getMediaType(mediaItem) {
                    return mediaItem.mediaType
                });
            var mediaPropertySet = new Windows.Foundation.Collections.PropertySet;
            var propertySetPromises = mediaItemsArray.map(function populatePropertySets(mediaItem) {
                    return MS.Entertainment.Platform.PurchaseHelpers._populatePropertySetForMedia(mediaPropertySet, mediaItem)
                });
            return WinJS.Promise.join(propertySetPromises).then(function propertySetPopulationComplete() {
                    return Microsoft.Entertainment.Marketplace.Marketplace.addMedia(serviceMediaIds, mediaTypes, [], [], mediaPropertySet, false)
                }).then(function addMediaComplete(addMediaResult) {
                    var result = MS.Entertainment.Platform.PurchaseHelpers.parseJsonAddMediaResult(addMediaResult);
                    return WinJS.Promise.wrap(result)
                })
        }, _populatePropertySetForArtist: function _populatePropertySetForArtist(artistPropertySet, artist) {
            var artistSimpleProperties = ["name", "hasSmartDJ", "imageResizeUri"];
            MS.Entertainment.Platform.PurchaseHelpers._addPropertiesToPropertySet(artistPropertySet, artist, artistSimpleProperties);
            if (artist.hasZuneId)
                artistPropertySet["zuneId"] = artist.zuneId;
            if (artist.serviceIdType === MS.Entertainment.Data.Query.edsIdType.canonical)
                artistPropertySet["bingId"] = artist.serviceId
        }, _populatePropertySetForAlbum: function _populatePropertySetForAlbum(propertySet, album) {
            MS.Entertainment.Platform.PurchaseHelpers.assert(album.hasZuneId, "Media passed into _populatePropertySetForAlbum does not have a valid zuneId");
            var albumPropertySet;
            var trackList = [];
            var albumSimpleProperties = ["imageResizeUri", "isExplicit", "name", "primaryGenreName", "releaseDate", "trackCount", "zuneId"];
            if (album.hasZuneId) {
                albumPropertySet = MS.Entertainment.Platform.PurchaseHelpers._getOrCreatePropertySetWithKey(propertySet, album.zuneId);
                MS.Entertainment.Platform.PurchaseHelpers._addPropertiesToPropertySet(albumPropertySet, album, albumSimpleProperties);
                if (album.serviceIdType === MS.Entertainment.Data.Query.edsIdType.canonical)
                    albumPropertySet["bingId"] = album.serviceId;
                if (album.rights)
                    MS.Entertainment.Platform.PurchaseHelpers._populateRightsForMedia(albumPropertySet, album);
                if (album.artist) {
                    albumPropertySet["Artist"] = new Windows.Foundation.Collections.PropertySet;
                    MS.Entertainment.Platform.PurchaseHelpers._populatePropertySetForArtist(albumPropertySet["Artist"], album.artist)
                }
                if (album.tracks)
                    return album.tracks.forEachAll(function pushTrack(args) {
                            var track = args.item.data;
                            if (track) {
                                trackList.push(track.zuneId);
                                MS.Entertainment.Platform.PurchaseHelpers._populatePropertySetForTrack(propertySet, track)
                            }
                        }).then(function trackListPopulated() {
                            albumPropertySet["TrackList"] = trackList
                        }, function trackListError(e) {
                            albumPropertySet["TrackList"] = null
                        });
                else
                    return WinJS.Promise.wrap()
            }
            return WinJS.Promise.wrap()
        }, _getOrCreatePropertySetWithKey: function _getOrCreatePropertySetWithKey(parentPropertySet, key) {
            if (!parentPropertySet.hasKey(key))
                parentPropertySet[key] = new Windows.Foundation.Collections.PropertySet;
            return parentPropertySet[key]
        }, _addPropertiesToPropertySet: function _addPropertiesToPropertySet(propertySet, item, itemPropertiesList) {
            for (var itemProperty in itemPropertiesList)
                propertySet[itemPropertiesList[itemProperty]] = item[itemPropertiesList[itemProperty]]
        }, _populateRightsForMedia: function _populateRightsForMedia(mediaPropertySet, media) {
            MS.Entertainment.Platform.PurchaseHelpers.assert(media.rights, "media did not have rights property");
            var rightsList = [];
            if (media.rights)
                media.rights.forEach(function addRightToPropertySet(right) {
                    var rightPropertySet = new Windows.Foundation.Collections.PropertySet;
                    rightPropertySet["ProviderId"] = right.provider.ID;
                    rightPropertySet["LicenseRight"] = right.licenseRight;
                    rightPropertySet["Encoding"] = right.encoding;
                    rightPropertySet["MediaInstanceId"] = right.mediaInstanceId;
                    rightPropertySet["OfferId"] = right.offerId;
                    rightPropertySet["ClientTypes"] = right.clientTypes;
                    rightPropertySet["FulfillmentTicket"] = right.fulfillmentTicket;
                    rightPropertySet["FulfillmentTicketExpirationDate"] = right.fulfillmentTicketExpirationDate;
                    rightsList.push(rightPropertySet)
                });
            mediaPropertySet["Rights"] = rightsList
        }, _populatePropertySetForTrack: function _populatePropertySetForTrack(propertySet, track) {
            MS.Entertainment.Platform.PurchaseHelpers.assert(track.hasZuneId, "Media passed into _populatePropertySetForMedia does not have a valid zuneId");
            var trackPropertySet;
            var trackSimpleProperties = ["Duration", "genreName", "isExplicit", "imageResizeUri", "name", "releaseDate", "trackNumber", "zuneId"];
            if (track.hasZuneId) {
                trackPropertySet = MS.Entertainment.Platform.PurchaseHelpers._getOrCreatePropertySetWithKey(propertySet, track.zuneId);
                MS.Entertainment.Platform.PurchaseHelpers._addPropertiesToPropertySet(trackPropertySet, track, trackSimpleProperties);
                if (track.artist) {
                    trackPropertySet["Artist"] = new Windows.Foundation.Collections.PropertySet;
                    MS.Entertainment.Platform.PurchaseHelpers._populatePropertySetForArtist(trackPropertySet["Artist"], track.artist)
                }
                if (track.rights)
                    MS.Entertainment.Platform.PurchaseHelpers._populateRightsForMedia(trackPropertySet, track);
                if (track.serviceIdType === MS.Entertainment.Data.Query.edsIdType.canonical)
                    trackPropertySet["bingId"] = track.serviceId;
                else if (track.serviceIdType === MS.Entertainment.Data.Query.edsIdType.amg)
                    trackPropertySet["amgId"] = track.serviceId;
                if (track.album) {
                    if (track.album.artist) {
                        trackPropertySet["AlbumArtist"] = new Windows.Foundation.Collections.PropertySet;
                        MS.Entertainment.Platform.PurchaseHelpers._populatePropertySetForArtist(trackPropertySet["AlbumArtist"], track.album.artist)
                    }
                    trackPropertySet["albumZuneId"] = track.album.zuneId;
                    if (track.album.serviceIdType === MS.Entertainment.Data.Query.edsIdType.canonical)
                        trackPropertySet["albumBingId"] = track.album.serviceId;
                    trackPropertySet["albumName"] = track.album.name
                }
            }
            return WinJS.Promise.wrap()
        }, _populatePropertySetForMedia: function _populatePropertySetForMedia(propertySet, media) {
            MS.Entertainment.Platform.PurchaseHelpers.assert(media.hasZuneId, "Media passed into _populatePropertySetForMedia does not have a valid zuneId");
            var populatePromise;
            switch (media.mediaType) {
                case Microsoft.Entertainment.Queries.ObjectType.album:
                    populatePromise = MS.Entertainment.Platform.PurchaseHelpers._populatePropertySetForAlbum(propertySet, media);
                    break;
                case Microsoft.Entertainment.Queries.ObjectType.track:
                    populatePromise = MS.Entertainment.Platform.PurchaseHelpers._populatePropertySetForTrack(propertySet, media);
                    break;
                default:
                    MS.Entertainment.Platform.PurchaseHelpers.assert(false, "Unknown mediaType passed to _populatePropertySetForMedia");
                    populatePromise = WinJS.Promise.wrap();
                    break
            }
            return populatePromise
        }, addSubscriptionMedia: function addSubscriptionMedia(media) {
            MS.Entertainment.Platform.PurchaseHelpers.assert(media, "Invalid media item passed into addSubscriptionMedia");
            var serviceIds = [];
            var mediaTypes = [];
            var getServiceIdsPromise = null;
            var populatePromise = null;
            var hasExplicitPrivilege = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser).hasExplicitPrivilege;
            if (MS.Entertainment.Data.List.isListOrArray(media))
                getServiceIdsPromise = MS.Entertainment.Data.List.listToArray(media).then(function _addServiceIdsToArray(mediaItemsArray) {
                    var fileTransferNotifications = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransferNotifications);
                    var explicitContentBlocked = false;
                    var propertySetPromises = [];
                    var mediaPropertySet = new Windows.Foundation.Collections.PropertySet;
                    mediaItemsArray.forEach(function _getMediaData(mediaItem) {
                        MS.Entertainment.Platform.PurchaseHelpers.assert(mediaItem.hasZuneId, "Media passed into addSubscriptionMedia does not have a valid zuneId");
                        if (!hasExplicitPrivilege && mediaItem.isExplicit) {
                            fileTransferNotifications.setItemError(mediaItem.zuneId, MS.Entertainment.Platform.PurchaseHelpers.Error.NS_E_EXPLICIT_CONTENT_BLOCKED);
                            explicitContentBlocked = true
                        }
                        else {
                            serviceIds.push(mediaItem.zuneId);
                            mediaTypes.push(mediaItem.mediaType)
                        }
                        if (mediaItem.hydrated)
                            propertySetPromises.push(MS.Entertainment.Platform.PurchaseHelpers._populatePropertySetForMedia(mediaPropertySet, mediaItem));
                        {}
                    });
                    if (!mediaTypes.length && explicitContentBlocked)
                        return WinJS.Promise.wrapError(MS.Entertainment.Platform.PurchaseHelpers.Error.NS_E_EXPLICIT_CONTENT_BLOCKED);
                    return WinJS.Promise.join(propertySetPromises).then(function returnData() {
                            return {
                                    serviceIds: serviceIds, mediaTypes: mediaTypes, mediaPropertySet: (propertySetPromises.length === 0) ? null : mediaPropertySet
                                }
                        })
                });
            else {
                MS.Entertainment.Platform.PurchaseHelpers.assert(media.hasZuneId, "Media passed into addSubscriptionMedia does not have a valid zuneId");
                serviceIds.push(media.zuneId);
                mediaTypes.push(media.mediaType);
                var mediaPropertySet = new Windows.Foundation.Collections.PropertySet;
                populatePromise = MS.Entertainment.Platform.PurchaseHelpers._populatePropertySetForMedia(mediaPropertySet, media);
                getServiceIdsPromise = populatePromise.then(function returnData() {
                    return {
                            serviceIds: serviceIds, mediaTypes: mediaTypes, mediaPropertySet: mediaPropertySet
                        }
                })
            }
            return getServiceIdsPromise.then(function addIds(data) {
                    if (data.serviceIds.length)
                        return Microsoft.Entertainment.Marketplace.Marketplace.addMedia(data.serviceIds, data.mediaTypes, [], [], data.mediaPropertySet, true);
                    else
                        return WinJS.Promise.wrapError()
                }).then(function addSubscriptionMedia_complete(jsonAddMediaResult) {
                    var addMediaResult = MS.Entertainment.Platform.PurchaseHelpers.parseJsonAddMediaResult(jsonAddMediaResult);
                    return addMediaResult.hydrateLibraryInfoAsync(media).then(function hydrateLibraryIdsAsync_complete() {
                            return addMediaResult
                        })
                })
        }, createAddMediaResult: function createAddMediaResult() {
            return {
                    mediaIdentifiers: [], dbMediaIds: [], dbMediaTypes: [], addMedia: function addMedia(media) {
                            this.concat({mediaIdentifiers: [{
                                        libraryId: media.libraryId, libraryType: media.mediaType, mediaId: media.zuneId
                                    }]})
                        }, concat: function concat(addMediaResult) {
                            var countAdded = 0;
                            if (addMediaResult && addMediaResult.mediaIdentifiers)
                                for (var i = 0; i < addMediaResult.mediaIdentifiers.length; i++)
                                    if (!this.contains(addMediaResult.mediaIdentifiers[i].libraryId, addMediaResult.mediaIdentifiers[i].libraryType)) {
                                        var addMediaResultElement = addMediaResult.mediaIdentifiers[i];
                                        this.mediaIdentifiers.push({
                                            libraryId: addMediaResultElement.libraryId, libraryType: addMediaResultElement.libraryType, mediaId: addMediaResultElement.mediaId
                                        });
                                        this.dbMediaIds.push(addMediaResultElement.libraryId);
                                        this.dbMediaTypes.push(addMediaResultElement.libraryType);
                                        countAdded++
                                    }
                            return countAdded
                        }, contains: function contains(libraryId, libraryType) {
                            for (var i = 0; i < this.mediaIdentifiers.length; i++)
                                if (this.mediaIdentifiers[i].libraryId === libraryId && this.mediaIdentifiers[i].libraryType === libraryType)
                                    return true;
                            return false
                        }, getLibraryIdFromServiceMediaId: function getLibraryIdFromServiceMediaId(mediaId) {
                            if (mediaId && typeof(mediaId) === "string") {
                                mediaId = mediaId.toLowerCase();
                                for (var i = 0; i < this.mediaIdentifiers.length; i++)
                                    if (this.mediaIdentifiers[i].mediaId.toLowerCase() === mediaId)
                                        return this.mediaIdentifiers[i].libraryId
                            }
                            return -1
                        }, _hydrateSingleLibraryInfoAsync: function _hydrateSingleLibraryInfoAsync(mediaItem) {
                            if (!mediaItem || !mediaItem.mediaType)
                                return WinJS.Promise.as();
                            return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(mediaItem).then(function populateVirtualList(virtualList) {
                                    if (virtualList)
                                        return virtualList.itemsFromIndex(0, 0, virtualList.count)
                                }).then(function hydrateListItems(list) {
                                    if (list) {
                                        var hydratedListItems = list.items.map(function hydrateListItem(item) {
                                                return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(item.data)
                                            });
                                        return WinJS.Promise.join(hydratedListItems)
                                    }
                                })
                        }, hydrateLibraryInfoAsync: function hydrateLibraryInfoAsync(media) {
                            var hydratePromise;
                            if (!MS.Entertainment.Data.List.isListOrArray(media))
                                hydratePromise = this._hydrateSingleLibraryInfoAsync(media);
                            else
                                hydratePromise = MS.Entertainment.Data.List.listToArray(media).then(function _gotMediaArray(mediaItemsArray) {
                                    if (mediaItemsArray.length) {
                                        var hydrateLibraryInfoPromises = mediaItemsArray.map(this._hydrateSingleLibraryInfoAsync.bind(this));
                                        return WinJS.Promise.join(hydrateLibraryInfoPromises)
                                    }
                                }.bind(this)).then(function _absorbResult(){});
                            return WinJS.Promise.as(hydratePromise)
                        }
                }
        }, parseJsonAddMediaResult: function parseJsonAddMediaResult(jsonAddMediaResult) {
            var addMediaResult = MS.Entertainment.Platform.PurchaseHelpers.createAddMediaResult();
            addMediaResult.concat(JSON.parse(jsonAddMediaResult));
            return addMediaResult
        }, addMedia: function addMedia(media, filterToOfferIds, inPurchaseFlow) {
            var serviceId = null;
            if (media)
                serviceId = media.zuneId;
            if (!serviceId || MS.Entertainment.Utilities.isEmptyGuid(serviceId))
                return WinJS.Promise.wrapError(new Error("Cannot add non-marketplace content to the collection."));
            if (inPurchaseFlow)
                MS.Entertainment.UI.PurchaseHistoryService.enterPurchaseFlowActivity();
            return new WinJS.Promise(function addMedia_async(c, e, p) {
                    if (!filterToOfferIds)
                        filterToOfferIds = [];
                    var addMediaPromise;
                    try {
                        addMediaPromise = Microsoft.Entertainment.Marketplace.Marketplace.addMedia([serviceId], [media.mediaType], (typeof media.videoType === "number") ? [media.videoType] : [], filterToOfferIds, null, true)
                    }
                    catch(ex) {
                        addMediaPromise = WinJS.Promise.wrapError(ex)
                    }
                    addMediaPromise.then(function addMedia_complete(jsonAddMediaResult) {
                        var addMediaResult = MS.Entertainment.Platform.PurchaseHelpers.parseJsonAddMediaResult(jsonAddMediaResult);
                        return addMediaResult.hydrateLibraryInfoAsync(media).then(function hydrateLibraryIdsAsync_complete() {
                                if (c)
                                    c(addMediaResult);
                                if (inPurchaseFlow)
                                    MS.Entertainment.UI.PurchaseHistoryService.leavePurchaseFlowActivity(false)
                            })
                    }, function addMedia_error(error) {
                        if (error && error.number && typeof error.number === "number")
                            error = error.number;
                        MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_PURCHASE_ERROR_CAPTION), error);
                        if (inPurchaseFlow)
                            MS.Entertainment.UI.PurchaseHistoryService.leavePurchaseFlowActivity(true)
                    })
                })
        }, downloadMedia: function downloadMedia(media, dbMediaIds, dbMediaTypes, isBundleAlbum, inPurchaseFlow, contextMediaId, contextMediaType) {
            if (MS.Entertainment.Utilities.isApp2)
                return WinJS.Promise.wrap([]);
            if (inPurchaseFlow)
                MS.Entertainment.UI.PurchaseHistoryService.enterPurchaseFlowActivity();
            var getClosedCaptionPromiseVideosPromise = null;
            var mediaWithClosedCaptions = [];
            if (getClosedCaptionPromiseVideosPromise)
                getClosedCaptionPromiseVideosPromise.done(function onGetClosedCaptionPromiseVideosPromise() {
                    mediaWithClosedCaptions.forEach(function forEachMedia(ccMedia) {
                        if (ccMedia)
                            Microsoft.Entertainment.Marketplace.Marketplace.getMediaEntitlementsAsync([ccMedia.zuneId]).done(function getMediaEntitlementsAsync_complete(result) {
                                try {
                                    var entitlement = JSON.parse(result).result.entitlements[0];
                                    if (entitlement.best.download.isAvailable) {
                                        var bestDownloadServiceMediaInstanceId = entitlement.best.download.serviceMediaInstanceId || MS.Entertainment.Utilities.EMPTY_GUID;
                                        if (bestDownloadServiceMediaInstanceId !== MS.Entertainment.Utilities.EMPTY_GUID) {
                                            bestDownloadServiceMediaInstanceId = bestDownloadServiceMediaInstanceId.toLowerCase();
                                            for (var iClosedCaptionFile = 0; iClosedCaptionFile < ccMedia.closedCaptionFiles.length; iClosedCaptionFile++) {
                                                var ccFile = ccMedia.closedCaptionFiles[iClosedCaptionFile];
                                                if (ccFile && ccFile.mediaInstanceId && ccFile.mediaInstanceId.toLowerCase() === bestDownloadServiceMediaInstanceId) {
                                                    var ccServiceMediaId = entitlement.serviceMediaId;
                                                    var ccServiceMediaInstanceId = ccFile.mediaInstanceId;
                                                    var ccFileUri = ccFile.fileUri;
                                                    var ccLCID = ccFile.lcid;
                                                    var ccName = ccFile.name;
                                                    Microsoft.Entertainment.ClosedCaptionDownloader.downloadClosedCaptionFileAsync(ccFileUri, ccServiceMediaId, ccServiceMediaInstanceId, ccName, ccLCID)
                                                }
                                            }
                                        }
                                    }
                                }
                                catch(ex) {}
                            }, function failed(info){}.bind(this))
                    })
                }, function failed(info){}.bind(this));
            return new WinJS.Promise(function(c, e, p) {
                    if (dbMediaIds && dbMediaTypes) {
                        var signInProvider = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        signInProvider.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport)).then(function getPassportTicketComplete(ticket) {
                            Microsoft.Entertainment.Marketplace.Marketplace.download(ticket, dbMediaIds, dbMediaTypes, contextMediaId || 0, contextMediaType || 0).then(function downloadComplete(result) {
                                var firstErrorCode = 0;
                                var successfulTaskIds = [];
                                for (var i = 0; i < result.hresults.size; i++) {
                                    var errorCode = result.hresults[i];
                                    if (isBundleAlbum && errorCode !== 0 && dbMediaTypes[i] === Microsoft.Entertainment.Queries.ObjectType.video)
                                        errorCode = 0;
                                    if (errorCode === 0) {
                                        successfulTaskIds.push(result.taskIds[i]);
                                        if (media)
                                            MS.Entertainment.Utilities.Telemetry.logDownloadHappened(media)
                                    }
                                    else if (firstErrorCode === 0)
                                        if (errorCode < 0)
                                            firstErrorCode = errorCode
                                }
                                if (firstErrorCode !== 0)
                                    MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_DOWNLOAD_ERROR_CAPTION), firstErrorCode);
                                if (c)
                                    c(successfulTaskIds);
                                if (inPurchaseFlow)
                                    MS.Entertainment.UI.PurchaseHistoryService.leavePurchaseFlowActivity(false)
                            }, function downloadError(error) {
                                if (error && error.number && typeof error.number === "number")
                                    error = error.number;
                                MS.Entertainment.UI.Shell.showError(String.load(String.id.IDS_DOWNLOAD_ERROR_CAPTION), error);
                                if (inPurchaseFlow)
                                    MS.Entertainment.UI.PurchaseHistoryService.leavePurchaseFlowActivity(true)
                            })
                        }, function getPassportTicketError(error) {
                            if (inPurchaseFlow)
                                MS.Entertainment.UI.PurchaseHistoryService.leavePurchaseFlowActivity(true)
                        })
                    }
                })
        }, itemSupportsPurchase: function itemSupportsPurchase(mediaItem) {
            if (mediaItem) {
                var mediaType = mediaItem.mediaType;
                if (mediaType === Microsoft.Entertainment.Queries.ObjectType.game || mediaType === Microsoft.Entertainment.Queries.ObjectType.video || mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason || mediaType === Microsoft.Entertainment.Queries.ObjectType.album || mediaType === Microsoft.Entertainment.Queries.ObjectType.track)
                    return true
            }
            return false
        }, isItemPurchasedAsync: function isItemPurchasedAsync(mediaItem, useOnlyStreamRights) {
            var ticketAsync = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn).getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport));
            return ticketAsync.then(function getPassportTicket_complete(ticket) {
                    var detailsAsync = Microsoft.Entertainment.Marketplace.Marketplace.getAssetDetails(ticket, [mediaItem.serviceId], true, useOnlyStreamRights ? [Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.purchaseStream, Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.seasonPurchaseStream] : [Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.purchase, Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.purchaseStream, Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.seasonPurchase, Microsoft.Entertainment.Marketplace.MarketplaceMediaRights.seasonPurchaseStream]);
                    return detailsAsync.then(function getAssetDetails_complete(jsonAssetDetails) {
                            var assetDetails = JSON.parse(jsonAssetDetails);
                            return WinJS.Promise.wrap(assetDetails.results[0].rights.length > 0)
                        }.bind(this), function getAssetDetails_error(e) {
                            return WinJS.Promise.wrap(false)
                        }.bind(this))
                }.bind(this), function getPassportTicket_error(e) {
                    return WinJS.Promise.wrap(false)
                }.bind(this))
        }, getItemPurchaseAndRentStateAsync: function getItemPurchaseAndRentStateAsync(mediaItem) {
            if (mediaItem.CanPurchaseStream !== undefined)
                return WinJS.Promise.wrap({
                        canPurchaseStream: mediaItem.CanPurchaseStream, canPurchaseDownload: mediaItem.CanPurchaseDownload, canRentStream: mediaItem.CanRentStream, canRentDownload: mediaItem.CanRentDownload
                    });
            return Microsoft.Entertainment.Marketplace.Marketplace.getMediaEntitlementsAsync([mediaItem.zuneId]).then(function getMediaEntitlements_complete(result) {
                    result = JSON.parse(result).result.entitlements[0];
                    return WinJS.Promise.wrap({
                            canPurchaseStream: result.purchase.stream.isAvailable, canPurchaseDownload: result.purchase.download.isAvailable, canRentStream: result.rent.stream.isAvailable, canRentDownload: result.rent.download.isAvailable
                        })
                })
        }
})
