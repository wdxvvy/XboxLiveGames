/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/observablearray.js", "/Framework/serviceLocator.js", "/Framework/stringids.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesHubBasePanel: WinJS.Class.define(function gamesHubBasePanelConstructor(socialHelper, query) {
        MS.Entertainment.ViewModels.assert(socialHelper, "GamesHubBasePanel requires socialHelper");
        MS.Entertainment.ViewModels.assert(query, "GamesHubBasePanel requires query");
        this._socialHelper = socialHelper;
        var notificationModification = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), function getTitleId(game) {
                return game.titleId
            });
        this.viewModel.notificationModification = notificationModification;
        this.viewModel.getItems().done(function loadedComplete() {
            MS.Entertainment.Utilities.addEventHandlers(this._socialHelper, {dataChanged: this._replaceTitles.bind(this)});
            if (socialHelper.buzzingTitles && socialHelper.userTitlesTable)
                this._replaceTitles()
        }.bind(this))
    }, {
        _platformType: MS.Entertainment.Data.Augmenter.GamePlatform.Unknown, _getServiceId: null, _savedTitles: null, _socialHelper: null, _detailsQueryWatcher: null, panelAction: null, viewModel: null, doNotRaisePanelReady: true, _replaceTitles: function _replaceTitles() {
                var titles = [];
                var i,
                    j;
                var add = true;
                var item = null;
                if (!this.viewModel.items)
                    return;
                this._socialHelper.getSocialBuzzNotifications(this.viewModel.notificationModification.createSender());
                for (i = 0; i < this._socialHelper.buzzingTitles.length && titles.length <= this.viewModel.maxItems; i++) {
                    var title = MS.Entertainment.Data.augment(this._socialHelper.buzzingTitles[i], MS.Entertainment.Data.Augmenter.XboxLive.BeaconGame);
                    if (!this._socialHelper.userTitlesTable[title.titleId] && title.isGame && title.defaultPlatformType === this._platformType) {
                        add = true;
                        for (j = 0; j < this.viewModel.items.length; j++) {
                            item = this.viewModel.items.item(j);
                            if (item.titleId === title.titleId) {
                                add = false;
                                break
                            }
                        }
                        if (add)
                            titles.push(title)
                    }
                }
                this._replaceTitlesWorker(titles)
            }, _replaceTitlesWorker: function _replaceTitlesWorker(titles) {
                if (titles.length) {
                    var serviceIds = [];
                    var detailsQuery = null;
                    var impressionGuid = null;
                    for (var i = 0; i < this.viewModel.items.length; i++)
                        if (this.viewModel.items.item(i).replaceable)
                            if (titles[serviceIds.length]) {
                                impressionGuid = titles[serviceIds.length].impressionGuid;
                                serviceIds.push(titles[serviceIds.length].hexTitleId)
                            }
                    if (serviceIds.length) {
                        detailsQuery = this.viewModel.detailsQuery();
                        detailsQuery.idType = MS.Entertainment.Data.Query.edsIdType.xboxHexTitle;
                        detailsQuery.serviceIds = serviceIds.splice(0, detailsQuery.chunkSize);
                        detailsQuery.impressionGuid = impressionGuid;
                        if (this.viewModel.notificationModification)
                            this.viewModel.notificationModification.modifyQuery(detailsQuery);
                        this._detailsQueryWatcher.registerQuery(detailsQuery);
                        detailsQuery.execute().then(function detailsQuerySuccess(q) {
                            if (q && q.result && q.result.items)
                                return q.result.items.toArray();
                            else
                                return titles
                        }, function detailsQueryError(e) {
                            return titles
                        }).done(function titleReplacement(newTitles) {
                            var replacedCount = 0;
                            this._savedTitles = [];
                            for (var i = 0; i < this.viewModel.items.length && replacedCount < newTitles.length; i++)
                                if (this.viewModel.items.item(i).replaceable) {
                                    var replacement = this.viewModel.wrapItem(newTitles[replacedCount++]);
                                    replacement.replaceable = true;
                                    this._savedTitles = this._savedTitles.concat(this.viewModel.items.splice(i, 1, replacement))
                                }
                        }.bind(this))
                    }
                }
                else if (this._socialHelper.buzzingTitles && !this._socialHelper.buzzingTitles.length) {
                    var item;
                    for (var i = 0; i < this.viewModel.items.length; i++) {
                        item = this.viewModel.items.item(i);
                        if (item.replaceable && this._savedTitles && this._savedTitles.length)
                            this.viewModel.items.splice(i, 1, this._savedTitles.shift());
                        if (item.contentNotifications)
                            item.contentNotifications.clear()
                    }
                    this._savedTitles = null
                }
            }
    })});
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesHubWindowsPanel: WinJS.Class.derive(MS.Entertainment.ViewModels.GamesHubBasePanel, function gamesHubWindowsPanelConstructor(socialHelper) {
        var query = new MS.Entertainment.Data.Query.pcGamesSpotlightQuery;
        this.viewModel = new MS.Entertainment.ViewModels.MetroGamesSpotlightViewModel(query);
        this.viewModel.maxItems = 7;
        MS.Entertainment.ViewModels.GamesHubBasePanel.prototype.constructor.apply(this, [socialHelper, query]);
        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
        var windowsGamesAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
        windowsGamesAction.disableWhenOffline = true;
        windowsGamesAction.disableOnServicesDisabled = true;
        windowsGamesAction.parameter = {
            page: "gamesWindowsMarketplace", hub: "gamesWindowsMarketplaceFeatured"
        };
        this.panelAction = {action: windowsGamesAction};
        this._detailsQueryWatcher = new MS.Entertainment.Framework.QueryWatcher("GamesHubWindowsPanel")
    }, {_platformType: MS.Entertainment.Data.Augmenter.GamePlatform.PC})})
