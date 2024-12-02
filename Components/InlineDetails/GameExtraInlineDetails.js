/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/corefx.js", "/Framework/utilities.js", "/ViewModels/MediaItemModel.js", "/Components/InlineDetails/ActionButtonsControl.js", "/Components/InlineDetails/BaseInlineDetails.js", "/ViewModels/PurchaseFlow/SmartBuyStateEngine.js", "/ViewModels/PurchaseFlow/SmartBuyButtons.js", "/ViewModels/PurchaseFlow/SmartBuyStateHandlers.js");
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Pages", {GameExtraInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.BaseMediaInlineDetails, null, function gameExtraInlineDetails(){}, {
            _buttons: null, initialize: function initialize() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.initialize.apply(this, arguments);
                    this.media = MS.Entertainment.ViewModels.MediaItemModel.augment(this.media);
                    this._showPanel(true);
                    this.bind("isLoading", function() {
                        if (!this.isLoading)
                            if (this.smartBuyStateEngine)
                                this.smartBuyStateEngine.initialize(this.media, MS.Entertainment.ViewModels.SmartBuyButtons.getExtraImmersiveDetailsButtons(this.media, this.inlineExtraData, MS.Entertainment.UI.Actions.ExecutionLocation.canvas), MS.Entertainment.ViewModels.SmartBuyStateHandlers.onExtraImmersiveDetailsStateChanged)
                    }.bind(this));
                    this._hydrateMedia()
                }
        })});
    WinJS.Namespace.define("MS.Entertainment.Pages", {
        XboxGameExtraInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.GameExtraInlineDetails, "Components/InlineDetails/GameExtraInlineDetails.html#xboxGameExtraInlineDetailsTemplate", function xboxGameExtraInlineDetails(){}, {}), ModernGameExtraInlineDetails: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.GameExtraInlineDetails, "Components/InlineDetails/GameExtraInlineDetails.html#modernGameExtraInlineDetailsTemplate", function modernGameExtraInlineDetails() {
                this.allowShare = false
            }, {})
    })
})()
