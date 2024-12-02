/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/utilities.js", "/Framework/observablearray.js", "/Framework/Data/query.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.ContentNotification");
WinJS.Namespace.define("MS.Entertainment.UI.ContentNotification", {
    NotificationType: {
        error: 0, marketplaceTransferStatus: "100", marketplaceDownloadStatus: "101", serviceTransferStatus: "200", serviceDownloadStatus: "201", gameBeacon: 500, gameFriendsOnline: 501, gameFriendsRecentlyPlayed: 502, offlineAvailabilityLabel: 700
    }, NotificationModification: WinJS.Class.define(function notificationModificationConstructor(resultModifier, idGetter) {
            if (!resultModifier)
                throw new Error("The resultModifier parameter of NotificationModification's constructor is not optional.");
            if (!idGetter)
                throw new Error("The idGetter parameter of NotificationModification's constructor is not optional.");
            this._notificationArrayTable = {};
            this._resultModifier = resultModifier;
            this._idGetter = idGetter
        }, {
            _notificationArrayTable: null, _resultModifier: null, _idGetter: null, modifyQuery: function modifyQuery(query) {
                    var modification = WinJS.Binding.unwrap(this);
                    MS.Entertainment.UI.ContentNotification.assert(query.status === MS.Entertainment.Data.queryStatus.idle, "modifyQuery() should only be called on queries that have never run.  Results will be unexpected if the query is already in-flight or complete before it is modified.");
                    if (query.status !== MS.Entertainment.Data.queryStatus.idle)
                        return;
                    MS.Entertainment.UI.ContentNotification.assert(query instanceof MS.Entertainment.Data.AugmentQuery, "Non-AugmenterQuery passed into modifyQuery().");
                    if (query instanceof MS.Entertainment.Data.AugmentQuery)
                        query.resultAugmentation = modification._resultModifier(query.resultAugmentation, {contentNotifications: MS.Entertainment.Data.Property.hydratedIfAvailable({
                                get: function getContentNotifications() {
                                    var id = modification._idGetter(this);
                                    return id ? modification._getNotifications(id) : null
                                }, set: function setContentNotifications(value) {
                                        var id = modification._idGetter(this);
                                        if (id)
                                            modification._setNotifications(id, value)
                                    }
                            })})
                }, modifyItem: function modifyItem(item) {
                    var modification = WinJS.Binding.unwrap(this);
                    var propertyDescriptor = {
                            get: function get() {
                                var id = modification._idGetter(this);
                                return id ? modification._getNotifications(id) : null
                            }, set: function setContentNotifications(value) {
                                    var id = modification._idGetter(this);
                                    if (id)
                                        this._setNotifications(id, value)
                                }, enumerable: true, configurable: true
                        };
                    Object.defineProperty(item, "contentNotifications", propertyDescriptor);
                    if (item._backingData)
                        Object.defineProperty(item._backingData, "contentNotifications", propertyDescriptor)
                }, _getNotifications: function _getNotifications(id) {
                    var unwrappedThis = WinJS.Binding.unwrap(this);
                    if (!unwrappedThis._notificationArrayTable[id])
                        unwrappedThis._notificationArrayTable[id] = new MS.Entertainment.UI.ContentNotification.ObservableNotificationArray;
                    return unwrappedThis._notificationArrayTable[id]
                }, _setNotifications: function _setNotifications(id, value) {
                    var unwrappedThis = WinJS.Binding.unwrap(this);
                    unwrappedThis._notificationArrayTable[id] = value
                }, createSender: function createSender() {
                    var unwrappedThis = WinJS.Binding.unwrap(this);
                    return new MS.Entertainment.UI.ContentNotification.NotificationSender(unwrappedThis)
                }
        }), NotificationSender: WinJS.Class.define(function notificationSenderConstructor(modification) {
            this._modification = modification
        }, {
            _modification: null, sendNotification: function sendNotification(id, type, notification) {
                    var unwrappedThis = WinJS.Binding.unwrap(this);
                    unwrappedThis._modification._getNotifications(id).sendNotification(type, notification)
                }
        }), ObservableNotificationArray: WinJS.Class.derive(MS.Entertainment.ObservableArray, function observableNotificationArrayConstructor() {
            MS.Entertainment.ObservableArray.apply(this, arguments)
        }, {
            sendNotification: function sendNotification(type, notification) {
                if (MS.Entertainment.Utilities.isApp2 && type === MS.Entertainment.UI.ContentNotification.NotificationType.offlineAvailabilityLabel)
                    return;
                var unwrappedThis = WinJS.Binding.unwrap(this);
                var i,
                    item;
                var existingItem = null;
                for (i = 0; i < unwrappedThis.length; i++) {
                    item = unwrappedThis.item(i);
                    if (item.type === type) {
                        if (notification)
                            existingItem = item;
                        else
                            unwrappedThis.removeAt(i);
                        break
                    }
                    if (item.type >= type)
                        break
                }
                if (notification)
                    if (existingItem) {
                        existingItem.shortText = notification.shortText;
                        existingItem.longText = notification.longText;
                        existingItem.icon = notification.icon
                    }
                    else {
                        notification.type = type;
                        unwrappedThis.insert(i, notification)
                    }
            }, clear: function clear() {
                    var unwrappedThis = WinJS.Binding.unwrap(this);
                    unwrappedThis.splice(0, unwrappedThis.length)
                }
        }), Notification: MS.Entertainment.defineObservable(function notificationConstructor(icon, shortText, longText, params) {
            this.icon = icon;
            this.shortText = shortText;
            this.longText = longText;
            this.params = params
        }, {
            icon: String.empty, shortText: String.empty, longText: String.empty, params: null
        }), directResult: function directResult() {
            return function modifyAugmentationDirectly(augmentation, definition) {
                    return MS.Entertainment.Data.derive(augmentation || null, null, definition)
                }
        }, propertyResult: function propertyResult(propertyName, source, baseAugmentation) {
            return function modifyAugmentationProperty(augmentation, definition) {
                    var rootDefinition = {};
                    var newAugmentation = MS.Entertainment.Data.derive(baseAugmentation || null, null, definition);
                    rootDefinition[propertyName] = MS.Entertainment.Data.Property.augment(source, newAugmentation);
                    return MS.Entertainment.Data.derive(augmentation, null, rootDefinition)
                }
        }, listResult: function listResult() {
            return MS.Entertainment.Data.AugmentQuery.modifyListResultAugmentation
        }, idFromProperty: function idFromProperty(propertyName) {
            var propertyNameString = propertyName.toString();
            return function propertyID_getID(media) {
                    return media[propertyNameString]
                }
        }
})
