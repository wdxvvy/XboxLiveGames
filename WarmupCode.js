/* Copyright (C) Microsoft Corporation. All rights reserved. */
(function() {
    "use strict";
    try {
        var roamingSettings = Windows.Storage.ApplicationData.current.roamingSettings;
        var microsoftEntertainmentApplication = Microsoft.Entertainment.Application;
        var microsoftEntertainmentConfigurationConfigurationManager = Microsoft.Entertainment.Configuration.ConfigurationManager;
        var microsoftEntertainmentInstrumentationProvidersPipeline = Microsoft.Entertainment.Instrumentation.Providers.Shell
    }
    catch(e) {
        var shipAssertProvider = new Microsoft.Entertainment.Infrastructure.ShipAssertProvider;
        shipAssertProvider.shipAssert("WarmupCode", "WarmupCode()", "WarmupCode()", "Message: " + e.toString() + e.stack, "")
    }
})()
