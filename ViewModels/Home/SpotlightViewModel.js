/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/observablearray.js", "/Framework/serviceLocator.js", "/Framework/stringids.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {SpotlightViewModel: MS.Entertainment.defineObservable(function spotlightViewModelConstructor(query) {
        if (!query)
            throw new Error("Query required for SpotlightViewModel");
        this._query = query;
        this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("spotlightViewModel");
        this._networkStatusBinding = WinJS.Binding.bind(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState), {networkStatus: this._onNetworkStatusChanged.bind(this)});
        this._dashboardRefreshBinding = MS.Entertainment.UI.Framework.addEventHandlers(MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.dashboardRefresher), {refreshDashboard: this._dashboardRefreshChanged.bind(this)});
        this.promoClicked = MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(this.promoClicked, this)
    }, {
        maxItems: 0, action: null, items: undefined, featuredObject: undefined, filterWebBlendActions: false, _query: null, _queryWatcher: null, _networkStatusBinding: null, _dashboardRefreshBinding: null, _isOnline: null, _modelReady: false, _maxQueryTimeMS: 2000, _queryTimeoutPromise: null, _dashboardFrozen: false, _refreshOnDashboardThaw: false, _previousStringifiedItems: String.empty, getItems: function getItems(refreshing) {
                MS.Entertainment.ViewModels.assert(this.maxItems, "Must specify number of items for SpotlightViewModel");
                if (!this.maxItems) {
                    this.items = null;
                    return WinJS.Promise.wrap()
                }
                this._modelReady = true;
                this._queryWatcher.registerQuery(this._query);
                this._query.aggregateChunks = false;
                this._queryTimeoutPromise = WinJS.Promise.timeout(this._maxQueryTimeMS).then(function showDefault() {
                    this._queryTimeoutPromise = null;
                    if (!this.featuredObject && !refreshing)
                        this._setDefaultItems(false)
                }.bind(this));
                return this._query.execute().then(function queryComplete(q) {
                        if (this._queryTimeoutPromise) {
                            WinJS.Binding.unwrap(this._queryTimeoutPromise).cancel();
                            this._queryTimeoutPromise = null
                        }
                        if (q.result.entries && q.result.entries.count)
                            return q.result.entries.toArray();
                        else
                            return WinJS.Promise.wrapError("no entries returned")
                    }.bind(this)).then(this.populateItems.bind(this), function queryError(q) {
                        if (!refreshing)
                            this._setDefaultItems(true)
                    }.bind(this))
            }, populateItems: function populateItems(queryItems) {
                var stringifiedNewItems = JSON.stringify(queryItems);
                if (stringifiedNewItems === this._previousStringifiedItems)
                    return;
                this._previousStringifiedItems = stringifiedNewItems;
                queryItems.sort(function sortQueryItems(a, b) {
                    return a.sequenceId - b.sequenceId
                });
                queryItems.splice(this.maxItems, queryItems.length - this.maxItems);
                var spotlightItems = new MS.Entertainment.ObservableArray;
                var item;
                var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                for (var i = 0; i < queryItems.length; i++) {
                    item = this.wrapItem(queryItems[i].items[0]);
                    var itemIsFlexHub = item.Action && item.Action.type === MS.Entertainment.Data.Augmenter.Spotlight.ActionType.FlexHub;
                    var itemIsZuneFlexHub = item.Action && item.Action.type === MS.Entertainment.Data.Augmenter.Spotlight.ActionType.ZuneFlexHub;
                    setProperty(item, "isFlexHub", itemIsFlexHub || itemIsZuneFlexHub);
                    setProperty(item, "sequenceId", queryItems[i].sequenceId);
                    setProperty(item, "queryId", queryItems[i].queryId);
                    var filterFlexHub = false;
                    if (itemIsZuneFlexHub)
                        filterFlexHub = true;
                    if (!filterFlexHub && (!this.filterWebBlendActions || item.type !== MS.Entertainment.Data.Augmenter.Spotlight.ItemType.WebBlend) && (item.type !== MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Media || (this._hasValidMediaTarget(item) && this._canDisplayMediaType(item))))
                        spotlightItems.push(item)
                }
                this.items = spotlightItems;
                this.featuredObject = this._createFeaturedObject(spotlightItems)
            }, _hasValidMediaTarget: function(spotlightItem) {
                return (spotlightItem && spotlightItem.actionTarget && (spotlightItem.isFlexHub || (!MS.Entertainment.Utilities.isEmptyGuid(spotlightItem.actionTarget) && MS.Entertainment.Utilities.isValidGuid(spotlightItem.actionTarget))))
            }, _canDisplayMediaType: function _canDisplayMediaType(item) {
                var config = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                var showEditorialEpisodes = config.video.supportsEditorialTVEpisodes;
                var canDisplayMediaType = false;
                if (item && item.actionType && item.actionType.mediaType)
                    if (item.isFlexHub)
                        canDisplayMediaType = true;
                    else
                        switch (item.actionType.mediaType) {
                            case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernGame:
                            case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.PhoneGame:
                            case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.WindowsGame:
                            case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.XboxGame:
                                canDisplayMediaType = MS.Entertainment.Utilities.isGamesApp;
                                break;
                            case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Album:
                            case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Artist:
                            case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Movie:
                            case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Series:
                            case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Episode:
                                canDisplayMediaType = false;
                                break
                        }
                return canDisplayMediaType
            }, wrapItem: function wrapItem(item) {
                var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                if (item.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad)
                    MS.Entertainment.ViewModels.SpotlightViewModel.WrapAd(item);
                else if (item.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.WebBlend)
                    MS.Entertainment.ViewModels.SpotlightViewModel.WrapWebBlendAction(item);
                else if (item.actionType)
                    setProperty(item, "doclick", this.promoClicked);
                return item
            }, promoClicked: function promoClicked(e) {
                var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                if (!stateService.servicesEnabled)
                    return MS.Entertainment.UI.Shell.showAppUpdateDialog();
                var spotlightItem = e.target;
                if (spotlightItem.action || !spotlightItem.actionType)
                    if (!this._isOnline) {
                        var popOverParameters = null;
                        popOverParameters = {itemConstructor: "MS.Entertainment.UI.Controls.FailedPanel"};
                        return MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver(popOverParameters)
                    }
                    else
                        return;
                if (spotlightItem.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad)
                    MS.Entertainment.Utilities.Telemetry.logAdClicked(spotlightItem);
                var popOverConstructor = null;
                switch (spotlightItem.actionType.mediaType) {
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Movie:
                        popOverConstructor = "MS.Entertainment.Pages.MovieInlineDetails";
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Artist:
                        popOverConstructor = "MS.Entertainment.Pages.MusicArtistInlineDetails";
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Album:
                        popOverConstructor = "MS.Entertainment.Pages.MusicAlbumInlineDetails";
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Series:
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.Episode:
                        popOverConstructor = "MS.Entertainment.Pages.TvSeriesInlineDetails";
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernGame:
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.XboxGame:
                        popOverConstructor = "MS.Entertainment.Pages.GameInlineDetails";
                        break;
                    case MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernPDLC:
                        popOverConstructor = "MS.Entertainment.Pages.ModernGameExtraInlineDetails";
                        break
                }
                var mediaItem = WinJS.Binding.unwrap(spotlightItem);
                if (spotlightItem.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad)
                    MS.Entertainment.Platform.PlaybackHelpers.showImmersiveDetails(mediaItem, true);
                else if (spotlightItem.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.FlexHub || spotlightItem.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ZuneFlexHub) {
                    var stateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (!stateService.servicesEnabled)
                        return MS.Entertainment.UI.Shell.showAppUpdateDialog();
                    MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateTo(MS.Entertainment.UI.Monikers.flexHubPage, MS.Entertainment.UI.Monikers.flexHub, null, {query: mediaItem.actionTarget})
                }
                else {
                    var popOverParameters = {itemConstructor: popOverConstructor};
                    popOverParameters.dataContext = {
                        data: mediaItem, location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace
                    };
                    if (spotlightItem.isGameExtra && mediaItem.parentItem) {
                        mediaItem.parentItem.defaultPlatformType = mediaItem.defaultPlatformType;
                        mediaItem.parentItem.hydrate().done(function success() {
                            popOverParameters.dataContext.inlineExtraData = mediaItem.parentItem;
                            MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                        }, function failed() {
                            MS.Entertainment.ViewModels.fail("Failed to hydrate spotlight extra parent item", null, MS.Entertainment.UI.Debug.errorLevel.low)
                        })
                    }
                    else
                        MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                }
            }, _createFeaturedObject: function _createFeaturedObject(spotlightItems) {
                return {bindableItems: spotlightItems.bindableItems}
            }, _setDefaultItems: function _setDefaultItems(markError) {
                var spotlightItems = new MS.Entertainment.ObservableArray;
                for (var i = 0; i < this.maxItems; i++)
                    spotlightItems.push(this.wrapItem(this._defaultItem()));
                this.items = markError ? null : spotlightItems;
                this.featuredObject = this._createFeaturedObject(spotlightItems);
                if (markError)
                    WinJS.Promise.timeout().then(function setOfflinePanel() {
                        this.featuredObject = null
                    }.bind(this))
            }, _defaultItem: function _defaultItem() {
                return {primaryText: String.empty}
            }, _onNetworkStatusChanged: function _onNetworkStatusChanged(newValue) {
                window.msWriteProfilerMark("spotlightViewModel_ onNetworkStatusChanged: " + newValue);
                var isOnline = false;
                switch (newValue) {
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
                if (isOnline !== this._isOnline) {
                    this._isOnline = isOnline;
                    if (this._modelReady)
                        if (isOnline)
                            this.getItems()
                }
            }, _dashboardRefreshChanged: function _dashboardRefreshChanged() {
                if (!this._dashboardFrozen) {
                    if (this._modelReady)
                        this.getItems(true)
                }
                else
                    this._refreshOnDashboardThaw = true
            }, dashboardFreezeHandler: function dashboardFreezeHandler() {
                this._dashboardFrozen = true
            }, dashboardThawHandler: function dashboardThawHandler() {
                if (this._refreshOnDashboardThaw) {
                    this._refreshOnDashboardThaw = false;
                    if (this._modelReady)
                        WinJS.Promise.timeout(MS.Entertainment.UI.DashboardRefresherService.refreshDelayTime).then(function timeoutFunction() {
                            this.getItems(true)
                        }.bind(this))
                }
                this._dashboardFrozen = false
            }
    }, {
        WrapAd: function WrapAd(item) {
            var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
            var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
            MS.Entertainment.ViewModels.assert(item.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad, "cant wrap a non-ad in an ad");
            setProperty(item, "caption", String.load(String.id.IDS_ADVERTISEMENT));
            if (item.actionType && item.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.ActionType.Web) {
                var action = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.externalAdNavigate);
                action.parameter = {link: item.actionTarget};
                setProperty(item, "action", action);
                setProperty(item, "doclick", MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function executeAction() {
                    action.executed(item.actionTarget)
                }))
            }
        }, WrapWebBlendAction: function WrapWebBlendAction(item) {
                var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                var actionTarget = item.actionTarget && MS.Entertainment.UI.Actions.ActionIdentifiers[item.actionTarget];
                MS.Entertainment.ViewModels.assert(item.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.WebBlend, "cant wrap a non-WebBlend Action");
                MS.Entertainment.ViewModels.assert(actionTarget, "invalid action target passed in");
                if (item.actionType && item.actionType.location === MS.Entertainment.Data.Augmenter.Spotlight.ActionType.WebBlend && actionTarget)
                    setProperty(item, "doclick", MS.Entertainment.Utilities.bindAndMarkSupportedForProcessing(function executeAction() {
                        var action = actionService.getAction(actionTarget);
                        action.execute()
                    }))
            }
    })})
