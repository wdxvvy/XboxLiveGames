/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    scriptValidator("/Framework/corefx.js", "/Framework/debug.js", "/Framework/Utilities.js", "/Controls/listControls.js");
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
        ImmersiveRelatedItems: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.BaseImmersiveSummary, "/Components/Immersive/Shared/RelatedItems.html#ImmersiveRelatedItemsTemplate", function moreGalleryControlBase(element, options) {
            this.dataContext = options.dataContext || MS.Entertainment.UI.Controls.ImmersiveRelatedItems.emptyDataContext;
            if (this.dataContext.selectedTemplate) {
                this.panelTemplate = this.dataContext.selectedTemplate.panelTemplateUrl || this.panelTemplate;
                this.panelOptions = this.dataContext.selectedTemplate.panelOptions || this.panelOptions;
                this.itemTemplate = this.dataContext.selectedTemplate.templateUrl || this.itemTemplate;
                this.className = this.dataContext.selectedTemplate.className || this.className
            }
        }, {
            className: null, initialize: function initialize() {
                    var thumbnailButton = this.domElement.querySelector(".relatedHeroItem");
                    if (thumbnailButton) {
                        thumbnailButton.tabIndex = 0;
                        WinJS.Utilities.addClass(thumbnailButton, "acc-keyboardFocusTarget");
                        WinJS.Utilities.addClass(thumbnailButton, "win-focusable");
                        thumbnailButton.addEventListener("click", this.onItemClick.bind(this));
                        thumbnailButton.addEventListener("keypress", this.onKeyPress.bind(this))
                    }
                    var querySelectorString = ".control-immersiveListViewItem";
                    var firstListItem = this.domElement.querySelector(querySelectorString);
                    if (firstListItem)
                        firstListItem.tabIndex = 0
                }, onKeyPress: function onKeyPress(event) {
                    if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                        this.onItemClick(event)
                }, onItemClick: function onItemClick(event) {
                    var popOverParameters = {itemConstructor: this.panelTemplate};
                    popOverParameters.dataContext = {
                        data: this.dataContext.heroActionItem, location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace
                    };
                    MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                }
        }, {
            itemTemplate: null, panelTemplate: null
        }, {emptyDataContext: {
                selectedTemplate: {templateUrl: null}, heroItem: {
                        name: null, description: null
                    }, items: null
            }}), ImmersiveRelatedTileItems: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.BaseImmersiveSummary, "/Components/Immersive/Shared/RelatedItems.html#ImmersiveRelatedTilesTemplate", function moreGalleryControlBase(element, options) {
                this.dataContext = options.dataContext || MS.Entertainment.UI.Controls.ImmersiveRelatedItems.emptyDataContext;
                if (this.dataContext.selectedTemplate) {
                    this.itemTemplate = this.dataContext.selectedTemplate.templateUrl || this.itemTemplate;
                    this.className = this.dataContext.selectedTemplate.className || this.className;
                    this.panelTemplate = this.dataContext.selectedTemplate.panelTemplateUrl || this.panelTemplate;
                    this.panelOptions = this.dataContext.selectedTemplate.panelOptions || this.panelOptions
                }
            }, {
                initialize: function initialize() {
                    if (this.domElement) {
                        this.domElement.addEventListener("click", this.onItemClick.bind(this));
                        this.domElement.addEventListener("keypress", this.onKeyPress.bind(this))
                    }
                }, onKeyPress: function onKeyPress(event) {
                        if (event.keyCode === WinJS.Utilities.Key.enter || event.keyCode === WinJS.Utilities.Key.space)
                            this.onItemClick(event)
                    }, onItemClick: function onItemClick(event) {
                        var listItem = event.target;
                        if (!WinJS.Utilities.hasClass(listItem, "horizontalListItem"))
                            listItem = MS.Entertainment.Utilities.findParentElementByClassName(listItem, "horizontalListItem");
                        if (listItem && listItem.dataContext)
                            if (listItem.dataContext.action)
                                listItem.dataContext.action.execute();
                            else {
                                var popOverParameters = {itemConstructor: this.panelTemplate};
                                var location = listItem.dataContext.fromCollection ? MS.Entertainment.Pages.BaseMediaInlineDetails.Location.collection : MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace;
                                popOverParameters.dataContext = {
                                    data: listItem.dataContext, location: location
                                };
                                MS.Entertainment.Platform.PlaybackHelpers.showItemDetails(popOverParameters)
                            }
                    }
            }, {
                className: null, itemTemplate: null, panelTemplate: null
            }, {emptyDataContext: {
                    selectedTemplate: {templateUrl: null}, items: null
                }})
    })
})()
