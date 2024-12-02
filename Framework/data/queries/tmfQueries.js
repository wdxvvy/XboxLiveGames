/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/data/query.js", "/Framework/data/Augmenters/tmfAugmenters.js");
(function() {
    var MSE = WinJS.Namespace.define("MS.Entertainment", null);
    WinJS.Namespace.defineWithParent(MSE.Data, "Query", {canvasQuery: MSE.derive(MSE.Data.ServiceWrapperQuery, null, {
            resultAugmentation: MSE.Data.Augmenter.Tmf.ActivityData, getResourceEndpoint: function() {
                    return "http://reachstorage.blob.core.windows.net/xsg/"
                }, createResourceURI: function createResourceURI() {
                    return this.getResourceEndpoint() + "/Activities.xml"
                }, pluralizers: ["ActivityData/ItemActivities", "Activity", ]
        })})
})()
