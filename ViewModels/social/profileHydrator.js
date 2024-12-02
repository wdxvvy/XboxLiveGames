/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/augmenters/xboxLiveAugmenters.js", "/Framework/data/list.js", "/Framework/data/queries/modelQueries.js", "/Framework/data/queries/modelProperties.js", "/Framework/data/query.js", "/Framework/debug.js", "/Framework/querywatcher.js", "/Framework/stringids.js", "/Framework/Utilities.js", "/Framework/observablearray.js", "/ViewModels/Social/social.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
(function(MSE, undefined) {
    WinJS.Namespace.defineWithParent(MSE, "Social", {
        DataNotificationHandler: WinJS.Class.define(function dataNotificationHandler(dataChangedCallback, addDataCallback, removeDataCallback, updateDataCallback, additionalData) {
            this._dataChangedCallback = dataChangedCallback;
            this._addDataCallback = addDataCallback;
            this._removeDataCallback = removeDataCallback;
            this._updateDataCallback = updateDataCallback;
            this._additionalData = additionalData
        }, {
            _dataChangedCallback: null, _addDataCallback: null, _removeDataCallback: null, _updateDataCallback: null, _additionalData: null, dispose: function dispose() {
                    this._dataChangedCallback = null;
                    this._addDataCallback = null;
                    this._removeDataCallback = null;
                    this._updateDataCallback = null
                }, inserted: function inserted(item, previousKey, nextKey, index) {
                    if (this._addDataCallback)
                        this._addDataCallback(item.data, index, this._additionalData)
                }, changed: function changed(newItem, oldItem) {
                    if (this._updateDataCallback)
                        this._updateDataCallback(newItem.data, oldItem.data)
                }, moved: function moved(item, previousKey, nextKey, oldIndex, newIndex){}, removed: function removed(key, index) {
                    if (this._removeDataCallback)
                        this._removeDataCallback(key, index)
                }, countChanged: function countChanged(newCount, oldCount){}, endNotifications: function endNotifications() {
                    if (this._dataChangedCallback)
                        this._dataChangedCallback(this._additionalData)
                }
        }), Helpers: WinJS.Class.define(function helpersConstructor() {
                throw"Helpers class should just have static members.";
            }, {}, {
                loadFriends: function(query) {
                    var mutualFriends = [];
                    var incomingFriends = [];
                    var outgoingFriends = [];
                    if (!query) {
                        query = new MSE.Data.Query.friendsQuery;
                        query.userModel = MSE.Social.Helpers.createUserModel()
                    }
                    function expandFriendListEntry(friendListEntry) {
                        var item = friendListEntry.item.data;
                        switch (item.status.relation) {
                            case MSE.Data.Augmenter.XboxLive.UserRelation.userRelationFriendRequester:
                                incomingFriends.push(item);
                                break;
                            case MSE.Data.Augmenter.XboxLive.UserRelation.userRelationFriendRequestee:
                                outgoingFriends.push(item);
                                break;
                            case MSE.Data.Augmenter.XboxLive.UserRelation.userRelationMutualFriend:
                                mutualFriends.push(item);
                                break
                        }
                    }
                    {};
                    function createResultObject() {
                        var pendingFriends = incomingFriends.concat(outgoingFriends);
                        var allFriends = mutualFriends.concat(pendingFriends);
                        var results = {};
                        results["mutual"] = {
                            loadedFriends: new MSE.Data.VirtualList(null, mutualFriends), totalFriends: mutualFriends.length
                        };
                        results["incoming"] = {
                            loadedFriends: new MSE.Data.VirtualList(null, incomingFriends), totalFriends: incomingFriends.length
                        };
                        results["outgoing"] = {
                            loadedFriends: new MSE.Data.VirtualList(null, outgoingFriends), totalFriends: outgoingFriends.length
                        };
                        results["pending"] = {
                            loadedFriends: new MSE.Data.VirtualList(null, pendingFriends), totalFriends: pendingFriends.length
                        };
                        results["all"] = {
                            loadedFriends: new MSE.Data.VirtualList(null, allFriends), totalFriends: allFriends.length
                        };
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        if (signedInUser.isGamerTag(query.userModel.gamerTag)) {
                            var type;
                            for (type in results)
                                if (results.hasOwnProperty(type) && typeof results[type] !== "function")
                                    MS.Entertainment.Utilities.Telemetry.logFriendState(type, results[type].totalFriends)
                        }
                        return WinJS.Promise.wrap(results)
                    }
                    {};
                    function handleLoadedFriends(finishedQuery) {
                        if (!finishedQuery || !finishedQuery.result || !finishedQuery.result.items)
                            return WinJS.Promise.wrap();
                        return finishedQuery.result.items.forEach(expandFriendListEntry).then(createResultObject)
                    }
                    {};
                    return query.execute().then(handleLoadedFriends)
                }, createUserModel: function createUserModel(userXuidOrNativeUser, gamerTag) {
                        if (userXuidOrNativeUser)
                            return new MSE.Utilities.User(userXuidOrNativeUser, gamerTag);
                        else
                            return MSE.ServiceLocator.getService(MSE.Services.signedInUser)
                    }, getSignedInUserModel: function getSignedInUserModel() {
                        var signedInUserModel = MSE.Social.Helpers._signedInUserModel;
                        if (!signedInUserModel) {
                            signedInUserModel = new MS.Entertainment.Social.ProfileHydrator;
                            signedInUserModel.userModel = MS.Entertainment.Social.Helpers.createUserModel();
                            signedInUserModel.loadProfile = true;
                            signedInUserModel.loadFriends = true;
                            signedInUserModel.loadFriendProfiles = true;
                            signedInUserModel.loadMessages = true;
                            signedInUserModel.loadAchievements = false;
                            signedInUserModel.loadActivity = false;
                            signedInUserModel.enabled = true;
                            MSE.Social.Helpers._signedInUserModel = signedInUserModel
                        }
                        return signedInUserModel
                    }, isOnline: function isOnline(userStatus) {
                        return userStatus.isOnline
                    }, getNavigationUserXuid: function getNavigationUserXuid() {
                        var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                        var userXuid;
                        if (currentPage.options && currentPage.options)
                            userXuid = currentPage.options.userXuid;
                        return userXuid
                    }, getNavigationUserModel: function getNavigationUserModel() {
                        var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                        var userModel;
                        if (currentPage && currentPage.options)
                            userModel = currentPage.options.userModel;
                        return userModel
                    }, getXuidFromUserModel: function getXuidFromNavigationModel(userModel) {
                        if (userModel && userModel.nativeUserModel && userModel.nativeUserModel[0])
                            return userModel.nativeUserModel[0].identity.xuid;
                        else if (userModel && userModel.identity)
                            return userModel.identity.xuid;
                        else if (userModel && userModel.userXuid)
                            return userModel.userXuid;
                        return 0
                    }, getGamerTagFromUserModel: function getXuidFromNavigationModel(userModel) {
                        if (userModel && userModel.nativeUserModel && userModel.nativeUserModel[0])
                            return userModel.nativeUserModel[0].identity.gamertag;
                        return String.empty
                    }, shareProfile: function shareProfile(xuid) {
                        var query = new MS.Entertainment.Data.Query.profileQuery;
                        query.userModel = MS.Entertainment.Social.Helpers.createUserModel(xuid);
                        return query.execute().then(function queryCompleted() {
                                if (query.result) {
                                    var sender = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.shareSender);
                                    sender.pendingShare(query.result)
                                }
                            })
                    }, lastInboxViewDate: {
                        get: function get() {
                            return Windows.Storage.ApplicationData.current.localSettings.values["lastInboxViewDate"] || new Date(0)
                        }, set: function set(value) {
                                Windows.Storage.ApplicationData.current.localSettings.values["lastInboxViewDate"] = value
                            }
                    }, _signedInUserModel: null, emptyProfile: {
                        gamerTag: null, userXuid: null, userModel: null, status: {media: {
                                    name: null, imageUri: null
                                }}
                    }
            })
    });
    WinJS.Namespace.defineWithParent(MSE, "Social", {Hydrator: MS.Entertainment.defineObservable(function hydrator(userXuid) {
            this.userModel = MSE.Social.Hydrator.invalidUser;
            this.userXuid = MSE.Social.Hydrator.invalidUser;
            this._lastUserModel = MSE.Social.Hydrator.invalidUser;
            this._lastUserXuid = MSE.Social.Hydrator.invalidUser;
            var handlePropertyChanged = this._handlePropertyChanged.bind(this);
            var handleUserModelChanged = this._handleUserModelChanged.bind(this);
            this.status = MSE.Social.LoadStatus.idle;
            this.bind("enabled", handlePropertyChanged);
            this.bind("userModel", handleUserModelChanged);
            this.bind("userXuid", handlePropertyChanged)
        }, {
            status: null, errorResult: null, enabled: false, userXuid: null, userModel: null, _currentUserModel: null, _currentSignInHandlers: null, _lastUserXuid: null, _lastUserModel: null, _signingInCompleted: null, _signingInFailed: null, dispose: function dispose() {
                    this._innerDispose();
                    this.unbind();
                    this._uninitializeSignInHandlers();
                    this._completeSigningInPromise(new Error("Hydrator disposed"), true)
                }, execute: function execute() {
                    this._refreshCurrentUserModel();
                    return this._beginRefresh(this._currentUserModel, false)
                }, refresh: function refresh(preventReset) {
                    if (this.enabled) {
                        this._refreshCurrentUserModel();
                        return this._beginRefresh(this._currentUserModel, preventReset)
                    }
                    else
                        return WinJS.Promise.wrapError(new Error("Hydrator is not enabled"))
                }, _handlePropertyChanged: function _handlePropertyChanged() {
                    if (WinJS.Binding.unwrap(this._lastUserModel) !== WinJS.Binding.unwrap(this.userModel) || WinJS.Binding.unwrap(this._lastUserXuid) !== WinJS.Binding.unwrap(this.userXuid))
                        this.refresh().done(null, function(){})
                }, _handleUserModelChanged: function _handleUserModelChanged(newModel) {
                    if (WinJS.Binding.unwrap(this._lastUserModel) !== WinJS.Binding.unwrap(this.userModel) || WinJS.Binding.unwrap(this._lastUserXuid) !== WinJS.Binding.unwrap(this.userXuid))
                        if (newModel && newModel.identity) {
                            this.userModel = MSE.Social.Hydrator.invalidUser;
                            this.userXuid = newModel.identity.xuid;
                            this.gamerTag = newModel.identity.gamerTag
                        }
                }, _beginRefresh: function _beginRefresh(userModel, preventReset) {
                    var returnPromise;
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    if (!preventReset)
                        this._reset();
                    this.status = MSE.Social.LoadStatus.loading;
                    if (signIn.isSigningIn)
                        returnPromise = this._createSigningInPromise();
                    else if (!userModel || !signIn.isSignedIn) {
                        var error = new Error("User is offline");
                        this.status = MSE.Social.LoadStatus.offline;
                        this._completeSigningInPromise(error, true);
                        returnPromise = WinJS.Promise.wrapError(error)
                    }
                    else
                        returnPromise = this._innerRefresh(userModel).then(function success(result) {
                            this.status = MSE.Social.LoadStatus.loaded;
                            this._completeSigningInPromise(result, false);
                            return result
                        }.bind(this), function error(errorResult) {
                            this.status = MSE.Social.LoadStatus.parseXboxLiveError(errorResult);
                            this.errorResult = errorResult;
                            this._completeSigningInPromise(errorResult, true);
                            return errorResult
                        }.bind(this));
                    return returnPromise
                }, _reset: function _reset() {
                    this.status = MSE.Social.LoadStatus.idle;
                    this.errorResult = null;
                    this._innerReset()
                }, _innerReset: function _innerReset() {
                    throw new Error("_reset() hasn't been implemented");
                }, _innerRefresh: function _innerRefresh(userModel) {
                    throw new Error("_innerRefresh() hasn't been implemented");
                }, _innerDispose: function _innerDispose() {
                    throw new Error("_innerDispose() hasn't been implemented");
                }, _refreshCurrentUserModel: function _refreshCurrentUserModel() {
                    this._lastUserModel = this.userModel;
                    this._lastUserXuid = this.userXuid;
                    var currentXuid = WinJS.Binding.unwrap(this.userXuid);
                    var currentUserModel = WinJS.Binding.unwrap(this.userModel);
                    MS.Entertainment.Social.assert(currentXuid === MSE.Social.Hydrator.invalidUser || currentUserModel === MSE.Social.Hydrator.invalidUser, "Both userXuid and userModel are set in the hydrator. Only set one at a time. Defaulting to userModel value");
                    MS.Entertainment.Social.assert(currentXuid !== MSE.Social.Hydrator.invalidUser || currentUserModel !== MSE.Social.Hydrator.invalidUser, "Both userXuid and userModel havn't been set. Defaulting to signed in user");
                    if (!currentUserModel || currentUserModel === MSE.Social.Hydrator.invalidUser)
                        currentUserModel = MSE.Social.Helpers.createUserModel(currentXuid === MSE.Social.Hydrator.invalidUser ? 0 : currentXuid, this.gamerTag);
                    if (this._currentUserModel !== currentUserModel)
                        if (!this._currentUserModel || (currentUserModel && this._currentUserModel !== currentUserModel.userModel)) {
                            this._currentUserModel = currentUserModel;
                            this._initializeSignInHandlers()
                        }
                }, _createSigningInPromise: function _createSigningInPromise() {
                    this._completeSigningInPromise(new Error("Operation cancelled"), true);
                    return new WinJS.Promise(function(completed, error) {
                            this._signingInCompleted = completed;
                            this._signingInFailed = error
                        }.bind(this))
                }, _completeSigningInPromise: function _completeSigningInPromise(result, error) {
                    if (error) {
                        if (this._signingInFailed)
                            this._signingInFailed(result)
                    }
                    else if (this._signingInCompleted)
                        this._signingInCompleted(result);
                    this._signingInFailed = null;
                    this._signingInCompleted = null
                }, _handleSignedInChanges: function _handleSignedInChanges(newValue, oldValue) {
                    if (oldValue !== undefined) {
                        this.onSignedInChanged(newValue, oldValue);
                        this.refresh().done(null, function(){})
                    }
                }, _handleSignInError: function _handleSignInError(newValue, oldValue) {
                    if (newValue)
                        this.refresh().done(null, function(){})
                }, _initializeSignInHandlers: function _initializeSignInHandlers() {
                    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                    this._uninitializeSignInHandlers();
                    this._currentSignInHandlers = WinJS.Binding.bind(signIn, {
                        isSignedIn: this._handleSignedInChanges.bind(this), signInError: this._handleSignInError.bind(this)
                    })
                }, _uninitializeSignInHandlers: function _uninitializeSignInHandlers() {
                    if (this._currentSignInHandlers) {
                        this._currentSignInHandlers.cancel();
                        this._currentSignInHandlers = null
                    }
                }
        }, {invalidUser: {}})});
    WinJS.Namespace.defineWithParent(MSE, "Social", {
        ProfileHydrator: MS.Entertainment.derive(MSE.Social.Hydrator, function profileHydrator(userXuid) {
            this.base(userXuid);
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("profile");
            this._reset();
            this._queryWatcher.autoClear = false;
            this.refreshAchievementsBindings()
        }, {
            _executePromise: null, _queryWatcher: null, _profileQuery: null, _identityQuery: null, _friendsQuery: null, _activitiesQuery: null, _messagesQuery: null, _serviceIdActivityMappings: {}, loadProfile: true, loadFriends: true, loadAchievements: true, loadActivity: true, loadMessages: false, loadIdentity: false, clearAchievementsCache: false, clearFriendsCache: true, clearProfileCache: false, suppressProfileErrors: false, suppressFriendErrors: false, suppressAchievementErrors: false, suppressActivityErrors: false, suppressMessageErrors: false, suppressIdentityErrors: false, profile: null, achievements: null, activities: null, messages: null, unreadMessageCount: 0, friends: null, outgoingFriends: null, incomingFriends: null, pendingFriends: null, allFriends: null, isSignedInUser: false, loadFriendProfiles: false, maxFriendsToHydrate: -1, achievementsSort: MS.Entertainment.Data.Query.Properties.achievementSort.achievedDate, achievementsFilter: MS.Entertainment.Data.Query.Properties.achievementFilter.unachieved, _innerDispose: function _innerDispose() {
                    if (this.achievements)
                        this.achievements.dispose()
                }, createUserModel: function createUserModel() {
                    var winRTUserModel = this.userModel ? WinJS.Binding.unwrap(this.userModel).value : null;
                    MS.Entertainment.Social.assert(!this.userXuid || !winRTUserModel, "Both userXuid and userModel are set in ProfileHydrator. Only set one at a time. Defaulting to userModel value");
                    return winRTUserModel ? winRTUserModel : MSE.Social.Helpers.createUserModel(this.userXuid, this.gamerTag)
                }, findGameActivity: function findGameActivity(titleId) {
                    return this._serviceIdActivityMappings[titleId]
                }, refreshAchievementsBindings: function refreshAchievementsBindings() {
                    this.bind("achievementsSort", function(newValue, oldValue) {
                        if (newValue !== undefined && oldValue !== undefined && this.status === MS.Entertainment.Social.LoadStatus.loaded)
                            this.refresh(true)
                    }.bind(this));
                    this.bind("achievementsFilter", function(newValue, oldValue) {
                        if (newValue !== undefined && oldValue !== undefined && this.status === MS.Entertainment.Social.LoadStatus.loaded)
                            this.refresh(true)
                    }.bind(this))
                }, _innerRefresh: function _innerRefresh(model) {
                    var that = this;
                    var promises = {};
                    if (this.loadProfile) {
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        if (this.clearProfileCache && signIn.isSignedIn)
                            try {
                                Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.profile)
                            }
                            catch(e) {}
                        if (!this._profileQuery) {
                            this._profileQuery = new MSE.Data.Query.profileQuery;
                            this._queryWatcher.registerQuery(this._profileQuery)
                        }
                        this._profileQuery.userModel = model
                    }
                    if (this.loadIdentity)
                        this._identityQuery = Microsoft.Xbox.XboxLIVEService.refreshTokenAsync;
                    if (this.loadFriends) {
                        if (!this._friendsQuery) {
                            this._friendsQuery = new MSE.Data.Query.friendsQuery;
                            this._queryWatcher.registerQuery(this._friendsQuery)
                        }
                        this._friendsQuery.userModel = model
                    }
                    if (this.loadActivity) {
                        if (!this._activitiesQuery) {
                            this._activitiesQuery = new MSE.Data.Query.activitiesQuery;
                            this._queryWatcher.registerQuery(this._activitiesQuery)
                        }
                        this._activitiesQuery.userModel = model;
                        this._activitiesQuery.titleTypes = [Microsoft.Xbox.TitleType.standard, Microsoft.Xbox.TitleType.arcade];
                        this._activitiesQuery.platformTypes = [Microsoft.Xbox.PlatformType.xbox360, Microsoft.Xbox.PlatformType.xboxLIVEOnWindows, Microsoft.Xbox.PlatformType.mobile, Microsoft.Xbox.PlatformType.webGames];
                        if (this.loadAchievements)
                            this._activitiesQuery.chunkSize = MS.Entertainment.Data.XboxLive.MAX_TITLE_ACTIVITY_COUNT
                    }
                    if (this.loadMessages) {
                        if (!this._messagesQuery) {
                            this._messagesQuery = new MSE.Data.Query.InboxQuery;
                            this._messagesQuery.sort = MS.Entertainment.Data.Query.Properties.userMessageSort.date;
                            this._queryWatcher.registerQuery(this._messagesQuery)
                        }
                        this._messagesQuery.userModel = model
                    }
                    if (this._profileQuery)
                        promises["profilePromise"] = this._profileQuery.execute().then(function profileQuerySuccess(q) {
                            that.profile = q.result
                        }, function handleProfileError(error) {
                            if (!that.suppressProfileErrors)
                                return WinJS.Promise.wrapError(error)
                        });
                    if (this._identityQuery)
                        promises["identityPromise"] = this._identityQuery().then(function identityQuerySuccess(q) {
                            if (q && that.profile && that.profile.gamerTag && that.profile.gamerTag !== q.gamertag)
                                that.profile.gamerTag = q.gamertag
                        }, function handleIdentityError(error) {
                            if (!that.suppressIdentityErrors)
                                return WinJS.Promise.wrapError(error)
                        });
                    if (this._friendsQuery) {
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        if (this.clearFriendsCache && signIn.isSignedIn)
                            try {
                                Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.friends)
                            }
                            catch(e) {}
                        promises["friendsPromise"] = MSE.Social.Helpers.loadFriends(this._friendsQuery).then(function setFriendDetails(friendResult) {
                            if (friendResult) {
                                this.friends = friendResult["mutual"].loadedFriends;
                                this.incomingFriends = friendResult["incoming"].loadedFriends;
                                this.outgoingFriends = friendResult["outgoing"].loadedFriends;
                                this.pendingFriends = friendResult["pending"].loadedFriends;
                                this.allFriends = friendResult["all"].loadedFriends
                            }
                        }.bind(this), function handleFriendError(error) {
                            if (!that.suppressFriendErrors)
                                return WinJS.Promise.wrapError(error)
                        }.bind(this))
                    }
                    if (this._messagesQuery)
                        promises["messagesPromise"] = this._messagesQuery.execute().then(function messagesQuerySuccess(q) {
                            if (q.result) {
                                this.messages = q.result.items;
                                this.unreadMessageCount = q.result.source[0].unreadCount + q.result.source[1].unreadCount;
                                MS.Entertainment.Utilities.Telemetry.logMessagesState("unreadTextMessages", q.result.source[0].unreadCount);
                                MS.Entertainment.Utilities.Telemetry.logMessagesState("unreadGameInvites", q.result.source[1].unreadCount);
                                MS.Entertainment.Utilities.Telemetry.logMessagesState("totalTextMessages", q.result.source[0].items ? q.result.source[0].items.length : 0);
                                MS.Entertainment.Utilities.Telemetry.logMessagesState("totalGameInvites", q.result.source[1].items ? q.result.source[1].items.length : 0)
                            }
                        }.bind(this), function handleMessagesError(error) {
                            if (!this.suppressMessageErrors)
                                return WinJS.Promise.wrapError(error && error.originalError && (error.originalError[0] || error.originalError[1]))
                        }.bind(this));
                    if (this._activitiesQuery)
                        promises["activitiesPromise"] = this._activitiesQuery.execute().then(function activitiesQuerySuccess(q) {
                            that.activities = q.result.items;
                            return that._postProcessActivitiesQuery(q.result.items)
                        }, function handleActivitiesError(error) {
                            if (!that.suppressActivityErrors)
                                return WinJS.Promise.wrapError(error)
                        });
                    else
                        promises["activitiesPromise"] = WinJS.Promise.wrap();
                    promises["achievementsPromise"] = promises["activitiesPromise"].then(function() {
                        return that._refreshAchievements(model)
                    });
                    var executePromise = WinJS.Promise.join(promises);
                    function finalizeResults() {
                        if (WinJS.Binding.unwrap(this._executePromise) === executePromise) {
                            this._executePromise = null;
                            this._hydrateProfile()
                        }
                    }
                    {};
                    function handleExecutePromiseFailure(errorResult) {
                        finalizeResults.apply(this);
                        if (errorResult.name !== "Canceled") {
                            var errorMessage = String.empty;
                            if (errorResult.profilePromise && errorResult.profilePromise.name !== "Canceled")
                                errorMessage = "Profile Hydrator queries failed " + errorResult.profilePromise.description;
                            else if (errorResult.friendsPromise && errorResult.friendsPromise.name !== "Canceled")
                                errorMessage = "Friends Hydrator queries failed " + errorResult.friendsPromise.description;
                            else if (errorResult.activitiesPromise && errorResult.activitiesPromise.name !== "Canceled")
                                errorMessage = "Activities Hydrator queries failed " + errorResult.activitiesPromise.description;
                            else if (errorResult.messagesPromise && errorResult.messagesPromise.name !== "Canceled")
                                errorMessage = "Messaging Hydrator queries failed " + errorResult.messagesPromise.description;
                            if (errorMessage)
                                MS.Entertainment.Social.fail(errorMessage, null, MS.Entertainment.UI.Debug.errorLevel.low)
                        }
                    }
                    {};
                    this._executePromise = executePromise;
                    executePromise.then(finalizeResults.bind(this), handleExecutePromiseFailure.bind(this));
                    return executePromise
                }, _postProcessActivitiesQuery: function _postProcessActivitiesQuery(input) {
                    return input.itemsFromIndex(0).then(function copyItems(result) {
                            if (result.items)
                                result.items.forEach(function(item) {
                                    var activity = item.data;
                                    this._serviceIdActivityMappings[activity.media.titleId] = activity
                                }, this)
                        }.bind(this))
                }, _refreshAchievements: function _refreshAchievements(model) {
                    if (!model)
                        return WinJS.Promise.wrapError(new Error("Unable to load achievements, no model has been provided"));
                    else if (this.loadAchievements) {
                        var achievements = new MSE.Social.GameAchievementsDataSourceAdapter(model);
                        achievements.sort = this.achievementsSort;
                        achievements.filter = this.achievementsFilter;
                        this.achievements = achievements;
                        var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        if (this.clearAchievementsCache && signIn.isSignedIn)
                            try {
                                Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.titleHistory);
                                Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.achievements)
                            }
                            catch(e) {}
                        return achievements._getSourceItemsAsync(0, achievements.chunkSize)
                    }
                    return WinJS.Promise.wrap()
                }, _postProcessAchievements: function _postProcessAchievements(query) {
                    this.achievements = query.result.items
                }, _filterAchievementItem: function _filterAchievementItem(item) {
                    return ((!item.earned) && (this.achievementsFilter === MSE.Data.Query.Properties.achievementFilter.unachieved || this.achievementsSort === MSE.Data.Query.Properties.achievementSort.achievedDate))
                }, _sortAchievementPropertyName: function _sortAchievementPropertyName() {
                    var propertyName;
                    switch (this.achievementsSort) {
                        case MSE.Data.Query.Properties.achievementSort.game:
                            propertyName = "media.titleId";
                            break;
                        case MSE.Data.Query.Properties.achievementSort.achievedDate:
                            propertyName = "earnedDate";
                            break;
                        default:
                            break
                    }
                    return propertyName
                }, _innerReset: function _innerReset() {
                    this._queryWatcher.clearQueries();
                    if (this._executePromise) {
                        WinJS.Binding.unwrap(this._executePromise).cancel();
                        this._executePromise = null
                    }
                    this._serviceIdActivityMappings = {};
                    this._profileQuery = null;
                    this._friendsQuery = null;
                    this._activitiesQuery = null;
                    this._messagesQuery = null;
                    this.error = false;
                    this.hasFriends = true;
                    this.hasOutgoingFriends = true;
                    this.hasIncomingFriends = true;
                    this.hasPendingFriends = true;
                    this.hasAllFriends = true;
                    this.isSignedInUser = false;
                    if (this.loadProfile)
                        this.profile = MSE.Social.Helpers.emptyProfile;
                    if (this.loadFriends) {
                        this.friends = null;
                        this.outgoingFriends = null;
                        this.incomingFriends = null;
                        this.pendingFriends = null;
                        this.allFriends = null
                    }
                    if (this.achievements) {
                        this.achievements.dispose();
                        this.achievements = null
                    }
                    if (this.loadActivity)
                        this.activities = null;
                    if (this.loadMessages)
                        this.messages = null
                }, onSignedInChanged: function onSignedInChanged(newValue, oldValue) {
                    if (oldValue && !newValue)
                        MSE.Social.Helpers.lastInboxViewDate = new Date(0)
                }, _hydrateProfile: function _hydrateProfile() {
                    if (this.profile && this.profile !== MSE.Social.Helpers.emptyProfile) {
                        this.profile.achievements = this.achievements;
                        this.profile.activities = this.activities;
                        this.profile.userModel = this.userModel;
                        this.profile.userXuid = this.userXuid;
                        var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                        this.isSignedInUser = signedInUser.isGamerTag(this.profile.gamerTag)
                    }
                    else
                        this.isSignedInUser = false
                }
        }, {
            achievementSorts: (function() {
                var value;
                return {get: function() {
                            if (!value)
                                value = [{
                                        label: String.load(String.id.IDS_SOCIAL_ACHIEVEMENTS_SORT_GAME), key: MSE.Data.Query.Properties.achievementSort.game, id: "gameSort"
                                    }, {
                                        label: String.load(String.id.IDS_SOCIAL_ACHIEVEMENTS_SORT_DATE), key: MSE.Data.Query.Properties.achievementSort.achievedDate, id: "dateSort"
                                    }];
                            return value
                        }}
            })(), achievementFilters: (function() {
                    var value;
                    return {get: function() {
                                if (!value)
                                    value = [{
                                            label: String.load(String.id.IDS_FILTER_ALL), key: MSE.Data.Query.Properties.achievementFilter.undefined, id: "allAchievements"
                                        }, {
                                            label: String.load(String.id.IDS_SOCIAL_ACHIEVEMENTS_FILTER_EARNED), key: MSE.Data.Query.Properties.achievementFilter.unachieved, id: "earnedAchievements"
                                        }];
                                return value
                            }}
                })()
        }), GameAchievementsDataSourceAdapter: WinJS.Class.derive(MS.Entertainment.Data.VirtualListBase, function gameAchievementsDataSourceAdapter(userModel) {
                MS.Entertainment.Data.VirtualListBase.prototype.constructor.call(this);
                this._achievements = [];
                this._games = [];
                this._gamesAchievementsQueries = [];
                this._onlineAchievements = [];
                this._gameInfo = [];
                this._userModel = userModel;
                this._lastGetSourceItems = WinJS.Promise.wrap()
            }, {
                _achievements: null, _games: null, _gamesQuery: null, _gamesAchievementsQueries: null, _onlineAchievements: null, _gameInfo: null, _achievementQuery: null, _userModel: null, _knownCount: -1, _possibleCount: -1, _lastGetSourceItems: null, _knownAchievements: 0, sort: MSE.Data.Query.Properties.achievementSort.game, filter: MSE.Data.Query.Properties.achievementFilter.undefined, compareByIdentity: {get: function() {
                            return false
                        }}, chunkSize: {get: function() {
                            return 150
                        }}, dispose: function dispose() {
                        if (this._gamesQuery) {
                            this._gamesQuery.releaseInnerQuery();
                            this._gamesQuery = null
                        }
                    }, _getGamesAchievementCount: function _getGamesAchievementCount(game) {
                        var count = 0;
                        if (game)
                            if (this.filter === MSE.Data.Query.Properties.achievementFilter.unachieved || this.sort === MSE.Data.Query.Properties.achievementSort.achievedDate)
                                count = game.currentAchievements;
                            else
                                count = game.totalAchievements;
                        return count
                    }, _getAchievementIndicesForGame: function _getAchievementIndicesForGame(game) {
                        var indices = [];
                        if (game && game.titleId && this._achievements)
                            for (var i = 0; i < this._achievements.length; i++)
                                if (this._achievements[i] && this._achievements[i].media)
                                    if (this._achievements[i].media.titleId === game.titleId)
                                        indices.push(i);
                                    else if (indices.length)
                                        break;
                        return indices
                    }, _insertAchievement: function _insertAchievement(achievement) {
                        this._achievements.push(achievement)
                    }, _removeAchievement: function _removeAchievement(achievement, index) {
                        if (index)
                            this._achievements.splice(index, 1)
                    }, _loadNextGameAchievements: function _loadNextGameAchievements(game) {
                        var achievementQuery = new MS.Entertainment.Data.Query.titleAchievementsQuery;
                        achievementQuery.titleId = game.titleId;
                        achievementQuery.userModel = this._userModel;
                        achievementQuery.sort = this.sort;
                        achievementQuery.filter = this.filter;
                        return achievementQuery.execute()
                    }, _loadUserAchievements: function _loadUserAchievements(items) {
                        return items.forEach(function forEach(item) {
                                item.item.data.media = this._gameInfo[item.item.data.titleId];
                                this._insertAchievement(item.item.data)
                            }.bind(this))
                    }, _loadNextUserAchievements: function _loadNextUserAchievements() {
                        function loadUserAchievements(query) {
                            return this._loadUserAchievements(query.result.items).then(function notifyAtEnd() {
                                    return WinJS.Promise.wrapError(MS.Entertainment.Social.GameAchievementsDataSourceAdapter.endError)
                                }.bind(this))
                        }
                        {};
                        if (!this._achievementQuery) {
                            this._achievementQuery = new MSE.Data.Query.achievementsQuery;
                            this._achievementQuery.userModel = this._userModel;
                            this._achievementQuery.sort = this.sort;
                            this._achievementQuery.filter = this.filter;
                            this._achievementQuery.aggregateChunks = false;
                            return this._achievementQuery.execute().then(loadUserAchievements.bind(this))
                        }
                        else
                            return WinJS.Promise.wrapError(MS.Entertainment.Social.GameAchievementsDataSourceAdapter.endError)
                    }, _loadAchievementsIfNeeded: function _loadAchievementsIfNeeded(endIndex) {
                        var completedCallback;
                        var errorCallback;
                        var loadAchievementsAsNeeded = function() {
                                var promise;
                                var batchGames;
                                if (endIndex < this._achievements.length)
                                    completedCallback(this._achievements);
                                else if (this.sort === MSE.Data.Query.Properties.achievementSort.game) {
                                    batchGames = [];
                                    promise = this._loadGamesIfNeeded().then(function batchLoadedGames() {
                                        var gameItem;
                                        var expectedAchievements = 0;
                                        while ((endIndex >= this._achievements.length + expectedAchievements) && this._games.length) {
                                            gameItem = this._games.shift();
                                            if (!gameItem || !gameItem.data || !gameItem.data.titleId)
                                                return WinJS.Promise.wrapError("Invalid game. Cannot load achievements");
                                            expectedAchievements += gameItem.data.currentAchievements;
                                            batchGames.push(gameItem)
                                        }
                                        {}
                                    }.bind(this)).then(function loadBatchAchievements() {
                                        var i,
                                            j;
                                        var batchPromises = [];
                                        for (j = 0; j < batchGames.length; j++)
                                            batchPromises.push(this._loadNextGameAchievements(batchGames[j].data));
                                        return WinJS.Promise.join(batchPromises).then(function insertAchievements(queries) {
                                                for (i = 0; i < queries.length; i++)
                                                    queries[i].result.items.forEach(function hydrateAchievementAndAdd(item) {
                                                        if (item && item.item && item.item.data) {
                                                            item.item.data.media = batchGames[i].data;
                                                            this._insertAchievement(item.item.data)
                                                        }
                                                    }.bind(this))
                                            }.bind(this))
                                    }.bind(this))
                                }
                                else
                                    promise = this._loadGamesIfNeeded().then(function loadAchievements() {
                                        return this._loadNextUserAchievements()
                                    }.bind(this));
                                if (promise)
                                    promise.then(loadAchievementsAsNeeded, function loadAchievementsFailed(error) {
                                        errorCallback(error)
                                    }.bind(this))
                            }.bind(this);
                        return new WinJS.Promise(function initializeLoadAchievementsPromise(completed, error) {
                                completedCallback = completed;
                                errorCallback = error;
                                loadAchievementsAsNeeded()
                            })
                    }, _loadGame: function _loadGame(item) {
                        var achievementsCount = this._getGamesAchievementCount(item.item.data);
                        if (achievementsCount) {
                            this._games.push(item.item);
                            this._gameInfo[item.item.data.titleId] = item.item.data
                        }
                        this._knownAchievements = this._knownAchievements + achievementsCount
                    }, _gameUpdated: function _gameUpdated(game) {
                        if (this.sort === MSE.Data.Query.Properties.achievementSort.game && this._getGamesAchievementCount(game)) {
                            var toUpdate = this._getAchievementIndicesForGame(game);
                            for (var i = 0; i < toUpdate.length; i++)
                                if (this._achievements[toUpdate[i]] && this._achievements[toUpdate[i]].media) {
                                    this._achievements[toUpdate[i]].media.narratorGameProgress = game.narratorGameProgress;
                                    this._achievements[toUpdate[i]].media.percentageProgress = game.percentageProgress;
                                    this._achievements[toUpdate[i]].media.gamerScoreProgress = game.gamerScoreProgress;
                                    this._achievements[toUpdate[i]].media.achievementProgress = game.achievementProgress
                                }
                        }
                    }, _loadGamesIfNeeded: function _loadGamesIfNeeded() {
                        if (this._games.length) {
                            if (this._gamesQuery)
                                this._gamesQuery.getOnlineResults();
                            return WinJS.Promise.wrap(this._games)
                        }
                        if (this._gamesQuery)
                            return WinJS.Promise.wrapError(MS.Entertainment.Social.GameAchievementsDataSourceAdapter.endError);
                        this._gamesQuery = new MS.Entertainment.Data.Query.Games.GameActivity;
                        this._gamesQuery.userXuid = MSE.Social.Helpers.getXuidFromUserModel(this._userModel);
                        this._gamesQuery.gamerTag = MSE.Social.Helpers.getGamerTagFromUserModel(this._userModel);
                        this._gamesQuery.isLive = true;
                        this._gamesQuery.aggregateChunks = true;
                        this._gamesQuery.chunkSize = MS.Entertainment.Data.XboxLive.MAX_TITLE_ACTIVITY_COUNT;
                        this._gamesQuery.showStandardTitles = true;
                        this._gamesQuery.showDemoTitles = false;
                        this._gamesQuery.showArcadeTitles = true;
                        this._gamesQuery.showApplicationTitles = false;
                        this._gamesQuery.resultAugmentation = MS.Entertainment.Data.Augmenter.XboxLive.DataAgentActivitiesResult;
                        return this._gamesQuery.execute().then(function loadGames(query) {
                                var returnValue = [];
                                if (query.result && query.result.items) {
                                    query.result.items.setNotificationHandler(new MSE.Social.DataNotificationHandler(null, this._loadGame.bind(this), null, this._gameUpdated.bind(this)));
                                    query.result.items.forEach(this._loadGame.bind(this)).then(function loadMore() {
                                        this._gamesQuery.getOnlineResults();
                                        if (!this._games.length)
                                            returnValue = this._loadGamesIfNeeded();
                                        else
                                            returnValue = query.result.items
                                    }.bind(this))
                                }
                                return returnValue
                            }.bind(this))
                    }, _getAchievements: function _getAchievements(startIndex, endIndex) {
                        return {
                                items: this._achievements.slice(startIndex, endIndex + 1), totalCount: this._possibleCount
                            }
                    }, _executeGetSourceItemsAsync: function _executeGetSourceItemsAsync(startIndex, endIndex) {
                        return this._loadAchievementsIfNeeded(endIndex + 1).then(function achievementsLoadSucceeded() {
                                this._possibleCount = Math.max(this._knownAchievements, this._achievements.length);
                                return this._getAchievements(startIndex, endIndex)
                            }.bind(this), function achievementsLoadFailed(error) {
                                if (error === MS.Entertainment.Social.GameAchievementsDataSourceAdapter.endError) {
                                    this._possibleCount = this._knownCount = this._achievements.length;
                                    return this._getAchievements(startIndex, endIndex)
                                }
                                else
                                    return WinJS.Promise.wrapError(error)
                            }.bind(this))
                    }, getCount: function getCount() {
                        return this._getSourceCountAsync()
                    }, _editingList: function _editingList() {
                        throw new Error("This list doesn't support alerting of source data");
                    }, _getSourceCountAsync: function _getSourceCountAsync() {
                        if (this._possibleCount >= 0)
                            return WinJS.Promise.wrap(this._possibleCount);
                        else
                            return this._getSourceItemsAsync(0, 0).then(function loadedFirstChunk() {
                                    if (this._possibleCount >= 0)
                                        return this._possibleCount;
                                    else
                                        return MSE.Data.List.CountResult.unknown
                                }.bind(this), function loadChunkFailed() {
                                    return MSE.Data.List.CountResult.unknown
                                })
                    }, _getSourceItemsAsync: function _getSourceItemsAsync(startIndex, endIndex) {
                        var newLastGetSourceItems = this._lastGetSourceItems.then(function() {
                                return this._executeGetSourceItemsAsync(startIndex, endIndex)
                            }.bind(this));
                        return this._lastGetSourceItems = newLastGetSourceItems
                    }
            }, {endError: new Error("At the end of the list")})
    })
})(WinJS.Namespace.define("MS.Entertainment", null))
