/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.Platform.Playback");
(function() {
    "use strict";
    var MSEPlatform = WinJS.Namespace.define("MS.Entertainment.Platform", null);
    WinJS.Namespace.defineWithParent(MSEPlatform, "Playback", {
        TransportState: {
            unInitialize: "unInitialize", playing: "playing", paused: "paused", stopped: "stopped", starting: "starting", buffering: "buffering"
        }, ProtectionState: {
                unknown: "unknown", drmProtected: "drmProtected", unprotected: "unprotected"
            }, PlayerState: {
                ready: "ready", notReady: "notReady", error: "error"
            }, PlayerMode: {
                local: "local", remote: "remote"
            }, UsageContext: {
                user: "User", automatic: "Automatic"
            }
    })
})()
