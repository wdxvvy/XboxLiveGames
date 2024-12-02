/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {
    ShowMoreDefaultHeight: {
        minCollapsed: 100, maxCollapsed: 500, baseResolution: 768, _calculate: function calculate() {
                var height = (window.outerHeight - this.baseResolution);
                if (height < this.minCollapsed)
                    height = this.minCollapsed;
                else if (height > this.maxCollapsed)
                    height = this.maxCollapsed;
                return height
            }
    }, ShowMore: MS.Entertainment.UI.Framework.defineUserControl("/Controls/ShowMore.html#showMoreTemplate", function showMoreConstructor(){}, {
            _isShowingMore: false, initialize: function initialize() {
                    if (!this.collapsedHeightCalculator)
                        this.collapsedHeightCalculator = MS.Entertainment.UI.Controls.ShowMoreDefaultHeight;
                    this.bind("primaryText", this._updateState.bind(this));
                    this.bind("collapsedHeight", this._updateState.bind(this))
                }, _updateState: function updateState() {
                    this._changeTextHeight();
                    this._changeButtonVisibility();
                    this._changeButtonText()
                }, _calculateCollapsedHeight: function calculateCollapsedHeight() {
                    var height = 0;
                    if (this.collapsedHeight > 0)
                        height = this.collapsedHeight;
                    else
                        height = this.collapsedHeightCalculator._calculate();
                    if (height > this._content.scrollHeight)
                        height = this._content.scrollHeight;
                    return height
                }, _requiresShowMoreButton: function requiresShowMoreButton() {
                    return (this._content.scrollHeight > this._calculateCollapsedHeight())
                }, _changeTextHeight: function changeTextHeight() {
                    this._content.style.height = this._isShowingMore ? "" : (this._calculateCollapsedHeight() + "px")
                }, _changeButtonText: function _changeButtonText() {
                    this._showMoreLink.stringId = this._isShowingMore ? String.id.IDS_SEE_LESS_BUTTON : String.id.IDS_SEE_MORE_BUTTON
                }, _changeButtonVisibility: function changeButtonVisibility() {
                    if (this._requiresShowMoreButton())
                        WinJS.Utilities.removeClass(this._showMoreLink.domElement, "removeFromDisplay");
                    else
                        WinJS.Utilities.addClass(this._showMoreLink.domElement, "removeFromDisplay")
                }, onShowMoreClicked: function onShowMoreClicked() {
                    this._isShowingMore = !this._isShowingMore;
                    this._updateState()
                }
        }, {
            primaryText: "", collapsedHeight: 0, collapsedHeightCalculator: null
        })
})
