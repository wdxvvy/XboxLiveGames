/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/PlaybackHelpers.js", "/Framework/corefx.js");
WinJS.Namespace.define("MS.Entertainment.Pages", {MarketplaceBase: MS.Entertainment.UI.Framework.defineUserControl("Components/Marketplace.html#marketplaceTemplate", function marketplaceBaseConstructor(element, options){}, {
        view: null, templateSelectorConstructor: MS.Entertainment.UI.Controls.GalleryTemplateSelector, allowEmpty: false, clearItemsDuringQuery: false, _viewModelEventHandlers: null, _currentGalleryClass: String.empty, selectedTemplate: {get: function() {
                    return (this._viewModel) ? this._viewModel.selectedTemplate : null
                }}, initialize: function initialize() {
                this.domElement.addEventListener("galleryFirstPageRendered", function galleryFirstPageRender() {
                    MS.Entertainment.Instrumentation.PerfTrack.triggerScenarioMarketplaceGalleryRequestToLoad()
                });
                this.bind("_viewModel", this._initializePage.bind(this))
            }, unload: function unload() {
                if (this._viewModel && this._viewModel.dispose)
                    this._viewModel.dispose();
                if (this._viewModel && this._viewModel.unregisterServices)
                    this._viewModel.unregisterServices();
                this._uninitializePage();
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, freeze: function freeze() {
                if (this._viewModel && this._viewModel.freeze)
                    this._viewModel.freeze();
                MS.Entertainment.UI.Framework.UserControl.prototype.freeze.call(this)
            }, thaw: function thaw() {
                MS.Entertainment.UI.Framework.UserControl.prototype.thaw.call(this);
                if (this._viewModel && this._viewModel.thaw)
                    this._viewModel.thaw()
            }, _uninitializePage: function _uninitializePage() {
                if (this._viewModelEventHandlers) {
                    this._viewModelEventHandlers.cancel();
                    this._viewModelEventHandlers = null
                }
            }, _initializePage: function initializePage() {
                this._uninitializePage();
                this._viewModelEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._viewModel, {
                    itemsChanged: this._setGalleryItems.bind(this), isFailedChanged: this._setFailedEvent.bind(this), largeItemIndexChanged: this._updateGalleryLargeItemIndex.bind(this)
                });
                this._setGalleryItems();
                this._setFailedEvent();
                this._updateGalleryLargeItemIndex()
            }, _setGalleryItems: function setGalleryItems() {
                var node = this.selectedTemplate;
                if (this._unloaded || !node || !this._viewModel.items || (!this._viewModel.items.count && (!this.allowEmpty && !node.allowEmpty && (this._viewModel.isCurrentQuery() || !this.clearItemsDuringQuery))) || (!this._viewModel.isCurrentQuery() && !this.clearItemsDuringQuery)) {
                    this._galleryView.dataSource = null;
                    return
                }
                this._galleryView.headerType = node.headerType || MS.Entertainment.UI.Controls.GalleryControl.HeaderType.auto;
                this._galleryView.largeItemSize = node.largeItemSize || this._galleryView.largeItemSize;
                this._galleryView.multiSize = node.multiSize || false;
                this._galleryView.maxRows = node.maxRows || -1;
                this._galleryView.startNewColumnOnHeaders = node.startNewColumnOnHeaders || false;
                this._galleryView.slotSize = node.slotSize;
                this._galleryView.itemMargin = node.itemMargin;
                this._galleryView.itemSize = node.itemSize;
                this._galleryView.itemTemplate = node.templateUrl;
                this._galleryView.panelTemplate = node.panelTemplateUrl;
                this._galleryView.panelOptions = node.panelOptions;
                this._galleryView.actionTemplate = node.actionTemplateUrl;
                this._galleryView.mediaType = node.mediaType;
                this._galleryView.headerClass = node.headerClass || null;
                this._galleryView.horizontal = node.horizontal || false;
                this._galleryView.grouped = node.grouped;
                this._galleryView.layout = node.layout || MS.Entertainment.UI.Controls.GalleryControl.Layout.grid;
                this._galleryView.invokeBehavior = node.invokeBehavior || MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver;
                this._galleryView.invokeHelperFactory = node.invokeHelperFactory || null;
                this._galleryView.headerTemplate = node.groupTemplate || this._galleryView.headerTemplate || null;
                this._galleryView.forceInteractive = node.forceInteractive || false;
                this._galleryView.backdropColor = node.backdropColor;
                this._galleryView.raisePanelResetEvents = node.raisePanelResetEvents || true;
                this._galleryView.actionOptions = node.actionOptions || null;
                this._galleryView.emptyGalleryTemplate = (!this._viewModel.isCurrentQuery() && this.clearItemsDuringQuery) ? null : node.emptyGalleryTemplate;
                this._galleryView.emptyGalleryModel = this._viewModel.emptyGalleryModel || null;
                this._galleryView.delayHydrateLibraryId = node.delayHydrateLibraryId || false;
                this._galleryView.minimumListLength = node.minimumListLength;
                this._galleryView.panelTemplateTypeMappings = node.panelTemplateTypeMappings;
                this._galleryView.selectionStyleFilled = node.selectionStyleFilled || false;
                this._galleryView.maxSelectionCount = node.maxSelectionCount;
                this._galleryView.restoreFocusOnDataChanges = node.restoreFocusOnDataChanges || false;
                if (node.selectionMode)
                    this._galleryView.selectionMode = node.selectionMode;
                if (node.swipeBehavior)
                    this._galleryView.swipeBehavior = node.swipeBehavior;
                this._galleryView.grouperItemThreshold = -1;
                if (node.groupHeaderPosition)
                    this._galleryView.headerPosition = node.groupHeaderPosition;
                if (this._galleryView.grouped) {
                    this._galleryView.grouperType = node.grouperType;
                    this._galleryView.grouper.keyPropertyName = node.grouperField;
                    this._galleryView.grouper.useKeyAsData = (node.grouperKeyAsData !== undefined) ? node.grouperKeyAsData : true
                }
                else
                    this._galleryView.grouperType = null;
                if (this._currentGalleryClass)
                    WinJS.Utilities.removeClass(this._galleryView.domElement, this._currentGalleryClass);
                if (node.galleryClass) {
                    WinJS.Utilities.addClass(this._galleryView.domElement, node.galleryClass);
                    this._currentGalleryClass = node.galleryClass
                }
                this._initializeSelectionHandlers();
                this._galleryView.dataSource = this._viewModel.items
            }, _initializeSelectionHandlers: function _initializeSelectionHandlers() {
                if (this._galleryView.selectionMode !== MS.Entertainment.UI.Controls.GalleryControl.SelectionMode.none) {
                    var defaultSelectionHandlers = MS.Entertainment.ViewModels.SmartAppbarActions.setDefaultGalleryEventHandlers(this._clearSelection.bind(this));
                    this._galleryView.addSelectionHandlers(defaultSelectionHandlers);
                    this._galleryView.addSelectionHandlers({deleteMedia: this._handleItemDeleted.bind(this)})
                }
            }, _handleItemDeleted: function _handleItemDeleted(eventArgs) {
                var deleted = eventArgs.detail && eventArgs.detail.deleted;
                if (deleted)
                    this._clearSelection()
            }, _clearSelection: function _clearSelection() {
                this._galleryView.clearSelection()
            }, _setFailedEvent: function updateFailed() {
                if (this._viewModel.isFailed)
                    MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true, this._viewModel.failedGalleryModel)
            }, _updateGalleryLargeItemIndex: function updateGalleryLargeItemIndex() {
                if (this._unloaded)
                    return;
                this._galleryView.largeItemIndex = this._viewModel.largeItemIndex
            }, _mergeGroupItems: function mergeGroupItems(lessSignificantGroupItem, moreSignificantGroupItem) {
                if (lessSignificantGroupItem && moreSignificantGroupItem) {
                    var combinedItem = {};
                    for (var property in lessSignificantGroupItem)
                        combinedItem[property] = lessSignificantGroupItem[property];
                    for (property in moreSignificantGroupItem)
                        combinedItem[property] = moreSignificantGroupItem[property];
                    return combinedItem
                }
                else if (lessSignificantGroupItem)
                    return lessSignificantGroupItem;
                else if (moreSignificantGroupItem)
                    return moreSignificantGroupItem
            }
    }, {_viewModel: null})});
WinJS.Namespace.define("MS.Entertainment.Pages", {Marketplace: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.MarketplaceBase, "Components/Marketplace.html#marketplaceTemplate", function marketplaceConstructor(element, options){}, {
        _groupItemsChangedCallback: null, _sortItemsChangedCallback: null, _galleryImageChangedCallback: null, _modifierSelectedItemChangedCallback: null, _marketplaceViewModelEventHandlers: null, selectedTemplate: {get: function() {
                    return (!this.currentGroupItem) ? null : this._mergeGroupItems(this._viewModel.Templates[this.currentGroupItem.template], this.currentGroupItem)
                }}, initialize: function initialize() {
                this._groupItemsChangedCallback = this._setGroupItems.bind(this);
                this._sortItemsChangedCallback = this._setSortItems.bind(this);
                this._galleryImageChangedCallback = this._setGalleryImage.bind(this);
                this._modifierSelectedItemChangedCallback = this._modifierSelectionChanged.bind(this);
                MS.Entertainment.Pages.MarketplaceBase.prototype.initialize.apply(this, arguments)
            }, unload: function unload() {
                this._groupModifier.unbind("selectedItem", this._modifierSelectedItemChangedCallback);
                this._sortModifier.unbind("selectedItem", this._modifierSelectedItemChangedCallback);
                this._groupModifier.initialized = false;
                this._sortModifier.initialized = false;
                MS.Entertainment.Pages.MarketplaceBase.prototype.unload.call(this)
            }, _uninitializePage: function _uninitializePage() {
                MS.Entertainment.Pages.MarketplaceBase.prototype._uninitializePage.apply(this, arguments);
                if (this._marketplaceViewModelEventHandlers) {
                    this._marketplaceViewModelEventHandlers.cancel();
                    this._marketplaceViewModelEventHandlers = null
                }
            }, _initializePage: function initializePage() {
                MS.Entertainment.Pages.MarketplaceBase.prototype._initializePage.apply(this, arguments);
                this._galleryView.itemClicked = this._itemClicked.bind(this);
                this._marketplaceViewModelEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this._viewModel, {
                    groupItemsChanged: this._groupItemsChangedCallback, sortItemsChanged: this._sortItemsChangedCallback, galleryImageUrlChanged: this._galleryImageChangedCallback
                });
                this._groupItemsChangedCallback();
                this._sortItemsChangedCallback();
                this._galleryImageChangedCallback();
                if (!this._viewModel.groupItems || this._viewModel.groupItems.length === 0 || !this._groupModifier.selectedItem)
                    this._viewModel.populateGroupItems();
                else
                    this._modifierSelectedItemChangedCallback()
            }, _setGroupItems: function setGroupItems() {
                if (this._groupModifier && !this._groupModifier.initialized) {
                    this._groupModifier.bind("selectedItem", this._modifierSelectedItemChangedCallback);
                    this._groupModifier.initialized = true
                }
                if (this._groupModifier && this._viewModel && this._viewModel.groupItems && this._viewModel.groupItems.length > 0)
                    this._groupModifier.items = this._viewModel.groupItems
            }, _setSortItems: function setSortItems() {
                if (this._sortModifier && !this._sortModifier.initialized) {
                    this._sortModifier.bind("selectedItem", this._modifierSelectedItemChangedCallback);
                    this._sortModifier.initialized = true
                }
                if (this._sortModifier && this._viewModel && this._viewModel.sortItems && this._viewModel.sortItems.length > 0)
                    this._sortModifier.items = this._viewModel.sortItems
            }, _setGalleryImage: function setGalleryImage() {
                this._hubImage = this._viewModel.galleryImageUrl
            }, _updateSortItems: function updateSortItems(groupItem)
            {
                if (groupItem) {
                    var sortsUpdated = false;
                    if (!groupItem.sorts && this._sortModifier.items.length !== 0) {
                        this._sortModifier.items = [];
                        sortsUpdated = true
                    }
                    else if (groupItem.sorts !== undefined && (this.currentGroupItem === undefined || groupItem.sorts !== this.currentGroupItem.sorts)) {
                        this._viewModel.populateSortItems(this._groupModifier.selectedItem);
                        sortsUpdated = true
                    }
                    this.currentGroupItem = groupItem;
                    return sortsUpdated
                }
            }, _updateGalleryItems: function updateGalleryItems(groupItem)
            {
                if (groupItem && groupItem.gallery) {
                    var imageQuery = null;
                    var galleryImage = null;
                    var contentQuery = new groupItem.gallery;
                    this.currentGroupItem = groupItem;
                    this._viewModel.currentGroupItem = groupItem;
                    if (groupItem.serviceId !== undefined)
                        contentQuery.serviceId = groupItem.serviceId;
                    if (groupItem.impressionGuid !== undefined)
                        contentQuery.impressionGuid = groupItem.impressionGuid;
                    if (groupItem.orderBy !== undefined)
                        contentQuery.orderBy = groupItem.orderBy;
                    if (groupItem.startsWith !== undefined)
                        contentQuery.startsWith = groupItem.startsWith;
                    if (groupItem.imageUri !== undefined)
                        galleryImage = groupItem.imageUri;
                    if (groupItem.galleryImage !== undefined && groupItem.serviceId !== undefined) {
                        imageQuery = new groupItem.galleryImage;
                        imageQuery.id = groupItem.serviceId
                    }
                    this._viewModel.beginQuery(contentQuery, imageQuery, galleryImage)
                }
            }, _modifierSelectionChanged: function modifierSelectionChanged() {
                var selectedItem = null;
                if (this._groupModifier.selectedItem !== null)
                    if (!this._updateSortItems(this._groupModifier.selectedItem)) {
                        this._galleryView.emptyGalleryTemplate = null;
                        this._galleryView.dataSource = null;
                        selectedItem = this._mergeGroupItems(this._groupModifier.selectedItem, this._sortModifier.selectedItem);
                        this._updateGalleryItems(selectedItem)
                    }
            }, _itemClicked: function itemClicked(item) {
                var selectedItem = this._mergeGroupItems(this._groupModifier.selectedItem, this._sortModifier.selectedItem);
                MS.Entertainment.Platform.PlaybackHelpers.showImmersiveDetails(item, true, (selectedItem && selectedItem.autoPlayTrailer))
            }
    }, {
        _groupModifier: {
            items: [], selectedItem: null
        }, _sortModifier: {
                items: [], selectedItem: null
            }, _hubImage: null
    }, {})})
