/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/augmenters/xboxLiveAugmenters.js", "/Framework/data/list.js", "/Framework/data/queries/modelQueries.js", "/Framework/data/queries/modelProperties.js", "/Framework/data/query.js", "/Framework/debug.js", "/Framework/querywatcher.js", "/Framework/stringids.js", "/Framework/Utilities.js", "/ViewModels/Social/profileHydrator.js");
WinJS.Namespace.define("MS.Entertainment.Pages", {GamesCollection: MS.Entertainment.UI.Framework.defineUserControl("Components/Games/GamesCollection.html#gamesCollectionTemplate", function gamesCollectionConstructor(element, options){}, {
        _viewModel: null, _galleryView: null, _initializePageCallback: null, _primaryModifierSelectionChangedCallback: null, _viewModelDataChangedCallback: null, _signInHandler: null, _items: null, initialize: function initialize() {
                this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioGameActivityRequestToLoad()
                });
                this._initializePageCallback = this._initializePage.bind(this);
                this._primaryModifierSelectionChangedCallback = this._primaryModifierSelectionChanged.bind(this);
                this._viewModelDataChangedCallback = this._viewModelDataChanged.bind(this);
                this.bind("dataContext", this._initializePageCallback)
            }, unload: function unload() {
                this.unbind("dataContext", this._initializePageCallback);
                this.dataContext.primaryModifier.unbind("selectedItem", this._primaryModifierSelectionChangedCallback);
                this._viewModel.unbind("items", this._viewModelDataChangedCallback);
                MS.Entertainment.Utilities.SignIn.removeEventListener("signInComplete", this._signInHandler);
                MS.Entertainment.Utilities.SignIn.removeEventListener("signOutComplete", this._signInHandler);
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, unload: function unload() {
                if (this._viewModel)
                    this._viewModel.unload();
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, freeze: function freeze() {
                if (this._viewModel)
                    this._viewModel.freeze();
                MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
            }, _initializePage: function initializePage() {
                if (!this.dataContext)
                    return;
                this._viewModel = this.dataContext.viewModel;
                this._viewModel.bind("items", this._viewModelDataChangedCallback);
                this._signInHandler = this._viewModel.beginQuery.bind(this);
                MS.Entertainment.Utilities.SignIn.addEventListener("signInComplete", this._signInHandler, false);
                MS.Entertainment.Utilities.SignIn.addEventListener("signOutComplete", this._signInHandler, false);
                this._initializeModifiers();
                this._initializeGalleryView();
                this._viewModel.beginQuery()
            }, _initializeGalleryView: function initializeGalleryView() {
                this._galleryView.dataSource = null;
                this._galleryView.emptyGalleryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                this._galleryView.emptyGalleryModel.primaryStringId = String.id.IDS_GAMES_COLLECTION_EMPTY_TITLE;
                this._galleryView.emptyGalleryModel.secondaryStringId = String.id.IDS_GAMES_COLLECTION_EMPTY_DESC;
                this._galleryView.emptyGalleryModel.details = this._getEmptyCollectionDetails();
                this._galleryView.backdropColor = "#EBEBEB"
            }, _initializeModifiers: function initializeModifiers() {
                var that = this;
                var sorts = MS.Entertainment.ViewModels.GamesCollection.Sorts;
                var values = [];
                var selected = null;
                for (var x = 0; x < sorts.values.length; x++) {
                    var node = sorts[sorts.values[x]];
                    var value = {
                            label: node.title, value: node.value, id: node.value, type: "sort"
                        };
                    values.push(value);
                    if (node.value === this._viewModel.sort)
                        selected = value
                }
                that.dataContext.primaryModifier.updateProperty("items", values).then(function() {
                    return that.dataContext.primaryModifier.updateProperty("selectedItem", selected).then(function() {
                            that.dataContext.primaryModifier.bind("selectedItem", that._primaryModifierSelectionChangedCallback)
                        })
                })
            }, _primaryModifierSelectionChanged: function primaryModifierSelectionChanged() {
                if (this.dataContext.primaryModifier.selectedItem && this._updateViewModel(this.dataContext.primaryModifier.selectedItem))
                    this._viewModel.beginQuery()
            }, _updateViewModel: function updateViewModel(item) {
                var changed = false;
                if (this._viewModel.sort !== item.value) {
                    this._viewModel.sort = item.value;
                    changed = true
                }
                return changed
            }, _viewModelDataChanged: function viewModelDataChanged() {
                if (!this._viewModel.items || !this._viewModel.isCurrentQuery())
                    return;
                var that = this;
                this._items = [];
                this._viewModel.items.forEach(function(value) {
                    that._items.push(value.item.data)
                }).then(function() {
                    that._sortData();
                    MS.Entertainment.Data.VirtualList.wrapArray(that._items).then(function(virtualList) {
                        that._galleryView.dataSource = virtualList
                    })
                })
            }, _getEmptyCollectionDetails: function _getEmptyCollectionDetails() {
                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace)) {
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var navigateToGamesMarketplace = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                    navigateToGamesMarketplace.parameter = MS.Entertainment.UI.Monikers.gamesWindowsMarketplace;
                    var details = [{
                                stringId: null, linkStringId: String.id.IDS_GAMES_COLLECTION_EMPTY_LINK, linkAction: navigateToGamesMarketplace, linkIcon: WinJS.UI.AppBarIcon.shop
                            }]
                }
                return details
            }, _sortData: function sortData() {
                switch (this._viewModel.sort) {
                    case MS.Entertainment.ViewModels.GamesCollection.Sorts.title.value:
                        this._items.sort(function(a, b) {
                            var strA = a.name.toLowerCase();
                            var strB = b.name.toLowerCase();
                            return ((strA === strB) ? 0 : ((strA > strB) ? 1 : -1))
                        });
                        break;
                    case MS.Entertainment.ViewModels.GamesCollection.Sorts.recent.value:
                        break
                }
            }
    }, {dataContext: null}, {canInvokeForItem: WinJS.Utilities.markSupportedForProcessing(function canInvokeForItem(data) {
            if (data && data.data)
                return MS.Entertainment.Utilities.isGameItemAvailable(data.data);
            else
                return false
        })})})
