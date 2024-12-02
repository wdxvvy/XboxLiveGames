/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js");
WinJS.Namespace.define("MS.Entertainment.Social", {
    MessageGallery: MS.Entertainment.UI.Framework.defineUserControl("Components/Social/MessageGallery.html#messageGalleryTemplate", function messageGalleryConstructor(element, options) {
        this.templateSelectorConstructor = MS.Entertainment.Social.InboxTemplateSelector;
        this.inlineExtraData = {deleteItem: this.deleteItem.bind(this)}
    }, {
        view: null, templateSelectorConstructor: null, inlineExtraData: null, _currentIndex: -1, _viewModel: null, _viewModelEventHandlers: null, selectedTemplate: {get: function() {
                    return (this.viewModel) ? this.viewModel.selectedTemplate : null
                }}, viewModel: {
                get: function() {
                    return this._viewModel
                }, set: function(value) {
                        this._uninitializePage();
                        this._viewModel = value;
                        if (this._initialized)
                            this._initializePage()
                    }
            }, initialize: function() {
                this._initializePage()
            }, unload: function unload() {
                this._uninitializePage();
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _uninitializePage: function _uninitializePage() {
                if (this.viewModel && this.viewModel.dispose)
                    this.viewModel.dispose();
                if (this.viewModel && this.viewModel.unregisterServices)
                    this.viewModel.unregisterServices();
                if (this._viewModelEventHandlers) {
                    this._viewModelEventHandlers.cancel();
                    this._viewModelEventHandlers = null
                }
            }, _initializePage: function initializePage() {
                this._viewModelEventHandlers = MS.Entertainment.Utilities.addEventHandlers(this.viewModel, {
                    itemsChanged: this._setGalleryItems.bind(this), isFailedChanged: this._setFailedEvent.bind(this)
                });
                this._galleryView.domElement.addEventListener("iteminvoked", this._itemInvokedHandler.bind(this), false);
                this._setGalleryItems();
                this._setFailedEvent()
            }, _setGalleryItems: function setGalleryItems() {
                var node = this.selectedTemplate;
                if (!node || !this.viewModel.items) {
                    this._galleryView.dataSource = null;
                    return
                }
                this._galleryView.slotSize = node.slotSize;
                this._galleryView.itemMargin = node.itemMargin;
                this._galleryView.itemSize = node.itemSize;
                this._galleryView.itemTemplate = node.templateUrl;
                this._galleryView.panelTemplate = node.panelTemplateUrl;
                this._galleryView.panelOptions = node.panelOptions;
                this._galleryView.horizontal = node.horizontal || false;
                this._galleryView.layout = node.layout || MS.Entertainment.UI.Controls.GalleryControl.Layout.grid;
                this._galleryView.invokeBehavior = node.invokeBehavior || MS.Entertainment.UI.Controls.GalleryControl.InvokeBehavior.popOver;
                this._galleryView.invokeHelperFactory = node.invokeHelperFactory || null;
                this._galleryView.headerTemplate = node.groupTemplate || this._galleryView.headerTemplate || null;
                this._galleryView.forceInteractive = node.forceInteractive || false;
                this._galleryView.backdropColor = node.backdropColor;
                this._galleryView.raisePanelResetEvents = node.raisePanelResetEvents || true;
                this._galleryView.panelTemplateTypeMappings = node.panelTemplateTypeMappings;
                this._galleryView.emptyGalleryTemplate = node.emptyGalleryTemplate || null;
                this._galleryView.emptyGalleryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
                if (node.emptyGalleryModelOptions) {
                    if (node.emptyGalleryModelOptions.primaryStringId)
                        this._galleryView.emptyGalleryModel.primaryStringId = node.emptyGalleryModelOptions.primaryStringId;
                    if (node.emptyGalleryModelOptions.secondaryStringId)
                        this._galleryView.emptyGalleryModel.secondaryStringId = node.emptyGalleryModelOptions.secondaryStringId;
                    if (node.emptyGalleryModelOptions.details)
                        this._galleryView.emptyGalleryModel.details = node.emptyGalleryModelOptions.details
                }
                if (MS.Entertainment.Data.List.isList(this.viewModel.items))
                    this._galleryView.dataSource = this.viewModel.items;
                else
                    MS.Entertainment.Data.VirtualList.wrapArray(this.viewModel.items).then(function wrappedItems(items) {
                        this._galleryView.dataSource = items
                    }.bind(this))
            }, _setFailedEvent: function updateFailed() {
                if (this.viewModel.isFailed)
                    MS.Entertainment.UI.Controls.Panel.raisePanelReady(this.domElement, true, this.viewModel.failedPanelModel)
            }, _itemInvokedHandler: function _itemInvokedHandler(item) {
                this._currentIndex = item.detail.itemIndex
            }, deleteItem: function deleteItem() {
                var newCurrent = WinJS.Promise.wrap();
                if (this._currentIndex > -1) {
                    this._galleryView.dataSource.removeAt(this._currentIndex);
                    this.viewModel.modifierDescriptionFormatter.totalCount--;
                    newCurrent = this._galleryView.getItemAtIndex(Math.max(0, this._currentIndex - 1))
                }
                return newCurrent
            }
    }, {}), InboxTemplateSelector: WinJS.Class.derive(MS.Entertainment.UI.Controls.GalleryTemplateSelector, function inboxTemplateSelector() {
            MS.Entertainment.UI.Controls.GalleryTemplateSelector.prototype.constructor.call(this);
            this.addTemplate(MS.Entertainment.Social.InboxTemplateSelector.Templates.messages, "Components/Social/Inbox.html#messageTemplate");
            this.addTemplate(MS.Entertainment.Social.InboxTemplateSelector.Templates.gameInvites, "Components/Social/Inbox.html#gameInviteTemplate")
        }, {
            onSelectTemplate: function onSelectTemplate(item) {
                if (item.data && item.data.game)
                    return this.getTemplateProvider(MS.Entertainment.Social.InboxTemplateSelector.Templates.gameInvites);
                else
                    return this.getTemplateProvider(MS.Entertainment.Social.InboxTemplateSelector.Templates.messages)
            }, getPanelTemplatePath: function getPanelTemplatePath(item) {
                    if (item.data && item.data.game)
                        return "MS.Entertainment.Social.GameInvitePopover";
                    else
                        return "MS.Entertainment.Social.TextMessagePopover"
                }
        }, {Templates: {
                messages: "messages", gameInvites: "gameInvites"
            }})
})
