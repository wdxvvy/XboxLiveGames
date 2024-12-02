/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Controls/TransportControls/TransportControls.js", "/Framework/corefx.js");
WinJS.Namespace.define("MS.Entertainment.UI.Controls", {NowPlayingTransportControls: MS.Entertainment.UI.Framework.deriveUserControl(MS.Entertainment.UI.Controls.TransportControls, "Controls/NowPlaying/NowPlayingTransportControls.html#transportControlsTemplate", function nowPlayingTransportControls() {
        this._isNowPlayingControls = true
    })})
