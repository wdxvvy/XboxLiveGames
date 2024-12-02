/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
WinJS.Namespace.define("MS.Entertainment.ViewModels", {SearchContractViewModel: WinJS.Class.define(null, {
        _searchPane: null, _linguisticAlternatives: null, lastSearchedTerm: null, loadSearchObject: function loadSearchObject() {
                if (this._searchPane)
                    return;
                var searchPane = MS.Entertainment.ViewModels.SearchContractViewModel.getForCurrentView();
                if (searchPane) {
                    this._searchPane = searchPane;
                    this._searchPane.addEventListener("querysubmitted", this.searchKeywordSubmitted, false);
                    this._searchPane.addEventListener("suggestionsrequested", this.searchKeywordSuggestionRequested, false);
                    this._searchPane.addEventListener("resultsuggestionchosen", this.searchResultSuggestionChosen, false)
                }
            }, showSearchPane: function showSearchPane() {
                if (!this._searchPane)
                    this.loadSearchObject();
                if (this._searchPane)
                    this._searchPane.show()
            }, searchKeywordSubmitted: function searchKeywordSubmitted(e) {
                var alternatives;
                var alternativeNum;
                var maxLinguisticAlternatives = 10;
                var useAlternativesForLocalContent;
                if (e && e.queryText) {
                    var searchKeyword = e.queryText.trim();
                    this.lastSearchedTerm = searchKeyword;
                    if (searchKeyword) {
                        useAlternativesForLocalContent = false;
                        if (useAlternativesForLocalContent && this._linguisticAlternatives) {
                            alternativeNum = Math.min(maxLinguisticAlternatives, this._linguisticAlternatives.size);
                            alternatives = [searchKeyword];
                            for (var i = 0; i < alternativeNum; i++)
                                alternatives.push(this._linguisticAlternatives.getAt(i));
                            this._linguisticAlternatives = null
                        }
                        var options = {
                                keyword: searchKeyword, linguisticAlternatives: alternatives
                            };
                        MS.Entertainment.ViewModels.SearchContractViewModel._navigateToSearchPage(options);
                        return true
                    }
                }
                return false
            }, searchKeywordSuggestionRequested: function searchKeywordSuggestionRequested(e) {
                var maxWordWheelCount = 5;
                var that = this;
                if (e && e.queryText && e.request) {
                    var keyword = e.queryText.trim();
                    if (e.linguisticDetails && e.linguisticDetails.queryTextAlternatives.size)
                        this._linguisticAlternatives = e.linguisticDetails.queryTextAlternatives;
                    var suggestionRequest = e.request;
                    var deferral = suggestionRequest.getDeferral();
                    var query = null;
                    if (keyword && deferral) {
                        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                        if (MS.Entertainment.Utilities.isGamesApp);
                        if (query) {
                            query.keyword = keyword;
                            query.execute().then(function querySuccess(q) {
                                if (q.result.items)
                                    return q.result.items.itemsFromIndex(0, 0, maxWordWheelCount);
                                else
                                    return WinJS.Promise.wrap()
                            }, function queryFail(q) {
                                return WinJS.Promise.wrap()
                            }).then(function virtualListFilled(result) {
                                if (result) {
                                    var suggestionsToProvide = Math.min(result.items.length, maxWordWheelCount);
                                    for (var i = 0; i < result.items.length && i < maxWordWheelCount; i++)
                                        (function addItemToSuggestions() {
                                            var item = result.items[i].data;
                                            var imageUrl;
                                            var querySuggestion;
                                            var typeName;
                                            if (item) {
                                                var mediaType = item.mediaType;
                                                var videoType = -1;
                                                if (item.isSuggestion)
                                                    querySuggestion = true;
                                                else {
                                                    if (item.mediaType <= 0 && item.type)
                                                        switch (item.type.toLowerCase()) {
                                                            case"movie":
                                                                mediaType = Microsoft.Entertainment.Queries.ObjectType.video;
                                                                videoType = Microsoft.Entertainment.Queries.VideoType.movie;
                                                                break;
                                                            case"series":
                                                                mediaType = Microsoft.Entertainment.Queries.ObjectType.tvSeries;
                                                                break;
                                                            case"artist":
                                                                mediaType = Microsoft.Entertainment.Queries.ObjectType.person;
                                                                break;
                                                            case"album":
                                                                mediaType = Microsoft.Entertainment.Queries.ObjectType.album;
                                                                break;
                                                            case"track":
                                                                mediaType = Microsoft.Entertainment.Queries.ObjectType.track;
                                                                break
                                                        }
                                                    typeName = MS.Entertainment.Utilities.getMediaTypeName(mediaType, videoType, item.itemPlatformType)
                                                }
                                                var tag = item.name + ",:::" + item.serviceId + ",:::" + mediaType;
                                                if (item.itemPlatformType)
                                                    tag = tag + ",:::" + item.itemPlatformType;
                                                var addSuggestion = function addSuggestion() {
                                                        var imageSource;
                                                        var imageUri;
                                                        if (querySuggestion)
                                                            suggestionRequest.searchSuggestionCollection.appendQuerySuggestion(item.name);
                                                        else {
                                                            if (!imageUrl || imageUrl < 0)
                                                                imageUrl = "file://images/squareLoading.png";
                                                            try {
                                                                imageUri = new Windows.Foundation.Uri(imageUrl)
                                                            }
                                                            catch(error_1) {
                                                                imageUrl = "file://images/squareLoading.png";
                                                                imageUri = new Windows.Foundation.Uri(imageUrl)
                                                            }
                                                            imageSource = Windows.Storage.Streams.RandomAccessStreamReference.createFromUri(imageUri);
                                                            suggestionRequest.searchSuggestionCollection.appendResultSuggestion(item.name, typeName, tag, imageSource, String.empty)
                                                        }
                                                        suggestionsToProvide--;
                                                        if (suggestionsToProvide === 0)
                                                            deferral.complete()
                                                    };
                                                imageUrl = item.imageUri;
                                                if (!imageUrl && !querySuggestion)
                                                    MS.Entertainment.UI.Shell.ImageLoader.getServiceImageUrl({
                                                        serviceId: item.serviceId, mediaType: mediaType, videoType: videoType
                                                    }, 50, 50).then(function loadImage(uri) {
                                                        imageUrl = uri;
                                                        addSuggestion()
                                                    });
                                                else
                                                    addSuggestion()
                                            }
                                        })()
                                }
                            })
                        }
                    }
                }
            }, searchResultSuggestionChosen: function searchResultSuggestionChosen(e) {
                if (e) {
                    var tag = e.tag;
                    var values = e.tag.split(",:::");
                    if (values.length < 3)
                        return;
                    var item = {
                            id: values[1], title: {$value: values[0]}
                        };
                    var augmenter = null;
                    var mediaType = parseInt(values[2]);
                    switch (mediaType) {
                        case Microsoft.Entertainment.Queries.ObjectType.game:
                            augmenter = MS.Entertainment.Data.Augmenter.Marketplace.GameSearchSuggestEDS;
                            if (values.length === 4 && values[3])
                                item.defaultPlatformType = values[3];
                            break
                    }
                    if (augmenter) {
                        item = MS.Entertainment.Data.augment(item, augmenter);
                        if (item)
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersiveDetails(item, true, false);
                        MS.Entertainment.Utilities.Telemetry.logSearchWordWheelEnter(item.name, mediaType, item.videoType);
                        return
                    }
                    if (mediaType === Microsoft.Entertainment.Queries.ObjectType.album || mediaType === Microsoft.Entertainment.Queries.ObjectType.track) {
                        var queryWatcher = new MS.Entertainment.Framework.QueryWatcher("searchWordWheel");
                        var detailQuery = (mediaType === Microsoft.Entertainment.Queries.ObjectType.album) ? new MS.Entertainment.Data.Query.Music.AlbumWithTracks : new MS.Entertainment.Data.Query.Music.SongDetails;
                        detailQuery.id = values[1];
                        queryWatcher.registerQuery(detailQuery);
                        detailQuery.execute().then(function querySuccess(q) {
                            if (q.result.item) {
                                var options = {
                                        keyword: values[0] + " " + q.result.item.artistName, chosenSuggestion: q.result.item
                                    };
                                MS.Entertainment.ViewModels.SearchContractViewModel._navigateToSearchPage(options)
                            }
                        }, function queryFail(q) {
                            var options = {keyword: values[0]};
                            MS.Entertainment.ViewModels.SearchContractViewModel._navigateToSearchPage(options)
                        })
                    }
                    MS.Entertainment.Utilities.Telemetry.logSearchWordWheelEnter(item.name, mediaType, item.videoType)
                }
            }
    }, {
        current: null, init: function() {
                if (!MS.Entertainment.ViewModels.SearchContractViewModel.current)
                    MS.Entertainment.ViewModels.SearchContractViewModel.current = new MS.Entertainment.ViewModels.SearchContractViewModel
            }, showSearchPane: function showSearchPane(query) {
                var searchPane = MS.Entertainment.ViewModels.SearchContractViewModel.getForCurrentView();
                if (!searchPane)
                    return false;
                if (query)
                    searchPane.show(query);
                else
                    searchPane.show();
                return true
            }, getForCurrentView: function getForCurrentView() {
                return Windows.ApplicationModel.Search.SearchPane.getForCurrentView()
            }, _navigateToSearchPage: function navigateToSearchPage(options) {
                MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.SearchGalleryRequest);
                var navigationService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation);
                if (MS.Entertainment.Utilities.isGamesApp) {
                    if (MS.Entertainment.ViewModels.SearchViewModel) {
                        var searchResultCounts = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.searchResultCounts);
                        searchResultCounts.clearCounts();
                        var context = null;
                        if (navigationService._currentPage && navigationService._currentPage.iaNode && navigationService._currentPage.iaNode.moniker)
                            context = navigationService._currentPage.iaNode.moniker;
                        if (context === MS.Entertainment.UI.Monikers.navigationPopover) {
                            var previousLocation = navigationService.getPreviousLocation();
                            if (previousLocation && previousLocation.page && previousLocation.page.iaNode && previousLocation.page.iaNode.moniker)
                                context = previousLocation.page.iaNode.moniker
                        }
                        var searchAction = new MS.Entertainment.UI.Actions.SearchByContextAction;
                        searchAction.parameter = {moniker: context};
                        searchAction.execute()
                    }
                    navigationService.navigateTo(MS.Entertainment.UI.Monikers.searchPage, null, null, options)
                }
                else
                    navigationService.navigateTo(MS.Entertainment.UI.Monikers.searchHub, null, null, options)
            }
    })})
