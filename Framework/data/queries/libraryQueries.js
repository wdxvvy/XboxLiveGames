/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/query.js", "/Framework/data/Augmenters/commonAugmenters.js");
(function() {
    var MSE = WinJS.Namespace.define("MS.Entertainment", null);
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {LibraryQueryBase: MSE.derive(MSE.Data.LibraryWrapperQuery, null, {
            groupsAugmentation: MSE.Data.Augmenter.Library.GroupsAugmentation, executeCount: function executeCount() {
                    var innerQuery = this.createInnerQuery();
                    return innerQuery.getCountAsync()
                }
        }, {isLibraryQuery: function LibraryQuery_isLibraryQuery(object) {
                return MS.Entertainment.Data.Query.LibraryQueryBase.prototype.isPrototypeOf(object)
            }})});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryVideos: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
            category: -1, genreId: -1, seasonId: -1, seriesId: -1, folderId: null, sort: Microsoft.Entertainment.Queries.VideosSortBy.none, studio: null, keyword: null, objectIds: null, createInnerQuery: function createInnerQuery() {
                    var query = new Microsoft.Entertainment.Queries.VideosQuery;
                    if (this.category !== -1)
                        query.category = this.category;
                    if (this.genreId !== -1)
                        query.genreId = this.genreId;
                    if (this.seasonId !== -1)
                        query.seasonId = this.seasonId;
                    if (this.seriesId !== -1)
                        query.seriesId = this.seriesId;
                    if (this.folderId !== null)
                        query.folderId = this.folderId;
                    if (this.studio !== null)
                        query.studio = this.studio;
                    if (this.keyword)
                        query.keyword = this.keyword;
                    if (this.objectIds)
                        query.objectIds = this.objectIds;
                    query.primarySortBy = this.sort;
                    return query
                }, resultAugmentation: MSE.Data.Augmenter.Library.VideosResult, aggregateChunks: true
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        libraryVideoMovies: MSE.derive(MSE.Data.Query.libraryVideos, null, {
            category: Microsoft.Entertainment.Queries.VideoType.movie, resultAugmentation: MSE.Data.Augmenter.Library.MoviesResult
        }), libraryVideoTV: MSE.derive(MSE.Data.Query.libraryVideos, null, {
                category: Microsoft.Entertainment.Queries.VideoType.tvEpisode, resultAugmentation: MSE.Data.Augmenter.Library.TVEpisodesResult
            }), libraryVideoMusic: MSE.derive(MSE.Data.Query.libraryVideos, null, {
                category: Microsoft.Entertainment.Queries.VideoType.musicVideo, resultAugmentation: MSE.Data.Augmenter.Library.MusicVideosResult
            }), libraryVideoOther: MSE.derive(MSE.Data.Query.libraryVideos, null, {category: Microsoft.Entertainment.Queries.VideoType.other})
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryMovieTVSeries: WinJS.Class.derive(MS.Entertainment.Data.AggregateQuery, function libraryMovieTVSeries() {
            MS.Entertainment.Data.AggregateQuery.prototype.constructor.apply(this, arguments);
            this.resultAugmentationFactory = {create: this._createResultAugmentation.bind(this)};
            this.queries.length = 2;
            this.queries[0] = new MS.Entertainment.Data.Query.libraryVideoMovies;
            this.queries[1] = new MS.Entertainment.Data.Query.libraryTVSeries;
            this._selectMovie = false
        }, {
            _selectMovie: false, baseResultAugmentation: MS.Entertainment.Data.Augmenter.Library.MergedVideoTVSeasonResult, keyword: {
                    get: function() {
                        return this.queries[0]
                    }, set: function(value) {
                            this.queries[0].keyword = value;
                            this.queries[1].keyword = value
                        }
                }, _preInnerExecute: function _preInnerExecute() {
                    if (this.isLoadingFromStart)
                        this.selectMovie = false
                }, _comparer: function _comparer(movieItem, tvItem) {
                    if (movieItem && tvItem) {
                        this.selectMovie = !this.selectMovie;
                        return this.selectMovie ? -1 : 1
                    }
                    else if (movieItem)
                        return -1;
                    else if (tvItem)
                        return 1
                }, _merger: function _merger(movieItem, tvItem) {
                    if (movieItem)
                        return movieItem;
                    else
                        return tvItem
                }, _createResultAugmentation: function _createResultAugmentation() {
                    var augment = MS.Entertainment.Data.Property.augment;
                    var unionNoDeflate = MS.Entertainment.Data.Property.unionNoDeflate;
                    return MS.Entertainment.Data.derive(this.baseResultAugmentation, null, {items: unionNoDeflate("movieItems", "tvSeriesItems", this._comparer.bind(this), this._merger.bind(this), null)})
                }
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryGenres: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
            mediaType: Microsoft.Entertainment.Queries.GenresQueryMediaType.undefined, videoType: -1, sort: Microsoft.Entertainment.Queries.GenresSortBy.none, createInnerQuery: function createInnerQuery() {
                    var query = new Microsoft.Entertainment.Queries.GenresQuery;
                    query.mediaType = this.mediaType;
                    if (this.videoType !== -1)
                        query.videoType = this.videoType;
                    query.primarySortBy = this.sort;
                    return query
                }, resultAugmentation: MSE.Data.Augmenter.Library.GenresResult, aggregateChunks: true
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        libraryMovieGenres: MSE.derive(MSE.Data.Query.libraryGenres, null, {
            mediaType: Microsoft.Entertainment.Queries.GenresQueryMediaType.video, videoType: Microsoft.Entertainment.Queries.VideoType.movie
        }), libraryAlbumGenres: MSE.derive(MSE.Data.Query.libraryGenres, null, {mediaType: Microsoft.Entertainment.Queries.GenresQueryMediaType.album}), libraryTrackGenres: MSE.derive(MSE.Data.Query.libraryGenres, null, {mediaType: Microsoft.Entertainment.Queries.GenresQueryMediaType.track}), libraryMusicVideoGenres: MSE.derive(MSE.Data.Query.libraryGenres, null, {
                mediaType: Microsoft.Entertainment.Queries.GenresQueryMediaType.video, videoType: Microsoft.Entertainment.Queries.VideoType.musicVideo
            })
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryTracks: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
            albumId: -1, artistId: -1, sort: Microsoft.Entertainment.Queries.TracksSortBy.none, keyword: null, autoUpdateProperties: null, mediaAvailability: null, createInnerQuery: function createInnerQuery() {
                    var query = new Microsoft.Entertainment.Queries.TracksQuery;
                    var id = parseInt(this.albumId);
                    if (id !== -1)
                        query.albumId = id;
                    id = parseInt(this.artistId);
                    if (id !== -1)
                        query.artistId = id;
                    query.primarySortBy = this.sort;
                    if (this.mediaAvailability && this.mediaAvailability !== Microsoft.Entertainment.Queries.MediaAvailability.available)
                        query.mediaAvailability = this.mediaAvailability;
                    if (this.keyword)
                        query.keyword = this.keyword;
                    if (this.trackUrl)
                        query.trackUrl = this.trackUrl;
                    if (this.sort === Microsoft.Entertainment.Queries.TracksSortBy.albumReleaseYearAscendingTitleAscending || this.sort === Microsoft.Entertainment.Queries.TracksSortBy.albumReleaseYearDescendingTitleAscending || this.sort === Microsoft.Entertainment.Queries.TracksSortBy.dateAddedAscending || this.sort === Microsoft.Entertainment.Queries.TracksSortBy.dateAddedDescending)
                        this.groupsAugmentation = MSE.Data.Augmenter.Library.TracksByYearOrMonthGroupHintsResult;
                    else
                        this.groupsAugmentation = MSE.Data.Augmenter.Library.TracksGroupHintsResult;
                    return query
                }, resultAugmentation: MSE.Data.Augmenter.Library.TracksResult, groupsAugmentation: MSE.Data.Augmenter.Library.TracksGroupHintsResult, aggregateChunks: true
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryArtists: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
            artistOf: Microsoft.Entertainment.Queries.ArtistOf.undefined, keyword: null, sort: Microsoft.Entertainment.Queries.PeopleSortBy.none, personId: -1, autoUpdateProperties: null, mediaAvailability: null, createInnerQuery: function createInnerQuery() {
                    var query = new Microsoft.Entertainment.Queries.PeopleQuery;
                    query.artistOf = this.artistOf;
                    query.primarySortBy = this.sort;
                    if (this.mediaAvailability && this.mediaAvailability !== Microsoft.Entertainment.Queries.MediaAvailability.available)
                        query.mediaAvailability = this.mediaAvailability;
                    if (this.keyword)
                        query.keyword = this.keyword;
                    if (this.personId !== -1)
                        query.personId = this.personId;
                    return query
                }, resultAugmentation: MSE.Data.Augmenter.Library.ArtistsResult, groupsAugmentation: MSE.Data.Augmenter.Library.ArtistsGroupHintsResult, aggregateChunks: true
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        libraryAlbumArtists: MSE.derive(MSE.Data.Query.libraryArtists, null, {artistOf: Microsoft.Entertainment.Queries.ArtistOf.album}), libraryAlbums: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
                genreId: -1, albumId: -1, artistId: -1, playlistId: -1, sort: Microsoft.Entertainment.Queries.AlbumsSortBy.none, keyword: null, autoUpdateProperties: null, mediaAvailability: null, createInnerQuery: function createInnerQuery() {
                        var query = new Microsoft.Entertainment.Queries.AlbumsQuery;
                        var id = parseInt(this.genreId);
                        if (id !== -1)
                            query.genreId = this.genreId;
                        id = parseInt(this.albumId);
                        if (id !== -1)
                            query.albumId = this.albumId;
                        id = parseInt(this.artistId);
                        if (id !== -1)
                            query.artistId = this.artistId;
                        id = parseInt(this.playlistId);
                        if (id !== -1)
                            query.playlistId = this.playlistId;
                        query.primarySortBy = this.sort;
                        if (this.mediaAvailability && this.mediaAvailability !== Microsoft.Entertainment.Queries.MediaAvailability.available)
                            query.mediaAvailability = this.mediaAvailability;
                        if (this.keyword)
                            query.keyword = this.keyword;
                        if (this.sort === Microsoft.Entertainment.Queries.AlbumsSortBy.releaseYearAscendingTitleAscending || this.sort === Microsoft.Entertainment.Queries.AlbumsSortBy.releaseYearDescendingTitleAscending || this.sort === Microsoft.Entertainment.Queries.AlbumsSortBy.dateAddedAscending || this.sort === Microsoft.Entertainment.Queries.AlbumsSortBy.dateAddedDescending)
                            this.groupsAugmentation = MSE.Data.Augmenter.Library.AlbumsByYearOrMonthGroupHintsResult;
                        else
                            this.groupsAugmentation = MSE.Data.Augmenter.Library.AlbumsGroupHintsResult;
                        return query
                    }, resultAugmentation: MSE.Data.Augmenter.Library.AlbumsResult, groupsAugmentation: MSE.Data.Augmenter.Library.AlbumsGroupHintsResult, aggregateChunks: true
            })
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryVideoStudios: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
            createInnerQuery: function createInnerQuery() {
                return new Microsoft.Entertainment.Queries.VideoStudiosQuery
            }, resultAugmentation: MSE.Data.Augmenter.Library.StudiosResult, aggregateChunks: true
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryPlaylists: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
            playlistType: Microsoft.Entertainment.Queries.PlaylistType.userDefined, sort: Microsoft.Entertainment.Queries.PlaylistsSortBy.none, keyword: null, playlistId: -1, autoUpdateProperties: null, mediaAvailability: null, createInnerQuery: function createInnerQuery() {
                    var query = new Microsoft.Entertainment.Queries.PlaylistsQuery;
                    if (this.playlistType)
                        query.playlistType = this.playlistType;
                    id = parseInt(this.playlistId);
                    if (id !== -1)
                        query.playlistId = this.playlistId;
                    if (this.sort && this.sort !== Microsoft.Entertainment.Queries.PlaylistsSortBy.none)
                        query.primarySortBy = this.sort;
                    if (this.mediaAvailability && this.mediaAvailability !== Microsoft.Entertainment.Queries.MediaAvailability.available)
                        query.mediaAvailability = this.mediaAvailability;
                    if (this.keyword)
                        query.keyword = this.keyword;
                    if (this.sort === Microsoft.Entertainment.Queries.PlaylistsSortBy.dateEditedAscending || this.sort === Microsoft.Entertainment.Queries.PlaylistsSortBy.dateEditedDescending || this.sort === Microsoft.Entertainment.Queries.PlaylistsSortBy.dateAddedAscending || this.sort === Microsoft.Entertainment.Queries.PlaylistsSortBy.dateAddedDescending)
                        this.groupsAugmentation = MSE.Data.Augmenter.Library.PlaylistsByYearOrMonthGroupHintsResult;
                    else
                        this.groupsAugmentation = MSE.Data.Augmenter.Library.PlaylistsGroupHintsResult;
                    return query
                }, resultAugmentation: MSE.Data.Augmenter.Library.PlaylistsResult, groupsAugmentation: MSE.Data.Augmenter.Library.PlaylistsGroupHintsResult, aggregateChunks: true
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryPlaylistMediaItems: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
            playlistId: -1, sort: Microsoft.Entertainment.Queries.PlaylistItemsSortBy.ordinalAscending, mediaAvailability: null, createInnerQuery: function createInnerQuery() {
                    var query = new Microsoft.Entertainment.Queries.PlaylistMediaItemsQuery;
                    var id = parseInt(this.playlistId);
                    if (id !== -1)
                        query.playlistId = id;
                    if (this.mediaAvailability && this.mediaAvailability !== Microsoft.Entertainment.Queries.MediaAvailability.available)
                        query.mediaAvailability = this.mediaAvailability;
                    if (this.sort)
                        query.primarySortBy = this.sort;
                    return query
                }, resultAugmentation: MSE.Data.Augmenter.Library.TracksResult, aggregateChunks: true
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryTVSeries: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
            keyword: null, createInnerQuery: function createInnerQuery() {
                    var query = new Microsoft.Entertainment.Queries.TVSeriesQuery;
                    if (this.keyword)
                        query.keyword = this.keyword;
                    return query
                }, resultAugmentation: MSE.Data.Augmenter.Library.TVSeriesResult, aggregateChunks: true
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {libraryTVSeasons: MSE.derive(MSE.Data.Query.LibraryQueryBase, null, {
            tvSeriesId: -1, tvSeasonId: -1, sort: Microsoft.Entertainment.Queries.TVSeasonsSortBy.none, createInnerQuery: function createInnerQuery() {
                    var query = new Microsoft.Entertainment.Queries.TVSeasonsQuery;
                    var seriesId = parseInt(this.tvSeriesId);
                    var seasonId = parseInt(this.tvSeasonId);
                    if (seriesId !== -1)
                        query.tvSeriesId = seriesId;
                    if (seasonId !== -1)
                        query.tvSeasonId = seasonId;
                    query.primarySortBy = this.sort;
                    return query
                }, resultAugmentation: MSE.Data.Augmenter.Library.TVSeasonsResult, aggregateChunks: true
        })})
})()
