/* Copyright (C) Microsoft Corporation. All rights reserved. */
var __extends = this.__extends || function(d, b) {
        function __() {
            this.constructor = d
        }
        __.prototype = b.prototype;
        d.prototype = new __
    };
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            var ListNotificationService = (function(_super) {
                    __extends(ListNotificationService, _super);
                    function ListNotificationService() {
                        _super.call(this);
                        ListNotificationService._instanceCount++;
                        MS.Entertainment.UI.assert(ListNotificationService._instanceCount === 1, "Use MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.listNotification);");
                        this._loadStoredNotifications()
                    }
                    ListNotificationService._instanceCount = 0;
                    ListNotificationService._localStorageKey = "MusicNotifications";
                    ListNotificationService.sendNotificationReceived = "sendNotificationReceived";
                    ListNotificationService.clearNotificationReceived = "clearNotificationReceived";
                    Object.defineProperty(ListNotificationService.prototype, "notifications", {
                        get: function() {
                            var availableNotifications = this._notifications.filter(function(item) {
                                    return !item.acknowledged && item.visible
                                });
                            return availableNotifications
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(ListNotificationService.prototype, "localAppSettings", {
                        get: function() {
                            var storedData = null;
                            if (MS.Entertainment.Utilities.isApp1)
                                try {
                                    storedData = Windows.Storage.ApplicationData.current.localSettings.values[ListNotificationService._localStorageKey]
                                }
                                catch(e) {
                                    MS.Entertainment.fail("Failed to read from local app settings for the list notification service with the following error: " + e.toString())
                                }
                            return storedData
                        }, set: function(value) {
                                if (MS.Entertainment.Utilities.isApp1)
                                    try {
                                        Windows.Storage.ApplicationData.current.localSettings.values[ListNotificationService._localStorageKey] = value
                                    }
                                    catch(e) {
                                        MS.Entertainment.fail("Failed to write to local app settings for the list notification service with the following error: " + e.toString())
                                    }
                            }, enumerable: true, configurable: true
                    });
                    ListNotificationService.prototype.send = function(notification) {
                        MS.Entertainment.UI.assert(notification, "Null notification sent to the list notification service.");
                        var index = this.indexOfNotificationByCategory(notification.category);
                        if (index >= 0) {
                            if (this._notifications[index].category.completed)
                                return;
                            if (notification.category.firstTimeOnly && this._notifications[index].acknowledged)
                                return;
                            MS.Entertainment.Utilities.Telemetry.logNotification(notification);
                            this._notifications[index] = notification;
                            this._notifications[index].acknowledged = false;
                            this.storeNotifications();
                            this.dispatchEvent(ListNotificationService.sendNotificationReceived, notification)
                        }
                        else {
                            MS.Entertainment.Utilities.Telemetry.logNotification(notification, true);
                            this._notifications.push(notification);
                            this.storeNotifications();
                            this.dispatchEvent(ListNotificationService.sendNotificationReceived, notification)
                        }
                    };
                    ListNotificationService.prototype.clear = function(category, removeFromList) {
                        MS.Entertainment.UI.assert(category, "Cannot clear list notifications without category.");
                        var index = this.indexOfNotificationByCategory(category);
                        MS.Entertainment.UI.assert(index >= 0, "Attempt to clear a notification that is not in the list.");
                        if (index >= 0) {
                            if (removeFromList)
                                this._notifications.splice(index, 1);
                            else
                                this._notifications[index].acknowledged = true;
                            this.storeNotifications();
                            this.dispatchEvent(ListNotificationService.clearNotificationReceived, category)
                        }
                    };
                    ListNotificationService.prototype.reset = function() {
                        this._notifications = [];
                        this.localAppSettings = []
                    };
                    ListNotificationService.prototype.getNotificationByCategory = function(category) {
                        var matches = this._notifications.filter(function(item) {
                                return item.category.name === category.name
                            });
                        return matches && matches.length > 0 ? matches[0] : null
                    };
                    ListNotificationService.prototype.indexOfNotificationByCategory = function(category) {
                        var notification = this.getNotificationByCategory(category);
                        return notification ? this._notifications.indexOf(notification) : -1
                    };
                    ListNotificationService.prototype.storeNotifications = function() {
                        this._notifications.sort(function(notification1, notification2) {
                            var notification1Pri = notification1 && notification1.category && notification1.category.priority ? notification1.category.priority : -1;
                            var notification2Pri = notification2 && notification2.category && notification2.category.priority ? notification2.category.priority : -1;
                            if (notification1Pri === notification2Pri)
                                return 0;
                            else if (notification1Pri > notification2Pri)
                                return 1;
                            else
                                return -1
                        });
                        var notificationsToSave = this._notifications.filter(function(item) {
                                return item.category.firstTimeOnly === true
                            });
                        this.localAppSettings = JSON.stringify(notificationsToSave)
                    };
                    ListNotificationService.prototype._loadStoredNotifications = function() {
                        var storedNotifications = this.localAppSettings;
                        if (storedNotifications)
                            try {
                                this._notifications = JSON.parse(storedNotifications)
                            }
                            catch(e) {
                                MS.Entertainment.fail("Failed to load notifications from local storage with the following error: " + e.toString())
                            }
                        if (!this._notifications || !Array.isArray(this._notifications))
                            this._notifications = []
                    };
                    ListNotificationService.factory = function factory() {
                        return new MS.Entertainment.UI.ListNotificationService
                    };
                    return ListNotificationService
                })(MS.Entertainment.UI.Framework.ObservableBase);
            UI.ListNotificationService = ListNotificationService
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.listNotification, MS.Entertainment.UI.ListNotificationService.factory)
