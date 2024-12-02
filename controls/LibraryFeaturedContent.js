/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Playbackhelpers.js", "/Framework/corefx.js", "/Framework/imageloader.js", "/Framework/querywatcher.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
    LibraryFeaturedDataNotificationHandler: WinJS.Class.define(function libraryFeaturedDataNotificationHandler(listUpdateCallback, itemUpdateCallback) {
        this._listUpdateCallback = listUpdateCallback;
        this._itemUpdateCallback = itemUpdateCallback
    }, {
        _listUpdateCallback: null, _itemUpdateCallback: null, dispose: function dispose() {
                this._listUpdateCallback = null;
                this._itemUpdateCallback = null
            }, inserted: function inserted(item, previousKey, nextKey, index) {
                if (this._listUpdateCallback)
                    this._listUpdateCallback(index)
            }, changed: function changed(newItem, oldItem) {
                if (this._itemUpdateCallback)
                    this._itemUpdateCallback(newItem, oldItem)
            }, moved: function moved(item, previousKey, nextKey, oldIndex, newIndex){}, removed: function removed(key, index) {
                if (this._listUpdateCallback)
                    this._listUpdateCallback(index, key)
            }, countChanged: function countChanged(newCount, oldCount){}
    }), NoContentPane: MS.Entertainment.UI.Framework.defineUserControl("Controls/LibraryFeaturedContent.html#noContentPaneTemplate", null, {
            _modelBindings: null, initialize: function initialize() {
                    if (this.model) {
                        if (this.model.primaryText)
                            this.title = this.model.primaryText;
                        else if (this.model.primaryStringId)
                            this.title = String.load(this.model.primaryStringId);
                        if (this.model.secondaryText)
                            this.description = this.model.secondaryText;
                        else if (this.model.secondaryStringId)
                            this.description = String.load(this.model.secondaryStringId);
                        this._modelBindings = WinJS.Binding.bind(this.model, {details: this._onDetailsChanged.bind(this)})
                    }
                }, unload: function unload() {
                    MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this);
                    if (this._modelBindings) {
                        this._modelBindings.cancel();
                        this._modelBindings = null
                    }
                }, _onDetailsChanged: function _onDetailsChanged(newValue) {
                    this.details = newValue
                }
        }, {
            title: null, description: null, details: null, model: null
        })
});
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LibraryFeaturedContent: MS.Entertainment.UI.Framework.defineUserControl(null, function libraryFeaturedContentConstructor(element, options) {
        this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("libraryFeaturedContent");
        this._rebuildDataOnWindowSizeChange = this._rebuildDataOnWindowSizeChange.bind(this)
    }, {
        _queryResults: null, _itemsVisible: -1, _maxItems: 100, _queryWatcher: null, _populateTimeout: null, controlName: "LibraryFeaturedContent", _fileTransferListenerId: null, _pendingLoadPromises: null, _onScreen: true, _queryEventHandlers: null, _currentlySelectedItem: null, initialize: function initialize() {
                this.bind("libraryQuery", function libraryQueryChanged() {
                    this._cancelPendingLoads();
                    this._unregisterContentNotificationListeners();
                    var pendingLoadPromisesArray = [];
                    var pendingLoadPromises;
                    if (this.libraryQuery && this._loadFeaturedItems)
                        if (Array.isArray(this.libraryQuery)) {
                            this._queryResults = [];
                            this._fileTransferListenerId = [];
                            for (var i = 0; i < this.libraryQuery.length; i++) {
                                this._fileTransferListenerId[i] = "LibraryFeaturedContent_" + Date.now() + "_" + Math.random();
                                pendingLoadPromisesArray.push(this._loadFeaturedItems(i))
                            }
                        }
                        else {
                            this._fileTransferListenerId = "LibraryFeaturedContent_" + Date.now() + "_" + Math.random();
                            pendingLoadPromisesArray.push(this._loadFeaturedItems())
                        }
                    pendingLoadPromises = WinJS.Promise.join(pendingLoadPromisesArray);
                    this._pendingLoadPromises = pendingLoadPromises;
                    pendingLoadPromises.done(function loadingComplete() {
                        if (pendingLoadPromises === this._pendingLoadPromises)
                            this._pendingLoadPromises = null
                    }.bind(this), function loadingFailed() {
                        if (pendingLoadPromises === this._pendingLoadPromises) {
                            this._pendingLoadPromises = null;
                            if (!this._queryResults || !this._queryResults.length)
                                this._updateItems([])
                        }
                    }.bind(this))
                }.bind(this))
            }, unload: function unload() {
                this._cancelPendingLoads();
                if (this._populateTimeout) {
                    this._populateTimeout.cancel();
                    this._populateTimeout = null
                }
                if (this._queryEventHandlers) {
                    this._queryEventHandlers.cancel();
                    this._queryEventHandlers = null
                }
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).removeEventListener("windowresize", this._rebuildDataOnWindowSizeChange);
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, freeze: function freeze() {
                this.onOffScreen();
                MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
            }, thaw: function thaw() {
                MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                this.onOnScreen()
            }, onOffScreen: function onOffScreen() {
                if (this._onScreen)
                    this._pauseQueries();
                this._onScreen = false
            }, onOnScreen: function onOnScreen() {
                if (!this._onScreen)
                    this._unPauseQueries();
                this._onScreen = true
            }, onItemSelected: function onItemSelected(e) {
                this._pauseQueries();
                this._currentlySelectedItem = e.srcElement
            }, onItemDeselected: function onItemDeselected(e) {
                if (e.srcElement === this._currentlySelectedItem) {
                    this._unPauseQueries();
                    this._currentlySelectedItem = null
                }
            }, _pauseQueries: function _pauseQueries() {
                if (this.libraryQuery)
                    if (Array.isArray(this.libraryQuery))
                        this.libraryQuery.forEach(function unpauseQuery(query) {
                            if (query.pause)
                                query.pause()
                        });
                    else if (this.libraryQuery.pause)
                        this.libraryQuery.pause()
            }, _unPauseQueries: function _unPauseQueries() {
                if (this.libraryQuery)
                    if (Array.isArray(this.libraryQuery))
                        this.libraryQuery.forEach(function unpauseQuery(query) {
                            if (query.unpause)
                                query.unpause()
                        });
                    else if (this.libraryQuery.unpause)
                        this.libraryQuery.unpause()
            }, _cancelPendingLoads: function _cancelPendingLoads() {
                if (this._pendingLoadPromises) {
                    this._pendingLoadPromises.cancel();
                    this._pendingLoadPromises = null
                }
            }, _loadFeaturedItems: function _loadFeaturedItems(index) {
                var query = (index >= 0) ? this.libraryQuery[index] : this.libraryQuery;
                var listenerId = (index >= 0) ? this._fileTransferListenerId[index] : this._fileTransferListenerId;
                var sender = this._modifyQueryForContentNotifications(query);
                this._queryWatcher.registerQuery(query);
                if ("isLive" in query)
                    query.isLive = true;
                if (this._queryEventHandlers) {
                    this._queryEventHandlers.cancel();
                    this._queryEventHandlers = null
                }
                return query.execute().then(function libraryFeaturedContentQueryComplete(q) {
                        if (index >= 0)
                            this._queryResults[index] = q.result.items;
                        else
                            this._queryResults = q.result.items;
                        this._registerContentNotificationListener(sender, listenerId);
                        if (q.isLive)
                            q.result.items.setNotificationHandler(new MS.Entertainment.UI.Controls.LibraryFeaturedDataNotificationHandler(this._handleDataNotifications.bind(this), this._handleDataUpdates.bind(this)));
                        this._queryEventHandlers = MS.Entertainment.Utilities.addEventHandlers(q, {resultChanged: function handleQueryResultChanged() {
                                this._handleQueryResultChanged(query, index)
                            }.bind(this)});
                        this._populateContent();
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).addEventListener("windowresize", this._rebuildDataOnWindowSizeChange)
                    }.bind(this))
            }, _handleQueryResultChanged: function _handleQueryResultChanged(query, index) {
                if (index >= 0)
                    this._queryResults[index] = query.result && query.result.items;
                else
                    this._queryResults = query.result && query.result.items;
                this._populateContent()
            }, _rebuildDataOnWindowSizeChange: function _rebuildDataOnWindowSizeChange() {
                this._populateContent(true)
            }, _handleDataUpdates: function _handleDateUpdates(newItem, oldItem){}, _handleDataNotifications: function _handleDataNotifications(index, key) {
                MS.Entertainment.UI.Controls.assert(this._populateContent, "For db updates, LibraryFeaturedContent requires _populateContent defined");
                if (index > this._maxItems)
                    return;
                if (!key) {
                    if (!this.items || this._itemsVisible <= 0 || this.items.length < this._itemsVisible || index < this._itemsVisible)
                        this._deferredPopulateContent()
                }
                else
                    for (var i = 0; i < this.items.length; i++)
                        if (this.items[i].key === key) {
                            this._deferredPopulateContent();
                            break
                        }
            }, _deferredPopulateContent: function _deferredPopulateContent() {
                if (this._populateTimeout) {
                    this._populateTimeout.cancel();
                    this._populateTimeout = null
                }
                this._populateTimeout = WinJS.Promise.timeout(300).then(this._populateContent.bind(this), function cancelledHandler(error){})
            }, _updateItems: function _updateItems(libraryItems) {
                if (!this._content || !this._emptyContent)
                    return;
                if (!libraryItems || libraryItems.length === 0) {
                    WinJS.Utilities.addClass(this._content.domElement, "removeFromDisplay");
                    WinJS.Utilities.removeClass(this._emptyContent.noContentPane, "removeFromDisplay");
                    WinJS.Utilities.addClass(this._emptyContent.noContentPane, this.emptyLibraryStyle)
                }
                else {
                    WinJS.Utilities.removeClass(this._content.domElement, "removeFromDisplay");
                    WinJS.Utilities.addClass(this._emptyContent.noContentPane, "removeFromDisplay");
                    WinJS.Utilities.removeClass(this._emptyContent.noContentPane, this.emptyLibraryStyle)
                }
                this.items = libraryItems;
                MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement)
            }, _unregisterContentNotificationListeners: function _unregisterContentNotificationListeners() {
                if (this._fileTransferListenerId) {
                    var fileTransferService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.fileTransfer);
                    if (Array.isArray(this._fileTransferListenerId))
                        for (var i = 0; i < this._fileTransferListenerId.length; i++) {
                            fileTransferService.unregisterListener(this._fileTransferListenerId[i]);
                            this._fileTransferListenerUnregistered(fileTransferService, this._fileTransferListenerId[i])
                        }
                    else {
                        fileTransferService.unregisterListener(this._fileTransferListenerId);
                        this._fileTransferListenerUnregistered(fileTransferService, this._fileTransferListenerId)
                    }
                }
            }, _modifyQueryForContentNotifications: function _modifyQueryForContentNotifications(query) {
                var sender = null;
                return sender
            }, _registerContentNotificationListener: function _registerContentNotificationListener(sender, listenerId){}, _fileTransferListenerUnregistered: function _fileTransferListenerUnregistered(fileTransferService, listenerId){}, _filterNotifications: function _filterNotifications(notificationId) {
                return false
            }
    }, {
        items: undefined, emptyLibraryStyle: null, emptyLibraryModel: null, libraryClicked: null, libraryQuery: null
    })})
