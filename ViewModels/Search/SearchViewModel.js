/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/queries/marketplacequeries.js", "/Framework/data/queries/libraryqueries.js");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {
    SearchFilter: {
        all: 0, localCollection: 1
    }, SearchViewModel: MS.Entertainment.defineObservable(function searchViewModelConstructor(options) {
            var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
            var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
            var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace) && (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription));
            this._videoQueryList = ["libraryMovieTVSeries"];
            if (MS.Entertainment.UI.NetworkStatusService.isOnline() && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace)))
                this._videoQueryList.push("searchMovies");
            this._noMarketplaceModeVideo = false;
            if (this._noMarketplaceModeVideo)
                this._videoQueryList = [];
            this._videoQueryList.push("libraryVideoOther");
            this._gameQueryList = [];
            if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace))
                this._gameQueryList.push("searchGamesWinGames");
            this._musicQueryList = ["libraryArtists", "libraryAlbums", "libraryTracks"];
            if (isMusicMarketplaceEnabled) {
                this._musicQueryList.push("searchArtists");
                this._musicQueryList.push("searchAlbums");
                this._musicQueryList.push("searchTracks")
            }
            this.videoOfflineResult = [];
            this.videoOnlineResult = [];
            this.otherVideoLocalResult = [];
            this.gameXBoxMPResult = [];
            this.gameWinMPResult = [];
            this.artistLocalResult = [];
            this.artistMPResult = [];
            this.albumLocalResult = [];
            this.albumMPResult = [];
            this.songLocalResult = [];
            this.songMPResult = [];
            this.playlistLocalResult = [];
            this.playlistMPResult = [];
            this.musicVideoLocalResult = [];
            this.musicVideoMPResult = [];
            if (options && options.linguisticAlternatives)
                this._linguisticAlternatives = options.linguisticAlternatives;
            this.createMovieQueryLocal = function() {
                return new MS.Entertainment.Data.Query.libraryMovieTVSeries
            };
            this.createMovieQueryMP = function createMovieQueryMP() {
                var query;
                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace) && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace))
                    query = new MS.Entertainment.Data.Query.Video.EdsCrossVideoSearch;
                else if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace))
                    query = new MS.Entertainment.Data.Query.Video.EdsSearchMovies;
                else if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.tvMarketplace))
                    query = new MS.Entertainment.Data.Query.Video.EdsSearchTVSeries;
                if (this._edsAuthHeaderKey)
                    query.addHeader(this._edsAuthHeaderKey, this._edsAuthHeaderValue);
                return query
            }.bind(this);
            this.createOtherVideoQueryLocal = function() {
                return new MS.Entertainment.Data.Query.libraryVideoOther
            };
            this.createGameXboxQueryMP = function() {
                return new MS.Entertainment.Data.Query.Games.SearchGameXbox
            };
            this.createGameWinQueryMP = function() {
                return new MS.Entertainment.Data.Query.Games.SearchGameMetro
            };
            this.createArtistQueryLocal = function() {
                return new MS.Entertainment.Data.Query.libraryAlbumArtists
            };
            this.createArtistQueryMP = function() {
                return new MS.Entertainment.Data.Query.Music.ArtistSearch
            };
            this.createAlbumQueryLocal = function() {
                return new MS.Entertainment.Data.Query.libraryAlbums
            };
            this.createAlbumQueryMP = function() {
                return new MS.Entertainment.Data.Query.Music.AlbumSearch
            };
            this.createSongQueryLocal = function() {
                return new MS.Entertainment.Data.Query.libraryTracks
            };
            this.createSongQueryMP = function() {
                return new MS.Entertainment.Data.Query.Music.SongSearch
            };
            this.createPlaylistQueryLocal = function() {
                return new MS.Entertainment.Data.Query.libraryPlaylists
            };
            this.createPlaylistQueryMP = function() {
                return new MS.Entertainment.Data.Query.searchPlaylists
            };
            this.createMusicVideoQueryLocal = function() {
                return new MS.Entertainment.Data.Query.libraryVideos
            };
            this.createMusicVideoQueryMP = function() {
                return new MS.Entertainment.Data.Query.searchMusicVideos
            };
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("searchViewModel")
        }, {
            _noMarketplaceModeVideo: false, _edsAuthHeaderKey: null, _edsAuthHeaderValue: null, _videoQueryList: null, _gameQueryList: null, _musicQueryList: null, videoOfflineResult: null, videoOnlineResult: null, otherVideoLocalResult: null, gameXBoxMPResult: null, gameWinMPResult: null, artistLocalResult: null, artistMPResult: null, albumLocalResult: null, albumMPResult: null, songLocalResult: null, songMPResult: null, playlistLocalResult: null, playlistMPResult: null, musicVideoLocalResult: null, musicVideoMPResult: null, _maxResultCount: 40, _maxResultCountNoVideoMarketplace: 100, searchCompleted: null, searchResultCount: 0, totalQueryCount: 0, completedQueryCount: 0, createMovieQueryLocal: null, createMovieQueryMP: null, createOtherVideoQueryLocal: null, createGameXboxQueryMP: null, createGameWinQueryMP: null, createArtistQueryLocal: null, createArtistQueryMP: null, createAlbumQueryLocal: null, createAlbumQueryMP: null, createSongQueryLocal: null, createSongQueryMP: null, createPlaylistQueryLocal: null, createPlaylistQueryMP: null, createMusicVideoQueryLocal: null, createMusicVideoQueryMP: null, _queryWatcher: null, _linguisticAlternatives: null, startSearch: function(keyword, edsAuthHeader) {
                    if (edsAuthHeader) {
                        this._edsAuthHeaderKey = edsAuthHeader.key;
                        this._edsAuthHeaderValue = edsAuthHeader.value
                    }
                    else {
                        this._edsAuthHeaderKey = String.empty;
                        this._edsAuthHeaderValue = String.empty
                    }
                    this.completedQueryCount = 0;
                    this.searchResultCount = 0;
                    this.videoOfflineResult = [];
                    this.videoOnlineResult = [];
                    this.otherVideoLocalResult = [];
                    this.gameXBoxMPResult = [];
                    this.gameWinMPResult = [];
                    this.artistLocalResult = [];
                    this.artistMPResult = [];
                    this.albumLocalResult = [];
                    this.albumMPResult = [];
                    this.songLocalResult = [];
                    this.songMPResult = [];
                    this.playlistLocalResult = [];
                    this.playlistMPResult = [];
                    this.musicVideoLocalResult = [];
                    this.musicVideoMPResult = [];
                    if (!keyword || keyword.trim().length < 1) {
                        if (this.searchCompleted)
                            this.searchCompleted();
                        return
                    }
                    this.unregisterServices();
                    if (MS.Entertainment.Utilities.isGamesApp) {
                        this.totalQueryCount = this._gameQueryList.length;
                        if (this.totalQueryCount > 0)
                            this.searchGames(keyword);
                        else if (this.searchCompleted)
                            this.searchCompleted()
                    }
                    else {
                        this.totalQueryCount = this._videoQueryList.length + this._gameQueryList.length + this._musicQueryList.length;
                        if (this.totalQueryCount > 0) {
                            this.searchVideos(keyword);
                            this.searchGames(keyword);
                            this.searchMusic(keyword)
                        }
                        else if (this.searchCompleted)
                            this.searchCompleted()
                    }
                }, searchVideos: function(keyword) {
                    this.searchOtherVideos(keyword);
                    this.searchMovieTV(keyword)
                }, searchGames: function(keyword) {
                    if (MS.Entertainment.Utilities.isGamesApp)
                        this.searchGamesWin(keyword);
                    else
                        this.searchGamesXBox(keyword)
                }, searchMusic: function(keyword) {
                    this.searchArtists(keyword);
                    this.searchAlbums(keyword);
                    this.searchSongs(keyword)
                }, searchMovieTV: function(keyword) {
                    var that = this;
                    var localPromise,
                        marketplacePromise;
                    var videoLocalQuery = this.createMovieQueryLocal();
                    var notificationsCollection = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                    var senderCollection = notificationsCollection.createSender();
                    notificationsCollection.modifyQuery(videoLocalQuery);
                    videoLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                    videoLocalQuery.chunkSize = this._maxResultCount;
                    videoLocalQuery.aggregateChunks = false;
                    this._queryWatcher.registerQuery(videoLocalQuery);
                    localPromise = videoLocalQuery.execute().then(function localQuerySuccess(q) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener("searchCollectionVideo", MS.Entertainment.UI.FileTransferService.keyFromProperty("libraryId"), senderCollection, MS.Entertainment.UI.FileTransferNotifiers.genericFile);
                        if (q.result.items)
                            that.videoOfflineResult = q.result.items;
                        else
                            that.videoOfflineResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(q.result.items);
                        that.checkSearchCompleted()
                    }, function localQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.moviesMarketplace))
                        return;
                    if (!MS.Entertainment.UI.NetworkStatusService.isOnline())
                        return;
                    var senderMarketplace = null;
                    var videoMPQuery = this.createMovieQueryMP();
                    videoMPQuery.search = keyword;
                    videoMPQuery.chunkSize = this._maxResultCount;
                    this._queryWatcher.registerQuery(videoMPQuery);
                    marketplacePromise = videoMPQuery.execute().then(function MPQuerySuccess(q) {
                        if (senderMarketplace) {
                            var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                            fileTransferService.registerListener("searchMarketplaceVideo", MS.Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true), senderMarketplace, MS.Entertainment.UI.FileTransferNotifiers.genericFile)
                        }
                    }, function MPQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    WinJS.Promise.join({
                        local: localPromise, marketplace: marketplacePromise
                    }).then(function allQueriesSuccess() {
                        if (videoMPQuery.result.items)
                            videoMPQuery.result.items.setItemFactory(MS.Entertainment.Data.Factory.Marketplace.edsCrossMediaToVideoFactory);
                        return MS.Entertainment.ViewModels.SearchViewModel.mergeResults(videoLocalQuery.result.items, videoMPQuery.result.items)
                    }, function someQueryError() {
                        return videoMPQuery.result ? videoMPQuery.result.items : []
                    }).then(function marketplaceProcessingDone(mergedList) {
                        if (mergedList && mergedList.count > 0) {
                            that.videoOnlineResult = mergedList;
                            that.videoOfflineResult = []
                        }
                        else
                            that.videoOnlineResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(mergedList);
                        that.checkSearchCompleted()
                    })
                }, searchOtherVideos: function(keyword) {
                    var that = this;
                    var localPromise;
                    var otherVideoLocalQuery = this.createOtherVideoQueryLocal();
                    otherVideoLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                    otherVideoLocalQuery.chunkSize = (this._noMarketplaceModeVideo ? this._maxResultCountNoVideoMarketplace : this._maxResultCount);
                    otherVideoLocalQuery.aggregateChunks = false;
                    this._queryWatcher.registerQuery(otherVideoLocalQuery);
                    localPromise = otherVideoLocalQuery.execute().then(function localQuerySuccess(q) {
                        if (q.result.items)
                            that.otherVideoLocalResult = q.result.items;
                        else
                            that.otherVideoLocalResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(q.result.items);
                        that.checkSearchCompleted()
                    }, function localQueryError(q) {
                        that.otherVideoLocalResult = [];
                        that.completedQueryCount++;
                        that.checkSearchCompleted()
                    })
                }, searchGamesXBox: function(keyword) {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesMarketplace))
                        return;
                    var that = this;
                    var query = this.createGameXboxQueryMP();
                    query.keyword = keyword;
                    var notificationModification = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), function getTitleId(game) {
                            return game.titleId
                        });
                    notificationModification.modifyQuery(query);
                    var socialBuzzDataSource = new MS.Entertainment.UI.SocialBuzz.SocialBuzzSource(notificationModification.createSender());
                    socialBuzzDataSource.execute();
                    this._queryWatcher.registerQuery(query);
                    query.execute().then(function MPQuerySuccess(q) {
                        if (query.result && query.result.items)
                            that.gameXBoxMPResult = query.result.items;
                        else
                            that.gameXBoxMPResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(that.gameXBoxMPResult);
                        that.checkSearchCompleted()
                    }, function MPQueryError(q) {
                        that.gameXBoxMPResult = [];
                        that.completedQueryCount++;
                        that.checkSearchCompleted()
                    })
                }, searchGamesWin: function(keyword) {
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    if (!featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace))
                        return;
                    var that = this;
                    var query = this.createGameWinQueryMP();
                    query.keyword = keyword;
                    var notificationModification = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), function getTitleId(game) {
                            return game.titleId
                        });
                    notificationModification.modifyQuery(query);
                    var socialBuzzDataSource = new MS.Entertainment.UI.SocialBuzz.SocialBuzzSource(notificationModification.createSender());
                    socialBuzzDataSource.execute();
                    this._queryWatcher.registerQuery(query);
                    query.execute().then(function MPQuerySuccess(q) {
                        if (query.result && query.result.items)
                            that.gameWinMPResult = query.result.items;
                        else
                            that.gameWinMPResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(that.gameWinMPResult);
                        that.checkSearchCompleted()
                    }, function MPQueryError(q) {
                        that.gameWinMPResult = [];
                        that.completedQueryCount++;
                        that.checkSearchCompleted()
                    })
                }, checkSearchCompleted: function() {
                    if (this.totalQueryCount === this.completedQueryCount)
                        if (this.searchCompleted)
                            this.searchCompleted()
                }, addResultCount: function(list) {
                    if (list && list.count !== undefined)
                        this.searchResultCount += list.count
                }, searchArtists: function(keyword) {
                    var that = this;
                    var localPromise,
                        marketplacePromise;
                    artistLocalQuery = this.createArtistQueryLocal();
                    var notificationsCollection = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                    var senderCollection = notificationsCollection.createSender();
                    notificationsCollection.modifyQuery(artistLocalQuery);
                    artistLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                    artistLocalQuery.chunkSize = this._maxResultCount;
                    artistLocalQuery.aggregateChunks = false;
                    this._queryWatcher.registerQuery(artistLocalQuery);
                    localPromise = artistLocalQuery.execute().then(function localQuerySuccess(q) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener("searchCollectionMusicArtist", MS.Entertainment.UI.FileTransferService.keyFromProperty("albumArtistLibraryId"), senderCollection, MS.Entertainment.UI.FileTransferNotifiers.trackCollection);
                        if (q.result.items)
                            that.artistLocalResult = q.result.items;
                        else
                            that.artistLocalResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(q.result.items);
                        that.checkSearchCompleted()
                    }, function localQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                    var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace) && (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription));
                    if (!isMusicMarketplaceEnabled)
                        return;
                    var artistMPQuery = this.createArtistQueryMP();
                    var notificationsMarketplace = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                    var senderMarketplace = notificationsMarketplace.createSender();
                    notificationsMarketplace.modifyQuery(artistMPQuery);
                    artistMPQuery.search = keyword;
                    this._queryWatcher.registerQuery(artistMPQuery);
                    marketplacePromise = artistMPQuery.execute().then(function MPQuerySuccess(q) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener("searchMarketplaceMusicArtist", MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), senderMarketplace, MS.Entertainment.UI.FileTransferNotifiers.trackCollection)
                    }, function MPQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    WinJS.Promise.join({
                        local: localPromise, marketplace: marketplacePromise
                    }).then(function allQueriesSuccess() {
                        return MS.Entertainment.ViewModels.SearchViewModel.deDup(artistLocalQuery.result && artistLocalQuery.result.items, artistMPQuery.result && artistMPQuery.result.items)
                    }, function someQueryError() {
                        return artistMPQuery.result ? artistMPQuery.result.items : []
                    }).then(function marketplaceProcessingDone(marketplaceList) {
                        if (marketplaceList)
                            that.artistMPResult = marketplaceList;
                        else
                            that.artistMPResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(marketplaceList);
                        that.checkSearchCompleted()
                    })
                }, searchAlbums: function(keyword) {
                    var that = this;
                    var localPromise,
                        marketplacePromise;
                    var albumLocalQuery = this.createAlbumQueryLocal();
                    var notificationsCollection = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                    var senderCollection = notificationsCollection.createSender();
                    notificationsCollection.modifyQuery(albumLocalQuery);
                    albumLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                    albumLocalQuery.chunkSize = this._maxResultCount;
                    albumLocalQuery.aggregateChunks = false;
                    this._queryWatcher.registerQuery(albumLocalQuery);
                    localPromise = albumLocalQuery.execute().then(function localQuerySuccess(q) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener("searchCollectionMusicAlbum", MS.Entertainment.UI.FileTransferService.keyFromProperty("albumLibraryId"), senderCollection, MS.Entertainment.UI.FileTransferNotifiers.trackCollection);
                        if (q.result.items)
                            that.albumLocalResult = q.result.items;
                        else
                            that.albumLocalResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(q.result.items);
                        that.checkSearchCompleted()
                    }, function localQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                    var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace) && (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription));
                    if (!isMusicMarketplaceEnabled)
                        return;
                    var albumMPQuery = this.createAlbumQueryMP();
                    var notificationsMarketplace = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                    var senderMarketplace = notificationsMarketplace.createSender();
                    notificationsMarketplace.modifyQuery(albumMPQuery);
                    albumMPQuery.search = keyword;
                    this._queryWatcher.registerQuery(albumMPQuery);
                    marketplacePromise = albumMPQuery.execute().then(function MPQuerySuccess(q) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener("searchMarketplaceMusicAlbum", MS.Entertainment.UI.FileTransferService.keyFromProperty("albumMediaId", false, true), senderMarketplace, MS.Entertainment.UI.FileTransferNotifiers.trackCollection)
                    }, function MPQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    WinJS.Promise.join({
                        local: localPromise, marketplace: marketplacePromise
                    }).then(function allQueriesSuccess() {
                        return MS.Entertainment.ViewModels.SearchViewModel.deDup(albumLocalQuery.result.items, albumMPQuery.result.items)
                    }, function someQueryError() {
                        return albumMPQuery.result ? albumMPQuery.result.items : []
                    }).then(function marketplaceProcessingDone(marketplaceList) {
                        if (marketplaceList)
                            that.albumMPResult = marketplaceList;
                        else
                            that.albumMPResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(marketplaceList);
                        that.checkSearchCompleted()
                    })
                }, searchSongs: function(keyword) {
                    var that = this;
                    var localPromise,
                        marketplacePromise;
                    var songLocalQuery = this.createSongQueryLocal();
                    var notificationsCollection = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("libraryId"));
                    var senderCollection = notificationsCollection.createSender();
                    notificationsCollection.modifyQuery(songLocalQuery);
                    songLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                    songLocalQuery.chunkSize = this._maxResultCount;
                    songLocalQuery.aggregateChunks = false;
                    this._queryWatcher.registerQuery(songLocalQuery);
                    localPromise = songLocalQuery.execute().then(function localQuerySuccess(q) {
                        var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                        fileTransferService.registerListener("searchCollectionTrack", MS.Entertainment.UI.FileTransferService.keyFromProperty("libraryId"), senderCollection, MS.Entertainment.UI.FileTransferNotifiers.genericFile);
                        if (q.result.items)
                            that.songLocalResult = q.result.items;
                        else
                            that.songLocalResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(q.result.items);
                        that.checkSearchCompleted()
                    }, function localQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                    var isMusicMarketplaceNetworkEnabled = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.networkStatus).isEnabled(MS.Entertainment.UI.NetworkStatusService.NetworkedFeature.musicMarketplace);
                    var isMusicMarketplaceEnabled = isMusicMarketplaceNetworkEnabled && featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicMarketplace) && (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.musicSubscription));
                    if (!isMusicMarketplaceEnabled)
                        return;
                    var senderMarketplace = null;
                    var songMPQuery = this.createSongQueryMP();
                    var notificationsMarketplace = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.FileTransferService.keyFromProperty("serviceId", false, true));
                    senderMarketplace = notificationsMarketplace.createSender();
                    notificationsMarketplace.modifyQuery(songMPQuery);
                    songMPQuery.search = keyword;
                    this._queryWatcher.registerQuery(songMPQuery);
                    marketplacePromise = songMPQuery.execute().then(function MPQuerySuccess(q) {
                        if (senderMarketplace) {
                            var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                            fileTransferService.registerListener("searchMarketplaceTrack", MS.Entertainment.UI.FileTransferService.keyFromProperty("mediaId", false, true), senderMarketplace, MS.Entertainment.UI.FileTransferNotifiers.genericFile)
                        }
                    }, function MPQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    WinJS.Promise.join({
                        local: localPromise, marketplace: marketplacePromise
                    }).then(function allQueriesSuccess() {
                        return MS.Entertainment.ViewModels.SearchViewModel.deDup(songLocalQuery.result.items, songMPQuery.result.items)
                    }, function someQueryError() {
                        return songMPQuery.result ? songMPQuery.result.items : []
                    }).then(function marketplaceProcessingDone(marketplaceList) {
                        if (marketplaceList)
                            that.songMPResult = marketplaceList;
                        else
                            that.songMPResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(marketplaceList);
                        that.checkSearchCompleted()
                    })
                }, searchPlaylists: function(keyword) {
                    var that = this;
                    var localPromise,
                        marketplacePromise;
                    var playlistLocalQuery = this.createPlaylistQueryLocal();
                    playlistLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                    playlistLocalQuery.chunkSize = this._maxResultCount;
                    playlistLocalQuery.aggregateChunks = false;
                    this._queryWatcher.registerQuery(playlistLocalQuery);
                    localPromise = playlistLocalQuery.execute().then(function localQuerySuccess(q) {
                        if (q.result.items)
                            that.playlistLocalResult = q.result.items;
                        else
                            that.playlistLocalResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(q.result.items);
                        that.checkSearchCompleted()
                    }, function localQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    })
                }, searchMusicVideos: function(keyword) {
                    var that = this;
                    var localPromise,
                        marketplacePromise;
                    var musicVideoLocalQuery = this.createMusicVideoQueryLocal();
                    musicVideoLocalQuery.keyword = (this._linguisticAlternatives || [keyword]);
                    musicVideoLocalQuery.chunkSize = this._maxResultCount;
                    musicVideoLocalQuery.aggregateChunks = false;
                    this._queryWatcher.registerQuery(musicVideoLocalQuery);
                    localPromise = musicVideoLocalQuery.execute().then(function localQuerySuccess(q) {
                        if (q.result.items)
                            that.musicVideoLocalResult = q.result.items;
                        else
                            that.musicVideoLocalResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(q.result.items);
                        that.checkSearchCompleted()
                    }, function localQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    var musicVideoMPQuery = this.createMusicVideoQueryMP();
                    musicVideoMPQuery.search = keyword;
                    musicVideoMPQuery.chunkSize = this._maxResultCount;
                    this._queryWatcher.registerQuery(musicVideoMPQuery);
                    marketplacePromise = musicVideoMPQuery.execute().then(function MPQuerySuccess(q){}, function MPQueryError(q) {
                        return WinJS.Promise.wrapError(q)
                    });
                    WinJS.Promise.join({
                        local: localPromise, marketplace: marketplacePromise
                    }).then(function allQueriesSuccess() {
                        return MS.Entertainment.ViewModels.SearchViewModel.deDup(musicVideoLocalQuery.result.items, musicVideoMPQuery.result.items)
                    }, function someQueryError() {
                        return musicVideoMPQuery.result ? musicVideoMPQuery.result.items : []
                    }).then(function marketplaceProcessingDone(marketplaceList) {
                        if (marketplaceList)
                            that.musicVideoMPResult = marketplaceList;
                        else
                            that.musicVideoMPResult = [];
                        that.completedQueryCount++;
                        that.addResultCount(marketplaceList);
                        that.checkSearchCompleted()
                    })
                }, unregisterServices: function unregisterServices() {
                    var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                    fileTransferService.unregisterListener("searchCollectionTrack");
                    fileTransferService.unregisterListener("searchMarketplaceTrack");
                    fileTransferService.unregisterListener("searchCollectionMusicAlbum");
                    fileTransferService.unregisterListener("searchMarketplaceMusicAlbum");
                    fileTransferService.unregisterListener("searchCollectionMusicArtist");
                    fileTransferService.unregisterListener("searchMarketplaceMusicArtist");
                    fileTransferService.unregisterListener("searchCollectionVideo");
                    fileTransferService.unregisterListener("searchMarketplaceVideo")
                }
        }, {
            mergeResults: function videoMerge(localList, mpList) {
                if (!localList || localList.count === 0)
                    return WinJS.Promise.wrap(mpList);
                else if (!mpList || mpList.count === 0)
                    return WinJS.Promise.wrap(localList);
                var localItems = {};
                var mergedList = [];
                var hcrItem = null;
                return mpList.itemsFromIndex(0, 0, 0).then(function hcrLookup(args) {
                        hcrItem = args.items[0].data
                    }).then(function() {
                        return localList.forEach(function localListForEach(localArgs) {
                                if (localArgs.item && localArgs.item.data && localArgs.item.data.serviceId) {
                                    localItems[localArgs.item.data.serviceId] = localArgs.item.data;
                                    if (localArgs.item.data.serviceId !== hcrItem.serviceId)
                                        mergedList.push(localArgs.item.data);
                                    else
                                        hcrItem.libraryId = localArgs.item.data.libraryId
                                }
                            })
                    }).then(function() {
                        return mpList.forEach(function mpListForEach(mpArgs) {
                                if (mpArgs.item && mpArgs.item.data && mpArgs.item.data.serviceId)
                                    if (hcrItem && hcrItem.serviceId && hcrItem.serviceId === mpArgs.item.data.serviceId)
                                        mergedList.unshift(hcrItem);
                                    else if (!localItems[mpArgs.item.data.serviceId])
                                        mergedList.push(mpArgs.item.data);
                                    else {
                                        var localItem = localItems[mpArgs.item.data.serviceId];
                                        if (mpArgs.item.data.zuneId === localItem.zuneId && mpArgs.item.data.canonicalId === localItem.canonicalId)
                                            localItem.impressionGuid = mpArgs.item.data.impressionGuid;
                                        else
                                            mergedList.push(mpArgs.item.data)
                                    }
                            })
                    }).then(function mergeCompleted() {
                        return MS.Entertainment.Data.VirtualList.wrapArray(mergedList)
                    })
            }, deDup: function(localList, mpList) {
                    if (!localList || localList.count === 0 || !mpList || mpList.count === 0)
                        return WinJS.Promise.wrap(mpList);
                    var that = this;
                    var deDupedList = [];
                    return mpList.forEach(function mpListForEach(mpArgs) {
                            var found = false;
                            return localList.forEach(function localListForEach(localArgs) {
                                    if (localArgs.item && localArgs.item.data && localArgs.item.data.serviceId && mpArgs.item && mpArgs.item.data && mpArgs.item.data.serviceId)
                                        if (localArgs.item.data.serviceId === mpArgs.item.data.serviceId || localArgs.item.data.zuneId === mpArgs.item.data.zuneId || localArgs.item.data.canonicalId === mpArgs.item.data.canonicalId) {
                                            found = true;
                                            localArgs.item.data.impressionGuid = mpArgs.item.data.impressionGuid;
                                            localArgs.item.data.fromCollection = mpArgs.item.data.fromCollection;
                                            localArgs.stop = true
                                        }
                                }).then(function() {
                                    if (!found)
                                        deDupedList.push(mpArgs.item.data)
                                })
                        }).then(function forEachCompleted() {
                            return MS.Entertainment.Data.VirtualList.wrapArray(deDupedList)
                        })
                }
        })
})
