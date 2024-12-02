/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    WinJS.Namespace.define("MS.Entertainment.UI.Controls", {GamesImmersiveRelatedItems: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.ImmersiveRelatedItems, "/Components/Immersive/Games/GamesRelatedItems.html#ImmersiveRelatedItemsTemplate", function gamesImmersiveRelatedItems(){}, {
            initialize: function initialize() {
                if (this.dataContext && this.dataContext.items)
                    for (var i = 0; i < this.dataContext.items.length; i++)
                        this.dataContext.items[i].doclick = this.itemClicked.bind(this)
            }, itemClicked: WinJS.Utilities.markSupportedForProcessing(function itemClicked(item) {
                    MS.Entertainment.UI.Controls.assert(item, "No item for pop-over");
                    var popOverParameters = {
                            itemConstructor: "MS.Entertainment.Pages.GameInlineDetails", dataContext: {
                                    data: item.target, location: MS.Entertainment.Pages.BaseMediaInlineDetails.Location.marketplace
                                }
                        };
                    MS.Entertainment.UI.Controls.PopOver.showPopOver(popOverParameters)
                })
        })})
})()
