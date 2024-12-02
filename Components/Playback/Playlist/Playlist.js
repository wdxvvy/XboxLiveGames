/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Controls/PlaybackControl.js", "/Framework/Data/factory.js", "/Framework/Data/Query.js");
(function(playlistNamespace) {
    var ArrayDataAdapter = WinJS.Class.define(function(array, options) {
            if (typeof array === "string")
                array = JSON.parse(array);
            if (!Array.isArray(array) && !array.getAt)
                array = [array];
            this._array = array;
            if (options) {
                if (options.keyOf)
                    this._keyOf = options.keyOf;
                if (options.compareByIdentity)
                    this.compareByIdentity = true
            }
            if (this._keyOf)
                this._keyMap = {};
            else
                this._items = new Array(array.length)
        }, {
            setNotificationHandler: function(notificationHandler) {
                if (this._array.onvectorchanged !== undefined) {
                    var CollectionChange = Windows.Foundation.Collections.CollectionChange;
                    var that = this;
                    this._array.addEventListener("vectorchanged", function(ev) {
                        var index = ev.index;
                        switch (ev.collectionChange) {
                            case CollectionChange.reset:
                                notificationHandler.invalidateAll();
                                break;
                            case CollectionChange.itemInserted:
                                notificationHandler.inserted(that._item(index), that._itemKey(index - 1), that._itemKey(index + 1), index);
                                break;
                            case CollectionChange.itemChanged:
                                notificationHandler.changed(that._item(index));
                                break;
                            case CollectionChange.itemRemoved:
                                notificationHandler.removed(null, index);
                                break
                        }
                    })
                }
            }, itemsFromEnd: function(count) {
                    var len = this._array.length;
                    return (len === 0 ? errorDoesNotExist() : this.itemsFromIndex(len - 1, Math.min(count - 1, len - 1), 0))
                }, itemsFromKey: function(key, countBefore, countAfter) {
                    this._ensureItems();
                    if (!this._keyToIndexMap) {
                        this._keyToIndexMap = {};
                        var len = this._array.length;
                        for (var i = 0; i < len; i++)
                            this._keyToIndexMap[this._itemKey(i)] = i
                    }
                    var index = this._keyToIndexMap[key];
                    return (typeof index === "number" ? this.itemsFromIndex(index, Math.min(countBefore, index), countAfter) : errorDoesNotExist())
                }, itemsFromIndex: function(index, countBefore, countAfter) {
                    var len = this._array.length;
                    if (index >= len)
                        return errorDoesNotExist();
                    else {
                        var first = index - countBefore;
                        var last = Math.min(index + countAfter, len - 1);
                        var items = new Array(last - first + 1);
                        for (var i = first; i <= last; i++)
                            items[i - first] = this._item(i);
                        return WinJS.Promise.wrap({
                                items: items, offset: countBefore, totalCount: len, absoluteIndex: index
                            })
                    }
                }, getCount: function() {
                    return WinJS.Promise.wrap(this._array.length)
                }, insertAtStart: function(key, data) {
                    return this._insert(0, data)
                }, insertBefore: function(key, data, nextKey, nextIndexHint) {
                    return this._insert(this._indexFromKeyAndHint(nextKey, nextIndexHint), data)
                }, insertAfter: function(key, data, previousKey, previousIndexHint) {
                    return this._insert(this._indexFromKeyAndHint(previousKey, previousIndexHint) + 1, data)
                }, insertAtEnd: function(key, data) {
                    return this._insert(this._array.length, data)
                }, change: function(key, newData, indexHint) {
                    var index = this._indexFromKeyAndHint(key, indexHint);
                    if (isNaN(index))
                        return errorNoLongerMeaningful();
                    this._setAt(index, newData);
                    return WinJS.Promise.wrap()
                }, moveToStart: function(key, indexHint) {
                    return this._move(this._indexFromKeyAndHint(key, indexHint), 0)
                }, moveBefore: function(key, nextKey, indexHint, nextIndexHint) {
                    return this._move(this._indexFromKeyAndHint(key, indexHint), this._indexFromKeyAndHint(nextKey, nextIndexHint))
                }, moveAfter: function(key, previousKey, indexHint, previousIndexHint) {
                    return this._move(this._indexFromKeyAndHint(key, indexHint), this._indexFromKeyAndHint(previousKey, previousIndexHint) + 1)
                }, moveToEnd: function(key, indexHint) {
                    return this._move(this._indexFromKeyAndHint(key, indexHint), this._array.length)
                }, remove: function(key, indexHint) {
                    var index = this._indexFromKeyAndHint(key, indexHint);
                    if (isNaN(index))
                        return errorNoLongerMeaningful();
                    if (!this._keyOf) {
                        this._ensureItems();
                        this._items.splice(index, 1)
                    }
                    this._removeAt(index);
                    if (this._keyOf)
                        delete this._keyMap[key];
                    return WinJS.Promise.wrap()
                }, keyFromIndex: function keyFromIndex(index) {
                    return this._itemKey(index)
                }, _itemKey: function(index) {
                    if (index < 0 || index >= this._array.length)
                        return null;
                    else if (this._keyOf)
                        return this._keyOf(this._array[index]);
                    else {
                        var item = this._items[index];
                        if (item)
                            return item.key;
                        else
                            return index.toString()
                    }
                }, _newItem: function(index) {
                    return {
                            key: this._itemKey(index), data: this._array[index]
                        }
                }, _ensureItems: function() {
                    if (typeof this._nextAvailableKey !== "number") {
                        var len = this._array.length;
                        for (var i = 0; i < len; i++)
                            if (!this._items[i])
                                this._items[i] = this._newItem(i);
                        this._nextAvailableKey = len
                    }
                }, _item: function(index) {
                    var item;
                    if (this._keyOf) {
                        var data = this._array[index],
                            key = this._keyOf(data);
                        item = this._keyMap[key];
                        if (!item)
                            item = this._keyMap[key] = {
                                key: key, data: data
                            }
                    }
                    else {
                        item = this._items[index];
                        if (!item)
                            item = this._items[index] = this._newItem(index)
                    }
                    return item
                }, _indexFromKeyAndHint: function(key, indexHint) {
                    var i,
                        min,
                        max;
                    for (i = indexHint, max = Math.min(i + keySearchRange, this._array.length - 1); i <= max; i++)
                        if (this._itemKey(i) === key)
                            return i;
                    for (i = indexHint - 1, min = Math.max(indexHint - keySearchRange, 0); i >= min; i--)
                        if (this._itemKey(i) === key)
                            return i;
                    return NaN
                }, _insert: function(index, data) {
                    if (isNaN(index))
                        return errorNoLongerMeaningful();
                    if (!this._keyOf)
                        this._ensureItems();
                    this._insertAt(index, data);
                    var item;
                    if (this._keyOf) {
                        var key = this._keyOf(data);
                        item = {
                            key: key, data: data
                        };
                        this._keyMap[key] = item
                    }
                    else {
                        item = {
                            key: (this._nextAvailableKey++).toString(), data: data
                        };
                        this._items.splice(index, 0, item)
                    }
                    return WinJS.Promise.wrap(item)
                }, _move: function(indexFrom, indexTo) {
                    if (isNaN(indexFrom) || isNaN(indexTo))
                        return errorNoLongerMeaningful();
                    var item,
                        data;
                    if (this._keyOf)
                        data = this._array[indexFrom];
                    else {
                        this._ensureItems();
                        item = this._items.splice(indexFrom, 1)[0];
                        data = item.data
                    }
                    this._removeAt(indexFrom);
                    if (indexFrom < indexTo)
                        indexTo--;
                    this._insertAt(indexTo, data);
                    if (!this._keyOf)
                        this._items.splice(indexTo, 0, item);
                    return WinJS.Promise.wrap()
                }, _insertAt: function(index, data) {
                    if (this._array.insertAt)
                        this._array.insertAt(index, data);
                    else
                        this._array.splice(index, 0, data)
                }, _setAt: function(index, data) {
                    if (this._array.setAt)
                        this._array.setAt(index, data);
                    else
                        this._array[index] = data
                }, _removeAt: function(index) {
                    if (this._array.removeAt)
                        this._array.removeAt(index);
                    else
                        this._array.splice(index, 1)
                }
        });
    var ArrayDataSource = WinJS.Class.derive(WinJS.UI.VirtualizedDataSource, function(array, options) {
            this._baseDataSourceConstructor(new ArrayDataAdapter(array, options))
        });
    var mySpace = WinJS.Namespace.define(playlistNamespace, null);
    var Playback = WinJS.Namespace.define("MS.Entertainment.Platform.Playback");
    var Factory = WinJS.Namespace.define("MS.Entertainment.Data.Factory");
    var Query = WinJS.Namespace.define("MS.Entertainment.Data.Query");
    var Queries = WinJS.Namespace.define("Microsoft.Entertainment.Queries");
    var Shell = WinJS.Namespace.define("MS.Entertainment.UI.Shell");
    var dataFactoryByHashValues = {};
    if (Factory)
        for (var p in Factory)
            if ("getHashValue" in Factory[p])
                dataFactoryByHashValues[Factory[p].getHashValue()] = p;
    var converterByMediaType = {};
    converterByMediaType[Queries.ObjectType.track] = "track";
    converterByMediaType[Queries.ObjectType.video] = "video";
    converterByMediaType[Queries.ObjectType.game] = "gameTrailer";
    var expanderByMediaType = {};
    expanderByMediaType[Queries.ObjectType.album] = "album";
    expanderByMediaType[Queries.ObjectType.person] = "artist";
    expanderByMediaType[Queries.ObjectType.genre] = "genre";
    expanderByMediaType[Queries.ObjectType.playlist] = "playlist";
    function localPathToUrl(path, mediaInstanceId) {
        if (!path)
            return WinJS.Promise.wrap(null);
        if (!mediaInstanceId || mediaInstanceId === MS.Entertainment.Utilities.EMPTY_GUID)
            mediaInstanceId = null;
        else
            mediaInstanceId = ("{" + mediaInstanceId + "}").toUpperCase();
        return Windows.Storage.StorageFile.getFileFromPathAsync(path).then(function(loadedFile) {
                var url = URL.createObjectURL(loadedFile, {oneTimeOnly: true});
                return {
                        url: url, mediaInstanceId: mediaInstanceId
                    }
            })
    }
    function servicePathToUrl(path) {
        if (!path)
            return WinJS.Promise.wrapError("servicePathToUrl is called with null url");
        var request = null;
        var url = path;
        return new WinJS.Promise(function(c, e, p) {
                var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
                var hostName = (new Windows.Foundation.Uri(url)).host;
                signIn.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, hostName, false).then(function getTicketCompleted(passportTicket) {
                    request = new XMLHttpRequest;
                    request.onreadystatechange = function() {
                        if (request.readyState === 4) {
                            if (request.status >= 200 && request.status < 300) {
                                var responseHeader = request.getAllResponseHeaders();
                                var response = request.response;
                                var stream = response.msRandomAccessStream;
                                var blob = msWWA.createBlobFromRandomAccessStream(response.type, stream);
                                var url = URL.createObjectURL(blob, {oneTimeOnly: true});
                                if (c)
                                    c({
                                        url: url, mediaInstanceId: null
                                    })
                            }
                            else if (e)
                                e(request);
                            request.onreadystatechange = function(){}
                        }
                        else if (p)
                            p(request)
                    };
                    request.open("GET", url, false);
                    request.responseType = "blob";
                    request.setRequestHeader("Authorization", "WLID1.1 " + passportTicket);
                    request.send(null)
                })
            }, function() {
                if (request)
                    request.abort()
            })
    }
    function waitForSignIn() {
        var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
        if (signInService.isSignedIn)
            return WinJS.Promise.wrap();
        else if (signInService.isSigningIn)
            return new WinJS.Promise(function(c, e, p) {
                    function onIsSigningInChanged(newValue, oldValue) {
                        if (!newValue) {
                            signInService.unbind("isSigningIn", onIsSigningInChanged);
                            if (signInService.isSignedIn)
                                c();
                            else
                                e("sign in failed or canceled")
                        }
                    }
                    signInService.bind("isSigningIn", onIsSigningInChanged)
                });
        else
            return WinJS.Promise.wrapError(Playback.Error.ZEST_E_SIGNIN_REQUIRED)
    }
    function getPassportTicket() {
        var signInService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
        return waitForSignIn().then(function signedIn() {
                return signInService.getPassportTicket(MS.Entertainment.Utilities.SignIn.TicketType.MBI_SSL, MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_Passport))
            })
    }
    function shouldRetryForFailure(failure) {
        var retry = false;
        var Error = MS.Entertainment.Platform.Playback.Error;
        if (failure && (failure.number == Error.INET_E_CONNECTION_TIMEOUT.code || failure.number == Error.INET_E_DOWNLOAD_FAILURE.code || failure.number == Error.INET_E_RESOURCE_NOT_FOUND.code))
            retry = true;
        return retry
    }
    function getPreferredStream(item, context, mediaEntitlements, retriesAttempted) {
        if (!retriesAttempted)
            retriesAttempted = 0;
        return getPreferredStreamInternal(item, context, mediaEntitlements).then(function success(result) {
                Playback.Etw.traceString("PLST->getPreferredStream: success ");
                MS.Entertainment.Utilities.Telemetry.logGetPreferredStreamSucceeded(retriesAttempted);
                return result
            }, function fail(result) {
                if (MS.Entertainment.isCanceled(result)) {
                    Playback.Etw.traceString("PLST->getPreferredStream: canceled");
                    return WinJS.Promise.wrapError(result)
                }
                Playback.Etw.traceString("PLST->getPreferredStream: failed with error : " + result);
                MS.Entertainment.Utilities.Telemetry.logGetPreferredStreamFailed(result, retriesAttempted);
                var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                if (retriesAttempted < configurationManager.playback.getPreferredStreamRetries && shouldRetryForFailure(result)) {
                    Playback.Etw.traceString("PLST->getPreferredStream: waiting and trying again");
                    return WinJS.Promise.timeout(configurationManager.playback.getPreferredStreamRetryDelayMS).then(function delayedRetry() {
                            return getPreferredStream(item, context, mediaEntitlements, retriesAttempted + 1)
                        })
                }
                else {
                    Playback.Etw.traceString("PLST->getPreferredStream: attempt failed but not retrying");
                    return WinJS.Promise.wrapError(result)
                }
            })
    }
    function getPreferredStreamInternal(item, context, mediaEntitlements) {
        Playback.Etw.traceString("PLST->getPreferredStreamInternal, context: " + context);
        if (Debug.testHookSimulateGetPreferredStreamFailure) {
            Playback.Etw.traceString("PLST->getPreferredStreamInternal, simulating failure: " + Debug.testHookSimulateGetPreferredStreamFailure);
            return WinJS.Promise.wrapError(Debug.testHookSimulateGetPreferredStreamFailure)
        }
        if (item.mediaType === Queries.ObjectType.track) {
            var assetLocationRequestPromise = null;
            if (mediaEntitlements && mediaEntitlements.canFullyStream && mediaEntitlements.best.stream.isAvailable) {
                var requestInfo = {
                        serviceMediaIds: [mediaEntitlements.serviceMediaId], mediaInstanceIds: [mediaEntitlements.best.stream.serviceMediaInstanceId], nativeLicenseRights: [MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap.fromModernToNative(mediaEntitlements.best.stream.licenseRight)], offerIds: [null]
                    };
                assetLocationRequestPromise = MS.Entertainment.Platform.PurchaseHelpers.getAssetLocationsUsingRequestInfoAsync(requestInfo, false, context, "USE HEADER AUTH NOT PASSPORT TICKET", true)
            }
            else {
                var rightsFilter = [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Stream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.FreeStream];
                function doGetAssetLocationsAsync() {
                    return MS.Entertainment.Platform.PurchaseHelpers.getAssetLocationsAsync(item.zuneId, item.rights, rightsFilter, false, context, "USE HEADER AUTH NOT PASSPORT TICKET")
                }
                assetLocationRequestPromise = waitForSignIn().then(doGetAssetLocationsAsync, doGetAssetLocationsAsync)
            }
            function onTrackingIdObtained(id, obtained) {
                if (id) {
                    var trackingIdState = MS.Entertainment.Platform.SessionManager.trackingIdState;
                    trackingIdState[id] = "obtained";
                    Playback.Etw.traceString("OBTAINED tracking id: " + id)
                }
            }
            return assetLocationRequestPromise.then(function getAssetLocationsAsync_complete(assetLocations) {
                    if (assetLocations.length === 0) {
                        var error = Playback.Error.X8_E_PLAYBACK_NO_ASSET_LOCATION;
                        if (!isNetworkAvailable())
                            error = Playback.Error.NS_E_WMPIM_USEROFFLINE;
                        else if (mediaEntitlements && mediaEntitlements.hasTakeDown)
                            error = Playback.Error.ZEST_E_MW_CONTENT_REVOKED_ON_LABEL_TAKEDOWN;
                        else {
                            MS.Entertainment.Platform.Playback.assert(item && item.mediaType && item.mediaType === Queries.ObjectType.track, "expected a track media type");
                            var canBuy = MS.Entertainment.ViewModels.SmartBuyStateHandlers.mediaHasAnyRight(item, MS.Entertainment.Utilities.defaultClientTypeFromApp, [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Purchase, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.AlbumPurchase]);
                            if (canBuy)
                                error = Playback.Error.ZEST_E_ASSET_LICENSE_RIGHT_NOT_OWNED
                        }
                        Playback.Etw.traceString("PLST->getAssetLocationsAsync_complete with error: " + error.name);
                        return WinJS.Promise.wrapError(error)
                    }
                    Playback.Etw.traceString("PLST<-getPreferredStreamInternal");
                    onTrackingIdObtained(assetLocations[0].trackingId);
                    return WinJS.Promise.wrap({
                            url: assetLocations[0].assetUrl, mediaInstanceId: assetLocations[0].mediaInstanceId, nativeLicenseRight: assetLocations[0].nativeLicenseRight, offerId: assetLocations[0].offerId, trackingId: assetLocations[0].trackingId
                        })
                }, function getAssetLocationsAsync_error(error) {
                    Playback.Etw.traceString("PLST->getAssetLocationsAsync_error: " + error);
                    return WinJS.Promise.wrapError(error)
                })
        }
        else
            return getPassportTicket().then(function got_ticket(ticket) {
                    var serviceId = item.hasZuneId ? item.zuneId : item.serviceId;
                    return Microsoft.Entertainment.Marketplace.Marketplace.getPreferredStreamInfo(ticket, serviceId).then(function preferredStream(result) {
                            Playback.Etw.traceString("PLST<-getPreferredStreamInternal");
                            return WinJS.Promise.wrap({
                                    url: result.source, mediaInstanceId: result.mediaInstanceId, nativeLicenseRight: result.nativeLicenseRight, offerId: result.offerId
                                })
                        })
                })
    }
    function isNetworkAvailable() {
        try {
            switch (MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).networkStatus) {
                case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                    return false;
                default:
                    break
            }
            return true
        }
        catch(err) {
            return true
        }
    }
    function itemToUrl(item, context) {
        Playback.Etw.traceString("PLST->itemToUrl");
        if (!item)
            return WinJS.Promise.wrap(null);
        var mediaStore = null;
        var provider = null;
        var preferredFile;
        switch (item.mediaType) {
            default:
                return WinJS.Promise.wrapError("Unexpected media type")
        }
        var mediaEntitlements = null;
        function internalItemToUrl() {
            var urlPromise;
            var localPath = null;
            var protectionState = Playback.ProtectionState.unknown;
            if (preferredFile)
                switch (preferredFile.type) {
                    case Microsoft.Entertainment.Platform.FileUrlType.localFileUrl:
                        urlPromise = localPathToUrl(preferredFile.url, preferredFile.mediaInstanceId);
                        localPath = preferredFile.url;
                        if (preferredFile.protection)
                            switch (preferredFile.protection) {
                                case Microsoft.Entertainment.Platform.ProtectionState.protected:
                                    protectionState = Playback.ProtectionState.drmProtected;
                                    break;
                                case Microsoft.Entertainment.Platform.ProtectionState.unprotected:
                                    protectionState = Playback.ProtectionState.unprotected;
                                    break;
                                case Microsoft.Entertainment.Platform.ProtectionState.unknown:
                                    protectionState = Playback.ProtectionState.unknown;
                                    break;
                                default:
                                    MS.Entertainment.Platform.Playback.assert(false, "getPreferredFileUrlAsync returned invalid protectionState");
                                    break
                            }
                        break;
                    case Microsoft.Entertainment.Platform.FileUrlType.serviceFileUrl:
                        MS.Entertainment.Platform.Playback.assert(!!preferredFile.url, "Fix it: provider.getPreferredFileUrlAsync returned null serviceFileUrl in success completion");
                        urlPromise = servicePathToUrl(preferredFile.url);
                        protectionState = Playback.ProtectionState.unprotected;
                        break;
                    case Microsoft.Entertainment.Platform.FileUrlType.marketPlaceFileUrl:
                        urlPromise = getPreferredStream(item, context, mediaEntitlements);
                        protectionState = Playback.ProtectionState.unknown;
                        break;
                    case Microsoft.Entertainment.Platform.FileUrlType.remoteMachineFileUrl:
                        urlPromise = WinJS.Promise.wrapError(Playback.Error.X8_E_PLAYBACK_MEDIA_ERR_NOT_LOCAL);
                        protectionState = Playback.ProtectionState.unknown;
                        break;
                    default:
                        if (item.filePath) {
                            urlPromise = localPathToUrl(item.filePath);
                            localPath = item.filePath;
                            protectionState = Playback.ProtectionState.unknown
                        }
                        else {
                            urlPromise = getPreferredStream(item, context, mediaEntitlements);
                            protectionState = Playback.ProtectionState.drmProtected
                        }
                        break
                }
            else if (item.filePath && item.filePath.substr(0, 5) === "zest:") {
                urlPromise = getPreferredStream(item, context, mediaEntitlements);
                protectionState = Playback.ProtectionState.drmProtected
            }
            else if (item.filePath) {
                urlPromise = localPathToUrl(item.filePath);
                localPath = item.filePath;
                protectionState = Playback.ProtectionState.unknown
            }
            else {
                urlPromise = getPreferredStream(item, context, mediaEntitlements);
                protectionState = Playback.ProtectionState.drmProtected
            }
            Playback.Etw.traceString("PLST->computeURL");
            return urlPromise.then(function urlPromiseComplete(result) {
                    Playback.Etw.traceString("PLST<-computeURL");
                    if (localPath)
                        if (protectionState !== Playback.ProtectionState.unknown) {
                            Playback.Etw.traceString("PLST-localPath protection state returned from DB: " + protectionState);
                            return WinJS.Promise.wrap({
                                    url: result.url, mediaInstanceId: result.mediaInstanceId, nativeLicenseRight: null, offerId: null, isLocal: true, trackingId: result.trackingId, protectionState: protectionState
                                })
                        }
                        else {
                            Playback.Etw.traceString("PLST->localPath protection state");
                            return Windows.Storage.StorageFile.getFileFromPathAsync(localPath).then(function getFileFromPathAsync(storageFile) {
                                    var extraProps = [];
                                    extraProps.push("System.DRM.IsProtected");
                                    return storageFile.properties.retrievePropertiesAsync(extraProps).then(function retrievePropertiesAsync(extraPropsResult) {
                                            var isProtected = extraPropsResult.lookup("System.DRM.IsProtected");
                                            if (isProtected)
                                                protectionState = Playback.ProtectionState.drmProtected;
                                            else
                                                protectionState = Playback.ProtectionState.unprotected;
                                            Playback.Etw.traceString("PLST<-localPath protection state");
                                            return WinJS.Promise.wrap({
                                                    url: result.url, mediaInstanceId: result.mediaInstanceId, nativeLicenseRight: null, offerId: null, isLocal: true, trackingId: result.trackingId, protectionState: protectionState
                                                })
                                        })
                                })
                        }
                    else {
                        MS.Entertainment.Platform.Playback.assert(!!result, "Fix it: urlPromise in itemToUrl should not call into success handler with null or undefined result! Check corresponding urlPromise returning function behavior");
                        if (!result)
                            return WinJS.Promise.wrapError("itemToUrl: unexpected failure in urlPromise sucessful completion");
                        if (protectionState === Playback.ProtectionState.unknown)
                            if (result.url && result.url.toLowerCase().indexOf(".mp3") !== -1)
                                protectionState = Playback.ProtectionState.unprotected;
                            else
                                protectionState = Playback.ProtectionState.drmProtected;
                        return WinJS.Promise.wrap({
                                url: result.url, mediaInstanceId: result.mediaInstanceId, nativeLicenseRight: result.nativeLicenseRight, offerId: result.offerId, isLocal: false, trackingId: result.trackingId, protectionState: protectionState
                            })
                    }
                }, function urlPromiseError(error) {
                    Playback.Etw.traceString("PLST<-computeURLError");
                    return WinJS.Promise.wrapError(error)
                })
        }
        var getMediaEntitlementsPromise = function itemToUrl_getMediaEntitlements() {
                if (!item.canPlayLocally && (item.hasZuneId && item.mediaType === Queries.ObjectType.track))
                    return Microsoft.Entertainment.Marketplace.Marketplace.getMediaEntitlementsAsync([item.zuneId]).then(function itemToUrl_getMediaEntitlementsAsync_complete(result) {
                            mediaEntitlements = JSON.parse(result).result.entitlements[0];
                            return internalItemToUrl()
                        }, function itemToUrl_getMediaEntitlementsAsync_error() {
                            return internalItemToUrl()
                        });
                else
                    return internalItemToUrl()
            };
        var hydrationPromise = function itemToUrl_hydrate() {
                var shouldHydrate = (!item.hydrated || item.isFailed) && isNetworkAvailable();
                if (shouldHydrate && item.mediaType === Queries.ObjectType.track && preferredFile.type === Microsoft.Entertainment.Platform.FileUrlType.localFileUrl) {
                    Playback.Etw.traceString("PLST::itemToUrl_hydrate skipping hydrate for local track");
                    shouldHydrate = false
                }
                if (shouldHydrate) {
                    item = MS.Entertainment.ViewModels.MediaItemModel.augment(item);
                    return item.hydrate({forceUpdate: true}).then(getMediaEntitlementsPromise, getMediaEntitlementsPromise)
                }
                else
                    return getMediaEntitlementsPromise()
            };
        Playback.Etw.traceString("PLST->getPreferredFileUrlAsync");
        return provider.getPreferredFileUrlAsync(item.libraryId).then(function(result) {
                Playback.Etw.traceString("PLST<-getPreferredFileUrlAsync");
                preferredFile = result;
                return hydrationPromise()
            })
    }
    function createMediaInstance(itemData) {
        return Playback.MediaInstance.createInstanceAsync(itemData)
    }
    function queryPreviewRights(item, mediaType) {
        var queryDetailPromise = WinJS.Promise.wrap(null);
        if (!item.data.rights)
            queryDetailPromise = MS.Entertainment.Platform.PurchaseHelpers.queryMediaDetailForCacheItemAsync(item, mediaType);
        return queryDetailPromise.then(function queryMediaDetailForCacheItemAsync_complete(detail) {
                var rights = (detail && detail.result && detail.result.item) ? detail.result.item.rights : item.data.rights;
                var zuneId = (detail && detail.result && detail.result.zuneId) ? detail.result.item.zuneId : item.data.zuneId;
                if (!zuneId)
                    zuneId = (detail && detail.result && detail.result.serviceId) ? detail.result.item.serviceId : item.data.serviceId;
                var right;
                if (rights)
                    right = MS.Entertainment.Platform.PurchaseHelpers.getPreferredRight(rights, [MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.PreviewStream, MS.Entertainment.ViewModels.SmartBuyStateHandlers.MarketplaceRight.Preview]);
                if (right)
                    if (mediaType === Queries.ObjectType.video) {
                        right.previewUrl = right.videoFileUrl;
                        return WinJS.Promise.wrap(right)
                    }
                    else
                        return MS.Entertainment.Platform.PurchaseHelpers.getAssetLocationsAsync(zuneId, [right]).then(function getAssetLocationsAsync_complete(assetLocations) {
                                if (assetLocations.length === 0)
                                    return WinJS.Promise.wrapError("No PreviewStream or Preview license right found for " + ((item.data) ? item.data.name : item.name));
                                right.previewUrl = assetLocations[0].assetUrl;
                                return WinJS.Promise.wrap(right)
                            }, function getAssetLocations_error(error) {
                                if (!MS.Entertainment.isCanceled(error))
                                    return WinJS.Promise.wrapError("No PreviewStream or Preview license right found for " + item.data.name);
                                else
                                    return WinJS.Promise.wrapError(error)
                            });
                else
                    return WinJS.Promise.wrapError("No PreviewStream or Preview license right found for this item")
            })
    }
    var audioVideoInstanceFactory = function audioVideoInstanceFactory(item, ordinal, startPosition, mediaType, context) {
            var playPreviewOnly = false;
            if (item && item.data)
                playPreviewOnly = item.data.playPreviewOnly || false;
            function createPreviewMediaInstance() {
                if (item.data.hasCanonicalId && item.data.videoPreviewUrl)
                    return createMediaInstance({
                            source: item.data.videoPreviewUrl, isLocal: false, mediaInstanceId: null, nativeLicenseRight: null, offerId: null, cookie: ordinal, mediaItem: item, mediaType: mediaType, protectionState: Playback.ProtectionState.unprotected, startPosition: startPosition
                        });
                else
                    return queryPreviewRights(item, mediaType).then(function gotPreview(right) {
                            if (!right)
                                return null;
                            return createMediaInstance({
                                    source: right.previewUrl, isLocal: false, mediaInstanceId: right.mediaInstanceId, nativeLicenseRight: MS.Entertainment.Platform.PurchaseHelpers.LicenseRightMap.toNative(right.licenseRight), offerId: null, cookie: ordinal, mediaItem: item, mediaType: mediaType, protectionState: Playback.ProtectionState.unprotected, startPosition: startPosition
                                })
                        }, function gotNoPreview(error) {
                            if (!MS.Entertainment.isCanceled(error))
                                return WinJS.Promise.wrapError("Error, no playback options for this media: " + eNoPreview);
                            else
                                return WinJS.Promise.wrapError(error)
                        })
            }
            function handleErrorMediaInstance(error, context) {
                if (MS.Entertainment.isCanceled(error)) {
                    Playback.Etw.traceString("Playlist::handleErrorMediaInstance:  mediaInstance conversion canceled");
                    return WinJS.Promise.wrapError(error)
                }
                var playbackError = Playback.makePlaybackError(error, context);
                return createMediaInstance({
                        cookie: ordinal, error: playbackError, mediaItem: item, mediaType: mediaType
                    })
            }
            if (playPreviewOnly)
                return createPreviewMediaInstance();
            else if (item.data.inCollection)
                return itemToUrl(item.data, context).then(function foundInYourCollection(result) {
                        Playback.Etw.traceString("PLST<-itemToUrl");
                        return createMediaInstance({
                                source: result.url, mediaInstanceId: result.mediaInstanceId, nativeLicenseRight: result.nativeLicenseRight, offerId: result.offerId, isLocal: result.isLocal, cookie: ordinal, mediaItem: item, mediaType: mediaType, protectionState: result.protectionState, trackingId: result.trackingId, startPosition: startPosition
                            })
                    }, function notFoundInYourCollection(error) {
                        Playback.Etw.traceString("PLST<-itemToUrl error: " + error);
                        return handleErrorMediaInstance(error, "itemToUrl")
                    });
            else if (item.data.filePath && item.data.filePath !== String.empty)
                return createMediaInstance({
                        source: item.data.filePath, mediaInstanceId: null, nativeLicenseRight: null, offerId: null, isLocal: true, cookie: ordinal, mediaItem: item, mediaType: mediaType, protectionState: Playback.ProtectionState.unknown, startPosition: startPosition
                    });
            else if (item.data.fileItem)
                return createMediaInstance({
                        source: URL.createObjectURL(item.data.fileItem, {oneTimeOnly: true}), mediaInstanceId: null, nativeLicenseRight: null, offerId: null, isLocal: true, cookie: ordinal, mediaItem: item, mediaType: mediaType, protectionState: Playback.ProtectionState.unknown, startPosition: startPosition
                    });
            else {
                var getMediaEntitlementsPromise = (!item.data.hasZuneId || item.data.mediaType !== Queries.ObjectType.track) ? WinJS.Promise.wrap(null) : Microsoft.Entertainment.Marketplace.Marketplace.getMediaEntitlementsAsync([item.data.zuneId]).then(function audioVideoInstanceFactory_getMediaEntitlementsAsync_complete(result) {
                        return JSON.parse(result).result.entitlements[0]
                    }, function audioVideoInstanceFactory_getMediaEntitlementsAsync_error() {
                        return null
                    });
                return getMediaEntitlementsPromise.then(function audioVideoInstanceFactory_getMediaEntitlementsPromise_complete(mediaEntitlements) {
                        return getPreferredStream(item.data, context, mediaEntitlements).then(function gotStream(result) {
                                return createMediaInstance({
                                        source: result.url, mediaInstanceId: result.mediaInstanceId, nativeLicenseRight: result.nativeLicenseRight, offerId: result.offerId, trackingId: result.trackingId, isLocal: false, cookie: ordinal, mediaItem: item, mediaType: mediaType, protectionState: Playback.ProtectionState.drmProtected, startPosition: startPosition
                                    })
                            }, function noStreamForYou(error) {
                                Playback.Etw.traceString("PLST<-getPreferredStream error: " + error);
                                return handleErrorMediaInstance(error, "getPreferredStream")
                            })
                    }, function noStreamForYou(error) {
                        Playback.Etw.traceString("PLST<-getPreferredStream error: " + error);
                        return handleErrorMediaInstance(error, "getMediaEntitlementsPromise")
                    })
            }
        };
    var mediaInstanceFactory = {
            track: function mediaInstanceFactory_track(item, ordinal, startPosition, context) {
                var hydrateCompleted = function hydrateCompleted(error) {
                        if (MS.Entertainment.isCanceled(error)) {
                            Playback.Etw.traceString("mediaInstanceFactory::track:  hydration canceled");
                            return WinJS.Promise.wrapError(error)
                        }
                        if (item.data.inCollection || item.data.hasRights || !item.data.hasServiceId)
                            return audioVideoInstanceFactory(item, ordinal, startPosition, Queries.ObjectType.track, context);
                        else {
                            var q = new Query.Music.SongDetails;
                            q.id = item.data.serviceId;
                            q.idType = item.data.serviceIdType;
                            q.impressionGuid = item.data.impressionGuid;
                            return q.execute().then(function trackQueryCompleted(completedQuery) {
                                    return audioVideoInstanceFactory(completedQuery.result, ordinal, startPosition, Queries.ObjectType.track, context)
                                })
                        }
                    };
                return MS.Entertainment.ViewModels.MediaItemModel.hydrateLibraryInfoAsync(item.data).then(hydrateCompleted, hydrateCompleted)
            }, video: function mediaInstanceFactory_video(item, ordinal, startPosition, context) {
                    return audioVideoInstanceFactory(item, ordinal, startPosition, Queries.ObjectType.video, context)
                }, gameTrailer: function mediaInstanceFactory_gameTrailer(item, ordinal, startPosition, context) {
                    var uri = new Windows.Foundation.Uri(item.data.trailerUri);
                    if (uri.extension === ".asx") {
                        var query = new Query.asxQuery;
                        query.asxUrl = uri.rawUri;
                        return query.execute().then(function(q) {
                                if (q.result.asx.entry.length === 1 && q.result.asx.entry[0].ref.length === 1)
                                    return createMediaInstance({
                                            source: q.result.asx.entry[0].ref[0].href, isLocal: false, cookie: ordinal, mediaItem: item, mediaType: Queries.ObjectType.video, protectionState: Playback.ProtectionState.unprotected, startPosition: startPosition
                                        });
                                else
                                    return WinJS.Promise.wrapError("We only support single entry ASX files, no playlists, no rollover")
                            })
                    }
                    else
                        return WinJS.Promise.wrapError("Game trailers must be ASX files")
                }, playlistMediaItem: function mediaInstanceFactory_playlistMediaItem(item, ordinal, startPosition, context) {
                    var converterFn = null;
                    switch (item.data.mediaType) {
                        case Queries.ObjectType.track:
                            converterFn = this.track;
                            break;
                        case Queries.ObjectType.video:
                            converterFn = this.video;
                            break
                    }
                    if (converterFn)
                        return converterFn(item, ordinal, startPosition);
                    else
                        return WinJS.Promise.wrapError("No support for this mediaType yet - " + item.data.mediaType)
                }
        };
    var mediaItemExpansion = {
            album: function(data) {
                var q;
                if (data.inCollection && data.fromCollection) {
                    q = new Query.libraryTracks;
                    q.albumId = data.libraryId;
                    q.mediaAvailability = data._mediaAvailability;
                    q.sort = Microsoft.Entertainment.Queries.TracksSortBy.numberAscending;
                    return WinJS.Promise.wrap(q)
                }
                else {
                    q = new Query.Music.AlbumWithTracks;
                    if (data.hasCanonicalId) {
                        q.id = data.canonicalId;
                        q.idType = MS.Entertainment.Data.Query.edsIdType.canonical
                    }
                    else {
                        q.id = data.serviceId;
                        q.idType = data.serviceIdType
                    }
                    q.impressionGuid = data.impressionGuid;
                    return q.execute().then(function albumQueryCompleted(data) {
                            if (!data.result)
                                return WinJS.Promise.wrapError("query null results");
                            var tracks = data.result.item.tracks;
                            if (tracks)
                                return tracks.forEachAll(function(){}).then(function() {
                                        return tracks
                                    });
                            else
                                return tracks
                        })
                }
            }, artist: function(data) {
                    var q;
                    if (data.inCollection && data.fromCollection) {
                        q = new Query.libraryTracks;
                        q.artistId = data.libraryId;
                        q.mediaAvailability = data._mediaAvailability;
                        q.sort = Microsoft.Entertainment.Queries.TracksSortBy.artistAscendingAlbumReleaseYearDescendingNumberAscending;
                        return WinJS.Promise.wrap(q)
                    }
                    else {
                        q = new Query.Music.ArtistTopSongs;
                        if (data.hasCanonicalId) {
                            q.id = data.canonicalId;
                            q.idType = MS.Entertainment.Data.Query.edsIdType.canonical
                        }
                        else {
                            q.id = data.serviceId;
                            q.idType = data.serviceIdType
                        }
                        q.impressionGuid = data.impressionGuid;
                        return q.execute().then(function artistQueryCompleted(data) {
                                var tracks = data.result.items;
                                if (tracks)
                                    return tracks.forEachAll(function(){}, 0, 99).then(function() {
                                            return tracks
                                        });
                                else
                                    return tracks
                            })
                    }
                }, genre: function(data) {
                    if (data.inCollection) {
                        var q = new Query.libraryVideos;
                        q.genreId = data.libraryId;
                        return WinJS.Promise.wrap(q)
                    }
                    return null
                }, playlist: function(data) {
                    var q = new MS.Entertainment.Data.Query.libraryPlaylistMediaItems;
                    q.playlistId = data.libraryId;
                    q.mediaAvailability = data._mediaAvailability;
                    return WinJS.Promise.wrap(q)
                }
        };
    function expandMediaItem(mediaItem) {
        var converter;
        if ("mediaType" in mediaItem)
            converter = expanderByMediaType[mediaItem.mediaType];
        function setPlayPreviewForAll(tracks) {
            return tracks.forEachAll(function updateItem(trackItem) {
                    trackItem.item.data.playPreviewOnly = true
                }).then(function tracksMarkingCompleted() {
                    return tracks
                })
        }
        if (converter && converter in mediaItemExpansion) {
            Playback.Etw.traceString("PLST:mediaItemExpansion for " + converter + ": start");
            var convertPromise = mediaItemExpansion[converter](mediaItem);
            if (mediaItem.playPreviewOnly)
                return convertPromise.then(setPlayPreviewForAll);
            else
                return convertPromise
        }
        else if ("forEachAll" in mediaItem && mediaItem.playPreviewOnly)
            return setPlayPreviewForAll(mediaItem).then(function transfer_complete(arg) {
                    mediaItem.playPreviewOnly = false;
                    return arg
                });
        else
            return null
    }
    function mediaItemToMediaInstance(item, ordinal, startPosition, context) {
        var converter;
        if ("mediaType" in item.data)
            converter = converterByMediaType[item.data.mediaType];
        if (converter && converter in mediaInstanceFactory)
            return mediaInstanceFactory[converter](item, ordinal, startPosition, context);
        else
            return null
    }
    {};
    function convertToMediaInstance(item, ordinal, startPosition, context) {
        if (item === null || item === undefined)
            return WinJS.Promise.wrapError("null item accessed from collection - out of range access?");
        var Playback = MS.Entertainment.Platform.Playback;
        if ("source" in item.data) {
            var itemData = {};
            Object.keys(WinJS.Binding.expandProperties(item.data)).forEach(function(k) {
                itemData[k] = item.data[k]
            });
            itemData.startPosition = startPosition;
            itemData.cookie = ordinal;
            itemData.mediaItem = item;
            return createMediaInstance(itemData)
        }
        if (("mediaType" in item.data)) {
            var promise = mediaItemToMediaInstance(item, ordinal, startPosition, context);
            if (promise !== null)
                return promise;
            return WinJS.Promise.wrapError("unknown factory for mediaInstance conversion")
        }
        return WinJS.Promise.wrapError("unknown media type")
    }
    {};
    var ObservableDataSourceBase = WinJS.Binding.define({
            size: 0, orderVersion: 0, mediaCollection: null
        });
    var PlaylistSourceNotificationHandler = WinJS.Class.define(function(onSizeChanged, onOrderChanged) {
            this._onSizeChanged = onSizeChanged;
            this._onOrderChanged = onOrderChanged
        }, {
            _orderChangeCount: 0, _orderVersion: 0, _removeCount: 0, _sizeCount: 0, _newSize: 0, beginNotifications: function() {
                    this._orderChangeCount = 0;
                    this._removeCount = 0;
                    this._sizeCount = 0
                }, inserted: function(item, previousRequestID, nextRequestID){}, changed: function(newItem, oldItem){}, moved: function(requestID, previousRequestID, nextRequestID) {
                    this._orderChangeCount++
                }, removed: function(requestID, mirage) {
                    this._removeCount++
                }, countChanged: function(newCount, oldCount) {
                    if (newCount < oldCount)
                        this._removeCount++;
                    this._newSize = newCount;
                    this._sizeCount++
                }, indexChanged: function(requestID, newIndex, oldIndex) {
                    this._orderChangeCount++
                }, endNotifications: function() {
                    if (this._sizeCount || this._removeCount)
                        this._onSizeChanged(this._newSize);
                    if (this._orderChangeCount || this._removeCount) {
                        this._orderVersion++;
                        this._onOrderChanged(this._orderVersion)
                    }
                }, reload: function() {
                    return
                }
        });
    function FlatListAdaptor(adaptorOptions) {
        var options = adaptorOptions || {};
        var sources = [];
        var countPromise = new WinJS.Promise.wrap(0);
        var uniqueKey = 0;
        var notificationHandler = null;
        this.compareByIdentity = true;
        function errorNoLongerMeaningful() {
            var error = new WinJS.ErrorFromName(WinJS.UI.EditError.noLongerMeaningful);
            error.Name = error.name;
            return WinJS.Promise.wrapError(error)
        }
        function mapFlatIndex(i) {
            var x = 0;
            var source = null;
            for (var j = 0; j < sources.length; j++) {
                var entry = sources[j];
                if (i >= x && i < x + entry.size)
                    return {
                            source: entry, index: entry.start + i - x
                        };
                else
                    x += entry.size
            }
            return null
        }
        function currentSize()
        {
            var size = 0;
            for (var i = 0; i < sources.length; i++)
                size += sources[i].size;
            return size
        }
        function insertAtEnd(key, dataBlock) {
            if (key === null)
                key = (uniqueKey++).toString();
            var origin = null;
            var data = dataBlock;
            if (dataBlock && "sourceOrigin" in dataBlock) {
                origin = dataBlock.sourceOrigin;
                data = dataBlock.data
            }
            if (Array.isArray(data))
                return insertSourceAtEnd(key, new ArrayDataSource(data, {
                        compareByIdentity: true, keyOf: options.keyOf
                    }), origin, data.length);
            else if (isNaN(data) && "itemsFromIndex" in data && "getCount" in data)
                return insertSourceAtEnd(key, new MS.Entertainment.Utilities.VirtualizedDataSource(data), origin);
            else if (isNaN(data) && "createListBinding" in data)
                return insertSourceAtEnd(key, data, origin);
            else
                return insertItemAtEnd(key, data)
        }
        function remove(key) {
            try {
                var keyObject = JSON.parse(key)
            }
            catch(ex) {
                return errorNoLongerMeaningful()
            }
            var itemKey = keyObject.itemKey;
            var removePromise;
            if ("listKey" in keyObject) {
                if (typeof itemKey == "string")
                    itemKey = parseInt(keyObject.itemKey);
                removePromise = removeListItem(keyObject.listKey, itemKey)
            }
            else
                removePromise = removeTopItem(itemKey);
            return removePromise.then(function successful_removal() {
                    countPromise = countPromise.then(function(count) {
                        return WinJS.Promise.wrap(count - 1)
                    });
                    return removePromise
                })
        }
        function findTopEntryByItsKey(key) {
            for (var j = 0; j < sources.length; j++)
                if (sources[j].key === key)
                    return {
                            index: j, entry: sources[j]
                        };
            return null
        }
        function findEntryByListItemKey(listKey, itemKey) {
            for (var j = 0; j < sources.length; j++)
                if (sources[j].key === listKey && sources[j].start <= itemKey && (sources[j].start + sources[j].size > itemKey))
                    return {
                            index: j, entry: sources[j]
                        };
            return null
        }
        function findEntryByKey(key) {
            var keyObject = JSON.parse(key);
            var itemKey = keyObject.itemKey;
            if ("listKey" in keyObject) {
                if (typeof itemKey == "string")
                    itemKey = parseInt(keyObject.itemKey);
                return findEntryByListItemKey(keyObject.listKey, itemKey)
            }
            else
                return findTopEntryByItsKey(itemKey)
        }
        function pullOutItem(key) {
            var keyObject = JSON.parse(key);
            var itemKey = keyObject.itemKey;
            if ("listKey" in keyObject) {
                if (typeof itemKey == "string")
                    itemKey = parseInt(keyObject.itemKey);
                return pullOutListElement(findEntryByListItemKey(keyObject.listKey, itemKey), itemKey)
            }
            else
                return pullOutTopElement(findTopEntryByItsKey(itemKey))
        }
        function pullOutTopElement(itemSource) {
            if (itemSource === null)
                return null;
            var entry = itemSource.entry;
            sources.splice(itemSource.index, 1);
            return entry
        }
        function pullOutListElement(itemSource, itemKey) {
            if (itemSource === null)
                return null;
            var entry = itemSource.entry;
            var extracted = {
                    origin: entry.origin, source: entry.source, key: entry.key, start: itemKey, size: 1, isItem: false
                };
            var x = itemSource.index;
            if (itemKey === entry.start) {
                sources[x].start++;
                sources[x].size--;
                if (sources[x].size === 0)
                    sources.splice(x, 1)
            }
            else {
                var size = entry.size;
                var start = entry.start;
                sources[x].size = itemKey - start;
                if (itemKey - start < size - 1)
                    sources.splice(x + 1, 0, {
                        origin: entry.origin, source: entry.source, key: entry.key, start: itemKey + 1, size: size - (itemKey - start + 1), isItem: false
                    })
            }
            return extracted
        }
        function removeTopItem(key) {
            var itemSource = findTopEntryByItsKey(key);
            if (itemSource === null || !itemSource.entry.isItem || itemSource.entry.size !== 1)
                return WinJS.Promise.wrapError("remove error: invalid key");
            pullOutTopElement(itemSource);
            return WinJS.Promise.as()
        }
        function removeListItem(listKey, itemKey) {
            var itemSource = findEntryByListItemKey(listKey, itemKey);
            if (itemSource === null)
                return WinJS.Promise.wrapError("remove error: invalid key");
            pullOutListElement(itemSource, itemKey);
            return WinJS.Promise.as()
        }
        function lastKeyInEntry(entry) {
            if (entry.isItem)
                return entry.key;
            return subItemKey(entry.key, entry.start + entry.size - 1)
        }
        function firstKeyInEntry(entry) {
            if (entry.isItem)
                return entry.key;
            return subItemKey(entry.key, entry.start)
        }
        function promiseForFirstItemInEntry(entry) {
            if (entry.isItem)
                return WinJS.Promise.wrap({
                        key: JSON.stringify({itemKey: entry.key}), data: entry.source
                    });
            else {
                var item = {key: subItemKey(entry.key, entry.start)};
                return entry.source.fromIndex(entry.start).then(function(value) {
                        item.data = value.data;
                        return item
                    })
            }
        }
        function insertEntryAtKey(entry, before, targetKey) {
            var targetSource = findEntryByKey(targetKey);
            var x = targetSource.index;
            var previousKey = null;
            var nextKey = null;
            if (targetSource == null)
                throw"Datasource move error: target key is not is not in collection";
            if (targetSource.entry.size === 1) {
                if (x > 0)
                    previousKey = lastKeyInEntry(before ? sources[x - 1] : entry);
                if (x < entry.start + entry.size - 1)
                    nextKey = firstKeyInEntry(before ? entry : sources[x + 1]);
                sources.splice(before ? targetSource.index : targetSource.index + 1, 0, entry);
                return promiseForFirstItemInEntry(entry).then(function(value) {
                        return {
                                item: value, previousKey: previousKey, nextKey: nextKey
                            }
                    })
            }
            else
                return splitInsertAtTarget(entry, before, targetKey, targetSource)
        }
        function insertEntryAtEnd(entry, atStart) {
            var previousKey = null;
            var nextKey = null;
            if (atStart)
                nextKey = firstKeyInEntry(sources[0]);
            else
                previousKey = lastKeyInEntry(sources[sources.length - 1]);
            sources.splice(atStart ? 0 : sources.length, 0, entry);
            return promiseForFirstItemInEntry(entry).then(function(value) {
                    return {
                            item: value, previousKey: previousKey, nextKey: nextKey
                        }
                })
        }
        function splitInsertAtTarget(sourceEntry, before, targetKey, targetSource) {
            var itemKey = parseInt(JSON.parse(targetKey).itemKey);
            var entry = targetSource.entry;
            var x = targetSource.index;
            var previousKey = null;
            var nextKey = null;
            if (before && itemKey === entry.start) {
                nextKey = firstKeyInEntry(targetSource.entry);
                if (x > 0)
                    previousKey = lastKeyInEntry(sources[x - 1]);
                sources.splice(x, 0, entry);
                return promiseForFirstItemInEntry(sourceEntry).then(function(value) {
                        return {
                                item: value, previousKey: previousKey, nextKey: nextKey
                            }
                    })
            }
            if (!before && itemKey === entry.start + entry.size - 1) {
                previousKey = lastKeyInEntry(entry);
                if (x < sources.length - 1)
                    nextKey = fistKeyInEntry(sources[x + 1]);
                sources.splice(x + 1, 0, entry);
                return promiseForFirstItemInEntry(sourceEntry).then(function(value) {
                        return {
                                item: value, previousKey: previousKey, nextKey: nextKey
                            }
                    })
            }
            var leftSplit = {
                    origin: entry.origin, source: entry.source, key: entry.key, start: entry.start, size: before ? itemKey - entry.start : itemKey - entry.start + 1, isItem: false
                };
            var rightSplit = {
                    origin: entry.origin, source: entry.source, key: entry.key, start: leftSplit.start + leftSplit.size, size: entry.size - leftSplit.size, isItem: false
                };
            previousKey = lastKeyInEntry(leftSplit);
            nextKey = firstKeyInEntry(rightSplit);
            sources.splice(x, 1, leftSplit, sourceEntry, rightSplit);
            return promiseForFirstItemInEntry(sourceEntry).then(function(value) {
                    return {
                            item: value, previousKey: previousKey, nextKey: nextKey
                        }
                })
        }
        function moveToPosition(key, before, targetKey) {
            try {
                var itemSource = pullOutItem(key);
                if (itemSource === null)
                    return WinJS.Promise.wrapError("Datasource move error: source key is not in collection");
                return insertEntryAtKey(itemSource, before, targetKey).then(function moveDone(moveResult) {
                        return moveResult.item
                    })
            }
            catch(e) {
                return errorNoLongerMeaningful()
            }
        }
        function moveToEnd(key, atStart) {
            try {
                var itemSource = pullOutItem(key);
                if (itemSource === null)
                    return WinJS.Promise.wrapError("Datasource move error: source key is not in collection");
                return insertEntryAtEnd(itemSource, atStart).then(function(moveResult) {
                        return moveResult.item
                    })
            }
            catch(e) {
                return errorNoLongerMeaningful()
            }
        }
        function insertItemAtEnd(key, data) {
            if (data === null || data === undefined)
                return WinJS.Promise.wrapError("Attempt to append null or undefined item rejected");
            var newIndex = currentSize();
            var lastEntry = sources.length > 0 ? sources[sources.length - 1] : null;
            var entry = {
                    source: data, key: key, start: 0, size: 1, isItem: true, origin: null
                };
            sources.push(entry);
            countPromise = countPromise.then(function(c) {
                return WinJS.Promise.wrap(c + 1)
            });
            if (notificationHandler)
                if (lastEntry === null || lastEntry.size <= 0)
                    notificationHandler.inserted({
                        key: key, data: data
                    }, null, null, 0);
                else if (lastEntry.isItem)
                    notificationHandler.inserted({
                        key: key, data: data
                    }, lastEntry.key, null, newIndex);
                else
                    lastEntry.source.fromIndex(lastEntry.size - 1).then(function(e) {
                        notificationHandler.inserted({
                            key: key, data: data
                        }, subItemKey(lastEntry.key, e.key), null, newIndex)
                    });
            return WinJS.Promise.wrap({
                    key: key, data: data, insertCount: newIndex + 1
                })
        }
        function insertSourceAtEnd(key, data, origin, knownCount) {
            var list = data.createListBinding();
            var getCount = isNaN(knownCount) ? data.getCount() : WinJS.Promise.as(knownCount);
            return getCount.then(function(c) {
                    if (c === 0)
                        return WinJS.Promise.as();
                    var entry = {
                            origin: origin, source: list, key: key, start: 0, size: c, isItem: false
                        };
                    sources.push(entry);
                    countPromise = countPromise.then(function(count) {
                        return WinJS.Promise.wrap(count + c)
                    });
                    if (notificationHandler)
                        notificationHandler.invalidateAll();
                    return {
                            key: key, data: data, insertCount: c
                        }
                })
        }
        function subItemKey(listKey, elementKey)
        {
            elementKey = elementKey.toString();
            return JSON.stringify({
                    listKey: listKey, itemKey: elementKey
                })
        }
        function itemsFromIndex(index, countBefore, countAfter) {
            if (index === undefined) {
                index = 0;
                countBefore = 0
            }
            var items = [],
                first = index - countBefore,
                last = index + countAfter,
                offset = countBefore;
            for (var i = first; i <= last; i++) {
                var indexMap = mapFlatIndex(i);
                if (indexMap === null)
                    if (items.length === 0 && first < last) {
                        offset--;
                        continue
                    }
                    else
                        break;
                if (indexMap.source.isItem)
                    items.push(WinJS.Promise.wrap({
                        key: JSON.stringify({itemKey: indexMap.source.key}), data: indexMap.source.source
                    }));
                else {
                    var listKeyPromise = WinJS.Promise.wrap(indexMap.source.key);
                    items.push(WinJS.Promise.join([indexMap.source.source.fromIndex(indexMap.index), listKeyPromise]).then(function(arg) {
                        return WinJS.Promise.wrap({
                                key: subItemKey(arg[1], arg[0].key), data: arg[0].data
                            })
                    }))
                }
            }
            if (items.length === 0)
                return countPromise.then(function(c) {
                        return WinJS.Promise.wrap({
                                items: [], offset: offset, totalCount: c, absoluteIndex: index
                            })
                    });
            else
                return WinJS.Promise.join(items).then(function(i) {
                        return countPromise.then(function(c) {
                                return WinJS.Promise.wrap({
                                        items: i, offset: offset, totalCount: c, absoluteIndex: index
                                    })
                            })
                    })
        }
        this.remove = remove;
        this.moveToStart = function(key) {
            return moveToEnd(key, true)
        };
        this.moveToEnd = function(key) {
            return moveToEnd(key, false)
        };
        this.moveBefore = function(key, nextKey) {
            return moveToPosition(key, true, nextKey)
        };
        this.moveAfter = function(key, previousKey) {
            return moveToPosition(key, false, previousKey)
        };
        this.itemsFromIndex = itemsFromIndex;
        this.insertAtEnd = function FlatListAdaptor_insertAtEnd(key, data) {
            return insertAtEnd(key, data)
        };
        this.getCount = function FlatListAdaptor_getCount() {
            return countPromise
        };
        this.setNotificationHandler = function FlatListAdaptor_setNotificationHandler(handler) {
            notificationHandler = handler
        }
    }
    WinJS.Namespace.define(playlistNamespace, {AccessSerializer: function AccessSerializer() {
            var waitingList = [];
            this.enter = function(serializedPromise) {
                var synchronous = false;
                var promise = WinJS.Promise.join(waitingList).then(function processNext() {
                        return serializedPromise().then(function synchronous(arg) {
                                synchronous = true;
                                return arg
                            })
                    }).then(function cleanupQueue(arg) {
                        if (!synchronous)
                            waitingList.shift();
                        return arg
                    });
                if (!synchronous)
                    waitingList.push(promise);
                return promise
            }
        }});
    function CompoundDataSource() {
        var adaptor = new FlatListAdaptor;
        CompoundDataSource.prototype.constructor = CompoundDataSource;
        Object.getPrototypeOf(new MS.Entertainment.Utilities.VirtualizedDataSource(new FlatListAdaptor))._baseDataSourceConstructor.call(this, adaptor);
        var that = this;
        this._lock = new MS.Entertainment.Platform.Playback.Playlist.AccessSerializer;
        this.insertAtEnd = function CompoundDataSource_insertAtEnd(key, data) {
            this.beginEdits();
            var promise = adaptor.insertAtEnd(key, data);
            this.endEdits();
            this.invalidateAll();
            return promise
        };
        function implemented() {
            var listOfMethods = arguments;
            for (var i = 0; i < arguments.length; i++)
                (function define_implemented_method() {
                    var method = listOfMethods[i];
                    var _super = that[method];
                    that[method] = function() {
                        var opArguments = arguments;
                        return this._lock.enter(function doEdit() {
                                try {
                                    return _super.apply(that, opArguments)
                                }
                                catch(e) {
                                    var args = "(" + arguments[0];
                                    for (j = 1; j < arguments.length; j++)
                                        args += ", " + arguments[j];
                                    args += ")";
                                    return WinJS.Promise.wrapError(e + "in " + method + args + ". Invalid key in arguments")
                                }
                            })
                    }
                })();
            {}
        }
        implemented("remove", "moveToStart", "moveToEnd", "moveBefore", "moveAfter")
    }
    CompoundDataSource.prototype = Object.create(WinJS.Utilities.eventMixin);
    function PlaylistMediaCollection() {
        CompoundDataSource.call(this);
        PlaylistMediaCollection.prototype.constructor = PlaylistMediaCollection;
        var _insertAtEnd = this.insertAtEnd;
        this.insertAtEnd = function PlaylistMediaCollection_insertAtEnd(key, data) {
            var that = this;
            function isListAdapter(data) {
                return isNaN(data) && "itemsFromIndex" in data && "getCount" in data
            }
            function interpretData(data) {
                var item = WinJS.Promise.wrap(data);
                var expandedItem = null;
                MS.Entertainment.Platform.Playback.Etw.tracePlaylistInterpretingData();
                if ("mediaType" in data || isListAdapter(data)) {
                    expandedItem = expandMediaItem(data);
                    if (expandedItem !== null)
                        item = expandedItem
                }
                return item.then(function(data) {
                        if (expandedItem)
                            Playback.Etw.traceString("item expanded");
                        if (MS.Entertainment.Data.MainQuery.isQuery(data)) {
                            var traceHeader = "interpretData: queryExecute ";
                            Playback.Etw.traceString(traceHeader + "start");
                            return data.execute().then(function querySuccess(q) {
                                    Playback.Etw.traceString(traceHeader + "done");
                                    return WinJS.Promise.wrap({
                                            sourceOrigin: q, data: q.result.items
                                        })
                                })
                        }
                        else
                            return WinJS.Promise.wrap(data)
                    })
            }
            return this._lock.enter(function expandAndAppend() {
                    return interpretData(data).then(function interpretDataCompleted(interpretedData) {
                            Playback.Etw.traceString("playlist item interpreted");
                            return _insertAtEnd.call(that, key, interpretedData)
                        }, function interpretedDataFailed(error) {
                            Playback.Etw.traceString("playlist item interpret failed. error: " + error);
                            return WinJS.Promise.wrapError(error)
                        })
                })
        }
    }
    PlaylistMediaCollection.prototype = Object.create(WinJS.Utilities.eventMixin);
    var PlaylistDataSource = WinJS.Class.derive(ObservableDataSourceBase, function(datasource, completePromise, knownCount) {
            ObservableDataSourceBase.prototype.constructor.call(this, {
                size: 0, orderVersion: 0, mediaCollection: datasource
            });
            var that = this;
            this._activationPromise = null;
            this._activationOrdinal = null;
            var getCount = isNaN(knownCount) ? this.mediaCollection.getCount() : WinJS.Promise.as(knownCount);
            getCount.then(function(sz) {
                that.updateProperty("size", sz).then(function(v) {
                    completePromise(sz)
                })
            });
            this._listBinding = this.mediaCollection.createListBinding(new PlaylistSourceNotificationHandler(function onSizeChanged(sz) {
                that.size = sz
            }, function onOrderChanged(v) {
                that.orderVersion = v
            }))
        }, {
            itemAt: function itemAt(ordinal) {
                if (ordinal === null)
                    return WinJS.Promise.as();
                var itemPromise = this._listBinding.fromIndex(ordinal);
                itemPromise.retain();
                return itemPromise
            }, getPlaybackMedia: function getPlaybackMedia(ordinal, startPosition, context, resetPreviewFlag) {
                    if (ordinal === undefined || ordinal === null || isNaN(ordinal))
                        return WinJS.Promise.as();
                    return this.itemAt(ordinal).then(function(v) {
                            if (resetPreviewFlag)
                                v.data.playPreviewOnly = false;
                            return convertToMediaInstance(v, ordinal, startPosition, context)
                        })
                }, ordinalOf: function ordinalOf(media) {
                    return media != null ? media.cookie : null
                }
        });
    WinJS.Namespace.define(playlistNamespace, {ListSequencer: WinJS.Class.define(function(){}, {
            _size: null, setSize: function setSize(s) {
                    this._size = s
                }, repeat: false, initialize: function initialize(ds) {
                    this.setSize(ds ? ds.size : null)
                }, first: 0, before: function before(ordinal) {
                    if (ordinal === null || ordinal === undefined)
                        return null;
                    return (ordinal === this.first) ? (this.repeat ? this._size - 1 : null) : --ordinal
                }, after: function after(ordinal) {
                    if (ordinal === null || ordinal === undefined)
                        return null;
                    return (ordinal < this._size - 1) ? ++ordinal : (this.repeat ? this.first : null)
                }, jump: function jumpTo(from, to){}
        })});
    WinJS.Namespace.define(playlistNamespace, {IncrementalShuffleGenerator: WinJS.Class.define(function(n) {
            this._size = n;
            this._spanStart = [0];
            this._spanLength = [n];
            if (arguments.length === 2 && arguments[1] !== null)
                this.remove(arguments[1])
        }, {
            _size: 0, _rand: function IncrementalShuffleGenerator__rand() {
                    return Math.floor(Math.random() * this._size)
                }, _spanStart: [], _spanLength: [], generate: function IncrementalShuffleGenerator_generate() {
                    var k = this._rand();
                    for (var i = 0; i < this._spanStart.length; i++) {
                        var start = this._spanStart[i];
                        var length = this._spanLength[i];
                        if (k < length) {
                            var g = start + k;
                            this._markSpan(i, g, start, length);
                            return g
                        }
                        k -= length
                    }
                    return null
                }, remove: function IncrementalShuffleGenerator_remove(ordinal) {
                    for (var i = 0; i < this._spanStart.length; i++) {
                        var start = this._spanStart[i];
                        var length = this._spanLength[i];
                        if (ordinal >= start && ordinal < start + length) {
                            this._markSpan(i, ordinal, start, length);
                            return
                        }
                    }
                }, _markSpan: function IncrementalShuffleGenerator__markSpan(i, g, start, length) {
                    if (g === start)
                        if (--length === 0) {
                            this._spanStart.splice(i, 1);
                            this._spanLength.splice(i, 1)
                        }
                        else {
                            this._spanStart[i] = start + 1;
                            this._spanLength[i] = length
                        }
                    else if (g === (start + length - 1))
                        this._spanLength[i] = length - 1;
                    else {
                        this._spanStart.splice(i, 1, start, g + 1);
                        this._spanLength.splice(i, 1, g - start, length - (g - start) - 1)
                    }
                    this._size--;
                    return
                }
        })});
    WinJS.Namespace.define(playlistNamespace, {QuantumShuffleSequencer: WinJS.Class.define(function(){}, {
            _shuffler: null, _order: null, _size: null, setSize: function setSize(s, n) {
                    this._size = s;
                    this._shuffler = new mySpace.IncrementalShuffleGenerator(s, n);
                    this.first = n
                }, repeat: false, initialize: function initialize(ds, n) {
                    this.setSize(ds ? ds.size : 0, n);
                    this._before = {};
                    this._after = {};
                    if (n !== null)
                        this._before[this.first] = null
                }, first: 0, jump: function jumpTo(from, to) {
                    if (from === null) {
                        this.first = to;
                        this._before[this.first] = null;
                        this._shuffler.remove(to);
                        return
                    }
                }, before: function before(ordinal) {
                    var b = this._before[ordinal];
                    if (b === null)
                        return this._rolloverBackward(ordinal);
                    if (b === undefined) {
                        this._shuffler.remove(ordinal);
                        b = this._shuffler.generate();
                        if (b == null) {
                            var t = this.first;
                            while (this._after[t] != null)
                                t = this._after[t];
                            b = t
                        }
                        this._before[ordinal] = b;
                        this._after[b] = ordinal
                    }
                    return b
                }, after: function after(ordinal) {
                    var a = this._after[ordinal];
                    if (a === null)
                        return this._rolloverForward(ordinal);
                    if (a === undefined) {
                        this._shuffler.remove(ordinal);
                        a = this._shuffler.generate();
                        if (a == null)
                            if (this._last == null) {
                                this._last = ordinal;
                                this._after[ordinal] = null;
                                return this._rolloverForward(ordinal)
                            }
                            else {
                                var t = this._last;
                                while (this._before[t] != null)
                                    t = this._before[t];
                                a = t
                            }
                        this._after[ordinal] = a;
                        this._before[a] = ordinal
                    }
                    return a
                }, _rolloverForward: function _rolloverForward(ordinal) {
                    return this.repeat ? this.first : null
                }, _rolloverBackward: function _rolloverBackward(ordinal) {
                    if (this.repeat) {
                        if (this._last === undefined) {
                            this._last = this._shuffler.generate();
                            this._after[this._last] = null
                        }
                        return this._last
                    }
                    else
                        return null
                }
        })});
    function createPlaylistDataSource(arg, promise) {
        var playlistDataSource = new PlaylistMediaCollection;
        return playlistDataSource.insertAtEnd(null, arg).then(function(insertResult) {
                return WinJS.Promise.wrap(new PlaylistDataSource(playlistDataSource, promise, !insertResult ? insertResult : insertResult.insertCount))
            })
    }
    function makeEmptyPromise() {
        var completePromise;
        var newPromise = new WinJS.Promise(function(c, e, p) {
                completePromise = c
            });
        return {
                completePromise: completePromise, promise: newPromise
            }
    }
    function findOrdinal(core, startingOrdinal, nowPlayingKey) {
        var datasource = core._dataSource;
        var list = datasource.mediaCollection.createListBinding();
        var size = datasource.size;
        return list.fromIndex(startingOrdinal).then(function findOrdinal_current(mediaItem) {
                if (mediaItem === null)
                    return -1;
                if (mediaItem.key === nowPlayingKey)
                    return null;
                var neighborPromises = [];
                var candidateIndices = [startingOrdinal - 1, startingOrdinal + 1, 0, size - 1];
                neighborPromises.push(startingOrdinal > 0 ? list.fromIndex(startingOrdinal - 1) : WinJS.Promise.wrap(null));
                neighborPromises.push(startingOrdinal < size - 1 ? list.fromIndex(startingOrdinal + 1) : WinJS.Promise.wrap(null));
                neighborPromises.push(list.fromIndex(0));
                neighborPromises.push(list.fromIndex(size - 1));
                return WinJS.Promise.join(neighborPromises).then(function findOrdinal_heuristic1(neighbor) {
                        for (var i = 0; i < neighbor.length; i++)
                            if (neighbor[i] !== null && neighbor[i].key === nowPlayingKey) {
                                list.release();
                                return candidateIndices[i]
                            }
                        list.release();
                        return startingOrdinal
                    })
            })
    }
    function expandingSearch(core, startingOrdinal, fCompare, maxDistance) {
        var datasource = core._dataSource;
        var list = datasource.mediaCollection.createListBinding();
        var size = datasource.size;
        MS.Entertainment.Platform.Playback.Etw.traceString("PLST:expandingSearch start@" + startingOrdinal);
        function internalExpandingSearch(distance) {
            function pairSearch() {
                function found(i) {
                    return list.fromIndex(i).then(function got_list_element(mediaItemEntry) {
                            return fCompare.call(mediaItemEntry) ? i : null
                        })
                }
                var search = [];
                var forwardIndex = startingOrdinal + distance;
                if (forwardIndex < size)
                    search.push(found(forwardIndex));
                if (distance !== 0) {
                    var backwardIndex = startingOrdinal - distance;
                    if (backwardIndex >= 0)
                        search.push(found(backwardIndex))
                }
                return WinJS.Promise.join(search).then(function pair_evaluated(searchResult) {
                        switch (searchResult.length) {
                            case 0:
                                return undefined;
                            case 1:
                                return searchResult[0];
                            case 2:
                                return (searchResult[0] !== null) ? searchResult[0] : searchResult[1];
                            default:
                                return null
                        }
                    })
            }
            return pairSearch().then(function next_pair(foundOrdinal) {
                    if (foundOrdinal === undefined) {
                        MS.Entertainment.Platform.Playback.Etw.traceString("PLST:expandingSearch: No match in a whole list (" + distance + ")");
                        return null
                    }
                    if (foundOrdinal !== null) {
                        MS.Entertainment.Platform.Playback.Etw.traceString("PLST:expandingSearch: match found at distance = " + distance);
                        return foundOrdinal
                    }
                    if (maxDistance === undefined || distance < maxDistance)
                        return WinJS.Promise.timeout().then(internalExpandingSearch.bind(this, distance + 1));
                    else {
                        MS.Entertainment.Platform.Playback.Etw.traceString("PLST:expandingSearch: no match at max distance " + distance);
                        return null
                    }
                })
        }
        function cleanup(arg) {
            list.release;
            return arg
        }
        return internalExpandingSearch(0).then(cleanup, cleanup)
    }
    WinJS.Namespace.define(playlistNamespace, {PlaylistCore: WinJS.Class.derive(MS.Entertainment.UI.Framework.ObservableBase, function(element, options) {
            this._listSequencer = new mySpace.ListSequencer;
            this._sequenceGenerator = this._listSequencer;
            this.setOptions(options);
            var that = this;
            this.bind("shuffle", function(v) {
                that.onSetShuffleMode(v)
            });
            this.bind("repeat", function(v) {
                that.onSetRepeatMode(v)
            })
        }, {
            _dataSource: null, _playbackControlEventHandlers: null, _currentMediaKey: null, currentOrdinal: MS.Entertainment.UI.Framework.observableProperty("currentOrdinal", null), currentMedia: MS.Entertainment.UI.Framework.observableProperty("currentMedia", null), canSkipBackward: MS.Entertainment.UI.Framework.observableProperty("canSkipBackward", false), canSkipForward: MS.Entertainment.UI.Framework.observableProperty("canSkipForward", false), shuffle: MS.Entertainment.UI.Framework.observableProperty("shuffle", false), repeat: MS.Entertainment.UI.Framework.observableProperty("repeat", false), smartDJSeed: MS.Entertainment.UI.Framework.observableProperty("smartDJSeed", null), mediaCollection: MS.Entertainment.UI.Framework.observableProperty("mediaCollection", null), setDataSource: function PlaylistCore_setDataSource(value) {
                    MS.Entertainment.Platform.Playback.Etw.tracePlaylistSetDataSourceBegin();
                    var that = this;
                    var datasource = this._dataSource;
                    if (this._readyToSetDataSource)
                        this._readyToSetDataSource.cancel();
                    var createPromise = makeEmptyPromise();
                    that._dataSourceSetPromise = makeEmptyPromise();
                    var readyToSetDataSource = createPlaylistDataSource(value, createPromise.completePromise).then(function(newDataSource) {
                            if (datasource) {
                                if (datasource._activationPromise)
                                    datasource._activationPromise.cancel();
                                if (datasource._nextActivationPromise)
                                    datasource._nextActivationPromise.cancel();
                                datasource.unbind("size");
                                datasource.unbind("orderVersion");
                                datasource.unbind("mediaCollection")
                            }
                            that._setMedia(null, null);
                            that._dataSource = newDataSource;
                            WinJS.Binding.bind(that._dataSource, {
                                size: function(v) {
                                    MS.Entertainment.Platform.Playback.Etw.traceString("PLST::binding: new size: " + v);
                                    that._onSizeChanged(v);
                                    that._dataSourceSetPromise.completePromise(v)
                                }, orderVersion: function(v) {
                                        if (v > 1)
                                            that._onOrderChanged()
                                    }, mediaCollection: function(v) {
                                        that.updateAndNotify("currentOrdinal", null).then(function() {
                                            that.updateAndNotify("mediaCollection", v)
                                        })
                                    }
                            });
                            return WinJS.Promise.join([that._dataSourceSetPromise.promise, createPromise.promise]).then(function() {
                                    MS.Entertainment.Platform.Playback.Etw.tracePlaylistSetDataSourceEnd();
                                    that.onSetShuffleMode(that.shuffle);
                                    return newDataSource ? WinJS.Promise.wrap(WinJS.Binding.unwrap(newDataSource.mediaCollection)) : WinJS.Promise.as()
                                })
                        }, function handleError(error) {
                            if (datasource) {
                                datasource.unbind("size");
                                datasource.unbind("orderVersion");
                                datasource.unbind("mediaCollection")
                            }
                            that._setMedia(null, null);
                            that._dataSource = null
                        });
                    function markDataSourcePromiseCompleted() {
                        that._readyToSetDataSource = null;
                        return readyToSetDataSource
                    }
                    {};
                    this._readyToSetDataSource = readyToSetDataSource;
                    return readyToSetDataSource.then(markDataSourcePromiseCompleted, markDataSourcePromiseCompleted)
                }, _dataSourceSetPromise: makeEmptyPromise(), _readyToSetDataSource: null, _lock: new MS.Entertainment.Platform.Playback.Playlist.AccessSerializer, insertAtEnd: function PlayListCore_insertAt(key, data) {
                    var that = this;
                    return this._lock.enter(function serializedInsert() {
                            if (!that._dataSource)
                                return that.setDataSource(data);
                            var insert = that._dataSource.mediaCollection.insertAtEnd(key, data);
                            return WinJS.Promise.join([insert, that._dataSourceSetPromise.promise]).then(function(joinArray) {
                                    MS.Entertainment.Platform.Playback.Etw.traceString("Playlist top  level insertAtEnd: completed");
                                    return WinJS.Promise.wrap(joinArray[0])
                                })
                        })
                }, _options: null, setOptions: function PlaylistCore_setOptions(options) {
                    if (!options)
                        return;
                    this._options = options;
                    if (this._options.hasOwnProperty("src"))
                        if (this._options.src.hasOwnProperty("winControl"))
                            this.setDataSource(this._options.src.winControl);
                        else
                            this.setDataSource(this._options.src);
                    if (this._options.hasOwnProperty("player"))
                        if (this._options.player.hasOwnProperty("winControl"))
                            this.setPlaybackControl(this._options.player.winControl);
                        else
                            this.setPlaybackControl(this._options.player)
                }, _playbackControl: null, _currentMediaInstance: null, _prerollOrdinal: null, _userActionOrdinal: null, _activationPromise: null, _savePlaylistInProgressPromise: {}, _onPrerollCallback: function PlaylistCore_onPrerollCallback(newValue, oldValue) {
                    if (!oldValue && newValue && this._dataSource)
                        this._setNext(this._dataSource)
                }, _setCurrentOrdinal: function PlaylistCore_setCurrentOrdinal(ordinal) {
                    this.currentOrdinal = ordinal;
                    this._prerollOrdinal = ordinal
                }, _computeNextToPreroll: function PlaylistCore_computeNextToPreroll() {
                    if (this._prerollOrdinal === null && this.currentOrdinal != null)
                        this._prerollOrdinal = this.currentOrdinal;
                    if (this._prerollOrdinal !== null)
                        this._prerollOrdinal = this.after(this._prerollOrdinal);
                    this._updateCommandStatus();
                    return this._prerollOrdinal
                }, _onCurrentItemCallback: function PlaylistCore_onCurrentItemCallback(v) {
                    this._currentMediaInstance = v;
                    if (v && this._dataSource) {
                        var i = this._dataSource.ordinalOf(v);
                        var list = this._dataSource.mediaCollection.createListBinding();
                        this._setCurrentOrdinal(i);
                        list.fromIndex(i).then(function got_media_item(v) {
                            if (!v) {
                                this._setMedia(null, null);
                                this._currentMediaKey = null
                            }
                            else {
                                this.currentMedia = v.data;
                                this._currentMediaKey = v.key
                            }
                            list.release()
                        }.bind(this))
                    }
                    else
                        this._setCurrentOrdinal(null);
                    this._updateCommandStatus()
                }, itemAt: function PlaylistCore_itemAt(datasource, ordinal) {
                    return datasource ? datasource.itemAt(ordinal) : WinJS.Promise.as()
                }, setPlaybackControl: function PlaylistCore_setPlaybackControl(value) {
                    if (this._playbackControlEventHandlers != null) {
                        this._playbackControlEventHandlers.cancel();
                        this._playbackControlEventHandlers = null
                    }
                    this._playbackControl = value;
                    this._playbackControlEventHandlers = MS.Entertainment.Utilities.addEvents(this._playbackControl, {
                        currentMediaChanged: function(v) {
                            this._onCurrentItemCallback(v.detail.newValue)
                        }.bind(this), readyForNextMediaChanged: function(e) {
                                this._onPrerollCallback(e.detail.newValue, e.detail.oldValue)
                            }.bind(this)
                    })
                }, _setMediaByIndex: function PlaylistCore__setMediaByIndex(ordinal, startPosition, resetPreviewFlag) {
                    var datasource = this._dataSource;
                    this._userActionOrdinal = ordinal;
                    this._prerollOrdinal = ordinal;
                    this._sequenceGenerator.jump(this.currentOrdinal, ordinal);
                    Playback.Etw.traceString("PLST->getPlaybackMedia");
                    if (datasource._activationPromise)
                        if (datasource._activationOrdinal == ordinal)
                            return;
                        else
                            datasource._activationPromise.cancel();
                    datasource._activationOrdinal = ordinal;
                    var activationPromise = datasource.getPlaybackMedia(ordinal, startPosition, Playback.UsageContext.user, resetPreviewFlag).then(function getPlaybackMedia_success(mediaInstance) {
                            Playback.Etw.traceString("PLST<-getPlaybackMedia");
                            this._setMedia(datasource, mediaInstance)
                        }.bind(this), function getPlaybackMedia_error(error) {
                            if (!MS.Entertainment.isCanceled(error)) {
                                Playback.Etw.traceString("PLST:getPlaybackMediaError " + error);
                                return this.itemAt(datasource, ordinal).then(function getPlaybackMedia_error_itemAt(mediaItem) {
                                        return createMediaInstance({
                                                cookie: ordinal, error: Playback.makePlaybackError(error, "PLST->getPlaybackMedia_error"), mediaItem: mediaItem
                                            }).then(function(errorMediaInstance) {
                                                this._setMedia(datasource, errorMediaInstance)
                                            }.bind(this))
                                    }.bind(this))
                            }
                            else
                                Playback.Etw.traceString("Playlist::_setMediaByIndex::getPlaybackMedia: activation canceled")
                        }.bind(this));
                    function markActivationCompleted() {
                        datasource._activationPromise = null
                    }
                    datasource._activationPromise = activationPromise;
                    return activationPromise.then(markActivationCompleted, markActivationCompleted)
                }, activate: function PlaylistCore_activate(index, startPosition, searchFor, maxSearchDistance) {
                    MS.Entertainment.Platform.Playback.Etw.traceString("PLST::activate at " + index);
                    this._dataSourceSetPromise.promise.then(function synchronized_activate() {
                        this._activate(index, startPosition, searchFor, maxSearchDistance)
                    }.bind(this))
                }, _activate: function PlaylistCore__activate(index, startPosition, searchFor, maxSearchDistance) {
                    if (!this._playbackControl) {
                        var err = "Cannot activate playlist : playbackControl is not set";
                        Playback.Etw.traceString("PLST:" + err);
                        throw err;
                    }
                    if (!this._dataSource) {
                        var err = "Cannot activate playlist : datasource is not set";
                        Playback.Etw.traceString("PLST:" + err);
                        throw err;
                    }
                    MS.Entertainment.Platform.Playback.Etw.tracePlaylistActivate(index, startPosition, this.shuffle, this.repeat);
                    if (this._dataSource.size === 0) {
                        this._setMedia(null);
                        return
                    }
                    var ordinal = index;
                    if (index === undefined)
                        if (this.first != null)
                            ordinal = this.first;
                        else if (this.shuffle)
                            ordinal = this._sequenceGenerator._shuffler._rand();
                    function isValidNumber(n) {
                        return +n === n
                    }
                    if (!isNaN(ordinal) && ordinal >= 0 && ordinal < this._dataSource.size)
                        if (!!searchFor)
                            return expandingSearch(this, ordinal, searchFor, maxSearchDistance || 0).then(function found(index) {
                                    if (isValidNumber(index))
                                        return this._setMediaByIndex(index, startPosition);
                                    else if (searchFor.track)
                                        return this.setDataSource(searchFor.track).then(function playSingleTrack() {
                                                this.activate()
                                            }.bind(this));
                                    else {
                                        MS.Entertainment.Platform.Playback.assert(false, "Search functionality requested in activation w/o specifying backup track to play");
                                        Playback.Etw.traceString("Playlist::activate aborted. Track not found and no alternate track specified");
                                        return WinJS.Promise.as()
                                    }
                                }.bind(this));
                        else
                            return this._setMediaByIndex(ordinal, startPosition)
                }, skipFwd: function PlaylistCore_skipFwd() {
                    if (this._playbackControl.hasPrerolledMedia()) {
                        this._userActionOrdinal = this._prerollOrdinal;
                        this._playbackControl.skipToNextPrerolled(true)
                    }
                    else {
                        var i = this.after(this.currentOrdinal);
                        if (i != null)
                            this.activate(i)
                    }
                }, skipBack: function PlaylistCore_skipBack() {
                    var i = this.before(this.currentOrdinal);
                    if (i != null)
                        this.activate(i)
                }, _updateCommandStatus: function PlaylistCore__updateCommandStatus() {
                    var i = this.currentOrdinal;
                    if (i != null) {
                        this.canSkipForward = (this._prerollOrdinal != null);
                        this.canSkipBackward = (this.before(this.currentOrdinal) != null)
                    }
                    else {
                        this.canSkipForward = false;
                        this.canSkipBackward = false
                    }
                }, onSetShuffleMode: function PlaylistCore_onSetShuffleMode(v) {
                    this._sequenceGenerator = v ? new mySpace.QuantumShuffleSequencer : this._listSequencer;
                    this._initializeFromSource();
                    if (this.currentOrdinal != null) {
                        this._userActionOrdinal = this.currentOrdinal;
                        this._prerollOrdinal = this.currentOrdinal;
                        this._setNext(this._dataSource)
                    }
                    this._updateCommandStatus()
                }, onSetRepeatMode: function PlaylistCore_onSetRepeatMode(v) {
                    this._sequenceGenerator.repeat = v;
                    if (this.currentOrdinal != null) {
                        this._userActionOrdinal = this.currentOrdinal;
                        this._prerollOrdinal = this.currentOrdinal;
                        this._setNext(this._dataSource)
                    }
                    this._updateCommandStatus()
                }, _onSizeChanged: function PlaylistCore__onSizeChanged(sz) {
                    if (sz)
                        this.onSetShuffleMode(this.shuffle)
                }, _onOrderChanged: function PlaylistCore__onOrderChanged() {
                    if (this.currentOrdinal !== undefined && this.currentOrdinal !== null && this._currentMediaInstance !== null) {
                        var datasource = this._dataSource;
                        findOrdinal(this, this.currentOrdinal, this._currentMediaKey).then(function adjust_playback(newOrdinal) {
                            if (newOrdinal !== null) {
                                if (newOrdinal === -1) {
                                    newOrdinal = this.after(this.currentOrdinal);
                                    if (newOrdinal === this.currentOrdinal)
                                        newOrdinal = null;
                                    else
                                        this.activate(newOrdinal)
                                }
                                if (newOrdinal !== null) {
                                    if (newOrdinal === this.currentOrdinal)
                                        this.activate(newOrdinal);
                                    this._setCurrentOrdinal(newOrdinal)
                                }
                                else {
                                    this._setMedia(null, null);
                                    this._setCurrentOrdinal(null)
                                }
                            }
                            this._prerollOrdinal = null;
                            this._setNext(datasource);
                            this._updateCommandStatus()
                        }.bind(this))
                    }
                }, first: {get: function PlaylistCore_getFirst() {
                        return this._sequenceGenerator.first
                    }}, after: function PlaylistCore_after(ordinal) {
                    return this._sequenceGenerator.after(ordinal)
                }, before: function PlaylistCore_before(ordinal) {
                    return this._sequenceGenerator.before(ordinal)
                }, _initializeFromSource: function PlaylistCore__initializeFromSource() {
                    var c = this.currentOrdinal;
                    this._sequenceGenerator.initialize(this._dataSource, c);
                    this._sequenceGenerator.repeat = this.repeat
                }, _setNext: function PlaylistCore__setNext(datasource) {
                    if (datasource._nextActivationPromise) {
                        datasource._nextActivationPromise.cancel();
                        this._prerollOrdinal = null
                    }
                    var next = this._computeNextToPreroll();
                    this._setNextInternal(datasource, next)
                }, _setNextInternal: function PlaylistCore__setNextInternal(datasource, next) {
                    this.itemAt(datasource, next).then(function _setNextInternal_itemAt_success(item) {
                        this._setNextMedia(item)
                    }.bind(this))
                }, _setMedia: function PlaylistCore__setMedia(datasource, item) {
                    var currentOrdinal = null;
                    if (datasource && item) {
                        currentOrdinal = datasource.ordinalOf(item);
                        MS.Entertainment.Platform.Playback.Etw.tracePlaylistSetMedia(item)
                    }
                    else
                        this.currentMedia = null;
                    this._setCurrentOrdinal(currentOrdinal);
                    if (this._playbackControl)
                        this._playbackControl.currentMedia = item
                }, _setNextMedia: function PlaylistCore__setNextMedia(item) {
                    if (this._playbackControl) {
                        var nextMedia;
                        if (item)
                            nextMedia = item;
                        else if (this._playbackControl.nextMedia === undefined)
                            nextMedia = null;
                        else
                            nextMedia = undefined;
                        this._playbackControl.prerollMediaItem(nextMedia)
                    }
                }, savePlaylist: (function savePlaylist_Closure() {
                    var playlistProvider;
                    return function savePlaylist(title, overwrite, waitForCreationOnly) {
                            Playback.Etw.traceString("PLST::savePlaylist started " + (new Date).toTimeString());
                            var that = this;
                            var playlistId = -1;
                            var overwriteNamed = !!overwrite;
                            var datasource = this._dataSource;
                            var promiseTitle = title || "NowPlaying";
                            if (this._savePlaylistInProgressPromise[promiseTitle]) {
                                this._savePlaylistInProgressPromise[promiseTitle].cancel();
                                Playback.Etw.traceString("PLST::savePlaylist previous cancelled")
                            }
                            if (!playlistProvider) {
                                var mediaStore = new Microsoft.Entertainment.Platform.MediaStore;
                                playlistProvider = mediaStore.playlistProvider
                            }
                            function appendItem(item) {
                                if (!item || !item.data)
                                    return WinJS.Promise.wrapError("Cannot save the undefined or null playlist item");
                                var libraryMediaPromise;
                                if (item.data.mediaType && item.data.mediaType === Microsoft.Entertainment.Queries.ObjectType.track && item.data.libraryId === -1)
                                    libraryMediaPromise = MS.Entertainment.Platform.PurchaseHelpers.addNonCollectionMediaToLibrary([item.data]);
                                else
                                    libraryMediaPromise = WinJS.Promise.wrap({mediaIdentifiers: [{
                                                libraryId: item.data.libraryId, libraryType: item.data.mediaType, mediaId: item.data.serviceId || MS.Entertainment.Utilities.EMPTY_GUID
                                            }]});
                                return libraryMediaPromise.then(function mediaAddedToLibrary(result) {
                                        var libraryIds = result.mediaIdentifiers.map(function mapLibraryId(item) {
                                                return item.libraryId
                                            });
                                        var mediaTypes = result.mediaIdentifiers.map(function mapLibraryType(item) {
                                                return item.libraryType
                                            });
                                        var serviceMediaIds = result.mediaIdentifiers.map(function mapServiceId(item) {
                                                return item.mediaId || MS.Entertainment.Utilities.EMPTY_GUID
                                            });
                                        return playlistProvider.appendPlaylistItemsAsync(playlistId, libraryIds, serviceMediaIds, mediaTypes, Microsoft.Entertainment.Platform.MediaAvailability.undefined)
                                    }, function mediaNotAddedToLibrary(error) {
                                        MS.Entertainment.Platform.Playback.fail("Failed to add media to library. error: " + error && error.message);
                                        var trackArtistName = String.empty;
                                        var trackArtistServiceId = MS.Entertainment.Utilities.EMPTY_GUID;
                                        if (item.data.artist) {
                                            trackArtistName = item.data.artist.name;
                                            trackArtistServiceId = item.data.artist.serviceId || MS.Entertainment.Utilities.EMPTY_GUID
                                        }
                                        var albumName = String.empty;
                                        var albumArtistName = trackArtistName;
                                        var albumArtistServiceId = trackArtistServiceId;
                                        if (item.data.album) {
                                            albumName = item.data.album.name;
                                            if (item.data.album.artist) {
                                                albumArtistName = item.data.album.artist.name;
                                                albumArtistServiceId = item.data.album.artist.serviceId || MS.Entertainment.Utilities.EMPTY_GUID
                                            }
                                        }
                                        var duration = !item.data.duration ? 0 : item.data.duration.getMinutes ? (((item.data.duration.getMinutes() * 60) + item.data.duration.getSeconds()) * 1000) : item.data.duration;
                                        return playlistProvider.appendMarketplaceTrackPlaylistItemAsync(playlistId, [item.data.libraryId], [albumName], [albumArtistName], [item.data.name], [trackArtistName], [item.data.genreName], [duration], [albumArtistServiceId], [trackArtistServiceId], [item.data.serviceId ? item.data.serviceId : MS.Entertainment.Utilities.EMPTY_GUID], item.data.mediaType)
                                    })
                            }
                            function cleanup(arg) {
                                that._savePlaylistInProgressPromise[promiseTitle] = null;
                                var cancel = String.empty;
                                if (MS.Entertainment.isCanceled(arg))
                                    cancel = " (canceled) ";
                                Playback.Etw.traceString("PLST::savePlaylist cleanup: " + cancel + (new Date).toTimeString());
                                return arg
                            }
                            function progressReport(index) {
                                if (index % 100 === 0)
                                    Playback.Etw.traceString("PLST::savePlaylist @" + index)
                            }
                            try {
                                if (datasource) {
                                    var listCreationPromise = null;
                                    if (!title) {
                                        Playback.Etw.traceString("PLST::savePlaylist create nowplaying playlist");
                                        listCreationPromise = playlistProvider.createPlaylistAsync(Microsoft.Entertainment.Platform.PlaylistType.nowPlaying, "NowPlaying", true)
                                    }
                                    else {
                                        Playback.Etw.traceString("PLST::savePlaylist create named playlist, title= " + title + ", overwriteNamed=" + overwriteNamed);
                                        listCreationPromise = playlistProvider.createPlaylistAsync(Microsoft.Entertainment.Platform.PlaylistType.static, title, overwriteNamed)
                                    }
                                    that._savePlaylistInProgressPromise[promiseTitle] = listCreationPromise;
                                    return listCreationPromise.then(function createPlaylist_complete(createPlaylistReturnValue) {
                                            Playback.Etw.traceString("PLST::savePlaylist createPlaylist_complete");
                                            playlistId = createPlaylistReturnValue.playlistId;
                                            var listWritePromise = MS.Entertainment.Platform.Playback.Playlist.PlaylistCore.forEachItemSequentially(datasource.mediaCollection, appendItem, null, progressReport);
                                            that._savePlaylistInProgressPromise[promiseTitle] = listWritePromise;
                                            if (!waitForCreationOnly)
                                                return listWritePromise.then(function saved_all(count) {
                                                        return WinJS.Promise.wrap(playlistId)
                                                    });
                                            else
                                                return playlistId
                                        }, function onError(e) {
                                            Playback.Etw.traceString("PLST::savePlaylist creation error: " + JSON.stringify(e));
                                            cleanup(e);
                                            return WinJS.Promise.wrapError(e)
                                        }).then(cleanup)
                                }
                            }
                            catch(e) {
                                return WinJS.Promise.wrapError(e)
                            }
                        }
                })()
        }, {
            forEachItemSequentially: function forEachItemSequentially(collection, asyncOp, maxItems, progress) {
                return collection.getCount().then(function forEachItemSequentially_listCounted(count) {
                        var list = collection.createListBinding();
                        var completed,
                            error;
                        function _iterationError(err) {
                            Playback.Etw.traceString("PLST::forEachItemSequentially iteration error: " + JSON.stringify(err));
                            list.release();
                            error(err)
                        }
                        {};
                        function _forEachItemSequentially(startingWith) {
                            if (progress)
                                progress(startingWith);
                            if (startingWith === count || (maxItems && maxItems === startingWith)) {
                                list.release();
                                completed(startingWith);
                                return
                            }
                            list.fromIndex(startingWith).done(function forEachItemSequentially_gotItem(item) {
                                WinJS.Promise.timeout().done(function forEachItemSequentially_processItem() {
                                    asyncOp(item).done(_forEachItemSequentially.bind(this, startingWith + 1), _iterationError)
                                })
                            })
                        }
                        return new WinJS.Promise(function(c, e) {
                                completed = c;
                                error = e;
                                _forEachItemSequentially(0)
                            })
                    })
            }, convertMediaItemToMediaInstance: function convertMediaItemToMediaInstance(mediaItem, startPosition, context) {
                    return convertToMediaInstance(mediaItem, mediaItem.index, startPosition, context)
                }
        })})
})("MS.Entertainment.Platform.Playback.Playlist")
