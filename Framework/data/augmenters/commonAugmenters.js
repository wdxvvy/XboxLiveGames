/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/Data/factory.js");
(function(MSE, undefined) {
    var alias = MSE.Data.Property.alias;
    var augment = MSE.Data.Property.augment;
    var convert = MSE.Data.Property.convert;
    var convertNoDeflate = MSE.Data.Property.convertNoDeflate;
    var convertOriginal = MSE.Data.Property.convertOriginal;
    var convertOriginalNoDeflate = MSE.Data.Property.convertOriginalNoDeflate;
    var list = MSE.Data.Property.list;
    var listWithContext = MSE.Data.Property.listWithContext;
    var format = MSE.Data.Property.format;
    var collect = MSE.Data.Property.collect;
    var filter = MSE.Data.Property.filter;
    var filterArray = MSE.Data.Property.filterArray;
    var value = MSE.Data.Property.value;
    var hydrated = MSE.Data.Property.hydrated;
    var hydratedRequired = MSE.Data.Property.hydratedRequired;
    var covertFeatureOptionsMusicOrVideo = {feature: [Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace, Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace, Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace]};
    WinJS.Namespace.defineWithParent(MSE, "Data.Filter.Marketplace", {filterUnsupportedFlexItems: function filterUnsupportedFlexItems(item) {
            return item && !(item.link.type === MSE.Data.Augmenter.Marketplace.EditorialType.Movie || item.link.type === MSE.Data.Augmenter.Marketplace.EditorialType.Series || item.link.type === MSE.Data.Augmenter.Marketplace.EditorialType.Album || item.link.type === MSE.Data.Augmenter.Marketplace.EditorialType.Artist || item.link.type === MSE.Data.Augmenter.Marketplace.EditorialType.MovieTrailer || item.link.type === MSE.Data.Augmenter.Marketplace.EditorialType.Season || item.link.type === MSE.Data.Augmenter.Marketplace.EditorialType.Episode)
        }});
    var xboxCatalogIdPrefix = "66acd000-77fe-1000-9115-d802";
    var classicWindowsCatalogIdPrefix = "66acd000-77fe-1000-9115-d804";
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Data.Factory.Common");
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.Common", {
        createMediaItemFromEditorialItem: function createMediaItemFromEditorialItem(editorialItem) {
            var augmentation = MS.Entertainment.Utilities.getEditorialItemAugmentation(editorialItem && editorialItem.link && editorialItem.link.type);
            return MSE.Data.augment(editorialItem, augmentation)
        }, combineTitleAndSubTitle: function combineTitleAndSubTitle(mediaItem) {
                var result = String.empty;
                if (mediaItem)
                    if (!mediaItem.mainTitle)
                        result = mediaItem.subTitle;
                    else if (!mediaItem.subTitle)
                        result = mediaItem.mainTitle;
                    else
                        result = String.load(String.id.IDS_TITLE_SUBTITLE).format(mediaItem.mainTitle, mediaItem.subTitle);
                return result
            }, tvSeasonServiceId: function tvSeasonServiceId(season) {
                if (season)
                    return "{0}_s{1}".format(season.seriesId, season.seasonNumber);
                else
                    return null
            }, hasSmartGlassActivities: function hasSmartGlassActivities(hasActivities) {
                return false
            }, zuneDeviceTypesValidate: function zuneDeviceTypesValidate(deviceTypes) {
                newDeviceTypes = [];
                if (Array.isArray(deviceTypes))
                    deviceTypes.forEach(function validate(deviceType) {
                        if (deviceType === MS.Entertainment.Data.Augmenter.Marketplace.zuneDeviceType._pc)
                            newDeviceTypes.push(MS.Entertainment.Data.Augmenter.Marketplace.zuneDeviceType.pc);
                        else
                            newDeviceTypes.push(deviceType)
                    });
                return newDeviceTypes
            }, xboxGameWebDetailsUriFromTitleId: function xboxGameWebDetailsUriFromTitleId(data) {
                if (data)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_GamesCatalog, ["Title", data.toString(10)]);
                else
                    return null
            }, windowsAppWebDetailsUri: function windowsAppWebDetailsUri(id) {
                if (id)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_WindowsAppMarketplace, [id]);
                else
                    return null
            }, movieWebDetailsUri: function movieWebDetailsUri(id) {
                if (id)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_PCMarketplace, ["redirect"], {
                            type: "movie", id: id, target: "web"
                        });
                else
                    return null
            }, tvSeriesWebDetailsUri: function tvSeriesWebDetailsUri(id) {
                if (id)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_PCMarketplace, ["redirect"], {
                            type: "tvseries", id: id, target: "web"
                        });
                else
                    return null
            }, tvSeasonWebDetailsUri: function tvSeasonWebDetailsUri(seasonId) {
                if (seasonId)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_PCMarketplace, ["redirect"], {
                            type: "tvseries", id: seasonId, target: "web"
                        });
                else
                    return null
            }, tvEpisodeWebDetailsUri: function tvEpisodeWebDetailsUri(id) {
                if (id)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_PCMarketplace, ["redirect"], {
                            type: "tvepisode", id: id, target: "web"
                        });
                else
                    return null
            }, musicArtistWebDetailsUri: function musicArtistWebDetailsUri(id) {
                if (id)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_PCMarketplace, ["redirect"], {
                            type: "artist", id: id
                        });
                else
                    return null
            }, musicAlbumWebDetailsUri: function musicAlbumWebDetailsUri(id) {
                if (id)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_PCMarketplace, ["redirect"], {
                            type: "album", id: id
                        });
                else
                    return null
            }, musicTrackWebDetailsUri: function musicTrackWebDetailsUri(id) {
                if (id)
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_PCMarketplace, ["redirect"], {
                            type: "track", id: id
                        });
                else
                    return null
            }, videoWebDetailsUri: function videoWebDetailsUri(data) {
                var result = null;
                if (!data)
                    return result;
                switch (data.videoType) {
                    case Microsoft.Entertainment.Queries.VideoType.movie:
                        result = MSE.Data.Factory.Common.movieWebDetailsUri(data.serviceId);
                        break;
                    case Microsoft.Entertainment.Queries.VideoType.tvEpisode:
                        result = MSE.Data.Factory.Common.tvEpisodeWebDetailsUri(data.serviceId);
                        break;
                    case Microsoft.Entertainment.Queries.VideoType.musicVideo:
                    case Microsoft.Entertainment.Queries.VideoType.other:
                        break;
                    default:
                        MS.Entertainment.Data.Factory.Common.assert(false, "Unknown videoType in videoWebDetailsUri");
                        break
                }
                return result
            }, personWebDetailsUri: function personWebDetailsUri(data) {
                var result = null;
                if (!data)
                    return result;
                switch (data.personType) {
                    case Microsoft.Entertainment.Queries.PersonType.artist:
                    case Microsoft.Entertainment.Queries.PersonType.primaryArtist:
                        result = MSE.Data.Factory.Common.musicArtistWebDetailsUri(data.serviceId);
                        break;
                    case Microsoft.Entertainment.Queries.PersonType.actor:
                    case Microsoft.Entertainment.Queries.PersonType.composer:
                    case Microsoft.Entertainment.Queries.PersonType.conductor:
                    case Microsoft.Entertainment.Queries.PersonType.creator:
                    case Microsoft.Entertainment.Queries.PersonType.director:
                    case Microsoft.Entertainment.Queries.PersonType.influencer:
                    case Microsoft.Entertainment.Queries.PersonType.producer:
                    case Microsoft.Entertainment.Queries.PersonType.writer:
                        break;
                    default:
                        MS.Entertainment.Data.Factory.Common.assert(false, "Unknown personType in personWebDetailsUri");
                        break
                }
                return result
            }, xboxGameWebDetailsUri: function xboxGameWebDetailsUri(data) {
                var result = null;
                if (data)
                    result = (data.titleId) ? MSE.Data.Factory.Common.xboxGameWebDetailsUriFromTitleId(data.titleId) : null;
                return result
            }, gameWebDetailsUri: function gameWebDetailsUri(data) {
                var result = null;
                if (!data)
                    return result;
                switch (data.defaultPlatformType) {
                    case MSE.Data.Augmenter.GamePlatform.Modern:
                        result = MSE.Data.Factory.Common.windowsAppWebDetailsUri(data.productGuid);
                        break;
                    default:
                        result = MSE.Data.Factory.Common.xboxGameWebDetailsUri(data);
                        break
                }
                return result
            }, webDetailsUri: function webDetailsUri(data) {
                var result = null;
                if (!data)
                    return result;
                try {
                    switch (data.mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.game:
                            result = MSE.Data.Factory.Common.gameWebDetailsUri(data);
                            break;
                        default:
                            MS.Entertainment.Data.Factory.Common.assert(false, "Unknown mediaType in webDetailsUri");
                            break
                    }
                }
                catch(error) {
                    result = null
                }
                return result
            }, imageUri: function imageUri(data) {
                var result;
                var imageType = MS.Entertainment.ImageIdType.undefinedImageIdType;
                var imageId;
                var imageChildId;
                if (!data || data.mediaType === null || data.mediaType === undefined)
                    return result;
                switch (data.mediaType) {
                    case Microsoft.Entertainment.Queries.ObjectType.game:
                        imageType = MS.Entertainment.ImageIdType.xboxGame;
                        imageId = data.titleId;
                        break
                }
                if (imageId && imageType !== MS.Entertainment.ImageIdType.undefinedImageIdType)
                    result = MS.Entertainment.UI.Shell.ImageLoader.makeCatalogImageUri(imageId, imageType, null, true, null, null, imageChildId);
                return result
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter", {
        GamePlatform: {
            PC: "PC", Xbox: "Xbox", Phone: "Phone", Modern: "Modern", Web: "Web", Unknown: "Unknown"
        }, GameTitleType: {
                game: "Game", application: "App"
            }, GameSupportedPlatform: {
                Xbox360: "Xbox360", WebGames: "WebGames"
            }, ServiceTypes: {
                editorialItem: 1, wmis: 2, audioAd: 3
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {zuneDeviceType: {
            all: "All", pc: "WindowsPC", xblWinClient: "XblWinClient", xbox360: "Xbox360", zuneDevice: "Zune3.0", zuneMobile: "ZuneMobile", _pc: "PC/Windows"
        }});
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.Library", {scaleGroupHintNumber: function scaleGroupHintNumber(number) {
            var result = 0;
            if (!isNaN(number))
                result = Math.log(number + 1);
            return result
        }});
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.Library", {
        mediaTypeToSubTypeMappings: (function() {
            var mapping = {};
            mapping[Microsoft.Entertainment.Queries.ObjectType.album] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.game] = [Microsoft.Entertainment.Queries.GameType, Microsoft.Entertainment.Queries.GameTitleType];
            mapping[Microsoft.Entertainment.Queries.ObjectType.person] = Microsoft.Entertainment.Queries.PersonType;
            mapping[Microsoft.Entertainment.Queries.ObjectType.playlist] = Microsoft.Entertainment.Queries.PlaylistType;
            mapping[Microsoft.Entertainment.Queries.ObjectType.smartDJ] = Microsoft.Entertainment.Queries.SmartDJObjectTypes;
            mapping[Microsoft.Entertainment.Queries.ObjectType.track] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.tvSeason] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.tvSeries] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.video] = Microsoft.Entertainment.Queries.VideoType;
            return mapping
        })(), mediaTypeToSubTypeNameMappings: (function() {
                var mapping = {};
                mapping[Microsoft.Entertainment.Queries.ObjectType.album] = null;
                mapping[Microsoft.Entertainment.Queries.ObjectType.game] = ["gameType", "gameTitleType"];
                mapping[Microsoft.Entertainment.Queries.ObjectType.person] = "personType";
                mapping[Microsoft.Entertainment.Queries.ObjectType.playlist] = "playlistType";
                mapping[Microsoft.Entertainment.Queries.ObjectType.smartDJ] = "smartDJType";
                mapping[Microsoft.Entertainment.Queries.ObjectType.track] = null;
                mapping[Microsoft.Entertainment.Queries.ObjectType.tvSeason] = null;
                mapping[Microsoft.Entertainment.Queries.ObjectType.tvSeries] = null;
                mapping[Microsoft.Entertainment.Queries.ObjectType.video] = "videoType";
                return mapping
            })(), mediaTypeToRatingTypeMappings: (function() {
                var mapping = {};
                if (Microsoft.Entertainment.Platform.RatingType) {
                    mapping[Microsoft.Entertainment.Queries.ObjectType.tvSeries] = Microsoft.Entertainment.Platform.RatingType.tvSeries;
                    mapping[Microsoft.Entertainment.Queries.ObjectType.video] = Microsoft.Entertainment.Platform.RatingType.movie
                }
                return mapping
            })(), createGroupHintsListItemFactory: function createGroupHintsListItemFactory(augmentation) {
                var innerFactory = MSE.Data.Factory.createListItemAugmentationFactory(augmentation, null, MSE.Data.Factory.GroupHintWrapper);
                var groupHintsListItem = function groupHintsListItem(sourceItem, context) {
                        var result = innerFactory(sourceItem);
                        if (result && result.data && !isNaN(context))
                            result.data.largestTotalCount = context;
                        return result
                    };
                groupHintsListItem.listItemFactory = innerFactory.listItemFactory;
                return groupHintsListItem
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Factory.Marketplace.Rights", {
        hasRight: function hasRight(rights, rightTypes) {
            var rightTypeIndex,
                rightIndex;
            var foundRight = false;
            if (rights && rightTypes)
                for (rightIndex in rights) {
                    for (rightTypeIndex in rightTypes)
                        if (rights[rightIndex] && rights[rightIndex].licenseRight === rightTypes[rightTypeIndex]) {
                            foundRight = true;
                            break
                        }
                    if (foundRight)
                        break
                }
            return foundRight
        }, hasPreviewRight: function hasPreviewRight(rights) {
                return MSE.Data.Factory.Marketplace.Rights.hasRight(rights, [MSE.Data.Augmenter.Marketplace.RightType.preview])
            }
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter", {MediaItem: MSE.Data.define(null, {
            serviceId: String.empty, serviceIdType: String.empty, zuneId: String.empty, canonicalId: String.empty, libraryId: hydrated(value(-1)), impressionGuid: hydrated(value(null)), mediaType: -1, name: hydratedRequired(value(String.empty)), title: hydratedRequired(convertNoDeflate("name", MSE.Data.Factory.self)), primaryImageUri: hydrated(convertNoDeflate(String.empty, MSE.Data.Factory.Common.imageUri, String.empty)), webUri: convertNoDeflate(String.empty, MSE.Data.Factory.Common.webDetailsUri, String.empty), parent: null, isValid: {get: function() {
                        return this.hasServiceId || this.inCollection || this.hasCanonicalId || this.hasZuneId
                    }}, inCollection: (function() {
                    var property = convertNoDeflate(String.empty, function get_inCollection(that) {
                            return MS.Entertainment.Utilities.isValidLibraryId(that.libraryId)
                        });
                    property.cacheable = false;
                    return property
                })(), hasServiceId: {get: function() {
                        return !MS.Entertainment.Utilities.isEmptyGuid(this.serviceId)
                    }}, hasCanonicalId: {get: function() {
                        return !MS.Entertainment.Utilities.isEmptyGuid(this.canonicalId)
                    }}, hasZuneId: {get: function() {
                        return !MS.Entertainment.Utilities.isEmptyGuid(this.zuneId)
                    }}, isRemovable: {get: function() {
                        return (this.inCollection && (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.album || this.mediaType === Microsoft.Entertainment.Queries.ObjectType.tvSeason || this.mediaType === Microsoft.Entertainment.Queries.ObjectType.video || this.mediaType === Microsoft.Entertainment.Queries.ObjectType.playlist || (this.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && !(this.playlistId >= 0))))
                    }}, canTransfer: {get: function get_canTransfer() {
                        switch (this.mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.person:
                            case Microsoft.Entertainment.Queries.ObjectType.album:
                                return this.RemoteTracksCount < this.TotalTracksCount;
                            case Microsoft.Entertainment.Queries.ObjectType.track:
                                return this.RemoteFilesCount === 0 && this.LocalFilesCount > 0;
                            default:
                                return false
                        }
                    }}, canDownload: {get: function get_canDownload() {
                        switch (this.mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.person:
                            case Microsoft.Entertainment.Queries.ObjectType.album:
                                return this.LocalTracksCount < this.TotalTracksCount;
                            case Microsoft.Entertainment.Queries.ObjectType.track:
                                return (this.LocalFilesCount + this.OfflineFilesCount === 0) && this.RemoteFilesCount > 0;
                            default:
                                return false
                        }
                    }}, hasRemoteContent: {get: function get_hasRemoteContent() {
                        switch (this.mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.person:
                            case Microsoft.Entertainment.Queries.ObjectType.album:
                                return this.RemoteTracksCount > 0;
                            case Microsoft.Entertainment.Queries.ObjectType.track:
                                return this.RemoteFilesCount > 0;
                            default:
                                return false
                        }
                    }}, hasLocalContent: {get: function get_hasLocalContent() {
                        switch (this.mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.person:
                            case Microsoft.Entertainment.Queries.ObjectType.album:
                                return this.LocalTracksCount > 0;
                            case Microsoft.Entertainment.Queries.ObjectType.track:
                                return (this.LocalFilesCount + this.OfflineFilesCount) > 0;
                            case Microsoft.Entertainment.Queries.ObjectType.video:
                                return this.LocalFilesCount > 0;
                            default:
                                return true
                        }
                    }}, isEqual: function MediaItem_GenericComparer(mediaItem2) {
                    var isSame = false;
                    if (mediaItem2 && ((!MS.Entertainment.Utilities.isEmptyGuid(this.serviceId) && mediaItem2.serviceId === this.serviceId) || (!MS.Entertainment.Utilities.isEmptyGuid(this.canonicalId) && mediaItem2.canonicalId === this.canonicalId) || (!MS.Entertainment.Utilities.isEmptyGuid(this.zuneId) && mediaItem2.zuneId === this.zuneId) || (MS.Entertainment.Utilities.isValidLibraryId(this.libraryId) && mediaItem2.libraryId === this.libraryId) || (this.titleId && mediaItem2.titleId === this.titleId) || (this.filePath && mediaItem2.filePath === this.filePath) || (this.activationFilePath && mediaItem2.activationFilePath === this.activationFilePath)))
                        isSame = true;
                    return isSame
                }, isChildOf: function isChildOf(mediaItem2) {
                    var isChild = false;
                    if (mediaItem2 && this.parent)
                        if ((!MS.Entertainment.Utilities.isEmptyGuid(mediaItem2.zuneId) && mediaItem2.zuneId === this.parent.zuneId) || (!MS.Entertainment.Utilities.isEmptyGuid(mediaItem2.canonicalId) && mediaItem2.canonicalId === this.parent.canonicalId))
                            isChild = true;
                        else
                            isChild = this.parent.isChildOf(mediaItem2);
                    return isChild
                }, sharesParentWith: function sharesParentWith(mediaItem2) {
                    var sharesParent = false;
                    if (mediaItem2 && mediaItem2.parent && this.parent) {
                        if ((!MS.Entertainment.Utilities.isEmptyGuid(mediaItem2.parent.zuneId) && mediaItem2.parent.zuneId === this.parent.zuneId) || (!MS.Entertainment.Utilities.isEmptyGuid(mediaItem2.parent.canonicalId) && mediaItem2.parent.canonicalId === this.parent.canonicalId))
                            sharesParent = true;
                        else
                            sharesParent = this.sharesParentWith(mediaItem2.parent);
                        if (!sharesParent)
                            sharesParent = this.parent.sharesParentWith(mediaItem2)
                    }
                    return sharesParent
                }, sharesDirectParentWith: function sharesDirectParentWith(mediaItem2) {
                    var sharesParent = false;
                    if (mediaItem2 && mediaItem2.parent && this.parent && this.parent.isEqual)
                        sharesParent = this.parent.isEqual(mediaItem2.parent);
                    return sharesParent
                }, canDownload: {get: function get_canDownload() {
                        return this.CanPurchaseDownload || this.CanRentDownload || this.CanSubscriptionDownload
                    }}, canPlay: {get: function get_canPlay() {
                        return this.CanPlayLocally || this.CanStream
                    }}, canStream: {get: function get_canStream() {
                        return this.CanPurchaseStream || this.CanRentStream || this.CanFreeStream || this.CanSubscriptionStream
                    }}
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Common", {
        ErrorCode: MSE.Data.define(null, {
            exactMatches: convert("Envelope.Body.LookupFullParamResponse.LookupFullParamResult.ExactResultsCount", MSE.Data.Factory.intNumber, 0), errorCodeUrl: alias("Envelope.Body.LookupFullParamResponse.LookupFullParamResult.ExactMatch.ErrorArticleUrl", "http://go.microsoft.com/fwlink/?LinkId=246305")
        }), IntroPanelContent: MSE.Data.define(null, {
                title: convertOriginal("Title", MSE.Data.Factory.normalizeTextDirection, String.empty), details: convert("BodyText.p", MSE.Data.Factory.arrayJoinWithNewLines, String.empty), subtitle: convertOriginal("Subtitle", MSE.Data.Factory.normalizeTextDirection, String.empty)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Library", {
        MediaItem: MSE.Data.derive(MSE.Data.Augmenter.MediaItem, null, {
            libraryId: convert("ObjectId", MSE.Data.Factory.intNumber, -1), serviceId: convert("ServiceMediaId", MSE.Data.Factory.guid, String.empty, covertFeatureOptionsMusicOrVideo), serviceIdType: "ZuneCatalog", zuneId: convert("ServiceMediaId", MSE.Data.Factory.guid, String.empty, covertFeatureOptionsMusicOrVideo), imageUri: hydratedRequired(alias("ImageUrl", null)), imageResizeUri: hydratedRequired(alias("ImageUrl", null)), fromCollection: true, canonicalId: convert("BingId", MSE.Data.Factory.guid, String.empty, covertFeatureOptionsMusicOrVideo), collectionState: alias("CollectionState", null), canSubscriptionDownload: alias("CanSubscriptionDownload", false), inCollection: (function() {
                    var property = convertNoDeflate(String.empty, function get_inCollection(that) {
                            return MS.Entertainment.Utilities.isValidLibraryId(that.libraryId) && that.collectionState !== Microsoft.Entertainment.Queries.ItemCollectionState.notInCollection && that.collectionState !== Microsoft.Entertainment.Queries.ItemCollectionState.notInCollectionValidRights && that.collectionState !== Microsoft.Entertainment.Queries.ItemCollectionState.notInCollectionTakenDown && that.collectionState !== Microsoft.Entertainment.Queries.ItemCollectionState.notInCollectionValidRights
                        });
                    property.cacheable = false;
                    return property
                })()
        }), Genre: MSE.Data.derive(MSE.Data.Augmenter.MediaItem, null, {
                libraryId: convert("ObjectId", MSE.Data.Factory.intNumber, -1), value: convert("ObjectId", MSE.Data.Factory.intNumber, -1), name: alias("Name", String.empty), label: alias("Name", String.empty), mediaType: Microsoft.Entertainment.Queries.ObjectType.genre, type: "genre"
            }), LibraryResultSet: MSE.Data.define(null, {totalCount: alias("TotalCount", -1)}), GroupItemHintBase: MSE.Data.define(null, {
                _title: convert("Name", MSE.Data.Factory.stringOrUnknown), title: convertOriginalNoDeflate("_title", MSE.Data.Factory.normalizeTextDirection, String.empty), groupKey: convertOriginalNoDeflate("title", MSE.Data.Factory.self, String.empty), firstItemIndexSourceHint: alias("DBOffsetIndex", 0)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Library", {GroupItemHint: MSE.Data.derive(MSE.Data.Augmenter.Library.GroupItemHintBase, null, {
            _title: convert("Name", MSE.Data.Factory.stringOrUnknown), title: convertOriginalNoDeflate("_title", MSE.Data.Factory.normalizeTextDirection, String.empty), groupKey: convertOriginalNoDeflate("title", MSE.Data.Factory.self, String.empty), description: convert("ItemsCount", MSE.Data.Factory.string, String.empty), totalCount: alias("ItemsCount", 0), largestTotalCount: 0, totalCountScaled: convert("ItemsCount", MSE.Data.Factory.Library.scaleGroupHintNumber, 0), largestTotalCountScaled: convertNoDeflate("largestTotalCount", MSE.Data.Factory.Library.scaleGroupHintNumber, 0), firstItemIndexSourceHint: alias("DBOffsetIndex", 0), subGroupHints: augment("SubGroups", MSE.Data.Augmenter.Library.GroupItemHintBase, null)
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Library", {
        MediaItemContainer: MSE.Data.derive(MSE.Data.Augmenter.Library.MediaItem, null, {knownChildServiceIds: null}), GenresResult: MSE.Data.derive(MSE.Data.Augmenter.Library.LibraryResultSet, null, {items: list("ResultSet", MSE.Data.Augmenter.Library.Genre, null)}), GroupsAugmentation: MSE.Data.define(null, {
                items: listWithContext("Groups", "LargestGroupItemsCount", MSE.Data.Factory.Library.createGroupHintsListItemFactory(MSE.Data.Augmenter.Library.GroupItemHint)), totalCount: alias("TotalCount")
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        EditorialType: {
            Movie: "Movie", Series: "Series", Album: "Album", Artist: "Artist", MusicVideo: "MusicVideo", Track: "Track", Playlist: "Playlist", Game: "Game", MovieTrailer: "MovieTrailer", Hub: "Hub", Season: "Season", Episode: "Episode"
        }, RightType: {
                albumPurchase: "AlbumPurchase", preview: "Preview", purchase: "Purchase", purchaseStream: "PurchaseStream", rent: "Rent", rentStream: "RentStream", stream: "Stream", freeStream: "FreeStream", subscription: "Subscription", subscriptionFree: "SubscriptionFree", seasonPurchase: "SeasonPurchase", seasonPurchaseStream: "SeasonPurchaseStream"
            }, IntroPanelResult: MSE.Data.define(null, {item: augment("ContentManifest.Content", MSE.Data.Augmenter.Common.IntroPanelContent)})
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        MediaItem: MSE.Data.derive(MSE.Data.Augmenter.MediaItem, null, {
            mediaType: null, serviceIdType: "ZuneCatalog", serviceId: convert("id", MSE.Data.Factory.guid, String.empty), zuneId: convert("id", MSE.Data.Factory.guid, String.empty), canonicalId: convert("id", MSE.Data.Factory.guid, String.empty), contentType: alias("type", String.empty), hasActivities: convert("HasActivities", MSE.Data.Factory.Common.hasSmartGlassActivities, false)
        }), Right: MSE.Data.define(null, {
                mediaInstanceId: convert("mediaInstanceId", MSE.Data.Factory.guid, String.empty), offerId: convert("offerId", MSE.Data.Factory.guid, String.empty), licenseRight: alias("licenseRight", String.empty), videoDefinition: alias("videoDefinition", String.empty), videoFileUrl: alias("videoFileUrl", String.empty), clientTypes: convert("clientTypes.clientType", MSE.Data.Factory.Common.zuneDeviceTypesValidate, MSE.Data.Factory.array), paymentInstruments: alias("paymentTypes.paymentType", MSE.Data.Factory.array)
            }), EditorialItem: MSE.Data.define(null, {
                id: alias("id", String.empty), libraryId: hydrated(value(-1)), serviceIdType: "ZuneCatalog", serviceId: convert("link.target", MSE.Data.Factory.guid, String.empty), zuneId: convert("link.target", MSE.Data.Factory.guid, String.empty), canonicalId: MS.Entertainment.Utilities.EMPTY_GUID, type: alias("link.type", String.empty), target: alias("link.target", String.empty), editorialTitle: convertOriginal("title", MSE.Data.Factory.normalizeTextDirection, String.empty), primaryText: convertOriginal("title", MSE.Data.Factory.normalizeTextDirection, String.empty), secondaryText: convertOriginal("text", MSE.Data.Factory.normalizeTextDirection, String.empty), title: String.empty, text: convertOriginal("text", MSE.Data.Factory.normalizeTextDirection, String.empty), imageId: convert("image.id", MSE.Data.Factory.guid, String.empty), backgroundImageId: alias("backgroundImage.id", String.empty), serviceType: MSE.Data.Augmenter.ServiceTypes.editorialItem
            }), EditorialHub: MSE.Data.define(null, {
                mediaType: Microsoft.Entertainment.Queries.ObjectType.editorial, id: alias("id", String.empty), libraryId: hydrated(value(-1)), serviceIdType: "ZuneCatalog", serviceId: convert("link.target", MSE.Data.Factory.guid, String.empty), zuneId: convert("link.target", MSE.Data.Factory.guid, String.empty), canonicalId: MS.Entertainment.Utilities.EMPTY_GUID, type: alias("link.type", String.empty), target: alias("link.target", String.empty), editorialTitle: convertOriginal("title", MSE.Data.Factory.normalizeTextDirection, String.empty), primaryText: convertOriginal("title", MSE.Data.Factory.normalizeTextDirection, String.empty), secondaryText: convertOriginal("text", MSE.Data.Factory.normalizeTextDirection, String.empty), title: String.empty, text: convertOriginal("text", MSE.Data.Factory.normalizeTextDirection, String.empty), imageId: convert("image.id", MSE.Data.Factory.guid, String.empty), backgroundImageId: alias("backgroundImage.id", String.empty), serviceType: MSE.Data.Augmenter.ServiceTypes.editorialItem, isNotMedia: true
            }), GenreQueryOptions: MSE.Data.define(null, {
                genreId: convert("id", MSE.Data.Factory.guid, String.empty), parentGenreId: convert("parentId", MSE.Data.Factory.guid, String.empty)
            }), ClosedCaption: MSE.Data.define(null, {
                mediaInstanceId: convert("mediaInstanceId", MSE.Data.Factory.guid, String.empty), fileUri: alias("fileUri", String.empty), lcid: alias("lcid", String.empty), name: alias("name", String.empty)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        MediaItemContainer: MSE.Data.derive(MSE.Data.Augmenter.Library.MediaItem, null, {knownChildServiceIds: null}), PrefixData: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MediaItem, null, {
                serviceId: convert("id", MSE.Data.Factory.guid, String.empty), zuneId: alias("id", String.empty), name: convertOriginal("title.$value", MSE.Data.Factory.normalizeTextDirection, String.empty), type: alias("type", String.empty), score: convert("score", MSE.Data.Factory.intNumber, 0)
            }), Genre: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.MediaItem, null, {
                serviceId: convert("id", MSE.Data.Factory.guid, String.empty), name: alias("title", String.empty), mediaType: Microsoft.Entertainment.Queries.ObjectType.genre
            }), EditorialItemsEntry: MSE.Data.define(null, {
                id: alias("id", String.empty), editorialItems: augment("editorialItems.editorialItem", MS.Entertainment.Data.Factory.Common.createMediaItemFromEditorialItem, null)
            }), GenrePivotValue: MSE.Data.define(null, {
                queryOptions: augment(String.empty, MSE.Data.Augmenter.Marketplace.GenreQueryOptions, null), itemQueryOptions: augment(String.empty, MSE.Data.Augmenter.Marketplace.GenreQueryOptions, null), itemQuery: {get: function() {
                            return MS.Entertainment.Data.Query.musicSubGenre
                        }}
            }), EditorialResult: MSE.Data.define(null, {
                items: filter("feed.entry[0].editorialItems.editorialItem", MS.Entertainment.Data.Filter.Marketplace.filterUnsupportedFlexItems, MS.Entertainment.Data.Factory.Common.createMediaItemFromEditorialItem, null), name: alias("feed.title.$value", MSE.Data.Factory.normalizeTextDirection, String.empty)
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {RichGenre: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.Genre, null, {
            name: alias(["title.$value", "title"], String.empty), serviceId: alias("id", String.empty), parentServiceId: alias("parentId", String.empty), isRoot: convert("isRoot", MSE.Data.Factory.boolFromString, true), label: alias(["title.$value", "title"], String.empty), value: augment(String.empty, MSE.Data.Augmenter.Marketplace.GenrePivotValue), items: null, selected: false, expanded: false, tabPanelId: null, childIds: null, ariaLevel: 1
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {SubRichGenre: MSE.Data.derive(MSE.Data.Augmenter.Marketplace.RichGenre, null, {
            items: undefined, expanded: undefined, ariaLevel: 2
        })});
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {
        GenericMediaResult: MSE.Data.define(null, {item: augment("entry", MSE.Data.Augmenter.Marketplace.MediaItem, null)}), PrefixResult: MSE.Data.define(null, {items: list("feed.entry", MSE.Data.Augmenter.Marketplace.PrefixData, null)}), GenresResult: MSE.Data.define(null, {items: list("feed.entry", MSE.Data.Augmenter.Marketplace.RichGenre, null)}), SubGenresResult: MSE.Data.define(null, {items: list("entry.subGenres.genre", MSE.Data.Augmenter.Marketplace.SubRichGenre, null)}), EntriesResult: MSE.Data.define(null, {entries: list("feed.entry", MSE.Data.Augmenter.Marketplace.EditorialItemsEntry, null)})
    });
    WinJS.Namespace.defineWithParent(MSE, "Data.Augmenter.Marketplace", {MediaSharePackage: MSE.Data.define(null, {
            mediaId: alias("serviceId", String.empty), mediaType: alias("mediaType", 0), mediaTitle: alias("name", String.empty), title: alias("name", String.empty), description: alias("description", String.empty), text: alias("name", String.empty), uri: alias("webUri", String.empty), htmlUri: alias("webUri", String.empty), htmlImages: collect([["imageUri", "primaryImageUri"]]), htmlLines: collect(["name", "description"])
        })})
})(MS.Entertainment)
