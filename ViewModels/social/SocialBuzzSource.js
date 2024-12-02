/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Framework/contentNotification.js", "/Framework/data/queries/modelQueries.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.SocialBuzz");
WinJS.Namespace.define("MS.Entertainment.UI.SocialBuzz", {SocialBuzzSource: WinJS.Class.define(function socialBuzzSourceConstructor(sender) {
        this._sender = sender || null
    }, {
        _sender: null, execute: function execute(titleID, sender) {
                var sender = sender || this._sender;
                if (!sender)
                    throw new Error("Cannot execute notifications without a sender!");
                if (titleID)
                    return this._gatherTitleBuzz(titleID, sender);
                else
                    return this._gatherGeneralBuzz(sender)
            }, _gatherGeneralBuzz: function _gatherGeneralBuzz(sender) {
                var activityCountQuery = new MS.Entertainment.Data.Query.buzzActivityCountQuery;
                var friendsWithBeaconsQuery = new MS.Entertainment.Data.Query.friendsWithBeaconsQuery;
                var userModel = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                activityCountQuery.userModel = userModel;
                friendsWithBeaconsQuery.userModel = userModel;
                var promises = [];
                promises.push(activityCountQuery.execute().then(function parseActivityCounts(q) {
                    if (q.result.items)
                        return q.result.items.toArray().then(function iterateOverResults(items) {
                                var activityTable = {};
                                items.forEach(function dispatchActivityCount(item) {
                                    activityTable[item.titleId] = item;
                                    if (item.totalCount)
                                        sender.sendNotification(item.titleId, MS.Entertainment.UI.ContentNotification.NotificationType.gameFriendsRecentlyPlayed, this._createRecentlyPlayedNotification(item.totalCount))
                                }.bind(this));
                                return activityTable
                            }.bind(this));
                    else
                        return {}
                }.bind(this), function queryFailed(result) {
                    return {}
                }));
                promises.push(friendsWithBeaconsQuery.execute().then(function parseBeacons(q) {
                    if (q.result.items)
                        return q.result.items.toArray().then(function iterateOverResults(items) {
                                var table = {};
                                var titleID;
                                items.forEach(function buildBeaconTable(item) {
                                    item.beacons.forEach(function addBeaconToTable(beacon) {
                                        if (!table[beacon.titleId])
                                            table[beacon.titleId] = {
                                                titleId: beacon.titleId, titleType: beacon.titleType, supportedPlatform: beacon.supportedPlatform, titleName: beacon.titleName, beaconCount: 1
                                            };
                                        else
                                            table[beacon.titleId].beaconCount++
                                    })
                                });
                                for (titleID in table)
                                    if (table.hasOwnProperty(titleID))
                                        sender.sendNotification(titleID, MS.Entertainment.UI.ContentNotification.NotificationType.gameBeacon, this._createBeaconNotification(table[titleID].beaconCount));
                                return table
                            }.bind(this));
                    else
                        return {}
                }.bind(this), function queryFailed(result) {
                    return {}
                }));
                return WinJS.Promise.join(promises)
            }, _gatherTitleBuzz: function _gatherTitleBuzz(titleID, sender) {
                var beaconsQuery = new MS.Entertainment.Data.Query.titleBuzzBeaconsQuery;
                beaconsQuery.userModel = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signedInUser);
                beaconsQuery.titleId = titleID;
                beaconsQuery.execute().then(function parseBeaconList(q) {
                    if (q.result.items)
                        return q.result.items.toArray();
                    else
                        return []
                }.bind(this)).then(function parseBeacons(array) {
                    var beaconPromises = [];
                    var recentPromises = [];
                    var maxCount = 6;
                    var gamertag = null;
                    var userXuid = null;
                    array.forEach(function(item) {
                        var friend = this._createNotificationParams(item.gamertag, item.userXuid, item.beacon);
                        if (item.beacon && item.beacon.titleId === titleID)
                            beaconPromises.push(friend);
                        else
                            recentPromises.push(friend)
                    }, this);
                    WinJS.Promise.join(beaconPromises).then(function notifyBeacons(beacons) {
                        if (beacons.length)
                            sender.sendNotification(titleID, MS.Entertainment.UI.ContentNotification.NotificationType.gameBeacon, this._createBeaconNotification(beacons.length, beacons.slice(0, maxCount)))
                    }.bind(this));
                    WinJS.Promise.join(recentPromises).then(function notifyRecent(recent) {
                        if (recent.length)
                            sender.sendNotification(titleID, MS.Entertainment.UI.ContentNotification.NotificationType.gameFriendsRecentlyPlayed, this._createRecentlyPlayedNotification(recent.length, recent.slice(0, maxCount)))
                    }.bind(this))
                }.bind(this), function queryFailed(result){})
            }, _createNotificationParams: function _createNotificationParams(gamertag, userXuid, beacon) {
                var userModel = MS.Entertainment.Social.Helpers.createUserModel(userXuid, gamertag);
                var action = MS.Entertainment.Social.Actions.createButtonAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate, "", {
                        page: "socialProfile", args: {
                                userXuid: userXuid, userModel: userModel
                            }
                    }, null, MS.Entertainment.UI.AutomationIds.socialBuzzNavigateToProfile);
                var gamercardQuery = new MS.Entertainment.Data.Query.gamercardQuery;
                gamercardQuery.gamertag = gamertag;
                gamercardQuery.userModel = userModel;
                var defaultHoldAction = new MS.Entertainment.UI.ToolbarAction;
                defaultHoldAction.canExecute = false;
                return gamercardQuery.execute().then(function gamercardSuccess(q) {
                        var imageUrl = q.result.gamerpicLargeUri;
                        var toolText = beacon && beacon.text ? String.load(String.id.IDS_SOCIAL_BUZZ_BEACON_TOOLTIP).format(gamertag, beacon.text) : gamertag;
                        return {
                                toolText: toolText, imageUrl: q.result.gamerpicLargeUri || MS.Entertainment.Data.Factory.XboxLive.avatarTileUri(gamertag), action: action, holdAction: defaultHoldAction
                            }
                    }, function gamercardError(e) {
                        var toolText = beacon && beacon.text ? String.load(String.id.IDS_SOCIAL_BUZZ_BEACON_TOOLTIP).format(gamertag, beacon.text) : gamertag;
                        return {
                                toolText: toolText, imageUrl: MS.Entertainment.Data.Factory.XboxLive.avatarTileUri(gamertag), action: action, holdAction: defaultHoldAction
                            }
                    })
            }, _createRecentlyPlayedNotification: function _createRecentlyPlayedNotification(count, gamerInfo) {
                return this._createNotification(count, "images/ico_19x_Friend_NoCircle_Grey.png", gamerInfo, MS.Entertainment.UI.SocialBuzz.SocialBuzzSource.recentlyPlayed1ShortText, MS.Entertainment.UI.SocialBuzz.SocialBuzzSource.recentlyPlayed1LongText, MS.Entertainment.UI.SocialBuzz.SocialBuzzSource.recentlyPlayedNShortText, MS.Entertainment.UI.SocialBuzz.SocialBuzzSource.recentlyPlayedNLongText)
            }, _createBeaconNotification: function _createBeaconNotification(count, gamerInfo) {
                return this._createNotification(count, "images/ico_19x_Beacon_NoCircle_Grey.png", gamerInfo, MS.Entertainment.UI.SocialBuzz.SocialBuzzSource.beacons1ShortText, MS.Entertainment.UI.SocialBuzz.SocialBuzzSource.beacons1LongText, MS.Entertainment.UI.SocialBuzz.SocialBuzzSource.beaconsNShortText, MS.Entertainment.UI.SocialBuzz.SocialBuzzSource.beaconsNLongText)
            }, _createNotification: function _createNotification(count, image, params, shortText1, longText1, shortTextN, longTextN) {
                var numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                var formattedCount;
                if ((typeof count !== "number") || (count <= 0))
                    return null;
                else if (count === 1)
                    return new MS.Entertainment.UI.ContentNotification.Notification(image, shortText1, longText1, params);
                else {
                    formattedCount = numberFormatter.format(count);
                    return new MS.Entertainment.UI.ContentNotification.Notification(image, shortTextN.format(formattedCount), longTextN.format(formattedCount), params)
                }
            }
    }, (function() {
        var socialBuzzStrings;
        function getSocialBuzzStrings() {
            if (!socialBuzzStrings)
                socialBuzzStrings = {
                    recentlyPlayed1ShortText: String.load(String.id.IDS_SOCIAL_BUZZ_1_RECENTLY_PLAYED_SHORT), recentlyPlayedNShortText: String.load(String.id.IDS_SOCIAL_BUZZ_N_RECENTLY_PLAYED_SHORT), recentlyPlayed1LongText: String.load(String.id.IDS_SOCIAL_BUZZ_1_RECENTLY_PLAYED_LONG), recentlyPlayedNLongText: String.load(String.id.IDS_SOCIAL_BUZZ_N_RECENTLY_PLAYED_LONG), beacons1ShortText: String.load(String.id.IDS_SOCIAL_BUZZ_1_BEACON_SHORT), beaconsNShortText: String.load(String.id.IDS_SOCIAL_BUZZ_N_BEACONS_SHORT), beacons1LongText: String.load(String.id.IDS_SOCIAL_BUZZ_1_BEACON_LONG), beaconsNLongText: String.load(String.id.IDS_SOCIAL_BUZZ_N_BEACONS_LONG)
                };
            return socialBuzzStrings
        }
        return {
                recentlyPlayed1ShortText: {get: function() {
                        return getSocialBuzzStrings().recentlyPlayed1ShortText
                    }}, recentlyPlayedNShortText: {get: function() {
                            return getSocialBuzzStrings().recentlyPlayedNShortText
                        }}, recentlyPlayed1LongText: {get: function() {
                            return getSocialBuzzStrings().recentlyPlayed1LongText
                        }}, recentlyPlayedNLongText: {get: function() {
                            return getSocialBuzzStrings().recentlyPlayedNLongText
                        }}, beacons1ShortText: {get: function() {
                            return getSocialBuzzStrings().beacons1ShortText
                        }}, beaconsNShortText: {get: function() {
                            return getSocialBuzzStrings().beaconsNShortText
                        }}, beacons1LongText: {get: function() {
                            return getSocialBuzzStrings().beacons1LongText
                        }}, beaconsNLongText: {get: function() {
                            return getSocialBuzzStrings().beaconsNLongText
                        }}
            }
    })())})
