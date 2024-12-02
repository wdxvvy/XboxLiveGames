/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/Playback/playbackhelpers.js", "/ViewModels/Home/SpotlightViewModel.js", "/ViewModels/Games/GamesEngageViewModel.js");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesSpotlight: WinJS.Class.define(function gamesSpotlightConstructor(socialHelper)
    {
        this.viewModel = new MS.Entertainment.ViewModels.GamesEngageViewModel(new MS.Entertainment.Data.Query.gamesSpotlightQuery, socialHelper);
        this.viewModel.maxItems = 5;
        var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
        if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace) || featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesMarketplace)) {
            this.viewModel.getItems();
            this.viewModel.isFeatureEnabled = true
        }
    }, {
        viewModel: null, doNotRaisePanelReady: true, features: null, panelAction: {}
    })})
