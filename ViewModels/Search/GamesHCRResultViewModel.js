/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesHCRResult: MS.Entertainment.defineObservable(function GamesHCRResultConstructor() {
        this.hcrResult = {}
    }, {
        hcrResult: null, searchCompleted: null, startSearch: function startSearch(keyword, useEDS, edsAuthHeader) {
                this.hcrResult = null;
                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                var metroEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
                if (!metroEnabled) {
                    this._searchCompleted();
                    return
                }
                if (!keyword) {
                    this._searchCompleted();
                    return
                }
                var query = null;
                if (metroEnabled)
                    query = new MS.Entertainment.Data.Query.Games.SearchGameMetro;
                if (query) {
                    var notificationModification = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), function getTitleId(game) {
                            return game.titleId
                        });
                    notificationModification.modifyQuery(query);
                    var socialBuzzDataSource = new MS.Entertainment.UI.SocialBuzz.SocialBuzzSource(notificationModification.createSender());
                    socialBuzzDataSource.execute();
                    query.keyword = keyword;
                    query.chunkSize = 5;
                    query.execute().then(function querySuccess(q) {
                        if (q.result.items)
                            return q.result.items.itemsFromIndex(0, 0, 1);
                        else
                            return WinJS.Promise.wrap()
                    }.bind(this), function queryFail(q) {
                        return WinJS.Promise.wrap()
                    }.bind(this)).then(function virtualListFilled(result) {
                        if (result && result.items.length > 0) {
                            var item = result.items[0].data;
                            if (item)
                                this.hcrResult = item
                        }
                        this._searchCompleted()
                    }.bind(this))
                }
            }, _searchCompleted: function _searchCompleted() {
                if (this.searchCompleted)
                    this.searchCompleted()
            }
    })})
