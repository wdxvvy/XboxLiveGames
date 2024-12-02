/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/ViewModels/PurchaseFlow/SmartBuyStateEngine.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Framework");
WinJS.Namespace.define("MS.Entertainment.Framework", {DownloadInfo: WinJS.Class.define(function DownloadInfoConstructor() {
        this.items = [];
        this.errorCodes = [];
        this.counts = {
            pending: 0, active: 0, failed: 0, canRetry: 0, paused: 0
        }
    }, {
        items: null, counts: null, errorCodes: null, hasPending: false, hasActive: false, hasFailed: false, hasPaused: false, hasRetryable: false, hasAny: false, initializeAsync: function initializeAsync(media) {
                return MS.Entertainment.Framework.DownloadInfo.getMarketplaceNativeFileDownloadsAsync(media).then(function getMarketplaceNativeFileDownloadsAsync_complete(nativeItems) {
                        for (var i = 0; i < nativeItems.length; i++) {
                            var nativeItem = nativeItems[i];
                            if (nativeItem.taskStatus !== Microsoft.Entertainment.FileTransferStatus.completed && !nativeItem.isClosed) {
                                var item = {
                                        mediaType: nativeItem.libraryTypeId, libraryId: nativeItem.libraryId, mediaId: nativeItem.mediaType, taskId: nativeItem.taskId, taskStatus: nativeItem.taskStatus, status: MS.Entertainment.Framework.DownloadInfo.Status.none, errorCode: 0, canRetry: nativeItem.canRetry
                                    };
                                switch (nativeItem.taskStatus) {
                                    case Microsoft.Entertainment.FileTransferStatus.paused:
                                        item.status = MS.Entertainment.Framework.DownloadInfo.Status.paused;
                                        ++this.counts.paused;
                                        break;
                                    case Microsoft.Entertainment.FileTransferStatus.pending:
                                        item.status = MS.Entertainment.Framework.DownloadInfo.Status.pending;
                                        ++this.counts.pending;
                                        break;
                                    case Microsoft.Entertainment.FileTransferStatus.error:
                                        item.errorCode = nativeItem.responseCode;
                                        if (nativeItem.responseCode !== 0)
                                            this.errorCodes.push(nativeItem.responseCode);
                                    case Microsoft.Entertainment.FileTransferStatus.notStarted:
                                    case Microsoft.Entertainment.FileTransferStatus.canceled:
                                        if (nativeItem.canRetry)
                                            ++this.counts.canRetry;
                                        item.status = MS.Entertainment.Framework.DownloadInfo.Status.failed;
                                        ++this.counts.failed;
                                        break;
                                    default:
                                        item.status = MS.Entertainment.Framework.DownloadInfo.Status.active;
                                        ++this.counts.active;
                                        break
                                }
                                this.items.push(item)
                            }
                        }
                        this.hasPending = (this.counts.pending > 0);
                        this.hasActive = (this.counts.active > 0);
                        this.hasFailed = (this.counts.failed > 0);
                        this.hasRetryable = (this.counts.canRetry > 0);
                        this.hasPaused = (this.counts.paused > 0);
                        this.hasAny = (this.items.length > 0)
                    }.bind(this))
            }, update: function update(nativeItem) {
                if (!nativeItem)
                    return false;
                var item = null;
                var oldStatus = MS.Entertainment.Framework.DownloadInfo.Status.none;
                var index = this._getItemIndexFromNativeItem(nativeItem);
                if (index !== -1) {
                    item = this.items[index];
                    if (item.taskStatus === nativeItem.taskStatus && !nativeItem.isClosed)
                        return false;
                    oldStatus = item.status
                }
                var errorCodesChanged = false;
                var retryableChanged = false;
                if (item && (nativeItem.taskStatus === Microsoft.Entertainment.FileTransferStatus.completed || nativeItem.isClosed)) {
                    this.items.splice(index, 1);
                    if (item.errorCode)
                        errorCodesChanged = true;
                    if (item.canRetry)
                        retryableChanged = true
                }
                else {
                    if (!item) {
                        if (nativeItem.taskStatus === Microsoft.Entertainment.FileTransferStatus.completed || nativeItem.isClosed)
                            return false;
                        item = {
                            mediaType: nativeItem.libraryTypeId, libraryId: nativeItem.libraryId, mediaId: nativeItem.mediaType, taskId: nativeItem.taskId, taskStatus: null, status: MS.Entertainment.Framework.DownloadInfo.Status.none, errorCode: 0, canRetry: false
                        };
                        this.items.push(item)
                    }
                    var previousErrorCode = item.errorCode;
                    var previousRetryable = item.canRetry;
                    item.errorCode = 0;
                    item.canRetry = nativeItem.canRetry;
                    item.taskStatus = nativeItem.taskStatus;
                    switch (nativeItem.taskStatus) {
                        case Microsoft.Entertainment.FileTransferStatus.paused:
                            item.status = MS.Entertainment.Framework.DownloadInfo.Status.paused;
                            if (item.status === oldStatus)
                                return false;
                            ++this.counts.paused;
                            break;
                        case Microsoft.Entertainment.FileTransferStatus.pending:
                            item.status = MS.Entertainment.Framework.DownloadInfo.Status.pending;
                            if (item.status === oldStatus)
                                return false;
                            ++this.counts.pending;
                            break;
                        case Microsoft.Entertainment.FileTransferStatus.error:
                            item.errorCode = nativeItem.responseCode;
                        case Microsoft.Entertainment.FileTransferStatus.notStarted:
                        case Microsoft.Entertainment.FileTransferStatus.canceled:
                            item.status = MS.Entertainment.Framework.DownloadInfo.Status.failed;
                            if (item.status === oldStatus && previousErrorCode === item.errorCode)
                                return false;
                            ++this.counts.failed;
                            break;
                        default:
                            item.status = MS.Entertainment.Framework.DownloadInfo.Status.active;
                            if (item.status === oldStatus)
                                return false;
                            ++this.counts.active;
                            break
                    }
                    errorCodesChanged = previousErrorCode !== item.errorCode;
                    retryableChanged = previousRetryable !== item.canRetry
                }
                switch (oldStatus) {
                    case MS.Entertainment.Framework.DownloadInfo.Status.paused:
                        --this.counts.paused;
                        break;
                    case MS.Entertainment.Framework.DownloadInfo.Status.pending:
                        --this.counts.pending;
                        break;
                    case MS.Entertainment.Framework.DownloadInfo.Status.failed:
                        --this.counts.failed;
                        break;
                    case MS.Entertainment.Framework.DownloadInfo.Status.active:
                        --this.counts.active;
                        break
                }
                if (retryableChanged) {
                    this.counts.canRetry = 0;
                    for (var i = 0; i < this.items.length; i++)
                        if (this.items[i].canRetry)
                            ++this.counts.canRetry
                }
                if (errorCodesChanged) {
                    this.errorCodes = [];
                    for (var i = 0; i < this.items.length; i++) {
                        var errorCode = this.items[i].errorCode;
                        if (errorCode)
                            this.errorCodes.push(errorCode)
                    }
                }
                this.hasPaused = (this.counts.paused > 0);
                this.hasPending = (this.counts.pending > 0);
                this.hasActive = (this.counts.active > 0);
                this.hasFailed = (this.counts.failed > 0);
                this.hasRetryable = (this.counts.canRetry > 0);
                this.hasAny = (this.items.length > 0);
                return true
            }, _getItemIndexFromNativeItem: function _getItemIndexFromNativeItem(nativeItem) {
                if (!nativeItem || !this.items)
                    return -1;
                for (var i = 0; i < this.items.length; i++) {
                    var item = this.items[i];
                    if (item.taskId === nativeItem.taskId)
                        return i
                }
                return -1
            }
    }, {
        Status: {
            none: "none", failed: "failed", paused: "paused", pending: "pending", active: "active"
        }, createAndInitializeAsync: function createAndInitializeAsync(media) {
                var downloadInfo = new MS.Entertainment.Framework.DownloadInfo;
                return downloadInfo.initializeAsync(media).then(function initializeAsync_complete() {
                        return WinJS.Promise.wrap(downloadInfo)
                    })
            }, getMarketplaceNativeFileDownloadsAsync: function getMarketplaceNativeFileDownloadsAsync(media) {
                var query = MS.Entertainment.Framework.DownloadInfo.createMarketplaceFileTransferManagerQueryForMedia(media);
                if (query && Microsoft.Entertainment.FileTransferManager)
                    return Microsoft.Entertainment.FileTransferManager.getFileDownloadsByQueryAsync(query).then(function getFileDownloadsByQueryAsync_complete(nativeItems) {
                            if (nativeItems)
                                return WinJS.Promise.wrap(nativeItems);
                            return WinJS.Promise.wrap([])
                        }, function getFileDownloadsByQueryAsync_error(e) {
                            return WinJS.Promise.wrap([])
                        });
                else
                    return WinJS.Promise.wrap([])
            }, createMarketplaceFileTransferManagerQueryForMedia: function createMarketplaceFileTransferManagerQueryForMedia(media) {
                if (!media || !media.mediaType || !Microsoft.Entertainment.FileTransferQuery)
                    return null;
                var query = new Microsoft.Entertainment.FileTransferQuery;
                query.requestType = Microsoft.Entertainment.FileTransferRequestType.marketPlace;
                switch (media.mediaType) {
                    case Microsoft.Entertainment.Queries.ObjectType.game:
                        break;
                    default:
                        throw"The state engine does not support this media item type.";
                }
                return query
            }, getMarketplaceDownloadTaskKeyFunction: function getMarketplaceDownloadTaskKeyFunction(mediaType) {
                if (!mediaType)
                    return null;
                return function getMarketplaceDownloadTaskKey(nativeItem) {
                        switch (mediaType) {
                            case Microsoft.Entertainment.Queries.ObjectType.game:
                                break;
                            default:
                                throw"The state engine does not support this media item type.";
                        }
                    }
            }, isFileTransferTaskContainedByMedia: function isFileTransferTaskContainedByMedia(media, nativeItem) {
                if (!media || !media.mediaType || !nativeItem)
                    return false;
                switch (media.mediaType) {
                    case Microsoft.Entertainment.Queries.ObjectType.game:
                        break;
                    default:
                        throw"The state engine does not support this media item type.";
                }
            }
    })})
