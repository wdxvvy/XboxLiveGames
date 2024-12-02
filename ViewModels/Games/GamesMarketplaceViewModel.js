/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/Playbackhelpers.js", "/Framework/data/queries/marketplacequeries.js", "/Framework/querywatcher.js", "/Framework/stringids.js", "/Framework/utilities.js");
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesMarketplaceQueryViewModelBaseMixIn: {
        items: null, groupItems: null, sortItems: null, isFailed: false, titleOverride: null, largeItemIndex: -1
    }});
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesMarketplaceQueryViewModelBase: WinJS.Class.mix(function GamesMarketplaceQueryViewModelBaseConstructor() {
        this._initObservable(Object.create(MS.Entertainment.ViewModels.GamesMarketplaceQueryViewModelBaseMixIn))
    }, WinJS.Utilities.eventMixin, WinJS.Binding.mixin, WinJS.Binding.expandProperties(MS.Entertainment.ViewModels.GamesMarketplaceQueryViewModelBaseMixIn))});
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesMarketplace: WinJS.Class.derive(MS.Entertainment.ViewModels.GamesMarketplaceQueryViewModelBase, function gamesMarketplaceConstructor(view) {
        MS.Entertainment.ViewModels.GamesMarketplaceQueryViewModelBase.prototype.constructor.call(this);
        this.view = view;
        this.items = {};
        this.groupItems = [];
        this.sortItems = [];
        this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("games_marketplace");
        if (this.view === MS.Entertainment.ViewModels.GamesMarketplace.Views.flexHub)
            this.templateSelectorConstructor = MS.Entertainment.Pages.GameFlexHubTemplateSelector
    }, {
        _queryWatcher: null, _queryUrl: null, _results: null, _pendingQueryExecute: null, templateSelectorConstructor: null, _genericGroup: {get: function get_genericGroup() {
                    return {
                            itemTemplate: "Components/Games/GamesSharedTemplates.html#gameTemplate", slotSize: {
                                    width: 295, height: 165
                                }, itemSize: {
                                    width: 295, height: 165
                                }
                        }
                }}, _genericWindowsGenreGroup: {get: function get_genericWindowsGenreGroup() {
                    return {desiredItemTypes: [MS.Entertainment.Data.Query.edsMediaType.metroGame]}
                }}, dispose: function dispose() {
                if (this._pendingQueryExecute) {
                    WinJS.Binding.unwrap(this._pendingQueryExecute).cancel();
                    this._pendingQueryExecute = null
                }
            }, isWindowsMarketplace: function isWindowsMarketplace() {
                var windowsTestExpression = /^windows/i;
                return windowsTestExpression.test(this.view)
            }, isCurrentQuery: function isCurrentQuery() {
                return !this._pendingQueryExecute
            }, beginQuery: function beginQuery(queryParams, notify) {
                var query = null;
                this.isFailed = false;
                if (this._pendingQueryExecute) {
                    WinJS.Binding.unwrap(this._pendingQueryExecute).cancel();
                    this._pendingQueryExecute = null
                }
                if (!queryParams) {
                    MS.Entertainment.ViewModels.assert(false, "GamesMarketplaceViewModel requires query parameters to execute");
                    return
                }
                if (queryParams.query)
                    query = new queryParams.query;
                else
                    query = new(MS.Entertainment.ViewModels.GamesMarketplace.Groups[this.view]).query;
                if (queryParams.baseUrl)
                    query.baseUrl = queryParams.baseUrl;
                if (queryParams.filterBy)
                    query.filterBy = queryParams.filterBy;
                if (queryParams.orderBy)
                    query.orderBy = queryParams.orderBy;
                if (queryParams.desiredItemTypes)
                    query.desiredMediaItemTypes = queryParams.desiredItemTypes;
                if (queryParams.genre)
                    query.genre = queryParams.genre;
                if (this.view === MS.Entertainment.ViewModels.GamesMarketplace.Views.flexHub) {
                    var currentPage = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).currentPage;
                    if (currentPage.options) {
                        query.spotlight = currentPage.options.query;
                        this._setLargeItemIndex(0)
                    }
                }
                var notificationModification = new MS.Entertainment.UI.ContentNotification.NotificationModification(MS.Entertainment.UI.ContentNotification.listResult(), function getTitleId(game) {
                        return game.titleId
                    });
                notificationModification.modifyQuery(query);
                var socialBuzzDataSource = new MS.Entertainment.UI.SocialBuzz.SocialBuzzSource(notificationModification.createSender());
                socialBuzzDataSource.execute();
                this._queryWatcher.registerQuery(query);
                this._pendingQueryExecute = query.execute().then(function getContentQuerySuccess(q) {
                    this._pendingQueryExecute = null;
                    var sort = null;
                    var group = null;
                    var oldValue = null;
                    if (q.result) {
                        this.buildGenresListFromResult(q.result, this.view);
                        group = this.setGroupItemsFromView(this.view);
                        sort = this.setSortItemsFromView(this.view);
                        var completeQuery = function CompleteQuery() {
                                if (notify) {
                                    oldValue = this._results;
                                    this._results = {
                                        items: this.items, defaultSort: sort, defaultGroup: group
                                    };
                                    this.dispatchEvent(MS.Entertainment.ViewModels.GamesMarketplace.events.viewChanged, {
                                        sender: this, newValue: this._results, oldValue: oldValue
                                    })
                                }
                                else {
                                    oldValue = this._results ? this._results.items : null;
                                    this.dispatchEvent(MS.Entertainment.ViewModels.GamesMarketplace.events.itemsChanged, {
                                        sender: this, newValue: this.items, oldValue: oldValue
                                    })
                                }
                            }.bind(this);
                        if (this.view === MS.Entertainment.ViewModels.GamesMarketplace.Views.flexHub) {
                            this.titleOverride = q.result.name;
                            if (q.result.entries)
                                q.result.entries.toArray().then(function convertResults(array) {
                                    this._convertFlexHubResults(array).then(function setFlexHubItems(items) {
                                        if (items)
                                            this.items = items;
                                        completeQuery()
                                    }.bind(this))
                                }.bind(this))
                        }
                        else {
                            this.items = q.result.items;
                            completeQuery()
                        }
                    }
                }.bind(this), function getContentQueryError(e) {
                    this._pendingQueryExecute = null;
                    if (!(e instanceof Error && e.message === "Canceled"))
                        this.isFailed = true
                }.bind(this))
            }, _convertFlexHubResults: function _convertFlexHubResults(resultArray) {
                var item = null;
                var mediaItem = null;
                var augmenter = null;
                var detailsPromises = [];
                var serviceIds = [];
                var originalItems = [];
                var impressionGuid = null;
                if (resultArray)
                    for (var i = 0; i < resultArray.length; i++)
                        if (resultArray[i].items && resultArray[i].items[0]) {
                            item = resultArray[i].items[0];
                            if (item.actionType.mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.ModernGame)
                                augmenter = MS.Entertainment.Data.Augmenter.Spotlight.FlexHubModernGame;
                            else if (item.actionType.mediaType === MS.Entertainment.Data.Augmenter.Spotlight.MediaType.XboxGame)
                                augmenter = MS.Entertainment.Data.Augmenter.Spotlight.FlexHubXboxGame;
                            else
                                MS.Entertainment.ViewModels.assert(false, "GamesMarketplaceViewModel found unexpected item in flexhub");
                            mediaItem = augmenter ? MS.Entertainment.Data.augment(WinJS.Binding.unwrap(item), augmenter) : WinJS.Binding.unwrap(item);
                            if (mediaItem.serviceId) {
                                serviceIds.push(mediaItem.serviceId);
                                impressionGuid = mediaItem.impressionGuid
                            }
                            originalItems.push(mediaItem)
                        }
                while (serviceIds.length > 0) {
                    detailsQuery = new MS.Entertainment.Data.Query.Games.FlexHubGameDetails;
                    detailsQuery.serviceIds = serviceIds.splice(0, detailsQuery.chunkSize);
                    detailsQuery.impressionGuid = impressionGuid;
                    detailsPromises.push(detailsQuery.execute().then(function detailsQuerySuccess(q) {
                        return q
                    }.bind(this)))
                }
                return WinJS.Promise.join(detailsPromises).then(function mergeFlexHubResults(queries) {
                        return this._mergeFlexHubDetailsResults(queries, originalItems)
                    }.bind(this))
            }, _mergeFlexHubDetailsResults: function _mergeFlexHubDetailsResults(queries, originalItems) {
                var i,
                    j,
                    k;
                var flexHubItems = [];
                var arrayPromises = [];
                var results = [];
                if (!queries)
                    return WinJS.Promise.as();
                for (j = 0; j < queries.length; j++)
                    if (queries[j] && queries[j].result && queries[j].result.items)
                        arrayPromises.push(queries[j].result.items.toArray());
                return WinJS.Promise.join(arrayPromises).then(function joinArrays(arrays) {
                        var augmentedResult = null;
                        if (!arrays)
                            return flexHubItems;
                        for (i = 0; i < arrays.length; i++)
                            results = results.concat(arrays[i]);
                        for (j = 0; j < originalItems.length; j++)
                            for (k = 0; k < results.length; k++)
                                if (originalItems[j].serviceId === results[k].serviceId) {
                                    if (results[k].defaultPlatformType === MS.Entertainment.Data.Augmenter.GamePlatform.Modern)
                                        augmentedResult = MS.Entertainment.Data.augment(results[k], MS.Entertainment.Data.Augmenter.Marketplace.MetroGame);
                                    else
                                        augmentedResult = MS.Entertainment.Data.augment(results[k], MS.Entertainment.Data.Augmenter.Marketplace.XboxGame);
                                    if (augmentedResult) {
                                        augmentedResult.flexHubItemDescription = originalItems[j].flexHubItemDescription;
                                        flexHubItems.push(augmentedResult)
                                    }
                                    break
                                }
                        return flexHubItems
                    }.bind(this))
            }, buildGenresListFromResult: function buildGenresListFromResult(result, view) {
                var groupItems = MS.Entertainment.ViewModels.GamesMarketplace.GroupItems;
                var viewGroupItems = MS.Entertainment.ViewModels.GamesMarketplace.Groups[view].groupItems;
                if (result && result.genreList) {
                    viewGroupItems = viewGroupItems.slice(0, 1);
                    result.genreList.forEach(function(genre) {
                        var genreGroup = this._genericWindowsGenreGroup;
                        genreGroup.label = genre.Name;
                        genreGroup.genre = genre.Name;
                        groupItems[genre.Name] = genreGroup;
                        viewGroupItems.push(genre.Name)
                    }.bind(this))
                }
                MS.Entertainment.ViewModels.GamesMarketplace.Groups[view].groupItems = viewGroupItems
            }, setSortItemsFromView: function setSortItemsFromView(view) {
                return this._setItemsFromView(view, true)
            }, setGroupItemsFromView: function setGroupItemsFromView(view) {
                return this._setItemsFromView(view, false)
            }, _setItemsFromView: function _setItemsFromView(view, isSortItems) {
                var itemsToAdd = [];
                var defaultItem = this._genericGroup;
                var viewGroup = MS.Entertainment.ViewModels.GamesMarketplace.Groups[view];
                var viewItems = isSortItems ? viewGroup.sortItems : viewGroup.groupItems;
                var items = isSortItems ? MS.Entertainment.ViewModels.GamesMarketplace.SortItems : MS.Entertainment.ViewModels.GamesMarketplace.GroupItems;
                if (view && viewItems) {
                    var defaultIndex = isSortItems ? viewGroup.defaultSort : viewGroup.defaultGroup;
                    defaultItem.label = items[defaultIndex].label;
                    defaultItem.desiredItemTypes = items[defaultIndex].desiredItemTypes;
                    defaultItem.orderBy = items[defaultIndex].orderBy;
                    defaultItem.genre = items[defaultIndex].genre;
                    defaultItem.id = defaultIndex;
                    defaultItem.itemTemplate = viewGroup.itemTemplate;
                    defaultItem.query = viewGroup.query;
                    itemsToAdd.push(defaultItem);
                    for (var i = 0; i < viewItems.length; i++) {
                        var toAdd = this._genericGroup;
                        var item = viewItems[i];
                        toAdd.label = items[item].label;
                        toAdd.desiredItemTypes = items[item].desiredItemTypes;
                        toAdd.orderBy = items[item].orderBy;
                        toAdd.genre = items[item].genre;
                        toAdd.itemTemplate = viewGroup.itemTemplate;
                        toAdd.id = defaultIndex + i;
                        toAdd.query = viewGroup.query;
                        if (item !== defaultIndex)
                            itemsToAdd.push(toAdd)
                    }
                    if (isSortItems)
                        this.sortItems = itemsToAdd;
                    else
                        this.groupItems = itemsToAdd
                }
                return defaultItem
            }, defaultGroupItem: function defaultGroupItem() {
                var viewGroup = MS.Entertainment.ViewModels.GamesMarketplace.Groups[this.view];
                if (viewGroup.defaultGroup)
                    return MS.Entertainment.ViewModels.GamesMarketplace.GroupItems[viewGroup.defaultGroup];
                else
                    return viewGroup
            }, _setLargeItemIndex: function _setLargeItemIndex(value) {
                if (this.largeItemIndex !== value) {
                    var oldValue = this.largeItemIndex;
                    this.largeItemIndex = value;
                    this.dispatchEvent(MS.Entertainment.ViewModels.GamesMarketplace.events.largeItemIndexChanged, {
                        sender: this, newValue: this.largeItemIndex, oldValue: oldValue
                    })
                }
            }
    }, {
        Views: {flexHub: "flexHub"}, events: {
                viewChanged: "viewChanged", itemsChanged: "itemsChanged", largeItemIndexChanged: "largeItemIndexChanged"
            }, Groups: (function() {
                var groups;
                return {get: function() {
                            if (!groups)
                                groups = {
                                    windowsnewrelease: {
                                        query: MS.Entertainment.Data.Query.Games.GameMetroBrowse, itemTemplate: "Components/Games/GamesSharedTemplates.html#gameTemplate", slotSize: {
                                                width: 295, height: 165
                                            }, itemSize: {
                                                width: 295, height: 165
                                            }
                                    }, windowsbygenre: {
                                            query: MS.Entertainment.Data.Query.Games.GameMetroByGenre, itemTemplate: "Components/Games/GamesSharedTemplates.html#gameTemplateNoGenreNoPlatform", groupItems: ["allGenresWindows"], defaultGroup: "allGenresWindows", slotSize: {
                                                    width: 295, height: 165
                                                }, itemSize: {
                                                    width: 295, height: 165
                                                }
                                        }, flexHub: {
                                            query: MS.Entertainment.Data.Query.gamesFlexHubQuery, slotSize: {
                                                    width: 295, height: 165
                                                }, itemSize: {
                                                    width: 295, height: 165
                                                }, itemMargin: {
                                                    top: 4, bottom: 4
                                                }, multiSize: true
                                        }
                                };
                            return groups
                        }}
            })(), GroupItems: (function() {
                var groupItems;
                return {get: function() {
                            if (!groupItems)
                                groupItems = {allGenresWindows: {
                                        label: String.load(String.id.IDS_FILTER_ALL_GENRES), desiredItemTypes: [MS.Entertainment.Data.Query.edsMediaType.metroGame]
                                    }};
                            return groupItems
                        }}
            })(), SortItems: (function() {
                var sortItems;
                return {get: function() {
                            if (!sortItems)
                                sortItems = {
                                    releaseDate: {
                                        label: String.load(String.id.IDS_MARKETPLACE_SORT_RELEASE_DATE), orderBy: MS.Entertainment.Data.Query.edsSortOrder.releaseDate
                                    }, userRating: {
                                            label: String.load(String.id.IDS_MARKETPLACE_SORT_USER_RATING), orderBy: MS.Entertainment.Data.Query.edsSortOrder.userRating
                                        }, bestSelling: {
                                            label: String.load(String.id.IDS_MARKETPLACE_SORT_BEST_SELLING), orderBy: MS.Entertainment.Data.Query.edsSortOrder.paidCountDaily
                                        }
                                };
                            return sortItems
                        }}
            })()
    })});
WinJS.Namespace.define("MS.Entertainment.Pages", {GameFlexHubTemplateSelector: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryTemplateSelector, function gameFlexHubTemplateSelector(galleryView) {
        MS.Entertainment.UI.Controls.GalleryTemplateSelector.prototype.constructor.call(this);
        this._galleryView = galleryView;
        this.addTemplate("marketplaceGame", "Components/Games/GamesSharedTemplates.html#gameFlexHubTemplate");
        this.addTemplate("flexHubBigItem", "Components/Games/GamesSharedTemplates.html#gamesFlexHubBigItemViewTemplate")
    }, {
        ensureItemTemplatesLoaded: function ensureItemTemplatesLoaded() {
            return this.ensureTemplatesLoaded(["header", "marketplaceGame", "flexHubBigItem", "emptyGallery", ])
        }, onSelectTemplate: function onSelectTemplate(item) {
                var template = null;
                if (item && item.isHeader)
                    template = "header";
                else if (item && item.index === 0)
                    template = "flexHubBigItem";
                else
                    template = "marketplaceGame";
                this.ensureTemplatesLoaded([template]);
                return this.getTemplateProvider(template)
            }, getPanelTemplatePath: function getPanelTemplatePath(item) {
                return "MS.Entertainment.Pages.GameInlineDetails"
            }
    })})
