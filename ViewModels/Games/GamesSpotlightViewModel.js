/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/observablearray.js", "/Framework/serviceLocator.js", "/Framework/stringids.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesSpotlightViewModel: MS.Entertainment.derive(MS.Entertainment.ViewModels.SpotlightViewModel, function GamesSpotlightViewModelConstructor(query) {
        this.base(query)
    }, {
        _detailsQueryWatcher: null, _originalItems: null, notificationModification: null, detailsQuery: function detailsQuery() {
                return new Error("detailsQuery for GamesSpotlightViewModel is abstract")
            }, populateItems: function populateItems(queryItems) {
                var i;
                var serviceIds = [];
                var detailsQuery = null;
                var detailsPromises = [];
                var originalItems = [];
                var impressionGuid = null;
                var stringifiedNewItems = JSON.stringify(queryItems);
                if (stringifiedNewItems === this._previousStringifiedItems)
                    return;
                this._previousStringifiedItems = stringifiedNewItems;
                if (queryItems && queryItems.length > 0 && queryItems[0] && queryItems[0].items) {
                    queryItems.sort(function sortQueryItems(a, b) {
                        return a.sequenceId - b.sequenceId
                    });
                    queryItems.splice(this.maxItems, queryItems.length - this.maxItems);
                    for (i = 0; i < queryItems.length; i++)
                        if (queryItems[i].items.length > 1)
                            serviceIds = serviceIds.concat(queryItems[i].items.map(function getServiceId(item) {
                                originalItems.push(item);
                                impressionGuid = item.impressionGuid;
                                return item.serviceId
                            }.bind(this)));
                        else {
                            originalItems.push(queryItems[i].items[0]);
                            if (queryItems[i].items[0].serviceId && queryItems[i].items[0].contentType !== MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad) {
                                serviceIds.push(queryItems[i].items[0].serviceId);
                                impressionGuid = queryItems[i].items[0].impressionGuid
                            }
                        }
                }
                this._originalItems = originalItems;
                while (serviceIds.length > 0) {
                    detailsQuery = this.detailsQuery();
                    detailsQuery.serviceIds = serviceIds.splice(0, detailsQuery.chunkSize);
                    detailsQuery.impressionGuid = impressionGuid;
                    if (this.notificationModification)
                        this.notificationModification.modifyQuery(detailsQuery);
                    this._detailsQueryWatcher.registerQuery(detailsQuery);
                    detailsPromises.push(detailsQuery.execute().then(function detailsQuerySuccess(q) {
                        return q
                    }.bind(this), function detailsQueryError(e) {
                        this._setDefaultItems(true)
                    }.bind(this)))
                }
                return WinJS.Promise.join(detailsPromises).then(this._mergeDetailsResults.bind(this))
            }, _mergeDetailsResults: function _mergeDetailsResults(queries) {
                var i,
                    j,
                    k;
                var spotlightItems = new MS.Entertainment.ObservableArray;
                var arrayPromises = [];
                var results = [];
                var featuredContentDataSource = null;
                if (queries) {
                    for (j = 0; j < queries.length; j++)
                        if (queries[j] && queries[j].result && queries[j].result.items)
                            arrayPromises.push(queries[j].result.items.toArray());
                    return WinJS.Promise.join(arrayPromises).then(function joinArrays(arrays) {
                            if (arrays) {
                                for (i = 0; i < arrays.length; i++)
                                    results = results.concat(arrays[i]);
                                for (j = 0; j < this._originalItems.length; j++) {
                                    for (k = 0; k < results.length; k++)
                                        if (this._originalItems[j].serviceId === results[k].serviceId) {
                                            if (this._canDisplayMediaType(this._originalItems[j]))
                                                spotlightItems.push(this.wrapItem(this._originalItems[j], results[k]));
                                            break
                                        }
                                    if (j === spotlightItems.length && this._canDisplayMediaType(this._originalItems[j]))
                                        spotlightItems.push(this.wrapItem(this._originalItems[j]))
                                }
                                featuredContentDataSource = {bindableItems: spotlightItems.bindableItems};
                                this.items = spotlightItems;
                                this.featuredObject = featuredContentDataSource;
                                if (!this._isOnline)
                                    WinJS.Promise.timeout().then(function setOfflinePanel() {
                                        this.featuredObject = null
                                    }.bind(this))
                            }
                        }.bind(this))
                }
            }
    })});
WinJS.Namespace.define("MS.Entertainment.ViewModels", {MetroGamesSpotlightViewModel: MS.Entertainment.derive(MS.Entertainment.ViewModels.GamesSpotlightViewModel, function MetroGamesSpotlightViewModelConstructor(query) {
        this.base(query);
        this._detailsQueryWatcher = new MS.Entertainment.Framework.QueryWatcher("metroGamesSpotlightViewModel")
    }, {
        detailsQuery: function detailsQuery() {
            return new MS.Entertainment.Data.Query.Games.GameMetroDetails
        }, wrapItem: function wrapItem(item, secondItem) {
                var setProperty = MS.Entertainment.Utilities.BindingAgnostic.setProperty;
                if (item.type === MS.Entertainment.Data.Augmenter.Spotlight.ItemType.Ad)
                    MS.Entertainment.ViewModels.SpotlightViewModel.WrapAd(item);
                else
                    setProperty(item, "doclick", this.promoClicked);
                if (secondItem) {
                    setProperty(item, "titleId", secondItem.titleId);
                    setProperty(item, "contentNotifications", secondItem.contentNotifications)
                }
                return item
            }, _canDisplayMediaType: function _canDisplayMediaType(item) {
                return item && item.defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern
            }
    })})
