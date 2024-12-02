/* Copyright (C) Microsoft Corporation. All rights reserved. */
var MS;
(function(MS) {
    (function(Entertainment) {
        (function(UI) {
            var NotificationCategory = (function() {
                    function NotificationCategory(priority, name, icon, firstTimeOnly, completed, visible) {
                        this.priority = priority;
                        this.name = name;
                        this.icon = icon;
                        this.firstTimeOnly = firstTimeOnly;
                        this.completed = completed;
                        this.visible = visible
                    }
                    return NotificationCategory
                })();
            UI.NotificationCategory = NotificationCategory;
            var NotificationCategoryEnum = (function() {
                    function NotificationCategoryEnum(){}
                    NotificationCategoryEnum.userEngagementContent = new NotificationCategory(0, "userEngagementContent", MS.Entertainment.UI.Icon.info, false);
                    NotificationCategoryEnum.localContent = new NotificationCategory(1, "localContent", MS.Entertainment.UI.Icon.info, true);
                    NotificationCategoryEnum.partialContent = new NotificationCategory(2, "partialContent", MS.Entertainment.UI.Icon.info, false);
                    NotificationCategoryEnum.cloudContent = new NotificationCategory(3, "cloudContent", MS.Entertainment.UI.Icon.cloud, true);
                    return NotificationCategoryEnum
                })();
            UI.NotificationCategoryEnum = NotificationCategoryEnum;
            var CollectionChangeNotifierService = (function() {
                    function CollectionChangeNotifierService() {
                        this._blockGlobalCollectionChangeEvents = false;
                        this._blockGlobalCollectionUpSyncEvents = false;
                        this._blockedUpSyncItemData = null;
                        CollectionChangeNotifierService._instanceCount++;
                        MS.Entertainment.UI.assert(CollectionChangeNotifierService._instanceCount === 1, "Use MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.collectionChangeNotifier);");
                        this._appNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.appNotification);
                        this._listNotificationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.listNotification);
                        this._cloudCollectionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.cloudCollection);
                        this._signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                        this._startListening()
                    }
                    CollectionChangeNotifierService._instanceCount = 0;
                    Object.defineProperty(CollectionChangeNotifierService, "collectionChangeNotifierService", {
                        get: function() {
                            return MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.collectionChangeNotifier)
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService, "blockGlobalCollectionChangeEvents", {
                        get: function() {
                            return CollectionChangeNotifierService.collectionChangeNotifierService._blockGlobalCollectionChangeEvents
                        }, set: function(value) {
                                CollectionChangeNotifierService.collectionChangeNotifierService._blockGlobalCollectionChangeEvents = value
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService, "blockGlobalCollectionUpSyncEvents", {
                        get: function() {
                            return CollectionChangeNotifierService.collectionChangeNotifierService._blockGlobalCollectionUpSyncEvents
                        }, set: function(value) {
                                var ccnService = CollectionChangeNotifierService.collectionChangeNotifierService;
                                ccnService._blockGlobalCollectionUpSyncEvents = value;
                                if (!value) {
                                    var eventData = {
                                            itemsCompleted: 0, isCompleted: ccnService._blockedUpSyncItemData ? ccnService._blockedUpSyncItemData.isCompleted : 0
                                        };
                                    ccnService._onCollectionUpSyncProgress(eventData)
                                }
                            }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService.prototype, "configManager", {
                        get: function() {
                            if (!this._configManager)
                                this._configManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                            return this._configManager
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService.prototype, "isCloudCollectionEnabled", {
                        get: function() {
                            return this._cloudCollectionService.isEnabled
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService.prototype, "isCloudMatchOptedIn", {
                        get: function() {
                            return this._cloudCollectionService.isCloudMatchOptedIn
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService.prototype, "isCloudMatchOptedOut", {
                        get: function() {
                            return this._cloudCollectionService.isCloudMatchOptedOut
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService.prototype, "isCloudDownloadOnAddEnabled", {
                        get: function() {
                            return this._cloudCollectionService.shouldDownloadOnAdd
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService.prototype, "isMDLCStarted", {
                        get: function() {
                            return this.configManager.mdlc.firstMDLCDidWork
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService.prototype, "isMDLCFinished", {
                        get: function() {
                            return this.configManager.mdlc.firstMDLCFinished
                        }, enumerable: true, configurable: true
                    });
                    Object.defineProperty(CollectionChangeNotifierService.prototype, "mdlcPercentageComplete", {
                        get: function() {
                            return this.configManager.mdlc.firstMDLCPercentageComplete
                        }, enumerable: true, configurable: true
                    });
                    CollectionChangeNotifierService.prototype.dispose = function() {
                        if (this._signInServiceBinding) {
                            this._signInServiceBinding.cancel();
                            this._signInServiceBinding = null
                        }
                    };
                    CollectionChangeNotifierService.prototype.resetCloudListNotification = function() {
                        this.configManager.shell.cloudMatching = MS.Entertainment.CloudCollectionService.CloudMatchStatus.Unknown;
                        var cloudNotification = this._listNotificationService.getNotificationByCategory(NotificationCategoryEnum.cloudContent);
                        if (cloudNotification)
                            this._listNotificationService.clear(NotificationCategoryEnum.cloudContent, true);
                        this._sendCloudMatchingOptInDialogListNotification(false)
                    };
                    CollectionChangeNotifierService.prototype._buildMDLCProgressNotification = function(detailsMessage) {
                        var mdlcNotification = new UI.Notification;
                        mdlcNotification.category = NotificationCategoryEnum.cloudContent;
                        mdlcNotification.icon = NotificationCategoryEnum.cloudContent.icon;
                        mdlcNotification.title = String.load(String.id.IDS_MUSIC_SCAN_MATCH_SONGS_SCANNED_NOTIFICATION_LINE_1);
                        mdlcNotification.subTitle = detailsMessage;
                        mdlcNotification.action = UI.Actions.ActionIdentifiers.notificationCloudContent;
                        mdlcNotification.actionParams = {matchingDialog: true};
                        mdlcNotification.dismissAction = UI.Actions.ActionIdentifiers.notificationClear;
                        return mdlcNotification
                    };
                    CollectionChangeNotifierService.prototype._clearListNotification = function(category) {
                        this._listNotificationService.clear(category)
                    };
                    CollectionChangeNotifierService.prototype._sendGlobalNotification = function(category, titleText, subTitleText, isPersistent) {
                        var notification = new UI.Notification;
                        notification.title = titleText;
                        notification.subTitle = subTitleText;
                        notification.category = category.name;
                        notification.notificationType = "Informational";
                        notification.isPersistent = isPersistent;
                        if (isPersistent) {
                            notification.icon = WinJS.UI.AppBarIcon.sync;
                            notification.iconClassName = "rotate360Animation"
                        }
                        else {
                            notification.icon = MS.Entertainment.UI.Icon.musicInCollection;
                            notification.iconClassName = String.empty
                        }
                        notification.action = WinJS.Utilities.markSupportedForProcessing(function navigateToCollection() {
                            var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            if (navigationService.currentPage.iaNode.moniker !== MS.Entertainment.UI.Monikers.musicCollection)
                                navigationService.navigateTo(MS.Entertainment.UI.Monikers.musicCollection)
                        });
                        this._appNotificationService.send(notification);
                        return notification
                    };
                    CollectionChangeNotifierService.prototype._sendListNotification = function(category, messageText, detailsText, actionId, actionParams, completeCategory, hidden) {
                        var notification = new UI.Notification;
                        notification.category = category;
                        notification.icon = category.icon;
                        notification.title = messageText;
                        notification.subTitle = detailsText;
                        notification.action = actionId;
                        notification.actionParams = actionParams;
                        notification.dismissAction = UI.Actions.ActionIdentifiers.notificationClear;
                        notification.visible = !hidden;
                        this._listNotificationService.send(notification);
                        if (completeCategory)
                            notification.category.completed = true;
                        return notification
                    };
                    CollectionChangeNotifierService.prototype._sendCloudMatchingOptInDialogListNotification = function(isHiddenNotification) {
                        var optInCloudNotification = this._sendListNotification(NotificationCategoryEnum.cloudContent, String.load(String.id.IDS_MUSIC_SCAN_MATCH_OPT_IN_NOTIFICATION_LINE_1), String.load(String.id.IDS_MUSIC_SCAN_MATCH_OPT_IN_NOTIFICATION_LINE_2), UI.Actions.ActionIdentifiers.notificationCloudContent, {consentDialog: true}, null, isHiddenNotification);
                        return optInCloudNotification
                    };
                    CollectionChangeNotifierService.prototype._startListening = function() {
                        this._signInServiceBinding = WinJS.Binding.bind(this._signInService, {isSignedIn: this._onSignInChanged.bind(this)});
                        this._collectionBuildingManager = new Microsoft.Entertainment.Platform.CollectionBuildingManager;
                        this._collectionBuildingEvents = Entertainment.Utilities.addEventHandlers(this._collectionBuildingManager, {
                            collectionbuildbeginevent: this._onCollectionBegin.bind(this), collectionbuildprogressevent: this._onCollectionProgress.bind(this), collectionbuildmdlcprogressevent: this._onCollectionMDLCProgress.bind(this), collectionbuildupsyncprogressevent: this._onCollectionUpSyncProgress.bind(this), collectionbuildendevent: this._onCollectionEnd.bind(this), collectionbuildmediasyncedevent: this._onMediaSync.bind(this)
                        })
                    };
                    CollectionChangeNotifierService.prototype._onSignInChanged = function() {
                        if (this._signInService.isSignedIn && this.configManager.service.cleanedUpDatabase) {
                            this.resetCloudListNotification();
                            this.configManager.service.cleanedUpDatabase = false
                        }
                    };
                    CollectionChangeNotifierService.prototype._onCollectionBegin = function(eventData) {
                        MS.Entertainment.UI.assert(eventData, "Missing event data on collection begin event.");
                        MS.Entertainment.UI.assert(eventData.detail, "Missing source data on collection begin event.");
                        MS.Entertainment.UI.assert(eventData.detail.length > 0, "Missing source data on collection begin event.");
                        if (eventData.detail[0] === Microsoft.Entertainment.Platform.CollectionBuildingSource.cloud)
                            return;
                        this._sendListNotification(NotificationCategoryEnum.localContent, String.load(String.id.IDS_MUSIC_CLOUD_ADDING_MUSIC_NOTIFICATION_TITLE), String.load(String.id.IDS_MUSIC_CLOUD_ADDING_MUSIC_NOTIFICATION_BODY), UI.Actions.ActionIdentifiers.notificationLocalContent)
                    };
                    CollectionChangeNotifierService.prototype._onCollectionProgress = function(eventData) {
                        if (this._blockGlobalCollectionChangeEvents)
                            return;
                        MS.Entertainment.UI.assert(eventData, "Missing event data on collection progress event.");
                        MS.Entertainment.UI.assert(eventData.itemsCompleted >= 0, "Missing total count data on collection progress event.");
                        if (eventData.itemsCompleted === 0)
                            return;
                        var isCompleted = !!eventData.isCompleted;
                        var headerMessage = String.empty;
                        var detailsMessage = String.empty;
                        if (isCompleted)
                            headerMessage = String.load(String.id.IDS_MUSIC_CLOUD_NEW_MUSIC_ADDED_NOTIFICATION_LINE1);
                        else
                            headerMessage = String.load(String.id.IDS_MUSIC_CLOUD_NEW_MUSIC_ADDING_NOTIFICATION_LINE1);
                        if (eventData.itemsCompleted > 1)
                            detailsMessage = String.load(String.id.IDS_MUSIC_CLOUD_NEW_MUSIC_NOTIFICATION_LINE2).format(eventData.itemsCompleted);
                        else
                            detailsMessage = String.load(String.id.IDS_MUSIC_TRACK_LABEL).format(eventData.itemsCompleted);
                        this._sendGlobalNotification(NotificationCategoryEnum.localContent, headerMessage, detailsMessage, !isCompleted)
                    };
                    CollectionChangeNotifierService.prototype._onCollectionMDLCProgress = function(eventData) {
                        MS.Entertainment.UI.assert(eventData, "Missing event data on MLDC progress event.");
                        MS.Entertainment.UI.assert(eventData.itemsProcessed >= 0, "Missing item process count data on MLDC progress event.");
                        var isCompleted = !!eventData.isCompleted;
                        var detailsMessage = String.empty;
                        var numberMatched = eventData.itemsProcessed;
                        if (isCompleted) {
                            MS.Entertainment.UI.assert(this.isMDLCFinished, "Received a MDLC is complete event when mdlc.HasMDLCFinished flag has not been set.");
                            MS.Entertainment.UI.assert(this.mdlcPercentageComplete === 100, "Received a MDLC is complete event when mdlc.MdlcPercentageComplete is not 100%.");
                            detailsMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_SONGS_MATCHED_NOTIFICATION_LINE_2)
                        }
                        else {
                            MS.Entertainment.UI.assert(this.mdlcPercentageComplete >= 0, "Received a MDLC in progress event when mdlc.MdlcPercentageComplete is not greater than 0%.");
                            if (numberMatched === 0)
                                detailsMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_0_SONGS_SCANNED_NOTIFICATION_LINE_2).format(numberMatched);
                            else if (numberMatched === 1)
                                detailsMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_1_SONG_SCANNED_NOTIFICATION_LINE_2).format(numberMatched);
                            else
                                detailsMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_N_SONGS_SCANNED_NOTIFICATION_LINE_2).format(numberMatched)
                        }
                        if (!this.isCloudMatchOptedIn) {
                            var mdlcNotification = this._buildMDLCProgressNotification(detailsMessage);
                            var optInCloudNotification = this._listNotificationService.getNotificationByCategory(NotificationCategoryEnum.cloudContent);
                            if (!optInCloudNotification)
                                optInCloudNotification = this._sendCloudMatchingOptInDialogListNotification(true);
                            optInCloudNotification.tag = mdlcNotification;
                            this._listNotificationService.storeNotifications()
                        }
                        else {
                            this._sendListNotification(NotificationCategoryEnum.cloudContent, String.load(String.id.IDS_MUSIC_SCAN_MATCH_SONGS_SCANNED_NOTIFICATION_LINE_1), detailsMessage, UI.Actions.ActionIdentifiers.notificationCloudContent, {matchingDialog: true});
                            this._listNotificationService.getNotificationByCategory(NotificationCategoryEnum.cloudContent).tag = null;
                            if (isCompleted) {
                                var syncManager = new Microsoft.Entertainment.Sync.SyncManager;
                                syncManager.requestSyncAsync()
                            }
                        }
                    };
                    CollectionChangeNotifierService.prototype._onCollectionUpSyncProgress = function(eventData) {
                        MS.Entertainment.UI.assert(eventData, "Missing event data on collection upsync progress event.");
                        MS.Entertainment.UI.assert(eventData.itemsCompleted >= 0, "Missing total count data on collection upsync progress event.");
                        var isCompleted = !!eventData.isCompleted;
                        var headerMessage = String.empty;
                        var detailsMessage = String.empty;
                        var itemsUploaded = eventData.itemsCompleted;
                        if (this._blockGlobalCollectionUpSyncEvents) {
                            if (!this.isCloudDownloadOnAddEnabled) {
                                if (isCompleted)
                                    this._blockGlobalCollectionUpSyncEvents = false;
                                return
                            }
                            if (!this._blockedUpSyncItemData)
                                this._blockedUpSyncItemData = {
                                    itemsCompleted: itemsUploaded, isCompleted: isCompleted
                                };
                            else {
                                this._blockedUpSyncItemData.itemsCompleted += !isCompleted ? itemsUploaded : 0;
                                this._blockedUpSyncItemData.isCompleted = isCompleted
                            }
                        }
                        else {
                            if (this._blockedUpSyncItemData) {
                                if (!this._blockedUpSyncItemData.isCompleted && !isCompleted)
                                    return;
                                itemsUploaded = this._blockedUpSyncItemData.itemsCompleted;
                                this._blockedUpSyncItemData = null
                            }
                            else if (itemsUploaded === 0)
                                return;
                            if (isCompleted)
                                headerMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_MATCHED_NOTIFICATION);
                            else
                                headerMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_SCANNING_NOTIFICATION);
                            if (itemsUploaded > 1)
                                detailsMessage = String.load(String.id.IDS_MUSIC_CLOUD_NEW_MUSIC_NOTIFICATION_LINE2).format(itemsUploaded);
                            else
                                detailsMessage = String.load(String.id.IDS_MUSIC_TRACK_LABEL).format(itemsUploaded);
                            this._sendGlobalNotification(NotificationCategoryEnum.localContent, headerMessage, detailsMessage, !isCompleted)
                        }
                    };
                    CollectionChangeNotifierService.prototype._onCollectionEnd = function(eventData) {
                        MS.Entertainment.UI.assert(eventData, "Missing event data on collection end event.");
                        MS.Entertainment.UI.assert(eventData.error >= 0, "Missing error code data on collection end event.");
                        MS.Entertainment.UI.assert(eventData.itemsCollected >= 0, "Missing count data on collection end event.");
                        MS.Entertainment.UI.assert(eventData.source >= 0, "Missing source data on collection end event.");
                        if (eventData.source === Microsoft.Entertainment.Platform.CollectionBuildingSource.cloud) {
                            var mdlcNotification = this._listNotificationService.getNotificationByCategory(NotificationCategoryEnum.cloudContent);
                            if (mdlcNotification && this.isCloudMatchOptedIn && this.isMDLCFinished) {
                                var trackProvider = (new Microsoft.Entertainment.Platform.MediaStore).trackProvider;
                                trackProvider.getMatchedCountsAsync().done(function success(eventData) {
                                    MS.Entertainment.UI.assert(eventData, "Missing event data on get matched counts event.");
                                    var matchedTrackCount = eventData.localAndCloudValidRightsTrackCount;
                                    var totalTrackCount = eventData.localTrackCount;
                                    MS.Entertainment.UI.assert(matchedTrackCount >= 0, "Missing total match count data on get matched counts event.");
                                    MS.Entertainment.UI.assert(totalTrackCount >= 0, "Missing local track count data on get matched counts event.");
                                    var headerMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_SONGS_MATCHED_NOTIFICATION_LINE_1);
                                    var detailsMessage = String.empty;
                                    if (matchedTrackCount === 0)
                                        detailsMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_NO_SONGS_MATCHED_NOTIFICATION_LINE_2);
                                    else if (matchedTrackCount === 1)
                                        detailsMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_1_SONG_MATCHED_NOTIFICATION_LINE_2).format(matchedTrackCount);
                                    else
                                        detailsMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_N_SONGS_MATCHED_NOTIFICATION_LINE_2).format(matchedTrackCount, totalTrackCount);
                                    mdlcNotification.tag = null;
                                    this._sendListNotification(NotificationCategoryEnum.cloudContent, headerMessage, detailsMessage, UI.Actions.ActionIdentifiers.notificationCloudContent, {matchingDialog: true})
                                }.bind(this), function failed(eventData) {
                                    MS.Entertainment.fail("Failed to get matched count for final MDLC notification with the following error: " + eventData)
                                })
                            }
                        }
                        else {
                            if (eventData.error === Microsoft.Entertainment.Platform.CollectionBuildingError.errorMissingMetadata)
                                this._sendListNotification(NotificationCategoryEnum.partialContent, String.load(String.id.IDS_MUSIC_CLOUD_ADDING_FAILED_NOTIFICATION_TITLE), String.load(String.id.IDS_MUSIC_CLOUD_ADDING_FAILED_NOTIFICATION_BODY), UI.Actions.ActionIdentifiers.notificationPartialContent);
                            if (eventData.itemsCollected > 0 || eventData.itemsTotal > 0) {
                                this._sendListNotification(NotificationCategoryEnum.localContent, String.load(String.id.IDS_MUSIC_CLOUD_MUSIC_ADDED_NOTIFICATION_TITLE), String.load(String.id.IDS_MUSIC_CLOUD_MUSIC_ADDED_NOTIFICATION_BODY), UI.Actions.ActionIdentifiers.notificationLocalContent, null, true);
                                if (!this.isCloudMatchOptedIn && !this.isCloudMatchOptedOut && this.isCloudCollectionEnabled) {
                                    var optInCloudNotification = this._listNotificationService.getNotificationByCategory(NotificationCategoryEnum.cloudContent);
                                    if (optInCloudNotification) {
                                        optInCloudNotification.visible = true;
                                        this._listNotificationService.send(optInCloudNotification)
                                    }
                                    else {
                                        optInCloudNotification = this._sendCloudMatchingOptInDialogListNotification(false);
                                        var detailsMessage = String.load(String.id.IDS_MUSIC_SCAN_MATCH_0_SONGS_SCANNED_NOTIFICATION_LINE_2).format(0);
                                        var mdlcNotification = this._buildMDLCProgressNotification(detailsMessage);
                                        optInCloudNotification.tag = mdlcNotification
                                    }
                                }
                            }
                            else
                                this._sendListNotification(NotificationCategoryEnum.localContent, String.load(String.id.IDS_MUSIC_CLOUD_NO_MUSIC_NOTIFICATION_TITLE), String.load(String.id.IDS_MUSIC_CLOUD_NO_MUSIC_NOTIFICATION_BODY), UI.Actions.ActionIdentifiers.notificationLocalContent)
                        }
                    };
                    CollectionChangeNotifierService.prototype._onMediaSync = function(eventData) {
                        if (!this.isCloudMatchOptedOut)
                            return;
                        this._sendListNotification(NotificationCategoryEnum.cloudContent, String.load(String.id.IDS_MUSIC_CLOUD_POPULATED_NOTIFICATION_TITLE), String.load(String.id.IDS_MUSIC_CLOUD_POPULATED_NOTIFICATION_BODY), UI.Actions.ActionIdentifiers.notificationCloudContent)
                    };
                    CollectionChangeNotifierService.prototype.testCollectionBeginNotifications = function() {
                        var eventData = {detail: [0]};
                        this._onCollectionBegin(eventData)
                    };
                    CollectionChangeNotifierService.prototype.testCollectionProgressNotifications = function(itemAddCount, isFinalProgress) {
                        var eventData = {
                                itemsCompleted: itemAddCount, isCompleted: isFinalProgress ? 1 : 0
                            };
                        this._onCollectionProgress(eventData)
                    };
                    CollectionChangeNotifierService.prototype.testCollectionEndNotifications = function(finalItemCount, errorCode) {
                        var eventData = {
                                itemsCollected: finalItemCount, error: errorCode ? errorCode : Microsoft.Entertainment.Platform.CollectionBuildingError.errorNone, source: 0
                            };
                        this._onCollectionEnd(eventData)
                    };
                    CollectionChangeNotifierService.prototype.testCollectionMDLCProgressNotifications = function(itemProcessedCount, isComplete) {
                        var eventData = {
                                itemsProcessed: itemProcessedCount, itemsTotal: 200, isCompleted: isComplete ? 1 : 0
                            };
                        this._onCollectionMDLCProgress(eventData)
                    };
                    CollectionChangeNotifierService.prototype.testCollectionUpSyncProgressNotifications = function(itemUploadCount) {
                        var eventData = {
                                itemsCompleted: itemUploadCount, isCompleted: 1
                            };
                        this._onCollectionUpSyncProgress(eventData)
                    };
                    CollectionChangeNotifierService.prototype.testMediaSyncNotifications = function() {
                        this._onMediaSync(null)
                    };
                    CollectionChangeNotifierService.prototype.testClearListNotifications = function(categoryName) {
                        var category;
                        if (categoryName === NotificationCategoryEnum.localContent.name)
                            category = NotificationCategoryEnum.localContent;
                        else if (categoryName === NotificationCategoryEnum.partialContent.name)
                            category = NotificationCategoryEnum.partialContent;
                        else
                            category = NotificationCategoryEnum.cloudContent;
                        this._clearListNotification(category)
                    };
                    CollectionChangeNotifierService.prototype.testClearAllListNotifications = function() {
                        this._clearListNotification(NotificationCategoryEnum.localContent);
                        this._clearListNotification(NotificationCategoryEnum.partialContent);
                        this._clearListNotification(NotificationCategoryEnum.cloudContent)
                    };
                    CollectionChangeNotifierService.prototype.testResetListNotifications = function() {
                        this._listNotificationService.reset()
                    };
                    CollectionChangeNotifierService.factory = function factory() {
                        return new MS.Entertainment.UI.CollectionChangeNotifierService
                    };
                    return CollectionChangeNotifierService
                })();
            UI.CollectionChangeNotifierService = CollectionChangeNotifierService
        })(Entertainment.UI || (Entertainment.UI = {}));
        var UI = Entertainment.UI
    })(MS.Entertainment || (MS.Entertainment = {}));
    var Entertainment = MS.Entertainment
})(MS || (MS = {}));
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.collectionChangeNotifier, MS.Entertainment.UI.CollectionChangeNotifierService.factory)
