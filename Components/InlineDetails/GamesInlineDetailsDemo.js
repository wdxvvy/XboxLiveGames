/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Pages", {
        GamesInlineDetailsSpotlightDemo: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.BaseInlineDetails, "Components/InlineDetails/GamesInlineDetailsDemo.html#gamesInlineDetailsSpotlightDemoTemplate", function GamesInlineDetailsSpotlightDemo(element, options){}, {
            initialize: function initialize() {
                MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
            }, unload: function unload() {
                    MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                }
        }), GamesInlineDetailsWindowsMarketplaceDemo: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.BaseInlineDetails, "Components/InlineDetails/GamesInlineDetailsDemo.html#gamesInlineDetailsWindowsDemoTemplate", function GamesInlineDetailsWindowsMarketplaceDemo(element, options){}, {
                initialize: function initialize() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
                }, unload: function unload() {
                        MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                    }
            }), GamesInlineDetailsXboxMarketplaceDemo: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.BaseInlineDetails, "Components/InlineDetails/GamesInlineDetailsDemo.html#gamesInlineDetailsXboxDemoTemplate", function GamesInlineDetailsXboxMarketplaceDemo(element, options){}, {
                initialize: function initialize() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
                }, unload: function unload() {
                        MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                    }
            }), GamesInlineDetailsSocialDemo: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.Pages.BaseInlineDetails, "Components/InlineDetails/GamesInlineDetailsDemo.html#gamesInlineDetailsSocialDemoTemplate", function GamesInlineDetailsSocialDemo(element, options){}, {
                initialize: function initialize() {
                    MS.Entertainment.Pages.BaseInlineDetails.prototype.initialize.apply(this, arguments)
                }, unload: function unload() {
                        MS.Entertainment.Pages.BaseMediaInlineDetails.prototype.unload.call(this)
                    }
            })
    })
})()
