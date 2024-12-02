/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/serviceLocator.js", "/Framework/stringids.js", "/Framework/utilities.js", "/Framework/data/queries/modelQueries.js");
WinJS.Namespace.define("MS.Entertainment.ViewModels", {GamesHub: WinJS.Class.define(function gamesHubConstructor(socialHelper)
    {
        MS.Entertainment.ViewModels.assert(socialHelper, "GamesHub requires socialHelper");
        this.socialHelper = socialHelper;
        var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
        var browseAction = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.signInRequiredNavigate);
        browseAction.primaryStringId = String.id.IDS_BROWSE_ACTION_TITLE;
        browseAction.parameter = {
            page: "gamesCollection", hub: "gamesCollectionHub"
        };
        browseAction.disableWhenOffline = true;
        browseAction.disableOnServicesDisabled = true;
        this.panelAction = {action: browseAction};
        this.emptyLibraryModel = new MS.Entertainment.UI.Controls.DefaultFailedPanelModel;
        this.emptyLibraryModel.disableWhenOffline = true;
        this.emptyLibraryModel.disableOnServicesDisabled = true;
        this.emptyLibraryModel.primaryStringId = String.id.IDS_GAMES_COLLECTION_EMPTY_TITLE;
        this.emptyLibraryModel.secondaryStringId = String.id.IDS_GAMES_COLLECTION_EMPTY_DESC;
        this.emptyLibraryModel.details = this._getEmptyCollectionDetails()
    }, {
        panelAction: null, socialHelper: null, emptyLibraryModel: null, doNotRaisePanelReady: true, _getEmptyCollectionDetails: function _getEmptyCollectionDetails() {
                var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
                if (featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace)) {
                    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
                    var navigateToGamesMarketplace = actionService.getAction(MS.Entertainment.UI.Actions.ActionIdentifiers.navigate);
                    navigateToGamesMarketplace.parameter = MS.Entertainment.UI.Monikers.gamesWindowsMarketplace;
                    navigateToGamesMarketplace.disableOnServicesDisabled = true;
                    navigateToGamesMarketplace.automationId = MS.Entertainment.UI.AutomationIds.gamesHubGamesWindowsMarketplace;
                    var details = [{
                                stringId: null, linkStringId: String.id.IDS_GAMES_COLLECTION_EMPTY_LINK, linkAction: navigateToGamesMarketplace, linkIcon: WinJS.UI.AppBarIcon.shop
                            }]
                }
                return details
            }
    }, {})})
