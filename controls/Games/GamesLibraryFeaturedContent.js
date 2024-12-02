/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Playbackhelpers.js", "/Controls/hub.js", "/Framework/corefx.js", "/Framework/imageloader.js", "/Framework/querywatcher.js", "/viewmodels/social/socialDashboardHelper.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Controls");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {LibraryGamesFeaturedContent: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.LibraryFeaturedContent, "Controls/LibraryFeaturedContent.html#libraryGamesContentTemplate", function libraryGamesFeaturedContentConstructor(element, options) {
        this.emptyLibraryStyle = "noGamesContentPane";
        this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)})
    }, {
        _itemsVisible: 7, _maxItemsVisible: 0, _itemColumns: 3, _itemsBuzzing: 2, _bindings: null, _socialEventHandlers: null, _loaded: false, _networkStatusBinding: null, _isOnline: null, _modelReady: false, initialize: function initialize() {
                this._rebuildDataOnWindowSizeChange = this._rebuildDataOnWindowSizeChange.bind(this);
                MS.Entertainment.UI.Controls.assert(this.socialHelper, "LibraryGamesFeaturedContent requires socialHelper");
                this._socialEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.socialHelper, {dataChanged: this._loadFeaturedItems.bind(this)});
                this._loadFeaturedItems();
                MS.Entertainment.UI.Controls.LibraryFeaturedContent.prototype.initialize.apply(this, arguments)
            }, unload: function unload() {
                if (this._bindings) {
                    this._bindings.cancel();
                    this._bindings = null
                }
                if (this._socialEventHandlers) {
                    this._socialEventHandlers.cancel();
                    this._socialEventHandlers = null
                }
                MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).removeEventListener("windowresize", this._rebuildDataOnWindowSizeChange);
                MS.Entertainment.UI.Controls.LibraryFeaturedContent.prototype.unload.call(this)
            }, _loadFeaturedItems: function _loadFeaturedItems() {
                this._itemsVisible = this._itemColumns * MS.Entertainment.Utilities.getRowCountForResolution();
                if (this._maxItemsVisible > 0)
                    this._itemsVisible = Math.min(this._maxItemsVisible, this._itemsVisible);
                if (!this.socialHelper.userTitles || !this.socialHelper.buzzingTitles)
                    return;
                this._modelReady = true;
                if (this._isOnline) {
                    this._loaded = true;
                    var userTitles = [],
                        finalTitles = [],
                        buzzingTitles = [];
                    var finalTitlesById = {};
                    var titlesById = {};
                    var i,
                        j,
                        k;
                    if (this.socialHelper.userTitles.length > 0) {
                        for (i = 0; i < this.socialHelper.userTitles.length; i++) {
                            var item = this.socialHelper.userTitles[i];
                            if (this._showGame(item)) {
                                if (MS.Entertainment.Utilities.isGameItemAvailable(item))
                                    item.doclick = this.itemClicked;
                                item.queryId = MS.Entertainment.UI.Monikers.gamesActivityPanel;
                                userTitles.push(item);
                                j = userTitles.length - 1;
                                if (userTitles.length <= this._itemsVisible - this._itemsBuzzing)
                                    finalTitlesById[userTitles[j].titleId] = userTitles[j];
                                else if (userTitles.length > this._itemsVisible)
                                    titlesById[userTitles[j].titleId] = userTitles[j]
                            }
                        }
                        finalTitles = userTitles.splice(0, this._itemsVisible - this._itemsBuzzing);
                        if (this.socialHelper.buzzingTitles && this.socialHelper.buzzingTitles.length > 0) {
                            buzzingTitles = [];
                            for (k = 0; k < this.socialHelper.buzzingTitles.length && buzzingTitles.length < this._itemsBuzzing; k++) {
                                var id = this.socialHelper.buzzingTitles[k].titleId;
                                if (titlesById[id] && !finalTitlesById[id])
                                    buzzingTitles.push(titlesById[id])
                            }
                        }
                        this._updateItems(finalTitles.concat(userTitles.slice(0, this._itemsBuzzing - buzzingTitles.length)).concat(buzzingTitles));
                        MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState).addEventListener("windowresize", this._rebuildDataOnWindowSizeChange)
                    }
                    else
                        this._updateItems([])
                }
                else {
                    this.items = null;
                    MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true)
                }
            }, _rebuildDataOnWindowSizeChange: function _rebuildDataOnWindowSizeChange() {
                this._loadFeaturedItems()
            }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                if (newValue) {
                    var isOnline = this.isNetworkStatusCodeOnline(newValue);
                    if (isOnline !== this._isOnline) {
                        this._isOnline = isOnline;
                        if (this._modelReady)
                            this._loadFeaturedItems()
                    }
                }
            }, isNetworkStatusCodeOnline: function isNetworkStatusCodeOnline(status) {
                var isOnline = false;
                switch (status) {
                    case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unknown:
                    case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.unrestricted:
                    case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.throttled:
                        isOnline = true;
                        break;
                    case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.onDemand:
                    case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.localOnly:
                    case MS.Entertainment.UI.NetworkStatusService.NetworkStatus.none:
                        isOnline = false;
                        break
                }
                return isOnline
            }, _showGame: function _showGame(game) {
                return game.isGame
            }, itemClicked: WinJS.Utilities.markSupportedForProcessing(function itemClicked(item) {
                MS.Entertainment.UI.Controls.assert(item, "No item for pop-over");
                if (item) {
                    var popOverParameters = {
                            itemConstructor: "MS.Entertainment.Pages.GameInlineDetails", dataContext: {
                                    data: item.target, location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection
                                }
                        };
                    MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters)
                }
            })
    }, {
        socialHelper: null, _suppressLoad: true
    })})
