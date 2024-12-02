/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/stringids.js", "/Framework/telemetryUtilities.js", "/Framework/data/queries/modelQueries.js", "/Framework/ContentNotification.js", "/ViewModels/social/SocialBuzzSource.js");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesCollection: WinJS.Class.define(function gamesCollectionConstructor(view) {
        this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("gamesCollection");
        this.gamesQuery = new MS.Entertainment.ViewModels.GamesCollection.DataQueries.games;
        var notificationModification = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("titleId"));
        notificationModification.modifyQuery(this.gamesQuery);
        this.socialBuzzDataSource = new MS.Entertainment.UI.SocialBuzz.SocialBuzzSource(notificationModification.createSender());
        this.view = view
    }, {
        _queryWatcher: null, gamesQuery: null, socialBuzzDataSource: null, items: null, _requestQuery: null, _responseQuery: null, _cacheInvalidated: false, isCurrentQuery: function isCurrentQuery() {
                return this._requestQuery === this._responseQuery
            }, _sort: null, sort: {
                get: function() {
                    return this._sort
                }, set: function(value) {
                        if (this._sort !== value) {
                            this._sort = value;
                            this._sortChanged()
                        }
                    }
            }, _view: null, view: {
                get: function() {
                    return this._view
                }, set: function(value) {
                        if (this._view !== value) {
                            this._view = value;
                            this._viewChanged()
                        }
                    }
            }, unload: function unload() {
                if (this.gamesQuery) {
                    this.gamesQuery.releaseInnerQuery();
                    this.gamesQuery = null
                }
            }, freeze: function freeze(){}, beginQuery: function beginQuery() {
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                if (!this.gamesQuery || !signIn.isSignedIn) {
                    this.items = new MS.Entertainment.Data.VirtualList;
                    return
                }
                if (!this._cacheInvalidated) {
                    this._cacheInvalidated = true;
                    try {
                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.titleHistory)
                    }
                    catch(e) {
                        this._cacheInvalidated = false
                    }
                }
                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                this.gamesQuery.userXuid = parseInt(signedInUser.xuid);
                this.gamesQuery.gamerTag = signedInUser.gamerTag;
                this.gamesQuery.isLive = true;
                WinJS.Binding.unwrap(this.socialBuzzDataSource).execute();
                var eventProvider = new Microsoft.Entertainment.Instrumentation.Providers.Shell;
                this._requestQuery = this.gamesQuery;
                this._queryWatcher.registerQuery(this.gamesQuery);
                this.gamesQuery.execute().then(function querySuccess(q) {
                    this._responseQuery = this.gamesQuery;
                    this.items = q.result.items;
                    eventProvider.traceNavigable_Loading_Done("games")
                }.bind(this)).then(function updateItems() {
                    this.gamesQuery.getOnlineResults()
                }.bind(this))
            }, _viewChanged: function collectionViewChanged() {
                var sort = Windows.Storage.ApplicationData.current.roamingSettings.values["CollectionSort-" + this.view];
                if (sort === undefined)
                    sort = MS.Entertainment.ViewModels.GamesCollection.Sorts.defaultSort;
                this.sort = sort
            }, _sortChanged: function collectionSortChanged() {
                if (!this.sort)
                    delete Windows.Storage.ApplicationData.current.roamingSettings.values["CollectionSort-" + this.view];
                else
                    Windows.Storage.ApplicationData.current.roamingSettings.values["CollectionSort-" + this.view] = this.sort
            }, resetDefaults: function resetDefaults() {
                delete Windows.Storage.ApplicationData.current.roamingSettings.values["CollectionSort-" + this.view]
            }
    }, {
        DataQueries: {games: MS.Entertainment.Data.Query.Games.GameActivity}, Sorts: (function() {
                var sorts;
                return {get: function() {
                            if (!sorts)
                                sorts = {
                                    values: ["recent", "title"], defaultSort: "recent", title: {
                                            value: "title", title: String.load(String.id.IDS_GAMES_COLLECTION_ALPHA_SORT)
                                        }, recent: {
                                            value: "recent", title: String.load(String.id.IDS_GAMES_COLLECTION_RECENT_SORT)
                                        }
                                };
                            return sorts
                        }}
            })()
    })})
