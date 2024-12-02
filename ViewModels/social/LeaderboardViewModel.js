/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    scriptValidator("/Framework/utilities.js", "/Framework/Data/queries/modelQueries.js", "/Framework/Data/Augmenters/xboxLiveAugmenters.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
    WinJS.Namespace.define("MS.Entertainment.Social", {GameLeaderboardViewModel: MS.Entertainment.defineOptionalObservable(function GameLeaderboardViewModelConstructor(mediaItem) {
            if (!mediaItem)
                throw new Error("mediaItem required for GameLeaderboardViewModel");
            if (mediaItem.titleId)
                this._leaderboardModel = new Microsoft.Xbox.Leaderboards.LeaderboardService(mediaItem.titleId);
            this.primaryLeaderboard = {};
            this._mediaItem = mediaItem
        }, {
            _leaderboardModel: null, _leaderboards: null, _leaderboardsPromise: null, _maxLeaders: 3, _maxOther: 3, _mediaItem: null, _signedInUser: null, userLeader: {get: function() {
                        if (!this._signedInUser) {
                            var serviceUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                            this._signedInUser = MS.Entertainment.Data.augment({
                                gamertag: serviceUser.gamerTag, xuid: serviceUser.xuid, rank: 1, rating: String.load(String.id.IDS_SOCIAL_MY_EMPTY_LEADERBOARD_TITLE)
                            }, MS.Entertainment.Data.Augmenter.XboxLive.Leader)
                        }
                        return this._signedInUser
                    }}
        }, {
            primaryLeaderboard: null, otherLeaderboards: null, currentLeaderboard: null, leaderAction: null, getModifierDataSource: function getModifierDataSource() {
                    return this.getLeaderboards()
                }, getLeaderboards: function getLeaderboards() {
                    if (this._leaderboardsPromise)
                        return this._leaderboardsPromise;
                    var getLeaderboards = [];
                    var getLeaderboardsQuery = new MS.Entertainment.Data.Query.LeaderboardMetadataQuery(this._leaderboardModel);
                    var getSystemLeaderboardQuery = new MS.Entertainment.Data.Query.LeaderboardSystemQuery(this._leaderboardModel);
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (signIn.isSignedIn)
                        try {
                            Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.leaderboards)
                        }
                        catch(e) {}
                    getLeaderboards.push(getLeaderboardsQuery.execute().then(function leaderboardsMetadataToArray(query) {
                        if (query.result.items)
                            return query.result.items.toArray();
                        else
                            return WinJS.Promise.wrapError(String.load(String.id.IDS_SOCIAL_ERROR))
                    }.bind(this), function leaderboardsMetadataError(error) {
                        return WinJS.Promise.wrapError(String.load(String.id.IDS_SOCIAL_ERROR))
                    }.bind(this)));
                    getLeaderboards.push(getSystemLeaderboardQuery.execute().then(function systemLeaderboardToArray(query) {
                        return [query.result]
                    }.bind(this), function systemLeaderboardError(error) {
                        return WinJS.Promise.wrapError(String.load(String.id.IDS_SOCIAL_ERROR))
                    }.bind(this)));
                    this._leaderboardsPromise = WinJS.Promise.join(getLeaderboards).then(function storeLeaderboards(boards) {
                        if (boards && boards.length === 2 && boards[0] && boards[1]) {
                            this._leaderboards = boards[0].concat(boards[1]);
                            this._leaderboards.map(function(item, index) {
                                item.index = index
                            });
                            if (this._leaderboards.length > 1)
                                this.otherLeaderboards = this._leaderboards.slice(1, this._maxOther + 1);
                            return this._leaderboards
                        }
                        else
                            return WinJS.Promise.wrapError(String.load(String.id.IDS_SOCIAL_ERROR))
                    }.bind(this), function storeLeaderboardsError(error) {
                        return WinJS.Promise.wrapError(String.load(String.id.IDS_SOCIAL_ERROR))
                    });
                    return this._leaderboardsPromise
                }, _formatLeaderboard: function _formatLeaderboard(leaders) {
                    if (!leaders || !leaders.length)
                        leaders.push(this.userLeader);
                    return leaders.map(function wrapLeader(leader) {
                            leader.onClick = this.leaderAction;
                            return leader
                        }.bind(this))
                }, getItems: function getItems(leaderboard) {
                    MS.Entertainment.Social.assert(leaderboard, "Must provide a leaderboard for getItems (getLeaderboardLeaders)");
                    if (Array.isArray(leaderboard.leaders))
                        return WinJS.Promise.wrap(this._formatLeaderboard(leaderboard.leaders));
                    else if (leaderboard.leaders)
                        return leaderboard.leaders.toArray().then(function leadersToArray(array) {
                                leaderboard.media = this._mediaItem;
                                this.currentLeaderboard = leaderboard;
                                return this._formatLeaderboard(array)
                            }.bind(this));
                    else
                        return this._getLeaderboardData(leaderboard.leaderboardId).then(function leaderboardData(data) {
                                if (data && data.leaders)
                                    return data.leaders.toArray()
                            }).then(function leaderboardArray(array) {
                                return WinJS.Promise.wrap(this._formatLeaderboard(array))
                            }.bind(this), function leaderboardError(error) {
                                return WinJS.Promise.wrapError(String.load(String.id.IDS_SOCIAL_ERROR))
                            })
                }, _getLeaderboardData: function _getLeaderboardData(leaderboardId) {
                    MS.Entertainment.Social.assert(typeof leaderboardId === "number", "Must provide a leaderboardId for _getLeaderboardData");
                    var getLeaderboardQuery = new MS.Entertainment.Data.Query.LeaderboardQuery(this._leaderboardModel, leaderboardId);
                    return getLeaderboardQuery.execute().then(function leaderboardInfo(query) {
                            query.result.media = this._mediaItem;
                            this.currentLeaderboard = query.result;
                            return this.currentLeaderboard
                        }.bind(this), function leaderboardError(error) {
                            this.currentLeaderboard = null
                        })
                }, getPrimaryLeaderboardData: function getPrimaryLeaderboardData() {
                    return this.getLeaderboards().then(function getPrimaryLeaderboard(metadata) {
                            if (metadata[0].leaders) {
                                metadata[0].media = this._mediaItem;
                                this.currentLeaderboard = metadata[0];
                                return metadata[0]
                            }
                            return this._getLeaderboardData(metadata[0].leaderboardId)
                        }.bind(this)).then(function setPrimaryMetadata(primary) {
                            this.primaryLeaderboard = primary;
                            if (this.primaryLeaderboard && this.primaryLeaderboard.leaders)
                                this.primaryLeaderboard.leaders.toArray().then(function getLeaders(leaders) {
                                    leaders = this._formatLeaderboard(leaders);
                                    if (this.otherLeaderboards)
                                        this.primaryLeaderboard.previewLeaders = leaders.slice(0, this._maxLeaders);
                                    else
                                        this.primaryLeaderboard.previewLeaders = leaders.slice(0, this._maxLeaders * 2)
                                }.bind(this));
                            else
                                this.primaryLeaderboard = {leaders: [this.userLeader]}
                        }.bind(this))
                }
        }, {getLeaderboardPositionByGamertag: function getLeaderboardPositionByGamertag(gamerTag, leaderboard) {
                if (!gamerTag || !leaderboard || !leaderboard.leaders)
                    return WinJS.Promise.wrap();
                return leaderboard.leaders.toArray().then(function getLeaders(leaders) {
                        var position = {
                                rank: 0, total: leaders.length
                            };
                        for (var i = 0; i < leaders.length; i++)
                            if (leaders[i].gamerTag === gamerTag) {
                                position.rank = leaders[i].rank;
                                break
                            }
                        return position
                    })
            }})})
})()
