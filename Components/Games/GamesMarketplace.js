/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/PlaybackHelpers.js", "/Framework/corefx.js", "/Framework/ContentNotification.js", "/Framework/data/Augmenters/commonAugmenters.js", "/ViewModels/social/SocialBuzzSource.js");
WinJS.Namespace.define("MS.Entertainment.Pages", {GamesMarketplace: MS.Entertainment.UI.Framework.defineUserControl("Components/Games/GamesMarketplace.html#gamesMarketplaceTemplate", function gamesMarketplaceConstructor(element, options){}, {
        _viewModelBindings: null, _modifierBindings: null, _viewModelEventHandlers: null, templateSelectorConstructor: MS.Entertainment.UI.Controls.GalleryTemplateSelector, _selectedItem: {get: function get_selectedItem() {
                    if (this.groupModifier && this.groupModifier.selectedItem)
                        return this.groupModifier.selectedItem;
                    else if (this.sortModifier && this.sortModifier.selectedItem)
                        return this.sortModifier.selectedItem;
                    else
                        return this.viewModel.defaultGroupItem()
                }}, initialize: function initialize() {
                this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRendered() {
                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioXbox360GamesGalleryRequestToLoad();
                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioMetroGamesGalleryRequestToLoad()
                });
                this._viewModelBindings = WinJS.Binding.bind(this.viewModel, {isFailed: this._setFailedEvent.bind(this)});
                this._viewModelEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.viewModel, {
                    viewChanged: this._viewChanged.bind(this), itemsChanged: this._itemsChanged.bind(this), largeItemIndexChanged: this._updateGalleryLargeItemIndex.bind(this)
                });
                var emptyGalleryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                emptyGalleryModel.primaryStringId = String.id.IDS_GAMES_MARKETPLACE_EMPTY;
                this._galleryView.emptyGalleryModel = emptyGalleryModel;
                var firstView = !this.groupModifier.initialized || !this.sortModifier.initialized;
                this._updateGalleryItems(firstView);
                this._updateGalleryLargeItemIndex();
                if (!firstView)
                    this._attachModifierBindings()
            }, unload: function unload() {
                if (this._viewModelBindings) {
                    this._viewModelBindings.cancel();
                    this._viewModelBindings = null
                }
                if (this._viewModelEventHandlers) {
                    this._viewModelEventHandlers.cancel();
                    this._viewModelEventHandlers = null
                }
                if (this.viewModel) {
                    this.viewModel.dispose();
                    this.viewModel = null
                }
                if (this._modifierBindings) {
                    this._modifierBindings.cancel();
                    this._modifierBindings = null
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _updateGalleryLargeItemIndex: function _updateGalleryLargeItemIndex() {
                this._galleryView.largeItemIndex = this.viewModel.largeItemIndex
            }, _viewChanged: function _viewChanged(data) {
                MS.Entertainment.ViewModels.assert(data, "viewChanged event has no data");
                MS.Entertainment.ViewModels.assert(data.detail, "viewChanged data has no detail");
                if (!data || !data.detail)
                    return;
                var newValue = data.detail.newValue;
                this._setGroupItems(newValue.defaultGroup);
                this._setSortItems(newValue.defaultSort);
                this._setGalleryItems();
                this._attachModifierBindings()
            }, _attachModifierBindings: function _attachModifierBindings() {
                this._modifierBindings = WinJS.Binding.bind(this, {
                    groupModifier: {selectedItem: this._modifierSelectionChanged.bind(this)}, sortModifier: {selectedItem: this._modifierSelectionChanged.bind(this)}
                })
            }, _itemsChanged: function _itemsChanged(data) {
                this._setGalleryItems()
            }, _updateGalleryItems: function updateGalleryItems(notify) {
                var selectedItem = this._selectedItem;
                var galleryParameters = {
                        query: selectedItem.query, baseUrl: selectedItem.baseUrl, desiredItemTypes: selectedItem.desiredItemTypes, xboxHasChildItemTypes: selectedItem.xboxHasChildItemTypes, genre: selectedItem.genre, filterBy: (this.groupModifier && this.groupModifier.selectedItem) ? this.groupModifier.selectedItem.filterBy : "", orderBy: (this.sortModifier && this.sortModifier.selectedItem) ? this.sortModifier.selectedItem.orderBy : ""
                    };
                this.viewModel.beginQuery(galleryParameters, notify)
            }, _setGroupItems: function setGroupItems(defaultGroup) {
                if (this.groupModifier && !this.groupModifier.initialized) {
                    this.groupModifier.initialized = true;
                    if (this.viewModel && this.viewModel.groupItems && this.viewModel.groupItems.length > 0) {
                        this.groupModifier.items = this.viewModel.groupItems;
                        this.groupModifier.selectedItem = defaultGroup
                    }
                    else
                        this.groupModifier.items = []
                }
            }, _setSortItems: function setSortItems(defaultSort) {
                if (this.sortModifier && !this.sortModifier.initialized) {
                    this.sortModifier.initialized = true;
                    if (this.viewModel && this.viewModel.sortItems && this.viewModel.sortItems.length > 0) {
                        this.sortModifier.items = this.viewModel.sortItems;
                        this.sortModifier.selectedItem = defaultSort
                    }
                    else
                        this.sortModifier.items = []
                }
            }, _setGalleryItems: function setGalleryItems() {
                if (!this.viewModel.items || !this.viewModel.isCurrentQuery()) {
                    this._galleryView.dataSource = null;
                    this._galleryView.updateLayout();
                    return
                }
                var selectedItem = this._selectedItem;
                this._galleryView.multiSize = selectedItem.multiSize || false;
                this._galleryView.itemMargin = selectedItem.itemMargin;
                this._galleryView.itemTemplate = selectedItem.itemTemplate;
                this._galleryView.itemSize = selectedItem.itemSize;
                this._galleryView.slotSize = selectedItem.slotSize;
                this._galleryView.dataSource = this.viewModel.items;
                this._galleryView.backdropColor = selectedItem.backdropColor || "#EBEBEB"
            }, _setFailedEvent: function updateFailed() {
                if (this.viewModel.isFailed)
                    MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true)
            }, _modifierSelectionChanged: function _groupModifierSelectionChanged(newValue, oldValue) {
                if (oldValue)
                    this._updateGalleryItems()
            }
    }, {
        viewModel: null, groupModifier: {
                items: [], selectedItem: null
            }, sortModifier: {
                items: [], selectedItem: null
            }
    })})
