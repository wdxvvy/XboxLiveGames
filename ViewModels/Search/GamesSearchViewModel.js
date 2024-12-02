/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesSearchTemplates: {all: {
            tap: MS.Entertainment.UI.Controls.GalleryControl.Tap.invokeOnly, layout: MS.Entertainment.UI.Controls.GalleryControl.Layout.grid, invokeBehavior: MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver, invokeHelperFactory: MS.Entertainment.UI.Controls.GalleryControlInvocationHelper.create, emptyGalleryTemplate: "Controls/GalleryControl.html#listViewEmptySearchGalleryTemplate", forceInteractive: true, grouped: true, grouperType: MS.Entertainment.UI.Controls.SearchResultsGrouper, grouperField: "defaultPlatformType", headerType: MS.Entertainment.UI.Controls.GalleryControl.HeaderType.inPlace, horizontal: true, groupHeaderPosition: "inline", hideShadow: true, backdropColor: "#EBEBEB", multiSize: true, startNewColumnOnHeaders: false, slotSize: {
                    width: 295, height: 165
                }, itemSize: {
                    width: 295, height: 165
                }, itemMargin: {
                    top: 4, bottom: 4
                }
        }}});
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesSearchResultCounts: MS.Entertainment.defineObservable(function gamesSearchResultCountsConstructor(){}, {
        allCount: -1, hcrCount: -1, gameWinMPCount: -1, backup: function backup() {
                return {
                        allCount: this.allCount, hcrCount: this.hcrCount, gameWinMPCount: this.gameWinMPCount
                    }
            }, restore: function restore(savedSearchResultCounts) {
                this.allCount = savedSearchResultCounts.allCount;
                this.hcrCount = savedSearchResultCounts.hcrCount;
                this.gameWinMPCount = savedSearchResultCounts.gameWinMPCount
            }, clearCounts: function clearCounts() {
                this.allCount = -1;
                this.hcrCount = -1;
                this.gameWinMPCount = -1
            }
    })});
MS.Entertainment.ServiceLocator.register(MS.Entertainment.Services.searchResultCounts, function getSearchResultCountsService() {
    return new MS.Entertainment.ViewModels.GamesSearchResultCounts
});
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesSearchAutomationIds: {gamesSearchAll: "gamesSearchAll_modifier"}});
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesSearchViewModel: WinJS.Class.derive(MS.Entertainment.ViewModels.NewSearchViewModel, function gamesSearchViewModelConstructor(searchType, xboxGamesMarketplaceEnabled, metroGamesMarketplaceEnabled) {
        this._defaultModifierSelection = MS.Entertainment.ViewModels.SearchViewModel.SearchCurrentFilter;
        this._searchTypeResults = MS.Entertainment.ViewModels.GamesSearchViewModel.searchTypeResults;
        this._views = MS.Entertainment.ViewModels.GamesSearchViewModel.Views;
        this._xboxGamesMarketplaceEnabled = xboxGamesMarketplaceEnabled;
        this._metroGamesMarketplaceEnabled = metroGamesMarketplaceEnabled;
        this._maxResultCount = 20;
        this._hideHeaderForHCR = true;
        this._addHcrToResults = true;
        MS.Entertainment.ViewModels.NewSearchViewModel.prototype.constructor.call(this, searchType)
    }, {
        _xboxGamesMarketplaceEnabled: false, _metroGamesMarketplaceEnabled: false, getModifierDefinition: function getModifierDefinition(view) {
                var modifiers = {itemFactory: function() {
                            var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                            var nodes = [new MS.Entertainment.ViewModels.Node(MS.Entertainment.ViewModels.GamesSearchAutomationIds.gamesSearchAll, String.id.IDS_SEARCH_FILTER_ALL, new MS.Entertainment.ViewModels.NodeValues(null, null, {
                                        showXboxGames: true, showWindowsGames: true
                                    }))];
                            return nodes
                        }.bind(this)};
                return modifiers
            }, _windowsGames: function _windowsGames(query, resultType, options) {
                this._addSearchCallback(query, resultType, options, "gameWinMPResult", options.showWindowsGames)
            }, _updateResultCounts: function _updateResultCounts(options) {
                if (options.showWindowsGames)
                    this._addResultCount("gameWinMPResult", "gameWinMPCount", MS.Entertainment.ViewModels.GamesSearchViewModel.maxResultsPerGroup);
                var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                searchResultCounts.hcrCount = (this._hcrResult && this._hcrResult.hcrResult) ? 1 : 0;
                searchResultCounts.allCount += searchResultCounts.hcrCount
            }, _getHCRResult: function _getHCRResult() {
                return new MS.Entertainment.ViewModels.GamesHCRResult
            }, _searchCompleted: function _searchCompleted() {
                MS.Entertainment.ViewModels.NewSearchViewModel.prototype._searchCompleted.call(this);
                var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                if (searchResultCounts.allCount === -1) {
                    searchResultCounts.allCount = 0;
                    searchResultCounts.hcrCount = 0;
                    searchResultCounts.gameWinMPCount = 0
                }
            }, _clearSearch: function _clearSearch() {
                this._setLargeItemIndex(-1);
                MS.Entertainment.ViewModels.NewSearchViewModel.prototype._clearSearch.call(this)
            }
    }, {
        ViewTypes: {allGames: "allGames"}, Views: {allGames: new MS.Entertainment.ViewModels.NodeValues(null, null, {selectedTemplate: MS.Entertainment.ViewModels.GamesSearchTemplates.all})}, maxResultsPerGroup: 20, searchTypeResults: {allGames: [{
                        callFunction: "_findHCR", maxResults: 1, requiredForDisplay: true
                    }, {
                        callFunction: "_windowsGames", maxResults: 20, mediaType: Microsoft.Entertainment.Queries.ObjectType.game, gameType: MS.Entertainment.Data.Augmenter.GamePlatform.Modern
                    }, ]}
    })})
