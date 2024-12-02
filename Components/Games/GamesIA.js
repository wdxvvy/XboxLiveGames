/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/iaservice.js", "/Framework/serviceLocator.js", "/Monikers.js", "/ViewModels/Games/GamesHub.js", "/ViewModels/Games/GamesHubWindowsPanel.js", "/ViewModels/Games/GamesSpotlight.js");
MS.Entertainment.InformationArchitecture.addIAForAppId(Microsoft.Entertainment.Application.AppMode.games, function createGamesIA(iaService) {
    var featureEnablement = new Microsoft.Entertainment.FeatureEnablement.FeatureEnablement;
    var metroGamesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
    var xboxGamesMarketplaceEnabled = featureEnablement.isEnabled(Microsoft.Entertainment.FeatureEnablement.FeatureItem.xbox360GamesMarketplace);
    var demoMode = (new Microsoft.Entertainment.Configuration.ConfigurationManager).shell.retailExperience;
    var hiddenHub = {hub: MS.Entertainment.InformationArchitecture.Viewability.hidden};
    var hiddenPanel = {panel: MS.Entertainment.InformationArchitecture.Viewability.hidden};
    var signIn = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.signIn);
    signIn.bind("isSignedIn", function(newValue, oldValue) {
        if (!newValue && oldValue)
            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.navigation).navigateToDefaultPage()
    });
    var socialHelper = new MS.Entertainment.UI.SocialBuzz.SocialDashboardHelper;
    function createGamesSearchDataContext(viewType) {
        return {
                viewModel: new MS.Entertainment.ViewModels.GamesSearchViewModel(viewType, xboxGamesMarketplaceEnabled, metroGamesMarketplaceEnabled), minModifierItems: 0, doNotRaisePanelReady: true, hideLoadingPanel: false, hideShadow: false
            }
    }
    {};
    var gamesSearch = iaService.createNode(String.load(String.id.IDS_SEARCH_SEARCHSTARTED), MS.Entertainment.UI.Monikers.searchPage);
    gamesSearch.useStaticHubStrip = true;
    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(gamesSearch, "/Controls/GalleryPage.html");
    var gamesAllSearch = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.allGamesSearch, null, hiddenPanel);
    gamesAllSearch.useStaticHubStrip = true;
    gamesSearch.addChild(gamesAllSearch);
    var gamesAllSearchPanel = iaService.createNode(String.load(String.id.IDS_SEARCH_SEARCHSTARTED), MS.Entertainment.UI.Monikers.allGamesSearchPanel, "Components/Games/GamesPanels.html#gamesSearchTemplate", hiddenHub, null);
    gamesAllSearchPanel.getDataContext = function getGamesAllSearchDataContext() {
        var viewType = MS.Entertainment.ViewModels.GamesSearchViewModel.ViewTypes.allGames;
        var dataContext = createGamesSearchDataContext(viewType);
        return dataContext
    };
    gamesAllSearch.addChild(gamesAllSearchPanel);
    if (!demoMode) {
        var activityHub = iaService.createNode(String.load(String.id.IDS_GAMES_COLLECTION_PIVOT), MS.Entertainment.UI.Monikers.gamesCollection, null, hiddenPanel);
        MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(activityHub, "/Controls/GalleryPage.html");
        activityHub.useStaticHubStrip = true;
        activityHub.getDataContext = function gamesHubGetDataContext() {
            return new MS.Entertainment.ViewModels.GamesHub(socialHelper)
        };
        activityHub.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.GameActivityRequest;
        iaService.rootNode.addChild(activityHub);
        var activityPanel = iaService.createNode(String.load(String.id.IDS_GAMES_COLLECTION_TITLE_LC), MS.Entertainment.UI.Monikers.gamesActivityPanel, "Components/Games/Games.html#gamesHubCollectionPanelTemplate", hiddenHub);
        activityHub.addChild(activityPanel);
        var gamesCollectionHub = iaService.createNode(String.load(String.id.IDS_GAMES_COLLECTION_TITLE_LC), MS.Entertainment.UI.Monikers.gamesCollectionHub, null, hiddenPanel);
        gamesCollectionHub.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.CollectionGalleryRequest;
        function gamesCollectionDataContext(view) {
            return {
                    viewModel: new MS.Entertainment.ViewModels.GamesCollection(view), doNotRaisePanelReady: true, primaryModifier: {
                            items: [], selectedItem: null
                        }
                }
        }
        gamesCollectionHub.getDataContext = function getCollectionAllContext() {
            return gamesCollectionDataContext()
        };
        activityHub.addChild(gamesCollectionHub);
        gamesCollectionHub.addChild(iaService.createNode("", MS.Entertainment.UI.Monikers.gamesCollectionAllPanel, "Components/Games/GamesPanels.html#gamesCollectionAllTemplate"))
    }
    if (metroGamesMarketplaceEnabled || xboxGamesMarketplaceEnabled)
        if (!demoMode) {
            var home = iaService.createNode(String.load(String.id.IDS_HOME_PIVOT), MS.Entertainment.UI.Monikers.homeHub);
            home.getDataContext = function homeGetDataContext() {
                return new MS.Entertainment.ViewModels.GamesSpotlight(socialHelper)
            };
            var spotlightPanel = iaService.createNode(String.load(String.id.IDS_GAMES_SPOTLIGHT), MS.Entertainment.UI.Monikers.homeSpotlight, "Components/Games/Games.html#gamesSpotlightHubPanelTemplate");
            iaService.rootNode.addChild(home);
            iaService.rootNode.defaultChild = home;
            home.addChild(spotlightPanel)
        }
    function gamesMarketplaceGetDataContext(view) {
        return {
                viewModel: new MS.Entertainment.ViewModels.GamesMarketplace(view), doNotRaisePanelReady: true, primaryModifier: {
                        items: [], selectedItem: null
                    }, secondaryModifier: {
                        items: [], selectedItem: null
                    }
            }
    }
    var marketplaceHub = iaService.createNode(String.load(String.id.IDS_MARKETPLACE_PIVOT), MS.Entertainment.UI.Monikers.gamesMarketplace);
    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(marketplaceHub, "/Controls/GalleryPage.html");
    marketplaceHub.useStaticHubStrip = true;
    iaService.rootNode.addChild(marketplaceHub);
    if (metroGamesMarketplaceEnabled)
        if (!demoMode) {
            var windowsMarketplaceHub = iaService.createNode(String.load(String.id.IDS_GAMES_WINDOWS_TITLE_LC), MS.Entertainment.UI.Monikers.gamesWindowsMarketplace, null, null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
            windowsMarketplaceHub.perfTrackStartPoint = MS.Entertainment.Instrumentation.PerfTrack.StartPoints.MetroGamesGalleryRequest;
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(windowsMarketplaceHub, "/Controls/GalleryPage.html");
            windowsMarketplaceHub.useStaticHubStrip = true;
            marketplaceHub.addChild(windowsMarketplaceHub);
            var windowsPanel = iaService.createNode(String.load(String.id.IDS_GAMES_WINDOWS_TITLE_LC), MS.Entertainment.UI.Monikers.gamesWindowsPanel, "Components/Games/Games.html#gamesHubWindowsPanelTemplate", hiddenHub, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
            windowsPanel.getDataContext = function windowsPanelGetDataContext() {
                return new MS.Entertainment.ViewModels.GamesHubWindowsPanel(socialHelper)
            };
            windowsMarketplaceHub.addChild(windowsPanel);
            var windowsMarketplaceFeaturedHub = iaService.createNode(String.load(String.id.IDS_GAMES_WINDOWS_NEW_PIVOT), MS.Entertainment.UI.Monikers.gamesWindowsMarketplaceNewReleases, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
            windowsMarketplaceFeaturedHub.getDataContext = function getWindowsGamesContext() {
                return gamesMarketplaceGetDataContext("windowsnewrelease")
            };
            windowsMarketplaceHub.addChild(windowsMarketplaceFeaturedHub);
            windowsMarketplaceFeaturedHub.addChild(iaService.createNode("", MS.Entertainment.UI.Monikers.gamesWindowsMarketplaceNewReleasesPanel, "Components/Games/GamesPanels.html#gamesWindowsMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace));
            var windowsMarketplaceFeaturedHub = iaService.createNode(String.load(String.id.IDS_GAMES_WINDOWS_GENRES_PIVOT), MS.Entertainment.UI.Monikers.gamesWindowsMarketplaceGenre, null, hiddenPanel, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
            windowsMarketplaceFeaturedHub.getDataContext = function getWindowsGamesContext() {
                return gamesMarketplaceGetDataContext("windowsbygenre")
            };
            windowsMarketplaceHub.addChild(windowsMarketplaceFeaturedHub);
            windowsMarketplaceFeaturedHub.addChild(iaService.createNode("", MS.Entertainment.UI.Monikers.gamesWindowsMarketplaceGenrePanel, "Components/Games/GamesPanels.html#gamesWindowsMarketplaceTemplate", null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace))
        }
        else {
            var windowsMarketplaceHubDemo = iaService.createNode(String.load(String.id.IDS_GAMES_WINDOWS_TITLE_LC), MS.Entertainment.UI.Monikers.gamesWindowsMarketplace, null, null, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
            MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(windowsMarketplaceHubDemo, "/Controls/GalleryPage.html");
            windowsMarketplaceHubDemo.useStaticHubStrip = true;
            marketplaceHub.addChild(windowsMarketplaceHubDemo);
            var windowsPanelDemo = iaService.createNode(String.load(String.id.IDS_GAMES_WINDOWS_TITLE_LC), MS.Entertainment.UI.Monikers.gamesWindowsPanel, "Components/Games/GamesWindowsGamesDemo.html#gamesWindowsGamesDemoTemplate", hiddenHub, null, Microsoft.Entertainment.FeatureEnablement.FeatureItem.metroGamesMarketplace);
            windowsMarketplaceHubDemo.addChild(windowsPanelDemo)
        }
    var gameMarketplaceFlexHubPage = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.flexHubPage);
    gameMarketplaceFlexHubPage.useStaticHubStrip = true;
    MS.Entertainment.InformationArchitecture.Node.overridePageFragmentUrl(gameMarketplaceFlexHubPage, "/Controls/GalleryPage.html");
    var gameMarketplaceFlexHub = iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.flexHub, null, hiddenPanel, null);
    gameMarketplaceFlexHub.getDataContext = function getFlexHubContext() {
        return gamesMarketplaceGetDataContext("flexHub")
    };
    gameMarketplaceFlexHubPage.addChild(gameMarketplaceFlexHub);
    gameMarketplaceFlexHub.addChild(iaService.createNode(String.empty, MS.Entertainment.UI.Monikers.flexHubPanel, "Components/Games/GamesPanels.html#flexHubMarketplaceTemplate", null, null))
})
