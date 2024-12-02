/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/query.js", "/Framework/data/queries/edsQueries.js");
(function() {
    "use strict";
    var edsArray = MS.Entertainment.Data.Query.edsArray;
    var edsIdType = MS.Entertainment.Data.Query.edsIdType;
    var edsMediaGroup = MS.Entertainment.Data.Query.edsMediaGroup;
    var edsMediaType = MS.Entertainment.Data.Query.edsMediaType;
    var edsSortOrder = MS.Entertainment.Data.Query.edsSortOrder;
    var edsEndpointType = MS.Entertainment.Data.Query.edsEndpointType;
    var edsString = MS.Entertainment.Data.Query.edsString;
    var SEARCH_CHUNK_SIZE = 20;
    var BROWSE_CHUNK_SIZE = 25;
    WinJS.Namespace.define("MS.Entertainment.Data.Query.Games", {
        GameMetroBrowse: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
            aggregateChunks: true, chunkSize: BROWSE_CHUNK_SIZE, desiredMediaItemTypes: [edsMediaType.metroGame], createResourceURI: function() {
                    return this.getResourceEndpoint(edsEndpointType.browse)
                }, createParameters: function createParameters() {
                    return {
                            gamebrowsable: true, orderby: edsSortOrder.releaseDate, desiredMediaItemTypes: edsArray(this.desiredMediaItemTypes)
                        }
                }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.BrowseMetroGameResult
        }), GameMetroDetails: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                serviceIds: [], idType: edsIdType.canonical, createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.details)
                    }, createParameters: function createParameters() {
                        return {
                                gamebrowsable: true, MediaGroup: edsMediaGroup.gameType, ids: edsArray(this.serviceIds), idType: this.idType
                            }
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.DetailsMetroGameResult
            }), FlexHubGameDetails: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                serviceIds: [], idType: edsIdType.canonical, createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.details)
                    }, createParameters: function createParameters() {
                        return {
                                gamebrowsable: true, MediaGroup: edsMediaGroup.gameType, ids: edsArray(this.serviceIds), idType: this.idType
                            }
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.FlexHubGameResult
            }), GameMetroChildren: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                serviceId: String.empty, desiredItemTypes: [edsMediaType.metroGameContent, edsMediaType.metroGameConsumable, edsMediaType.avatarItem], aggregateChunks: true, chunkSize: BROWSE_CHUNK_SIZE, mediaItemType: String.empty, idType: edsIdType.canonical, createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.browse)
                    }, createParameters: function createParameters() {
                        return {
                                gamebrowsable: true, id: this.serviceId, desiredMediaItemTypes: edsArray(this.desiredItemTypes), mediaItemType: this.mediaItemType, idType: this.idType, orderby: edsSortOrder.releaseDate
                            }
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.MetroGameChildrenResult
            }), GameDetailsFromTitleId: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                hexTitleIds: [], createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.details)
                    }, createParameters: function createParameters() {
                        return {
                                gamebrowsable: true, MediaGroup: edsMediaGroup.gameType, ids: edsArray(this.hexTitleIds), idType: edsIdType.xboxHexTitle
                            }
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.GameListEDS
            }), SearchGameMetro: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                keyword: String.empty, chunkSize: SEARCH_CHUNK_SIZE, autoSuggestSeed: false, enabledImpressionGuid: true, forceSecureEndpoint: true, createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.singleMediaGroupSearch)
                    }, createParameters: function createParameters() {
                        return {
                                gamebrowsable: true, q: edsString(this.keyword), desiredMediaItemTypes: edsMediaType.metroGame
                            }
                    }, createHeaders: function createHeaders() {
                        return {"x-xbl-autoSuggest-seed-text": this.autoSuggestSeed && this.keyword ? window.encodeURIComponent(this.keyword) : null}
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.SearchMetroGameResult
            }), SearchGameXbox: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                keyword: String.empty, chunkSize: SEARCH_CHUNK_SIZE, autoSuggestSeed: false, enabledImpressionGuid: true, forceSecureEndpoint: true, createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.singleMediaGroupSearch)
                    }, createParameters: function createParameters() {
                        return {
                                gamebrowsable: true, q: edsString(this.keyword), desiredMediaItemTypes: edsArray([edsMediaType.xbox360Game, edsMediaType.xboxOriginalGame, edsMediaType.xboxArcadeGame, edsMediaType.xboxXnaCommunityGame])
                            }
                    }, createHeaders: function createHeaders() {
                        return {"x-xbl-autoSuggest-seed-text": this.autoSuggestSeed && this.keyword ? window.encodeURIComponent(this.keyword) : null}
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.SearchXboxGameResult
            }), GameRelatedItems: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                serviceId: String.empty, chunkSize: BROWSE_CHUNK_SIZE, forceSecureEndpoint: true, createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.related)
                    }, createParameters: function createParameters() {
                        return {
                                id: this.serviceId, desiredMediaItemTypes: edsMediaGroup.gameType, mediaItemType: edsMediaType.xbox360Game, firstPartyOnly: true
                            }
                    }, pluralizers: [MS.Entertainment.Data.Query.edsWrapperQuery.itemsPluralizer, MS.Entertainment.Data.Query.edsWrapperQuery.genresPluralizer, ], resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.RelatedGameResult
            }), XboxGameDetails: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                serviceIds: [], chunkSize: 10, idType: edsIdType.canonical, mediaGroup: edsMediaGroup.gameType, createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.details)
                    }, createParameters: function createParameters() {
                        return {
                                mediaGroup: this.mediaGroup, ids: edsArray(this.serviceIds), idType: this.idType
                            }
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.DetailsXboxGameResult
            }), XboxGameChildren: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                serviceId: String.empty, desiredItemTypes: [edsMediaType.xbox360GameContent, edsMediaType.xbox360GameDemo, edsMediaType.xboxGameTrial, edsMediaType.xboxTheme, edsMediaType.xboxGamerTile, edsMediaType.xboxGameVideo, edsMediaType.avatarItem], aggregateChunks: true, chunkSize: BROWSE_CHUNK_SIZE, mediaItemType: String.empty, idType: edsIdType.canonical, createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.browse)
                    }, createParameters: function createParameters() {
                        return {
                                id: this.serviceId, desiredMediaItemTypes: edsArray(this.desiredItemTypes), mediaItemType: this.mediaItemType, idType: this.idType, orderby: edsSortOrder.releaseDate
                            }
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.XboxGameChildrenResult
            }), SmartGlassActivities: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
                serviceId: String.empty, desiredItemTypes: [edsMediaType.gameActivity, edsMediaType.appActivity, edsMediaType.videoActivity], aggregateChunks: true, chunkSize: BROWSE_CHUNK_SIZE, mediaItemType: String.empty, idType: edsIdType.canonical, createResourceURI: function() {
                        return this.getResourceEndpoint(edsEndpointType.browse)
                    }, createParameters: function createParameters() {
                        return {
                                id: this.serviceId, desiredMediaItemTypes: edsArray(this.desiredItemTypes), mediaItemType: this.mediaItemType, idType: this.idType
                            }
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.SmartGlassActivitiesResult
            }), AutoSuggest: MS.Entertainment.derive(MS.Entertainment.Data.Query.AutoSuggest, null, {mediaType: MS.Entertainment.Data.Query.bbxMediaType.game}), XboxLiveDataAgentQuery: MS.Entertainment.derive(MS.Entertainment.Data.LibraryWrapperQuery, null, {
                userXuid: null, gamerTag: null, aggregateChunks: true, getOnlineResults: function getOnlineResults() {
                        return WinJS.Promise.wrap()
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Query.Games", {
        GameMetroByGenre: MS.Entertainment.derive(MS.Entertainment.Data.Query.Games.GameMetroBrowse, null, {
            genre: null, orderBy: edsSortOrder.releaseDate, createParameters: function createParameters() {
                    return {
                            gamebrowsable: true, orderby: this.orderBy, desiredMediaItemTypes: edsArray(this.desiredMediaItemTypes), queryRefiners: "genre", genre: this.genre
                        }
                }
        }), GameActivity: MS.Entertainment.derive(MS.Entertainment.Data.Query.Games.XboxLiveDataAgentQuery, null, {
                chunkSize: MS.Entertainment.Data.XboxLive.MAX_TITLE_ACTIVITY_COUNT, showStandardTitles: true, showDemoTitles: false, showArcadeTitles: true, showApplicationTitles: false, showXbox360: false, platformTypes: [Microsoft.Xbox.PlatformType.xbox360, Microsoft.Xbox.PlatformType.windowsPC, Microsoft.Xbox.PlatformType.xboxLIVEOnWindows, Microsoft.Xbox.PlatformType.mobile, Microsoft.Xbox.PlatformType.webGames], createInnerQuery: function createInnerQuery() {
                        var query = new Microsoft.Entertainment.Queries.GameActivitiesQuery;
                        query.userXuid = this.userXuid;
                        query.showStandardTitles = this.showStandardTitles;
                        query.showDemoTitles = this.showDemoTitles;
                        query.showArcadeTitles = this.showArcadeTitles;
                        query.showApplicationTitles = this.showApplicationTitles;
                        query.showXbox360 = this.showXbox360;
                        return query
                    }, getOnlineResults: function getOnlineResults() {
                        var dataAgent = new Microsoft.Entertainment.Social.XboxLIVEDataAgent;
                        return dataAgent.getGameActivitiesAsync(this.userXuid, this.gamerTag, 0, this.chunkSize, this._buildTitleTypeFilterArray(), this.platformTypes)
                    }, _buildTitleTypeFilterArray: function _buildTitleTypeFilterArray() {
                        var titleTypeArray = [];
                        if (this.showStandardTitles)
                            titleTypeArray.push(Microsoft.Xbox.TitleType.standard);
                        if (this.showDemoTitles)
                            titleTypeArray.push(Microsoft.Xbox.TitleType.demo);
                        if (this.showArcadeTitles)
                            titleTypeArray.push(Microsoft.Xbox.TitleType.arcade);
                        if (this.showApplicationTitles)
                            titleTypeArray.push(Microsoft.Xbox.TitleType.application);
                        return titleTypeArray
                    }, resultAugmentation: MS.Entertainment.Data.Augmenter.XboxLive.DataAgentGamesResult
            })
    })
})()
