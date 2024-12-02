/* Copyright (C) Microsoft Corporation. All rights reserved. */
scriptValidator();
WinJS.Namespace.define("MS.Entertainment.Platform.Playback", {Etw: WinJS.Class.define(null, {}, {
        _getEtwProvider: (function PlaybackEtw_getEtwProvider() {
            var playbackEtwProvider;
            return function _getEtwProvider() {
                    if (!playbackEtwProvider)
                        playbackEtwProvider = new Microsoft.Entertainment.Instrumentation.Providers.Pipeline;
                    return playbackEtwProvider
                }
        })(), traceString: function PlaybackEtw_traceString(s) {
                this._getEtwProvider().tracePlayback_WPP(s)
            }, tracePlayerStateChanged: function PlaybackEtw_tracePlayerStateChanged(newState, oldState) {
                this._getEtwProvider().tracePlayback_PlayerStateChanged(newState, oldState)
            }, traceTargetTransportStateSet: function PlaybackEtw_traceTargetTransportStateSet(wannaBeState, currentState) {
                this._getEtwProvider().tracePlayback_TargetTransportStateSet(wannaBeState, currentState)
            }, traceTransportStateChanged: function PlaybackEtw_traceTransportStateChanged(newState, oldState, isVideo) {
                this._getEtwProvider().tracePlayback_TransportStateChanged(newState, oldState);
                if (newState !== oldState)
                    if (newState === MS.Entertainment.Platform.Playback.TransportState.playing)
                        if (isVideo)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).videoPlaybackStart();
                        else
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).musicPlaybackStart();
                    else if (newState === MS.Entertainment.Platform.Playback.TransportState.paused || newState === MS.Entertainment.Platform.Playback.TransportState.stopped)
                        if (isVideo)
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).videoPlaybackStop();
                        else
                            MS.Entertainment.ServiceLocator.getService(MS.Entertainment.Services.userTimeTelemetryManager).musicPlaybackStop()
            }, traceMediaLoaded: function PlaybackEtw_traceMediaLoaded(isNext, mediaInstance, durationMsec) {
                if (mediaInstance)
                    if (isNext)
                        this._getEtwProvider().tracePlayback_NextMediaLoaded(mediaInstance.source, mediaInstance.mediaType, mediaInstance.protectionState, mediaInstance.startPosition, mediaInstance.cookie, durationMsec);
                    else {
                        this._getEtwProvider().tracePlayback_CurrentMediaLoaded(mediaInstance.source, mediaInstance.mediaType, mediaInstance.protectionState, mediaInstance.startPosition, mediaInstance.cookie, durationMsec);
                        MS.Entertainment.Utilities.Telemetry.logPlaybackHappened(mediaInstance)
                    }
            }, traceControlInitialized: function PlaybackEtw_traceControlInitialized() {
                this._getEtwProvider().tracePlayback_ControlInitialized()
            }, traceSessionInitialized: function PlaybackEtw_traceSessionInitialized() {
                this._getEtwProvider().tracePlayback_SessionInitialized()
            }, traceSetMedia: function PlaybackEtw_traceSetMedia(mediaInstance) {
                this._getEtwProvider().tracePlayback_SetMedia(mediaInstance.source, mediaInstance.mediaType, mediaInstance.protectionState, mediaInstance.startPosition, mediaInstance.cookie, 0)
            }, traceSetNextMedia: function PlaybackEtw_traceSetNextMedia(readyForNext, mediaInstance) {
                this._getEtwProvider().tracePlayback_SetNextMedia(readyForNext, mediaInstance.source, mediaInstance.mediaType, mediaInstance.protectionState, mediaInstance.startPosition, mediaInstance.cookie)
            }, traceSwitchingToNextMedia: function PlaybackEtw_traceSwitchingToNextMedia(mediaSource) {
                this._getEtwProvider().tracePlayback_SwitchingToNextMedia(mediaSource)
            }, traceNextMediaStarted: function PlaybackEtw_traceNextMediaStarted(mediaSource) {
                this._getEtwProvider().tracePlayback_NextMediaStarted(mediaSource)
            }, tracePlaybackEnableTimeUpdate: function PlaybackEtw_tracePlaybackEnableTimeUpdate(currentPosition) {
                this._getEtwProvider().tracePlayback_EnableTimeUpdate(currentPosition)
            }, tracePlaybackDisableTimeUpdate: function PlaybackEtw_tracePlaybackDisableTimeUpdate(currentPosition) {
                this._getEtwProvider().tracePlayback_DisableTimeUpdate(currentPosition)
            }, tracePlaybackForceTimeUpdate: function PlaybackEtw_tracePlaybackForceTimeUpdate(currentPosition) {
                this._getEtwProvider().tracePlayback_ForceTimeUpdate(currentPosition)
            }, tracePlaybackPBMSoundLevelChanged: function PlaybackEtw_tracePlaybackPBMSoundLevelChanged(soundLevel, currentTransportState) {
                this._getEtwProvider().tracePlayback_PBMSoundLevelChanged(soundLevel, currentTransportState)
            }, tracePlaylistSetDataSourceBegin: function PlaybackEtw_tracePlaylistSetDataSourceBegin() {
                this._getEtwProvider().tracePlaylist_SetDataSourceBegin()
            }, tracePlaylistSetDataSourceEnd: function PlaybackEtw_tracePlaylistSetDataSourceEnd() {
                this._getEtwProvider().tracePlaylist_SetDataSourceEnd()
            }, tracePlaylistInterpretingData: function PlaybackEtw_tracePlaylistInterpretingData() {
                this._getEtwProvider().tracePlaylist_InterpretingData()
            }, tracePlaylistActivate: function PlaybackEtw_tracePlaylistActivate(index, startPosition, isShuffle, isRepeat) {
                this._getEtwProvider().tracePlaylist_Activate(index, startPosition, isShuffle, isRepeat)
            }, tracePlaylistSetMedia: function PlaybackEtw_tracePlaylistSetMedia(mediaInstance) {
                this._getEtwProvider().tracePlaylist_SetMedia(mediaInstance.source, mediaInstance.mediaType, mediaInstance.protectionState, mediaInstance.startPosition, mediaInstance.cookie)
            }, tracePlaylistSetNextMedia: function PlaybackEtw_tracePlaylistSetNextMedia(mediaInstance) {
                this._getEtwProvider().tracePlaylist_SetNextMedia(mediaInstance.source, mediaInstance.mediaType, mediaInstance.protectionState, mediaInstance.startPosition, mediaInstance.cookie)
            }, tracePlaybackError: function PlaybackEtw_tracePlaybackError(errorCode, extendedCode, context) {
                this._getEtwProvider().tracePlayback_ErrorOccurred(errorCode, extendedCode || 0, context || "")
            }, tracePlaylogBookmarkLoad: function PlaybackEtw_tracePlaylogBookmarkLoad(bookmark, playFromBookmark) {
                this._getEtwProvider().tracePlaylog_BookmarkLoad(bookmark, playFromBookmark)
            }, tracePlaylogBookmarkSave: function PlaybackEtw_tracePlaylogBookmarkSave(bookmark) {
                this._getEtwProvider().tracePlaylog_BookmarkSave(bookmark)
            }, tracePlaylogPlayCountLoad: function PlaybackEtw_tracePlaylogPlayCountLoad(count) {
                this._getEtwProvider().tracePlaylog_PlayCountLoad(count)
            }, tracePlaylogPlayCountSave: function PlaybackEtw_tracePlaylogPlayCountSave(count) {
                this._getEtwProvider().tracePlaylog_PlayCountSave(count)
            }, tracePlaylogPlayedLoad: function PlaybackEtw_tracePlaylogPlayedLoad(played) {
                this._getEtwProvider().tracePlaylog_PlayedLoad(played)
            }, tracePlaylogPlayedSave: function PlaybackEtw_tracePlaylogPlayedSave(played) {
                this._getEtwProvider().tracePlaylog_PlayedSave(played)
            }, traceDRMRootLicenseRefreshAccount: function PlaybackEtw_traceDRMRootLicenseRefreshAccount(subscription, tunerActivated) {
                this._getEtwProvider().traceDRM_RootLicenseRefresh_Account(subscription, tunerActivated)
            }, traceDRMRootLicenseRefreshDetails: function PlaybackEtw_traceDRMRootLicenseRefreshDetails(now, lastRefresh, spanMs) {
                this._getEtwProvider().traceDRM_RootLicenseRefresh_Details(now, lastRefresh, spanMs)
            }, traceDRMRootLicenseRefreshInvoked: function PlaybackEtw_traceDRMRootLicenseRefreshInvoked() {
                this._getEtwProvider().traceDRM_RootLicenseRefresh_Invoked()
            }, traceDRMRootLicenseRefreshCompleted: function PlaybackEtw_traceDRMRootLicenseRefreshCompleted(status) {
                this._getEtwProvider().traceDRM_RootLicenseRefresh_Completed(status)
            }, traceDRMReportMeteringAccount: function PlaybackEtw_traceDRMReportMeteringAccount(subscription, tunerActivated, meteringCertificate) {
                this._getEtwProvider().traceDRM_ReportMetering_Account(subscription, tunerActivated, meteringCertificate)
            }, traceDRMReportMeteringInvoked: function PlaybackEtw_traceDRMReportMeteringInvoked() {
                this._getEtwProvider().traceDRM_ReportMetering_Invoked()
            }, traceDRMReportMeteringCompleted: function PlaybackEtw_traceDRMReportMeteringCompleted(status) {
                this._getEtwProvider().traceDRM_ReportMetering_Completed(status)
            }, traceCCRendererGetTTMLFilepath: function PlaybackEtw_traceCCRendererGetTTMLFilepath(state, smid, miid, lcid, filePath) {
                this._getEtwProvider().traceClosedCaptions_RendererGetTTMLFilepath(state, smid ? smid : String.empty, miid ? miid : String.empty, lcid, filePath ? filePath : String.empty)
            }, traceCCRendererLoadTTMLFile: function PlaybackEtw_traceCCRendererLoadTTMLFile(state, filePath) {
                this._getEtwProvider().traceClosedCaptions_RendererLoadTTMLFile(state, filePath ? filePath : String.empty)
            }, traceCCEnterRenderingLoop: function PlaybackEtw_traceCCEnterRenderingLoop(currentPosition, transportState) {
                this._getEtwProvider().traceClosedCaptions_EnterRenderingLoop(currentPosition ? currentPosition : 0, transportState ? transportState : String.empty)
            }, traceCCExitRenderingLoop: function PlaybackEtw_traceCCExitRenderingLoop(currentPosition, transportState, ccOn) {
                this._getEtwProvider().traceClosedCaptions_ExitRenderingLoop(currentPosition ? currentPosition : 0, transportState ? transportState : String.empty, ccOn)
            }, traceClosedCaptionsOn: function PlaybackEtw_traceClosedCaptionsOn(enable) {
                this._getEtwProvider().traceClosedCaptions_On(enable)
            }, traceCCDroppedFrame: function PlaybackEtw_traceCCDroppedFrame(generatedAt, validUntil, currentPosition) {
                this._getEtwProvider().traceClosedCaptions_DroppedFrame(generatedAt ? generatedAt : 0, validUntil ? validUntil : 0, currentPosition ? currentPosition : 0)
            }
    })})
