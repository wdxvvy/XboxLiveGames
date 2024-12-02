/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/query.js", "/Framework/Data/Augmenters/edsAugmenters.js");
(function() {
    var MSE = WinJS.Namespace.define("MS.Entertainment", null);
    var VER_CLIENTTYPE_STR_EDS = "PCWindows";
    var VER_SERVICEVERSION_STR_EDS = "1.4";
    var SEARCH_CHUNK_SIZE = 20;
    var BROWSE_CHUNK_SIZE = 25;
    WinJS.Namespace.define("MS.Entertainment.Data.Query", {
        edsMediaGroup: {
            appType: "AppType", enhancedContentType: "EnhancedContentType", gameType: "GameType", movieType: "MovieType", musicType: "MusicType", musicArtistType: "MusicArtistType", tvType: "TVType", unknown: "Unknown", webVideoType: "WebVideoType"
        }, edsMediaType: {
                album: "Album", appActivity: "AppActivity", avatarItem: "AvatarItem", gameActivity: "GameActivity", gameLayer: "GameLayer", metroGame: "MetroGame", metroGameConsumable: "MetroGameConsumable", metroGameContent: "MetroGameContent", mobileGame: "MobileGame", movie: "Movie", musicArtist: "MusicArtist", musicVideo: "MusicVideo", track: "Track", tvEpisode: "TVEpisode", tvSeason: "TVSeason", tvSeries: "TVSeries", tvShow: "TVShow", videoActivity: "VideoActivity", webGame: "WebGame", webVideo: "WebVideo", webVideoCollection: "WebVideoCollection", xbox360Game: "Xbox360Game", xbox360GameContent: "Xbox360GameContent", xbox360GameDemo: "Xbox360GameDemo", xboxApp: "XboxApp", xboxArcadeGame: "XboxArcadeGame", xboxBundle: "XboxBundle", xboxGameConsumable: "XboxGameConsumable", xboxGameTrailer: "XboxGameTrailer", xboxGameTrial: "XboxGameTrial", xboxGamerTile: "XboxGamerTile", xboxGameVideo: "XboxGameVideo", xboxMarketplace: "XboxMarketplace", xboxOriginalGame: "XboxOriginalGame", xboxTheme: "XboxTheme", xboxXnaCommunityGame: "XboxXnaCommunityGame", xboxMobilePDLC: "XboxMobilePDLC", xboxMobileConsumable: "XboxMobileConsumable"
            }, edsSortOrder: {
                allTimeAverageRating: "AllTimeAverageRating", allTimePlayCount: "AllTimePlayCount", allTimePurchaseCount: "AllTimePurchaseCount", allTimeRatingCount: "AllTimeRatingCount", allTimeRentalCount: "AllTimeRentalCount", allTimeUserRating: "AllTimeUserRating", criticRating: "CriticRating", digitalReleaseDate: "DigitalReleaseDate", freeAndPaidCountDaily: "FreeAndPaidCountDaily", mostPopular: "MostPopular", paidCountAllTime: "PaidCountAllTime", paidCountDaily: "PaidCountDaily", releaseDate: "ReleaseDate", sevenDaysAverageRating: "SevenDaysAverageRating", sevenDaysPlayCount: "SevenDaysPlayCount", sevenDaysPurchaseCount: "SevenDaysPurchaseCount", sevenDaysRentalCount: "SevenDaysRentalCount", sevenDaysRatingCount: "SevenDaysRatingCount", userRating: "UserRating"
            }, edsQueryRefiner: {
                decade: "Decade", genre: "Genre", network: "Network", studio: "Studio"
            }, edsIdType: {
                amg: "AMG", canonical: "Canonical", mediaNet: "MediaNet", offer: "Offer", providerContentId: "ProviderContentId", xboxHexTitle: "XboxHexTitle", zuneCatalog: "ZuneCatalog", zuneMediaInstance: "ZuneMediaInstance"
            }, edsEndpointType: {
                browse: "browse", crossMediaGroupSearch: "crossMediaGroupSearch", details: "details", fields: "fields", mediaGuide: "mediaGuide", metadata: "metadata", metadataMovieGenres: "metadata/mediaItemTypes/Movie/queryRefiners/genre", metadataMovieStudios: "metadata/mediaItemTypes/Movie/queryRefiners/studio", metadataMusicGenres: "metadata/mediaItemTypes/Album/queryRefiners/genre", metadataMusicSubGenres: "metadata/mediaItemTypes/Album/queryRefiners/genre/subQueryRefinerValues", metadataTvGenres: "metadata/mediaItemTypes/TVSeries/queryRefiners/genre", metadataTvNetworks: "metadata/mediaItemTypes/TVSeries/queryRefiners/network", related: "related", searchTerms: "searchTerms", singleMediaGroupSearch: "singleMediaGroupSearch"
            }, edsFields: {
                allTimePlayCount: "AllTimePlayCount", description: "Description", duration: "Duration", genres: "Genres", hasTrackMediaGuide: "HasTrackMediaGuide", id: "ID", images: "Images", isExplicit: "IsExplicit", legacyAmgId: "LegacyAmgId", mediaGroup: "MediaGroup", mediaItemType: "MediaItemType", name: "Name", parentAlbum: "ParentAlbum", parentItems: "ParentItems", primaryArtist: "PrimaryArtist", providers: "Providers", relationType: "RelationType", relatedMedia: "RelatedMedia", releaseDate: "ReleaseDate", sortName: "SortName", subGenres: "SubGenres", subTitle: "SubTitle", trackNumber: "TrackNumber", zuneId: "ZuneId"
            }, bbxMediaType: {
                app: "bbxapps", album: "bbxalbum", allMovie: "bbxmovies", allTv: "bbxtv", allVideo: "bbxvideo", artist: "bbxartist", artistSmartDj: "bbxartisttrkmg", game: "bbxgames", firstParty: "bbxallfirstparty", movie: "bbxmoviesfirstparty", music: "bbxmusic", musicVideo: "bbxmusicvideo", track: "bbxtrack", tv: "bbxtvfirstparty", video: "bbxvideofirstparty", webVideo: "bbxwebvideo"
            }, edsArray: function edsArray(array) {
                var result;
                if (Array.isArray(array))
                    result = array.join(".");
                else if (array)
                    result = [array];
                return result
            }, edsString: function edsString(string) {
                if (string)
                    string = string.replace(/\s+/g, '+');
                return string
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Query", {
        edsMediaTypeToDatabaseMappings: (function() {
            var mapping = {};
            mapping[MS.Entertainment.Data.Query.edsMediaType.album] = Microsoft.Entertainment.Queries.ObjectType.album;
            mapping[MS.Entertainment.Data.Query.edsMediaType.avatarItem] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.appActivity] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.gameActivity] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.videoActivity] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.gameLayer] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.metroGame] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.metroGameContent] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.mobileGame] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.movie] = Microsoft.Entertainment.Queries.ObjectType.video;
            mapping[MS.Entertainment.Data.Query.edsMediaType.musicArtist] = Microsoft.Entertainment.Queries.ObjectType.person;
            mapping[MS.Entertainment.Data.Query.edsMediaType.musicVideo] = Microsoft.Entertainment.Queries.ObjectType.video;
            mapping[MS.Entertainment.Data.Query.edsMediaType.track] = Microsoft.Entertainment.Queries.ObjectType.track;
            mapping[MS.Entertainment.Data.Query.edsMediaType.tvEpisode] = Microsoft.Entertainment.Queries.ObjectType.video;
            mapping[MS.Entertainment.Data.Query.edsMediaType.tvSeason] = Microsoft.Entertainment.Queries.ObjectType.tvSeason;
            mapping[MS.Entertainment.Data.Query.edsMediaType.tvSeries] = Microsoft.Entertainment.Queries.ObjectType.tvSeries;
            mapping[MS.Entertainment.Data.Query.edsMediaType.tvShow] = Microsoft.Entertainment.Queries.ObjectType.video;
            mapping[MS.Entertainment.Data.Query.edsMediaType.webGame] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.webVideo] = Microsoft.Entertainment.Queries.ObjectType.video;
            mapping[MS.Entertainment.Data.Query.edsMediaType.webVideoCollection] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360Game] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360GameContent] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360GameDemo] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxApp] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxArcadeGame] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxBundle] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameConsumable] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameTrailer] = Microsoft.Entertainment.Queries.ObjectType.video;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameTrial] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGamerTile] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameVideo] = Microsoft.Entertainment.Queries.ObjectType.video;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxMarketplace] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxOriginalGame] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxTheme] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxXnaCommunityGame] = Microsoft.Entertainment.Queries.ObjectType.game;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxMobilePDLC] = null;
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxMobileConsumable] = null;
            return mapping
        })(), edsMediaTypeIntegerToStringMappings: {
                1: MS.Entertainment.Data.Query.edsMediaType.xbox360Game, 5: MS.Entertainment.Data.Query.edsMediaType.xboxGameTrial, 18: MS.Entertainment.Data.Query.edsMediaType.xbox360GameContent, 19: MS.Entertainment.Data.Query.edsMediaType.xbox360GameDemo, 20: MS.Entertainment.Data.Query.edsMediaType.xboxTheme, 21: MS.Entertainment.Data.Query.edsMediaType.xboxOriginalGame, 22: MS.Entertainment.Data.Query.edsMediaType.xboxGamerTile, 23: MS.Entertainment.Data.Query.edsMediaType.xboxArcadeGame, 30: MS.Entertainment.Data.Query.edsMediaType.xboxGameVideo, 37: MS.Entertainment.Data.Query.edsMediaType.xboxXnaCommunityGame, 47: MS.Entertainment.Data.Query.edsMediaType.avatarItem, 61: MS.Entertainment.Data.Query.edsMediaType.xboxApp, 62: MS.Entertainment.Data.Query.edsMediaType.metroGame, 63: MS.Entertainment.Data.Query.edsMediaType.metroGameContent, 64: MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable, 66: MS.Entertainment.Data.Query.edsMediaType.gameActivity, 67: MS.Entertainment.Data.Query.edsMediaType.appActivity, 901: MS.Entertainment.Data.Query.edsMediaType.videoActivity, 1000: MS.Entertainment.Data.Query.edsMediaType.movie, 1002: MS.Entertainment.Data.Query.edsMediaType.tvShow, 1003: MS.Entertainment.Data.Query.edsMediaType.tvEpisode, 1004: MS.Entertainment.Data.Query.edsMediaType.tvSeries, 1005: MS.Entertainment.Data.Query.edsMediaType.tvSeason, 1006: MS.Entertainment.Data.Query.edsMediaType.album, 1007: MS.Entertainment.Data.Query.edsMediaType.track, 1008: MS.Entertainment.Data.Query.edsMediaType.musicVideo, 1009: MS.Entertainment.Data.Query.edsMediaType.musicArtist
            }, edsMediaTypeToVideoTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Query.edsMediaType.movie] = Microsoft.Entertainment.Queries.VideoType.movie;
                mapping[MS.Entertainment.Data.Query.edsMediaType.musicVideo] = Microsoft.Entertainment.Queries.VideoType.musicVideo;
                mapping[MS.Entertainment.Data.Query.edsMediaType.tvEpisode] = Microsoft.Entertainment.Queries.VideoType.tvEpisode;
                mapping[MS.Entertainment.Data.Query.edsMediaType.tvShow] = Microsoft.Entertainment.Queries.VideoType.other;
                mapping[MS.Entertainment.Data.Query.edsMediaType.tvSeries] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.tvSeason] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.webVideo] = Microsoft.Entertainment.Queries.VideoType.other;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameTrailer] = Microsoft.Entertainment.Queries.VideoType.other;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameVideo] = Microsoft.Entertainment.Queries.VideoType.other;
                return mapping
            })(), edsMediaTypeToGameTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Query.edsMediaType.avatarItem] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGame] = Microsoft.Entertainment.Queries.GameType.windows;
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable] = Microsoft.Entertainment.Queries.GameType.windows;
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGameContent] = Microsoft.Entertainment.Queries.GameType.windows;
                mapping[MS.Entertainment.Data.Query.edsMediaType.mobileGame] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.webGame] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxApp] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxArcadeGame] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGamerTile] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameTrial] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameVideo] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxOriginalGame] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360Game] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360GameContent] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360GameDemo] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxTheme] = Microsoft.Entertainment.Queries.GameType.console;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxXnaCommunityGame] = Microsoft.Entertainment.Queries.GameType.console;
                return mapping
            })(), edsMediaTypeToGameTitleTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Query.edsMediaType.avatarItem] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGame] = Microsoft.Entertainment.Queries.GameTitleType.standard;
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGameContent] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.mobileGame] = Microsoft.Entertainment.Queries.GameTitleType.standard;
                mapping[MS.Entertainment.Data.Query.edsMediaType.webGame] = Microsoft.Entertainment.Queries.GameTitleType.standard;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxApp] = Microsoft.Entertainment.Queries.GameTitleType.application;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxArcadeGame] = Microsoft.Entertainment.Queries.GameTitleType.arcade;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGamerTile] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameTrial] = Microsoft.Entertainment.Queries.GameTitleType.standard;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameVideo] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxOriginalGame] = Microsoft.Entertainment.Queries.GameTitleType.standard;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360Game] = Microsoft.Entertainment.Queries.GameTitleType.standard;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360GameContent] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360GameDemo] = Microsoft.Entertainment.Queries.GameTitleType.demo;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxTheme] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxXnaCommunityGame] = null;
                return mapping
            })(), edsMediaTypeToPersonTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Query.edsMediaType.musicArtist] = Microsoft.Entertainment.Queries.PersonType.artist;
                return mapping
            })(), edsMediaTypeToZuneHcrTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Query.edsMediaType.album] = "Album";
                mapping[MS.Entertainment.Data.Query.edsMediaType.movie] = "Movie";
                mapping[MS.Entertainment.Data.Query.edsMediaType.musicArtist] = "Artist";
                mapping[MS.Entertainment.Data.Query.edsMediaType.track] = "Track";
                mapping[MS.Entertainment.Data.Query.edsMediaType.tvSeries] = "Series";
                return mapping
            })(), edsMediaTypeToContentTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Query.edsMediaType.album] = "Album";
                mapping[MS.Entertainment.Data.Query.edsMediaType.movie] = "Movie";
                mapping[MS.Entertainment.Data.Query.edsMediaType.musicArtist] = "Artist";
                mapping[MS.Entertainment.Data.Query.edsMediaType.musicVideo] = "MusicVideo";
                mapping[MS.Entertainment.Data.Query.edsMediaType.track] = "Track";
                mapping[MS.Entertainment.Data.Query.edsMediaType.tvEpisode] = "Episode";
                mapping[MS.Entertainment.Data.Query.edsMediaType.tvSeason] = "Season";
                mapping[MS.Entertainment.Data.Query.edsMediaType.tvSeries] = "Series";
                return mapping
            })(), edsMediaTypeToGamePlatformTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGame] = MSE.Data.Augmenter.GamePlatform.Modern;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360Game] = MSE.Data.Augmenter.GamePlatform.Xbox;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxArcadeGame] = MSE.Data.Augmenter.GamePlatform.Xbox;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxOriginalGame] = MSE.Data.Augmenter.GamePlatform.Xbox;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxXnaCommunityGame] = MSE.Data.Augmenter.GamePlatform.Xbox;
                return mapping
            })(), edsMediaTypeToPurchaseHelperTypeMappings: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Query.edsMediaType.appActivity] = MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.avatarItem] = MS.Entertainment.Platform.PurchaseHelpers.AVATAR_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.gameActivity] = MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGame] = MS.Entertainment.Platform.PurchaseHelpers.GAME_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGameConsumable] = MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.metroGameContent] = MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.videoActivity] = MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360Game] = MS.Entertainment.Platform.PurchaseHelpers.GAME_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360GameContent] = MS.Entertainment.Platform.PurchaseHelpers.GAME_ADDON_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360GameDemo] = MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxApp] = null;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxArcadeGame] = MS.Entertainment.Platform.PurchaseHelpers.GAME_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGamerTile] = MS.Entertainment.Platform.PurchaseHelpers.GAMER_PICTURE_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameTrial] = MS.Entertainment.Platform.PurchaseHelpers.GAME_DEMO_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxGameVideo] = MS.Entertainment.Platform.PurchaseHelpers.GAME_VIDEO_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxOriginalGame] = MS.Entertainment.Platform.PurchaseHelpers.GAME_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxTheme] = MS.Entertainment.Platform.PurchaseHelpers.GAME_THEME_TYPE;
                mapping[MS.Entertainment.Data.Query.edsMediaType.xboxXnaCommunityGame] = MS.Entertainment.Platform.PurchaseHelpers.GAME_TYPE;
                return mapping
            })(), edsSortOrderToLegacySortOrder: (function() {
                var mapping = {};
                mapping[MS.Entertainment.Data.Query.edsSortOrder.allTimePurchaseCount] = MS.Entertainment.Data.Query.marketplaceOrderBy.salesRank;
                mapping[MS.Entertainment.Data.Query.edsSortOrder.mostPopular] = MS.Entertainment.Data.Query.marketplaceOrderBy.playRank;
                mapping[MS.Entertainment.Data.Query.edsSortOrder.releaseDate] = MS.Entertainment.Data.Query.marketplaceOrderBy.releaseDate;
                mapping[MS.Entertainment.Data.Query.edsSortOrder.sevenDaysRentalCount] = MS.Entertainment.Data.Query.marketplaceOrderBy.rentalRank;
                mapping[MS.Entertainment.Data.Query.edsSortOrder.sevenDaysPurchaseCount] = MS.Entertainment.Data.Query.marketplaceOrderBy.downloadRank;
                return mapping
            })(), convertToLegacySortIfNeeded: function convertToLegacySortIfNeeded(edsSort) {
                return edsSort
            }
    });
    WinJS.Namespace.define("MS.Entertainment.Data.Query", {edsMediaTypeToGameTypeGameTitleTypeMappings: (function() {
            var mapping = {};
            var edsMediaTypeToGameTypeMappings = MS.Entertainment.Data.Query.edsMediaTypeToGameTypeMappings;
            var edsMediaTypeToGameTitleTypeMappings = MS.Entertainment.Data.Query.edsMediaTypeToGameTitleTypeMappings;
            mapping[MS.Entertainment.Data.Query.edsMediaType.metroGame] = [edsMediaTypeToGameTypeMappings[MS.Entertainment.Data.Query.edsMediaType.metroGame], edsMediaTypeToGameTitleTypeMappings[MS.Entertainment.Data.Query.edsMediaType.metroGame]];
            mapping[MS.Entertainment.Data.Query.edsMediaType.mobileGame] = [edsMediaTypeToGameTypeMappings[MS.Entertainment.Data.Query.edsMediaType.mobileGame], edsMediaTypeToGameTitleTypeMappings[MS.Entertainment.Data.Query.edsMediaType.mobileGame]];
            mapping[MS.Entertainment.Data.Query.edsMediaType.webGame] = [edsMediaTypeToGameTypeMappings[MS.Entertainment.Data.Query.edsMediaType.webGame], edsMediaTypeToGameTitleTypeMappings[MS.Entertainment.Data.Query.edsMediaType.webGame]];
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxApp] = [edsMediaTypeToGameTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xboxApp], edsMediaTypeToGameTitleTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xboxApp]];
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxArcadeGame] = [edsMediaTypeToGameTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xboxArcadeGame], edsMediaTypeToGameTitleTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xboxArcadeGame]];
            mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360Game] = [edsMediaTypeToGameTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xbox360Game], edsMediaTypeToGameTitleTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xbox360Game]];
            mapping[MS.Entertainment.Data.Query.edsMediaType.xbox360GameDemo] = [edsMediaTypeToGameTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xbox360GameDemo], edsMediaTypeToGameTitleTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xbox360GameDemo]];
            mapping[MS.Entertainment.Data.Query.edsMediaType.xboxXnaCommunityGame] = [edsMediaTypeToGameTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xboxXnaCommunityGame], edsMediaTypeToGameTitleTypeMappings[MS.Entertainment.Data.Query.edsMediaType.xboxXnaCommunityGame]];
            return mapping
        })()});
    WinJS.Namespace.define("MS.Entertainment.Data.Query", {databaseMediaTypeToSubTypeMappingMappings: (function() {
            var mapping = {};
            mapping[Microsoft.Entertainment.Queries.ObjectType.album] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.game] = MS.Entertainment.Data.Query.edsMediaTypeToGameTypeGameTitleTypeMappings;
            mapping[Microsoft.Entertainment.Queries.ObjectType.person] = MS.Entertainment.Data.Query.edsMediaTypeToPersonTypeMappings;
            mapping[Microsoft.Entertainment.Queries.ObjectType.playlist] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.smartDJ] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.track] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.tvSeason] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.tvSeries] = null;
            mapping[Microsoft.Entertainment.Queries.ObjectType.video] = MS.Entertainment.Data.Query.edsMediaTypeToVideoTypeMappings;
            return mapping
        })()});
    WinJS.Namespace.define("MS.Entertainment.Data.Query", {EDSDeviceQuery: MSE.derive(MSE.Data.EDSWrapperQuery, null, {createDeviceType: function createDeviceType() {
                return MS.Entertainment.Data.Augmenter.Marketplace.edsDeviceType.pc
            }})});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        CrossMediaSearch: MS.Entertainment.derive(MS.Entertainment.Data.Query.EDSDeviceQuery, null, {
            search: null, keyword: null, groupTypes: null, chunkSize: 1, enabledImpressionGuid: true, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.EDSSearchResult, forceSecureEndpoint: true, createResourceURI: function() {
                    return this.getResourceEndpoint(MS.Entertainment.Data.Query.edsEndpointType.crossMediaGroupSearch)
                }, createParameters: function createParameters() {
                    return {
                            q: MS.Entertainment.Data.Query.edsString(this.search || this.keyword), desiredMediaItemTypes: MS.Entertainment.Data.Query.edsArray(this.groupTypes), firstPartyOnly: true
                        }
                }
        }), AutoSuggest: MS.Entertainment.derive(MS.Entertainment.Data.ServiceWrapperQuery, null, {
                search: null, keyword: null, mediaType: MS.Entertainment.Data.Query.bbxMediaType.firstParty, serviceType: MS.Entertainment.Data.ServiceWrapperQuery.ServiceTypes.jsonEDS, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.BBXAutoSuggestResult, getResourceEndpoint: function() {
                        return MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_BingAutoSuggest)
                    }, createResourceURI: function() {
                        return this.getResourceEndpoint()
                    }, createParameters: function createParameters() {
                        if (!MS.Entertainment.Data.Query.AutoSuggest.cachedMarket) {
                            var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            MS.Entertainment.Data.Query.AutoSuggest.cachedMarket = configurationManager.marketplace.marketplaceCulture
                        }
                        return {
                                FORM: "XBOXQ5", q: this.search || this.keyword, ds: this.mediaType
                            }
                    }
            }, {cachedMarket: null}), edsWrapperQuery: MSE.derive(MSE.Data.ServiceWrapperQuery, null, {getResourceEndpoint: function() {
                    return MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_EDSSearch)
                }}, {
                itemsPluralizer: "Items/Item", genresPluralizer: "Genres/Genre", providersPluralizer: "Providers/Provider", partnerApplicationLaunchInfosPluralizer: "PartnerApplicationLaunchInfos/PartnerApplicationLaunchInfo", providerContentsPluralizer: "ProviderContents/ProviderContent", searchTermsPluralizer: "SearchTerms/SearchTerm"
            })
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {suggestedSearchTermsEDS: MSE.derive(MS.Entertainment.Data.Query.EDSDeviceQuery, null, {
            createResourceURI: function() {
                return this.getResourceEndpoint(MS.Entertainment.Data.Query.edsEndpointType.searchTerms)
            }, createParameters: function createParameters() {
                    return {}
                }, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.SearchTermsResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {searchMoviesEDS: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            search: "", chunkSize: SEARCH_CHUNK_SIZE, createResourceURI: function() {
                    return this.getResourceEndpoint() + "/Items"
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video", inputMethod: "controller", maxItems: this.chunkSize, itemTypes: "MovieItem", q: this.search
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.itemsPluralizer, MSE.Data.Query.edsWrapperQuery.genresPluralizer, MSE.Data.Query.edsWrapperQuery.providersPluralizer, MSE.Data.Query.edsWrapperQuery.partnerApplicationLaunchInfosPluralizer], resultAugmentation: MSE.Data.Augmenter.Marketplace.MoviesResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {searchTVSeriesEDS: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            search: "", chunkSize: SEARCH_CHUNK_SIZE, createResourceURI: function() {
                    return this.getResourceEndpoint() + "/Items"
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video", inputMethod: "controller", maxItems: this.chunkSize, itemTypes: "TVItem", q: this.search
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.itemsPluralizer, MSE.Data.Query.edsWrapperQuery.genresPluralizer, MSE.Data.Query.edsWrapperQuery.providersPluralizer, MSE.Data.Query.edsWrapperQuery.partnerApplicationLaunchInfosPluralizer], resultAugmentation: MSE.Data.Augmenter.Marketplace.TVSeriesResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {searchVideoHCREDS: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            keyword: "", chunkSize: 5, createResourceURI: function() {
                    return this.getResourceEndpoint() + "/Items"
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video", inputMethod: "controller", pageSize: this.chunkSize, itemTypes: "MovieItem.TVItem", q: this.keyword
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.itemsPluralizer, MSE.Data.Query.edsWrapperQuery.genresPluralizer, MSE.Data.Query.edsWrapperQuery.providersPluralizer, MSE.Data.Query.edsWrapperQuery.partnerApplicationLaunchInfosPluralizer], resultAugmentation: MSE.Data.Augmenter.Marketplace.MoviesResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {searchMovieHCREDS: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            keyword: "", chunkSize: 5, createResourceURI: function() {
                    return this.getResourceEndpoint() + "/Items"
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video", inputMethod: "controller", pageSize: this.chunkSize, itemTypes: "MovieItem", q: this.keyword
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.itemsPluralizer, MSE.Data.Query.edsWrapperQuery.genresPluralizer, MSE.Data.Query.edsWrapperQuery.providersPluralizer, MSE.Data.Query.edsWrapperQuery.partnerApplicationLaunchInfosPluralizer], resultAugmentation: MSE.Data.Augmenter.Marketplace.MoviesResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {searchTVSeriesHCREDS: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            keyword: "", chunkSize: 5, createResourceURI: function() {
                    return this.getResourceEndpoint() + "/Items"
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video", inputMethod: "controller", pageSize: this.chunkSize, itemTypes: "TVItem", q: this.keyword
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.itemsPluralizer, MSE.Data.Query.edsWrapperQuery.genresPluralizer, MSE.Data.Query.edsWrapperQuery.providersPluralizer, MSE.Data.Query.edsWrapperQuery.partnerApplicationLaunchInfosPluralizer], resultAugmentation: MSE.Data.Augmenter.Marketplace.MoviesResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {detailMovieEDS: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            id: "", createResourceURI: function() {
                    return this.getResourceEndpoint() + "/movies/" + this.id
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video"
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.genresPluralizer, MSE.Data.Query.edsWrapperQuery.providersPluralizer, MSE.Data.Query.edsWrapperQuery.providerContentsPluralizer, MSE.Data.Query.edsWrapperQuery.partnerApplicationLaunchInfosPluralizer], resultAugmentation: MSE.Data.Augmenter.Marketplace.MovieDetailsResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {detailTVEpisodeEDS: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            id: "", createResourceURI: function() {
                    return this.getResourceEndpoint() + "/TVepisodes/" + this.id
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video"
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.genresPluralizer, MSE.Data.Query.edsWrapperQuery.providersPluralizer, MSE.Data.Query.edsWrapperQuery.partnerApplicationLaunchInfosPluralizer], resultAugmentation: MSE.Data.Augmenter.Marketplace.TVEpisodeDetailsResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {tvSeasonsEDS: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            id: "", createResourceURI: function() {
                    return this.getResourceEndpoint() + "/tvSeries/" + this.id + "/seasons"
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video", maxItems: 25
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.itemsPluralizer, MSE.Data.Query.edsWrapperQuery.genresPluralizer, ], resultAugmentation: MSE.Data.Augmenter.Marketplace.TVSeasonsResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {tvEpisodesEDS: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            id: "", createResourceURI: function() {
                    return this.getResourceEndpoint() + "/tvSeasons/" + this.id + "/episodes"
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video", maxItems: 25
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.itemsPluralizer, MSE.Data.Query.edsWrapperQuery.providersPluralizer, MSE.Data.Query.edsWrapperQuery.partnerApplicationLaunchInfosPluralizer], resultAugmentation: MSE.Data.Augmenter.Marketplace.TVEpisodesResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {videoDetailsFromTitleIdAssetId: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            assetId: "", titleId: "", createResourceURI: function() {
                    return this.getResourceEndpoint() + "/titles/" + this.titleId + "/content"
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video", contentId: this.assetId
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.genresPluralizer, MSE.Data.Query.edsWrapperQuery.providersPluralizer, MSE.Data.Query.edsWrapperQuery.partnerApplicationLaunchInfosPluralizer], resultAugmentation: MSE.Data.Augmenter.Marketplace.VideoResultEDS
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        movieRelatedItems: MSE.derive(MSE.Data.Query.edsWrapperQuery, null, {
            serviceId: "", idSpace: "All", createResourceURI: function() {
                    return this.getResourceEndpoint() + "/Movies/" + this.serviceId + "/RelatedItems"
                }, createParameters: function createParameters() {
                    return {
                            version: VER_SERVICEVERSION_STR_EDS, clientType: VER_CLIENTTYPE_STR_EDS, clientContext: "video", itemTypes: "Movie", idSpace: this.idSpace, maxItems: 25
                        }
                }, pluralizers: [MSE.Data.Query.edsWrapperQuery.itemsPluralizer, MSE.Data.Query.edsWrapperQuery.genresPluralizer, ], resultAugmentation: MSE.Data.Augmenter.Marketplace.RelatedMovieResult
        }), ESListServiceWrapperQuery: MSE.derive(MSE.Data.EDSWrapperQuery, function ESListService() {
                MS.Entertainment.Data.EDSWrapperQuery.prototype.constructor.call(this);
                this.shouldAuthenticate = true
            }, {})
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {GenericDetails: MS.Entertainment.derive(MS.Entertainment.Data.EDSWrapperQuery, null, {
            id: null, idType: null, serviceId: null, chunkSize: 0, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.EDSGenericResult, createResourceURI: function() {
                    return this.getResourceEndpoint(MS.Entertainment.Data.Query.edsEndpointType.details)
                }, createParameters: function createParameters() {
                    return {
                            ids: this.id || this.serviceId, idType: (this.idType !== MS.Entertainment.Data.Query.edsIdType.canonical) ? this.idType : null, mediaGroup: MS.Entertainment.Data.Query.edsMediaGroup.unknown
                        }
                }
        })})
})()
