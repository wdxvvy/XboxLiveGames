/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/debug.js", "/Framework/servicelocator.js", "/Framework/stringids.js", "/ViewModels/social/sharefactory.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Social");
(function(MSE, undefined) {
    var shareSenderMixin = {
            _handlerCallback: null, _handlerFactory: null, _shareHistory: null, _shareHistoryMax: 5, _sharePageHistoryMax: 5, _initialized: false, _navigationBindings: null, _maxEmptyMessageLength: 247, _currentPage: null, _defaultEmptyMessage: null, initializeOnce: function initializeOnce() {
                    if (!this._initialized) {
                        this._initializeNavigationWatcher();
                        this.setShareHandler(null);
                        this._initialized = true
                    }
                }, setDefaultEmptyMessage: function setDefaultEmptyMessage() {
                    var stringId = String.id.IDS_SHARE_EMPTY_MESSAGE_GAMES;
                    if (stringId) {
                        this._defaultEmptyMessage = String.load(stringId);
                        this._setEmptyMessage()
                    }
                }, share: function share(data, factory) {
                    var shareOperation;
                    var shareManager = this._getShareManager();
                    if (data !== null && data !== undefined) {
                        var temporaryShareCallback = function _temporaryShareCallback(args) {
                                try {
                                    if (args && args.package && args.target && shareOperation)
                                        shareOperation.encode(data).done(function encodeSuccess(encodedData) {
                                            this._copyEncodeResultObject(encodedData, args);
                                            args.target.encodeComplete()
                                        }.bind(this), function encodeFailed(error) {
                                            MS.Entertainment.Social.fail("Failed to encode a share package. error: " + error && error.message);
                                            this._setEmptyMessage(pendingShareOperation && pendingShareOperation.emptyMessage);
                                            args.target.encodeComplete()
                                        }.bind(this))
                                }
                                catch(error) {
                                    MS.Entertainment.Social.fail("Failed to copy share information in temporary callback. error: " + error);
                                    args.target.encodeComplete()
                                }
                                this._getShareManager().removeEventListener("requestshareevent", temporaryShareCallback, false)
                            }.bind(this);
                        shareOperation = new MSE.Social.ShareOperation(this._encode.bind(this), temporaryShareCallback, data, factory);
                        this._getShareManager().addEventListener("requestshareevent", temporaryShareCallback, false);
                        WinJS.Promise.timeout().then(shareManager.share());
                        return shareOperation
                    }
                }, pendingShare: function pendingShare(data, factory) {
                    var shareOperation = null;
                    if (!MS.Entertainment.Utilities.isApp2 && data !== null && data !== undefined)
                        shareOperation = new MSE.Social.ShareOperation(this._encode.bind(this), this._removePageHistory.bind(this), data, factory);
                    this._setPendingShareOperation(shareOperation);
                    return shareOperation
                }, setShareHandler: function setShareHandler(callback, factory) {
                    var that = this;
                    if (!callback) {
                        if (this._peekPageHistory())
                            this._setDefaultShareCallback();
                        else
                            this._clearShareCallback();
                        this._handlerCallback = null;
                        this._handlerFactory = null
                    }
                    else {
                        this._setDefaultShareCallback();
                        this._handlerCallback = callback;
                        this._handlerFactory = factory || null
                    }
                }, _setPendingShareOperation: function _setPendingShareOperation(shareOperation) {
                    if (shareOperation)
                        this._pushPageHistory(shareOperation);
                    else
                        this._clearPageHistory();
                    this.setShareHandler(null, null)
                }, _createEncodeResultObject: function _createEncodeResultObject() {
                    return {package: {}}
                }, _copyEncodeResultObject: function _copyEncodePackage(from, to) {
                    if (from && from.package && to && to.package)
                        for (var key in from.package)
                            if (key in to.package)
                                to.package[key] = from.package[key]
                }, _getShareManager: function _getShareManager() {
                    var shareManager = MSE.ServiceLocator.getService(MSE.Services.shareHost).getManager();
                    MSE.Social.assert(shareManager !== null && shareManager !== undefined, "ShareManager is null inside the ShareSender");
                    return shareManager
                }, _clearShareCallback: function _clearShareCallback() {
                    if (this._defaultShareCallback) {
                        this._getShareManager().removeEventListener("requestshareevent", this._defaultShareCallback, false);
                        this._defaultShareCallback = null
                    }
                }, _setDefaultShareCallback: function _setDefaultShareCallback() {
                    if (!this._defaultShareCallback) {
                        this._defaultShareCallback = function _defaultShareCallback(eventArgs) {
                            try {
                                if (eventArgs && eventArgs.package && eventArgs.target)
                                    this._onSharePackageRequest({package: eventArgs.package}).done(function shareSucceeded() {
                                        eventArgs.target.encodeComplete()
                                    }, function shareFailed() {
                                        eventArgs.target.encodeComplete()
                                    })
                            }
                            catch(error) {
                                MS.Entertainment.Social.fail("Failed to create a share package. error:" + error);
                                eventArgs.package = null;
                                eventArgs.target.encodeComplete()
                            }
                        }.bind(this);
                        this._getShareManager().addEventListener("requestshareevent", this._defaultShareCallback, false)
                    }
                }, _onSharePackageRequest: function _onSharePackageRequest(result) {
                    var encodePromise = null;
                    var pendingShareOperation = this._peekPageHistory();
                    if (this._handlerCallback)
                        encodePromise = this._encode(this._handlerCallback(), this._handlerFactory);
                    else if (pendingShareOperation)
                        encodePromise = pendingShareOperation.encode(pendingShareOperation.data);
                    return WinJS.Promise.as(encodePromise).then(function encodeSuccess(encodedData) {
                            this._setEmptyMessage(pendingShareOperation && pendingShareOperation.emptyMessage);
                            this._copyEncodeResultObject(encodedData, result);
                            MS.Entertainment.Utilities.Telemetry.logShare(encodedData)
                        }.bind(this), function encodeFailed(error) {
                            MS.Entertainment.Social.fail("Failed to encode a share package. error:" + error && error.message);
                            this._setEmptyMessage(pendingShareOperation && pendingShareOperation.emptyMessage)
                        }.bind(this))
                }, _setEmptyMessage: function _setEmptyMessage(message) {
                    message = message || this._defaultEmptyMessage;
                    MSE.Social.assert(!message || message.length <= this._maxEmptyMessageLength, "The empty message appears to be too long for the share contracts. If the empty message is too long, Windows will fallback to a default empty message. Note, this max maybe wrong. Please verify");
                    var shareManager = this._getShareManager();
                    if (shareManager && shareManager.setEmptyMessage)
                        shareManager.setEmptyMessage(message)
                }, _encode: function _encode(data, factory) {
                    if (data === null || data === undefined) {
                        MSE.Social.assert(false, "Share data is null or undefined");
                        throw"Share data is null or undefined";
                    }
                    var result = this._createEncodeResultObject();
                    if (factory)
                        return factory(data, result);
                    else
                        return MSE.ServiceLocator.getService(MSE.Services.shareEncoder).encode(data, result)
                }, _clearAllHistory: function _clearAllHistory() {
                    this._shareHistory = {}
                }, _getOrCreatePageHistory: function _getOrCreatePageHistory(page, preventCreate) {
                    var pageHistory = [];
                    page = page || this._currentPage;
                    if (page)
                        if (this._shareHistory[page])
                            pageHistory = this._shareHistory[page];
                        else if (!preventCreate)
                            this._shareHistory[page] = pageHistory;
                    var saves = 0;
                    for (var key in this._shareHistory)
                        saves++;
                    MS.Entertainment.Social.assert(saves < this._shareHistoryMax, "The shareSender's history stack has gotten too big. Need to either increase the limit or there could be a corruption somewhere.");
                    return pageHistory
                }, _clearPageHistory: function _clearPageHistory(page) {
                    page = page || this._currentPage;
                    if (page)
                        if (this._shareHistory[page])
                            delete this._shareHistory[page]
                }, _trimPageHistory: function _trimPageHistory(page) {
                    var trimmedOperations;
                    var pageHistory = this._getOrCreatePageHistory(page, true);
                    if (pageHistory.length > this._sharePageHistoryMax)
                        trimmedOperations = pageHistory.splice(0, pageHistory.length - this._sharePageHistoryMax);
                    if (trimmedOperations)
                        trimmedOperations.forEach(function(item) {
                            if (item)
                                item.cancel()
                        }.bind(this))
                }, _pushPageHistory: function _pushPageHistory(operation) {
                    if (operation) {
                        this._getOrCreatePageHistory().push(operation);
                        this._trimPageHistory()
                    }
                }, _peekPageHistory: function _peekPageHistory(page) {
                    var pageHistory = this._getOrCreatePageHistory(page, true);
                    return pageHistory[pageHistory.length - 1]
                }, _popPageHistory: function _popPageHistory(page) {
                    return this._getOrCreatePageHistory(page, true).pop()
                }, _removePageHistory: function _removePageHistory(operation, page) {
                    var itemRemoved,
                        pageHistory,
                        operationIndex;
                    if (!operation)
                        itemRemoved = this._popPageHistory(page);
                    else {
                        pageHistory = this._getOrCreatePageHistory(page, true);
                        operationIndex = pageHistory.indexOf(operation);
                        if (operationIndex >= 0)
                            itemRemoved = pageHistory.splice(operationIndex, 1)[0];
                        if (!itemRemoved && !page)
                            for (page in this._shareHistory) {
                                itemRemoved = this._removePageHistory(operation, page);
                                if (itemRemoved)
                                    break
                            }
                    }
                    return itemRemoved
                }, _handleNavigation: function _handleNavigation(newPage, oldPage) {
                    if (newPage) {
                        this._currentPage = newPage.iaNode.moniker;
                        if (newPage.iaNode.moniker === MS.Entertainment.UI.Monikers.root)
                            this._clearAllHistory()
                    }
                    else
                        this._currentPage = null
                }, _initializeNavigationWatcher: function _initializeNavigationWatcher() {
                    this._uninitializeNavigationWatcher();
                    if (!this._shareHistory) {
                        this._shareHistory = {};
                        try {
                            var navigation = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                            this._navigationBindings = WinJS.Binding.bind(navigation, {currentPage: this._handleNavigation.bind(this)})
                        }
                        catch(error) {}
                    }
                }, _uninitializeNavigationWatcher: function _uninitializeNavigationWatcher() {
                    if (this._navigationBindings) {
                        this._navigationBindings.cancel();
                        this._navigationBindings = null
                    }
                }
        };
    WinJS.Namespace.defineWithParent(MSE, "Social", {ShareOperation: WinJS.Class.define(function ShareOperation(encodeCallback, cancelCallback, data, factory) {
            this._encodeCallback = encodeCallback;
            this._cancelCallback = cancelCallback;
            this._factory = factory;
            this._data = data
        }, {
            _data: null, _encodePromise: null, _encodedData: null, _encodeCallback: null, _cancelCallback: null, _factory: null, cancelled: false, data: {get: function() {
                        return this._data
                    }}, emptyMessage: {get: function() {
                        var message = this._encodedData && this._encodedData.emptyMessage;
                        return isNaN(message) ? message : String.load(message)
                    }}, encode: function encode(data) {
                    if (this._encodeCallback && !this._encodePromise)
                        this._encodePromise = this._encodeCallback(data, this._factory).then(function encoded(result) {
                            this._encodedData = result;
                            return this._encodedData
                        }.bind(this));
                    return WinJS.Promise.as(this._encodePromise)
                }, cancel: function cancel() {
                    if (this._encodePromise) {
                        this._encodePromise.cancel();
                        this._encodePromise = null
                    }
                    if (this._cancelCallback) {
                        this._cancelCallback(this);
                        this._cancelCallback = null;
                        this._encodeCallback = null;
                        this._factory = null
                    }
                    this.cancelled = true
                }
        })});
    WinJS.Namespace.defineWithParent(MSE, "Social", {ShareSender: WinJS.Class.mix(function shareSender() {
            this.initializeOnce()
        }, shareSenderMixin, WinJS.Utilities.eventMixin)});
    MSE.ServiceLocator.register(MSE.Services.shareSender, function shareSenderFactory() {
        return new MSE.Social.ShareSender
    })
})(WinJS.Namespace.define("MS.Entertainment", null))
