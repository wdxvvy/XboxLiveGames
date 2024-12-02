/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/utilities.js");
(function() {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI");
    WinJS.Namespace.define("MS.Entertainment.UI", {
        FileTransferServiceErrors: {
            _errorsLoaded: false, _createErrors: function _createErrors() {
                    MS.Entertainment.UI.FileTransferServiceErrors.ZEST_E_CONTENT_RIGHTS_NOT_AVAILABLE = {
                        name: "ZEST_E_CONTENT_RIGHTS_NOT_AVAILABLE", code: 0xC101A3FF, shortString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_NO_RIGHTS_SHORT), longString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_NO_RIGHTS_LONG)
                    };
                    MS.Entertainment.UI.FileTransferServiceErrors.E_ASSET_LICENSE_COUNT_EXCEEDED = {
                        name: "E_ASSET_LICENSE_COUNT_EXCEEDED", code: 0xC101A7D3, shortString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_NO_RIGHTS_SHORT), longString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_NO_RIGHTS_LONG)
                    };
                    MS.Entertainment.UI.FileTransferServiceErrors.NS_E_DOWNLOAD_DISK_FULL_ERROR = {
                        name: "NS_E_DOWNLOAD_DISK_FULL_ERROR", code: 0xC00D1366, shortString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_LOW_DISK_SPACE_SHORT), longString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_LOW_DISK_SPACE_LONG)
                    };
                    MS.Entertainment.UI.FileTransferServiceErrors.ZUNE_E_DOWNLOAD_SYSTEM_DISK_FULL = {
                        name: "ZUNE_E_DOWNLOAD_SYSTEM_DISK_FULL", code: 0xC1010038, shortString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_LOW_DISK_SPACE_SHORT), longString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_LOW_DISK_SPACE_LONG)
                    };
                    MS.Entertainment.UI.FileTransferServiceErrors.ZUNE_E_DOWNLOAD_LIBRARY_DISK_FULL = {
                        name: "ZUNE_E_DOWNLOAD_LIBRARY_DISK_FULL", code: 0xC1010039, shortString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_LOW_DISK_SPACE_SHORT), longString: String.load(String.id.IDS_FILE_TRANSFER_CANT_DOWNLOAD_LOW_DISK_SPACE_LONG)
                    };
                    MS.Entertainment.UI.FileTransferServiceErrors._errorsLoaded = true
                }, _initializeErrorInformation: function initializeErrorInformation() {
                    if (MS.Entertainment.UI.FileTransferServiceErrors._errorsLoaded)
                        return;
                    MS.Entertainment.UI.FileTransferServiceErrors._createErrors()
                }, ZEST_E_CONTENT_RIGHTS_NOT_AVAILABLE: null, E_ASSET_LICENSE_COUNT_EXCEEDED: null, NS_E_DOWNLOAD_DISK_FULL_ERROR: null, getError: function getError(task) {
                    MS.Entertainment.UI.FileTransferServiceErrors._initializeErrorInformation();
                    var errorCode = task.responseCode;
                    if (errorCode === MS.Entertainment.UI.FileTransferServiceErrors.ZEST_E_CONTENT_RIGHTS_NOT_AVAILABLE.code)
                        return MS.Entertainment.UI.FileTransferServiceErrors.ZEST_E_CONTENT_RIGHTS_NOT_AVAILABLE;
                    else if (errorCode === MS.Entertainment.UI.FileTransferServiceErrors.E_ASSET_LICENSE_COUNT_EXCEEDED.code)
                        return MS.Entertainment.UI.FileTransferServiceErrors.E_ASSET_LICENSE_COUNT_EXCEEDED;
                    else if (errorCode === MS.Entertainment.UI.FileTransferServiceErrors.NS_E_DOWNLOAD_DISK_FULL_ERROR.code || errorCode === MS.Entertainment.UI.FileTransferServiceErrors.ZUNE_E_DOWNLOAD_SYSTEM_DISK_FULL.code || errorCode === MS.Entertainment.UI.FileTransferServiceErrors.ZUNE_E_DOWNLOAD_LIBRARY_DISK_FULL.code) {
                        var totalBytes = task.totalBytesToReceive;
                        var error = null;
                        if (totalBytes) {
                            var one_mb = 1024 * 1024;
                            var one_gb = 1024 * one_mb;
                            var totalValue = 0;
                            if (totalBytes >= one_gb) {
                                var spaceNeededGB = Math.ceil(totalBytes / one_gb);
                                error = {
                                    name: "", code: task.responseCode, shortString: String.load(String.id.IDS_FILE_TRANSFER_FIRST_DELETE_UNNECESSARY_ITEMS_GB_SHORT).format(spaceNeededGB), longString: String.load(String.id.IDS_FILE_TRANSFER_FIRST_DELETE_UNNECESSARY_ITEMS_GB_LONG).format(spaceNeededGB)
                                }
                            }
                            else {
                                var spaceNeededMB = Math.ceil(totalBytes / one_mb);
                                error = {
                                    name: "", code: task.responseCode, shortString: String.load(String.id.IDS_FILE_TRANSFER_FIRST_DELETE_UNNECESSARY_ITEMS_MB_SHORT).format(spaceNeededMB), longString: String.load(String.id.IDS_FILE_TRANSFER_FIRST_DELETE_UNNECESSARY_ITEMS_MB_LONG).format(spaceNeededMB)
                                }
                            }
                        }
                        else
                            error = MS.Entertainment.UI.FileTransferServiceErrors.NS_E_DOWNLOAD_DISK_FULL_ERROR;
                        return error
                    }
                    else {
                        var toHexString = function toHexString(value) {
                                if (value < 0)
                                    value += 0xFFFFFFFF + 1;
                                return "0x" + value.toString(16)
                            };
                        var errorHexCode = toHexString(task.responseCode);
                        var error = {
                                name: "", code: task.responseCode, shortString: String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_ERROR_SHORT).format(errorHexCode), longString: String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_ERROR_LONG).format(errorHexCode)
                            };
                        return error
                    }
                }, errorCodes: {E_INSTANCEID_LICENSERIGHT_COMBINATION_INVALID: 0xc101a053}
        }, FileTransferService: WinJS.Class.define(function FileTransferServiceConstructor() {
                this._listeners = [];
                this._onDownloadChanged = this._onDownloadChanged.bind(this);
                this.startListening()
            }, {
                _listening: false, _listeners: null, startListening: function startListening() {
                        if (!this._listening && Microsoft.Entertainment.FileTransferManager) {
                            Microsoft.Entertainment.FileTransferManager.addEventListener("downloadschanged", this._onDownloadChanged);
                            this._listening = true
                        }
                    }, stopListening: function stopListening() {
                        if (this._listening && Microsoft.Entertainment.FileTransferManager) {
                            Microsoft.Entertainment.FileTransferManager.removeEventListener("downloadschanged", this._onDownloadChanged);
                            this._listening = false
                        }
                    }, registerListener: function registerListener(listenerId, taskKeyGetter, notificationSender, notifier, notifierThisObj, taskFilter) {
                        this.unregisterListener(listenerId);
                        this._listeners.push({
                            id: listenerId, taskKeyGetter: taskKeyGetter, taskFilter: taskFilter, notificationSender: notificationSender, notifier: notifier, notifierThisObj: notifierThisObj, downloadAggregators: [], transferAggregators: []
                        })
                    }, unregisterListener: function unregisterListener(listenerId) {
                        var i = this._getListenerIndex(listenerId);
                        if (i !== -1)
                            this._listeners.splice(i, 1)
                    }, _getListenerIndex: function _getListenerIndex(listenerId) {
                        for (var i = 0; i < this._listeners.length; i++)
                            if (this._listeners[i].id === listenerId)
                                return i;
                        return -1
                    }, _onDownloadChanged: function _onDownloadChanged(e) {
                        var size = e.size;
                        for (var i = 0; i < size; i++) {
                            var task = e[i];
                            this._notifyTaskChanged(task, MS.Entertainment.UI.FileTransferType.download);
                            if (!task.isClosed && (task.taskStatus === Microsoft.Entertainment.FileTransferStatus.completed || task.taskStatus === Microsoft.Entertainment.FileTransferStatus.canceled))
                                task.closeAsync().then(function closeAsync_complete(task){}, function closeAsync_error(error){})
                        }
                    }, _notifyTaskChanged: function _notifyTaskChanged(task, transferType) {
                        for (var listenerId in this._listeners) {
                            var listener = this._listeners[listenerId];
                            var aggregators = (transferType === MS.Entertainment.UI.FileTransferType.download) ? listener.downloadAggregators : listener.transferAggregators;
                            var taskKey = listener.taskKeyGetter(task);
                            if (!taskKey || (listener.taskFilter && listener.taskFilter(taskKey)))
                                continue;
                            var aggregator = aggregators[taskKey];
                            if (!aggregator) {
                                aggregator = new MS.Entertainment.UI.FileTransferItemAggregator(listener.notificationSender, listener.notifier, listener.notifierThisObj, taskKey, transferType);
                                aggregators[taskKey] = aggregator
                            }
                            aggregator.update(task)
                        }
                    }
            }, {
                pulseAsync: function pulseAsync(media) {
                    return MS.Entertainment.Framework.DownloadInfo.getMarketplaceNativeFileDownloadsAsync(media).then(function getMarketplaceNativeFileDownloadsAsync_complete(nativeItems) {
                            var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                            if (nativeItems && nativeItems.length > 0)
                                fileTransferService._onDownloadChanged(nativeItems);
                            return WinJS.Promise.wrap()
                        }, function getMarketplaceNativeFileDownloadsAsync_error(error) {
                            return WinJS.Promise.wrap()
                        })
                }, keyFromProperty: function keyFromProperty(propertyName, cachedMode, forceUpperCase) {
                        var cachedKey = null;
                        var propertyNameString = propertyName.toString();
                        return function keyFromProperty(item) {
                                var key = cachedKey;
                                if (!cachedMode || !cachedKey) {
                                    key = item[propertyNameString];
                                    if (key !== null && key !== "undefined" && key !== "" && key !== -1) {
                                        if (forceUpperCase && isNaN(key))
                                            key = key.toUpperCase();
                                        if (cachedMode && key !== -1)
                                            cachedKey = key
                                    }
                                    else
                                        key = null
                                }
                                return key
                            }
                    }, keyFromProperties: function keyFromProperties(propertyNames, cachedMode, forceUpperCase) {
                        var cachedKey = null;
                        var propertyNamesClone = [];
                        for (var i in propertyNames)
                            propertyNamesClone.push(propertyNames[i].toString());
                        return function keyFromProperty(item) {
                                var key = cachedKey;
                                if (!cachedMode || !cachedKey) {
                                    var badKey = false;
                                    key = String.empty;
                                    for (var j in propertyNamesClone) {
                                        var subKey = item[propertyNamesClone[j]];
                                        if (subKey !== null && subKey !== "undefined" && subKey !== "" && subKey !== -1)
                                            key += "_" + subKey;
                                        else {
                                            key = null;
                                            break
                                        }
                                    }
                                    if (key) {
                                        if (forceUpperCase)
                                            key = key.toUpperCase();
                                        if (cachedMode && !badKey)
                                            cachedKey = key
                                    }
                                }
                                return key
                            }
                    }, showErrorNotificationsForTask: function showErrorNotificationsForTask(task) {
                        if (task && task.isBackground && task.responseCode == MS.Entertainment.UI.FileTransferServiceErrors.errorCodes.E_INSTANCEID_LICENSERIGHT_COMBINATION_INVALID)
                            return false;
                        else
                            return true
                    }
            })
    });
    WinJS.Namespace.define("MS.Entertainment.UI", {FileTransferType: {
            transfer: "transfer", download: "download"
        }});
    WinJS.Namespace.define("MS.Entertainment.UI", {FileTransferNotificationMethods: {
            genericError: function genericError(notification) {
                var shortString = String.Empty;
                var longString = String.Empty;
                var icon = String.Empty;
                if (notification.transferType === MS.Entertainment.UI.FileTransferType.download) {
                    var error = MS.Entertainment.UI.FileTransferServiceErrors.getError(notification.task);
                    shortString = error.shortString;
                    longString = error.longString;
                    icon = MS.Entertainment.UI.Icon.inlineError
                }
                if (notification.task.isClosed)
                    notification.remove();
                else
                    notification.send(icon, shortString, longString)
            }, genericPending: function genericPending(notification) {
                    var shortString = String.Empty;
                    var longString = String.Empty;
                    var icon = String.Empty;
                    if (notification.transferType === MS.Entertainment.UI.FileTransferType.download) {
                        shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_QUEUE_SHORT);
                        longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_QUEUE_LONG);
                        icon = WinJS.UI.AppBarIcon.download
                    }
                    notification.send(icon, shortString, longString)
                }, genericProgress: function genericProgress(notification) {
                    var shortString = String.Empty;
                    var longString = String.Empty;
                    var icon = String.Empty;
                    var percentage = 0;
                    if (notification.transferType === MS.Entertainment.UI.FileTransferType.download) {
                        if (notification.task.taskStatus === Microsoft.Entertainment.FileTransferStatus.paused) {
                            shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_SHORT);
                            longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_LONG)
                        }
                        else if (notification.task.taskStatus === Microsoft.Entertainment.FileTransferStatus.error && notification.task.isClosed) {
                            shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_CANCELED_SHORT);
                            longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_CANCELED_LONG)
                        }
                        else if (notification.task.taskStatus === Microsoft.Entertainment.FileTransferStatus.pausedNoNetwork) {
                            shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_OFFLINE_SHORT);
                            longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_OFFLINE_LONG)
                        }
                        else if (notification.task.taskStatus === Microsoft.Entertainment.FileTransferStatus.pausedCostedNetwork) {
                            shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_METERED_NETWORK_SHORT);
                            longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_METERED_NETWORK_LONG)
                        }
                        else {
                            percentage = Math.floor(notification.task.percentage * 100);
                            shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_PERCENT_SHORT).format(percentage);
                            longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_PERCENT_LONG).format(percentage)
                        }
                        icon = WinJS.UI.AppBarIcon.download
                    }
                    notification.send(icon, shortString, longString)
                }, genericCancel: function genericCancel(notification) {
                    var shortString = String.Empty;
                    var longString = String.Empty;
                    var icon = String.Empty;
                    if (notification.task.taskStatus === Microsoft.Entertainment.FileTransferStatus.canceled) {
                        shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_CANCELED_SHORT);
                        longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_CANCELED_LONG);
                        icon = WinJS.UI.AppBarIcon.download
                    }
                    notification.send(icon, shortString, longString)
                }, genericComplete: function genericComplete(notification) {
                    notification.remove()
                }, _getTransferCounts: function _getTransferCounts(notification) {
                    var transferCounts = {
                            active: 0, paused: 0, pausedCostedNetwork: 0, pausedNoNetwork: 0
                        };
                    if (notification && notification.bucket && notification.bucket.length > 0)
                        for (var i = 0; i < notification.bucket.length; i++)
                            switch (notification.bucket[i].task.taskStatus) {
                                case Microsoft.Entertainment.FileTransferStatus.error:
                                case Microsoft.Entertainment.FileTransferStatus.canceled:
                                case Microsoft.Entertainment.FileTransferStatus.completed:
                                    break;
                                case Microsoft.Entertainment.FileTransferStatus.running:
                                    transferCounts.active++;
                                    break;
                                case Microsoft.Entertainment.FileTransferStatus.paused:
                                    transferCounts.paused++;
                                    break;
                                case Microsoft.Entertainment.FileTransferStatus.pausedCostedNetwork:
                                    transferCounts.pausedCostedNetwork++;
                                    break;
                                case Microsoft.Entertainment.FileTransferStatus.pausedNoNetwork:
                                    transferCounts.pausedNoNetwork++;
                                    break
                            }
                    return transferCounts
                }, _getUpdateShortString: function _getNotificationShortString(notification, activeTrackTransfers) {
                    var shortString = String.Empty;
                    if (notification.transferType === MS.Entertainment.UI.FileTransferType.download)
                        if (activeTrackTransfers === 1)
                            shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_1_TRACK_SHORT);
                        else
                            shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_TRACKS_SHORT).format(activeTrackTransfers);
                    return shortString
                }, _getUpdateLongString: function _getNotificationLongString(notification, activeTrackTransfers) {
                    var longString = String.Empty;
                    if (notification.transferType === MS.Entertainment.UI.FileTransferType.download)
                        if (activeTrackTransfers === 1)
                            longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_1_TRACK_LONG);
                        else
                            longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_TRACKS_LONG).format(activeTrackTransfers);
                    return longString
                }, _getUpdateIcon: function _getNotificationIcon(notification) {
                    return notification.transferType === MS.Entertainment.UI.FileTransferType.download ? WinJS.UI.AppBarIcon.download : String.empty
                }, trackCollectionUpdate: function trackCollectionUpdate(notification) {
                    var transferCounts = MS.Entertainment.UI.FileTransferNotificationMethods._getTransferCounts(notification);
                    var numberFormatter;
                    var formattedCount;
                    if (transferCounts.active > 0) {
                        numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                        formattedCount = numberFormatter.format(transferCounts.active);
                        var shortString = MS.Entertainment.UI.FileTransferNotificationMethods._getUpdateShortString(notification, formattedCount);
                        var longString = MS.Entertainment.UI.FileTransferNotificationMethods._getUpdateLongString(notification, formattedCount);
                        var icon = MS.Entertainment.UI.FileTransferNotificationMethods._getUpdateIcon(notification);
                        notification.send(icon, shortString, longString)
                    }
                    else if (transferCounts.pausedNoNetwork > 0) {
                        var shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_OFFLINE_SHORT);
                        var longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_OFFLINE_LONG);
                        var icon = MS.Entertainment.UI.FileTransferNotificationMethods._getUpdateIcon(notification);
                        notification.send(icon, shortString, longString)
                    }
                    else if (transferCounts.pausedCostedNetwork > 0) {
                        var shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_METERED_NETWORK_SHORT);
                        var longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_METERED_NETWORK_LONG);
                        var icon = MS.Entertainment.UI.FileTransferNotificationMethods._getUpdateIcon(notification);
                        notification.send(icon, shortString, longString)
                    }
                    else if (transferCounts.paused > 0) {
                        var shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_SHORT);
                        var longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_LONG);
                        var icon = MS.Entertainment.UI.FileTransferNotificationMethods._getUpdateIcon(notification);
                        notification.send(icon, shortString, longString)
                    }
                    else
                        notification.remove()
                }, trackCollectionError: function trackCollectionError(notification) {
                    MS.Entertainment.UI.assert(notification.transferType === MS.Entertainment.UI.FileTransferType.download);
                    if (!MS.Entertainment.UI.FileTransferService.showErrorNotificationsForTask(notification.task))
                        return;
                    var shortString = String.load(String.id.IDS_MUSIC_DOWNLOAD_ERROR);
                    var longString = String.load(String.id.IDS_MUSIC_DOWNLOAD_ERROR);
                    var icon = MS.Entertainment.UI.Icon.inlineError;
                    if (notification.task.isClosed)
                        notification.remove();
                    else
                        notification.send(icon, shortString, longString)
                }, episodeCollectionUpdate: function episodeCollectionUpdate(notification) {
                    var transferCounts = MS.Entertainment.UI.FileTransferNotificationMethods._getTransferCounts(notification);
                    var numberFormatter;
                    var formattedCount;
                    var shortString = String.Empty;
                    var longString = String.Empty;
                    var icon = String.Empty;
                    if (transferCounts.active > 0) {
                        if (notification.bucket.length === 1) {
                            shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_1_EPISODE_SHORT);
                            longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_1_EPISODE_LONG)
                        }
                        else {
                            numberFormatter = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dateTimeFormatters).decimalNumber;
                            formattedCount = numberFormatter.format(transferCounts.active);
                            shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_EPISODES_SHORT).format(formattedCount);
                            longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOADING_EPISODES_LONG).format(formattedCount)
                        }
                        icon = WinJS.UI.AppBarIcon.download;
                        notification.send(icon, shortString, longString)
                    }
                    else if (transferCounts.pausedNoNetwork > 0) {
                        shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_OFFLINE_SHORT);
                        longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_OFFLINE_LONG);
                        icon = WinJS.UI.AppBarIcon.download;
                        notification.send(icon, shortString, longString)
                    }
                    else if (transferCounts.pausedCostedNetwork > 0) {
                        shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_METERED_NETWORK_SHORT);
                        longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_METERED_NETWORK_LONG);
                        icon = WinJS.UI.AppBarIcon.download;
                        notification.send(icon, shortString, longString)
                    }
                    else if (transferCounts.paused > 0) {
                        shortString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_SHORT);
                        longString = String.load(String.id.IDS_FILE_TRANSFER_DOWNLOAD_PAUSED_LONG);
                        icon = WinJS.UI.AppBarIcon.download;
                        notification.send(icon, shortString, longString)
                    }
                    else
                        notification.remove()
                }
        }});
    WinJS.Namespace.define("MS.Entertainment.UI", {FileTransferNotifiers: {
            genericFile: {
                add: MS.Entertainment.UI.FileTransferNotificationMethods.genericProgress, pending: MS.Entertainment.UI.FileTransferNotificationMethods.genericPending, update: MS.Entertainment.UI.FileTransferNotificationMethods.genericProgress, complete: MS.Entertainment.UI.FileTransferNotificationMethods.genericComplete, error: MS.Entertainment.UI.FileTransferNotificationMethods.genericError, cancel: MS.Entertainment.UI.FileTransferNotificationMethods.genericCancel
            }, trackCollection: {
                    add: MS.Entertainment.UI.FileTransferNotificationMethods.trackCollectionUpdate, update: MS.Entertainment.UI.FileTransferNotificationMethods.trackCollectionUpdate, complete: MS.Entertainment.UI.FileTransferNotificationMethods.trackCollectionUpdate, error: MS.Entertainment.UI.FileTransferNotificationMethods.trackCollectionError
                }, episodeCollection: {
                    add: MS.Entertainment.UI.FileTransferNotificationMethods.episodeCollectionUpdate, update: MS.Entertainment.UI.FileTransferNotificationMethods.episodeCollectionUpdate, complete: MS.Entertainment.UI.FileTransferNotificationMethods.episodeCollectionUpdate, error: MS.Entertainment.UI.FileTransferNotificationMethods.genericError
                }
        }});
    WinJS.Namespace.define("MS.Entertainment.UI", {FileTransferItemAggregator: WinJS.Class.define(function FileTransferItemAggregatorConstructor(sender, notifier, notifierThisObj, taskKey, transferType) {
            this._taskKey = taskKey;
            this._sender = sender;
            this._notifier = notifier;
            this._notifierThisObj = notifierThisObj ? notifierThisObj : notifier;
            this._transferType = transferType;
            this._marketplaceNotifications = [];
            this._serviceNotifications = []
        }, {
            _taskKey: -1, _sender: null, _notifier: null, _notifierThisObj: null, _marketplaceNotifications: null, _serviceNotifications: null, _transferType: null, update: function update(task) {
                    var notifications = this._getNotificationBucket(task);
                    var i = this._getNotificationIndex(notifications, task.taskId);
                    var notification;
                    if (i !== -1)
                        notification = notifications[i];
                    else {
                        notification = this._createNotification(task);
                        notifications.push(notification);
                        if (this._notifier && this._notifier.add)
                            this._notifier.add.call(this._notifierThisObj, notification)
                    }
                    this._fireNotification(notification)
                }, _fireNotification: function _fireNotification(notification) {
                    if (this._notifier)
                        switch (notification.task.taskStatus) {
                            case Microsoft.Entertainment.FileTransferStatus.error:
                                this._removeNotificationFromBucket(notification);
                                if (this._notifier.error)
                                    this._notifier.error.call(this._notifierThisObj, notification);
                                break;
                            case Microsoft.Entertainment.FileTransferStatus.canceled:
                                if (this._notifier.cancel)
                                    this._notifier.cancel.call(this._notifierThisObj, notification);
                                break;
                            case Microsoft.Entertainment.FileTransferStatus.completed:
                                this._removeNotificationFromBucket(notification);
                                if (this._notifier.complete)
                                    this._notifier.complete.call(this._notifierThisObj, notification);
                                break;
                            default:
                                if (this._notifier.update)
                                    this._notifier.update.call(this._notifierThisObj, notification);
                                break
                        }
                }, _createNotification: function _createNotification(task) {
                    var that = this;
                    return {
                            id: task.taskId, transferType: that._transferType, task: task, bucket: that._getNotificationBucket(task), send: function send(icon, shortString, longString) {
                                    var notification = new MS.Entertainment.UI.ContentNotification.Notification(icon, shortString, longString);
                                    notification.task = task;
                                    that._sendNotification(notification, that._getTaskNotificationType(task))
                                }, remove: function remove() {
                                    that._sendNotification(null, that._getTaskNotificationType(task))
                                }
                        }
                }, _getNotificationIndex: function _getNotificationIndex(notifications, taskId) {
                    for (var i = 0; i < notifications.length; i++)
                        if (notifications[i].id === taskId)
                            return i;
                    return -1
                }, _removeNotificationFromBucket: function _removeNotificationFromBucket(notification) {
                    var i = this._getNotificationIndex(notification.bucket, notification.id);
                    if (i !== -1)
                        notification.bucket.splice(i, 1)
                }, _getTaskNotificationType: function _getTaskNotificationType(task) {
                    switch (task.taskType) {
                        case Microsoft.Entertainment.FileTransferRequestType.marketPlace:
                            return this._transferType === MS.Entertainment.UI.FileTransferType.download ? MS.Entertainment.UI.ContentNotification.NotificationType.marketplaceDownloadStatus : MS.Entertainment.UI.ContentNotification.NotificationType.marketplaceTransferStatus;
                        default:
                            throw"Unexpected task type.";
                    }
                }, _getNotificationBucket: function _getNotificationBucket(task) {
                    switch (task.taskType) {
                        case Microsoft.Entertainment.FileTransferRequestType.marketPlace:
                            return this._marketplaceNotifications;
                        default:
                            throw"Unexpected task type.";
                    }
                }, _sendNotification: function _sendNotification(notification, notificationType) {
                    if (this._sender && this._sender.sendNotification)
                        this._sender.sendNotification(this._taskKey, notificationType, notification);
                    else if (this._sender && this._sender.contentNotifications && this._sender.contentNotifications.sendNotification)
                        this._sender.contentNotifications.sendNotification(notificationType, notification);
                    else
                        MS.Entertainment.UI.assert(false, "Invalid notification object passed into _sendNotification")
                }
        })});
    MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.fileTransfer, function FileTransferServiceFactory() {
        return new MS.Entertainment.UI.FileTransferService
    })
})()
