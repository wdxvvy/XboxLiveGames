/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator("/Components/PerfTrack/PerfTrack.js", "/Framework/debug.js", "/Framework/serviceLocator.js", "/Framework/telemetryUtilities.js");
(function(undefined) {
    MS.Entertainment.UI.Debug.defineAssert("MS.Entertainment.UI.Actions");
    WinJS.Namespace.define("MS.Entertainment.UI.Actions", {ShowImmersiveDetails: MS.Entertainment.derive(MS.Entertainment.UI.Actions.Action, function showImmersiveDetails() {
            this.base()
        }, {
            automationId: MS.Entertainment.UI.AutomationIds.showImmersiveDetails, executed: function executed(param) {
                    MS.Entertainment.Instrumentation.PerfTrack.setStartTime(MS.Entertainment.Instrumentation.PerfTrack.StartPoints.PlayCommand);
                    var listOrMediaItem = this._extractMediaItem(param);
                    var showDetails = (param) ? param.showDetails : undefined;
                    var sessionId = (param && param.sessionId) ? param.sessionId : MS.Entertainment.Platform.Playback.WellKnownPlaybackSessionId.nowPlaying;
                    var autoPlay = (param) ? param.autoPlay : undefined;
                    var hub = (param) ? param.hub : undefined;
                    var options = (param) ? param.options : {};
                    var startFullScreen = (param) ? param.startFullScreen : false;
                    var appView = Windows.UI.ViewManagement.ApplicationView;
                    var uiStateService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.uiState);
                    if (uiStateService.isSnapped && !appView.tryUnsnap())
                        return;
                    MS.Entertainment.Data.List.getData(listOrMediaItem, 0).then(function showImmersiveDetails(mediaItem) {
                        if (param && param.playPreviewOnly)
                            mediaItem.playPreviewOnly = true;
                        else if ("playPreviewOnly" in mediaItem)
                            mediaItem.playPreviewOnly = false;
                        if (param && param.hydrateMediaItem)
                            mediaItem = MS.Entertainment.ViewModels.MediaItemModel.augment(mediaItem);
                        if (autoPlay && (mediaItem.mediaType === Microsoft.Entertainment.Queries.ObjectType.game || !mediaItem.inCollection))
                            MS.Entertainment.Utilities.Telemetry.logPlayPreview(mediaItem, false);
                        if (MS.Entertainment.Utilities.Telemetry.isCurrentPageSearchPage()) {
                            var destination = "Details";
                            if (autoPlay)
                                destination = mediaItem.inCollection ? "Play" : "PlayPreview";
                            MS.Entertainment.Utilities.Telemetry.logSearchExit(mediaItem, false, destination)
                        }
                        if (param.showNowPlaying)
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersive(null, {
                                sessionId: sessionId, startFullScreen: startFullScreen
                            });
                        else
                            MS.Entertainment.Platform.PlaybackHelpers.showImmersiveDetails(mediaItem, showDetails, autoPlay, hub, options)
                    }.bind(this))
                }, canExecute: function canExecute(param) {
                    return true
                }, _extractMediaItem: function _extractMediaItem(param) {
                    var mediaItem;
                    if (param && "mediaItem" in param)
                        mediaItem = param.mediaItem;
                    else if (param)
                        mediaItem = param;
                    else {
                        var sessionMgr = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.sessionManager);
                        if (sessionMgr && sessionMgr.nowPlayingSession && sessionMgr.primarySession.currentMedia)
                            mediaItem = sessionMgr.nowPlayingSession.currentMedia
                    }
                    return mediaItem
                }
        })});
    var actionService = MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.actions);
    actionService.register(MS.Entertainment.UI.Actions.ActionIdentifiers.showImmersiveDetails, function() {
        return new MS.Entertainment.UI.Actions.ShowImmersiveDetails
    })
})()
