/* Copyright (C) Microsoft Corporation. All rights reserved. */
WinJS.Namespace.define("MS.Entertainment.Pages", {ScreenshotPopover: MS.Entertainment.UI.Framework.defineUserControl("Components/Games/Screenshots.html#screenshotsPopoverTemplate", function screenshotPopover(element, options) {
        this.locators = new MS.Entertainment.ObservableArray
    }, {
        itemTemplate: "Components/Games/Screenshots.html#screenshotImageTemplate", _flipView: null, _template: null, _overlay: null, _overlayEvents: null, currentPage: 0, locators: null, initialize: function initialize() {
                this.media.getCount().then(function getCount(count) {
                    for (var x = 0; x < count; x++)
                        this.locators.add(WinJS.Binding.as({selected: (x === this.currentPage ? true : false)}));
                    MS.Entertainment.UI.Framework.loadTemplate(this.itemTemplate).then(function(frag) {
                        this._template = frag;
                        this._finishLoad()
                    }.bind(this))
                }.bind(this))
            }, unload: function unload() {
                if (this._overlayEvents) {
                    this._overlayEvents.cancel();
                    this._overlayEvents = null
                }
                MS.Entertainment.UI.Framework.UserControl.prototype.unload.call(this)
            }, _finishLoad: function _finishLoad() {
                this._flipView = new WinJS.UI.FlipView(this.mainContent, {
                    itemDataSource: new MS.Entertainment.Utilities.VirtualizedDataSource(this.media), currentPage: this.currentPage, itemTemplate: function itemRenderer(itemPromise) {
                            return itemPromise.then(function(item) {
                                    var element = document.createElement("div");
                                    this._template.render(item.data, element);
                                    return element
                                }.bind(this))
                        }.bind(this), onpagevisibilitychanged: function onpagevisibilitychanged(event) {
                            if (this._flipView.currentPage != this.currentPage) {
                                this.locators.item(this.currentPage).selected = false;
                                this.locators.item(this._flipView.currentPage).selected = true;
                                this.currentPage = this._flipView.currentPage
                            }
                        }.bind(this)
                })
            }, setOverlay: function setOverlay(instance) {
                this._overlay = instance;
                this._overlayEvents = MS.Entertainment.Utilities.addEventHandlers(this._overlay, {overlayVisible: this._overlayVisible.bind(this)})
            }, _overlayVisible: function _overlayVisible() {
                if (this._flipView && this._flipView._contentDiv)
                    MS.Entertainment.UI.Framework.focusFirstInSubTree(this._flipView._contentDiv, true)
            }
    })})
