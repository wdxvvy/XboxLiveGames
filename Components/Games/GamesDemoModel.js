/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function(undefined) {
    WinJS.Namespace.define("MS.Entertainment.Games.GamesDemo", {
        gamesSpotlightClicked: function gamesSpotlightClicked() {
            MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver({itemConstructor: "MS.Entertainment.Pages.GamesInlineDetailsSpotlightDemo"})
        }, gamesWindowsGamesClicked: function gamesWindowsGamesClicked() {
                MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver({itemConstructor: "MS.Entertainment.Pages.GamesInlineDetailsWindowsMarketplaceDemo"})
            }, gamesXboxGamesClicked: function gamesXboxGamesClicked() {
                MS.Entertainment.UI.Controls.PopOver.showNonMediaPopOver({itemConstructor: "MS.Entertainment.Pages.GamesInlineDetailsXboxMarketplaceDemo"})
            }
    })
})()
