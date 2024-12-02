/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Framework/data/augmenters/xboxLiveAugmenters.js", "/Framework/data/query.js", "/Framework/servicelocator.js", "/Framework/Data/queries/modelProperties.js");
(function(MSE, undefined) {
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {XboxLiveUserQuery: WinJS.Class.derive(MSE.Data.ModelQuery, function xboxLiveUserQuery() {
            MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments)
        }, {
            _userModel: null, userModel: {
                    get: function() {
                        return this._userModel
                    }, set: function(value) {
                            this._userModel = value
                        }
                }, nativeUserModel: {get: function() {
                        return (this._userModel && this._userModel.nativeUserModel) ? this._userModel.nativeUserModel[0] : null
                    }}
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        profileQuery: WinJS.Class.derive(MSE.Data.Query.XboxLiveUserQuery, function xboxLiveUserQuery() {
            MSE.Data.Query.XboxLiveUserQuery.prototype.constructor.apply(this, arguments)
        }, {
            resultAugmentation: MSE.Data.Augmenter.XboxLive.Profile, createAsyncModel: function createAsyncModel() {
                    var operation = null;
                    var userModel = this.nativeUserModel;
                    if (userModel)
                        operation = userModel.getProfileAsync();
                    return operation
                }, createModel: function() {
                    return {}
                }
        }), gamercardQuery: WinJS.Class.derive(MSE.Data.Query.XboxLiveUserQuery, function xboxLiveUserQuery() {
                MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments)
            }, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.Gamercard, gamertag: null, createAsyncModel: function createAsyncModel() {
                        var operation = null;
                        var userModel = this.nativeUserModel;
                        if (userModel)
                            operation = userModel.getGamercardAsync(this.gamertag);
                        return operation
                    }, createModel: function() {
                        return {}
                    }
            }), friendsQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.FriendsResult, createAsyncModel: function createAsyncModel() {
                        var operation;
                        var userModel = this.nativeUserModel;
                        var promise = WinJS.Promise.wrap();
                        if (userModel) {
                            operation = userModel.getFriendsAsync();
                            promise = operation.then(function friendsLoaded(friends) {
                                var ops = [];
                                ops.push(friends.getProfilesAsync());
                                ops.push(friends.getAvatarManifestsAsync());
                                return WinJS.Promise.join(ops).then(function infoLoaded(items) {
                                        var list = {items: []};
                                        var combine = function combineProps(dest, src) {
                                                for (var property in src) {
                                                    if (typeof src[property] === "Object") {
                                                        dest[property] = WinJS.Binding.as({});
                                                        combine(dest[property], src[property]);
                                                        continue
                                                    }
                                                    if (typeof src[property] !== "function")
                                                        dest[property] = src[property]
                                                }
                                            };
                                        for (var x = 0; x < friends.items.length; x++) {
                                            list.items[x] = WinJS.Binding.as({});
                                            combine(list.items[x], friends.items[x]);
                                            combine(list.items[x], items[0].items[x]);
                                            combine(list.items[x], items[1].items[x])
                                        }
                                        return WinJS.Promise.wrap(list)
                                    })
                            })
                        }
                        return promise
                    }, createModel: function() {
                        return {items: []}
                    }
            }), BaseInboxQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                _previousMessages: null, _previousSort: null, _unreadCount: 0, sort: MS.Entertainment.Data.Query.Properties.userMessageSort.none, createModel: function createModel() {
                        if (this.sort === this._previousSort)
                            return this._finalizeResult(this._previousMessages);
                        else
                            return this._finalizeResult(this._sortMessages(this._previousMessages))
                    }, createAsyncModel: function createAsyncModel() {
                        return null
                    }, _filterMessagesAsync: function _filterMessagesAsync(userMessagesResult) {
                        return WinJS.Promise.wrap(userMessagesResult.items.filter(this._filterPredicate.bind(this)))
                    }, _filterPredicate: function _filterPredicate(item) {
                        return true
                    }, _getMessageDetailsAsync: function _getMessageDetailsAsync(messages) {
                        var titleIds = [];
                        var gamercardQueryPromises = {};
                        for (var i = 0; i < messages.length; i++) {
                            var message = messages[i];
                            var senderGamertag = message.senderGamertag;
                            if (message["titleId"] !== undefined && titleIds.indexOf(message.titleId) === -1)
                                titleIds.push(message.titleId);
                            if (!gamercardQueryPromises[senderGamertag]) {
                                var gamercardQuery = new MS.Entertainment.Data.Query.gamercardQuery;
                                gamercardQuery.gamertag = senderGamertag;
                                gamercardQuery.userModel = this.userModel;
                                gamercardQueryPromises[senderGamertag] = gamercardQuery.execute().then(null, function error(err) {
                                    return {result: null}
                                })
                            }
                        }
                        var gameDetailsPromise = null;
                        if (titleIds.length > 0) {
                            var gameDetailsQuery = new MS.Entertainment.Data.Query.Games.GameDetailsFromTitleId;
                            gameDetailsQuery.hexTitleIds = titleIds.map(function toHex(titleId) {
                                return "0x" + parseInt(titleId).toString(16)
                            });
                            gameDetailsPromise = gameDetailsQuery.execute()
                        }
                        else
                            gameDetailsPromise = WinJS.Promise.wrap();
                        var detailsPromises = {
                                gameDetails: gameDetailsPromise, senderGamercards: WinJS.Promise.join(gamercardQueryPromises), messages: WinJS.Promise.wrap(messages)
                            };
                        return WinJS.Promise.join(detailsPromises)
                    }, _augmentMessagesAsync: function _augmentMessagesAsync(detailsResult) {
                        var gameDetails = detailsResult.gameDetails;
                        var senderGamercards = detailsResult.senderGamercards;
                        var messages = detailsResult.messages;
                        var inboxMessages = [];
                        messages.forEach(function forEach(message) {
                            var sender = senderGamercards[message.senderGamertag].result;
                            if (gameDetails) {
                                var game = null;
                                if (gameDetails.result && gameDetails.result.Items)
                                    game = MS.Entertainment.Utilities.searchArray(gameDetails.result.Items, function search(gameDetail) {
                                        return gameDetail.TitleId === message.titleId.toString()
                                    });
                                if (game && sender) {
                                    var inboxMessage = MSE.Data.augment({
                                            message: message, sender: sender, game: MSE.Data.augment(game, MSE.Data.Augmenter.Marketplace.GameEDS)
                                        }, MS.Entertainment.Data.Augmenter.XboxLive.InboxMessage);
                                    inboxMessage.read = (message.sent < MSE.Social.Helpers.lastInboxViewDate);
                                    if (!inboxMessage.read)
                                        this._unreadCount++;
                                    inboxMessages.push(inboxMessage)
                                }
                            }
                            else if (sender) {
                                var textMessage = MSE.Data.augment({
                                        message: message, sender: sender
                                    }, MS.Entertainment.Data.Augmenter.XboxLive.TextInboxMessage);
                                if (!textMessage.read)
                                    this._unreadCount++;
                                inboxMessages.push(textMessage)
                            }
                        }.bind(this));
                        return WinJS.Promise.wrap(inboxMessages)
                    }, _sortMessages: function _sortMessages(inboxMessages) {
                        if (inboxMessages) {
                            var comparer = null;
                            switch (this.sort) {
                                case MS.Entertainment.Data.Query.Properties.userMessageSort.gameTitle:
                                    comparer = MS.Entertainment.Data.Query.Properties.userMessageComparer.gameTitle;
                                    break;
                                case MS.Entertainment.Data.Query.Properties.userMessageSort.date:
                                    comparer = MS.Entertainment.Data.Query.Properties.userMessageComparer.date;
                                    break;
                                case MS.Entertainment.Data.Query.Properties.userMessageSort.gamerTag:
                                    comparer = MS.Entertainment.Data.Query.Properties.userMessageComparer.gamerTag;
                                    break
                            }
                            if (comparer)
                                inboxMessages.sort(comparer.bind(this))
                        }
                        return inboxMessages
                    }, _finalizeResult: function _finalizeResult(inboxMessages) {
                        this._previousMessages = inboxMessages;
                        this._previousSort = this.sort;
                        return {
                                items: inboxMessages, unreadCount: this._unreadCount
                            }
                    }, _parseTotalCount: function _parseTotalCount(result) {
                        var count = -1;
                        if (result && result.items && typeof(result.items.length) === "number")
                            count = result.items.length;
                        return count
                    }
            }), achievementsQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.AchievementsResult, sort: MS.Entertainment.Data.Query.Properties.achievementSort.achievedDate, filter: MS.Entertainment.Data.Query.Properties.achievementFilter.undefined, aggregateChunks: true, createAsyncModel: function createAsyncModel(startIndex, count) {
                        var operation;
                        var userModel = this.nativeUserModel;
                        var filterUnachieved = this.sort === MS.Entertainment.Data.Query.Properties.achievementSort.achievedDate || this.filter === MS.Entertainment.Data.Query.Properties.achievementFilter.unachieved;
                        if (userModel)
                            operation = userModel.getAchievementsForTitleAsync(0, startIndex, count, filterUnachieved, this.sort, null);
                        return operation
                    }, createModel: function() {
                        return {items: []}
                    }
            }), titleAchievementsQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.AchievementsResult, sort: MS.Entertainment.Data.Query.Properties.achievementSort.achievedDate, filter: MS.Entertainment.Data.Query.Properties.achievementFilter.undefined, titleId: null, createAsyncModel: function createAsyncModel(startIndex, count) {
                        var operation;
                        var userModel = this.nativeUserModel;
                        var filterUnachieved = this.sort === MS.Entertainment.Data.Query.Properties.achievementSort.achievedDate || this.filter === MS.Entertainment.Data.Query.Properties.achievementFilter.unachieved;
                        if (userModel && this.titleId)
                            operation = userModel.getAchievementsForTitleAsync(this.titleId, startIndex, count, filterUnachieved, this.sort, null);
                        return operation
                    }, createModel: function() {
                        return {items: []}
                    }
            }), activitiesQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.ActivitiesResult, aggregateChunks: true, titleTypes: [MS.Entertainment.Data.Augmenter.XboxLive.TitleType.standard, MS.Entertainment.Data.Augmenter.XboxLive.TitleType.arcade, MS.Entertainment.Data.Augmenter.XboxLive.TitleType.application], platformTypes: [MS.Entertainment.Data.Augmenter.XboxLive.PlatformType.xbox360, MS.Entertainment.Data.Augmenter.XboxLive.PlatformType.windowsPC, MS.Entertainment.Data.Augmenter.XboxLive.PlatformType.xboxLIVEOnWindows, MS.Entertainment.Data.Augmenter.XboxLive.PlatformType.mobile, MS.Entertainment.Data.Augmenter.XboxLive.PlatformType.webGames], createAsyncModel: function createAsyncModel(startIndex, count) {
                        var operation;
                        var userModel = this.nativeUserModel;
                        if (userModel)
                            operation = userModel.getAllTitleHistoryAsync(startIndex, count, this.titleTypes, this.platformTypes, null);
                        else
                            operation = WinJS.Promise.wrap([]);
                        return operation
                    }, createModel: function() {
                        return {items: []}
                    }
            }), titleActivityQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.Activity, titleId: null, createAsyncModel: function createAsyncModel() {
                        var operation;
                        var userModel = this.nativeUserModel;
                        if (userModel && this.titleId)
                            operation = userModel.getActivityCountForTitleAsync(this.titleId);
                        return operation
                    }, createModel: function() {
                        return {items: []}
                    }
            }), buzzActivityCountQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.ActivityCountsResult, createAsyncModel: function createAsyncModel() {
                        var operation;
                        var userModel = this.nativeUserModel;
                        if (userModel)
                            operation = userModel.getTitleActivityCountAsync(false);
                        return operation
                    }, createModel: function() {
                        return {items: []}
                    }
            }), titleBuzzActivityCountQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.ActivityCount, titleId: null, createAsyncModel: function createAsyncModel() {
                        var operation;
                        var userModel = this.nativeUserModel;
                        if (userModel && this.titleId)
                            operation = userModel.getActivityCountForTitleAsync(this.titleId);
                        return operation
                    }, createModel: function() {
                        return {}
                    }
            }), friendsWithBeaconsQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.FriendsWithBeaconsResult, createAsyncModel: function createAsyncModel() {
                        var operation;
                        var userModel = this.nativeUserModel;
                        if (userModel)
                            operation = userModel.getFriendsWithBeaconsAsync();
                        return operation
                    }, createModel: function() {
                        return {items: []}
                    }
            }), titleBuzzBeaconsQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.FriendActivitiesResult, titleId: null, createAsyncModel: function createAsyncModel() {
                        var operation;
                        var userModel = this.nativeUserModel;
                        if (userModel && this.titleId)
                            operation = userModel.getFriendActivityAsync(this.titleId);
                        return operation
                    }, createModel: function() {
                        return {items: []}
                    }
            }), aggregateTitleActivityQuery: MSE.derive(MSE.Data.AggregateQuery, null, {resultAugmentation: MSE.Data.Augmenter.XboxLive.MergedActivity}), statusQuery: MSE.derive(MSE.Data.Query.XboxLiveUserQuery, null, {
                resultAugmentation: MSE.Data.Augmenter.XboxLive.Status, createAsyncModel: function createAsyncModel() {
                        var operation;
                        var userModel = this.nativeUserModel;
                        if (userModel) {
                            var statusObject = userModel.status;
                            return WinJS.Promise.wrap(statusObject)
                        }
                        return operation
                    }, createModel: function() {
                        return {}
                    }
            })
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        MessagesQuery: MSE.derive(MSE.Data.Query.BaseInboxQuery, function messagesQueryConstructor() {
            this.base();
            this.filter = MSE.Data.Query.MessagesQuery.Filters.user
        }, {
            filter: String.empty, createAsyncModel: function createAsyncModel() {
                    if (this._previousMessages)
                        return null;
                    var userModel = this.nativeUserModel;
                    if (userModel) {
                        var operation = userModel.getTextMessagesAsync(0, 0, null);
                        return operation.then(this._filterMessagesAsync.bind(this)).then(this._getMessageDetailsAsync.bind(this)).then(this._augmentMessagesAsync.bind(this)).then(this._sortMessages.bind(this)).then(this._finalizeResult.bind(this))
                    }
                    return null
                }, _filterPredicate: function _filterPredicate(item) {
                    return (item.messageType === this.filter)
                }, _getSampleTextMessagesAsync: function _getSampleTextMessagesAsync() {
                    var now = new Date;
                    var recent = new Date(now.getTime() - 3600000);
                    var yesterday = new Date(now.getTime() - 86400000);
                    var nextMonth = new Date(now.getTime() + 86400000 * 30);
                    return WinJS.Promise.wrap({items: [{
                                    sent: yesterday, expiration: nextMonth, senderGamertag: "isspelysweet", senderXuid: "2533274811615579", messageSummary: "Hello!", isRead: true
                                }]})
                }
        }, {Filters: {user: "User"}}), GameInvitesQuery: MSE.derive(MSE.Data.Query.BaseInboxQuery, null, {
                filter: [MS.Entertainment.Data.Augmenter.XboxLive.MultiplayerMessageType.invitation, MS.Entertainment.Data.Augmenter.XboxLive.MultiplayerMessageType.yourTurn], createAsyncModel: function createAsyncModel() {
                        if (this._previousMessages)
                            return null;
                        var userModel = this.nativeUserModel;
                        if (userModel) {
                            try {
                                Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.userMessages)
                            }
                            catch(e) {}
                            var getUserMessagesOperation = userModel.getUserMessagesAsync(0, 0, null);
                            this._unreadCount = 0;
                            return getUserMessagesOperation.then(this._filterMessagesAsync.bind(this)).then(this._getMessageDetailsAsync.bind(this)).then(this._augmentMessagesAsync.bind(this)).then(this._sortMessages.bind(this)).then(this._finalizeResult.bind(this))
                        }
                    }, _filterPredicate: function _filterPredicate(item) {
                        var messageType = item.getMultiplayerMessageData().type;
                        for (i = 0; i < this.filter.length; i++)
                            if (messageType === this.filter[i])
                                return true;
                        return false
                    }, _getSampleUserMessagesAsync: function _getSampleUserMessagesAsync() {
                        var now = new Date;
                        var recent = new Date(now.getTime() - 3600000);
                        var yesterday = new Date(now.getTime() - 86400000);
                        var lastMonth = new Date(now.getTime() - 86400000 * 30);
                        return WinJS.Promise.wrap({items: [{
                                        sent: yesterday, titleId: 1096157379, senderGamertag: "issprthealien", getMultiplayerMessageData: function() {
                                                return {
                                                        type: Microsoft.Xbox.MultiplayerMessageType.invitation, sessionId: "aaa"
                                                    }
                                            }
                                    }, {
                                        sent: lastMonth, titleId: 1297287449, senderGamertag: "prthealien", getMultiplayerMessageData: function() {
                                                return {
                                                        type: Microsoft.Xbox.MultiplayerMessageType.invitation, sessionId: "bbb"
                                                    }
                                            }
                                    }, {
                                        sent: recent, titleId: 1297287738, senderGamertag: "Major Nelson", getMultiplayerMessageData: function() {
                                                return {
                                                        type: Microsoft.Xbox.MultiplayerMessageType.yourTurn, sessionId: "ccc"
                                                    }
                                            }
                                    }, {
                                        sent: yesterday, titleId: 1161890066, senderGamertag: "prthealien", getMultiplayerMessageData: function() {
                                                return {
                                                        type: Microsoft.Xbox.MultiplayerMessageType.invitation, sessionId: "ddd"
                                                    }
                                            }
                                    }, {
                                        sent: lastMonth, titleId: 1297287259, senderGamertag: "mojojoey", getMultiplayerMessageData: function() {
                                                return {
                                                        type: Microsoft.Xbox.MultiplayerMessageType.invitation, sessionId: "eee"
                                                    }
                                            }
                                    }, ]})
                    }
            })
    });
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {InboxQuery: WinJS.Class.derive(MSE.Data.AggregateQuery, function inboxQuery() {
            MS.Entertainment.Data.AggregateQuery.prototype.constructor.apply(this, arguments);
            var messages = new MS.Entertainment.Data.Query.MessagesQuery;
            var gameInvites = new MS.Entertainment.Data.Query.GameInvitesQuery;
            this.queries.push(messages);
            this.queries.push(gameInvites);
            this.resultAugmentationFactory = {create: this._createResultAugmentation.bind(this)}
        }, {
            _userModel: null, _sort: MS.Entertainment.Data.Query.Properties.userMessageSort.none, userModel: {
                    get: function() {
                        return this._userModel
                    }, set: function(value) {
                            this._userModel = value;
                            for (var i = 0; i < this.queries.length; i++)
                                this.queries[i].userModel = this._userModel
                        }
                }, sort: {
                    get: function() {
                        return this._sort
                    }, set: function(value) {
                            this._sort = value;
                            for (var i = 0; i < this.queries.length; i++)
                                this.queries[i].sort = this._sort
                        }
                }, _createResultAugmentation: function _createResultAugmentation() {
                    var comparer = null;
                    switch (this.sort) {
                        case MS.Entertainment.Data.Query.Properties.userMessageSort.gameTitle:
                            comparer = MS.Entertainment.Data.Query.Properties.userMessageComparer.gameTitle;
                            break;
                        case MS.Entertainment.Data.Query.Properties.userMessageSort.gamerTag:
                            comparer = MS.Entertainment.Data.Query.Properties.userMessageComparer.gamerTag;
                            break;
                        case MS.Entertainment.Data.Query.Properties.userMessageSort.date:
                            comparer = MS.Entertainment.Data.Query.Properties.userMessageComparer.date;
                            break;
                        case MS.Entertainment.Data.Query.Properties.userMessageSort.none:
                            comparer = MS.Entertainment.Data.Query.Properties.userMessageComparer.none;
                            break
                    }
                    var merger = function merger(message1, message2) {
                            if (message1)
                                return message1;
                            else
                                return message2
                        };
                    return MS.Entertainment.Data.define(null, {items: MS.Entertainment.Data.Property.union("source[0].items", "source[1].items", comparer, merger.bind(this))})
                }, _parseTotalCount: function _parseTotalCount(result) {
                    var count = -1;
                    if (result && result.items && typeof(result.items.count) === "number")
                        count = result.items.count;
                    return count
                }
        })}),
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {gamesQuery: MSE.derive(MSE.Data.Query.activitiesQuery, null, {resultAugmentation: MSE.Data.Augmenter.XboxLive.GamesResult})});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {
        LeaderboardMetadataQuery: WinJS.Class.derive(MSE.Data.ModelQuery, function LeaderboardMetadataQueryConstructor(model) {
            MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments);
            this._model = model
        }, {
            _model: null, resultAugmentation: MSE.Data.Augmenter.XboxLive.Leaderboards, createAsyncModel: function createAsyncModel() {
                    return this._model ? this._model.getLeaderboardsAsync() : null
                }
        }), LeaderboardSystemQuery: WinJS.Class.derive(MSE.Data.ModelQuery, function LeaderboardSystemQueryConstructor(model) {
                MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments);
                this._model = model;
                this._leaderboardName = "Gamerscore"
            }, {
                _model: null, _leaderboardName: String.empty, resultAugmentation: MSE.Data.Augmenter.XboxLive.SystemLeaderboard, createAsyncModel: function createAsyncModel(startIndex, count) {
                        var operation = null;
                        if (this._model)
                            operation = this._model.getSystemLeaderboardAsync(startIndex, count, this._leaderboardName, null);
                        return operation
                    }
            }), LeaderboardQuery: WinJS.Class.derive(MSE.Data.ModelQuery, function LeaderboardQueryConstructor(model, leaderboardId, isTitleView) {
                MSE.Data.ModelQuery.prototype.constructor.apply(this, arguments);
                this._model = model;
                this._leaderboardId = leaderboardId;
                this._isTitleView = isTitleView ? isTitleView : false
            }, {
                _model: null, _leaderboardId: -1, _isTitleView: false, resultAugmentation: MSE.Data.Augmenter.XboxLive.Leaderboard, createAsyncModel: function createAsyncModel(startIndex, count) {
                        var operation = null;
                        if (this._model)
                            operation = this._model.getLeaderboardAsync(startIndex, count, this._leaderboardId, this._isTitleView, null, null);
                        return operation
                    }
            })
    })
})(WinJS.Namespace.define("MS.Entertainment", null))
