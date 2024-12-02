/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Framework/iaservice.js", "/Framework/serviceLocator.js", "/Monikers.js");
(function() {
    var ia = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.informationArchitecture);
    var Viewability = MS.Entertainment.InformationArchitecture.Viewability;
    var immersiveDetails = ia.createNode("", MS.Entertainment.UI.Monikers.immersiveDetails, null, {hub: Viewability.hidden}, false);
    immersiveDetails.getPage = (function() {
        var oldGetPage = immersiveDetails.getPage;
        return function customImmersiveDetailsGetPage() {
                var page = oldGetPage.call(this);
                page.overrideFragmentUrl = "Components/Immersive/ImmersiveNavStub.html";
                return page
            }
    })();
    Object.defineProperty(immersiveDetails, "showNotifications", {get: function() {
            return false
        }});
    ia.rootNode.addChild(immersiveDetails)
})()
