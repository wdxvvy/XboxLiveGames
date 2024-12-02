/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/query.js", "/Framework/data/Augmenters/spotlightAugmenters.js");
(function() {
    var MSE = WinJS.Namespace.define("MS.Entertainment", null);
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {SpotlightQueryType: {
            PCGames: "Featured-PCGames", SpotlightGames: "Spotlight-Games", SpotlightMusic: "Spotlight-Music", SpotlightVideo: "Spotlight-Video"
        }});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {spotlightContentQuery: MSE.derive(MSE.Data.ServiceWrapperQuery, null, {
            spotlight: "", getResourceEndpoint: function() {
                    return MS.Entertainment.Endpoint.load(MS.Entertainment.Endpoint.id.seid_WinPhoneXboxDotCom)
                }, createHeaders: function createHeaders() {
                    var architectureStringMap = {
                            0: "x86", 5: "arm", 9: "x64"
                        };
                    var currentPackage = Windows.ApplicationModel.Package.current;
                    var architecture = currentPackage.id.architecture;
                    var mappedArchitecture = architectureStringMap[architecture];
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (configurationManager.service.targetedProgrammingArchitecture)
                        mappedArchitecture = configurationManager.service.targetedProgrammingArchitecture;
                    return {
                            "X-Membership-Level": configurationManager.service.lastSignedInUserMembership, "X-Parent-Control": configurationManager.service.lastSignedInUserParentControl.toString(), "X-Music-Subscription": configurationManager.service.lastSignedInUserSubscription.toString(), "X-Client-Version": configurationManager.service.targetedProgrammingClientVersion, "X-Client-Architecture": mappedArchitecture
                        }
                }, createParameters: function createParameters() {
                    var configurationManager = new Microsoft.Entertainment.Configuration.ConfigurationManager;
                    if (configurationManager.service.enableTimeTravel)
                        return {StartDate: configurationManager.service.timeTravelStartDate};
                    else
                        return null
                }, getSpotlightFeedVersionSubPath: function getSpotlightFeedVersionSubPath() {
                    return String.empty
                }, createResourceURI: function() {
                    return this.getResourceEndpoint() + this.getSpotlightFeedVersionSubPath() + this.spotlight
                }, pluralizers: ["Content/SlotGroup", "SlotGroup/Slot"], resultAugmentation: MSE.Data.Augmenter.Spotlight.SpotlightContent
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {gamesContentQuery: MSE.derive(MSE.Data.Query.spotlightContentQuery, null, {getSpotlightFeedVersionSubPath: function getSpotlightFeedVersionSubPath() {
                return Microsoft.Entertainment.Configuration.ConfigurationManager().service.gamesAppSpotlightVersion
            }})});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {gamesSpotlightQuery: MSE.derive(MSE.Data.Query.gamesContentQuery, null, {
            spotlight: MSE.Data.Query.SpotlightQueryType.SpotlightGames, queryId: MS.Entertainment.UI.Monikers.homeSpotlight, resultAugmentation: MSE.Data.Augmenter.Spotlight.GameSpotlightContent
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {pcGamesSpotlightQuery: MSE.derive(MSE.Data.Query.gamesContentQuery, null, {
            spotlight: MSE.Data.Query.SpotlightQueryType.PCGames, queryId: MS.Entertainment.UI.Monikers.gamesWindowsPanel, resultAugmentation: MSE.Data.Augmenter.Spotlight.FeaturedPCSpotlightContent
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {gamesFlexHubQuery: MSE.derive(MSE.Data.Query.gamesContentQuery, null, {
            spotlight: String.empty, queryId: MS.Entertainment.UI.Monikers.flexHub, resultAugmentation: MSE.Data.Augmenter.Spotlight.SpotlightContent
        })});
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {GamesUpdatePanel: MS.Entertainment.derive(MS.Entertainment.Data.ServiceWrapperQuery, null, {
            chunked: false, resultAugmentation: MS.Entertainment.Data.Augmenter.Marketplace.IntroPanelResult, createResourceURI: function() {
                    return MS.Entertainment.Utilities.UriFactory.create(MS.Entertainment.Endpoint.id.seid_WinPhoneXboxDotCom, "x8/feeds/1.1/Upgrade-Games")
                }, pluralizers: ["BodyText/p"]
        })})
})()
