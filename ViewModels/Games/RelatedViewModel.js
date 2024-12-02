/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/data/Augmenters/commonAugmenters.js", "/Framework/Data/Augmenters/xboxLiveAugmenters.js");
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.ViewModels");
    WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesRelatedViewModel: MS.Entertainment.derive(MS.Entertainment.ViewModels.BaseImmersiveListViewModel, function relatedGamesViewModelConstructor(mediaItem) {
            this.base();
            MS.Entertainment.ViewModels.assert(mediaItem, "GamesRelatedViewModel requires a mediaItem");
            if (!mediaItem)
                throw new Error("GamesRelatedViewModel requires a mediaItem");
            this._mediaItem = mediaItem;
            this._queryWatcher = new MS.Entertainment.Framework.QueryWatcher("relatedGames");
            this.selectedTemplate = MS.Entertainment.ViewModels.GamesRelatedViewModel.DefaultTemplate;
            this._heroAugmentation = MS.Entertainment.ViewModels.GamesRelatedViewModel.HeroAugmentation
        }, {
            _mediaItem: null, _queryWatcher: null, columnSpan: 1, allItems: null, maxItems: 6, getItems: function getItems() {
                    if (this.allItems)
                        return WinJS.Promise.wrap(this.allItems);
                    if (!this._mediaItem.serviceId)
                        return WinJS.Promise.wrapError(String.load(String.id.IDS_SOCIAL_ERROR));
                    return this._beginQuery()
                }, _beginQuery: function _beginQuery(header) {
                    var relatedQuery = new MS.Entertainment.Data.Query.Games.GameRelatedItems;
                    this._queryWatcher.registerQuery(relatedQuery);
                    relatedQuery.serviceId = this._mediaItem.serviceId;
                    relatedQuery.impressionGuid = this._mediaItem.impressionGuid;
                    if (header)
                        relatedQuery.addHeader(header.key, header.value);
                    return relatedQuery.execute().then(function relatedSuccess(q) {
                            if (q.result.items)
                                return q.result.items.toArray().then(function(data) {
                                        this._setItems(data);
                                        this.allItems = data;
                                        return this.allItems
                                    }.bind(this));
                            else
                                return null
                        }.bind(this), function relatedFailure(e) {
                            return WinJS.Promise.wrapError(String.load(String.id.IDS_SOCIAL_ERROR))
                        }.bind(this))
                }
        }, {DefaultTemplate: {
                templateUrl: "Components/Games/GamesSharedTemplates.html#gameRelatedItemTemplate", panelTemplateUrl: "MS.Entertainment.Pages.GameInlineDetails", panelOptions: {location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace}, imageWidth: "260px", imageHeight: "360px", className: "games"
            }})})
})()
