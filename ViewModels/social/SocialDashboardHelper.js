/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Framework/contentNotification.js", "/Framework/data/queries/modelQueries.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.SocialBuzz");
WinJS.Namespace.define("MS.Entertainment.UI.SocialBuzz", {SocialDashboardHelperBaseMixIn: {
        buzzingTitles: null, userTitles: null, userTitlesTable: null
    }});
WinJS.Namespace.define("MS.Entertainment.UI.SocialBuzz", {SocialDashboardHelperBase: WinJS.Class.mix(function SocialDashboardHelperBaseConstructor() {
        this._initObservable(Object.create(MS.Entertainment.UI.SocialBuzz.SocialDashboardHelperBaseMixIn))
    }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, WinJS.Binding.expandProperties(MS.Entertainment.UI.SocialBuzz.SocialDashboardHelperBaseMixIn))});
WinJS.Namespace.define("MS.Entertainment.UI.SocialBuzz", {SocialDashboardHelper: MS.Entertainment.derive(MS.Entertainment.UI.SocialBuzz.SocialDashboardHelperBase, function socialDashboardHelperConstructor() {
        this.base();
        this._socialBuzzSource = new MS.Entertainment.UI.SocialBuzz.SocialBuzzSource;
        this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("SocialDashboardHelper");
        var notificationModification = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), MS.Entertainment.UI.ContentNotification.idFromProperty("titleId"));
        this._userTitlesSender = notificationModification.createSender();
        this._signInHandler = function signInHandler() {
            var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
            if (!signIn.isSignedIn) {
                if (this._userTitlesQuery) {
                    this._userTitlesQuery.releaseInnerQuery();
                    this._userTitlesQuery = null
                }
                this.buzzingTitles = [];
                this.userTitles = [];
                this.userTitlesTable = {};
                this._notifyDataChanged()
            }
            else if (!this._userTitlesQuery) {
                this._userTitlesQuery = new MS.Entertainment.Data.Query.Games.GameActivity;
                this._userTitlesQuery.chunkSize = MS.Entertainment.Data.XboxLive.MAX_TITLE_ACTIVITY_COUNT;
                notificationModification.modifyQuery(this._userTitlesQuery);
                this._start()
            }
        }.bind(this);
        this._eventHandlers = MS.Entertainment.Utilities.addEvents(MS.Entertainment.Utilities.SignIn, {
            signInComplete: this._signInHandler, signOutComplete: this._signInHandler
        });
        this._signInHandler();
        Windows.UI.WebUI.WebUIApplication.addEventListener("resuming", this._onAppResume.bind(this))
    }, {
        _socialBuzzSource: null, _userTitlesQuery: null, _userTitlesSender: null, _signInHandler: null, _eventHandlers: null, _queryWatcher: null, _queryItems: null, dispose: function dispose() {
                if (this._eventHandlers) {
                    this._eventHandlers.cancel();
                    this._eventHandlers = null
                }
                if (this._userTitlesQuery) {
                    this._userTitlesQuery.releaseInnerQuery();
                    this._userTitlesQuery = null
                }
            }, _start: function _start() {
                var promises = [];
                promises.push(WinJS.Binding.unwrap(this._socialBuzzSource).execute(null, this._userTitlesSender).then(function socialBuzzComplete(tables) {
                    return this._consolidateTitles(tables)
                }.bind(this)).then(function consolidationComplete(titles) {
                    this.buzzingTitles = titles
                }.bind(this)));
                var signedInUser = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                this._userTitlesQuery.userXuid = parseInt(signedInUser.xuid);
                this._userTitlesQuery.gamerTag = signedInUser.gamerTag;
                this._userTitlesQuery.isLive = true;
                this._userTitlesQuery.showApplicationTitles = true;
                this._userTitlesQuery.showStandardTitles = true;
                this._queryWatcher.registerQuery(this._userTitlesQuery);
                promises.push(this._userTitlesQuery.execute().then(function queryComplete(q) {
                    if (q.result && q.result.items) {
                        this._queryItems = q.result.items;
                        this._queryItems.setNotificationHandler(new MS.Entertainment.UI.SocialBuzz.SocialDashboardHelper.GameActivityDataNotificationHandler(this._notifyDataChanged.bind(this), this._addUserTitle.bind(this), this._removeUserTitle.bind(this)));
                        return this._queryItems.toArray().then(function populateUserTiles(data) {
                                this.userTitles = data;
                                var table = {};
                                this.userTitles.forEach(function(item) {
                                    table[item.titleId] = item
                                });
                                this.userTitlesTable = table
                            }.bind(this)).then(function updateItems() {
                                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                                if (signIn.isSignedIn)
                                    try {
                                        Microsoft.Xbox.XboxLIVEService.invalidateCacheGroup(Microsoft.Xbox.CacheGroup.titleHistory)
                                    }
                                    catch(e) {}
                                return this._userTitlesQuery.getOnlineResults()
                            }.bind(this)).done(function userTitlesComplete() {
                                var countPromises = [];
                                var counts = {
                                        achievementsCount: 0, gamerScore: 0, totalTitleCount: 0, gameCount: 0, appCount: 0
                                    };
                                countPromises.push(this._queryItems.getCount());
                                countPromises.push(this._queryItems.forEach(function countAchievements(item) {
                                    if (item && item.item && item.item.data) {
                                        counts.achievementsCount += item.item.data.currentAchievements || 0;
                                        counts.gamerScore += item.item.data.currentGamerscore || 0;
                                        item.item.data.isGame ? counts.gameCount++ : counts.appCount++;
                                        counts[item.item.data.defaultPlatformType] = counts[item.item.data.defaultPlatformType] || 0;
                                        counts[item.item.data.defaultPlatformType]++
                                    }
                                }.bind(this)));
                                WinJS.Promise.join(countPromises).then(function reportUserTitleActivityState(promises) {
                                    counts.totalTitleCount = promises[0];
                                    MS.Entertainment.Utilities.Telemetry.logTitleActivityState(counts)
                                }.bind(this))
                            }.bind(this), function userTitlesFailed() {
                                this._queryItems = null;
                                this.userTitles = null
                            }.bind(this))
                    }
                    else
                        return WinJS.Promise.wrap()
                }.bind(this), function queryFailed(e) {
                    this._queryItems = null;
                    this.userTitles = null
                }));
                WinJS.Promise.join(promises).done(this._notifyDataChanged.bind(this))
            }, _addUserTitle: function _addUserTitle(item, index) {
                this.userTitles.splice(index, 0, item);
                this.userTitlesTable[item.titleId] = item
            }, _removeUserTitle: function _removeUserTitle(index) {
                var item = this.userTitles[index];
                if (item)
                    this.userTitlesTable[item.titleId] = null;
                this.userTitles.splice(index, 1)
            }, _consolidateTitles: function consolidateTitles(tables) {
                if (!tables || tables.length < 2 || !tables[0] || !tables[1])
                    throw new Error("Unexpected titles to consolidate in socialdashboardhelper");
                var activityTable = tables[0];
                var beaconTable = tables[1];
                var mergedTitles = [];
                var id;
                for (id in beaconTable) {
                    if (activityTable[id]) {
                        beaconTable[id].totalCount = activityTable[id].totalCount;
                        activityTable[id] = null
                    }
                    else
                        beaconTable[id].totalCount = 0;
                    mergedTitles.push(beaconTable[id])
                }
                for (titleId in activityTable)
                    if (activityTable[titleId]) {
                        activityTable[titleId].beaconCount = 0;
                        mergedTitles.push(activityTable[titleId])
                    }
                var sortFunction = function sort(a, b) {
                        var beaconDiff = b.beaconCount - a.beaconCount;
                        if (beaconDiff)
                            return beaconDiff;
                        return b.totalCount - a.totalCount
                    };
                mergedTitles.sort(sortFunction);
                return mergedTitles
            }, _notifyDataChanged: function _notifyDataChanged() {
                this.dispatchEvent(MS.Entertainment.UI.SocialBuzz.SocialDashboardHelper.events.dataChanged, {sender: this})
            }, _onAppResume: function _onAppResume(e) {
                if (this._userTitlesQuery) {
                    this._userTitlesQuery.releaseInnerQuery();
                    this._userTitlesQuery = null
                }
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                signIn.refreshSignInState()
            }, getSocialBuzzNotifications: function getSocialBuzzNotifications(sender) {
                this.buzzingTitles.forEach(function notifyBuzzingTitles(title) {
                    if (title.beaconCount > 0)
                        sender.sendNotification(title.titleId, MS.Entertainment.UI.ContentNotification.NotificationType.gameBeacon, WinJS.Binding.unwrap(this._socialBuzzSource)._createBeaconNotification(title.beaconCount));
                    if (title.totalCount > 0)
                        sender.sendNotification(title.titleId, MS.Entertainment.UI.ContentNotification.NotificationType.gameFriendsRecentlyPlayed, WinJS.Binding.unwrap(this._socialBuzzSource)._createRecentlyPlayedNotification(title.totalCount))
                }.bind(this))
            }
    }, {
        events: {dataChanged: "dataChanged"}, GameActivityDataNotificationHandler: WinJS.Class.define(function gameActivityDataNotificationHandler(dataChangedCallback, addDataCallback, removeDataCallback) {
                this._dataChangedCallback = dataChangedCallback;
                this._addDataCallback = addDataCallback;
                this._removeDataCallback = removeDataCallback
            }, {
                _dataChangedCallback: null, _addDataCallback: null, _removeDataCallback: null, _fireDataChanged: false, dispose: function dispose() {
                        this._dataChangedCallback = null;
                        this._addDataCallback = null;
                        this._removeDataCallback = null
                    }, inserted: function inserted(item, previousKey, nextKey, index) {
                        if (this._addDataCallback)
                            this._addDataCallback(item.data, index);
                        this._fireDataChanged = true
                    }, changed: function changed(newItem, oldItem){}, moved: function moved(item, previousKey, nextKey, oldIndex, newIndex){}, removed: function removed(key, index) {
                        if (this._removeDataCallback)
                            this._removeDataCallback(index);
                        this._fireDataChanged = true
                    }, countChanged: function countChanged(newCount, oldCount){}, endNotifications: function endNotifications() {
                        if (this._dataChangedCallback && this._fireDataChanged)
                            this._dataChangedCallback()
                    }
            })
    })})
