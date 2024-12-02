/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/augmenters/xboxLiveAugmenters.js", "/Framework/data/list.js", "/Framework/data/factory.js", "/Framework/data/queries/modelQueries.js", "/Framework/data/queries/modelProperties.js", "/Framework/data/query.js", "/Framework/debug.js", "/Framework/querywatcher.js", "/Framework/Utilities.js", "/ViewModels/Social/social.js", "/ViewModels/Social/profileHydrator.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
(function(MSE, undefined) {
    WinJS.Namespace.define("MS.Entertainment.Social", {ProfileComparer: MS.Entertainment.defineObservable(function profileComparer() {
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher(this.comparerId);
            this._reset();
            this._queryWatcher.autoClear = false;
            this._queryWatcher.bind("lowestStatus", this._updateLoadingState.bind(this));
            this.bind("enabled", this.refresh.bind(this))
        }, {
            comparerId: "profileComparer", loadProfiles: true, primaryUserModel: null, primaryUserXuid: null, secondaryUserModel: null, secondaryUserXuid: null, enabled: false, status: null, errorResult: null, primaryProfile: null, secondaryProfile: null, _queryWatcher: null, _executePromise: null, _primaryProfileQuery: null, _secondaryProfileQuery: null, _currentPrimaryUserModel: null, _currentPrimaryInnerUserModelHandler: null, _currentSecondaryUserModel: null, _currentSecondaryInnerUserModelHandler: null, dispose: function dispose() {
                    this._uninitializeInnerUserModelHandlers();
                    this.unbind();
                    this._queryWatcher.unbind()
                }, getCanExecute: function getCanExecute() {
                    return true
                }, execute: function execute() {
                    this._refreshCurrentUserModels();
                    return this._beginRefresh(this._currentPrimaryUserModel, this._currentSecondaryUserModel)
                }, refresh: function refresh(newValue, oldValue) {
                    if (this.enabled) {
                        this._refreshCurrentUserModels();
                        return this._beginRefresh(this._currentPrimaryUserModel, this._currentSecondaryUserModel)
                    }
                    else if (oldValue !== undefined)
                        return WinJS.Promise.wrapError(new Error("Comparer is not enabled"))
                }, _beginRefresh: function _beginRefresh(primaryUserModel, secondaryUserModel) {
                    var returnPromise;
                    this._reset();
                    if (!this.getCanExecute())
                        returnPromise = WinJS.Promise.wrapError(new Error("Comparer cannot be execute at this time"));
                    else if (!primaryUserModel || !primaryUserModel.getIsValid() || !secondaryUserModel || !secondaryUserModel.getIsValid()) {
                        this.status = MSE.Social.LoadStatus.offline;
                        returnPromise = WinJS.Promise.wrap()
                    }
                    else
                        returnPromise = this._innerRefresh(primaryUserModel, secondaryUserModel).then(function success(result) {
                            this.status = MSE.Social.LoadStatus.loaded;
                            return result
                        }.bind(this), function error(errorResult) {
                            var originalError = errorResult.innerExecutePromise.originalError;
                            if (Array.isArray(originalError))
                                for (var x = 0; x < originalError.length; x++)
                                    if (originalError[x]) {
                                        errorResult = originalError[x];
                                        break
                                    }
                            this.status = MSE.Social.LoadStatus.parseXboxLiveError(errorResult);
                            if (this.status !== MS.Entertainment.Social.LoadStatus.blocked) {
                                this.errorResult = errorResult;
                                return WinJS.Promise.wrapError(errorResult)
                            }
                            else
                                return WinJS.Promise.wrap()
                        }.bind(this));
                    return returnPromise
                }, _refreshCurrentUserModels: function _refreshCurrentUserModels() {
                    var currentPrimaryUserModel = WinJS.Binding.unwrap(this.primaryUserModel);
                    MS.Entertainment.Social.assert(!this.primaryUserXuid || !currentPrimaryUserModel, "Both primaryUserXuid and primaryUserModel are set in ProfileComparer. " + "Only set one at a time. Defaulting to primaryUserModel value");
                    var currentSecondaryUserModel = WinJS.Binding.unwrap(this.secondaryUserModel);
                    MS.Entertainment.Social.assert(!this.secondaryUserXuid || !currentSecondaryUserModel, "Both secondaryUserXuid and secondaryUserModel are set in ProfileComparer. " + "Only set one at a time. Defaulting to secondaryUserModel value");
                    if (!currentPrimaryUserModel)
                        currentPrimaryUserModel = MSE.Social.Helpers.createUserModel(this.primaryUserXuid, this.primaryUserGamerTag);
                    if (!currentSecondaryUserModel)
                        currentSecondaryUserModel = MSE.Social.Helpers.createUserModel(this.secondaryUserXuid, this.secondaryUserGamerTag);
                    if (this._currentPrimaryUserModel !== currentPrimaryUserModel || this._currentSecondaryUserModel !== currentSecondaryUserModel) {
                        this._currentPrimaryUserModel = currentPrimaryUserModel;
                        this._currentSecondaryUserModel = currentSecondaryUserModel;
                        this._initializeInnerUserModelHandlers()
                    }
                }, _handleInnerUserModelChanges: function _handleInnerUserModelChanges(newValue, oldValue) {
                    if (oldValue !== undefined)
                        this.refresh()
                }, _initializeInnerUserModelHandlers: function _initializeInnerUserModelHandlers() {
                    this._uninitializeInnerUserModelHandlers();
                    if (this._currentPrimaryUserModel)
                        this._currentPrimaryInnerUserModelHandler = WinJS.Binding.bind(this._currentPrimaryUserModel, {nativeUserModel: this._handleInnerUserModelChanges.bind(this)});
                    if (this._currentSecondaryUserModel)
                        this._currentSecondaryInnerUserModelHandler = WinJS.Binding.bind(this._currentSecondaryUserModel, {nativeUserModel: this._handleInnerUserModelChanges.bind(this)})
                }, _uninitializeInnerUserModelHandlers: function _uninitializeInnerUserModelHandlers() {
                    if (this._currentPrimaryInnerUserModelHandler) {
                        this._currentPrimaryInnerUserModelHandler.cancel();
                        this._currentPrimaryInnerUserModelHandler = null
                    }
                    if (this._currentSecondaryInnerUserModelHandler) {
                        this._currentSecondaryInnerUserModelHandler.cancel();
                        this._currentSecondaryInnerUserModelHandler = null
                    }
                }, _innerRefresh: function _innerRefresh(primaryUserModel, secondaryUserModel) {
                    var promises = {};
                    var joinedPromises;
                    if (this.loadProfiles) {
                        this._primaryProfileQuery = new MSE.Data.Query.profileQuery;
                        this._secondaryProfileQuery = new MSE.Data.Query.profileQuery;
                        this._primaryProfileQuery.userModel = primaryUserModel;
                        this._secondaryProfileQuery.userModel = secondaryUserModel;
                        this._queryWatcher.registerQuery(this._primaryProfileQuery);
                        this._queryWatcher.registerQuery(this._secondaryProfileQuery);
                        promises["primaryProfileQuery"] = this._primaryProfileQuery.execute().then(this._setPrimaryProfile.bind(this));
                        promises["secondaryProfileQuery"] = this._secondaryProfileQuery.execute().then(this._setSecondaryProfile.bind(this))
                    }
                    promises["innerExecutePromise"] = this._startInnerExecute(primaryUserModel, secondaryUserModel);
                    joinedPromises = WinJS.Promise.join(promises);
                    this._executePromise = joinedPromises;
                    joinedPromises.then(function() {
                        this._executePromise = null
                    }.bind(this));
                    return joinedPromises
                }, _startInnerExecute: function _startInnerExecute() {
                    throw new Error("_startInnerExecute hasn't been implemeneted");
                }, _setPrimaryProfile: function _setPrimaryProfile(query) {
                    return this.primaryProfile = query.result
                }, _setSecondaryProfile: function _setSecondaryProfile(query) {
                    return this.secondaryProfile = query.result
                }, _reset: function _reset() {
                    if (this._executePromise) {
                        this._executePromise.cancel();
                        this._executePromise = null
                    }
                    this.status = MSE.Social.LoadStatus.idle;
                    this.errorResult = null;
                    this._queryWatcher.clearQueries();
                    this._primaryProfileQuery = null;
                    this._secondaryProfileQuery = null;
                    if (this.loadProfiles) {
                        this.primaryProfile = MSE.Social.Helpers.emptyProfile;
                        this.secondaryProfile = MSE.Social.Helpers.emptyProfile
                    }
                    this._innerReset()
                }, _innerReset: function _innerReset(){}, _updateLoadingState: function _updateLoadingState() {
                    var queryStatus = this._queryWatcher.lowestStatus;
                    this.loading = MSE.Data.queryStatus.isWorking(queryStatus) || this._executePromise !== null;
                    this.loaded = MSE.Data.queryStatus.hasCompleted(queryStatus) && this._executePromise === null
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Social", {
        ActivityComparer: MS.Entertainment.derive(MS.Entertainment.Social.ProfileComparer, null, {
            comparerId: "activityComparer", titleSearchId: null, activities: null, primaryActivitiesCount: 0, secondaryActivitiesCount: 0, titleSearchResult: null, _titleIdMappings: {}, _primaryQuery: null, _secondaryQuery: null, _mergeQuery: null, _startInnerExecute: function _startInnerExecute(primaryUserModel, secondaryUserModel) {
                    this._titleIdMappings = {};
                    this._primaryQuery = new MS.Entertainment.Data.Query.activitiesQuery;
                    this._mergeQuery = new MS.Entertainment.Data.AggregateQuery;
                    this._queryWatcher.registerQuery(this._primaryQuery);
                    this._queryWatcher.registerQuery(this._mergeQuery);
                    this._mergeQuery.queries.push(this._primaryQuery);
                    this._mergeQuery.resultAugmentationFactory = {create: this._createResultAugmentation.bind(this)};
                    this._primaryQuery.userModel = primaryUserModel;
                    this._primaryQuery.titleTypes = [Microsoft.Xbox.TitleType.standard, Microsoft.Xbox.TitleType.arcade];
                    this._primaryQuery.chunkSize = MS.Entertainment.Data.XboxLive.MAX_TITLE_ACTIVITY_COUNT;
                    this._primaryQuery.resultAugmentation = MS.Entertainment.Data.Augmenter.XboxLive.NativeWrapper;
                    if (primaryUserModel !== secondaryUserModel) {
                        this._secondaryQuery = new MS.Entertainment.Data.Query.activitiesQuery;
                        this._queryWatcher.registerQuery(this._secondaryQuery);
                        this._mergeQuery.queries.push(this._secondaryQuery);
                        this._secondaryQuery.userModel = secondaryUserModel;
                        this._secondaryQuery.titleTypes = [Microsoft.Xbox.TitleType.standard, Microsoft.Xbox.TitleType.arcade];
                        this._secondaryQuery.chunkSize = MS.Entertainment.Data.XboxLive.MAX_TITLE_ACTIVITY_COUNT;
                        this._secondaryQuery.resultAugmentation = MS.Entertainment.Data.Augmenter.XboxLive.NativeWrapper
                    }
                    return this._mergeQuery.execute().then(this._setActivitiesFromArray.bind(this))
                }, _createResultAugmentation: function _createResultAugmentation() {
                    return MS.Entertainment.Data.define(null, {items: MS.Entertainment.Data.Property.union("source[0].items", "source[1].items", this._activityComparer.bind(this), this._activityMerger.bind(this), MSE.Data.Augmenter.XboxLive.MergedActivity)})
                }, _setActivitiesFromArray: function _setActivitiesFromArray(query) {
                    var activities = query.result.items;
                    var timeComparer = MS.Entertainment.Data.Comparer.createPropertyComparer("lastPlayed", MS.Entertainment.Data.Comparer.dateComparer);
                    return query.result.items.toArray().then(function complete(array) {
                            array.sort(function compare(mergedActivityA, mergedActivityB) {
                                var primaryPlayedA = !!mergedActivityA.primaryLastPlayed;
                                var secondaryPlayedA = !!mergedActivityA.secondaryLastPlayed;
                                var bothPlayedA = primaryPlayedA && secondaryPlayedA;
                                var primaryPlayedB = !!mergedActivityB.primaryLastPlayed;
                                var secondaryPlayedB = !!mergedActivityB.secondaryLastPlayed;
                                var bothPlayedB = primaryPlayedB && secondaryPlayedB;
                                if (bothPlayedA && bothPlayedB)
                                    return timeComparer(mergedActivityA.primaryLastPlayed, mergedActivityB.primaryLastPlayed);
                                else if (bothPlayedA)
                                    return -1;
                                else if (bothPlayedB)
                                    return 1;
                                else if (primaryPlayedA && primaryPlayedB)
                                    return timeComparer(mergedActivityA.primaryLastPlayed, mergedActivityB.primaryLastPlayed);
                                else if (primaryPlayedA)
                                    return -1;
                                else if (primaryPlayedB)
                                    return 1;
                                else if (secondaryPlayedA && secondaryPlayedB)
                                    return timeComparer(mergedActivityA.secondaryLastPlayed, mergedActivityB.secondaryLastPlayed);
                                else if (secondaryPlayedA)
                                    return -1;
                                else if (secondaryPlayedB)
                                    return 1;
                                MS.Entertainment.Social.assert(false, "Unexpected condition in compare game sort.");
                                return 0
                            }.bind(this));
                            return this.activities = new MS.Entertainment.Data.VirtualList(null, array)
                        }.bind(this))
                }, _activityComparer: (function() {
                    var timeComparer = MS.Entertainment.Data.Comparer.createPropertyComparer("lastPlayed", MS.Entertainment.Data.Comparer.dateComparer);
                    return function _activityComparer(activity1, activity2) {
                            var result = NaN;
                            var isGame1 = activity1 && MS.Entertainment.Data.Factory.XboxLive.isGame(activity1.titleType);
                            var isGame2 = activity2 && MS.Entertainment.Data.Factory.XboxLive.isGame(activity2.titleType);
                            if (isGame1 && isGame2) {
                                result = timeComparer(activity1, activity2);
                                if (result === 0)
                                    result = -1
                            }
                            else if (isGame1)
                                result = -1;
                            else if (isGame2)
                                result = 1;
                            return result
                        }
                })(), _checkTitleSearch: function _checkTitleSearch(mergedActivity) {
                    if (this.titleSearchId && mergedActivity && mergedActivity.primary && mergedActivity.primary.titleId + "" === this.titleSearchId + "")
                        this.titleSearchResult = MS.Entertainment.Data.augment(mergedActivity, MSE.Data.Augmenter.XboxLive.MergedActivity)
                }, _activityMerger: function _activityMerger(activity1, activity2) {
                    var mergedActivity,
                        titleId;
                    if (activity1) {
                        titleId = activity1.titleId;
                        mergedActivity = this._titleIdMappings[titleId];
                        this.primaryActivitiesCount++
                    }
                    if (mergedActivity) {
                        mergedActivity.source[0] = activity1;
                        return
                    }
                    if (activity2) {
                        titleId = activity2.titleId;
                        mergedActivity = this._titleIdMappings[titleId];
                        this.secondaryActivitiesCount++
                    }
                    if (mergedActivity) {
                        mergedActivity.source[1] = activity2;
                        return
                    }
                    if (titleId) {
                        mergedActivity = new MSE.Data.Property.MergedItem(activity1, activity2);
                        this._titleIdMappings[titleId] = mergedActivity;
                        this._checkTitleSearch(mergedActivity)
                    }
                    return mergedActivity
                }, _innerReset: function _innerReset() {
                    this._titleIdMappings = null;
                    this._primaryQuery = null;
                    this._secondaryQuery = null;
                    this._mergeQuery = null;
                    this.activities = null;
                    this.primaryActivitiesCount = 0;
                    this.secondaryActivitiesCount = 0;
                    this.titleSearchResult = null
                }
        }), AchievementComparer: MS.Entertainment.derive(MS.Entertainment.Social.ProfileComparer, null, {
                titleId: null, loadTitleHistory: true, achievements: null, titleHistory: null, hasAchievements: true, _achievementIdMappings: {}, _primaryQuery: null, _secondaryQuery: null, _mergeQuery: null, _primaryTitleHistoryQuery: null, _secondaryTitleHistoryQuery: null, _mergeTitleHistoryQuery: null, getCanExecute: function getCanExecute() {
                        return !!this.titleId
                    }, _startInnerExecute: function _startInnerExecute(primaryUserModel, secondaryUserModel) {
                        var promises = {};
                        this._achievementIdMappings = {};
                        this._primaryQuery = new MS.Entertainment.Data.Query.titleAchievementsQuery;
                        this._mergeQuery = new MS.Entertainment.Data.AggregateQuery;
                        this._queryWatcher.registerQuery(this._primaryQuery);
                        this._queryWatcher.registerQuery(this._mergeQuery);
                        this._mergeQuery.queries.push(this._primaryQuery);
                        this._mergeQuery.resultAugmentationFactory = {create: this._createResultAugmentation.bind(this)};
                        this._primaryQuery.userModel = primaryUserModel;
                        this._primaryQuery.titleId = this.titleId;
                        this._primaryQuery.chunkSize = MS.Entertainment.Data.XboxLive.MAX_TITLE_ACTIVITY_COUNT;
                        this._primaryQuery.sort = MS.Entertainment.Data.Query.Properties.achievementSort.game;
                        this._primaryQuery.resultAugmentation = MS.Entertainment.Data.Augmenter.XboxLive.NativeWrapper;
                        if (primaryUserModel !== secondaryUserModel) {
                            this._secondaryQuery = new MS.Entertainment.Data.Query.titleAchievementsQuery;
                            this._queryWatcher.registerQuery(this._secondaryQuery);
                            this._mergeQuery.queries.push(this._secondaryQuery);
                            this._secondaryQuery.userModel = secondaryUserModel;
                            this._secondaryQuery.titleId = this.titleId;
                            this._secondaryQuery.chunkSize = MS.Entertainment.Data.XboxLive.MAX_TITLE_ACTIVITY_COUNT;
                            this._secondaryQuery.sort = MS.Entertainment.Data.Query.Properties.achievementSort.game;
                            this._secondaryQuery.resultAugmentation = MS.Entertainment.Data.Augmenter.XboxLive.NativeWrapper
                        }
                        promises["mergeQuery"] = this._mergeQuery.execute().then(this._setAchievementsFromArray.bind(this));
                        if (this.loadTitleHistory) {
                            this._primaryTitleHistoryQuery = new MS.Entertainment.Data.Query.titleActivityQuery;
                            this._secondaryTitleHistoryQuery = new MS.Entertainment.Data.Query.titleActivityQuery;
                            this._mergeTitleHistoryQuery = new MS.Entertainment.Data.Query.aggregateTitleActivityQuery;
                            this._queryWatcher.registerQuery(this._primaryTitleHistoryQuery);
                            this._queryWatcher.registerQuery(this._secondaryTitleHistoryQuery);
                            this._queryWatcher.registerQuery(this._mergeTitleHistoryQuery);
                            this._mergeTitleHistoryQuery.queries.push(this._primaryTitleHistoryQuery);
                            this._mergeTitleHistoryQuery.queries.push(this._secondaryTitleHistoryQuery);
                            this._primaryTitleHistoryQuery.userModel = primaryUserModel;
                            this._secondaryTitleHistoryQuery.userModel = secondaryUserModel;
                            this._primaryTitleHistoryQuery.titleId = this.titleId;
                            this._secondaryTitleHistoryQuery.titleId = this.titleId;
                            this._primaryTitleHistoryQuery.resultAugmentation = null;
                            this._secondaryTitleHistoryQuery.resultAugmentation = null;
                            promises["mergeTitleHistoryQuery"] = this._mergeTitleHistoryQuery.execute().then(this._setMergedTitleHistory.bind(this))
                        }
                        return WinJS.Promise.join(promises)
                    }, _createResultAugmentation: function _createResultAugmentation() {
                        return MS.Entertainment.Data.define(null, {items: MS.Entertainment.Data.Property.union("source[0].items", "source[1].items", this._achievementsComparer.bind(this), this._achievementsMerger.bind(this), MSE.Data.Augmenter.XboxLive.MergedAchievement)})
                    }, _setMergedTitleHistory: function _setMergedTitleHistory(query) {
                        return this.titleHistory = query.result
                    }, _setAchievementsFromArray: function _setAchievementsFromArray(query) {
                        var promise;
                        this.achievements = query.result.items;
                        if (!query.result.items) {
                            this.hasAchievements = false;
                            promise = WinJS.Promise.wrap(null)
                        }
                        else
                            promise = query.result.items.getCount().then(function(count) {
                                this.hasAchievements = count > 0;
                                return query.result.items
                            }.bind(this));
                        return promise
                    }, _achievementsComparer: (function() {
                        var timeComparer = MS.Entertainment.Data.Comparer.createPropertyComparer("timeUnlocked", MS.Entertainment.Data.Comparer.dateComparer);
                        return function _activityComparer(achievement1, achievement2) {
                                var result = timeComparer(achievement1, achievement2);
                                if (result === 0)
                                    result = -1;
                                return result
                            }
                    })(), _achievementsMerger: function _achievementsMerger(achievement1, achievement2) {
                        var mergedAchievement,
                            achievementId;
                        if (achievement1) {
                            achievementId = achievement1.id;
                            mergedAchievement = this._achievementIdMappings[achievementId]
                        }
                        if (mergedAchievement) {
                            mergedAchievement.source[0] = achievement1;
                            return
                        }
                        if (achievement2) {
                            achievementId = achievement2.id;
                            mergedAchievement = this._achievementIdMappings[achievementId]
                        }
                        if (mergedAchievement) {
                            mergedAchievement.source[1] = achievement2;
                            return
                        }
                        if (achievementId) {
                            mergedAchievement = new MSE.Data.Property.MergedItem(achievement1, achievement2);
                            this._achievementIdMappings[achievementId] = mergedAchievement
                        }
                        return mergedAchievement
                    }, _innerReset: function _innerReset() {
                        this._achievementIdMappings = null;
                        this._primaryQuery = null;
                        this._secondaryQuery = null;
                        this._mergeQuery = null;
                        this._primaryTitleHistoryQuery = null;
                        this._secondaryTitleHistoryQuery = null;
                        this._mergeTitleHistoryQuery = null;
                        this.achievements = null;
                        if (this.loadTitleHistory)
                            this.titleHistory = null
                    }
            })
    })
})(MS.Entertainment)
